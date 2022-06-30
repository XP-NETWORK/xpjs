"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeRateRepo = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
function exchangeRateRepo(baseUrl) {
    const baseService = crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
    return (0, crypto_exchange_rate_1.cachedExchangeRateRepo)((0, crypto_exchange_rate_1.networkBatchExchangeRateRepo)(baseService, crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
}
exports.exchangeRateRepo = exchangeRateRepo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBRTlCLFNBQWdCLGdCQUFnQixDQUM5QixPQUFlO0lBRWYsTUFBTSxXQUFXLEdBQUcsbUNBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSxPQUFPLElBQUEsNkNBQXNCLEVBQzNCLElBQUEsbURBQTRCLEVBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFYRCw0Q0FXQyJ9