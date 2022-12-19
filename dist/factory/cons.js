"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTokenId =
  exports.getDefaultContract =
  exports.checkBlockedContracts =
  exports.exchangeRateRepo =
  exports._headers =
    void 0;
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const consts_1 = require("../consts");
exports._headers = {
  "Content-Type": "application/json",
  Accept: "*/*",
};
function exchangeRateRepo(baseUrl) {
  const baseService =
    crypto_exchange_rate_1.NetworkModel.batchExchangeRateService(baseUrl);
  return (0, crypto_exchange_rate_1.cachedExchangeRateRepo)(
    (0, crypto_exchange_rate_1.networkBatchExchangeRateRepo)(
      baseService,
      crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()
    )
  );
}
exports.exchangeRateRepo = exchangeRateRepo;
function checkBlockedContracts(to, contract) {
  const chain = consts_1.CHAIN_INFO.get(to);
  if (chain?.rejectUnfreeze && chain?.rejectUnfreeze.includes(contract)) {
    throw new Error(
      `Transfering to ${chain.name} is prohibited by the NFT project team`
    );
  }
}
exports.checkBlockedContracts = checkBlockedContracts;
function getDefaultContract(nft, fromChain, toChain) {
  const defaultMintError = new Error(
    `Transfer has been canceled. The NFT you are trying to send will be minted with a default NFT collection`
  );
  const from = fromChain.getNonce();
  const to = toChain.getNonce();
  const fromType = consts_1.CHAIN_INFO.get(from)?.type;
  const toType = consts_1.CHAIN_INFO.get(to)?.type;
  const contract =
    //@ts-ignore contractType is checked
    "contractType" in nft.native &&
    //@ts-ignore contractType is checked
    nft.native.contractType === "ERC1155" &&
    toChain.XpNft1155
      ? toChain.XpNft1155
      : toChain.XpNft;
  if (
    typeof window !== "undefined" &&
    (/(allowDefaultMint=true)/.test(window.location.search) ||
      /testnet/.test(window.location.pathname))
  ) {
    return contract;
  }
  if (
    (from === consts_1.Chain.VECHAIN && toType === consts_1.ChainType.EVM) ||
    (to === consts_1.Chain.VECHAIN && fromType === consts_1.ChainType.EVM)
  ) {
    throw defaultMintError;
  }
  if (
    (fromType === consts_1.ChainType.EVM &&
      toType === consts_1.ChainType.ELROND) ||
    (fromType === consts_1.ChainType.ELROND &&
      toType === consts_1.ChainType.EVM)
  ) {
    throw defaultMintError;
  }
  if (
    (fromType === consts_1.ChainType.EVM &&
      toType === consts_1.ChainType.TEZOS) ||
    (fromType === consts_1.ChainType.TEZOS && toType === consts_1.ChainType.EVM)
  ) {
    throw defaultMintError;
  }
  if (fromType === consts_1.ChainType.TRON) {
    throw defaultMintError;
  }
  return contract;
}
exports.getDefaultContract = getDefaultContract;
function prepareTokenId(tokenId, from) {
  if (tokenId) {
    const notNumber = isNaN(Number(tokenId));
    if (notNumber) {
      if (from === consts_1.Chain.ELROND) {
        const hex = tokenId.split("-")?.at(2);
        return String(hex ? parseInt(hex, 16) : "");
      }
      if (from === consts_1.Chain.TON) {
        return "1";
      }
    } else {
      return tokenId;
    }
  }
  return undefined;
}
exports.prepareTokenId = prepareTokenId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2NvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBTThCO0FBSTlCLHNDQUF5RDtBQUU1QyxRQUFBLFFBQVEsR0FBRztJQUN0QixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQztBQUVGLFNBQWdCLGdCQUFnQixDQUM5QixPQUFlO0lBRWYsTUFBTSxXQUFXLEdBQUcsbUNBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuRSxPQUFPLElBQUEsNkNBQXNCLEVBQzNCLElBQUEsbURBQTRCLEVBQzFCLFdBQVcsRUFDWCxtQ0FBWSxDQUFDLHFCQUFxQixFQUFFLENBQ3JDLENBQ0YsQ0FBQztBQUNKLENBQUM7QUFYRCw0Q0FXQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLEVBQU8sRUFBRSxRQUFnQjtJQUM3RCxNQUFNLEtBQUssR0FBRyxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxJQUFJLEtBQUssRUFBRSxjQUFjLElBQUksS0FBSyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDckUsTUFBTSxJQUFJLEtBQUssQ0FDYixrQkFBa0IsS0FBSyxDQUFDLElBQUksd0NBQXdDLENBQ3JFLENBQUM7S0FDSDtBQUNILENBQUM7QUFQRCxzREFPQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxHQUFxQixFQUNyQixTQUE0QyxFQUM1QyxPQUEwQztJQUUxQyxNQUFNLGdCQUFnQixHQUFHLElBQUksS0FBSyxDQUNoQyx5R0FBeUcsQ0FDMUcsQ0FBQztJQUVGLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUIsTUFBTSxRQUFRLEdB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
