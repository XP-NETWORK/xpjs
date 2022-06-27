import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import { ChainNonceGet, EstimateTxFees, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type TonSigner = TonWallet | {
    accIdx: number;
};
export declare type TonNft = {
    nftId: number;
};
export declare type TonHelper = ChainNonceGet & TransferNftForeign<TonSigner, TonNft, string> & UnfreezeForeignNft<TonSigner, TonNft, string> & EstimateTxFees<TonNft> & ValidateAddress & {
    XpNft: string;
} & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonWallet;
};
export declare type TonParams = {
    tonweb: TonWeb;
    bridgeAddr: string;
    burnerAddr: string;
    xpnftAddr: string;
};
declare type MethodMap = {
    ton_requestAccounts: [undefined, string];
    ton_sendTransaction: [{
        value: string;
        to: string;
        data: string;
    }, unknown];
    ton_getBalance: [undefined, string];
};
declare type TonWallet = {
    send<M extends keyof MethodMap>(method: M, params: MethodMap[M][0]): Promise<MethodMap[M][1]>;
};
export declare function tonHelper(args: TonParams): Promise<TonHelper>;
export {};
