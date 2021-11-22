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
const heartbeat_1 = require("../heartbeat");
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
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(appConfig, chainParams) {
    var _a;
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    const heartbeatRepo = heartbeat_1.bridgeHeartbeat(appConfig.heartbeatUri);
    const remoteExchangeRate = cons_1.exchangeRateRepo(appConfig.exchangeRateUri);
    const elrondNftRepo = cons_1.elrondNftList(((_a = chainParams.elrondParams) === null || _a === void 0 ? void 0 : _a.node_uri) || "");
    const moralisNftRepo = cons_1.moralisNftList(appConfig.moralisServer, appConfig.moralisAppId, appConfig.moralisSecret);
    const tronNftRepo = chainParams.tronParams &&
        cons_1.tronListNft(chainParams.tronParams.provider, appConfig.tronScanUri, chainParams.tronParams.erc721_addr);
    const algoNftRepo = chainParams.algorandParams && cons_1.algoListNft(chainParams.algorandParams.algodUri);
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
            const estimate = await toChain.estimateValidateUnfreezeNft(receiver, nft.uri);
            const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
            return conv;
        }
        else {
            const estimate = await toChain.estimateValidateTransferNft(receiver, "a".repeat(55) // approx size of uri
            );
            const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
            return conv;
        }
    };
    async function bridgeStatus() {
        const res = await heartbeatRepo.status();
        return Object.fromEntries(Object.entries(res).map(([c, s]) => [
            c,
            s.bridge_alive ? "alive" : "dead",
        ]));
    }
    async function requireBridge(chains) {
        const status = await heartbeatRepo.status();
        let deadChain;
        const alive = chains.every((c) => {
            const stat = status[c].bridge_alive;
            if (!stat) {
                deadChain = c;
            }
            return stat;
        });
        if (!alive) {
            throw Error(`chain ${deadChain} is dead! its unsafe to use the bridge`);
        }
    }
    function nonceToChainNonce(nonce) {
        switch (nonce) {
            case 2: {
                return consts_1.Chain.ELROND;
            }
            case 3: {
                return consts_1.Chain.HECO;
            }
            case 4: {
                return consts_1.Chain.BSC;
            }
            case 5: {
                return consts_1.Chain.ETHEREUM;
            }
            case 6: {
                return consts_1.Chain.AVALANCHE;
            }
            case 7: {
                return consts_1.Chain.POLYGON;
            }
            case 8: {
                return consts_1.Chain.FANTOM;
            }
            case 9: {
                return consts_1.Chain.TRON;
            }
            case 11: {
                return consts_1.Chain.CELO;
            }
            case 12: {
                return consts_1.Chain.HARMONY;
            }
            case 14: {
                return consts_1.Chain.XDAI;
            }
            default: {
                throw Error(`unknown chain ${nonce}`);
            }
        }
    }
    return {
        getDestinationTransaction(hash, chain) {
            return chain.extractTxn(hash);
        },
        nonceToChainNonce,
        async pkeyToSigner(nonce, key) {
            let chain = nonceToChainNonce(nonce);
            switch (chain) {
                case consts_1.Chain.ELROND: {
                    return out_1.UserSigner.fromPem(key);
                }
                case consts_1.Chain.TRON: {
                    return key;
                }
                default: {
                    const inner = await this.inner(chain);
                    return inner.createWallet(key);
                }
            }
        },
        estimateFees,
        inner,
        bridgeStatus,
        updateParams(chainNonce, params) {
            map.delete(chainNonce);
            cToP.set(chainNonce, params);
        },
        async nftList(chain, owner) {
            let res;
            switch (chain.getNonce()) {
                case consts_1.Chain.ELROND:
                    res = (await elrondNftRepo.nfts(BigInt(chain.getNonce()), new out_1.Address(owner)));
                    break;
                case consts_1.Chain.TRON:
                    res = (await tronNftRepo.nfts(BigInt(0x9), owner));
                    break;
                case consts_1.Chain.ALGORAND:
                    res = await algoNftRepo.nfts(BigInt(0xf), owner);
                    break;
                case consts_1.Chain.FANTOM:
                case consts_1.Chain.XDAI:
                    res = await nftlistRest
                        .get(`/web3/${chain.getNonce()}/${owner}`)
                        .then((v) => v.data);
                    break;
                default:
                    res = (await moralisNftRepo.nfts(BigInt(chain.getNonce()), owner));
                    break;
            }
            return res;
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee) => {
            await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver);
            }
            if (!(await toChain.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            if (fromChain.isWrappedNft(nft)) {
                const meta = await axios_1.default.get(nft.uri);
                if (meta.data.wrapped.origin != toChain.getNonce().toString()) {
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
            return await chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBR0Esc0NBT21CO0FBQ25CLDhDQUE0QjtBQWE1QixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQU1nQjtBQUNoQixrREFBK0Q7QUFFL0QsNENBQStDO0FBMEkvQyxTQUFTLGdCQUFnQixDQUN2QixXQUFpQztJQUVqQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFHakIsQ0FBQztJQUVKLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJ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