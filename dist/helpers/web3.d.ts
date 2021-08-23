/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign, WrappedBalanceCheck, BatchWrappedBalanceCheck, DecodeWrappedNft, DecodeRawNft } from "./chain";
import { Signer, BigNumber as EthBN } from 'ethers';
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
 * Traits implemented by this module
 *
 * WARN: Action identifier is broken for web3
 */
export declare type Web3Helper = BalanceCheck<string, BigNumber> & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<Signer, string, EasyBalance, TransactionReceipt, string> & TransferNftForeign<Signer, string, EthNftInfo, TransactionReceipt, string> & UnfreezeForeign<Signer, string, EasyBalance, TransactionReceipt, string> & UnfreezeForeignNft<Signer, string, BigNumber, TransactionReceipt, string> & DecodeWrappedNft<string> & DecodeRawNft & {
    /**
    * Get the uri of an nft given nft info
    */
    nftUri(info: EthNftInfo): Promise<string>;
};
/**
 * Create an object implementing cross chain utilities for a web3 chain
 *
 * @param provider  An ethers.js provider object
 * @param minter_addr  Address of the minter smart contract
 * @param minter_abi  ABI of the minter smart contract
 */
export declare function web3HelperFactory(provider: Provider, minter_addr: string, minter_abi: Interface, erc1155_addr: string): Promise<Web3Helper>;
export {};
