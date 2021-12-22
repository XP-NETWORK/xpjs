import { BalanceCheck, EstimateTxFees, MintNft, NftMintArgs, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import { Signer, TransactionOperation } from "@taquito/taquito";
import BigNumber from "bignumber.js";
declare type TezosSigner = Signer;
declare type TezosNftInfo = {
    contract: string;
    id: string;
};
export declare type TezosHelper = TransferNftForeign<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & MintNft<TezosSigner, NftMintArgs, TransactionOperation> & BalanceCheck<string, BigNumber> & UnfreezeForeignNft<TezosSigner, string, BigNumber, TezosNftInfo, TransactionOperation> & ValidateAddress & EstimateTxFees<BigNumber>;
export declare type TezosParams = {
    rpc: string;
    xpnftAddress: string;
    bridgeAddress: string;
};
export declare function tezosHelperFactory({ rpc, xpnftAddress, bridgeAddress, }: TezosParams): Promise<TezosHelper>;
export {};
