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
    const defaultMintError = new Error(`Transfer has been canceled. The NFT you are trying to send will be minted with a default NFT collection`);
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
        (/(allowDefaultMint=true)/.test(window.location.search) ||
            /testnet/.test(window.location.pathname))) {
        return contract;
    }
    if (fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.EVM) {
        throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.ELROND) ||
        (fromType === consts_1.ChainType.ELROND && toType === consts_1.ChainType.EVM)) {
        throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.TEZOS) ||
        (fromType === consts_1.ChainType.TEZOS && toType === consts_1.ChainType.EVM)) {
        throw defaultMintError;
    }
    return contract;
}
exports.getDefaultContract = getDefaultContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUFrRDtBQUVsRCxTQUFnQixnQkFBZ0IsQ0FDOUIsT0FBZTtJQUVmLE1BQU0sV0FBVyxHQUFHLG1DQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbkUsT0FBTyxJQUFBLDZDQUFzQixFQUMzQixJQUFBLG1EQUE0QixFQUMxQixXQUFXLEVBQ1gsbUNBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQyxDQUNGLENBQUM7QUFDSixDQUFDO0FBWEQsNENBV0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7O0lBRTFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLENBQ2hDLHlHQUF5RyxDQUMxRyxDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUU5QixNQUFNLFFBQVEsR0FBRyxNQUFBLG1CQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywwQ0FBRSxJQUFJLENBQUM7SUFDNUMsTUFBTSxNQUFNLEdBQUcsTUFBQSxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsMENBQUUsSUFBSSxDQUFDO0lBRXhDLE1BQU0sUUFBUSxHQUNaLGNBQWMsSUFBSSxHQUFHLENBQUMsTUFBTTtRQUM1QixvQ0FBb0M7UUFDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUztRQUNyQyxPQUFPLENBQUMsU0FBUztRQUNmLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUztRQUNuQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUVwQixJQUNFLE9BQU8sTUFBTSxLQUFLLFdBQVc7UUFDN0IsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckQsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQzNDO1FBQ0EsT0FBTyxRQUFRLENBQUM7S0FDakI7SUFFRCxJQUFJLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDMUQsTUFBTSxnQkFBZ0IsQ0FBQztLQUN4QjtJQUVELElBQ0UsQ0FBQyxRQUFRLEtBQUssa0JBQVMsQ0FBQyxHQUFHLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsTUFBTSxDQUFDO1FBQzNELENBQUMsUUFBUSxLQUFLLGtCQUFTLENBQUMsTUFBTSxJQUFJLE1BQU0sS0FBSyxrQkFBUyxDQUFDLEdBQUcsQ0FBQyxFQUMzRDtRQUNBLE1BQU0sZ0JBQWdCLENBQUM7S0FDeEI7SUFFRCxJQUNFLENBQUMsUUFBUSxLQUFLLGtCQUFTLENBQUMsR0FBRyxJQUFJLE1BQU0sS0FBSyxrQkFBUyxDQUFDLEtBQUssQ0FBQztRQUMxRCxDQUFDLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEtBQUssSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxHQUFHLENBQUMsRUFDMUQ7UUFDQSxNQUFNLGdCQUFnQixDQUFDO0tBQ3hCO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQWxERCxnREFrREMifQ==