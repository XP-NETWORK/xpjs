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
    cToP.set(5, chainParams.ropstenParams);
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
        baseURL: "https://nft-list.herokuapp.com/",
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
    const estimateFees = async (fromChain, toChain, nft, receiver) => {
        if (fromChain.isWrappedNft(nft)) {
            const decoded = fromChain.decodeWrappedNft(nft);
            const approxNft = await toChain.decodeNftFromRaw(decoded.data);
            const estimate = await toChain.estimateValidateUnfreezeNft(receiver, approxNft);
            const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
            return conv;
        }
        else {
            const packed = fromChain.wrapNftForTransfer(nft);
            const estimate = await toChain.estimateValidateTransferNft(receiver, packed);
            const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
            return conv;
        }
    };
    return {
        estimateFees,
        inner,
        updateParams(chainNonce, params) {
            map.delete(chainNonce);
            cToP.set(chainNonce, params);
        },
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
                chainId: chain.getNonce().toString(),
            };
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee) => {
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver);
            }
            if (fromChain.isWrappedNft(nft)) {
                const decoded = fromChain.decodeWrappedNft(nft);
                if (decoded.chain_nonce != toChain.getNonce()) {
                    throw Error("trying to send wrapped nft to non-origin chain!!!");
                }
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, fee);
                return res;
            }
            else {
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, fee);
                return res;
            }
        },
        mint: async (chain, owner, args) => {
            return chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQSxzQ0FBMEQ7QUFnQjFELCtEQUk4QjtBQUM5QixnRUFBcUM7QUFFckMsa0RBQTZDO0FBMEc3QyxTQUFTLGdCQUFnQixDQUN2QixXQUFpQztJQUVqQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFHakIsQ0FBQztJQUVKLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsY0FB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