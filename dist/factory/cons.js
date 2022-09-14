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
    const contract = "contractType" in nft.native &&
        //@ts-ignore contractType is checked
        nft.native.contractType === "ERC1155" &&
        toChain.XpNft1155
        ? toChain.XpNft1155
        : toChain.XpNft;
    if (typeof window !== "undefined" &&
        /(testing\.bridge)/.test(window.location.origin)) {
        return contract;
    }
    if (fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.EVM) {
        return undefined;
    }
    if (fromType === consts_1.ChainType.ELROND && toType === consts_1.ChainType.EVM) {
        return undefined;
    }
    if (fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.ELROND) {
        return undefined;
    }
    return contract;
}
exports.getDefaultContract = getDefaultContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUFrRDtBQUVsRCxTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZTtJQUVmLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyxJQUFBLDZDQUFzQixFQUMzQixJQUFBLG1EQUE0QixFQUMxQixXQUFXLEVBQ1gsbUNBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQyxDQUNGLENBQUM7QUFDSixDQUFDO0FBWEQsNENBV0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7O0lBRTFDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUIsTUFBTSxRQUFRLEdBQUcsTUFBQSxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMENBQUUsSUFBSSxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQUEsbUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLDBDQUFFLElBQUksQ0FBQztJQUV4QyxNQUFNLFFBQVEsR0FDWixjQUFjLElBQUksR0FBRyxDQUFDLE1BQU07UUFDNUIsb0NBQW9DO1FBQ3BDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVM7UUFDckMsT0FBTyxDQUFDLFNBQVM7UUFDZixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVM7UUFDbkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFFcEIsSUFDRSxPQUFPLE1BQU0sS0FBSyxXQUFXO1FBQzdCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUNoRDtRQUNBLE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBRUQsSUFBSSxRQUFRLEtBQUssa0JBQVMsQ0FBQyxHQUFHLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxFQUFFO1FBQzFELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsSUFBSSxRQUFRLEtBQUssa0JBQVMsQ0FBQyxNQUFNLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxFQUFFO1FBQzdELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsSUFBSSxRQUFRLEtBQUssa0JBQVMsQ0FBQyxHQUFHLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsTUFBTSxFQUFFO1FBQzdELE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQXZDRCxnREF1Q0MifQ==