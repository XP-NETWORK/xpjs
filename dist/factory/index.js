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
    cToP.set(15, chainParams.algorandParams);
    cToP.set(16, chainParams.fuseParams);
    cToP.set(17, chainParams.uniqueParams);
    cToP.set(18, chainParams.tezosParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(appConfig, chainParams) {
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    const heartbeatRepo = heartbeat_1.bridgeHeartbeat(appConfig.heartbeatUri);
    const remoteExchangeRate = cons_1.exchangeRateRepo(appConfig.exchangeRateUri);
    const txSocket = __1.socketHelper(appConfig.txSocketUri);
    const nftlistRest = axios_1.default.create({
        baseURL: appConfig.nftListUri,
        headers: {
            Authorization: `Bearer ${appConfig.nftListAuthToken}`,
        },
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
    const estimateFees = async (fromChain, toChain, nft, receiver, mintWith) => {
        if (fromChain.isWrappedNft(nft)) {
            const estimate = await toChain.estimateValidateUnfreezeNft(receiver, nft);
            const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
            return conv;
        }
        else {
            if (!mintWith) {
                throw Error("mintWith required");
            }
            const estimate = await toChain.estimateValidateTransferNft(receiver, nft, mintWith);
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
            case 15: {
                return consts_1.Chain.ALGORAND;
            }
            case 16: {
                return consts_1.Chain.FUSE;
            }
            default: {
                throw Error(`unknown chain ${nonce}`);
            }
        }
    }
    return {
        async generatePreTransferTxn(from, sender, nft, fee) {
            return await from.preTransferRawTxn(nft, sender, fee);
        },
        async generateNftTxn(chain, toNonce, sender, receiver, nft, fee) {
            throw Error("TODO: impl");
            // if (chain.isWrappedNft(nft)) {
            //   return chain.unfreezeWrappedNftTxn(receiver, nft, fee, sender);
            // } else {
            //   return chain.transferNftToForeignTxn(
            //     toNonce,
            //     receiver,
            //     nft,
            //     fee,
            //     sender
            //   );
            // }
        },
        async generateMintTxn(chain, sender, nft) {
            return await chain.mintRawTxn(nft, sender);
        },
        async getDestinationTransaction(chain, targetNonce, txn) {
            const action = await chain.extractAction(txn);
            const hash = await txSocket.waitTxHash(targetNonce, action);
            const status = await chain.extractTxnStatus(hash);
            return [hash, status];
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
            const data = await nftlistRest
                .get(`/nfts/${chain.getNonce()}/${owner}`)
                .then((v) => v.data.data);
            return data;
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, mintWith, fee) => {
            await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver);
            }
            if (!(await toChain.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            if (fromChain.isWrappedNft(nft)) {
                const res = await fromChain.unfreezeWrappedNft(sender, toChain.getNonce(), receiver, nft, fee);
                return res;
            }
            else {
                if (!mintWith) {
                    throw Error("mint with required");
                }
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, mintWith, fee);
                return res;
            }
        },
        mint: async (chain, owner, args) => {
            return await chain.mintNft(owner, args);
        },
        waitAlgorandNft: async (origin, hash, claimer) => {
            const action = await origin.extractAction(hash);
            return await txSocket.waitAlgorandNft(origin.getNonce(), claimer.address, action);
        },
        claimableAlgorandNfts: async (claimer) => {
            const algo = await inner(consts_1.Chain.ALGORAND);
            return await algo.claimableNfts(txSocket, claimer);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBT0Esc0NBT21CO0FBQ25CLDhDQUE0QjtBQUU1QiwwQkFpQlk7QUFDWixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQUEwQztBQUMxQyxrREFBMkQ7QUFFM0QsNENBQStDO0FBRS9DLGtEQU02QjtBQUM3QixzREFBOEI7QUFDOUIseUNBQW1DO0FBMk9uQyxTQUFTLGdCQUFnQixDQUN2QixXQUFpQztJQUVqQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUUxQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXBDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQyxJQUFJ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