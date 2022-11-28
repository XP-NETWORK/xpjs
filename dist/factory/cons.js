"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTokenId = exports.getDefaultContract = exports.checkBlockedContracts = exports.exchangeRateRepo = exports._headers = void 0;
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
function checkBlockedContracts(to, contract) {
    const chain = consts_1.CHAIN_INFO.get(to);
    if ((chain === null || chain === void 0 ? void 0 : chain.rejectUnfreeze) && (chain === null || chain === void 0 ? void 0 : chain.rejectUnfreeze.includes(contract))) {
        throw new Error(`Transfering to ${chain.name} is prohibited by NFT project team`);
    }
}
exports.checkBlockedContracts = checkBlockedContracts;
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
function prepareTokenId(tokenId, from) {
    var _a;
    if (tokenId) {
        const notNumber = isNaN(Number(tokenId));
        if (notNumber) {
            if (from === consts_1.Chain.ELROND) {
                const hex = (_a = tokenId.split("-")) === null || _a === void 0 ? void 0 : _a.at(2);
                return String(hex ? parseInt(hex, 16) : "");
            }
            if (from === consts_1.Chain.TON) {
                return "1";
            }
        }
        else {
            return tokenId;
        }
    }
    return undefined;
}
exports.prepareTokenId = prepareTokenId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUF5RDtBQUU1QyxRQUFBLFFBQVEsR0FBRztJQUN0QixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQztBQUVGLFNBQWdCLGdCQUFnQixDQUM5QixPQUFlO0lBRWYsTUFBTSxXQUFXLEdBQUcsbUNBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSxPQUFPLElBQUEsNkNBQXNCLEVBQzNCLElBQUEsbURBQTRCLEVBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFYRCw0Q0FXQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLEVBQU8sRUFBRSxRQUFnQjtJQUM3RCxNQUFNLEtBQUssR0FBRyxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxJQUFJLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLGNBQWMsTUFBSSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQSxFQUFFO1FBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQ2Isa0JBQWtCLEtBQUssQ0FBQyxJQUFJLG9DQUFvQyxDQUNqRSxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBUEQsc0RBT0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7O0lBRTFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLENBQ2hDLHlHQUF5RyxDQUMxRyxDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLE1BQU0s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