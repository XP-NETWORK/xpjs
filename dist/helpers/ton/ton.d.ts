import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import type { Cell } from "tonweb/dist/types/boc/cell";
import { EvNotifier } from "../../services/notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck, GetExtraFees, WhitelistCheck, GetTokenInfo } from "../chain";
import { ChainNonce, PreTransfer, ClaimV3NFT } from "../..";
import { TonhubConnector, TonhubTransactionResponse } from "ton-x";
import { NftListUtils } from "../../services/nftList";
import { ScVerifyUtils } from "../../services/scVerify";
export type TonSigner = {
    wallet?: TonWallet;
    accIdx: number;
};
export type TonWalletProvider = {
    isTonWallet: boolean;
    send(method: string, params?: any[]): Promise<any>;
    onSuccess?(): Promise<any>;
    on(eventName: string, handler: (...data: any[]) => any): void;
};
export type TonArgs = {
    wallet: TonhubConnector & TonWalletProvider & Function;
    config: {
        seed?: string;
        appPublicKey?: string;
        address?: string;
        [x: string]: any;
    };
};
export type TonNft = {
    nftItemAddr: string;
};
export type TonHelper = ChainNonceGet & BalanceCheck & PreTransfer<any, any, any, undefined> & TransferNftForeign<TonSigner, TonNft, string> & UnfreezeForeignNft<TonSigner, TonNft, string> & EstimateTxFees<TonNft> & ValidateAddress & {
    XpNft: string;
} & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
    tonHubWrapper: (args: TonArgs) => TonSigner;
    tonWalletWrapper: (args: TonArgs) => TonSigner;
    tonKeeperWrapper: (args: TonArgs) => TonSigner;
} & GetFeeMargins & WhitelistCheck<TonNft> & GetExtraFees & NftListUtils & ScVerifyUtils & ClaimV3NFT<TonSigner, string> & GetTokenInfo;
export type TonParams = {
    tonweb: TonWeb;
    notifier: EvNotifier;
    nonce: ChainNonce;
    bridgeAddr: string;
    burnerAddr: string;
    xpnftAddr: string;
    feeMargin: FeeMargins;
    extraFees: Map<ChainNonce, string>;
    v3_bridge: string;
};
type MethodMap = {
    ton_requestAccounts: [undefined, string];
    ton_sendTransaction: [{
        value: string;
        to: string;
        data: Cell;
    }, unknown];
    ton_getBalance: [undefined, string];
};
type ResponseUnionType = boolean & TonhubTransactionResponse & {
    hash: string;
};
type TonWallet = {
    send<M extends keyof MethodMap>(method: M, params: MethodMap[M][0]): Promise<MethodMap[M][1]>;
    onSuccess?(): Function;
    handleResponse(res: ResponseUnionType): Promise<string>;
};
export declare function tonHelper(args: TonParams): Promise<TonHelper>;
export {};
/**
{
    "tokenId": "42",
    "destinationChain": "TON",
    "destinationUserAddress": "EQDrOJsbEcJHbzSjWQDefr2YDD-D999BhZZ_XT-lxlbiDmN3",
    "sourceNftContractAddress": "0xc679bdad7c2a34ca93552eae75e4bc03bf505adc",
    "tokenAmount": "1",
    "nftType": "singular",
    "sourceChain": "BSC",
    "name": "Istra",
    "symbol": "NSA",
    "metadata": "https://meta.polkamon.com/meta?id=10002362332",
    "royalty": "0",
    "fee": "100000000000000",
    "royaltyReceiver": "EQAV8tH2WDuWYU7zAmkJmIwP8Ph_uIC4zBqJNIfKgRUUQewh",
    "transactionHash": "0x984e0c85404bd5419b33026f507b0e432e4ab35687e9478bf26bf234be41fed1"
}
 */
//# sourceMappingURL=ton.d.ts.map