import { BigNumber } from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, DecodeRawNft, DecodeWrappedNft, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, WrappedBalanceCheck } from "./chain";
import { TronWeb } from "tronweb";
import { EthNftInfo, MintArgs } from "./web3";
import { EstimateTxFees, WrappedNftCheck } from "..";
import { NftMintArgs } from "../factory/crossChainHelper";
export declare type BaseTronHelper = BalanceCheck<string, BigNumber> & MintNft<string, NftMintArgs, void> & {
    /**
     *
     * Deploy an ERC1155 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: string): Promise<string>;
};
export declare type TronHelper = BaseTronHelper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<string, string, string, string, string> & TransferNftForeign<string, string, string, EthNftInfo, string, string> & UnfreezeForeign<string, string, string, string, string> & UnfreezeForeignNft<string, string, string, BigNumber, string, string> & DecodeWrappedNft<string> & DecodeRawNft & EstimateTxFees<string, EthNftInfo, Uint8Array, BigNumber> & {
    nftUri(info: EthNftInfo): Promise<string>;
} & WrappedNftCheck<MintArgs>;
export declare function baseTronHelperFactory(provider: TronWeb): Promise<BaseTronHelper>;
export interface TronParams {
    provider: TronWeb;
    middleware_uri: string;
    erc1155_addr: string;
    minter_addr: string;
    minter_abi: JSON;
    erc721_addr: string;
}
export declare function tronHelperFactory(tronParams: TronParams): Promise<TronHelper>;
