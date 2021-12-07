"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algoListNft = exports.exchangeRateRepo = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const xpnet_nft_list_1 = require("xpnet-nft-list");
function exchangeRateRepo(baseUrl) {
    const baseService = crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
    return crypto_exchange_rate_1.cachedExchangeRateRepo(crypto_exchange_rate_1.networkBatchExchangeRateRepo(baseService, crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
}
exports.exchangeRateRepo = exchangeRateRepo;
const algoListNft = (baseUri) => {
    return xpnet_nft_list_1.nftListRepo(xpnet_nft_list_1.algoNftListService(baseUri), xpnet_nft_list_1.algoAssetMapper(), xpnet_nft_list_1.mockChainIdentMapper());
};
exports.algoListNft = algoListNft;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBSzhCO0FBQzlCLG1EQUt3QjtBQUV4QixTQUFnQixnQkFBZ0IsQ0FBQyxPQUFlO0lBQzlDLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyw2Q0FBc0IsQ0FDM0IsbURBQTRCLENBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFURCw0Q0FTQztBQUVNLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7SUFDN0MsT0FBTyw0QkFBVyxDQUNoQixtQ0FBa0IsQ0FBQyxPQUFPLENBQUMsRUFDM0IsZ0NBQWUsRUFBRSxFQUNqQixxQ0FBb0IsRUFBRSxDQUN2QixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBTlcsUUFBQSxXQUFXLGVBTXRCIn0=