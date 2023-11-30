import { BN } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import type { Cell } from "tonweb/dist/types/boc/cell";
import { Cell as CellF } from "ton";
import { Chain } from "../../consts";
import { EvNotifier } from "../../services/notifier";
import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  BalanceCheck,
  GetExtraFees,
  WhitelistCheck,
  GetClaimData,
  LockNFT,
  GetTokenInfo,
  DepTrxData,
  TokenInfo,
} from "../chain";

import { ChainNonce, PreTransfer, ClaimV3NFT } from "../..";

import { BridgeContract } from "./ton-bridge";

import { Emitter } from "../../services/emitter";

import { TonhubConnector, TonhubTransactionResponse } from "ton-x";
import { fromUint8Array } from "js-base64";
import axios from "ton/node_modules/axios";

import { NftListUtils } from "../../services/nftList";
import { ScVerifyUtils } from "../../services/scVerify";

import base64url from "base64url";

import { TonClient, Address, beginCell, Dictionary } from "newton";

import {
  ClaimData,
  storeClaimData,
  SignerAndSignature,
  storeClaimNFT721,
  NftItem,
  NftCollection,
} from "./v3types";

import { CHAIN_INFO } from "../../consts";

export type TonSigner = {
  wallet?: TonWallet;
  accIdx: number;
};

export type TonWalletProvider = {
  isTonWallet: boolean;
  send(method: string, params?: any[]): Promise<any>;
  onSuccess?(): Promise<any>;
  on(eventName: string, handler: (...data: any[]) => any): void;
};

export type TonArgs = {
  wallet: TonhubConnector & TonWalletProvider & Function;
  config: {
    seed?: string;
    appPublicKey?: string;
    address?: string;
    [x: string]: any;
  };
};

export type TonNft = {
  nftItemAddr: string;
};

export type TonHelper = ChainNonceGet &
  BalanceCheck &
  PreTransfer<any, any, any, undefined> &
  TransferNftForeign<TonSigner, TonNft, string> &
  UnfreezeForeignNft<TonSigner, TonNft, string> &
  EstimateTxFees<TonNft> &
  ValidateAddress & { XpNft: string } & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
    tonHubWrapper: (args: TonArgs) => TonSigner;
    tonWalletWrapper: (args: TonArgs) => TonSigner;
    tonKeeperWrapper: (args: TonArgs) => TonSigner;
  } & GetFeeMargins &
  WhitelistCheck<TonNft> &
  GetExtraFees &
  NftListUtils &
  ScVerifyUtils &
  ClaimV3NFT<TonSigner, string> &
  GetTokenInfo &
  GetClaimData &
  LockNFT<TonSigner, TonNft, string>;

export type TonParams = {
  tonweb: TonWeb;
  notifier: EvNotifier;
  nonce: ChainNonce;
  bridgeAddr: string;
  proxy: string;
  burnerAddr: string;
  xpnftAddr: string;
  feeMargin: FeeMargins;
  extraFees: Map<ChainNonce, string>;
  v3_bridge: string;
};

type MethodMap = {
  ton_requestAccounts: [undefined, string];
  ton_sendTransaction: [{ value: string; to: string; data: Cell }, unknown];
  ton_getBalance: [undefined, string];
};

type ResponseUnionType = boolean &
  TonhubTransactionResponse & {
    hash: string;
  };

type TonWallet = {
  send<M extends keyof MethodMap>(
    method: M,
    params: MethodMap[M][0]
  ): Promise<MethodMap[M][1]>;
  onSuccess?(): Function;
  handleResponse(res: ResponseUnionType): Promise<string>;
};

let wl_prom: Promise<string[]> | undefined;

export async function tonHelper(args: TonParams): Promise<TonHelper> {
  const bridge = new BridgeContract(args.tonweb.provider, {
    address: args.bridgeAddr,
    burner: args.burnerAddr,
  });
  bridge.init();

  const ton = args.tonweb as TonWeb & TonWallet;
  ton.provider.sendBoc = (b) =>
    ton.provider.send("sendBocReturnHash", { boc: b });

  async function waitTonTrx(
    exBodyMsg: string,
    value: string,
    address: string,
    msgType: "in_msg" | "out_msgs"
  ) {
    console.log(exBodyMsg, "TON:exBodyMsg");

    let body: string = "";
    let stop = false;
    let fastResolve: any;
    const setStop = () => {
      stop = true;
      Emitter?.removeEventListener("cancel tonKeeper", setStop);
      fastResolve(true);
      throw new Error("User has declined transaction");
    };
    const noTrx = setTimeout(() => {
      stop = true;
      throw new Error("waitTonTrx timeout");
    }, 60 * 1000 * 20);

    Emitter?.addEventListener("cancel tonKeeper", setStop);

    await new Promise((r) => {
      setTimeout(r, 10 * 1000);
    });

    async function getUserTrxs(address: string): Promise<any> {
      try {
        await new Promise((r) => {
          setTimeout(r, 30 * 1000);
        });
        const trxs = await ton.provider.getTransactions(address, 20);
        return trxs;
      } catch (e) {
        console.log(e, "new iterration 30 sec");
        return await getUserTrxs(address);
      }
    }

    while (!body) {
      console.log("TON:tring to find the trx...");

      if (stop) return;
      //get last 20 trx of address
      const timeout = setTimeout(() => {
        throw new Error("TON: timeout when trying to send trx");
      }, 60 * 1000 * 10);
      const trxs = await getUserTrxs(address);
      if (trxs) {
        clearTimeout(timeout);
      }

      //find body of the trx
      body = trxs.find((trx: any) => {
        const messages = trx[msgType];
        let message: string = "";
        let msgVal: string = "";

        message = Array.isArray(messages)
          ? messages?.at(0)?.msg_data?.body
          : messages?.msg_data?.body;
        msgVal = Array.isArray(trx["out_msgs"])
          ? trx.out_msgs?.at(0)?.value
          : trx["out_msgs"].value;

        trx.utime * 1000 >= +new Date(Date.now() - 1000 * 60 * 5) &&
          console.log(trx.utime, "trx happend no more than 5 minutes ago");

        return message === exBodyMsg && msgVal === value;
      })?.data;
    }

    clearTimeout(noTrx);

    const dict = CellF.fromBoc(Buffer.from(body, "base64"))[0].hash();

    const exHash = dict.toString("base64");
    console.log(exHash, "exHash");

    let trxData: any = undefined;

    while (trxData === undefined) {
      await new Promise((r) => setTimeout(r, 6 * 1000));
      const res = await axios(
        `https://toncenter.com/api/index/getTransactionByHash?tx_hash=${encodeURIComponent(
          exHash
        )}&include_msg_body=true`
      ).catch(() => undefined);

      trxData = res?.data;
    }

    return trxData[0]["in_msg"].hash;
  }

  return {
    preTransfer: () => Promise.resolve(true),
    preUnfreeze: () => Promise.resolve(true),
    getNonce: () => Chain.TON,
    getExtraFees: (toNonce: ChainNonce) => {
      const extra = args.extraFees.get(toNonce) || "0";
      return new BigNumber(TonWeb.utils.toNano(extra).toString(10));
    },
    XpNft: args.xpnftAddr,
    async balance(address: string) {
      return new BigNumber(await ton.getBalance(address));
    },
    async estimateValidateTransferNft() {
      return new BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft() {
      return new BigNumber(0); // TODO
    },
    async validateAddress(adr) {
      return TonWeb.Address.isValid(adr);
    },
    getFeeMargin() {
      return args.feeMargin;
    },
    async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
      const rSigner = signer.wallet || ton;

      const txFeesFull = new BN(txFees.toString(10)).add(
        TonWeb.utils.toNano((Math.random() * 0.01).toFixed(7))
      );

      const nftFee = TonWeb.utils.toNano("0.07");

      const payload = await bridge.createFreezeBody({
        amount: txFeesFull.sub(nftFee),
        to: Buffer.from(to),
        chainNonce,
        mintWith: Buffer.from(mintWith),
      });

      console.log(txFeesFull.toString(10), "val");

      console.log("TON:transferNftToForeign");
      console.log(nft.native.nftItemAddr);
      const res = (await rSigner.send("ton_sendTransaction", {
        value: txFeesFull.toString(10),
        to: nft.native.nftItemAddr,
        data: payload,
      })) as ResponseUnionType;

      const hash = await rSigner.handleResponse(res);

      await args.notifier.notifyTon(hash);

      return hash;
    },
    async unfreezeWrappedNft(signer, to, nft, _txFees, chainNonce) {
      const rSigner = signer.wallet || ton;

      const value = new BN(_txFees.toString(10)).add(
        TonWeb.utils.toNano((Math.random() * 0.01).toFixed(7))
      );

      const nftFee = TonWeb.utils.toNano("0.05");

      const payload = await bridge.createWithdrawBody({
        to: new Uint8Array(Buffer.from(to)),
        chainNonce: chainNonce,
        txFees: value.sub(nftFee),
      });

      console.log(value.toString(10), "v");
      console.log(nft.native.nftItemAddr);
      console.log("TON:unfreezeWrappedNft");

      const res = (await rSigner.send("ton_sendTransaction", {
        value: new BN(value).toString(10),
        to: nft.native.nftItemAddr,
        data: payload,
      })) as ResponseUnionType;

      const hash = await rSigner.handleResponse(res);

      await args.notifier.notifyTon(hash);

      return hash;
    },
    tonKeeperWrapper(args: TonArgs) {
      console.log(args, "args");
      let payload: string = "";
      let value = "";
      const tonHub: TonWallet = {
        async send(method, params) {
          switch (method) {
            case "ton_sendTransaction":
              payload = fromUint8Array(await params!.data.toBoc(false));
              value = params!.value;
              return args.wallet.send(
                `https://app.tonkeeper.com/transfer/${
                  params!.to
                }?amount=${new BN(value).toString(10)}&bin=${encodeURIComponent(
                  payload
                )}&open=1`
              );
            //!
            default:
              return null;
          }
        },

        async handleResponse(res: boolean) {
          console.log(res);
          const result = await waitTonTrx(
            payload,
            value,
            args.config.address!,
            "out_msgs"
          );
          args.wallet.onSuccess && args.wallet.onSuccess();
          return result;
        },
      };

      return {
        wallet: tonHub,
        accIdx: 0,
      };
    },
    tonWalletWrapper(args: TonArgs) {
      let payload: string = "";
      let value = "";
      const tonHub: TonWallet = {
        async send(method, params) {
          switch (method) {
            case "ton_sendTransaction":
              value = params!.value;

              payload = fromUint8Array(await params!.data.toBoc(false));
              console.log(payload, "payload");
              return await args.wallet.send("ton_sendTransaction", [
                {
                  to: params!.to,
                  value,
                  dataType: "boc",
                  data: payload,
                },
              ]);
            default:
              return null;
          }
        },

        async handleResponse(res: boolean) {
          return (
            res &&
            (await waitTonTrx(payload, value, args.config.address!, "out_msgs"))
          );
        },
      };

      return {
        wallet: tonHub,
        accIdx: 0,
      };
    },
    tonHubWrapper(args: TonArgs) {
      let value = "";
      const tonHub: TonWallet = {
        async send(method, params) {
          switch (method) {
            case "ton_sendTransaction":
              value = new BN(params!.value).toString();
              return await args.wallet.requestTransaction({
                seed: args.config.seed!,
                appPublicKey: args.config.appPublicKey!,
                to: params!.to,
                value,
                timeout: 5 * 60 * 1000,
                text: `ton_sendTransaction to ${params!.to}`,
                payload: fromUint8Array(await params!.data.toBoc(false)),
              });

            default:
              return null;
          }
        },

        async handleResponse(res: TonhubTransactionResponse) {
          if (res.type === "success" && res.response != undefined) {
            return await waitTonTrx(
              res.response,
              value,
              args.config.address!,
              "in_msg"
            );
          } else {
            throw new Error(`TonHub:${res.type}`);
          }
        },
      };

      return {
        wallet: tonHub,
        accIdx: 0,
      };
    },
    tonKpWrapper(kp: TonWebMnemonic.KeyPair): TonSigner {
      const wallet = new TonWeb.Wallets.all.v3R2(ton.provider, {
        publicKey: kp.publicKey,
        wc: 0,
      });

      const wWallet: TonWallet = {
        async send(method, params) {
          switch (method) {
            case "ton_getBalance":
              return await ton.getBalance(await wallet.getAddress());
            case "ton_requestAccounts":
              return [await wallet.getAddress()];
            case "ton_sendTransaction":
              return await wallet.methods
                .transfer({
                  secretKey: kp.secretKey,
                  toAddress: params!.to,
                  amount: new BN(params!.value),
                  seqno: (await wallet.methods.seqno().call()) || 0,
                  sendMode: 3,
                  payload: params!.data,
                })
                .send();
          }
        },
        async handleResponse(res: { hash: string }) {
          return res.hash;
        },
      };

      return {
        wallet: wWallet,
        accIdx: 0,
      };
    },
    async isNftWhitelisted(nft) {
      const collectionAddress = nft.native?.collectionAddress;
      if (!collectionAddress) return false;
      let whitelistedCollections: Promise<string[]>;

      if (wl_prom) {
        whitelistedCollections = wl_prom;
      } else {
        whitelistedCollections = bridge.getWhitelist();
        wl_prom = whitelistedCollections;
      }

      const res = await wl_prom;
      wl_prom = undefined;
      return res.includes(collectionAddress) ? true : false;
    },
    getNftListAddr(address) {
      return base64url.encode(address);
    },
    getScVerifyAddr(address) {
      return address.replace(/[^a-zA-Z0-9]/g, "");
    },
    //TODO: complete getClaimData method for TON
    async getClaimData(hash, helpers) {
      hash;
      //TODO: fetch and decode TON trx;
      const decoded = {} as DepTrxData;

      const sourceNonce = Array.from(CHAIN_INFO.values()).find(
        (c) => c.v3_chainId === decoded.sourceChain
      )?.nonce;

      const sourceChainHelper = helpers.get(sourceNonce as ChainNonce);

      const tokenInfo: TokenInfo = await (
        sourceChainHelper as any
      ).getTokenInfo(decoded);

      return {
        ...tokenInfo,
        ...decoded,
      };
    },
    async getTokenInfo(depTrxData) {
      const client = new TonClient({
        endpoint: args.tonweb.provider.host,
        apiKey: args.tonweb.provider.options.apiKey,
      });
      const addr = Address.parseFriendly(
        depTrxData.sourceNftContractAddress
      ).address;

      const nftItem = client.open(NftItem.fromAddress(addr));
      const nftData = await nftItem.getGetNftData();

      let metaDataURL: string = "";
      let royalty: string = "0";

      if (nftData.collection_address) {
        const nftCollection = client.open(
          NftCollection.fromAddress(nftData.collection_address)
        );
        const [collectionData, royaltyData] = await Promise.allSettled([
          nftCollection.getGetCollectionData(),
          nftCollection.getRoyaltyParams(),
        ]);

        if (collectionData.status === "fulfilled") {
          const { collection_content } = collectionData.value;
          const collectionContentSlice = collection_content.asSlice();
          collectionContentSlice.loadUint(8);
          metaDataURL = collectionContentSlice.loadStringTail();
        }

        if (royaltyData.status === "fulfilled") {
          const royaltyParams = royaltyData.value;
          const royaltyInNum =
            royaltyParams.numerator / royaltyParams.denominator;
          const standardRoyalty = royaltyInNum * BigInt(10);
          royalty = standardRoyalty.toString();
        }
      } else {
        const individualContentSlice = nftData.individual_content.asSlice();
        individualContentSlice.loadBits(8);
        metaDataURL = individualContentSlice.loadStringTail();
      }

      const metaData = (
        await axios.get(
          typeof window !== "undefined" ? args.proxy + metaDataURL : metaDataURL
        )
      ).data;

      console.log(metaData);

      return {
        name: metaData.name || "",
        symbol: "",
        metadata: metaDataURL,
        royalty,
        //image: "",
      };
    },
    //TODO: lock trx in TON
    async lockNFT(sender, toChain, id, receiver) {
      console.log(sender, toChain, id, receiver);
      return "";
    },
    async claimV3NFT(
      sender,
      helpers,
      from,
      transactionHash,
      storageContract,
      initialClaimData
    ) {
      const [claimDataRes] = await Promise.allSettled([
        // bridge.validatorsCount(),
        from.getClaimData(transactionHash, helpers),
      ]);

      if (claimDataRes.status === "rejected") {
        throw new Error("Failed to get claimData from dep chain");
      }

      const claimData = claimDataRes.value;
      console.log(
        { ...claimData, ...initialClaimData, transactionHash },
        "claim data"
      );

      let sourceNftContractAddress_ = beginCell()
        .storeSlice(
          beginCell()
            .storeStringTail(claimData.sourceNftContractAddress)
            .endCell()
            .asSlice()
        )
        .endCell();
      try {
        sourceNftContractAddress_ = beginCell()
          .storeSlice(
            beginCell()
              .storeAddress(
                Address.parseFriendly(claimData.sourceNftContractAddress)
                  .address
              )
              .endCell()
              .asSlice()
          )
          .endCell();
      } catch (e) {
        console.log("Not Native TON Address");
      }

      const encodedClaimData: ClaimData = {
        $$type: "ClaimData",
        data1: {
          $$type: "ClaimData1",
          tokenId: BigInt(claimData.tokenId),
          destinationChain: claimData.destinationChain,
          destinationUserAddress: Address.parseFriendly(
            claimData.destinationUserAddress
          ).address,
          sourceChain: claimData.sourceChain,
          tokenAmount: BigInt(claimData.tokenAmount),
        },
        data2: {
          $$type: "ClaimData2",
          name: claimData.name,
          nftType: claimData.nftType,
          symbol: claimData.symbol,
        },
        data3: {
          $$type: "ClaimData3",
          fee: BigInt(initialClaimData.fee),
          metadata: claimData.metadata,
          royaltyReceiver: Address.parseFriendly(
            initialClaimData.royaltyReceiver
          ).address,
          sourceNftContractAddress: sourceNftContractAddress_,
        },
        data4: {
          $$type: "ClaimData4",
          newContent: beginCell()
            .storeInt(0x01, 8)
            .storeStringRefTail(claimData.metadata)
            .endCell(),
          royalty: {
            $$type: "RoyaltyParams",
            numerator: BigInt(10000),
            denominator: BigInt(claimData.royalty),
            destination: Address.parseFriendly(initialClaimData.royaltyReceiver)
              .address,
          },
          transactionHash,
        },
      };

      console.log(
        storeClaimData(encodedClaimData).toString(),
        "encodedClaimData"
      );

      const signatures = await storageContract.getLockNftSignatures(
        transactionHash,
        CHAIN_INFO.get(from.getNonce())?.v3_chainId!
      );

      const publicKey = beginCell()
        .storeBuffer(Buffer.from(signatures[0].signerAddress, "hex"))
        .endCell()
        .beginParse()
        .loadUintBig(256);

      console.log(signatures);

      const sig: SignerAndSignature = {
        $$type: "SignerAndSignature",
        key: publicKey,
        signature: beginCell()
          .storeBuffer(
            Buffer.from(signatures[0].signature.replace(/^0x/, ""), "hex")
          )
          .endCell(),
      };

      const dictA = Dictionary.empty<bigint, SignerAndSignature>().set(0n, sig);
      console.log(dictA, "encoded Sigs");

      const data = beginCell()
        .store(
          storeClaimNFT721({
            $$type: "ClaimNFT721",
            data: encodedClaimData,
            len: 1n,
            signatures: dictA,
          })
        )
        .endCell()
        .toBoc({ idx: false });

      await (sender as any).send("ton_sendTransaction", [
        {
          to: args.v3_bridge,
          value: new BN(TonWeb.utils.toNano("0.8")).toString(),
          dataType: "boc",
          data: fromUint8Array(data),
        },
      ]);
      //console.log(x, "x");

      /* await bridge.send(
                provider.sender(),
                {
                    value: toNano('0.8')
                }, {
                $$type: "ClaimNFT721",
                data: claimData,
                len: 1n,
                signatures: dictA
            });*/
      return "";
    },
  };
}

/**
{
    "tokenId": "42",
    "destinationChain": "TON",
    "destinationUserAddress": "EQDrOJsbEcJHbzSjWQDefr2YDD-D999BhZZ_XT-lxlbiDmN3",
    "sourceNftContractAddress": "0xc679bdad7c2a34ca93552eae75e4bc03bf505adc",
    "tokenAmount": "1",
    "nftType": "singular",
    "sourceChain": "BSC",
    "name": "Istra",
    "symbol": "NSA",
    "metadata": "https://meta.polkamon.com/meta?id=10002362332",
    "royalty": "0",
    "fee": "100000000000000",
    "royaltyReceiver": "EQAV8tH2WDuWYU7zAmkJmIwP8Ph_uIC4zBqJNIfKgRUUQewh",
    "transactionHash": "0x984e0c85404bd5419b33026f507b0e432e4ab35687e9478bf26bf234be41fed1"
}
 */
