"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeRateRepo = exports.algoListNft = exports.tronListNft = exports.moralisNftList = exports.elrondNftList = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const xpnet_nft_list_1 = require("xpnet-nft-list");
function elrondNftList(proxy) {
    return xpnet_nft_list_1.nftListRepo(xpnet_nft_list_1.elrdNftListService(proxy), xpnet_nft_list_1.elrdRawTokenMapper(), xpnet_nft_list_1.mockChainIdentMapper());
}
exports.elrondNftList = elrondNftList;
function moralisNftList(server, appId, moralisSecret, network = "mainnet") {
    return xpnet_nft_list_1.nftListRepo(xpnet_nft_list_1.moralisNftListService({ serverUrl: server, appId, moralisSecret }), xpnet_nft_list_1.moralisNftMapper(), network === "mainnet"
        ? xpnet_nft_list_1.moralisChainIdMapper()
        : xpnet_nft_list_1.moralisTestNetChainIdMapper());
}
exports.moralisNftList = moralisNftList;
function tronListNft(tronWeb, tronScan, xpnftAddr) {
    return xpnet_nft_list_1.nftListRepo(xpnet_nft_list_1.trxNftListService(tronWeb, tronScan, xpnftAddr), xpnet_nft_list_1.ethNftJMapper(), xpnet_nft_list_1.mockChainIdentMapper());
}
exports.tronListNft = tronListNft;
function algoListNft(baseURL) {
    return xpnet_nft_list_1.nftListRepo(xpnet_nft_list_1.algoNftListService(baseURL), xpnet_nft_list_1.algoAssetMapper(), xpnet_nft_list_1.mockChainIdentMapper());
}
exports.algoListNft = algoListNft;
function exchangeRateRepo(baseUrl) {
    const baseService = crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
    return crypto_exchange_rate_1.cachedExchangeRateRepo(crypto_exchange_rate_1.networkBatchExchangeRateRepo(baseService, crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
}
exports.exchangeRateRepo = exchangeRateRepo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBSzhCO0FBQzlCLG1EQWtCd0I7QUFJeEIsU0FBZ0IsYUFBYSxDQUFDLEtBQWE7SUFDekMsT0FBTyw0QkFBVyxDQUNoQixtQ0FBa0IsQ0FBQyxLQUFLLENBQUMsRUFDekIsbUNBQWtCLEVBQUUsRUFDcEIscUNBQW9CLEVBQUUsQ0FDdkIsQ0FBQztBQUNKLENBQUM7QUFORCxzQ0FNQztBQUlELFNBQWdCLGNBQWMsQ0FDNUIsTUFBYyxFQUNkLEtBQWEsRUFDYixhQUFzQixFQUN0QixVQUEwQixTQUFTO0lBRW5DLE9BQU8sNEJBQVcsQ0FDaEIsc0NBQXFCLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUNsRSxpQ0FBZ0IsRUFBRSxFQUNsQixPQUFPLEtBQUssU0FBUztRQUNuQixDQUFDLENBQUMscUNBQW9CLEVBQUU7UUFDeEIsQ0FBQyxDQUFDLDRDQUEyQixFQUFFLENBQ2xDLENBQUM7QUFDSixDQUFDO0FBYkQsd0NBYUM7QUFFRCxTQUFnQixXQUFXLENBQ3pCLE9BQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLFNBQWlCO0lBRWpCLE9BQU8sNEJBQVcsQ0FDaEIsa0NBQWlCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFDL0MsOEJBQWEsRUFBRSxFQUNmLHFDQUFvQixFQUFFLENBQ3ZCLENBQUM7QUFDSixDQUFDO0FBVkQsa0NBVUM7QUFFRCxTQUFnQixXQUFXLENBQUMsT0FBZTtJQUN6QyxPQUFPLDRCQUFXLENBQ2hCLG1DQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUMzQixnQ0FBZSxFQUFFLEVBQ2pCLHFDQUFvQixFQUFFLENBQ3ZCLENBQUM7QUFDSixDQUFDO0FBTkQsa0NBTUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFlO0lBQzlDLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyw2Q0FBc0IsQ0FDM0IsbURBQTRCLENBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFURCw0Q0FTQyJ9