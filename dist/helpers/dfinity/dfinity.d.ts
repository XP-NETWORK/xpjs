import { HttpAgent, Identity, SubmitResponse } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { EvNotifier } from "../../notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "../chain";
export declare type DfinitySigner = Identity;
export declare type DfinityNft = {
    canisterId: string;
    tokenId: string;
};
export declare type DfinityMintArgs = {
    canisterId?: string;
    uri: string;
};
export declare type User = {
    principal: Principal;
} | {
    address: AccountIdentifier;
};
export interface MintRequest {
    to: User;
    metadata: [] | [Array<number>];
}
export declare type DfinityHelper = ChainNonceGet & TransferNftForeign<DfinitySigner, DfinityNft, string> & UnfreezeForeignNft<DfinitySigner, DfinityNft, string> & EstimateTxFees<DfinityNft> & ValidateAddress & {
    XpNft: string;
} & Pick<PreTransfer<DfinitySigner, DfinityNft, string>, "preTransfer"> & BalanceCheck & GetFeeMargins & MintNft<DfinitySigner, DfinityMintArgs, SubmitResponse> & {
    nftList(owner: string, contract: string): Promise<NftInfo<DfinityNft>[]>;
};
export declare type DfinityParams = {
    agent: HttpAgent;
    bridgeContract: Principal;
    xpnftId: Principal;
    notifier: EvNotifier;
    feeMargin: FeeMargins;
    umt: Principal;
};
export declare function dfinityHelper(args: DfinityParams): Promise<DfinityHelper>;
//# sourceMappingURL=dfinity.d.ts.map