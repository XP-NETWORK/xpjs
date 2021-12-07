import {
  cachedExchangeRateRepo,
  ExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";
import {
  algoAssetMapper,
  algoNftListService,
  mockChainIdentMapper,
  nftListRepo,
} from "xpnet-nft-list";

export function exchangeRateRepo(baseUrl: string): ExchangeRateRepo {
  const baseService = NetworkModel.batchExchangeRateService(baseUrl);

  return cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
      baseService,
      NetworkModel.exchangeRateDtoMapper()
    )
  );
}

export const algoListNft = (baseUri: string) => {
  return nftListRepo(
    algoNftListService(baseUri),
    algoAssetMapper(),
    mockChainIdentMapper()
  );
};
