import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import type { Cell } from "tonweb/dist/types/boc/cell";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck } from "./chain";
import { PreTransfer } from "..";
import { TonhubConnector, TonhubTransactionResponse } from "ton-x";
export declare type TonSigner = {
    wallet?: TonWallet;
    accIdx: number;
};
export declare type TonWalletProvider = {
    isTonWallet: boolean;
    send(method: string, params?: any[]): Promise<any>;
    on(eventName: string, handler: (...data: any[]) => any): void;
};
export declare type TonArgs = {
    wallet: TonhubConnector & TonWalletProvider;
    config: {
        seed?: string;
        appPublicKey?: string;
        address?: string;
    };
};
export declare type TonNft = {
    nftItemAddr: string;
};
export declare type TonHelper = ChainNonceGet & BalanceCheck & PreTransfer<any, any, any> & TransferNftForeign<TonSigner, TonNft, string> & UnfreezeForeignNft<TonSigner, TonNft, string> & EstimateTxFees<TonNft> & ValidateAddress & {
    XpNft: string;
} & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
    tonHubWrapper: (args: TonArgs) => TonSigner;
    tonWalletWrapper: (args: TonArgs) => TonSigner;
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
declare type ResponseUnionType = boolean & TonhubTransactionResponse & {
    hash: string;
};
declare type TonWallet = {
    send<M extends keyof MethodMap>(method: M, params: MethodMap[M][0]): Promise<MethodMap[M][1]>;
    handleResponse(res: ResponseUnionType): Promise<string>;
};
export declare function tonHelper(args: TonParams): Promise<TonHelper>;
export {};
/**
 *
 *     const ton = new TonWeb(
      new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
        apiKey:
          "05645d6b549f33bf80cee8822bd63df720c6781bd00020646deb7b2b2cd53b73",
      })
    );

    const trxs = await ton.provider.getTransactions(
      "EQBhSfdrfydwE4Sl4-sWUYhNHsQcVTGR3p2JA14C2_PNdgfs",
      20
    );

    console.log(trxs);

    let data = new Cell();
    console.log(data);
    const dict = Cell.fromBoc(
      Buffer.from(
        "te6cckECDAEAAtkAA7V2FJ92t/J3AThKXj6xZRiE0exBxVMZHenYkDXgLb8812AAAdm2v+2EFpyXsCyPQOlDXCGvDlGdb9/YPNRPgD98AgAsIvgTYcYAAAHZqugyeDY2O1EgADRtIKRIAQIDAgHgBAUAgnIXMm/rsAMDO9FDdU/1I47b332HXYKcIvfN53pZj/VL8XxAXw8HICdzOmVFlgwy6XfTfJTbuplVQh4PnMQir/B3AhEMgouGGZPPBEAKCwHhiADCk+7W/k7gJwlLx9YsoxCaPYg4qmMjvTsSBrwFt+ea7AHPX0P+BlViv5FLRo4uUALd1xnuqimnA//t0BCCufv3iVjYINGcRw+ljDnirrtKYcGN629BfyEuTEj2eIBH7pAxTU0YuxsdqmAAAABAABwGAQHfBwFoYgBuLG9sHzPjFfimuHMhmTMm2J2PjG2QS0wA58SpRc6PpiAmJaAAAAAAAAAAAAAAAAAAAQgBsWgAwpPu1v5O4CcJS8fWLKMQmj2IOKpjI707Ega8Bbfnmu0ANxY3tg+Z8Yr8U1w5kMyZk2xOx8Y2yCWmAHPiVKLnR9MQExLQAAYuoZgAADs21/2whMbHaiTACAGfX8w9FAAAAAAAAAAAgAhTrcJncddU9sZlDMvNz2ZSqJDp5YplXYGBr0ckiINkEAPcWJzy2hGXRIgyzC2jzCbLkfjUINlQYAjIgr3kCXkEFBgJAHIHACoweDQ3QmYwZGFlNmU5MmU0OWEzYzk1ZTViMGM3MTQyMjg5MUQ1Y2Q0RkUAAAAAAAAAAAAAAAAAnUGdgxOIAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAb8mRfJBMLqFQAAAAAAACAAAAAAADChE7JLQbmSipXzKEUnUNwnWjHPBXefxRxAbt/uNGHeZA0DgsouCJ3A==",
        "base64"
      )
    )[0].hash();
    console.log("Hash: " + dict.toString("base64"));
 */
//# sourceMappingURL=ton.d.ts.map