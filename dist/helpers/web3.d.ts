/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign, WrappedBalanceCheck, BatchWrappedBalanceCheck, DecodeWrappedNft, WrappedNft, DecodeRawNft, MintNft } from "./chain";
import { Signer, BigNumber as EthBN } from "ethers";
import { TransactionReceipt, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
declare type EasyBalance = string | number | EthBN;
/**
 * Information required to perform NFT transfers in this chain
 */
export declare type EthNftInfo = {
    contract_type: "ERC721" | "ERC1155";
    contract: string;
    token: EthBN;
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
    token: EasyBalance;
    uri: string;
};
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
MintNft<Signer, MintArgs, void> & {
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
export declare type Web3Helper = BaseWeb3Helper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<Signer, string, EasyBalance, TransactionReceipt, string> & TransferNftForeign<Signer, string, EthNftInfo, TransactionReceipt, string> & UnfreezeForeign<Signer, string, EasyBalance, TransactionReceipt, string> & UnfreezeForeignNft<Signer, string, BigNumber, TransactionReceipt, string> & DecodeWrappedNft<string> & DecodeRawNft & {
    /**
     * Get the uri of an nft given nft info
     */
    nftUri(info: EthNftInfo): Promise<string>;
    estimateValidateTransferNft(validators: string[], to: string, nft: EthNftInfo): Promise<BigNumber>;
    estimateValidateUnfreezeNft(validators: string[], to: string, nft: WrappedNft): Promise<BigNumber>;
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
export declare function web3HelperFactory(provider: Provider, minter_addr: string, minter_abi: Interface, erc1155_addr: string): Promise<Web3Helper>;
export {};
