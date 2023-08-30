import { ChainNonceGet, NftInfo } from "..";
import { InferNativeNft } from "../type-utils";
export interface NftList<T> {
    get(chain: ChainNonceGet, owner: string): Promise<NftInfo<InferNativeNft<T>>[]>;
}
export type NftListUtils = {
    getNftListAddr?(address: string): string;
};
export declare function nftList<T>(url: string, nftListAuthToken: string): NftList<T>;
//# sourceMappingURL=nftList.d.ts.map