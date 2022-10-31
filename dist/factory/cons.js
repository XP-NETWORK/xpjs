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
    // const defaultMintError = new Error(
    //   `Transfer has been canceled. The NFT you are trying to send will be minted with a default NFT collection`
    // );
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
        (/(allowDefaultMint=true)/.test(window.location.search) ||
            /testnet/.test(window.location.pathname))) {
        return contract;
    }
    if ((from === consts_1.Chain.VECHAIN && toType === consts_1.ChainType.EVM) ||
        (to === consts_1.Chain.VECHAIN && fromType === consts_1.ChainType.EVM)) {
        // throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.ELROND) ||
        (fromType === consts_1.ChainType.ELROND && toType === consts_1.ChainType.EVM)) {
        // throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.TEZOS) ||
        (fromType === consts_1.ChainType.TEZOS && toType === consts_1.ChainType.EVM)) {
        // throw defaultMintError;
    }
    if (fromType === consts_1.ChainType.TRON) {
        // throw defaultMintError;
    }
    return contract;
}
exports.getDefaultContract = getDefaultContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUF5RDtBQUU1QyxRQUFBLFFBQVEsR0FBRztJQUN0QixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQztBQUVGLFNBQWdCLGdCQUFnQixDQUM5QixPQUFlO0lBRWYsTUFBTSxXQUFXLEdBQUcsbUNBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSxPQUFPLElBQUEsNkNBQXNCLEVBQzNCLElBQUEsbURBQTRCLEVBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFYRCw0Q0FXQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxHQUFxQixFQUNyQixTQUE0QyxFQUM1QyxPQUEwQztJQUUxQyxzQ0FBc0M7SUFDdEMsOEdBQThHO0lBQzlHLEtBQUs7O0lBRUwsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUU5QixNQUFNLFFBQVEsR0FBRyxNQUFBLG1CQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywwQ0FBRSxJQUFJLENBQUM7SUFDNUMsTUFBTSxNQUFNLEdBQUcsTUFBQSxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsMENBQUUsSUFBSSxDQUFDO0lBRXhDLE1BQU0sUUFBUSxHQUNaLGNBQWMsSUFBSSxHQUFHLENBQUMsTUFBTTtRQUM1QixvQ0FBb0M7UUFDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUztRQUNyQyxPQUFPLENBQUMsU0FBUztRQUNmLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUztRQUNuQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUVwQixJQUNFLE9BQU8sTUFBTSxLQUFLLFdBQVc7UUFDN0IsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckQsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQzNDO1FBQ0EsT0FBTyxRQUFRLENBQUM7S0FDakI7SUFFRCxJQUNFLENBQUMsSUFBSSxLQUFLLGNBQUssQ0FBQyxPQUFPLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxDQUFDO1FBQ3BELENBQUMsRUFBRSxLQUFLLGNBQUssQ0FBQyxPQUFPLElBQUksUUFBUSxLQUFLLGtCQUFTLENBQUMsR0FBRyxDQUFDLEVBQ3BEO1FBQ0EsMEJBQTBCO0tBQzNCO0lBRUQsSUFDRSxDQUFDLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0QsQ0FBQyxRQUFRLEtBQUssa0JBQVMsQ0FBQyxNQUFNLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxDQUFDLEVBQzNEO1FBQ0EsMEJBQTBCO0tBQzNCO0lBRUQsSUFDRSxDQUFDLFFBQVEsS0FBSyxrQkFBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLEtBQUssa0JBQVMsQ0FBQyxLQUFLLENBQUM7UUFDMUQsQ0FBQyxRQUFRLEtBQUssa0JBQVMsQ0FBQyxLQUFLLElBQUksTUFBTSxLQUFLLGtCQUFTLENBQUMsR0FBRyxDQUFDLEVBQzFEO1FBQ0EsMEJBQTBCO0tBQzNCO0lBRUQsSUFBSSxRQUFRLEtBQUssa0JBQVMsQ0FBQyxJQUFJLEVBQUU7UUFDL0IsMEJBQTBCO0tBQzNCO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQXpERCxnREF5REMifQ==