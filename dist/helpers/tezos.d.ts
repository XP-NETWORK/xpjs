import { BalanceCheck, ChainNonceGet, EstimateTxFees, MintNft, NftInfo, NftMintArgs, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WrappedNftCheck } from "..";
import { Signer, TezosToolkit, WalletProvider } from "@taquito/taquito";
import BigNumber from "bignumber.js";
declare type TezosSigner = WalletProvider | Signer;
declare type TezosNftInfo = {
    contract: string;
    token_id: string;
};
export declare type TezosHelper = TransferNftForeign<TezosSigner, string, BigNumber, TezosNftInfo, string> & MintNft<TezosSigner, NftMintArgs, string> & BalanceCheck<string, BigNumber> & UnfreezeForeignNft<TezosSigner, string, BigNumber, TezosNftInfo, string> & ValidateAddress & EstimateTxFees<BigNumber, TezosNftInfo> & ChainNonceGet & WrappedNftCheck<TezosNftInfo> & Pick<PreTransfer<Signer, TezosNftInfo, string>, "preTransfer"> & {
    isApprovedForMinter(signer: Signer, nft: NftInfo<TezosNftInfo>): Promise<boolean>;
} & {
    approveForMinter(address: NftInfo<TezosNftInfo>, sender: TezosSigner): Promise<string | undefined>;
};
export declare type TezosParams = {
    Tezos: TezosToolkit;
    middlewareUri: string;
    xpnftAddress: string;
    bridgeAddress: string;
    validators: string[];
};
export declare function tezosHelperFactory({ Tezos, middlewareUri, xpnftAddress, bridgeAddress, validators, }: TezosParams): Promise<TezosHelper>;
export {};
