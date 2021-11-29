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
const __1 = require("..");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const axios_1 = __importDefault(require("axios"));
const cons_1 = require("./cons");
const out_1 = require("@elrondnetwork/erdjs/out");
const heartbeat_1 = require("../heartbeat");
const algorand_1 = require("../helpers/algorand");
const algosdk_1 = __importDefault(require("algosdk"));
const js_base64_1 = require("js-base64");
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
    const txSocket = __1.socketHelper(appConfig.txSocketUri);
    const elrondNftRepo = cons_1.elrondNftList(((_a = chainParams.elrondParams) === null || _a === void 0 ? void 0 : _a.node_uri) || "");
    const moralisNftRepo = cons_1.moralisNftList(appConfig.moralisServer, appConfig.moralisAppId, appConfig.moralisSecret);
    // appConfig.moralisNetwork === "mainnet"
    //   ? moralisNftList(
    //       appConfig.moralisServer,
    //       appConfig.moralisAppId,
    //       appConfig.moralisSecret
    //     )
    //   : moralisTestnetNftList(
    //       appConfig.moralisServer,
    //       appConfig.moralisAppId,
    //       appConfig.moralisSecret
    //     );
    const tronNftRepo = chainParams.tronParams &&
        cons_1.tronListNft(chainParams.tronParams.provider, appConfig.tronScanUri, chainParams.tronParams.erc721_addr);
    const algoNftRepo = chainParams.algorandParams &&
        cons_1.algoListNft(chainParams.algorandParams.algodUri);
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
        async getDestinationTransaction(chain, targetNonce, hash) {
            const action = await chain.extractAction(hash);
            return await txSocket.waitTxHash(targetNonce, action);
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
                case consts_1.Chain.ALGORAND: {
                    const algo = await inner(consts_1.Chain.ALGORAND);
                    const mnem = algosdk_1.default.secretKeyToMnemonic(js_base64_1.Base64.toUint8Array(key));
                    return algorand_1.algoSignerWrapper(algo.algod, algosdk_1.default.mnemonicToSecretKey(mnem));
                }
                default: {
                    const chainH = await inner(chain);
                    return chainH.createWallet(key);
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
                    res = (await algoNftRepo.nfts(BigInt(0xf), owner));
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
        claimAlgorandNft: async (origin, hash, claimer) => {
            const action = await origin.extractAction(hash);
            const algo = await inner(consts_1.Chain.ALGORAND);
            return await algo.claimAlgorandNft(claimer, action, txSocket);
        }
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBR0Esc0NBT21CO0FBQ25CLDhDQUE0QjtBQUU1QiwwQkFXWTtBQUNaLGdFQUFxQztBQUVyQyxrREFBMEI7QUFDMUIsaUNBT2dCO0FBQ2hCLGtEQUErRDtBQUUvRCw0Q0FBK0M7QUFFL0Msa0RBQWlIO0FBQ2pILHNEQUE4QjtBQUM5Qix5Q0FBbUM7QUF5S25DLFNBQVMsZ0JBQWdCLENBQ3ZCLFdBQWlDO0lBRWpDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUdqQixDQUFDO0lBRUosSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVwQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckMsSUFBSSxD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