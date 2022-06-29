import { BalanceCheck, ChainNonceGet, EstimateTxFees, MintNft, NftInfo, NftMintArgs, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import { Signer, TezosToolkit, WalletProvider } from "@taquito/taquito";
import { EvNotifier } from "../notifier";
import { FeeMargins, GetFeeMargins, WhitelistCheck } from "./chain";
declare type TezosSigner = WalletProvider | Signer;
export declare type TezosNftInfo = {
    contract: string;
    token_id: string;
};
export declare type TezosHelper = TransferNftForeign<TezosSigner, TezosNftInfo, string> & MintNft<TezosSigner, NftMintArgs, string> & BalanceCheck & UnfreezeForeignNft<TezosSigner, TezosNftInfo, string> & ValidateAddress & EstimateTxFees<TezosNftInfo> & ChainNonceGet & Pick<PreTransfer<Signer, TezosNftInfo, string>, "preTransfer"> & {
    isApprovedForMinter(signer: TezosSigner, nft: NftInfo<TezosNftInfo>): Promise<boolean>;
} & {
    approveForMinter(address: NftInfo<TezosNftInfo>, sender: TezosSigner): Promise<string | undefined>;
} & {
    XpNft: string;
} & GetFeeMargins & WhitelistCheck<TezosNftInfo>;
export declare type TezosParams = {
    Tezos: TezosToolkit;
    notifier: EvNotifier;
    xpnftAddress: string;
    bridgeAddress: string;
    validators: string[];
    feeMargin: FeeMargins;
};
export declare function tezosHelperFactory({ Tezos, notifier, xpnftAddress, bridgeAddress, validators, feeMargin, }: TezosParams): Promise<TezosHelper>;
export {};
