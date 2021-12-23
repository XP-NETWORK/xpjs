import BigNumber from "bignumber.js";
import { NftMintArgs } from "..";
/**
 * NFT Info
 */
export declare type NftInfo<Raw> = {
    readonly uri: string;
    readonly native: Raw;
};
/**
 * Transfer Liquidity to a foregin chain, freezing the original liquidity
 *
 * @param sender  Account which owns the liquidity on the native chain, able to sign transactions
 * @param chain_nonce  Nonce of the target chain
 * @param to  Address of the receiver on the foreign chain
 * @param value  Amount of liquidity to send
 *
 * @returns Transaction and the Identifier of this action to track the status
 */
export interface TransferForeign<Signer, ForeignAddr, Balance, Resp> {
    transferNativeToForeign(sender: Signer, chain_nonce: number, to: ForeignAddr, value: Balance, txFees: Balance): Promise<Resp>;
}
/**
 * Unfreeze native liquidity existing on a foreign chain(Send back Liquidity)
 *
 * @param sender  Account which owns the wrapped liquidity on this chain, able to sign transactions
 * @param chain_nonce  Nonce of the original chain
 * @param to  Address of the receiver on the original chain
 * @param value  Amount of liquidity to unfreeze
 *
 * @returns Transaction and the Identifier of this action to track the status
 */
export interface UnfreezeForeign<Signer, ForeignAddr, Balance> {
    unfreezeWrapped(sender: Signer, chain_nonce: number, to: ForeignAddr, value: Balance, txFees: Balance): Promise<string>;
}
/**
 * Action to perform before transfer/unfreeze (if any)
 */
export interface PreTransfer<Signer, Nft, Ret> {
    preTransfer(sender: Signer, nft: NftInfo<Nft>, fee: BigNumber): Promise<Ret | undefined>;
    preUnfreeze(sender: Signer, nft: NftInfo<Nft>, fee: BigNumber): Promise<Ret | undefined>;
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
export interface TransferNftForeign<Signer, ForeignAddr, Balance, RawNft, Resp> {
    transferNftToForeign(sender: Signer, chain_nonce: number, to: ForeignAddr, id: NftInfo<RawNft>, txFees: Balance): Promise<Resp>;
}
export interface TransferNftForeignUnsigned<ForeignAddr, Balance, RawNft, Resp> {
    transferNftToForeignTxn(chain_nonce: number, to: ForeignAddr, id: NftInfo<RawNft>, txFees: Balance, senderAddress: string): Promise<Resp>;
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
export interface UnfreezeForeignNft<Signer, ForeignAddr, Balance, RawNft, Resp> {
    unfreezeWrappedNft(sender: Signer, to: ForeignAddr, id: NftInfo<RawNft>, txFees: Balance): Promise<Resp>;
}
export interface UnfreezeForeignNftUnsigned<ForeignAddr, Balance, RawNft, Resp> {
    unfreezeWrappedNftTxn(to: ForeignAddr, id: NftInfo<RawNft>, txFees: Balance, sender: string): Promise<Resp>;
}
/**
 * Get the balance of an address on the chain
 */
export interface BalanceCheck<Addr, Balance> {
    balance(address: Addr): Promise<Balance>;
}
/**
 * Get the balance of a foreign token for an account in this chain
 *
 * @param address  Address of the user
 * @param chain_nonce  nonce of the foreign chain
 */
export interface WrappedBalanceCheck<Addr, Balance> {
    balanceWrapped(address: Addr, chain_nonce: number): Promise<Balance>;
}
/**
 * Get the balance of multiple foreign tokens for an account in this chain
 *
 * @param chain_nonces  list of foreign tokens to fetch
 * @returns Mapping of chain_nonce to balance
 */
export interface BatchWrappedBalanceCheck<Addr, Balance> {
    balanceWrappedBatch(address: Addr, chain_nonces: number[]): Promise<Map<number, Balance>>;
}
/**
 * Create a new NFT on this chain
 *
 * @param options Arguments required to mint the nft
 */
export interface MintNft<Signer, Args, Identifier> {
    mintNft(owner: Signer, options: Args): Promise<Identifier>;
}
/**
 * Whether the given NFT is from a foreign chain
 * @param {NftIdent} nft NFT Identity
 * @returns bool
 */
export interface WrappedNftCheck<RawNft> {
    isWrappedNft(nft: NftInfo<RawNft>): boolean;
}
export interface ValidateAddress {
    validateAddress(adr: string): Promise<boolean>;
}
export interface EstimateTxFees<Balance, RawNftF> {
    estimateValidateTransferNft(to: string, metadata: NftInfo<RawNftF>): Promise<Balance>;
    estimateValidateUnfreezeNft(to: string, metadata: NftInfo<RawNftF>): Promise<Balance>;
}
export declare function ConcurrentSendError(): Error;
export interface PreTransferRawTxn<NativeNft, Ret> {
    preTransferRawTxn(id: NftInfo<NativeNft>, address: string, value?: BigNumber): Promise<Ret | undefined>;
}
export interface MintRawTxn<Ret> {
    mintRawTxn(id: NftMintArgs, address: string, value?: BigNumber): Promise<Ret>;
}
export interface ChainNonceGet {
    getNonce(): number;
}
export interface ExtractAction<Txn> {
    extractAction(txn: Txn): Promise<string>;
}
export declare enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILURE = "failure",
    UNKNOWN = "unknown"
}
export interface ExtractTxnStatus {
    extractTxnStatus(txn: string): Promise<TransactionStatus>;
}
