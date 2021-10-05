import { BigNumber } from "bignumber.js";
import { BalanceCheck, BatchWrappedBalanceCheck, DecodeRawNft, DecodeWrappedNft, MintNft, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, WrappedBalanceCheck } from "./chain";
import { TronWeb } from "tronweb";
import { EthNftInfo, MintArgs } from "./web3";
export declare type BaseTronHelper = BalanceCheck<string, BigNumber> & MintNft<string, MintArgs, void> & {
    /**
     *
     * Deploy an ERC1155 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: string): Promise<string>;
};
export declare type TronHelper = BaseTronHelper & WrappedBalanceCheck<string, BigNumber> & BatchWrappedBalanceCheck<string, BigNumber> & TransferForeign<string, string, string, string, string> & TransferNftForeign<string, string, string, EthNftInfo, string, string> & UnfreezeForeign<string, string, string, string, string> & UnfreezeForeignNft<string, string, string, BigNumber, string, string> & DecodeWrappedNft<string> & DecodeRawNft & {
    nftUri(info: EthNftInfo): Promise<string>;
    estimateValidateTransferNft(validators: string[], to: string, nft: EthNftInfo): Promise<BigNumber>;
    estimateValidateUnfreezeNft(validators: string[], to: string, nft: Uint8Array): Promise<BigNumber>;
};
export declare function baseTronHelperFactory(provider: TronWeb): Promise<BaseTronHelper>;
export declare function tronHelperFactory(provider: TronWeb, middleware_uri: string, erc1155_addr: string, minter_addr: string, minter_abi: JSON): Promise<TronHelper>;
