/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import { UnfreezeForeignNft, BalanceCheck, TransferNftForeign, WrappedBalanceCheck, BatchWrappedBalanceCheck, MintNft, WrappedNftCheck, GetProvider, TransferNftForeignBatch, UnfreezeForeignNftBatch, EstimateTxFeesBatch } from "./chain";
import { Signer, PopulatedTransaction, Wallet, providers, ContractTransaction } from "ethers";
import { TransactionResponse, Provider } from "@ethersproject/providers";
import { UserNftMinter__factory, Erc1155Minter__factory, Erc1155Minter, UserNftMinter } from "xpnet-web3-contracts";
import { ChainNonceGet, EstimateTxFees, ExtractAction, ExtractTxnStatus, MintRawTxn, NftInfo, PreTransfer, PreTransferRawTxn, TransferNftForeignUnsigned, UnfreezeForeignNftUnsigned, ValidateAddress } from "..";
import { NftMintArgs } from "..";
/**
 * Information required to perform NFT transfers in this chain
 */
export declare type EthNftInfo = {
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
export declare type MintArgs = {
    contract: string;
    uri: string;
};
export interface IsApproved<Sender> {
    isApprovedForMinter(address: NftInfo<EthNftInfo>, sender: Sender): Promise<boolean>;
}
export interface Approve<Sender> {
    approveForMinter(address: NftInfo<EthNftInfo>, sender: Sender): Promise<string | undefined>;
}
/**
 * Base util traits
 */
export declare type BaseWeb3Helper = BalanceCheck<string, BigNumber> & 
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
export declare type Web3Helper = BaseWeb3Helper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferNftForeign<Signer, string, BigNumber, EthNftInfo, TransactionResponse> & UnfreezeForeignNft<Signer, string, BigNumber, EthNftInfo, TransactionResponse> & TransferNftForeignBatch<Signer, string, BigNumber, EthNftInfo, TransactionResponse> & UnfreezeForeignNftBatch<Signer, string, BigNumber, EthNftInfo, TransactionResponse> & WrappedNftCheck<EthNftInfo> & EstimateTxFees<BigNumber, string> & EstimateTxFeesBatch<BigNumber, EthNftInfo> & ChainNonceGet & IsApproved<Signer> & Approve<Signer> & ValidateAddress & ExtractAction<TransactionResponse> & {
    createWallet(privateKey: string): Wallet;
} & Pick<PreTransfer<Signer, EthNftInfo, string>, "preTransfer"> & UnfreezeForeignNftUnsigned<string, BigNumber, EthNftInfo, PopulatedTransaction> & TransferNftForeignUnsigned<string, BigNumber, EthNftInfo, PopulatedTransaction> & PreTransferRawTxn<EthNftInfo, PopulatedTransaction> & ExtractTxnStatus & MintRawTxn<PopulatedTransaction> & GetProvider<providers.Provider> & {
    XpNft: string;
};
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
export declare function baseWeb3HelperFactory(provider: Provider): Promise<BaseWeb3Helper>;
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
    erc721Minter: string;
    erc1155Minter: string;
    nonce: number;
}
declare type NftMethodVal<T, Tx> = {
    freeze: "freezeErc1155" | "freezeErc721";
    validateUnfreeze: "validateUnfreezeErc1155" | "validateUnfreezeErc721";
    umt: typeof Erc1155Minter__factory | typeof UserNftMinter__factory;
    approved: (umt: T, sender: string, minterAddr: string, tok: string) => Promise<boolean>;
    approve: (umt: T, forAddr: string, tok: string) => Promise<Tx>;
};
declare type EthNftMethodVal<T> = NftMethodVal<T, ContractTransaction>;
declare type NftMethodMap = Record<"ERC1155" | "ERC721", EthNftMethodVal<Erc1155Minter> | EthNftMethodVal<UserNftMinter>>;
export declare const NFT_METHOD_MAP: NftMethodMap;
export declare function web3HelperFactory(params: Web3Params): Promise<Web3Helper>;
export {};
