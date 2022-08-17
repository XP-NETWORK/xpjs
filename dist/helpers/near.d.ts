import { Account } from "near-api-js";
import { ChainNonceGet, EstimateTxFees, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type NearParams = {
    networkId: string;
    nonce: number;
    rpcUrl: string;
    bridge: string;
    xpnft: string;
};
export declare type NearNFT = {
    tokenId: string;
};
export declare type NearHelper = ChainNonceGet & TransferNftForeign<Account, NearNFT, string> & UnfreezeForeignNft<Account, NearNFT, string> & EstimateTxFees<NearNFT> & ValidateAddress;
export declare function nearHelperFactory({ networkId, bridge, rpcUrl, }: NearParams): Promise<NearHelper>;
//# sourceMappingURL=near.d.ts.map