import { BigNumber } from "bignumber.js";
import {
  BalanceCheck,
  BatchWrappedBalanceCheck,
  EstimateTxFees,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  WrappedBalanceCheck,
  WrappedNftCheck,
} from "./chain";

import axios from "axios";
// @ts-expect-error no types cope
import { TronWeb } from "tronweb";
// @ts-expect-error no types cope
import TronStation from "tronstation";
import { EthNftInfo, MintArgs } from "./web3";
import { BigNumber as EthBN } from "@ethersproject/bignumber/lib/bignumber";
import { Base64 } from "js-base64";

import {
  Minter__factory,
  UserNftMinter__factory,
  XPNet__factory,
  XPNft__factory,
} from "xpnet-web3-contracts";
import {
  Approve,
  ExtractAction,
  ExtractTxnStatus,
  extractWrappedMetadata,
  IsApproved,
  MintRawTxn,
  NftMintArgs,
  PreTransfer,
  PreTransferRawTxn,
  TransactionStatus,
  TransferNftForeignUnsigned,
  UnfreezeForeignNftUnsigned,
  ValidateAddress,
} from "..";
import { ChainNonceGet, NftInfo } from "..";
import { Erc721MetadataEx, Erc721WrappedData } from "../erc721_metadata";
import { Transaction } from "ethers";
import { UnfreezeNftEvent } from "xpnet-web3-contracts/dist/Minter";

// Uses default private key in provider if sender is undefinedd
type TronSender = string | undefined;

export type MinterRes = {
  // Minter smart contract
  minter: string;
  // XPNFT (Wrapper for foreign NFTs) contracte
  xpnft: string;
  // XPNET (Wrapper for foregin fungible tokens) contract
  xpnet: string;
  // Whitelisted Native NFT contracts
  whitelist: string[];
};

export type BaseTronHelper = BalanceCheck<string, BigNumber> &
  MintNft<TronSender, NftMintArgs, string> & {
    /**
     *
     * Deploy an ERC721 user minter smart contract
     *
     * @argument deployer  deployer of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(deployer: TronSender): Promise<string>;
    /**
     * Deploy Minter Smart Contract
     *
     * @argument deployer  deployer of the smart contract
     * @argument validators  address of validators of the smart contract
     * @argument threshold  threshold for executing an action
     * @argument whitelist  optional whitelisted nfts contract (deploys one if empty/undefined)
     */
    deployMinter(
      deployer: TronSender,
      validators: string[],
      threshold: number,
      whitelist: string[] | undefined
    ): Promise<MinterRes>;
  };

export type TronHelper = BaseTronHelper &
  WrappedBalanceCheck<string, BigNumber> &
  BatchWrappedBalanceCheck<string, BigNumber> &
  TransferForeign<TronSender, string, BigNumber, string> &
  // TODO: Use TX Fees
  TransferNftForeign<TronSender, string, BigNumber, EthNftInfo, string> &
  // TODO: Use TX Fees
  UnfreezeForeign<TronSender, string, string> &
  UnfreezeForeignNft<TronSender, string, BigNumber, EthNftInfo, Transaction> &
  WrappedNftCheck<EthNftInfo> &
  EstimateTxFees<BigNumber, string> &
  ChainNonceGet &
  Approve<TronSender> &
  ValidateAddress &
  IsApproved<TronSender> &
  ExtractAction<string> &
  Pick<PreTransfer<TronSender, EthNftInfo, string>, "preTransfer"> &
  PreTransferRawTxn<EthNftInfo, TronRawTxn> &
  UnfreezeForeignNftUnsigned<string, BigNumber, EthNftInfo, TronRawTxn> &
  TransferNftForeignUnsigned<string, BigNumber, EthNftInfo, TronRawTxn> &
  ExtractTxnStatus &
  MintRawTxn<TronRawTxn>;

export async function baseTronHelperFactory(
  provider: TronWeb
): Promise<BaseTronHelper> {
  const setSigner = (signer: TronSender) => {
    return signer && provider.setPrivateKey(signer);
  };

  const deployErc721_i = async (deployer: TronSender) => {
    setSigner(deployer);

    const contract = await provider.contract().new({
      abi: UserNftMinter__factory.abi,
      bytecode: UserNftMinter__factory.bytecode,
      feeLimit: 3000000000,
    });

    return contract;
  };

  const deployErc1155_i = async (owner: TronSender) => {
    setSigner(owner);

    const contract = await provider.contract().new({
      abi: XPNet__factory.abi,
      bytecode: XPNet__factory.bytecode,
      feeLimit: 3000000000,
    });

    return contract;
  };

  const deployXpNft = async (deployer: TronSender) => {
    setSigner(deployer);

    const contract = await provider.contract().new({
      abi: XPNft__factory.abi,
      bytecode: XPNft__factory.bytecode,
      feeLimit: 3000000000,
    });

    return contract;
  };

  return {
    async mintNft(owner: TronSender, options: NftMintArgs): Promise<string> {
      setSigner(owner);
      const erc = await provider.contract(
        UserNftMinter__factory.abi,
        options.contract
      );
      const res = await erc.mint(options.uris[0]).send();
      return res;
    },
    async balance(address: string): Promise<BigNumber> {
      const balance = await provider.trx.getBalance(address);
      return new BigNumber(balance);
    },
    deployErc721: async (owner) =>
      await deployErc721_i(owner).then((c) => c.address),
    async deployMinter(
      deployer: TronSender,
      validators: string[],
      threshold: number,
      whitelist: string[] = []
    ): Promise<MinterRes> {
      if (whitelist.length == 0) {
        const unft = await deployErc721_i(deployer);
        whitelist.push(unft.address);
      }

      const nft_token = await deployXpNft(deployer);
      const token = await deployErc1155_i(deployer);
      const minter = await provider.contract().new({
        abi: Minter__factory.abi,
        bytecode: Minter__factory.bytecode,
        feeLimit: 3000000000,
        parameters: [
          validators,
          whitelist,
          threshold,
          nft_token.address,
          token.address,
        ],
      });

      await nft_token.transferOwnership(minter.address).send();
      await token.transferOwnership(minter.address).send();

      return {
        minter: minter.address,
        xpnft: nft_token.address,
        xpnet: token.address,
        whitelist,
      };
    },
  };
}

export interface TronParams {
  provider: TronWeb;
  middleware_uri: string;
  erc1155_addr: string;
  minter_addr: string;
  erc721_addr: string;
  validators: string[];
  nonce: number;
}

export interface TronRawTxn {
  readonly visible: boolean;
  readonly txID: string;
  readonly raw_data: {
    readonly ref_block_bytes: string;
    readonly ref_block_hash: string;
    expiration: number;
    readonly fee_limit: number;
    readonly timestamp: number;
    readonly contract: {
      readonly parameter: {
        readonly value: {
          readonly data: string;
          readonly owner_address: string;
          readonly contract_address: string;
        };
        readonly type_url: string;
      };
      readonly type: string;
    }[];
  };
  readonly raw_data_hex: string;
}

export async function tronHelperFactory(
  tronParams: TronParams
): Promise<TronHelper> {
  const { provider, erc1155_addr, minter_addr } = tronParams;
  const station = new TronStation(provider);
  const base = await baseTronHelperFactory(provider);
  const erc1155 = await provider.contract(XPNet__factory.abi, erc1155_addr);
  const minter = await provider.contract(Minter__factory.abi, minter_addr);
  const event_middleware = axios.create({
    baseURL: tronParams.middleware_uri,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setSigner = (signer: TronSender) => {
    return signer && provider.setPrivateKey(signer);
  };

  async function notifyValidator(hash: string): Promise<void> {
    await event_middleware.post("/tx/tron", { tx_hash: hash });
  }

  async function extractAction(hash: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 6000));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getEv: (retries?: number) => Promise<any> = async (retries = 0) => {
      const res = await provider.getEventByTransactionID(hash);
      if (res.length !== 0) {
        return res;
      }
      if (retries > 15) {
        throw Error("Couldn't fetch transaction after more than 15 retries!");
      }
      await new Promise((r) => setTimeout(r, 3000));
      return getEv(retries + 1);
    };

    const evs = await getEv();
    const ev = evs.find((e: any) => e?.contract == minter_addr);
    const action_id: string = ev.result["actionId"].toString();
    return action_id;
  }

  const randomAction = () =>
    Math.floor(
      Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)
    ).toString();

  async function estimateGas(
    addrs: string[],
    func_sig: string,
    params: { type: string; value: any }[]
  ): Promise<BigNumber> {
    let energy = 0;
    let bandwidth = 0;
    const nrgSun = await station.energy.burnedEnergy2Trx(1, { unit: "sun" });
    const bandSun = 10;

    for (const [i, addr] of addrs.entries()) {
      const res = await provider.transactionBuilder.triggerConstantContract(
        minter.address,
        func_sig,
        {},
        params,
        provider.address.toHex(addr)
      );
      let nrg: number = res["energy_used"];
      if (i == addrs.length - 1 && addrs.length != 1) nrg *= 2;
      energy += nrg;
      const tx_raw: string = res["transaction"]["raw_data_hex"];
      bandwidth += tx_raw.length;
    }
    // Fee = energy * (sun per energy) + bandwidth * (sun per bandwidth)
    // bandwidth = raw tx byte length
    const fee = new BigNumber(energy).times(nrgSun).plus(bandwidth * bandSun);

    return fee;
  }

  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    _sender: TronSender
  ) => {
    const erc = await provider.contract(
      UserNftMinter__factory.abi,
      id.native.contract
    );
    const approvedAddress = await erc.getApproved(id.native.tokenId).call({
      from: tronParams.provider.defaultAddress.base58,
    });
    if (approvedAddress === minter_addr) {
      return true;
    }
    return false;
  };

  const approveForMinter = async (
    id: NftInfo<EthNftInfo>,
    sender: TronSender | undefined
  ) => {
    await setSigner(sender);
    const erc = await provider.contract(
      UserNftMinter__factory.abi,
      id.native.contract
    );
    const isApproved = await isApprovedForMinter(id, sender);
    if (isApproved) {
      return undefined;
    }

    const txHash: string = await erc
      .approve(minter_addr, id.native.tokenId)
      .send();
    return txHash;
  };

  const addMinToExpirationTime = (txn: TronRawTxn, minutes: number) => {
    const expiration = txn.raw_data.expiration;
    const newExpiration = new Date(expiration).getTime() + minutes * 60000;
    txn.raw_data.expiration = newExpiration;
    return txn;
  };

  return {
    ...base,
    extractAction,
    approveForMinter,
    preTransfer: (s, nft, _fee) => approveForMinter(nft, s),
    async preTransferRawTxn(nft, address, _value) {
      await setSigner(address);
      const isApproved = await isApprovedForMinter(nft, address);
      if (isApproved) {
        return undefined;
      }
      const { transaction, result } =
        await provider.transactionBuilder.triggerSmartContract(
          nft.native.contract,
          "approve(address,uint256)",
          {
            feeLimit: 1_000_000,
            callValue: 0,
          },
          [
            {
              type: "address",
              value: minter_addr,
            },
            {
              type: "uint256",
              value: nft.native.tokenId,
            },
          ],
          address
        );
      if (!result.result) {
        throw new Error(result.toString());
      }
      return addMinToExpirationTime(transaction, 15);
    },
    async mintRawTxn(args, sender) {
      const { transaction, result } =
        await provider.transactionBuilder.triggerSmartContract(
          args.contract,
          "mint(string)",
          {
            feeLimit: 1_000_000,
            callValue: 0,
          },
          [
            {
              type: "string",
              value: args.uris[0],
            },
          ],
          sender
        );
      if (!result.result) {
        throw new Error(result.toString());
      }
      return addMinToExpirationTime(transaction, 15);
    },
    async transferNftToForeignTxn(nonce, to, id, _fee, sender) {
      const { transaction, result } =
        await provider.transactionBuilder.triggerSmartContract(
          "freezeErc721(address,uint256,uint64,string)",
          {
            feeLimit: 1_000_000,
            callValue: 0,
          },
          [
            {
              type: "address",
              value: id.native.contract,
            },
            {
              type: "uint256",
              value: id.native.tokenId,
            },
            {
              type: "uint64",
              value: nonce,
            },
            {
              type: "string",
              value: to,
            },
          ],
          sender
        );
      if (!result.result) {
        throw new Error(result.toString());
      }
      return addMinToExpirationTime(transaction, 15);
    },
    async unfreezeWrappedNftTxn(to, id, _fee, sender) {
      const { transaction, result } =
        await provider.transactionBuilder.triggerSmartContract(
          "withdrawNft(string,uint256)",
          {
            feeLimit: 1_000_000,
            callValue: 0,
          },
          [
            {
              type: "string",
              value: to,
            },
            {
              type: "uint256",
              value: id,
            },
          ],
          sender
        );
      if (!result.result) {
        throw new Error(result.toString());
      }
      return addMinToExpirationTime(transaction, 15);
    },
    isWrappedNft(nft) {
      return (
        nft.native.contract.toLowerCase() ===
        tronParams.erc721_addr.toLowerCase()
      );
    },
    isApprovedForMinter,
    async transferNativeToForeign(
      sender: TronSender,
      chain_nonce: number,
      to: string,
      value: BigNumber,
      txFees: BigNumber
    ): Promise<string> {
      setSigner(sender);

      const val = EthBN.from(value.toString());
      const totalVal = val.add(EthBN.from(txFees.toString()));
      let res = await minter
        .freeze(chain_nonce, to, val)
        .send({ callValue: totalVal });

      await notifyValidator(res);
      return res;
    },
    async extractTxnStatus(txnHash) {
      const txn = await provider.trx.getConfirmedTransaction(txnHash);
      const status = txn["ret"][0]["contractRet"];
      if (status === "SUCCESS") {
        return TransactionStatus.SUCCESS;
      } else if (status === "FAIL") {
        return TransactionStatus.FAILURE;
      }
      return TransactionStatus.PENDING;
    },
    async unfreezeWrapped(
      sender: TronSender,
      chain_nonce: number,
      to: string,
      value: string,
      txFees: string
    ): Promise<string> {
      setSigner(sender);
      const res = await minter
        .withdraw(chain_nonce, to, value)
        .send({ callValue: EthBN.from(txFees.toString()) });

      await notifyValidator(res);
      return res;
    },
    async unfreezeWrappedNft(
      sender: TronSender,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<Transaction> {
      setSigner(sender);
      const res = await minter
        .withdrawNft(to, id.native.tokenId)
        .send({ callValue: EthBN.from(txFees.toString()) });

      await notifyValidator(res);
      return res;
    },
    getNonce() {
      return tronParams.nonce;
    },
    async transferNftToForeign(
      sender: TronSender,
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<string> {
      setSigner(sender);
      await approveForMinter(id, sender);

      const txr = await minter
        .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to)
        .send({ callValue: EthBN.from(txFees.toString()) });

      await notifyValidator(txr);
      return txr;
    },
    async balanceWrappedBatch(
      address: string,
      chain_nonces: number[]
    ): Promise<Map<number, BigNumber>> {
      const res = new Map<number, BigNumber>();
      const balance = await erc1155
        .balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces)
        .call();
      balance.map((e: any, i: any) => {
        res.set(chain_nonces[i], new BigNumber(e.toString()));
      });
      return res;
    },
    async balanceWrapped(
      address: string,
      chain_nonce: number
    ): Promise<BigNumber> {
      const bal = await erc1155.balanceOf(address, chain_nonce).call();
      return new BigNumber(bal.toString());
    },
    async estimateValidateTransferNft(
      to: string,
      nftUri: NftInfo<string>
    ): Promise<BigNumber> {
      return await estimateGas(
        tronParams.validators,
        "validateTransferNft(uint128,address,string)",
        [
          { type: "uint128", value: randomAction() },
          { type: "address", value: to },
          {
            type: "string",
            value: nftUri,
          },
        ]
      );
    },
    async estimateValidateUnfreezeNft(
      to: string,
      nft: NftInfo<any>
    ): Promise<BigNumber> {
      const wrappedData = await extractWrappedMetadata(nft);

      return await estimateGas(
        tronParams.validators,
        "validateUnfreezeNft(uint128,address,uint256,address)",
        [
          { type: "uint128", value: randomAction() },
          { type: "address", value: to },
          {
            type: "uint256",
            value: EthBN.from(wrappedData.wrapped.tokenId),
          },
          { type: "address", value: wrappedData.wrapped.contract },
        ]
      );
    },
    async validateAddress(adr: string): Promise<boolean> {
      return provider.isAddress(adr);
    },
  };
}
