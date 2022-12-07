import { Wallet } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { EvNotifier } from "../../notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "../chain";
export type SolanaSigner = Wallet;
export type SolanaNft = {
    nftMint: string;
};
export type SolanaHelper = ChainNonceGet & TransferNftForeign<SolanaSigner, SolanaNft, string> & UnfreezeForeignNft<SolanaSigner, SolanaNft, string> & EstimateTxFees<SolanaNft> & ValidateAddress & {
    connection: Connection;
} & {
    XpNft: string;
} & GetFeeMargins & GetProvider<Connection>;
export type SolanaParams = {
    endpoint: string;
    bridgeContractAddr: string;
    xpnftAddr: string;
    notifier: EvNotifier;
    feeMargin: FeeMargins;
};
export declare function solanaHelper(args: SolanaParams): Promise<SolanaHelper>;
//# sourceMappingURL=index.d.ts.map