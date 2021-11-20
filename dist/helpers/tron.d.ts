import { BigNumber } from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, EstimateTxFees, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, WrappedBalanceCheck, WrappedNftCheck } from "./chain";
import { TronWeb } from "tronweb";
import { EthNftInfo } from "./web3";
import { Approve, ExtractTxn, IsApproved, NftMintArgs, ValidateAddress } from "..";
import { ChainNonceGet } from "..";
import { Transaction } from "ethers";
declare type TronSender = string | undefined;
export declare type MinterRes = {
    minter: string;
    xpnft: string;
    xpnet: string;
    whitelist: string[];
};
export declare type BaseTronHelper = BalanceCheck<string, BigNumber> & MintNft<TronSender, NftMintArgs, string> & {
    /**
     *
     * Deploy an ERC721 user minter smart contract
     *
     * @argument deployer  deployer of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(deployer: TronSender): Promise<string>;
    /**
     * Deploy Minter Smart Contract
     *
     * @argument deployer  deployer of the smart contract
     * @argument validators  address of validators of the smart contract
     * @argument threshold  threshold for executing an action
     * @argument whitelist  optional whitelisted nfts contract (deploys one if empty/undefined)
     */
    deployMinter(deployer: TronSender, validators: string[], threshold: number, whitelist: string[] | undefined): Promise<MinterRes>;
};
export declare type TronHelper = BaseTronHelper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<TronSender, string, BigNumber, string> & TransferNftForeign<TronSender, string, BigNumber, EthNftInfo, string> & UnfreezeForeign<TronSender, string, string> & UnfreezeForeignNft<TronSender, string, BigNumber, EthNftInfo, Transaction> & WrappedNftCheck<EthNftInfo> & EstimateTxFees<BigNumber> & ChainNonceGet & Approve<TronSender> & ValidateAddress & IsApproved<TronSender> & ExtractTxn<string>;
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
export {};
