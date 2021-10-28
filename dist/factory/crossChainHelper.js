"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactory = void 0;
const consts_1 = require("../consts");
const crypto_exchange_rate_1 = require("crypto-exchange-rate");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const axios_1 = __importDefault(require("axios"));
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
    const nftlistRest = axios_1.default.create({
        baseURL: 'https://nft-list.herokuapp.com/'
    });
    const inner = async (chain) => {
        let helper = map.get(chain);
        if (helper === undefined) {
            helper = await consts_1.CHAIN_INFO[chain].constructor(cToP.get(chain));
        }
        return helper;
    };
    async function calcExchangeFees(fromChain, toChain, val) {
        const exrate = await remoteExchangeRate.getExchangeRate(consts_1.CHAIN_INFO[toChain].currency, consts_1.CHAIN_INFO[fromChain].currency);
        return val
            .dividedBy(consts_1.CHAIN_INFO[toChain].decimals)
            .times(exrate * 1.05)
            .times(consts_1.CHAIN_INFO[fromChain].decimals)
            .integerValue(bignumber_js_1.default.ROUND_CEIL);
    }
    return {
        inner,
        async nftList(chain, owner) {
            let endpoint;
            switch (chain.getNonce()) {
                case consts_1.Chain.ELROND:
                    endpoint = `/elrond/${owner}`;
                    break;
                default:
                    endpoint = `/web3/${chain.getNonce()}/${owner}`;
                    break;
            }
            const res = await nftlistRest.get(endpoint);
            return res.data;
        },
        async nftUri(chain, nft) {
            if (chain.isWrappedNft(nft)) {
                const decoded = chain.decodeWrappedNft(nft);
                const helper = await inner(decoded.chain_nonce);
                const native = await helper.decodeNftFromRaw(decoded.data);
                return await helper.populateNft(native);
            }
            return {
                uri: nft.uri,
                chainId: chain.getNonce().toString()
            };
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver) => {
            if (fromChain.isWrappedNft(nft)) {
                const decoded = fromChain.decodeWrappedNft(nft);
                if (decoded.chain_nonce != toChain.getNonce()) {
                    throw Error("trying to send wrapped nft to non-origin chain!!!");
                }
                const approxNft = await toChain.decodeNftFromRaw(decoded.data);
                const estimate = await toChain.estimateValidateUnfreezeNft(receiver, approxNft);
                const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
                const [, action] = await fromChain.unfreezeWrappedNft(sender, receiver, nft, conv);
                return action;
            }
            else {
                const packed = fromChain.wrapNftForTransfer(nft);
                const estimate = await toChain.estimateValidateTransferNft(receiver, packed);
                const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
                const [, action] = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, conv);
                return action;
            }
        },
        mint: async (chain, owner, args) => {
            return chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NDaGFpbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2Nyb3NzQ2hhaW5IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBR0Esc0NBQTBEO0FBRzFELCtEQUk4QjtBQUM5QixnRUFBcUM7QUFFckMsa0RBQTZDO0FBOEU3QyxTQUFTLGdCQUFnQixDQUN2QixXQUF3QjtJQUV4QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztJQUV2RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekMsT0FBTyxJQUFJLENBQUM7QUFDZCxD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