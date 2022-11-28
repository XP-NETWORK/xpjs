import { Account, Near, WalletConnection, Contract } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, NftInfo, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck } from "./chain";
declare type NearTxResult = [FinalExecutionOutcome, any];
export declare type NearParams = {
    readonly networkId: string;
    readonly nonce: number;
    readonly rpcUrl: string;
    readonly bridge: string;
    readonly xpnft: string;
    readonly feeMargin: FeeMargins;
    readonly notifier: EvNotifier;
    readonly walletUrl: string;
    readonly helperUrl: string;
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
interface BrowserMethods {
    connectWallet(): Promise<WalletConnection>;
    getContract(signer: Account, _contract: string): Promise<Contract>;
    getUserMinter(keypair: string, address: string): Promise<Near>;
}
interface PreTransferNear {
    preTransfer(sender: Account, nft: NftInfo<NearNFT>, fee: string, to: number, receiver: string): Promise<string | undefined>;
    preUnfreeze(sender: Account, nft: NftInfo<NearNFT>, fee: string, to: number, receiver: string): Promise<string | undefined>;
}
export declare type NearHelper = ChainNonceGet & BalanceCheck & TransferNftForeign<Account, NearNFT, NearTxResult> & UnfreezeForeignNft<Account, NearNFT, NearTxResult> & MintNft<Account, NearMintArgs, NearTxResult> & EstimateTxFees<NearNFT> & Pick<PreTransferNear, "preTransfer"> & ValidateAddress & {
    XpNft: string;
    nftList(owner: Account, contract: string): Promise<NftInfo<NearNFT>[]>;
} & GetFeeMargins & GetProvider<Near> & BrowserMethods;
export declare function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, walletUrl, helperUrl, }: NearParams): Promise<NearHelper>;
export {};
//# sourceMappingURL=near.d.ts.map