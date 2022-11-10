import { ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "../chain";
import { AptosAccount, AptosClient } from "aptos";
import { EvNotifier } from "../../notifier";
export declare type AptosNFT = {
    collection_creator: string;
    collection_name: string;
    token_name: string;
    property_version: number;
};
/**
 * @param collection name of the collection u already own. if u dont own any token, then set this as undefined
 * @param name name of the NFT
 * @param description description of the NFT
 * @param uri The URI which the NFT points to
 * @param createCollection set this as true if u set collection as undefined. it will create a new collection.
 */
export declare type AptosMintArgs = {
    collection: string | undefined;
    name: string;
    description: string;
    uri: string;
    createCollection: boolean;
};
export declare type AptosHelper = ChainNonceGet & TransferNftForeign<AptosAccount, AptosNFT, string> & UnfreezeForeignNft<AptosAccount, AptosNFT, string> & EstimateTxFees<AptosNFT> & ValidateAddress & {
    XpNft: string;
} & GetFeeMargins & MintNft<AptosAccount, AptosMintArgs, string> & GetProvider<AptosClient>;
export declare type AptosParams = {
    feeMargin: FeeMargins;
    rpcUrl: string;
    xpnft: string;
    bridge: string;
    notifier: EvNotifier;
    network: "mainnet" | "devnet";
};
export declare function aptosHelper({ feeMargin, rpcUrl, xpnft, bridge, notifier, network, }: AptosParams): Promise<AptosHelper>;
//# sourceMappingURL=index.d.ts.map