import WalletConnect from "@walletconnect/client";
import algosdk, { Algodv2, SuggestedParams } from "algosdk";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import { Base64 } from "js-base64";
import {
  AlgorandSocketHelper,
  Chain,
  ChainNonceGet,
  EstimateTxFees,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "..";
import MyAlgoConnect from "@randlabs/myalgo-connect";

type TxResp = {
  txId: string;
};

type AlgoNft = {
  "metadata-hash"?: string;
  name?: string;
  "unit-name"?: string;
  url: string;
  creator: string;
  nftId: number;
};

type SignedTxn = {
  txID?: string;
  blob: string;
};

type Ledger = "MainNet" | "TestNet" | "any";

type BrowserSigner = {
  accounts(args: { ledger: Ledger }): Promise<{ address: string }[]>;
  signTxn(transactions: { txn: string }[]): Promise<SignedTxn[]>;
  send(info: { ledger: Ledger; tx: string }): Promise<TxResp>;
};

export type ClaimNftInfo = {
  appId: number;
  nftId: number;
};

/**
 * Selected address & ledger must be given explicitly
 */
export type AlgoSignerH = {
  readonly algoSigner: BrowserSigner;
  readonly address: string;
  readonly ledger: Ledger;
};

/**
 * This library is written in typescript.
 * unfortunately the browser extension injects the AlgoSigner in a way we can't get a typed object wwithout this hack.
 *
 * @return Strongly typed AlgoSigner from extension
 */
export function typedAlgoSigner(): BrowserSigner {
  //@ts-expect-error why do you inject libraries like this :|
  if (typeof AlgoSigner === "undefined") {
    throw Error("algosigner not available!");
  }

  //@ts-expect-error why do you inject libraries like this :|
  return AlgoSigner;
}

export function algoSignerWrapper(
  algod: algosdk.Algodv2,
  acc: algosdk.Account
): AlgoSignerH {
  const signer: BrowserSigner = {
    accounts(_) {
      return Promise.resolve([
        {
          address: acc.addr,
        },
      ]);
    },
    signTxn(txns) {
      return Promise.resolve(
        txns.map((t) => {
          const signed = algosdk.signTransaction(
            algosdk.decodeUnsignedTransaction(Base64.toUint8Array(t.txn)),
            acc.sk
          );
          return {
            txID: signed.txID,
            blob: Base64.fromUint8Array(signed.blob),
          };
        })
      );
    },
    send({ tx }) {
      return algod.sendRawTransaction(Base64.toUint8Array(tx)).do();
    },
  };

  return {
    algoSigner: signer,
    address: acc.addr,
    ledger: "any",
  };
}

export type FullClaimNft = ClaimNftInfo & {
  name: string;
  uri: string;
};

export type AlgorandHelper = ChainNonceGet &
  TransferNftForeign<AlgoSignerH, AlgoNft, string> &
  UnfreezeForeignNft<AlgoSignerH, AlgoNft, string> &
  EstimateTxFees<AlgoNft> &
  ValidateAddress & {
    algod: algosdk.Algodv2;
    claimNft(claimer: AlgoSignerH, info: ClaimNftInfo): Promise<string>;
    claimableNfts(
      txSocket: AlgorandSocketHelper,
      owner: string
    ): Promise<FullClaimNft[]>;
    isOptIn(address: string, nftId: number): Promise<boolean>;
    optInNft(
      signer: AlgoSignerH,
      info: ClaimNftInfo
    ): Promise<string | undefined>;
    walletConnectSigner(connector: WalletConnect, address: string): AlgoSignerH;
    myAlgoSigner(myAlgo: MyAlgoConnect, address: string): AlgoSignerH;
  } & Pick<PreTransfer<AlgoSignerH, AlgoNft, SuggestedParams>, "preTransfer">;

export type AlgorandParams = {
  algodApiKey: string;
  algodUri: string;
  algodPort: number | undefined;
  sendNftAppId: number;
};

type MinWrappedNft = {
  wrapped: {
    origin: string;
  };
};

const encoder = new TextEncoder();
const MINT_NFT_COST = new BigNumber(1000);

export function algorandHelper(args: AlgorandParams): AlgorandHelper {
  const appAddr = algosdk.getApplicationAddress(args.sendNftAppId);
  const algod = new algosdk.Algodv2(
    args.algodApiKey,
    args.algodUri,
    args.algodPort
  );

  async function waitTxnConfirm(txId: string) {
    const status = await algod.status().do();
    let lastRound = status["last-round"];
    let pendingInfo = await algod.pendingTransactionInformation(txId).do();
    while (
      !(pendingInfo["confirmed-round"] && pendingInfo["confirmed-round"] > 0)
    ) {
      lastRound += 1;
      await algod.statusAfterBlock(lastRound).do();
      pendingInfo = await algod.pendingTransactionInformation(txId).do();
    }
  }

  async function compileProgram(
    client: Algodv2,
    programSource: string
  ) {
    const enc = new TextEncoder();
    const programBytes = enc.encode(programSource);
    const compileResponse = await client.compile(programBytes).do();
    const compiledBytes = new Uint8Array(
      Buffer.from(compileResponse.result, 'base64')
    );
    return compiledBytes;
  };

  async function getMintPoolProgram(client: Algodv2, recv: any) {
    const poolSrc = fs.readFileSync(__dirname + '/bridge_pool.tmpl.teal');
    return await compileProgram(
      client,
      poolSrc.toString().replace('TMPL_RECV_ADDR', recv)
    );
  }

  const transferNft = async (
    signer: AlgoSignerH,
    chain_nonce: number,
    to: string,
    nft: NftInfo<AlgoNft>,
    txFees: BigNumber
  ) => {
    const suggested = await algod.getTransactionParams().do();

    const transferTx =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: signer.address,
        to: appAddr,
        amount: 1,
        assetIndex: nft.native.nftId,
        suggestedParams: suggested,
      });
    const tCallTx = algosdk.makeApplicationNoOpTxnFromObject({
      from: signer.address,
      appIndex: args.sendNftAppId,
      appArgs: [
        encoder.encode("freeze_nft"),
        encoder.encode(to),
        new Uint8Array(
          Buffer.concat([
            Buffer.from(new Uint32Array([0]).buffer),
            Buffer.from(new Uint32Array([chain_nonce]).buffer).reverse(),
          ])
        ),
      ],
      foreignAssets: [nft.native.nftId],
      suggestedParams: suggested,
    });
    algosdk.assignGroupID([tCallTx, transferTx]);
    const encodedTxns = [
      { txn: Base64.fromUint8Array(tCallTx.toByte()) },
      { txn: Base64.fromUint8Array(transferTx.toByte()) },
    ];
    const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
    const sendRes = await algod
      .sendRawTransaction([
        Base64.toUint8Array(signedTxns[0].blob),
        Base64.toUint8Array(signedTxns[1].blob),
      ])
      .do();
    await waitTxnConfirm(sendRes.txId);

    return sendRes.txId as string;
  };

  async function isOptIn(addr: string, nftId: number) {
    const user = await algod.accountInformation(addr).do();
    for (let i = 0; i < user["assets"].length; i++) {
      if (user["assets"][i]["asset-id"] === nftId) {
        return true;
      }
    }

    return false;
  }

  async function optInNft(signer: AlgoSignerH, nft: ClaimNftInfo) {
    if (await isOptIn(signer.address, nft.nftId)) {
      return undefined;
    }

    const suggested = await algod.getTransactionParams().do();
    const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: signer.address,
      to: signer.address,
      amount: 0,
      assetIndex: nft.nftId,
      suggestedParams: suggested,
    });
    const encodedTx = Base64.fromUint8Array(optIn.toByte());
    const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
    const res = await signer.algoSigner.send({
      ledger: signer.ledger,
      tx: signedTx[0].blob,
    });
    await waitTxnConfirm(res.txId);
    return res.txId;
  }

  async function claimNft(signer: AlgoSignerH, info: ClaimNftInfo) {
    await optInNft(signer, info);

    const program = await getMintPoolProgram(algod, signer.address)
    const lsig = new algosdk.LogicSigAccount(program)
    const suggested = await algod.getTransactionParams().do();
    const xferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: lsig.address(),
      suggestedParams: suggested,
      to: signer.address,
      amount: 1,
      assetIndex: info.nftId
    })
    const lstx = algosdk.signLogicSigTransactionObject(xferTxn, lsig)
    const { txId } = await algod.sendRawTransaction([lstx.blob]).do()

    await waitTxnConfirm(txId);
    return txId;
  }

  return {
    algod,
    getNonce: () => Chain.ALGORAND,
    claimNft,
    optInNft,
    isOptIn,
    async preTransfer(sender, nft, _fee) {
      if (await isOptIn(appAddr, nft.native.nftId)) {
        return undefined;
      }

      const suggested = await algod.getTransactionParams().do();
      const callTx = algosdk.makeApplicationNoOpTxnFromObject({
        from: sender.address,
        appIndex: args.sendNftAppId,
        appArgs: [encoder.encode("optin_asset")],
        foreignAssets: [nft.native.nftId],
        suggestedParams: suggested,
      });
      const feesTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender.address,
        suggestedParams: suggested,
        to: appAddr,
        amount: _fee.toNumber()
      })

      algosdk.assignGroupID([callTx, feesTx]);
      const encodedTxns = [
        { txn: Base64.fromUint8Array(callTx.toByte()) },
        { txn: Base64.fromUint8Array(feesTx.toByte()) },
      ];
      const signedTxns = await sender.algoSigner.signTxn(encodedTxns);
      const sendRes = await algod
        .sendRawTransaction([
          Base64.toUint8Array(signedTxns[0].blob),
          Base64.toUint8Array(signedTxns[1].blob),
        ])
        .do();
      await waitTxnConfirm(sendRes.txId);

      return suggested;
    },
    transferNftToForeign: transferNft,
    unfreezeWrappedNft: async (signer, to, nft, txFees) => {
      const nftMeta = await axios.get<MinWrappedNft>(nft.uri);
      return await transferNft(
        signer,
        parseInt(nftMeta.data.wrapped.origin),
        to,
        nft,
        txFees
      );
    },
    estimateValidateTransferNft: () => Promise.resolve(MINT_NFT_COST),
    estimateValidateUnfreezeNft: () => Promise.resolve(MINT_NFT_COST),
    validateAddress: (adr) => Promise.resolve(algosdk.isValidAddress(adr)),
    claimableNfts: async (txSocket: AlgorandSocketHelper, owner: string) => {
      await txSocket.cleanNfts(owner);
      const claims = await txSocket.claimNfts(owner);

      const res = await Promise.all(
        claims.map(async (v) => {
          const appId = parseInt(v.app_id);
          const nftId = parseInt(v.nft_id);
          const assetInfo = await algod.getAssetByID(nftId).do();

          return {
            nftId,
            appId,
            uri: assetInfo.params.url as string,
            name: (assetInfo.params.name as string) || "",
          };
        })
      );

      return res;
    },
    walletConnectSigner(
      connector: WalletConnect,
      address: string
    ): AlgoSignerH {
      const signer: BrowserSigner = {
        accounts(_) {
          return Promise.resolve(
            connector.accounts.map((s) => ({ address: s }))
          );
        },
        async signTxn(txns) {
          const req = formatJsonRpcRequest("algo_signTxn", [txns]);
          const signed: Array<string | null> =
            await connector.sendCustomRequest(req);
          const decoded = signed.map((s) => {
            return {
              blob: s ?? "",
            } as SignedTxn;
          });
          if (decoded.length != txns.length) {
            throw Error("Couldn't sign all transactions!");
          }

          return decoded;
        },
        send(info: { tx: string }): Promise<TxResp> {
          return algod.sendRawTransaction(Base64.toUint8Array(info.tx)).do();
        },
      };

      return {
        algoSigner: signer,
        address,
        ledger: "any",
      };
    },
    myAlgoSigner(myAlgo, address): AlgoSignerH {
      const signer: BrowserSigner = {
        async accounts(_) {
          const accs = await myAlgo.connect();
          return accs;
        },
        async signTxn(txns) {
          const stxs = await myAlgo.signTransaction(txns.map(({ txn }) => txn));
          return stxs.map((tx) => ({
            txID: tx.txID,
            blob: Base64.fromUint8Array(tx.blob),
          }));
        },
        send(info: { tx: string }): Promise<TxResp> {
          return algod.sendRawTransaction(Base64.toUint8Array(info.tx)).do();
        },
      };

      return {
        algoSigner: signer,
        address,
        ledger: "any",
      };
    },
  };
}
