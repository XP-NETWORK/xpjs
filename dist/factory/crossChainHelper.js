"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactory = void 0;
const consts_1 = require("../consts");
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function mapNonceToParams(chainParams) {
    const cToP = new Map();
    cToP.set(2, chainParams.elrondParams);
    cToP.set(3, chainParams.hecoParams);
    cToP.set(4, chainParams.bscParams);
    cToP.set(6, chainParams.avalancheParams);
    cToP.set(7, chainParams.polygonParams);
    cToP.set(8, chainParams.fantomParams);
    cToP.set(9, chainParams.tronParams);
    cToP.set(11, chainParams.celoParams);
    cToP.set(12, chainParams.harmonyParams);
    cToP.set(13, chainParams.ontologyParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(chainParams) {
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    function configBatchExchangeService() {
        return crypto_exchange_rate_1.NetworkModel.batchExchangeRateService("https://testing-bridge.xp.network/exchange");
    }
    const remoteExchangeRate = crypto_exchange_rate_1.cachedExchangeRateRepo(crypto_exchange_rate_1.networkBatchExchangeRateRepo(configBatchExchangeService(), crypto_exchange_rate_1.NetworkModel.exchangeRateDtoMapper()));
    const inner = async (chain) => {
        let helper = map.get(chain);
        if (helper === undefined) {
            helper = await consts_1.CHAIN_INFO[chain].constructor(cToP.get(chain));
        }
        return helper;
    };
    return {
        inner,
        // TODO: Find some way to make this more generic, return a txn receipt, throw an exception, etc.
        transferNft: async (fromChain, toChain, nft, sender, receiver) => {
            const fromHelper = await inner(fromChain);
            const toHelper = await inner(toChain);
            const estimate = await toHelper.estimateValidateTransferNft(receiver, nft);
            console.log(`Estimate : ${estimate}`);
            const exrate = await remoteExchangeRate.getExchangeRate(consts_1.CHAIN_INFO[toChain].currency, consts_1.CHAIN_INFO[fromChain].currency);
            const conv = estimate
                .dividedBy(consts_1.CHAIN_INFO[toChain].decimals)
                .times(exrate * 1.05)
                .times(consts_1.CHAIN_INFO[fromChain].decimals)
                .integerValue(bignumber_js_1.default.ROUND_CEIL);
            console.log("Converted Value: ", conv.toString());
            if (nft.chain === fromChain) {
                const transfer = await fromHelper.transferNftToForeign(sender, toChain, receiver, nft.id, conv);
                return transfer;
            }
            else {
                if (fromHelper.isWrappedNft(nft)) {
                    const estimate = await toHelper.estimateValidateUnfreezeNft(receiver, nft.raw_data);
                    const exrate = await remoteExchangeRate.getExchangeRate(consts_1.CHAIN_INFO[toChain].currency, consts_1.CHAIN_INFO[fromChain].currency);
                    const conv = estimate
                        .dividedBy(consts_1.CHAIN_INFO[toChain].decimals)
                        .times(exrate * 1.05)
                        .times(consts_1.CHAIN_INFO[fromChain].decimals)
                        .integerValue(bignumber_js_1.default.ROUND_CEIL);
                    await fromHelper.unfreezeWrappedNft(sender, receiver, nft.id, conv);
                    if (fromChain == toChain) {
                        return;
                    }
                    else {
                        const receipt = await fromHelper.transferNftToForeign(sender, fromChain, receiver, nft.id, conv);
                        return receipt;
                    }
                }
            }
        },
        mint: async (chain, owner, args) => {
            return chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NDaGFpbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2Nyb3NzQ2hhaW5IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0Esc0NBQThDO0FBSzlDLCtEQUk4QjtBQUM5QixnRUFBcUM7QUFtRHJDLFNBQVMsZ0JBQWdCLENBQ3ZCLFdBQXdCO0lBRXhCLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFrRCxDQUFDO0lBRXZFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRW5DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVwQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFDRDs7OztHQUlHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLFdBQXdCO0lBQ25ELElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO0lBQzlDLElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLFNBQVMsMEJBQTBCO1FBQ2pDLE9BQU8sbUNBQVksQ0FBQyx3QkFBd0IsQ0FDMUMsNENBQTRDLENBQzdDLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxrQkFBa0IsR0FBRyw2Q0FBc0IsQ0FDL0MsbURBQTRCLENBQzFCLDBCQUEwQixFQUFFLEVBQzVCLG1DQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FDckMsQ0FDRixDQUFDO0lBRUYsTUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFFLEtBQVksRUFBNkIsRUFBRTtRQUM5RCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN4QixNQUFNLEdBQUcsTUFBTSxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUM7U0FDaEU7UUFDRCxPQUFPLE1BQU8sQ0FBQztJQUNqQixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSztRQUNMLGdHQUFnRztRQUNoRyxXQUFXLEVBQUUsS0FBSyxFQUNoQixTQUFnQixFQUNoQixPQUFjLEVBQ2QsR0FBUSxFQUNSLE1BQWlDLEVBQ2pDLFFBQTBCLEVBQ1osRUFBRTtZQUNoQixNQUFNLFVBQVUsR0FBRyxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQywyQkFBMkIsQ0FDekQsUUFBUSxFQUNSLEdBQUcsQ0FDSixDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxlQUFlLENBQ3JELG1CQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUM1QixtQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FDL0IsQ0FBQztZQUNGLE1BQU0sSUFBSSxHQUFHLFFBQVE7aUJBQ2xCLFNBQVMsQ0FBQyxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDdkMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7aUJBQ3BCLEtBQUssQ0FBQyxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDckMsWUFBWSxDQUFDLHNCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUMzQixNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxvQkFBb0IsQ0FDcEQsTUFBTSxFQUNOLE9BQU8sRUFDUCxRQUFRLEVBQ1IsR0FBRyxDQUFDLEVBQUUsRUFDTixJQUFJLENBQ0wsQ0FBQztnQkFDRixPQUFPLFFBQVEsQ0FBQzthQUNqQjtpQkFBTTtnQkFDTCxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLDJCQUEyQixDQUN6RCxRQUFRLEVBQ1IsR0FBRyxDQUFDLFFBQVEsQ0FDYixDQUFDO29CQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsZUFBZSxDQUNyRCxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFDNUIsbUJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQy9CLENBQUM7b0JBRUYsTUFBTSxJQUFJLEdBQUcsUUFBUTt5QkFDbEIsU0FBUyxDQUFDLG1CQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO3lCQUN2QyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzt5QkFDcEIsS0FBSyxDQUFDLG1CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO3lCQUNyQyxZQUFZLENBQUMsc0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEMsTUFBTSxVQUFVLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNwRSxJQUFJLFNBQVMsSUFBSSxPQUFPLEVBQUU7d0JBQ3hCLE9BQU87cUJBQ1I7eUJBQU07d0JBQ0wsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsb0JBQW9CLENBQ25ELE1BQU0sRUFDTixTQUFTLEVBQ1QsUUFBUSxFQUNSLEdBQUcsQ0FBQyxFQUFFLEVBQ04sSUFBSSxDQUNMLENBQUM7d0JBQ0YsT0FBTyxPQUFPLENBQUM7cUJBQ2hCO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDO1FBQ0QsSUFBSSxFQUFFLEtBQUssRUFDVCxLQUF3QyxFQUN4QyxLQUFhLEVBQ2IsSUFBaUIsRUFDSCxFQUFFO1lBQ2hCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBcEdELG9DQW9HQyJ9