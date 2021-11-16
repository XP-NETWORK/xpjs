/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
import { Address, ExtensionProvider, ISigner, Transaction, WalletConnectProvider } from "@elrondnetwork/erdjs";
import BigNumber from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, WrappedNftCheck } from "./chain";
import { ChainNonceGet, ValidateAddress } from "..";
import { NftMintArgs } from "..";
declare type ElrondSigner = ISigner | ExtensionProvider | WalletConnectProvider;
/**
 * Information associated with an ESDT Token
 */
export declare type EsdtTokenInfo = {
    readonly balance: 1 | string;
    readonly tokenIdentifier: string;
};
declare type BEsdtNftInfo = {
    readonly attributes?: string[];
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
     *
     * @returns ticker of the esdt
     */
    issueESDTNft(sender: ElrondSigner, name: string, ticker: string, canFreeze: boolean | undefined, canWipe: boolean | undefined, canTransferNFTCreateRole: boolean | undefined): Promise<string>;
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
    setESDTRole(sender: ElrondSigner, token: string, roles: [ESDTRole]): Promise<void>;
}
/**
 * Traits implemented by this module
 */
export declare type ElrondHelper = BalanceCheck<string | Address, BigNumber> & BatchWrappedBalanceCheck<string | Address, BigNumber> & TransferForeign<ElrondSigner, string, BigNumber> & UnfreezeForeign<ElrondSigner, string, BigNumber> & TransferNftForeign<ElrondSigner, string, BigNumber, EsdtNftInfo> & UnfreezeForeignNft<ElrondSigner, string, BigNumber, EsdtNftInfo> & IssueESDTNFT & MintNft<ElrondSigner, NftMintArgs, Transaction> & {
    mintableEsdts(address: Address): Promise<string[]>;
} & WrappedNftCheck<EsdtNftInfo> & ChainNonceGet & ValidateAddress;
/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt  Identifier of the ESDT Wrapper
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export interface ElrondParams {
    node_uri: string;
    minter_address: string;
    esdt_swap_address: string;
    esdt: string;
    esdt_nft: string;
    esdt_swap: string;
    validators: string[];
    nonce: number;
}
export declare const elrondHelperFactory: (elrondParams: ElrondParams) => Promise<ElrondHelper>;
export {};
