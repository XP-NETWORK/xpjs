import { NftInfo, FullChain } from "..";
export declare const _headers: {
    "Content-Type": string;
    Accept: string;
};
export declare const oldXpWraps: Set<string>;
export declare function checkBlockedContracts(to: any, contract: string): void;
export declare function getDefaultContract<SignerT, RawNftF, Resp, RawNftT>(nft: NftInfo<RawNftF>, fromChain: FullChain<SignerT, RawNftT, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>): string | undefined;
export declare function prepareTokenId(nft: NftInfo<any>, from: number): any;
export declare function checkNotOldWrappedNft(contract: string): void;
export declare function isWrappedNft(nft: NftInfo<any>, fc: number, tc?: number): Promise<{
    bool: boolean;
    wrapped: any;
}>;
export declare const randomBigInt: () => bigint;
//# sourceMappingURL=utils.d.ts.map