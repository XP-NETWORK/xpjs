import { BatchExchangeRateRepo, ExchangeRateRepo } from "crypto-exchange-rate";
import { NftInfo, FullChain } from "..";
export declare const _headers: {
  "Content-Type": string;
  Accept: string;
};
export declare function exchangeRateRepo(
  baseUrl: string
): ExchangeRateRepo & BatchExchangeRateRepo;
export declare function checkBlockedContracts(to: any, contract: string): void;
export declare function getDefaultContract<SignerT, RawNftF, Resp, RawNftT>(
  nft: NftInfo<RawNftF>,
  fromChain: FullChain<SignerT, RawNftT, Resp>,
  toChain: FullChain<SignerT, RawNftT, Resp>
): string | undefined;
export declare function prepareTokenId(
  tokenId: string | undefined,
  from: number
): string | undefined;
//# sourceMappingURL=cons.d.ts.map
