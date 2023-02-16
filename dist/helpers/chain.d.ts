import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { ChainNonce } from "../type-utils";
/**
 * NFT Info
 */
export declare type NftInfo<Raw> = {
  readonly uri: string;
  readonly native: Raw;
  readonly collectionIdent: string;
};
/**
 * Action to perform before transfer/unfreeze (if any)
 */
export interface PreTransfer<Signer, Nft, Ret, ExtraArgs> {
  preTransfer(
    sender: Signer,
    nft: NftInfo<Nft>,
    fee: BigNumber,
    args?: ExtraArgs
  ): Promise<Ret | undefined>;
  preUnfreeze(
    sender: Signer,
    nft: NftInfo<Nft>,
    fee: BigNumber,
    args?: ExtraArgs
  ): Promise<Ret | undefined>;
}
/**
 * Transfer NFT to a foreign chain, freezing the original one
 *
 * @param sender  Account which owns the NFT on the native chain, able to sign transactions
 * @param chain_nonce  Nonce of the target chain
 * @param to  Address of the receiver on the foreign chain
 * @param id  Information required to freeze this nft
 *
 * @returns Transaction and the Identifier of this action to track the status
 */
export interface TransferNftForeign<Signer, RawNft, Resp> {
  transferNftToForeign(
    sender: Signer,
    chain_nonce: number,
    to: string,
    id: NftInfo<RawNft>,
    txFees: BigNumber,
    mintWith: string,
    gasLimit?: ethers.BigNumberish | undefined,
    gasPrice?: ethers.BigNumberish | undefined
  ): Promise<Resp>;
}
/**
 * Unfreeze native NFT existing on a foreign chain(Send back NFT)
 * chain_nonce is automatically derived
 *
 * @param sender  Account which owns the wrapped NFT on this chain, able to sign transactions
 * @param to  Address of the receiver on the original chain
 * @param id  Information required to unfreeze this nft
 *
 * @returns Transaction and the Identifier of this action to track the status
 */
export interface UnfreezeForeignNft<Signer, RawNft, Resp> {
  unfreezeWrappedNft(
    sender: Signer,
    to: string,
    id: NftInfo<RawNft>,
    txFees: BigNumber,
    nonce: string,
    gasLimit: ethers.BigNumberish | undefined,
    gasPrice: ethers.BigNumberish | undefined
  ): Promise<Resp>;
}
/**
 * Get the balance of an address on the chain
 */
export interface BalanceCheck {
  balance(address: string): Promise<BigNumber>;
}
/**
 * Create a new NFT on this chain
 *
 * @param options Arguments required to mint the nft
 */
export interface MintNft<Signer, Args, Identifier> {
  mintNft(owner: Signer, options: Args): Promise<Identifier>;
}
export interface ValidateAddress {
  validateAddress(adr: string): Promise<boolean>;
}
export interface EstimateTxFees<RawNftF> {
  estimateValidateTransferNft(
    to: string,
    metadata: NftInfo<RawNftF>,
    mintWith: string
  ): Promise<BigNumber>;
  estimateValidateUnfreezeNft(
    to: string,
    metadata: NftInfo<RawNftF>,
    mintWith: string
  ): Promise<BigNumber>;
}
export declare function ConcurrentSendError(): Error;
export interface PreTransferRawTxn<NativeNft, Ret> {
  preTransferRawTxn(
    id: NftInfo<NativeNft>,
    address: string,
    value?: BigNumber
  ): Promise<Ret | undefined>;
}
export interface ChainNonceGet {
  getNonce(): ChainNonce;
}
export interface ExtractAction<Txn> {
  extractAction(txn: Txn): Promise<string>;
}
export declare enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILURE = "failure",
  UNKNOWN = "unknown",
}
export interface ExtractTxnStatus {
  extractTxnStatus(txn: string): Promise<TransactionStatus>;
}
export interface GetTokenURI {
  getTokenURI(contract: string, tokenId: string): Promise<string>;
}
export interface TransferNftForeignBatch<Signer, RawNft, Resp> {
  transferNftBatchToForeign(
    sender: Signer,
    chain_nonce: number,
    to: string,
    id: NftInfo<RawNft>[],
    mintWith: string,
    txFees: BigNumber
  ): Promise<Resp>;
}
export interface UnfreezeForeignNftBatch<Signer, RawNft, Resp> {
  unfreezeWrappedNftBatch(
    sender: Signer,
    chainNonce: number,
    to: string,
    nfts: NftInfo<RawNft>[],
    txFees: BigNumber
  ): Promise<Resp>;
}
export interface EstimateTxFeesBatch<RawNftF> {
  estimateValidateTransferNftBatch(
    to: string,
    metadatas: NftInfo<RawNftF>[],
    mintWith: string[]
  ): Promise<BigNumber>;
  estimateValidateUnfreezeNftBatch(
    to: string,
    metadatas: NftInfo<RawNftF>[]
  ): Promise<BigNumber>;
}
export declare type WhitelistCheck<RawNft> = {
  isNftWhitelisted(nft: NftInfo<RawNft>): Promise<boolean>;
};
export interface GetProvider<Provider> {
  getProvider(): Provider;
}
export declare function isWrappedNft(nft: NftInfo<unknown>): Promise<boolean>;
export interface IsContractAddress {
  isContractAddress(address: string): Promise<boolean>;
}
export interface FeeMargins {
  min: number;
  max: number;
}
export interface GetFeeMargins {
  getFeeMargin(): FeeMargins;
}
export interface ClaimNFT<Signer, ClaimArgs, Ret> {
  claimNFT(signer: Signer, args: ClaimArgs): Promise<Ret>;
}
//# sourceMappingURL=chain.d.ts.map
