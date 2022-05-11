import TonWeb from "tonweb";
import BN from 'bn.js'
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
    tonWallet: any;
}

export type TonNftInfo = {
    address: string
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
    const provider = new TonWeb.HttpProvider()
    const bridge = new BridgeContract(provider, { address: bridgeAddress })
    const enc = new TextEncoder()
    const Address = TonWeb.Address;

    async function notifyValidator(hash: string): Promise<void> {
        await notifier.notifyTon(hash)
    }

    return {
        XpNft: xpnftAddress,
        async transferNftToForeign(signer, chain, to, nft, fee, mw) {
            const bnFee = new BN(fee.toString())
            const amountToBridge = bnFee.sub(TonWeb.utils.toNano(0.01))
            const payload = await bridge.createFreezeBody({
                amount: amountToBridge,
                to: enc.encode(to),
                chainNonce: chain,
                mintWith: enc.encode(mw),
            })
            const bocBytes = await payload.toBoc();
            const nftItemAddress = new Address(nft.native.address);
            signer.tonWallet.send(
                'ton_sendTransaction',
                [{
                    to: nftItemAddress.toString(true, true, true),
                    value: fee.toString(),
                    data: TonWeb.utils.bytesToBase64(bocBytes),
                    dataType: 'boc'
                }]
            )
            const hash = "";  // TODO: get correct transaction hash
            notifyValidator(hash);
            return hash
        },
        async unfreezeWrappedNft(signer, to, nft, fee, nonce) {
            const hash = "";  // TODO: get correct transaction hash
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
