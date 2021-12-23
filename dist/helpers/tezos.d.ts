import { BalanceCheck, ChainNonceGet, EstimateTxFees, MintNft, NftMintArgs, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WrappedNftCheck } from "..";
import { Signer, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import BigNumber from "bignumber.js";
declare type TezosSigner = Signer;
declare type TezosNftInfo = {
    contract: string;
    id: string;
};
export declare type TezosHelper = TransferNftForeign<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & MintNft<TezosSigner, NftMintArgs, TransactionOperation> & BalanceCheck<string, BigNumber> & UnfreezeForeignNft<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & ValidateAddress & EstimateTxFees<BigNumber, TezosNftInfo> & ChainNonceGet & WrappedNftCheck<TezosNftInfo>;
export declare type TezosParams = {
    Tezos: TezosToolkit;
    xpnftAddress: string;
    bridgeAddress: string;
    validators: string[];
};
export declare function tezosHelperFactory({ Tezos, xpnftAddress, bridgeAddress, validators, }: TezosParams): Promise<TezosHelper>;
export {};
