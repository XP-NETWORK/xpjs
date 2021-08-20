/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
import { Address, ISigner, Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import BigNumber from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, GetLockedNft, ListNft, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft } from "./chain";
declare type EasyBalance = string | number | BigNumber;
/**
 * Information required to perform NFT transfers in this chain
 */
export declare type NftInfo = {
    token: string;
    nonce: EasyBalance;
};
/**
 * Information associated with an ESDT Token
 */
export declare type EsdtTokenInfo = {
    readonly balance: string;
    readonly tokenIdentifier: string;
};
declare type BEsdtNftInfo = {
    readonly creator: string;
    readonly name: string;
    readonly nonce: number;
    readonly royalties: string;
    readonly uris: string[];
};
/**
 * Information associated with an ESDT NFT
 */
export declare type EsdtNftInfo = EsdtTokenInfo & BEsdtNftInfo;
/**
 * arguments required to issue an NFT
 */
export declare type NftIssueArgs = {
    readonly identifier: string;
    readonly quantity: number | undefined;
    readonly name: string;
    readonly royalties: number | undefined;
    readonly hash: string | undefined;
    readonly attrs: string | undefined;
    readonly uris: Array<string>;
};
/**
 * Utility for issuing ESDT which supports NFT minting
 */
export interface IssueESDTNFT {
    /**
     * Unsigned Transaction for [[issueESDTNft]]
     */
    unsignedIssueESDTNft(name: string, ticker: string, canFreeze: boolean | undefined, canWipe: boolean | undefined, canTransferNFTCreateRole: boolean | undefined): Transaction;
    /**
     * Issue a new ESDT supporting NFTs
     *
     * @param sender  Owner of this ESDT
     * @param name  Name of the ESDT
     * @param ticker  Ticker of the ESDT
     * @param canFreeze  Wheteher this ESDT can be frozen
     * @param canWipe  Whether this ESDT can be wiped
     * @param canTransferNFTCreateRole  Whether the NFT Creation role can be transferred
     */
    issueESDTNft(sender: ISigner, name: string, ticker: string, canFreeze: boolean | undefined, canWipe: boolean | undefined, canTransferNFTCreateRole: boolean | undefined): Promise<void>;
}
/**
 * Possible roles for an ESDT
 *
 * ESDTRoleNFTCreate: Allow creating NFTs
 * ESDTRoleNFTBurn: Allow burning NFTs
 * ESDTRoleNFTAddQuanitity: Allowing minting >1 NFTs (SFT)
 */
export declare type ESDTRole = "ESDTRoleNFTCreate" | "ESDTRoleNFTBurn" | "ESDTRoleNFTAddQuantity";
/**
 * Utility for setting ESDT roles
 */
export interface SetESDTRoles {
    /**
     * Unsigned Transaction for [[setESDTRole]]
     */
    unsignedSetESDTRoles(token: string, target: Address, roles: [ESDTRole]): Transaction;
    /**
     *
     * Set the roles for a given account for an esdt
     *
     * @param sender  Target account
     * @param token  ESDT Identifier
     * @param roles  Roles to set
     */
    setESDTRole(sender: ISigner, token: string, roles: [ESDTRole]): Promise<void>;
}
/**
 * Identifier for tracking a given action
 */
declare type EventIdent = number;
/**
 * Traits implemented by this module
 */
export declare type ElrondHelper = BalanceCheck<string | Address, BigNumber> & BatchWrappedBalanceCheck<string | Address, BigNumber> & TransferForeign<ISigner, string, EasyBalance, Transaction, EventIdent> & UnfreezeForeign<ISigner, string, EasyBalance, Transaction, EventIdent> & TransferNftForeign<ISigner, string, NftInfo, Transaction, EventIdent> & UnfreezeForeignNft<ISigner, string, number, Transaction, EventIdent> & IssueESDTNFT & MintNft<ISigner, NftIssueArgs, void> & ListNft<string, string, EsdtNftInfo> & GetLockedNft<NftInfo, EsdtNftInfo> & {
    /**
     * Unsigned Transaction for [[TransferForeign]]
     */
    unsignedTransferTxn(chain_nonce: number, to: string, value: EasyBalance): Transaction;
    /**
     * Unsigned Transaction for [[UnfreezeForeign]]
     */
    unsignedUnfreezeTxn(chain_nonce: number, address: Address, to: string, value: EasyBalance): Transaction;
    /**
     * Unsigned Transaction for [[TransferNftForeign]]
     */
    unsignedTransferNftTxn(chain_nonce: number, address: Address, to: string, info: NftInfo): Transaction;
    /**
     * Unsigned Transaction for [[UnfreezeForeignNft]]
    */
    unsignedUnfreezeNftTxn(address: Address, to: string, id: number): Transaction;
    /**
     * Unsigned transaction for Minting an NFT
     */
    unsignedMintNftTxn(owner: Address, args: NftIssueArgs): Transaction;
    /**
     * Handle a cross chain action, required to be called after sending an unsigned transaction
     * @param tx_hash Hash of the transaction to be handled
     */
    handleTxnEvent(tx_hash: TransactionHash): Promise<EventIdent>;
    /**
     * Raw result of a transaction
     *
     * @param tx_hash  Hash of the transaction
     */
    rawTxnResult(tx_hash: TransactionHash): Promise<Object>;
};
/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt  Identifier of the ESDT Wrapper
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export declare const elrondHelperFactory: (node_uri: string, minter_address: string, middleware_uri: string, esdt: string, esdt_nft: string) => Promise<ElrondHelper>;
export {};
