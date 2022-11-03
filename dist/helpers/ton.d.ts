import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import type { Cell } from "tonweb/dist/types/boc/cell";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck } from "./chain";
import { TonhubConnector, TonhubTransactionResponse } from "ton-x";
export declare type TonSigner = {
    wallet?: TonWallet;
    accIdx: number;
};
export declare type TonHub = {
    wallet: TonhubConnector;
    config: {
        seed: string;
        appPublicKey: string;
        address: string;
    };
};
export declare type TonNft = {
    nftItemAddr: string;
};
export declare type TonHelper = ChainNonceGet & BalanceCheck & TransferNftForeign<TonSigner, TonNft, string> & UnfreezeForeignNft<TonSigner, TonNft, string> & EstimateTxFees<TonNft> & ValidateAddress & {
    XpNft: string;
} & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
    tonHubWrapper: (args: TonHub) => TonSigner;
} & GetFeeMargins;
export declare type TonParams = {
    tonweb: TonWeb;
    notifier: EvNotifier;
    bridgeAddr: string;
    burnerAddr: string;
    xpnftAddr: string;
    feeMargin: FeeMargins;
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
declare type ResponseUnionType = TonhubTransactionResponse | {
    hash: string;
};
declare type TonWallet = {
    send<M extends keyof MethodMap>(method: M, params: MethodMap[M][0]): Promise<MethodMap[M][1]>;
    handleResponse(res: ResponseUnionType): Promise<string>;
};
export declare function tonHelper(args: TonParams): Promise<TonHelper>;
export {};
/**
 * te6cckECAwEAARQAAZyePa86ljKS+MMbRkLZsLh935o2RzbAvKlW+XvT97HV6u6HnL6mzcE5OdFdHqB6cwLsoEhZpIqx073kjFPfO1YDKamjF2Nin6kAAAAFAAMBAc1iABROzGm51PmIt7opuWJmE0PhVJBiM8nYvb81g6py4r62IR4aMAAAAAAAAAAAAAAAAAAAX8w9FAAAAAAAAAAAgB7ixOeW0Iy6JEGWYW0eYTZcj8ahBsqDAEZEFe8gS8ggoQflyiAQAgCuBwAqMHg0N0JmMGRhZTZlOTJlNDlhM2M5NWU1YjBjNzE0MjI4OTFENWNkNEZFMHgyZDY5MDdkZjMxNkQ1OTYwZTkwNjQ0MTJhNzE4MTBBN2M5RDhmNGM3p4Mu7w==
 */
//# sourceMappingURL=ton.d.ts.map