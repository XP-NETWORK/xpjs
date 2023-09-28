/// <reference types="node" />
import { ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SignatureService } from "../../services/estimator";
import { EvNotifier } from "../../services/notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WhitelistCheck, ParamsGetter, IsApprovedForMinter, GetExtraFees } from "../chain";
import { _SERVICE } from "./minter.did";
export type DfinitySigner = Identity & {
    agent?: HttpAgent;
};
export type DfinityNft = {
    canisterId: string;
    tokenId: string;
};
export type DfinityMintArgs = {
    canisterId?: string;
    uri: string;
};
export type User = {
    principal: Principal;
} | {
    address: AccountIdentifier;
};
export interface MintRequest {
    to: User;
    metadata: [] | [Array<number>];
}
export type DfinityHelper = ChainNonceGet & TransferNftForeign<DfinitySigner, DfinityNft, string> & UnfreezeForeignNft<DfinitySigner, DfinityNft, string> & EstimateTxFees<DfinityNft> & ValidateAddress & {
    XpNft: string;
} & Pick<PreTransfer<DfinitySigner, DfinityNft, string, undefined>, "preTransfer"> & BalanceCheck & GetFeeMargins & MintNft<DfinitySigner, DfinityMintArgs, number> & {
    nftList(owner: string, contract: string): Promise<NftInfo<DfinityNft>[]>;
} & {
    getAccountIdentifier(principal: string): string;
} & WhitelistCheck<DfinityNft> & ParamsGetter<DfinityParams> & {
    withdraw_fees(to: string, actionId: string, sig: Buffer): Promise<boolean>;
    encode_withdraw_fees(to: string, actionId: string): Promise<Uint8Array>;
    getMinter(): ActorSubclass<_SERVICE>;
} & IsApprovedForMinter<DfinitySigner, DfinityNft> & GetExtraFees & {
    setActorCreator(provider: any): void;
};
export type DfinityParams = {
    agent: HttpAgent;
    bridgeContract: Principal;
    xpnftId: Principal;
    notifier: EvNotifier;
    feeMargin: FeeMargins;
    umt: Principal;
    readonly signatureSvc: SignatureService;
};
export declare function dfinityHelper(args: DfinityParams): Promise<DfinityHelper>;
//# sourceMappingURL=dfinity.d.ts.map