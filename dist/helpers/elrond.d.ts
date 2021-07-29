import { Address, ISigner, Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import BigNumber from "bignumber.js";
import { BalanceCheck, GetLockedNft, ListNft, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft } from "./chain";
declare type EasyBalance = string | number | BigNumber;
export declare type NftInfo = {
    token: string;
    nonce: EasyBalance;
};
export declare type EsdtTokenInfo = {
    readonly balance: number;
    readonly tokenIdentifier: string;
};
declare type BEsdtNftInfo = {
    readonly creator: string;
    readonly name: string;
    readonly nonce: number;
    readonly royalties: string;
    readonly uris: string[];
};
export declare type EsdtNftInfo = EsdtTokenInfo & BEsdtNftInfo;
export declare type NftIssueArgs = {
    readonly identifier: string;
    readonly quantity: number | undefined;
    readonly name: string;
    readonly royalties: number | undefined;
    readonly hash: string | undefined;
    readonly attrs: string | undefined;
    readonly uris: Array<string>;
};
export interface IssueESDTNFT {
    issueESDTNft(sender: ISigner, name: string, ticker: string, canFreeze: boolean | undefined, canWipe: boolean | undefined, canTransferNFTCreateRole: boolean | undefined): Promise<void>;
}
export declare type ElrondHelper = BalanceCheck<string | Address, BigNumber> & TransferForeign<ISigner, string, EasyBalance, Transaction> & UnfreezeForeign<ISigner, string, EasyBalance, Transaction> & TransferNftForeign<ISigner, string, NftInfo, Transaction> & UnfreezeForeignNft<ISigner, string, number, Transaction> & IssueESDTNFT & MintNft<ISigner, NftIssueArgs, void> & ListNft<string, string, EsdtNftInfo> & GetLockedNft<NftInfo, EsdtNftInfo> & {
    unsignedTransferTxn(to: string, value: EasyBalance): Transaction;
    unsignedUnfreezeTxn(to: string, value: EasyBalance): Transaction;
    unsignedTransferNftTxn(address: Address, to: string, info: NftInfo): Transaction;
    unsignedUnfreezeNftTxn(address: Address, to: string, id: number): Transaction;
    unsignedMintNftTxn(owner: Address, args: NftIssueArgs): Transaction;
    handleTxnEvent(tx_hash: TransactionHash): Promise<void>;
};
export declare const elrondHelperFactory: (node_uri: string, minter_address: string, middleware_uri: string, esdt: string, esdt_nft: string) => Promise<ElrondHelper>;
export {};
