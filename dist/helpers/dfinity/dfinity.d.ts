import { HttpAgent, Identity, SubmitResponse } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SignatureService } from "../../services/estimator";
import { EvNotifier } from "../../services/notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "../chain";
export type DfinitySigner = Identity;
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
} & Pick<PreTransfer<DfinitySigner, DfinityNft, string, undefined>, "preTransfer"> & BalanceCheck & GetFeeMargins & MintNft<DfinitySigner, DfinityMintArgs, SubmitResponse> & {
    nftList(owner: string, contract: string): Promise<NftInfo<DfinityNft>[]>;
} & {
    getAccountIdentifier(principal: string): string;
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
/***
 *
 *
{height: 6184161}
dfinity.ts:246 6184161n 'txFeeBlock'

 Uncaught (in promise) Error: Call was rejected:
  Request ID: 2b46b5f1b89494270d4866c280c75404b63736f381fbeb66aeb0bab483228c54
  Reject code: 5
  Reject text: Canister e3io4-qaaaa-aaaak-qasua-cai trapped explicitly: Panicked at 'called `Result::unwrap()` on an `Err` value: InvalidFee', src/minter/src/lib.rs:490:10

call_on_cleanup also failed:

Canister e3io4-qaaaa-aaaak-qasua-cai trapped explicitly: Panicked at 'called `Result::unwrap()` on an `Err` value: FailedToQueryFee("Failed to Query for fee. Code: NoError. Reason: cleanup")', src/minter/src/lib.rs:490:10

    at pollForResponse (index.ts:68:1)
    at async caller (actor.ts:372:1)
    at async Object.transferNftToForeign (dfinity.ts:248:1)
    at async onClickHandler (IcpWallet.jsx:126:1)
pollForResponse @ index.ts:68

 */
//# sourceMappingURL=dfinity.d.ts.map