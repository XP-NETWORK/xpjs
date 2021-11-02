import { cachedExchangeRateRepo, ExchangeRateRepo, networkBatchExchangeRateRepo, NetworkModel } from "crypto-exchange-rate";
import { ElrdNftListRepo, elrdNftListService, elrdRawTokenMapper, mockChainIdentMapper, moralisChainIdMapper, MoralisNftListRepo, moralisNftListService, moralisNftMapper, nftListRepo } from "xpnet-nft-list";

export function elrondNftList(proxy: string): ElrdNftListRepo {
    return nftListRepo(
        elrdNftListService(proxy),
        elrdRawTokenMapper(),
        mockChainIdentMapper()
    );
}

export function moralisNftList(server: string, appId: string): MoralisNftListRepo {
    return nftListRepo(
        moralisNftListService({ serverUrl: server, appId }),
        moralisNftMapper(),
        moralisChainIdMapper()
    );
}

export function exchangeRateRepo(baseUrl: string): ExchangeRateRepo {
    const baseService = NetworkModel.batchExchangeRateService(
        baseUrl
    );

    return cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
        baseService,
        NetworkModel.exchangeRateDtoMapper()
    )
    );
}