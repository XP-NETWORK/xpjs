import { BigNumber } from "bignumber.js";
import {
  BalanceCheck,
  EstimateTxFees,
  MintNft,
  TransferNftForeign,
  UnfreezeForeignNft,
} from "./chain";

// @ts-expect-error no types cope
import { TronWeb } from "tronweb";
// @ts-expect-error no types cope
import TronStation from "tronstation";
import { EthNftInfo } from "./web3";
import { BigNumber as EthBN } from "@ethersproject/bignumber/lib/bignumber";

import {
  Minter__factory,
  UserNftMinter__factory,
  XPNft__factory,
  XPNft1155__factory,
} from "xpnet-web3-contracts";
import {
  Approve,
  Chain,
  ExtractAction,
  ExtractTxnStatus,
  IsApproved,
  NftMintArgs,
  PreTransfer,
  PreTransferRawTxn,
  TransactionStatus,
  ValidateAddress,
  WhitelistCheck,
} from "..";
import { ChainNonceGet, NftInfo } from "..";
import { Transaction } from "ethers";
import { EvNotifier } from "../notifier";

// Uses default private key in provider if sender is undefinedd
type TronSender = string | undefined;

export type MinterRes = {
  // Minter smart contract
  minter: string;
  // XPNFT (Wrapper for foreign NFTs) contracte
  xpnft: string;
  // XPNFT1155 (Wrapper for ERC1155 Foreign NFTs) contract
  xpnft1155: string;
  // Whitelisted Native NFT contracts
  whitelist: string[];
};

export type BaseTronHelper = BalanceCheck &
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
     * @argument frostGroupKey FROST SECP256k1 Group Key
     * @argument xpnftPrefix XP Wrapped NFT backend with "/" suffix
     * @argument xpnftPrefix1155 XP Wrapped NFT Backend in erc1155 format (with {id})
     * @argument whitelist List of NFTs to whitelist
     */
    deployMinter(
      deployer: TronSender,
      frostGroupKey: string,
      xpnftPrefix: string,
      xpnftPrefix1155: string,
      whitelist?: string[]
    ): Promise<MinterRes>;
  };

export type TronHelper = BaseTronHelper &
  TransferNftForeign<TronSender, EthNftInfo, string> &
  UnfreezeForeignNft<TronSender, EthNftInfo, Transaction> &
  EstimateTxFees<EthNftInfo> &
  ChainNonceGet &
  Approve<TronSender> &
  ValidateAddress &
  IsApproved<TronSender> &
  ExtractAction<string> &
  Pick<PreTransfer<TronSender, EthNftInfo, string>, "preTransfer"> &
  PreTransferRawTxn<EthNftInfo, TronRawTxn> &
  ExtractTxnStatus &
  WhitelistCheck<EthNftInfo>;

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

  const deployXpNft = async (deployer: TronSender, nftPrefix: string) => {
    setSigner(deployer);

    const contract = await provider.contract().new({
      abi: XPNft__factory.abi,
      bytecode: XPNft__factory.bytecode,
      feeLimit: 3000000000,
      parameters: ["XPNFT", "XPNFT", nftPrefix],
    });

    return contract;
  };

  const deployXpNft1155 = async (deployer: TronSender, nftPrefix: string) => {
    setSigner(deployer);
    const contract = await provider.contract().new({
      abi: XPNft1155__factory.abi,
      bytecode: XPNft1155__factory.bytecode,
      feeLimit: 3000000000,
      parameters: [nftPrefix],
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
      frostGroupKey,
      xpnftPrefix,
      xpnftPrefix1155,
      whitelist: string[] = []
    ): Promise<MinterRes> {
      if (whitelist.length == 0) {
        const unft = await deployErc721_i(deployer);
        whitelist.push(unft.address);
      }

      const gk = Buffer.from(frostGroupKey, "hex");
      const gkx = EthBN.from(`0x${gk.slice(1).toString("hex")}`);
      // gkyp is either 0 or 1
      const gkyp = EthBN.from(`0x${gk[0] & 1}`);

      const erc721 = await deployXpNft(deployer, xpnftPrefix);
      const erc1155 = await deployXpNft1155(deployer, xpnftPrefix1155);

      const minter = await provider.contract().new({
        abi: Minter__factory.abi,
        bytecode: Minter__factory.bytecode,
        feeLimit: 6000000000,
        parameters: [gkx, gkyp, whitelist],
      });

      await erc721.transferOwnership(minter.address).send();
      await erc1155.transferOwnership(minter.address).send();
      const minterAddress: string = provider.address.fromHex(minter.address);
      const erc721Address: string = provider.address.fromHex(erc721.address);
      const erc1155Address: string = provider.address.fromHex(erc1155.address);
      return {
        minter: minterAddress,
        xpnft: erc721Address,
        xpnft1155: erc1155Address,
        whitelist,
      };
    },
  };
}

export interface TronParams {
  provider: TronWeb;
  notifier: EvNotifier;
  minter_addr: string;
  erc721_addr: string;
  validators: string[];
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
  const { provider, minter_addr } = tronParams;
  const station = new TronStation(provider);
  const base = await baseTronHelperFactory(provider);
  const minter = await provider.contract(Minter__factory.abi, minter_addr);

  const setSigner = (signer: TronSender) => {
    return signer && provider.setPrivateKey(signer);
  };

  async function notifyValidator(hash: string): Promise<void> {
    await tronParams.notifier.notifyTron(hash);
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
    isApprovedForMinter,
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
    async unfreezeWrappedNft(
      sender: TronSender,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<Transaction> {
      setSigner(sender);
      const res = await minter
        .withdrawNft(to, id.native.tokenId)
        .send({ callValue: EthBN.from(txFees.toString(10)) });

      await notifyValidator(res);
      return res;
    },
    getNonce() {
      return Chain.TRON;
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
        .send({ callValue: EthBN.from(txFees.toString(10)) });

      await notifyValidator(txr);
      return txr;
    },
    async estimateValidateTransferNft(
      to: string,
      nftUri: NftInfo<EthNftInfo>
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
      _to: string,
      _nft: NftInfo<any>
    ): Promise<BigNumber> {
      return new BigNumber(0); // TODO
    },
    async validateAddress(adr: string): Promise<boolean> {
      return provider.isAddress(adr);
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract).call({
        from: tronParams.provider.defaultAddress.base58,
      });
    },
  };
}
