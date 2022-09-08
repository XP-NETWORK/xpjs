import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
import { AptosAccount } from "aptos";
export declare type AptosNFT = {
    collection_creator: string;
    collection_name: string;
    token_name: string;
    property_version: number;
};
export declare type AptosHelper = ChainNonceGet & TransferNftForeign<AptosAccount, AptosNFT, string> & UnfreezeForeignNft<AptosAccount, AptosNFT, string> & EstimateTxFees<AptosNFT> & ValidateAddress & {
    XpNft: string;
} & GetFeeMargins;
export declare type AptosParams = {
    feeMargin: FeeMargins;
    rpcUrl: string;
    xpnft: string;
    bridge: string;
};
export declare function aptosHelper({ feeMargin, rpcUrl, xpnft, }: AptosParams): Promise<AptosHelper>;
//# sourceMappingURL=aptos.d.ts.map