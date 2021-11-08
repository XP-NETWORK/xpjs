"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactory = void 0;
const consts_1 = require("../consts");
__exportStar(require("./factories"), exports);
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const axios_1 = __importDefault(require("axios"));
const cons_1 = require("./cons");
const out_1 = require("@elrondnetwork/erdjs/out");
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
    cToP.set(14, chainParams.xDaiParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(appConfig, chainParams) {
    var _a;
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    const remoteExchangeRate = cons_1.exchangeRateRepo(appConfig.exchangeRateUri);
    const elrondNftRepo = cons_1.elrondNftList(((_a = chainParams.elrondParams) === null || _a === void 0 ? void 0 : _a.node_uri) || '');
    const moralisNftRepo = cons_1.moralisNftList(appConfig.moralisServer, appConfig.moralisAppId);
    const tronNftRepo = chainParams.tronParams && cons_1.tronListNft(chainParams.tronParams.provider, appConfig.tronScanUri);
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
            let res;
            switch (chain.getNonce()) {
                case consts_1.Chain.ELROND:
                    res = await elrondNftRepo.nfts(BigInt(chain.getNonce()), new out_1.Address(owner));
                    break;
                case consts_1.Chain.TRON:
                    res = await tronNftRepo.nfts(BigInt(0x9), owner);
                    break;
                case consts_1.Chain.FANTOM:
                    res = await nftlistRest.get(`/web3/${chain.getNonce()}/${owner}`).then(v => v.data);
                    break;
                default:
                    res = await moralisNftRepo.nfts(BigInt(chain.getNonce()), owner);
                    break;
            }
            return res;
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
            if (!await toChain.validateAddress(receiver)) {
                throw Error('invalid address');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBR0Esc0NBQTBEO0FBQzFELDhDQUEyQjtBQWlCM0IsZ0VBQXFDO0FBRXJDLGtEQUE2QztBQUM3QyxpQ0FBc0Y7QUFDdEYsa0RBQW1EO0FBa0huRCxTQUFTLGdCQUFnQixDQUN2QixXQUFpQztJQUVqQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFHakIsQ0FBQztJQUVKLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxJQUFJLENB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