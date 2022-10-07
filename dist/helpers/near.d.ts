import { Account, Near } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
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
export declare type Metadata = {
    title?: string;
    description?: string;
    media?: string;
    mediaHash: Uint8Array | null;
    issued_at: string | null;
    expires_at: string | null;
    starts_at: string | null;
    updated_at: string | null;
    extra?: string;
    reference: string | null;
    referenceHash: Uint8Array | null;
};
export interface NearMintArgs {
    contract: string;
    token_id: string;
    token_owner_id: string;
    metadata: Metadata;
}
export declare type NearHelper = ChainNonceGet & TransferNftForeign<Account, NearNFT, NearTxResult> & UnfreezeForeignNft<Account, NearNFT, NearTxResult> & MintNft<Account, NearMintArgs, NearTxResult> & EstimateTxFees<NearNFT> & Pick<PreTransfer<Account, NearNFT, NearTxResult>, "preTransfer"> & ValidateAddress & {
    XpNft: string;
} & GetFeeMargins & GetProvider<Near>;
export declare function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, }: NearParams): Promise<NearHelper>;
export {};
//# sourceMappingURL=near.d.ts.map