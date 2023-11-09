/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import {
  BalanceCheck,
  EstimateTxFeesBatch,
  EstimateDeployFees,
  UserStore,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  IsContractAddress,
  MintNft,
  TransferNftForeign,
  TransferNftForeignBatch,
  UnfreezeForeignNft,
  UnfreezeForeignNftBatch,
  ParamsGetter,
} from "../chain";
import {
  BigNumber as EthBN,
  ContractTransaction,
  ethers,
  PopulatedTransaction,
  providers,
  Signer,
  VoidSigner,
  Wallet,
} from "ethers";
import { Provider, TransactionResponse } from "@ethersproject/providers";
import {
  Erc1155Minter,
  Erc1155Minter__factory,
  Minter__factory,
  UserNftMinter,
  Minter,
  UserNftMinter__factory,
} from "xpnet-web3-contracts";

import { UserNFTStore__factory } from "xpnet-web3-contracts/dist/factories/UserStore.sol/index";
import { UserNFTStore } from "xpnet-web3-contracts/dist/UserStore.sol";

import { UserNFTStore__factory as UserNFTStore721__factory } from "xpnet-web3-contracts/dist/factories/UserNFTStore721.sol/index";

import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  GetTokenURI,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  TransactionStatus,
  ValidateAddress,
  WhitelistCheck,
  LockNFT,
  GetClaimData,
  ClaimV3NFT,
  CHAIN_INFO,
} from "../..";
import { ChainNonce } from "../../type-utils";
import { EvNotifier } from "../../services/notifier";
import { hethers } from "@hashgraph/hethers";
import { txnUnderpricedPolyWorkaround as UnderpricedWorkaround } from "./web3_utils";

import {
  Bridge__factory as V3Bridge__factory,
  // Bridge as V3Bridge,
  ERC721Royalty__factory,
  ERC1155Royalty__factory,
} from "xpnet-web3-contracts/dist/v3";

import { SignerAndSignatureStructOutput } from "xpnet-web3-contracts/dist/v3/contracts/Bridge";

/**
 * Information required to perform NFT transfers in this chain
 */
export type EthNftInfo = {
  chainId: string;
  tokenId: string;
  owner: string;
  uri: string;
  contract: string;
  contractType: "ERC721" | "ERC1155";
};

/**
 * Arguments required for minting a new nft
 *
 * contract: address of the sc
 * token: token ID of the newly minted nft
 * owner: Owner of the newly minted nft
 * uri: uri of the nft
 */
export type MintArgs = {
  contract: string;
  uri: string;
};

export interface IsApproved<Sender> {
  isApprovedForMinter(
    address: NftInfo<EthNftInfo>,
    sender: Sender,
    toApprove: string
  ): Promise<boolean>;
}

export interface Approve<Sender> {
  approveForMinter(
    address: NftInfo<EthNftInfo>,
    sender: Sender,
    txFee: BigNumber,
    overrides?: ethers.Overrides,
    toApprove?: string
  ): Promise<string | undefined>;
}

hethers.providers.BaseProvider.prototype.getGasPrice = async () => {
  return EthBN.from("1");
};

type NullableCustomData = Record<string, any> | undefined;

enum BridgeTypes {
  Minter,
  UserStorage,
}

type MinterBridge = {
  address: string;
  contract: Minter;
};

type UserStorageBridge = {
  getMinterForCollection: (isMapped: boolean) => (
    signer: Signer,
    collection: string,
    type: string,
    fees?: number
  ) => Promise<{
    address: string;
    contract: UserNFTStore | Minter;
  }>;
};

/**
 * Base util traits
 */
export type BaseWeb3Helper = BalanceCheck &
  /**
   * Mint an nft in the given ERC1155 smart contract
   *
   * @argument signer  owner of the smart contract
   * @argument args  See [[MintArgs]]
   */ MintNft<Signer, MintArgs, ContractTransaction> & {
    /**
     * Deploy an ERC721 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: Signer): Promise<string>;
  } & {
    mintNftErc1155(
      owner: Signer,
      options: MintArgs
    ): Promise<ContractTransaction>;
  };

export type ExtraArgs = { overrides: ethers.Overrides };

/**
 * Traits implemented by this module
 */
export type Web3Helper = BaseWeb3Helper &
  TransferNftForeign<Signer, EthNftInfo, TransactionResponse> &
  UnfreezeForeignNft<Signer, EthNftInfo, TransactionResponse> &
  TransferNftForeignBatch<Signer, EthNftInfo, TransactionResponse> &
  UnfreezeForeignNftBatch<Signer, EthNftInfo, TransactionResponse> &
  EstimateTxFees<EthNftInfo> &
  EstimateTxFeesBatch<EthNftInfo> &
  EstimateDeployFees &
  ChainNonceGet &
  IsApproved<Signer> &
  Approve<Signer> &
  ValidateAddress &
  ExtractAction<TransactionResponse> & {
    createWallet(privateKey: string): Wallet;
  } & Pick<PreTransfer<Signer, EthNftInfo, string, ExtraArgs>, "preTransfer"> &
  PreTransferRawTxn<EthNftInfo, PopulatedTransaction> &
  ExtractTxnStatus &
  GetProvider<providers.Provider> & {
    XpNft: string;
    XpNft1155: string;
  } & WhitelistCheck<EthNftInfo> &
  GetFeeMargins &
  IsContractAddress &
  GetTokenURI &
  ParamsGetter<Web3Params> &
  UserStore &
  LockNFT<Signer, EthNftInfo, TransactionResponse> &
  ClaimV3NFT<Signer, TransactionResponse> &
  GetClaimData;

/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */

export async function baseWeb3HelperFactory(
  provider: Provider,
  nonce: number
): Promise<BaseWeb3Helper> {
  const w3 = provider;

  return {
    async balance(address: string): Promise<BigNumber> {
      const bal = await w3.getBalance(address);

      // ethers BigNumber is not compatible with our bignumber
      return new BigNumber(bal.toString());
    },
    async deployErc721(owner: Signer): Promise<string> {
      const factory = new UserNftMinter__factory(owner);
      const contract = await factory.deploy();

      return contract.address;
    },
    async mintNftErc1155(owner: Signer, { contract }) {
      const erc1155 = Erc1155Minter__factory.connect(contract!, owner);
      const tx = await erc1155.mintNft(await owner.getAddress());

      return tx;
    },
    async mintNft(
      owner: Signer,
      { contract, uri }: MintArgs
    ): Promise<ContractTransaction> {
      const erc721 = UserNftMinter__factory.connect(contract!, owner);
      const txm = await erc721
        .mint(uri, {
          gasLimit: 1000000,
          gasPrice: await provider.getGasPrice(),
        })
        .catch(async (e) => {
          if (nonce === 33) {
            let tx;
            while (!tx) {
              tx = await provider.getTransaction(e["returnedHash"]);
            }
            return tx;
          }
          throw e;
        });
      return txm;
    },
  };
}

/**
 * Create an object implementing cross chain utilities for a web3 chain
 *
 * @param provider  An ethers.js provider object
 * @param minter_addr  Address of the minter smart contract
 * @param minter_abi  ABI of the minter smart contract
 */
export interface Web3Params {
  provider: Provider;
  notifier: EvNotifier;
  minter_addr: string;
  erc721_addr: string;
  erc1155_addr: string;
  erc721Minter: string;
  erc1155Minter: string;
  nonce: ChainNonce;
  feeMargin: FeeMargins;
  noWhitelist?: boolean;
  v3_bridge?: string;
}

type NftMethodVal<T, Tx> = {
  freeze: "freezeErc1155" | "freezeErc721";
  validateUnfreeze: "validateUnfreezeErc1155" | "validateUnfreezeErc721";
  umt: typeof Erc1155Minter__factory | typeof UserNftMinter__factory;
  approved: (
    umt: T,
    sender: string,
    minterAddr: string,
    tok: string,
    customData: NullableCustomData
  ) => Promise<boolean>;
  approve: (
    umt: T,
    forAddr: string,
    tok: string,
    txnUp: (tx: PopulatedTransaction) => Promise<void>,
    customData: NullableCustomData,
    overrides: ethers.Overrides | undefined
  ) => Promise<Tx>;
};

type EthNftMethodVal<T> = NftMethodVal<T, ContractTransaction>;

type NftMethodMap = Record<
  "ERC1155" | "ERC721",
  EthNftMethodVal<Erc1155Minter> | EthNftMethodVal<UserNftMinter>
>;

export const NFT_METHOD_MAP: NftMethodMap = {
  ERC1155: {
    freeze: "freezeErc1155",
    validateUnfreeze: "validateUnfreezeErc1155",
    umt: Erc1155Minter__factory,
    approved: (
      umt: Erc1155Minter,
      sender: string,
      minterAddr: string,
      _tok: string,
      customData: NullableCustomData
    ) => {
      return umt.isApprovedForAll(sender, minterAddr, {
        gasLimit: "85000",
        customData,
      });
    },
    approve: async (
      umt: Erc1155Minter,
      forAddr: string,
      _tok: string,
      txnUp: (tx: PopulatedTransaction) => Promise<void>,
      customData: NullableCustomData,
      overrides: ethers.Overrides | undefined
    ) => {
      const tx = await umt.populateTransaction.setApprovalForAll(
        forAddr,
        true,
        {
          gasLimit: overrides?.gasLimit || "500000",
          gasPrice: overrides?.gasPrice,
          customData,
        }
      );
      await txnUp(tx);
      return await umt.signer.sendTransaction(tx);
    },
  },
  ERC721: {
    freeze: "freezeErc721",
    validateUnfreeze: "validateUnfreezeErc721",
    umt: UserNftMinter__factory,
    approved: async (
      umt: UserNftMinter,
      _: string,
      minterAddr: string,
      tok: string,
      customData: NullableCustomData
    ) => {
      return (
        (
          await umt.getApproved(tok, {
            gasLimit: "85000",
            customData,
            //@ts-ignore
          })
        ).toLowerCase() == minterAddr.toLowerCase()
      );
    },
    approve: async (
      umt: UserNftMinter,
      forAddr: string,
      tok: string,
      txnUp: (tx: PopulatedTransaction) => Promise<void>,
      _customData: NullableCustomData,
      overrides: ethers.Overrides | undefined
    ) => {
      const tx = await umt.populateTransaction.approve(forAddr, tok, {
        gasLimit: overrides?.gasLimit || "1000000",
        gasPrice: overrides?.gasPrice,
      });

      await txnUp(tx);

      return await umt.signer.sendTransaction(tx);
    },
  },
};

export async function web3HelperFactory(
  params: Web3Params
): Promise<Web3Helper> {
  const txnUnderpricedPolyWorkaround =
    params.nonce == 7 ? UnderpricedWorkaround : () => Promise.resolve();

  /* const customData = () => {
        if (params.nonce === 0x1d) {
            return { usingContractAlias: true };
        } else {
            return undefined;
        }
    };*/
  const w3 = params.provider;
  const { minter_addr, provider } = params;
  function Bridge<T>(type: BridgeTypes): T {
    const defaultMinter = {
      address: "",
      contract: Minter__factory.connect(minter_addr, provider),
    };
    const res = {
      [BridgeTypes.Minter]: defaultMinter,
      [BridgeTypes.UserStorage]: {
        getMinterForCollection:
          (isMapped: boolean) =>
          async (
            signer: Signer,
            collection: string,
            type: string,
            fees?: number
          ) => {
            if (!params.noWhitelist) return defaultMinter;

            try {
              if (!type || !collection)
                throw new Error(
                  `That NFT has wrong format:${type}:${collection}`
                );

              const contract = await params.notifier.getCollectionContract(
                collection,
                params.nonce
              );

              if (contract)
                return {
                  address: contract,
                  contract: UserNFTStore__factory.connect(contract, provider),
                };

              if (isMapped) return defaultMinter;

              if (!fees) {
                console.log("calc deploy fees");

                fees = (await estimateUserStoreDeploy(signer))
                  .div(1e18)
                  .integerValue()
                  .toNumber();
                // }
              }

              const tx = await payForDeployUserStore(signer, String(fees));

              if (tx.status !== 1)
                throw new Error(
                  "Faied to pay for deployment. Please come back later"
                );

              const address = await params.notifier.createCollectionContract(
                collection,
                params.nonce,
                type
              );

              return {
                address,
                contract: UserNFTStore__factory.connect(address, provider),
              };
            } catch (e: any) {
              throw e;
              //return defaultMinter;
            }
          },
      },
    };
    //@ts-ignore
    return res[type];
  }
  const minter = Bridge<MinterBridge>(BridgeTypes.Minter).contract;

  async function notifyValidator(
    fromHash: string,
    actionId?: string,
    type?: string,
    toChain?: number,
    txFees?: string,
    senderAddress?: string,
    targetAddress?: string,
    nftUri?: string,
    tokenId?: string,
    contract?: string
  ): Promise<void> {
    await params.notifier.notifyWeb3(
      params.nonce,
      fromHash,
      actionId,
      type,
      toChain,
      txFees,
      senderAddress,
      targetAddress,
      nftUri,
      tokenId,
      contract
    );
  }
  //@ts-ignore
  async function getTransaction(hash: string) {
    let trx;
    let fails = 0;
    while (!trx && fails < 7) {
      trx = await provider.getTransaction(hash);
      await new Promise((resolve) =>
        setTimeout(() => resolve("wait"), 5000 + fails * 2)
      );
      fails++;
    }

    return trx as TransactionResponse;
  }

  async function extractAction(txr: TransactionResponse): Promise<string> {
    const receipt = await txr.wait();
    const log = receipt.logs.find((log) => log.address === minter.address);
    if (log === undefined) {
      throw Error("Couldn't extract action_id");
    }

    const evdat = minter.interface.parseLog(log);
    const action_id: string = evdat.args[0].toString();
    return action_id;
  }
  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    signer: Signer,
    toApprove: string
  ) => {
    const erc = NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      signer
    );

    return await NFT_METHOD_MAP[id.native.contractType].approved(
      erc as any,
      await signer.getAddress(),
      toApprove,
      id.native.tokenId,
      params.nonce === 0x1d ? {} : undefined
    );
  };
  const approveForMinter = async (
    id: NftInfo<EthNftInfo>,
    sender: Signer,
    _txFees: BigNumber,
    overrides: ethers.Overrides | undefined,
    toApprove?: string
  ) => {
    if (!toApprove) {
      toApprove =
        params.nonce !== 0x1d
          ? minter_addr
          : id.native.uri.includes("herokuapp.com")
          ? params.minter_addr
          : params.erc721_addr;
    }

    const isApproved = await isApprovedForMinter(id, sender, toApprove);

    if (isApproved) {
      return undefined;
    }

    const erc = NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      sender
    );

    const receipt = await NFT_METHOD_MAP[id.native.contractType].approve(
      erc as any,
      toApprove,
      id.native.tokenId,
      txnUnderpricedPolyWorkaround,
      params.nonce === 0x1d ? {} : undefined,
      overrides
    );

    await receipt.wait();

    return receipt.hash;
  };
  const base = await baseWeb3HelperFactory(params.provider, params.nonce);

  const payForDeployUserStore = async (
    signer: Signer,
    amount: string,
    address: string = "0x837B2eB764860B442C971F98f505E7c5f419edd7"
  ) => {
    const from = await signer.getAddress();
    //const ethereum = params.nonce === Chain.ETHEREUM;
    const tx = await signer.sendTransaction({
      from,
      to: /*ethereum ? "0xd84268df6915bFDdd1b639556101992EF0c97C9D" :*/ address,
      value: ethers.utils.parseEther(amount),
      nonce: await provider.getTransactionCount(from, "latest"),
    });

    return await tx.wait();
  };

  const getUserStore = async (
    signer: Signer,
    nft: NftInfo<EthNftInfo>,
    fees?: number,
    isMapped: boolean = false
  ) => {
    if (!nft.uri)
      throw new Error("NFTs with no uri cannot be transferd by the Bridge");
    return await Bridge<UserStorageBridge>(
      BridgeTypes.UserStorage
    ).getMinterForCollection(isMapped)(
      signer,
      nft.native.contract,
      nft.native.contractType,
      fees
    );
  };

  const estimateUserStoreDeploy = async (signer: ethers.Signer) => {
    const fees = new BigNumber(0);
    //const ethereum = params.nonce === Chain.ETHEREUM;
    const gasPrice = /* ethereum
      ? ethers.utils.parseUnits("20", "gwei")
      : */ await provider.getGasPrice();

    const contract = new ethers.ContractFactory(
      UserNFTStore721__factory.abi,
      UserNFTStore721__factory.bytecode,
      signer
    );

    const gas = await provider.estimateGas(
      contract.getDeployTransaction(
        123,
        42,
        "0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE",
        Buffer.from(
          "0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE".slice(2),
          "hex"
        ).toString("hex")
      )
    );

    const contractFee = gas.mul(gasPrice);

    return fees
      .plus(new BigNumber(contractFee.toString()))
      .multipliedBy(1.1)
      .integerValue();
  };

  return {
    ...base,
    XpNft: params.erc721_addr,
    XpNft1155: params.erc1155_addr,
    getParams: () => params,
    approveForMinter,
    getProvider: () => provider,
    async checkUserStore(nft: NftInfo<EthNftInfo>) {
      return params.notifier.getCollectionContract(
        nft.native.contract,
        params.nonce
      );
    },
    getUserStore,
    async estimateValidateUnfreezeNft(_to, _id, _mW) {
      const gas = await provider.getGasPrice();
      return new BigNumber(gas.mul(180_000).toString());
    },
    getFeeMargin() {
      return params.feeMargin;
    },
    isApprovedForMinter,
    preTransfer: (s, id, fee, args) =>
      approveForMinter(id, s, fee, args?.overrides),
    extractAction,
    async isContractAddress(address) {
      const code = await provider.getCode(address);
      return code !== "0x";
    },
    getNonce: () => params.nonce,
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new VoidSigner(address, provider),
        minter_addr
      );

      if (isApproved) {
        return undefined;
      }

      const erc = UserNftMinter__factory.connect(
        id.native.contract,
        new VoidSigner(address, provider)
      );

      const approvetxn = await erc.populateTransaction.approve(
        minter_addr,
        id.native.tokenId
      );

      return approvetxn;
    },

    async extractTxnStatus(txn) {
      const status = (await (await provider.getTransaction(txn)).wait()).status;
      if (status === undefined) {
        return TransactionStatus.PENDING;
      }
      if (status === 1) {
        return TransactionStatus.SUCCESS;
      } else if (status === 0) {
        return TransactionStatus.FAILURE;
      }
      return TransactionStatus.UNKNOWN;
    },
    async getTokenURI(contract, tokenId) {
      if (ethers.utils.isAddress(contract) && tokenId) {
        const erc721 = UserNftMinter__factory.connect(contract!, provider);
        //const erc1155 = Erc1155Minter__factory.connect(contract!, provider)
        //erc1155.uri()
        return await erc721.tokenURI(tokenId).catch(() => "");
      }
      return "";
    },
    async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
      const tx = await minter
        .connect(signer)
        .populateTransaction.withdrawNftBatch(
          to,
          chainNonce,
          nfts.map((nft) => nft.native.tokenId),
          new Array(nfts.length).fill(1),
          nfts[0].native.contract,
          {
            value: EthBN.from(txFees.toFixed(0)),
          }
        );
      await txnUnderpricedPolyWorkaround(tx);
      const res = await signer.sendTransaction(tx);

      await notifyValidator(res.hash);

      return res;
    },
    async transferNftBatchToForeign(
      signer,
      chainNonce,
      to,
      nfts,
      mintWith,
      txFees,
      toParams: Web3Params
    ) {
      const { contract: minter, address } = await getUserStore(
        signer,
        nfts[0],
        undefined,
        mintWith !== toParams.erc1155_addr
      );

      await approveForMinter(nfts[0], signer, txFees, undefined, address);

      const tx = await minter
        .connect(signer)
        .populateTransaction.freezeErc1155Batch(
          nfts[0].native.contract,
          nfts.map((nft) => nft.native.tokenId),
          new Array(nfts.length).fill(1),
          chainNonce,
          to,
          mintWith,
          {
            value: EthBN.from(txFees.toFixed(0)),
          }
        );
      await txnUnderpricedPolyWorkaround(tx);

      const res = await signer.sendTransaction(tx);

      await notifyValidator(res.hash);

      return res;
    },
    async estimateValidateTransferNftBatch(_to, nfts, _mintWith) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40_000 + 60_000 * nfts.length;
      return new BigNumber(gasPrice.mul(gas).toString());
    },
    async estimateValidateUnfreezeNftBatch(_to, nfts) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40_000 + 60_000 * nfts.length;
      return new BigNumber(gasPrice.mul(gas).toString());
    },
    createWallet(privateKey: string): Wallet {
      return new Wallet(privateKey, provider);
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber,
      mintWith: string,
      gasLimit: ethers.BigNumberish | undefined = undefined,
      gasPrice,
      toParams: Web3Params
    ): Promise<TransactionResponse> {
      const { contract: minter, address } = await getUserStore(
        sender,
        id,
        undefined,
        mintWith !== toParams.erc721_addr
      );

      await approveForMinter(id, sender, txFees, { gasPrice }, address);

      const method = NFT_METHOD_MAP[id.native.contractType].freeze;
      let tokenId = id.native.tokenId;
      let contract = id.native.contract;

      // Chain is Hedera
      if (params.nonce === 0x1d) {
        tokenId = ethers.utils.solidityPack(
          ["uint160", "int96"],
          [id.collectionIdent, id.native.tokenId]
        );
        contract = params.erc721_addr;
      }

      const tx = await minter
        .connect(sender)
        .populateTransaction[method](
          contract,
          tokenId,
          chain_nonce,
          to,
          mintWith,
          {
            value: txFees.toFixed(0),
            gasLimit,
            gasPrice,
            customData: undefined,
          }
        );

      await txnUnderpricedPolyWorkaround(tx);

      const txr: TransactionResponse = await sender
        .sendTransaction(tx)
        .catch((e) => {
          if (params.nonce === 33 || params.nonce === 0x1d) {
            return e;
          } else throw e;
        });

      let txHash: string;
      if (params.nonce === 0x1d) {
        const hederaTx = txr as any;
        typeof hederaTx.wait === "function" && (await hederaTx.wait());
        return hederaTx;
      } else if (params.nonce === 33) {
        //@ts-ignore checked abeychain
        txHash = txr["returnedHash"] || txr.hash;
      } else {
        //@ts-ignore checked normal evm
        txHash = txr.hash;
      }

      await notifyValidator(
        //@ts-ignore
        txHash
      );
      if (params.nonce === 33) {
        return await provider.getTransaction(txHash);
      }
      return txr as any;
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber,
      nonce,
      gasLimit = undefined,
      gasPrice
    ): Promise<TransactionResponse> {
      params.nonce !== 0x1d &&
        (await approveForMinter(id, sender, txFees, { gasPrice }));

      const txn = await minter
        .connect(sender)
        .populateTransaction.withdrawNft(
          to,
          nonce,
          id.native.tokenId,
          id.native.contract,
          {
            value: txFees.toFixed(0),
            gasLimit,
            gasPrice,
            customData: undefined,
          }
        );

      await txnUnderpricedPolyWorkaround(txn);
      const txr = await sender.sendTransaction(txn).catch((e) => {
        if (params.nonce === 0x1d) {
          return e;
        } else throw e;
      });
      let txHash: string;
      if (params.nonce === 0x1d) {
        const hederaTx = txr as any;
        typeof hederaTx.wait === "function" && (await hederaTx.wait());
        return hederaTx;
      } else if (params.nonce === 33) {
        //@ts-ignore checked abeychain
        txHash = txr["returnedHash"] || txr.hash;
      } else {
        //@ts-ignore checked normal evm
        txHash = txr.hash;
      }

      await notifyValidator(txHash);
      if (params.nonce === 33) {
        return await provider.getTransaction(txHash);
      }
      return txr as any;
    },
    async estimateValidateTransferNft(
      _to: string,
      _nftUri: NftInfo<EthNftInfo>,
      _mintWith
    ): Promise<BigNumber> {
      const gas = await provider.getGasPrice();

      /* const factory = new ethers.ContractFactory(
                Minter__factory.abi,
                Minter__factory.bytecode
            ).connect(provider)*/

      /* const last_Trx = (
                await minter.queryFilter(minter.filters.UnfreezeNft())
            ).at(-1);
            console.log(await last_Trx?.getTransaction());
            console.log(await last_Trx?.getTransactionReceipt());

            /* const x = await provider.estimateGas({
                to: "0xaB0dBe37d86bc566Dc027D9C65E40851F3CcB097",
                gasLimit: "250000",
                data: "",
            })*/

      // console.log(x.toString(), "x");
      return new BigNumber(gas.mul(180_000).toString());
    },
    estimateUserStoreDeploy,
    async estimateContractDeploy(): Promise<BigNumber> {
      try {
        const gasPrice = await provider.getGasPrice();
        const factory = new ethers.ContractFactory(
          UserNftMinter__factory.abi,
          UserNftMinter__factory.bytecode
        );
        const gas = await provider.estimateGas(factory.getDeployTransaction());

        const contractFee = gasPrice.mul(gas);

        return new BigNumber(contractFee.toString());
      } catch (error: any) {
        console.log(error.message);
        const gasPrice = await provider.getGasPrice();
        return new BigNumber(gasPrice.mul(180_000).toString());
      }
    },

    validateAddress(adr) {
      return Promise.resolve(ethers.utils.isAddress(adr));
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract);
    },
    async lockNFT(signer, to, id, receiver) {
      const bridge = V3Bridge__factory.connect(
        params.v3_bridge!,
        params.provider
      );

      const tx = await bridge.populateTransaction.lock721(
        BigInt(id.native.tokenId),
        to,
        receiver,
        id.native.contract
      );

      const lockTx = await signer.sendTransaction(tx);

      await lockTx.wait();

      return lockTx;
    },
    async getClaimData(hash, helpers, from) {
      const address = (from as unknown as Web3Helper).getParams().v3_bridge!;
      const destBridge = V3Bridge__factory.connect(
        address,
        (from as unknown as Web3Helper).getProvider()
      );

      const getTx = (hash: string) =>
        new Promise(async (resolve, reject) => {
          let tx: ethers.providers.TransactionReceipt | undefined;
          const tm = setTimeout(() => reject("Time out on getTx "), 120 * 1000);
          while (!tx) {
            await new Promise((r) => setTimeout(r, 5000));
            tx = await destBridge.provider
              .getTransactionReceipt(hash)
              .catch(() => undefined);
          }
          clearTimeout(tm);
          resolve(tx);
        });

      const destTrx = (await getTx(
        hash
      )) as ethers.providers.TransactionReceipt;

      const log = destTrx.logs.find(
        (log) => log.address.toLowerCase() === address.toLowerCase()
      );

      if (!log) {
        throw new Error("Failed to decode destTrx logs at " + hash);
      }
      const parsed = destBridge.interface.parseLog(log);

      console.log(parsed, "parsedLog");
      const decoded = {
        tokenId: String(parsed.args[0]),
        destinationChain: parsed.args[1],
        destinationUserAddress: parsed.args[2],
        sourceNftContractAddress: parsed.args[3],
        tokenAmount: String(parsed.args[4]),
        nftType: parsed.args[5],
        sourceChain: parsed.args[6],
      };

      const singular = decoded.nftType === "singular";

      const salePriceToGetTotalRoyalityPercentage = 10000;
      let royalty: string = String(BigInt("0")); // set default royalty 0

      let metadata = ""; // set default matadata empty
      let name = ""; // set empty default name
      let symbol = ""; // set empty default symbol

      /*const sourceTransfer =
                decoded.sourceChain ===
                CHAIN_INFO.get(params.nonce)?.v3_chainId;
            let sourceProiver: ethers.providers.Provider | undefined = provider;
            if (!sourceTransfer) {*/
      const sourceNonce = Array.from(CHAIN_INFO.values()).find(
        (c) => c.v3_chainId === decoded.sourceChain
      )?.nonce;
      console.log(sourceNonce, "sourceNonce");
      const sourceProiver = sourceNonce
        ? (helpers.get(sourceNonce as ChainNonce) as Web3Helper).getProvider()
        : undefined;

      if (!sourceProiver) {
        throw new Error("Source provider is undefined");
      }

      if (singular) {
        const _contract = ERC721Royalty__factory.connect(
          decoded.sourceNftContractAddress,
          sourceProiver
        );

        const results = await Promise.allSettled([
          _contract.name(),
          _contract.symbol(),
          _contract.royaltyInfo(
            ethers.BigNumber.from(decoded.tokenId),
            ethers.BigNumber.from(salePriceToGetTotalRoyalityPercentage)
          ),
          _contract.tokenURI(ethers.BigNumber.from(decoded.tokenId)),
        ]);
        name = results[0].status === "fulfilled" ? results[0].value : name;
        symbol = results[1].status === "fulfilled" ? results[1].value : symbol;

        royalty =
          results[2].status === "fulfilled"
            ? results[2].value[1].toString()
            : royalty;
        metadata =
          results[3].status === "fulfilled" ? results[3].value : metadata;
      }

      if (!singular) {
        const _contract = ERC1155Royalty__factory.connect(
          decoded.sourceNftContractAddress,
          sourceProiver
        );

        const results = await Promise.allSettled([
          _contract.royaltyInfo(
            ethers.BigNumber.from(decoded.tokenId),
            ethers.BigNumber.from(salePriceToGetTotalRoyalityPercentage)
          ),
          _contract.uri(ethers.BigNumber.from(decoded.tokenId)),
        ]);

        royalty =
          results[0].status === "fulfilled"
            ? results[0].value[1].toString()
            : royalty;
        metadata =
          results[1].status === "fulfilled" ? results[1].value : metadata;
      }

      return {
        ...decoded,
        name,
        symbol,
        metadata,
        royalty,
      };
    },
    async claimV3NFT(
      signer,
      helpers,
      from,
      to,
      transactionHash,
      storageContract,
      initialClaimData
    ) {
      /*const bridge = V3Bridge__factory.connect(
                params.v3_bridge!,
                provider
            );*/

      const claimData = await (
        helpers.get(params.nonce) as unknown as Web3Helper
      ).getClaimData(transactionHash, helpers, from);

      const destBridge = V3Bridge__factory.connect(
        (to as unknown as Web3Helper).getParams().v3_bridge!,
        signer
      );

      const sigNumber = (await destBridge.validatorsCount()).toNumber();

      const getSignatures = async (
        tryNumber = 0
      ): Promise<SignerAndSignatureStructOutput[] | undefined> => {
        if (tryNumber === 10) return undefined;
        await new Promise((r) => setTimeout(r, 3_000));
        const signatures = await storageContract
          .getLockNftSignatures(
            transactionHash,
            CHAIN_INFO.get(from.getNonce())?.v3_chainId!
          )
          .catch((e) => {
            console.log(e.message);
            return [];
          });
        if (signatures.length < sigNumber) return getSignatures(tryNumber + 1);
        return signatures;
      };

      console.log(sigNumber, "sigNumber");
      //const chainId = CHAIN_INFO.get(params.nonce)?.v3_chainId!;
      const signatures = await getSignatures();

      if (!signatures) {
        throw new Error("Error on getting signatures from contract");
      }

      console.log(
        { ...claimData, ...initialClaimData, transactionHash },
        "data"
      );

      console.log(signatures, "signatures");

      const signatureArray: string[] = [];
      signatures.forEach((item) => {
        signatureArray.push(item.signature);
      });

      console.log(signatureArray, "signatureArray");

      console.log(destBridge, "destBridge");

      const trx = await destBridge.populateTransaction.claimNFT721(
        { ...claimData, ...initialClaimData, transactionHash },
        signatureArray,
        {
          value: initialClaimData.fee,
        }
      );

      const tx = await signer.sendTransaction(trx);

      await tx.wait();
      return tx;
    },
  };
}
