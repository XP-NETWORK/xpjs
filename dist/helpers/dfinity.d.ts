import { HttpAgent, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type DfinitySigner = Identity;
export declare type DfinityNft = {
    canisterId: string;
    tokenId: string;
};
export declare type DfinityHelper = ChainNonceGet & TransferNftForeign<DfinitySigner, DfinityNft, string> & UnfreezeForeignNft<DfinitySigner, DfinityNft, string> & EstimateTxFees<DfinityNft> & ValidateAddress & {
    XpNft: string;
} & Pick<PreTransfer<DfinitySigner, DfinityNft, string>, "preTransfer">;
export declare type DfinityParams = {
    agent: HttpAgent;
    bridgeContract: Principal;
    xpnftId: Principal;
    notifier: EvNotifier;
};
export declare function dfinityHelper(args: DfinityParams): Promise<DfinityHelper>;
