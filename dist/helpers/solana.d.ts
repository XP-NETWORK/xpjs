import { AnchorProvider } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { EvNotifier } from "../notifier";
import { ChainNonceGet, EstimateTxFees, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type SolanaSigner = AnchorProvider;
export declare type SolanaNft = {
    nftMint: string;
};
export declare type SolanaHelper = ChainNonceGet & TransferNftForeign<SolanaSigner, SolanaNft, string> & UnfreezeForeignNft<SolanaSigner, SolanaNft, string> & EstimateTxFees<SolanaNft> & ValidateAddress & {
    connection: Connection;
};
export declare type SolanaParams = {
    endpoint: string;
    bridgeContractAddr: string;
    xpnftAddr: string;
    notifier: EvNotifier;
};
export declare function solanaHelper(args: SolanaParams): Promise<SolanaHelper>;
//# sourceMappingURL=solana.d.ts.map