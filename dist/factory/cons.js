"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultContract = exports.exchangeRateRepo = exports._headers = void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const consts_1 = require("../consts");
exports._headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
};
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
    if ((from === consts_1.Chain.VECHAIN && toType === consts_1.ChainType.EVM) ||
        (to === consts_1.Chain.VECHAIN && fromType === consts_1.ChainType.EVM)) {
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
    if (fromType === consts_1.ChainType.TRON) {
        throw defaultMintError;
    }
    return contract;
}
exports.getDefaultContract = getDefaultContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUF5RDtBQUU1QyxRQUFBLFFBQVEsR0FBRztJQUN0QixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQztBQUVGLFNBQWdCLGdCQUFnQixDQUM5QixPQUFlO0lBRWYsTUFBTSxXQUFXLEdBQUcsbUNBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSxPQUFPLElBQUEsNkNBQXNCLEVBQzNCLElBQUEsbURBQTRCLEVBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFYRCw0Q0FXQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxHQUFxQixFQUNyQixTQUE0QyxFQUM1QyxPQUEwQzs7SUFFMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssQ0FDaEMseUdBQXlHLENBQzFHLENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTlCLE1BQU0sUUFBUSxHQUFHLE1BQUEsbUJBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBDQUFFLElBQUksQ0FBQztJQUM1QyxNQUFNLE1BQU0sR0FBRyxNQUFBLG1CQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQywwQ0FBRSxJQUFJLENBQUM7SUFFeEMsTUFBTSxRQUFRLEdBQ1osY0FBYyxJQUFJLEdBQUcsQ0FBQyxNQUFNO1FBQzVCLG9DQUFvQztRQUNwQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksS0FBSyxTQUFTO1FBQ3JDLE9BQU8sQ0FBQyxTQUFTO1FBQ2YsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTO1FBQ25CLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBRXBCLElBQ0UsT0FBTyxNQUFNLEtBQUssV0FBVztRQUM3QixDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNyRCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDM0M7UUFDQSxPQUFPLFFBQVEsQ0FBQztLQUNqQjtJQUVELElBQ0UsQ0FBQyxJQUFJLEtBQUssY0FBSyxDQUFDLE9BQU8sSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxHQUFHLENBQUM7UUFDcEQsQ0FBQyxFQUFFLEtBQUssY0FBSyxDQUFDLE9BQU8sSUFBSSxRQUFRLEtBQUssa0JBQVMsQ0FBQyxHQUFHLENBQUMsRUFDcEQ7UUFDQSxNQUFNLGdCQUFnQixDQUFDO0tBQ3hCO0lBRUQsSUFDRSxDQUFDLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0QsQ0FBQyxRQUFRLEtBQUssa0JBQVMsQ0FBQyxNQUFNLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxDQUFDLEVBQzNEO1FBQ0EsTUFBTSxnQkFBZ0IsQ0FBQztLQUN4QjtJQUVELElBQ0UsQ0FBQyxRQUFRLEtBQUssa0JBQVMsQ0FBQyxHQUFHLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsS0FBSyxDQUFDO1FBQzFELENBQUMsUUFBUSxLQUFLLGtCQUFTLENBQUMsS0FBSyxJQUFJLE1BQU0sS0FBSyxrQkFBUyxDQUFDLEdBQUcsQ0FBQyxFQUMxRDtRQUNBLE1BQU0sZ0JBQWdCLENBQUM7S0FDeEI7SUFFQyxJQUFJLFFBQVEsS0FBSyxrQkFBUyxDQUFDLElBQUksRUFBRTtRQUNqQyxNQUFNLGdCQUFnQixDQUFDO0tBQ3hCO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQXpERCxnREF5REMifQ==