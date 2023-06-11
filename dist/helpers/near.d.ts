import { Account, Near, WalletConnection } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { SignatureService } from "../services/estimator";
import { EvNotifier } from "../services/notifier";
import { WhitelistedService } from "../services/whitelisted";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, NftInfo, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck, PreTransfer, WhitelistCheck, EstimateDeployFees } from "./chain";
type NearTxResult = [FinalExecutionOutcome, any];
type NearPreTransferArgs = {
    to: string;
    receiver: string;
};
export type NearParams = {
    readonly networkId: string;
    readonly nonce: number;
    readonly rpcUrl: string;
    readonly bridge: string;
    readonly xpnft: string;
    readonly feeMargin: FeeMargins;
    readonly notifier: EvNotifier;
    readonly walletUrl: string;
    readonly helperUrl: string;
    readonly whitelisted: WhitelistedService;
    readonly signatureSvc: SignatureService;
};
export type NearNFT = {
    tokenId: string;
    contract: string;
};
export type Metadata = {
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
interface BrowserMethods {
    connectWallet(): Promise<WalletConnection>;
    getUserMinter(keypair: string, address: string): Promise<Near>;
}
interface NotifyMethod {
    notify(hash: string): Promise<void>;
}
export type NearHelper = ChainNonceGet & BalanceCheck & TransferNftForeign<Account, NearNFT, NearTxResult> & UnfreezeForeignNft<Account, NearNFT, NearTxResult> & MintNft<Account, NearMintArgs, NearTxResult> & EstimateTxFees<NearNFT> & EstimateDeployFees & Pick<PreTransfer<Account, NearNFT, string, NearPreTransferArgs>, "preTransfer"> & ValidateAddress & {
    XpNft: string;
    nftList(owner: Account, contract: string): Promise<NftInfo<NearNFT>[]>;
} & GetFeeMargins & GetProvider<Near> & BrowserMethods & NotifyMethod & WhitelistCheck<NearNFT, Account>;
export declare function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, whitelisted, walletUrl, signatureSvc, helperUrl, }: NearParams): Promise<NearHelper>;
export {};
//# sourceMappingURL=near.d.ts.map