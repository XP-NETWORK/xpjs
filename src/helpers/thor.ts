/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import {
  UnfreezeForeignNft,
  BalanceCheck,
  TransferNftForeign,
  MintNft,
  GetProvider,
} from "./chain";
import {
  Signer,
  Wallet,
  ethers,
  VoidSigner,
  providers,
  Contract,
  ContractFactory,
} from "@vechain/ethers";
import { Transaction } from "@vechain/ethers/utils";
import { TransactionResponse, Provider } from "@vechain/ethers/providers";
import { Minter__factory, UserNftMinter__factory } from "xpnet-web3-contracts";
import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  TransactionStatus,
  ValidateAddress,
  WhitelistCheck,
} from "..";
import { NftMintArgs } from "..";
import { BigNumber as EthBN } from "ethers";
import { EvNotifier } from "../notifier";

/**
 * Information required to perform NFT transfers in this chain
 */
export type EthNftInfo = {
  chainId: string;
  tokenId: string;
  owner: string;
  uri: string;
  contract: string;
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
    sender: Sender
  ): Promise<boolean>;
}

export interface Approve<Sender> {
  approveForMinter(
    address: NftInfo<EthNftInfo>,
    sender: Sender
  ): Promise<string | undefined>;
}

/**
 * Base util traits
 */
export type BaseWeb3Helper = BalanceCheck &
  /**
   * Mint an nft in the given ERC1155 smart contract
   *
   * @argument signer  owner of the smart contract
   * @argument args  See [[MintArgs]]
   */
  MintNft<Signer, NftMintArgs, string> & {
    /**
     *
     * Deploy an ERC721 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: Signer): Promise<string>;
  };

/**
 * Traits implemented by this module
 */
export type Web3Helper = BaseWeb3Helper &
  TransferNftForeign<Signer, EthNftInfo, TransactionResponse> &
  UnfreezeForeignNft<Signer, EthNftInfo, TransactionResponse> &
  EstimateTxFees<EthNftInfo> &
  ChainNonceGet &
  IsApproved<Signer> &
  Approve<Signer> &
  ValidateAddress &
  ExtractAction<TransactionResponse> & {
    createWallet(privateKey: string): Wallet;
  } & Pick<PreTransfer<Signer, EthNftInfo, string>, "preTransfer"> &
  PreTransferRawTxn<EthNftInfo, Transaction> &
  ExtractTxnStatus &
  GetProvider<providers.Provider> &
  WhitelistCheck<EthNftInfo>;

/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
export async function baseWeb3HelperFactory(
  provider: Provider
): Promise<BaseWeb3Helper> {
  const w3 = provider;

  return {
    async balance(address: string): Promise<BigNumber> {
      const bal = await w3.getBalance(address);

      // ethers BigNumber is not compatible with our bignumber
      return new BigNumber(bal.toString());
    },
    async deployErc721(owner: Signer): Promise<string> {
      const factory = new ContractFactory(
        UserNftMinter__factory.abi,
        UserNftMinter__factory.bytecode,
        owner
      );
      const contract = await factory.deploy();

      return contract.address;
    },
    async mintNft(
      owner: Signer,
      { contract, uris }: NftMintArgs
    ): Promise<string> {
      const erc721 = new Contract(contract!, UserNftMinter__factory.abi, owner);

      const txm = await erc721.mint(uris[0]);
      const receipt = await txm.wait();
      return receipt.transactionHash;
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
  validators: string[];
  nonce: number;
}

export async function web3HelperFactory(
  params: Web3Params
): Promise<Web3Helper> {
  const w3 = params.provider;
  const { minter_addr, provider } = params;
  const minter = new Contract(minter_addr, Minter__factory.abi, provider);

  async function notifyValidator(hash: string): Promise<void> {
    await params.notifier.notifyWeb3(params.nonce, hash);
  }

  async function extractAction(txr: TransactionResponse): Promise<string> {
    const receipt = await txr.wait();
    const log = receipt.logs!.find((log) => log.address === minter.address);
    if (log === undefined) {
      throw Error("Couldn't extract action_id");
    }

    const evdat = minter.interface.parseLog(log);
    const action_id: string = evdat.topic[0].toString();
    return action_id;
  }

  const randomAction = () =>
    new BigNumber(
      Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
    );

  async function estimateGas(
    addrs: string[],
    utx: Transaction
  ): Promise<BigNumber> {
    utx.from = addrs[0];
    let td = await w3.estimateGas(utx);
    const fee = td.mul(addrs.length + 1).mul(await w3.getGasPrice());

    return new BigNumber(fee.toString());
  }

  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    signer: Signer
  ) => {
    const erc = new Contract(
      id.native.contract,
      UserNftMinter__factory.abi,
      signer
    );
    const approvedAddress = await erc.getApproved(id.native.tokenId);
    if (approvedAddress === minter_addr) {
      return true;
    }
    return false;
  };

  const approveForMinter = async (id: NftInfo<EthNftInfo>, sender: Signer) => {
    const isApproved = await isApprovedForMinter(id, sender);
    const erc = new Contract(
      id.native.contract,
      UserNftMinter__factory.abi,
      sender
    );
    if (isApproved) {
      return undefined;
    }

    const receipt = await erc.approve(minter_addr, id.native.tokenId);
    await receipt.wait();
    return receipt.hash;
  };

  const base = await baseWeb3HelperFactory(params.provider);

  return {
    ...base,
    approveForMinter,
    getProvider: () => provider,
    isApprovedForMinter,
    preTransfer: (s, id, _fee) => approveForMinter(id, s),
    extractAction,
    // TODO
    getNonce: () => params.nonce as any,
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new VoidSigner(address, provider)
      );

      if (isApproved) {
        return undefined;
      }

      const erc = new Contract(
        id.native.contract,
        UserNftMinter__factory.abi,
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
    createWallet(privateKey: string): Wallet {
      return new Wallet(privateKey, provider);
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<TransactionResponse> {
      await approveForMinter(id, sender);

      const txr = await minter
        .connect(sender)
        .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to, {
          value: EthBN.from(txFees.toString(10)),
        });

      await notifyValidator(txr.hash);
      return txr;
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<TransactionResponse> {
      const res = await minter
        .connect(sender)
        .withdrawNft(to, id.native.tokenId, {
          value: EthBN.from(txFees.toString(10)),
        });

      await notifyValidator(res.hash);

      return res;
    },
    async estimateValidateTransferNft(
      to: string,
      nftUri: NftInfo<unknown>
    ): Promise<BigNumber> {
      const utx = await minter.populateTransaction.validateTransferNft(
        randomAction(),
        to,
        nftUri.uri
      );

      return await estimateGas(params.validators, utx);
    },
    async estimateValidateUnfreezeNft(
      _to: string,
      _nft: NftInfo<any>
    ): Promise<BigNumber> {
      // TODO
      return new BigNumber(0);
    },
    validateAddress(adr) {
      return Promise.resolve(ethers.utils.getAddress(adr) !== undefined);
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract);
    },
  };
}
