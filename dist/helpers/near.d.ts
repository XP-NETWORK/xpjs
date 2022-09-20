import { Account, Near } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
declare type NearTxResult = [FinalExecutionOutcome, any];
export declare type NearParams = {
    readonly networkId: string;
    readonly nonce: number;
    readonly rpcUrl: string;
    readonly bridge: string;
    readonly xpnft: string;
    readonly feeMargin: FeeMargins;
    readonly notifier: EvNotifier;
};
export declare type NearNFT = {
    tokenId: string;
    contract: string;
};
export declare type NearHelper = ChainNonceGet & TransferNftForeign<Account, NearNFT, NearTxResult> & UnfreezeForeignNft<Account, NearNFT, NearTxResult> & EstimateTxFees<NearNFT> & ValidateAddress & {
    XpNft: string;
} & GetFeeMargins & GetProvider<Near>;
export declare function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, }: NearParams): Promise<NearHelper>;
export {};
//# sourceMappingURL=near.d.ts.map