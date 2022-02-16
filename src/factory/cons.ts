import {
  BatchExchangeRateRepo,
  cachedExchangeRateRepo,
  ExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";

export function exchangeRateRepo(baseUrl: string): ExchangeRateRepo & BatchExchangeRateRepo {
  const baseService = NetworkModel.batchExchangeRateService(baseUrl);

  return cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
      baseService,
      NetworkModel.exchangeRateDtoMapper()
    )
  );
}
