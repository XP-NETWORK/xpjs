import {
  cachedExchangeRateRepo,
  ExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";
import {
  algoAssetMapper,
  algoNftListService,
  AlgorandNftListRepo,
  ElrdNftListRepo,
  elrdNftListService,
  elrdRawTokenMapper,
  ethNftJMapper,
  EthNftJson,
  mockChainIdentMapper,
  moralisChainIdMapper,
  MoralisNftListRepo,
  moralisNftListService,
  moralisNftMapper,
  moralisTestNetChainIdMapper,
  NftListRepo,
  nftListRepo,
  trxNftListService,
} from "xpnet-nft-list";
//@ts-expect-error no types cope
import TronWeb from "tronweb";

export function elrondNftList(proxy: string): ElrdNftListRepo {
  return nftListRepo(
    elrdNftListService(proxy),
    elrdRawTokenMapper(),
    mockChainIdentMapper()
  );
}

export function moralisNftList(
  server: string,
  appId: string,
  moralisSecret?: string
): MoralisNftListRepo {
  return nftListRepo(
    moralisNftListService({ serverUrl: server, appId, moralisSecret }),
    moralisNftMapper(),
    moralisChainIdMapper()
  );
}

export function moralisTestnetNftList(
  server: string,
  appId: string,
  moralisSecret?: string
): MoralisNftListRepo {
  return nftListRepo(
    moralisNftListService({ serverUrl: server, appId, moralisSecret }),
    moralisNftMapper(),
    moralisTestNetChainIdMapper()
  );
}

export function tronListNft(
  tronWeb: TronWeb,
  tronScan: string,
  xpnftAddr: string
): NftListRepo<string, EthNftJson> {
  return nftListRepo(
    trxNftListService(tronWeb, tronScan, xpnftAddr),
    ethNftJMapper(),
    mockChainIdentMapper()
  );
}

export function algoListNft(baseURL: string): AlgorandNftListRepo {
  return nftListRepo(
    algoNftListService(baseURL),
    algoAssetMapper(),
    mockChainIdentMapper()
  );
}

export function exchangeRateRepo(baseUrl: string): ExchangeRateRepo {
  const baseService = NetworkModel.batchExchangeRateService(baseUrl);

  return cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
      baseService,
      NetworkModel.exchangeRateDtoMapper()
    )
  );
}
