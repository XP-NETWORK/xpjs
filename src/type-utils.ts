import { Chain, ChainNonce, TransferNftForeign } from ".";

type TransferNftChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, any, any, RawNft, Resp>;

export type ChainV = typeof Chain[keyof typeof Chain];
export type InferChainParam<K extends ChainV> = K extends ChainNonce<unknown, infer Param> ? Param : never;
export type InferChainH<K extends ChainV> = K extends ChainNonce<infer Helper, unknown> ? Helper : never;
export type InferSigner<K extends TransferNftChain<any, any, any>> = K extends TransferNftChain<infer S, unknown, unknown> ? S : never;

export type ParamMap = {
  set<T extends ChainV>(k: T, v: InferChainParam<T> | undefined): void;
  get<T extends ChainV>(k: T): InferChainParam<T> | undefined;
};

export type HelperMap<K extends ChainV> = Map<K, InferChainH<K> | undefined>;