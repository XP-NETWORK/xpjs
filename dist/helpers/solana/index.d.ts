import { Wallet } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { EvNotifier } from "../../services/notifier";
import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, BalanceCheck, MintNft, EstimateDeployFees } from "../chain";
export type SolanaSigner = Wallet;
export type SolanaNft = {
    nftMint: string;
};
type SolanaMintArgs = {
    uri: string;
};
export type SolanaHelper = ChainNonceGet & BalanceCheck & MintNft<SolanaSigner, SolanaMintArgs, string> & TransferNftForeign<SolanaSigner, SolanaNft, string> & UnfreezeForeignNft<SolanaSigner, SolanaNft, string> & EstimateTxFees<SolanaNft> & ValidateAddress & {
    connection: Connection;
} & {
    XpNft: string;
} & GetFeeMargins & GetProvider<Connection> & EstimateDeployFees;
export type SolanaParams = {
    endpoint: string;
    bridgeContractAddr: string;
    xpnftAddr: string;
    notifier: EvNotifier;
    feeMargin: FeeMargins;
};
export declare function solanaHelper(args: SolanaParams): Promise<SolanaHelper>;
export {};
//# sourceMappingURL=index.d.ts.map