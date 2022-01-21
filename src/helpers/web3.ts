/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import {
  TransferForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  BalanceCheck,
  TransferNftForeign,
  WrappedBalanceCheck,
  BatchWrappedBalanceCheck,
  MintNft,
  WrappedNftCheck,
} from "./chain";
import {
  Signer,
  BigNumber as EthBN,
  PopulatedTransaction,
  Wallet,
  ethers,
  VoidSigner,
} from "ethers";
import { TransactionResponse, Provider } from "@ethersproject/providers";
import {
  Minter__factory,
  UserNftMinter__factory,
  XPNet__factory,
} from "xpnet-web3-contracts";
import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  extractWrappedMetadata,
  MintRawTxn,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  TransactionStatus,
  TransferNftForeignUnsigned,
  UnfreezeForeignNftUnsigned,
  ValidateAddress,
} from "..";
import { NftMintArgs } from "..";
import axios from "axios";
import { Erc721MetadataEx, Erc721WrappedData } from "../erc721_metadata";
type EasyBalance = string | number | EthBN;
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
export type BaseWeb3Helper = BalanceCheck<string, BigNumber> &
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
  WrappedBalanceCheck<string, BigNumber> &
  BatchWrappedBalanceCheck<string, BigNumber> &
  TransferForeign<Signer, string, BigNumber, TransactionResponse> &
  TransferNftForeign<
    Signer,
    string,
    BigNumber,
    EthNftInfo,
    TransactionResponse
  > &
  UnfreezeForeign<Signer, string, EasyBalance> &
  UnfreezeForeignNft<
    Signer,
    string,
    BigNumber,
    EthNftInfo,
    TransactionResponse
  > &
  WrappedNftCheck<EthNftInfo> &
  EstimateTxFees<BigNumber, string> &
  ChainNonceGet &
  IsApproved<Signer> &
  Approve<Signer> &
  ValidateAddress &
  ExtractAction<TransactionResponse> & {
    createWallet(privateKey: string): Wallet;
  } & Pick<PreTransfer<Signer, EthNftInfo, string>, "preTransfer"> &
  UnfreezeForeignNftUnsigned<
    string,
    BigNumber,
    EthNftInfo,
    PopulatedTransaction
  > &
  TransferNftForeignUnsigned<
    string,
    BigNumber,
    EthNftInfo,
    PopulatedTransaction
  > &
  PreTransferRawTxn<EthNftInfo, PopulatedTransaction> &
  ExtractTxnStatus &
  MintRawTxn<PopulatedTransaction>;

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
      const factory = new UserNftMinter__factory(owner);
      const contract = await factory.deploy();

      return contract.address;
    },
    async mintNft(
      owner: Signer,
      { contract, uris }: NftMintArgs
    ): Promise<string> {
      const erc721 = UserNftMinter__factory.connect(contract!, owner);

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
  middleware_uri: string;
  minter_addr: string;
  erc1155_addr: string;
  erc721_addr: string;
  validators: string[];
  nonce: number;
}

export async function web3HelperFactory(
  params: Web3Params
): Promise<Web3Helper> {
  const w3 = params.provider;
  const { minter_addr, provider, erc1155_addr } = params;
  const minter = Minter__factory.connect(minter_addr, provider);
  const erc1155 = XPNet__factory.connect(erc1155_addr, provider);

  const event_middleware = axios.create({
    baseURL: params.middleware_uri,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async function notifyValidator(hash: string): Promise<void> {
    await event_middleware.post("/tx/web3", {
      chain_nonce: params.nonce,
      tx_hash: hash,
    });
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

  const randomAction = () =>
    EthBN.from(
      Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
    );

  async function estimateGas(
    addrs: string[],
    utx: PopulatedTransaction
  ): Promise<BigNumber> {
	utx.from = addrs[0];
	let td = await w3.estimateGas(utx);
	const fee = td.mul(addrs.length+1).mul(await w3.getGasPrice());

    return new BigNumber(fee.toString());
  }

  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    signer: Signer
  ) => {
    const erc = UserNftMinter__factory.connect(id.native.contract, signer);
    const approvedAddress = await erc.getApproved(id.native.tokenId);
    if (approvedAddress === minter_addr) {
      return true;
    }
    return false;
  };

  const approveForMinter = async (id: NftInfo<EthNftInfo>, sender: Signer) => {
    const isApproved = await isApprovedForMinter(id, sender);
    const erc = UserNftMinter__factory.connect(id.native.contract, sender);
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
    isApprovedForMinter,
    preTransfer: (s, id, _fee) => approveForMinter(id, s),
    extractAction,
    getNonce: () => params.nonce,
    async balanceWrapped(
      address: string,
      chain_nonce: number
    ): Promise<BigNumber> {
      const bal = await erc1155.balanceOf(address, chain_nonce);

      return new BigNumber(bal.toString());
    },
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new VoidSigner(address, provider)
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
    isWrappedNft(nft) {
      return (
        nft.native.contract.toLowerCase() === params.erc721_addr.toLowerCase()
      );
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
    async unfreezeWrappedNftTxn(to, id, txFees, _sender) {
      const res = await minter.populateTransaction.withdrawNft(
        to,
        id.native.tokenId,
        {
          value: EthBN.from(txFees.toString()),
        }
      );
      return res;
    },
    createWallet(privateKey: string): Wallet {
      return new Wallet(privateKey, provider);
    },
    async balanceWrappedBatch(
      address: string,
      chain_nonces: number[]
    ): Promise<Map<number, BigNumber>> {
      const bals: EthBN[] = await erc1155.balanceOfBatch(
        Array(chain_nonces.length).fill(address),
        chain_nonces
      );

      return new Map(
        bals.map((v, i) => [chain_nonces[i], new BigNumber(v.toString())])
      );
    },
    async mintRawTxn(nft, sender) {
      const erc721 = UserNftMinter__factory.connect(
        nft.contract!,
        new VoidSigner(sender)
      );

      const txm = await erc721.populateTransaction.mint(nft.uris[0]);
      return txm;
    },
    async transferNativeToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: BigNumber,
      txFees: BigNumber
    ): Promise<TransactionResponse> {
      const val = EthBN.from(value.toString());
      const totalVal = val.add(EthBN.from(txFees.toString()));
      const res = await minter.connect(sender).freeze(chain_nonce, to, val, {
        value: totalVal,
      });
      return res;
    },
    async transferNftToForeignTxn(
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber,
      _sender
    ) {
      const txr = await minter.populateTransaction.freezeErc721(
        id.native.contract,
        id.native.tokenId,
        chain_nonce,
        to,
        {
          value: EthBN.from(txFees.toString()),
        }
      );
      return txr;
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
          value: EthBN.from(txFees.toString()),
        });

      await notifyValidator(txr.hash);
      return txr;
    },
    async unfreezeWrapped(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<string> {
      const res = await minter
        .connect(sender)
        .withdraw(chain_nonce, to, value, {
          value: EthBN.from(txFees.toString()),
        });

      return res.hash;
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
          value: EthBN.from(txFees.toString()),
        });

      await notifyValidator(res.hash);

      return res;
    },
    async estimateValidateTransferNft(
      to: string,
      nftUri: NftInfo<string>
    ): Promise<BigNumber> {
      const utx = await minter.populateTransaction.validateTransferNft(
        randomAction(),
        to,
        nftUri.uri
      );

      return await estimateGas(params.validators, utx);
    },
    async estimateValidateUnfreezeNft(
      to: string,
      nft: NftInfo<any>
    ): Promise<BigNumber> {
      const wrappedData = await extractWrappedMetadata(nft);

      const utx = await minter.populateTransaction.validateUnfreezeNft(
        randomAction(),
        to,
        EthBN.from(wrappedData.wrapped.tokenId),
        wrappedData.wrapped.contract
      );

      return await estimateGas(params.validators, utx);
    },
    validateAddress(adr) {
      return Promise.resolve(ethers.utils.isAddress(adr));
    },
  };
}
