import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import type { Cell } from "tonweb/dist/types/boc/cell";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type TonSigner = {
    wallet?: TonWallet;
    accIdx: number;
};
export declare type TonNft = {
    nftItemAddr: string;
};
export declare type TonHelper = ChainNonceGet & TransferNftForeign<TonSigner, TonNft, string> & UnfreezeForeignNft<TonSigner, TonNft, string> & EstimateTxFees<TonNft> & ValidateAddress & {
    XpNft: string;
} & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
};
export declare type TonParams = {
    tonweb: TonWeb;
    notifier: EvNotifier;
    bridgeAddr: string;
    burnerAddr: string;
    xpnftAddr: string;
};
declare type MethodMap = {
    ton_requestAccounts: [undefined, string];
    ton_sendTransaction: [{
        value: string;
        to: string;
        data: Cell;
    }, unknown];
    ton_getBalance: [undefined, string];
};
declare type TonWallet = {
    send<M extends keyof MethodMap>(method: M, params: MethodMap[M][0]): Promise<MethodMap[M][1]>;
};
export declare function tonHelper(args: TonParams): Promise<TonHelper>;
export {};
//# sourceMappingURL=ton.d.ts.map