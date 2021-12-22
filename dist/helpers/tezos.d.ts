import { BalanceCheck, EstimateTxFees, MintNft, NftMintArgs, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import { Signer, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import BigNumber from "bignumber.js";
declare type TezosSigner = Signer;
declare type TezosNftInfo = {
    contract: string;
    id: string;
};
export declare type TezosHelper = TransferNftForeign<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & MintNft<TezosSigner, NftMintArgs, TransactionOperation> & BalanceCheck<string, BigNumber> & UnfreezeForeignNft<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & ValidateAddress & EstimateTxFees<BigNumber>;
export declare type TezosParams = {
    Tezos: TezosToolkit;
    xpnftAddress: string;
    bridgeAddress: string;
};
export declare function tezosHelperFactory({ Tezos, xpnftAddress, bridgeAddress, }: TezosParams): Promise<TezosHelper>;
export {};
