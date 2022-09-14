import { BatchExchangeRateRepo, ExchangeRateRepo } from "crypto-exchange-rate";
import { NftInfo, FullChain } from "..";
export declare function exchangeRateRepo(baseUrl: string): ExchangeRateRepo & BatchExchangeRateRepo;
export declare function getDefaultContract<SignerT, RawNftF, Resp, RawNftT>(nft: NftInfo<RawNftF>, fromChain: FullChain<SignerT, RawNftT, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>): string | undefined;
//# sourceMappingURL=cons.d.ts.map