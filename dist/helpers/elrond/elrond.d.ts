/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
import { ExtensionProvider, ISigner, Transaction, WalletConnectProvider, Address } from "@elrondnetwork/erdjs";
import { Transaction as XTRX } from "@multiversx/sdk-core";
import { ExtensionProvider as XExtensionProvider } from "@multiversx/sdk-extension-provider";
import BigNumber from "bignumber.js";
import { BalanceCheck, MintNft, TransferNftForeign, UnfreezeForeignNft, TransferNftForeignBatch, UnfreezeForeignNftBatch, EstimateTxFeesBatch, GetFeeMargins, FeeMargins, IsContractAddress, GetTokenURI, LockNFT, ClaimV3NFT, GetClaimData, GetTokenInfo } from "../chain";
import { ChainNonce, ChainNonceGet, EstimateTxFees, ExtractAction, ExtractTxnStatus, PreTransfer, PreTransferRawTxn, ValidateAddress } from "../..";
import { EvNotifier } from "../../services/notifier";
type ElrondSigner = (ISigner | ExtensionProvider | WalletConnectProvider | XExtensionProvider) & {
    chainId?: string;
};
/**
 * Information associated with an ESDT Token
 */
export type EsdtTokenInfo = {
    readonly balance: 1 | string;
    readonly tokenIdentifier: string;
};
type BEsdtNftInfo = {
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
export type EsdtNftInfo = EsdtTokenInfo & BEsdtNftInfo;
/**
 * arguments required to issue an NFT
 */
export type NftIssueArgs = {
    readonly identifier: string;
    readonly uris: Array<string>;
    readonly name: string;
    readonly quantity?: number;
    readonly royalties?: number;
    readonly hash?: string;
    readonly attrs?: string;
};
/**
 * Utility for issuing ESDT which supports NFT minting
 */
export interface IssueESDTNFT {
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
export type ESDTRole = "ESDTRoleNFTCreate" | "ESDTRoleNFTBurn";
/**
 * Utility for setting ESDT roles
 */
export interface SetESDTRoles {
    /**
     *
     * Set the roles for a given account for an esdt
     *
     * @param sender  Target account
     * @param token  ESDT Identifier
     * @param roles  Roles to set
     */
    setESDTRole(sender: ElrondSigner, token: string, target: Address, roles: ESDTRole[]): Promise<Transaction>;
    transferESDTOwnership(sender: ElrondSigner, token: string, target: Address): Promise<Transaction>;
}
export interface ElrondRawUnsignedTxn {
    readonly nonce: number;
    readonly value: string;
    readonly receiver: string;
    readonly sender: string;
    readonly gasPrice: number;
    readonly gasLimit: number;
    readonly data?: string;
    readonly chainID: string;
    readonly version: number;
    readonly options?: number;
    readonly signature?: string;
}
/**
 * Traits implemented by this module
 */
export type ElrondHelper = BalanceCheck & TransferNftForeign<ElrondSigner, EsdtNftInfo, Transaction> & UnfreezeForeignNft<ElrondSigner, EsdtNftInfo, Transaction> & TransferNftForeignBatch<ElrondSigner, EsdtNftInfo, Transaction> & UnfreezeForeignNftBatch<ElrondSigner, EsdtNftInfo, Transaction> & IssueESDTNFT & MintNft<ElrondSigner, NftIssueArgs, string> & {
    mintableEsdts(address: Address): Promise<string[]>;
} & ChainNonceGet & ValidateAddress & ExtractAction<Transaction> & PreTransfer<ElrondSigner, EsdtNftInfo, string, undefined> & EstimateTxFees<EsdtNftInfo> & EstimateTxFeesBatch<EsdtNftInfo> & PreTransferRawTxn<EsdtNftInfo, ElrondRawUnsignedTxn> & ExtractTxnStatus & SetESDTRoles & {
    XpNft: string;
} & GetFeeMargins & {
    wegldBalance(address: string): Promise<BigNumber>;
    unwrapWegld(sender: ElrondSigner, amt: BigNumber): Promise<string>;
} & IsContractAddress & GetTokenURI & LockNFT<ElrondSigner, EsdtNftInfo, XTRX> & ClaimV3NFT<ElrondSigner, XTRX> & GetClaimData & GetTokenInfo;
/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export interface ElrondParams {
    node_uri: string;
    notifier: EvNotifier;
    nonce: ChainNonce;
    minter_address: string;
    esdt_swap_address: string;
    esdt_nft: string;
    esdt_swap: string;
    v3_bridge: string;
    elrondApi: string;
    elrondIndex: string;
    feeMargin: FeeMargins;
}
export declare function elrondHelperFactory(elrondParams: ElrondParams): Promise<ElrondHelper>;
export {};
//# sourceMappingURL=elrond.d.ts.map