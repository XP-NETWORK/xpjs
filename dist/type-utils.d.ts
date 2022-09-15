import { MetaMap, TransferNftForeign } from ".";
declare type TransferNftChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, RawNft, Resp>;
export declare type ChainNonce = keyof MetaMap;
export declare type InferChainParam<K extends ChainNonce> = MetaMap[K][1];
export declare type InferChainH<K extends ChainNonce> = MetaMap[K][0];
export declare type InferSigner<K> = K extends TransferNftChain<infer S, unknown, unknown> ? S : never;
export declare type InferNativeNft<K> = K extends TransferNftChain<any, infer RawNft, any> ? RawNft : never;
export declare type ParamMap = {
    set<T extends ChainNonce>(k: T, v: InferChainParam<T> | undefined): void;
    get<T extends ChainNonce>(k: T): InferChainParam<T> | undefined;
};
export declare type HelperMap<K extends ChainNonce> = Map<K, InferChainH<K> | undefined>;
export declare type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
};
export {};
//# sourceMappingURL=type-utils.d.ts.map