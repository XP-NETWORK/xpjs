import TonWeb from "tonweb";
import {
    ChainNonceGet,
    FeeMargins,
    GetFeeMargins,
    TransferNftForeign,
    UnfreezeForeignNft
} from "../.."
import { Chain } from "../../consts";
import { EvNotifier } from "../../notifier";
import { BridgeContract } from "./contracts";

type TonSigner = {

}

export type TonNftInfo = {

}

export type TonHelper = TransferNftForeign<TonSigner, TonNftInfo, string> &
    UnfreezeForeignNft<TonSigner, TonNftInfo, string> &
    ChainNonceGet
    & {
        XpNft: string;
    } & GetFeeMargins;

export type TonParams = {
    notifier: EvNotifier;
    xpnftAddress: string;
    bridgeAddress: string;
    feeMargin: FeeMargins
}

export async function tonHelperFactory({
    notifier,
    xpnftAddress,
    bridgeAddress,
    feeMargin
}: TonParams): Promise<TonHelper> {
    const tonWallet = window.ton;
    const provider = new TonWeb.HttpProvider()
    const bridge = new BridgeContract(provider, { address: bridgeAddress })

    async function notifyValidator(hash: string): Promise<void> {
        await notifier.notifyTon(hash)
    }

    return {
        XpNft: xpnftAddress,
        async transferNftToForeign(sender, chain, to, nft, fee, mw) {
            notifyValidator(hash);
            return hash
        },
        async unfreezeWrappedNft(sender, to, nft, fee, nonce) {
            notifyValidator(hash);
            return hash;
        },
        getNonce() {
            return Chain.TON;
        },
        getFeeMargin() {
            return feeMargin;
        }
    }
}
