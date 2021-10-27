import { BigNumber } from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, DecodeRawNft, DecodeWrappedNft, EstimateTxFees, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, WrappedBalanceCheck, WrappedNftCheck } from "./chain";
import { TronWeb } from "tronweb";
import { EthNftInfo, MintArgs } from "./web3";
import { NftMintArgs } from "../factory/crossChainHelper";
import { ChainNonce } from "..";
export declare type MinterRes = {
    minter: string;
    xpnft: string;
    xpnet: string;
    whitelist: string[];
};
export declare type BaseTronHelper = BalanceCheck<string, BigNumber> & MintNft<string, NftMintArgs, any> & {
    /**
     *
     * Deploy an ERC721 user minter smart contract
     *
     * @argument deployer  deployer of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(deployer: string): Promise<string>;
    /**
     * Deploy Minter Smart Contract
     *
     * @argument deployer  deployer of the smart contract
     * @argument validators  address of validators of the smart contract
     * @argument threshold  threshold for executing an action
     * @argument whitelist  optional whitelisted nfts contract (deploys one if empty/undefined)
     */
    deployMinter(deployer: string, validators: string[], threshold: number, whitelist: string[] | undefined): Promise<MinterRes>;
};
export declare type TronHelper = BaseTronHelper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<string, string, BigNumber, string, string> & TransferNftForeign<string, string, BigNumber, EthNftInfo, string, string> & UnfreezeForeign<string, string, string, string, string> & UnfreezeForeignNft<string, string, BigNumber, BigNumber, string, string> & DecodeWrappedNft<string> & DecodeRawNft & EstimateTxFees<EthNftInfo, Uint8Array, BigNumber> & {
    nftUri(info: EthNftInfo): Promise<string>;
} & WrappedNftCheck<MintArgs> & ChainNonce;
export declare function baseTronHelperFactory(provider: TronWeb): Promise<BaseTronHelper>;
export interface TronParams {
    provider: TronWeb;
    middleware_uri: string;
    erc1155_addr: string;
    minter_addr: string;
    erc721_addr: string;
    validators: string[];
    nonce: number;
}
export declare function tronHelperFactory(tronParams: TronParams): Promise<TronHelper>;
