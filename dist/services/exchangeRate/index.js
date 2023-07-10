"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeRateRepo = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
function exchangeRateRepo(baseUrl) {
    const baseService = crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
    return (0, crypto_exchange_rate_1.cachedExchangeRateRepo)((0, crypto_exchange_rate_1.networkBatchExchangeRateRepo)(baseService, crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
}
exports.exchangeRateRepo = exchangeRateRepo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvZXhjaGFuZ2VSYXRlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQU04QjtBQUU5QixTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZTtJQUVmLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyxJQUFBLDZDQUFzQixFQUMzQixJQUFBLG1EQUE0QixFQUMxQixXQUFXLEVBQ1gsbUNBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQyxDQUNGLENBQUM7QUFDSixDQUFDO0FBWEQsNENBV0MifQ==