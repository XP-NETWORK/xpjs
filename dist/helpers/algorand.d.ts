import WalletConnect from "@walletconnect/client";
import algosdk, { SuggestedParams } from "algosdk";
import { AlgorandSocketHelper, ChainNonceGet, EstimateTxFees, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { EvNotifier } from "../notifier";
import { BalanceCheck, FeeMargins, GetFeeMargins, GetTokenURI } from "./chain";
declare type TxResp = {
    txId: string;
};
declare type AlgoNft = {
    "metadata-hash"?: string;
    name?: string;
    "unit-name"?: string;
    url: string;
    creator: string;
    nftId: number;
};
declare type SignedTxn = {
    txID?: string;
    blob: string;
};
declare type Ledger = "MainNet" | "TestNet" | "any";
declare type BrowserSigner = {
    accounts(args: {
        ledger: Ledger;
    }): Promise<{
        address: string;
    }[]>;
    signTxn(transactions: {
        txn: string;
    }[]): Promise<SignedTxn[]>;
    send(info: {
        ledger: Ledger;
        tx: string;
    }): Promise<TxResp>;
};
export declare type ClaimNftInfo = {
    appId: number;
    nftId: number;
};
/**
 * Selected address & ledger must be given explicitly
 */
export declare type AlgoSignerH = {
    readonly algoSigner: BrowserSigner;
    readonly address: string;
    readonly ledger: Ledger;
};
/**
 * This library is written in typescript.
 * unfortunately the browser extension injects the AlgoSigner in a way we can't get a typed object wwithout this hack.
 *
 * @return Strongly typed AlgoSigner from extension
 */
export declare function typedAlgoSigner(): BrowserSigner;
export declare function algoSignerWrapper(algod: algosdk.Algodv2, acc: algosdk.Account): AlgoSignerH;
export declare type FullClaimNft = ClaimNftInfo & {
    name: string;
    uri: string;
};
export declare type AlgorandHelper = ChainNonceGet & TransferNftForeign<AlgoSignerH, AlgoNft, string> & UnfreezeForeignNft<AlgoSignerH, AlgoNft, string> & EstimateTxFees<AlgoNft> & ValidateAddress & {
    algod: algosdk.Algodv2;
    claimNft(claimer: AlgoSignerH, info: ClaimNftInfo): Promise<string>;
    claimableNfts(txSocket: AlgorandSocketHelper, owner: string): Promise<FullClaimNft[]>;
    isOptIn(address: string, nftId: number): Promise<boolean>;
    optInNft(signer: AlgoSignerH, info: ClaimNftInfo): Promise<string | undefined>;
    walletConnectSigner(connector: WalletConnect, address: string): AlgoSignerH;
    myAlgoSigner(myAlgo: MyAlgoConnect, address: string): AlgoSignerH;
} & Pick<PreTransfer<AlgoSignerH, AlgoNft, SuggestedParams, undefined>, "preTransfer"> & {
    XpNft: string;
} & GetFeeMargins & BalanceCheck & GetTokenURI;
export declare type AlgorandParams = {
    algodApiKey: string;
    algodUri: string;
    indexerUri: string;
    algodPort: number | undefined;
    sendNftAppId: number;
    notifier: EvNotifier;
    feeMargin: FeeMargins;
};
export declare function algorandHelper(args: AlgorandParams): AlgorandHelper;
export {};
//# sourceMappingURL=algorand.d.ts.map