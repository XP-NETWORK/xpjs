"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultContract = exports.exchangeRateRepo = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const consts_1 = require("../consts");
function exchangeRateRepo(baseUrl) {
    const baseService = crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
    return (0, crypto_exchange_rate_1.cachedExchangeRateRepo)((0, crypto_exchange_rate_1.networkBatchExchangeRateRepo)(baseService, crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
}
exports.exchangeRateRepo = exchangeRateRepo;
function getDefaultContract(nft, fromChain, toChain) {
    var _a, _b;
    const from = fromChain.getNonce();
    const to = toChain.getNonce();
    const fromType = (_a = consts_1.CHAIN_INFO.get(from)) === null || _a === void 0 ? void 0 : _a.type;
    const toType = (_b = consts_1.CHAIN_INFO.get(to)) === null || _b === void 0 ? void 0 : _b.type;
    if (fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.EVM) {
        return undefined;
    }
    if (fromType === consts_1.ChainType.ELROND && toType === consts_1.ChainType.EVM) {
        return undefined;
    }
    if (fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.ELROND) {
        return undefined;
    }
    return "contractType" in nft.native &&
        //@ts-ignore contractType is checked
        nft.native.contractType === "ERC1155" &&
        toChain.XpNft1155
        ? toChain.XpNft1155
        : toChain.XpNft;
}
exports.getDefaultContract = getDefaultContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUFrRDtBQUVsRCxTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZTtJQUVmLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyxJQUFBLDZDQUFzQixFQUMzQixJQUFBLG1EQUE0QixFQUMxQixXQUFXLEVBQ1gsbUNBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQyxDQUNGLENBQUM7QUFDSixDQUFDO0FBWEQsNENBV0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7O0lBRTFDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUIsTUFBTSxRQUFRLEdBQUcsTUFBQSxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMENBQUUsSUFBSSxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQUEsbUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLDBDQUFFLElBQUksQ0FBQztJQUV4QyxJQUFJLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDMUQsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxJQUFJLFFBQVEsS0FBSyxrQkFBUyxDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDN0QsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxJQUFJLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDN0QsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxPQUFPLGNBQWMsSUFBSSxHQUFHLENBQUMsTUFBTTtRQUNqQyxvQ0FBb0M7UUFDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUztRQUNyQyxPQUFPLENBQUMsU0FBUztRQUNqQixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVM7UUFDbkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDcEIsQ0FBQztBQTdCRCxnREE2QkMifQ==