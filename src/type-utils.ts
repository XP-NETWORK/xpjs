import { Chain, MetaMap, TransferNftForeign } from ".";

type TransferNftChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, RawNft, Resp>;

export type ChainNonce = keyof MetaMap;

export type InferChainParam<K extends ChainNonce> = MetaMap[K][1];
export type InferChainH<K extends ChainNonce> = MetaMap[K][0];
export type InferSigner<K extends TransferNftChain<any, any, any>> = K extends TransferNftChain<infer S, unknown, unknown> ? S : never;

export type ParamMap = {
  set<T extends ChainNonce>(k: T, v: InferChainParam<T> | undefined): void;
  get<T extends ChainNonce>(k: T): InferChainParam<T> | undefined;
};

export type HelperMap<K extends ChainNonce> = Map<K, InferChainH<K> | undefined>;