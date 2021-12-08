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
    const algoLister = cons_1.algoListNft("https://algoexplorerapi.io/");
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
        async generatePreTransferTxn(from, sender, nft, fee) {
            return await from.preTransferRawTxn(nft, sender, fee);
        },
        async generateNftTxn(chain, toNonce, sender, receiver, nft, fee) {
            if (chain.isWrappedNft(nft)) {
                return chain.unfreezeWrappedNftTxn(receiver, nft, fee, sender);
            }
            else {
                return chain.transferNftToForeignTxn(toNonce, receiver, nft, fee, sender);
            }
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
            if (chain.getNonce() === consts_1.Chain.ALGORAND) {
                return (await algoLister.nfts(BigInt(0xf), owner));
            }
            return await nftlistRest
                .get(`/${chain.getNonce()}/${owner}`)
                .then((v) => v.data);
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
            return await algo.claimAlgorandNft(claimer, origin.getNonce(), action, txSocket);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBT0Esc0NBT21CO0FBQ25CLDhDQUE0QjtBQUU1QiwwQkFpQlk7QUFDWixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQUF1RDtBQUN2RCxrREFBc0Q7QUFFdEQsNENBQStDO0FBRS9DLGtEQUs2QjtBQUM3QixzREFBOEI7QUFDOUIseUNBQW1DO0FBcU5uQyxTQUFTLGdCQUFnQixDQUN2QixXQUFpQztJQUtqQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFHakIsQ0FBQztJQUVKLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFDRDs7Ozs7R0FLRztBQUNILFNBQWdCLFlBQVksQ0FDMUIsU0FBb0IsRUFDcEIsV0FBaUM7SUFFakMsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7SUFDOUMsSUFBSSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFekMsTUFBTSxhQUFhLEdBQUcsMkJBQWUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFOUQsTUFBTSxrQkFBa0IsR0FBRyx1QkFBZ0IsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFdkUsTUFBTSxRQUFRLEdBQUcsZ0JBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFckQsTUFBTSxXQUFXLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixPQUFPLEVBQUUsU0FBUyxDQUFDLFVBQVU7UUFDN0IsT0FBTyxFQUFFO1lBQ1AsYUFBYSxFQUFFLFVBQVUsU0FBUyxDQUFDLGdCQUFnQixFQUFFO1NBQ3REO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFRLEtBQXVCLEVBQWMsRUFBRTtRQUNoRSxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN4QixNQUFNLEdBQUcsTUFBTSxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUM7U0FDaEU7UUFDRCxPQUFPLE1BQW1CLENBQUM7SUFDN0IsQ0FBQyxDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQUcsa0JBQVcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBRTlELEtBQUssVUFBVSxnQkFBZ0IsQ0FDN0IsU0FBaUIsRUFDakIsT0FBZSxFQUNmLEdBQWM7UUFFZCxNQUFNLE1BQU0sR0FBRyxNQUFNLGtCQUFrQixDQUFDLGVBQWUsQ0FDckQsbUJBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQzVCLG1CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUMvQixDQUFDO1FBRUYsT0FBTyxHQUFHO2FBQ1AsU0FBUyxDQUFDLG1CQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3ZDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2FBQ3BCLEtBQUssQ0FBQyxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUNyQyxZQUFZLENBQUMsc0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUN4QixTQUE0QyxFQUM1QyxPQUEwQyxFQUMxQyxHQUFxQixFQUNyQixRQUFnQixFQUNoQixFQUFFO1FBQ0YsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLDJCQUEyQixDQUN4RCxRQUFRLEVBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FDUixDQUFDO1lBQ0YsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBZ0IsQ0FDakMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUNwQixPQUFPLENBQUMsUUFBUSxFQUFFLEVBQ2xCLFFBQVEsQ0FDVCxDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUM7U0FDYjthQUFNO1lBQ0wsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsMkJBQTJCLENBQ3hELFFBQVEsRUFDUixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQjthQUNyQyxDQUFDO1lBQ0YsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBZ0IsQ0FDakMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUNwQixPQUFPLENBQUMsUUFBUSxFQUFFLEVBQ2xCLFFBQVEsQ0FDVCxDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUMsQ0FBQztJQUVGLEtBQUssVUFBVSxZQUFZO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pDLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbEMsQ0FBQztZQUNELENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtTQUNsQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLE1BQWdCO1FBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVDLElBQUksU0FBNkIsQ0FBQztRQUNsQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULFNBQVMsR0FBRyxDQUFDLENBQUM7YUFDZjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsTUFBTSxLQUFLLENBQUMsU0FBUyxTQUFTLHdDQUF3QyxDQUFDLENBQUM7U0FDekU7SUFDSCxDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FDeEIsS0FBYTtRQUViLFFBQVEsS0FBSyxFQUFFO1lBQ2IsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDTixPQUFPLGNBQUssQ0FBQyxNQUFNLENBQUM7YUFDckI7WUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNOLE9BQU8sY0FBSyxDQUFDLElBQUksQ0FBQzthQUNuQjtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sT0FBTyxjQUFLLENBQUMsR0FBRyxDQUFDO2FBQ2xCO1lBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDTixPQUFPLGNBQUssQ0FBQyxRQUFRLENBQUM7YUFDdkI7WUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNOLE9BQU8sY0FBSyxDQUFDLFNBQVMsQ0FBQzthQUN4QjtZQUNELEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ04sT0FBTyxjQUFLLENBQUMsT0FBTyxDQUFDO2FBQ3RCO1lBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDTixPQUFPLGNBQUssQ0FBQyxNQUFNLENBQUM7YUFDckI7WUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNOLE9BQU8sY0FBSyxDQUFDLElBQUksQ0FBQzthQUNuQjtZQUNELEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ1AsT0FBTyxjQUFLLENBQUMsSUFBSSxDQUFDO2FBQ25CO1lBQ0QsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDUCxPQUFPLGNBQUssQ0FBQyxPQUFPLENBQUM7YUFDdEI7WUFDRCxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNQLE9BQU8sY0FBSyxDQUFDLElBQUksQ0FBQzthQUNuQjtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQ2pELE9BQU8sTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDN0QsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNoRTtpQkFBTTtnQkFDTCxPQUFPLEtBQUssQ0FBQyx1QkFBdUIsQ0FDbEMsT0FBTyxFQUNQLFFBQVEsRUFDUixHQUFHLEVBQ0gsR0FBRyxFQUNILE1BQU0sQ0FDUCxDQUFDO2FBQ0g7UUFDSCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUc7WUFDdEMsT0FBTyxNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDRCxLQUFLLENBQUMseUJBQXlCLENBQzdCLEtBQTBDLEVBQzFDLFdBQW1CLEVBQ25CLEdBQU07WUFFTixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxpQkFBaUI7UUFDakIsS0FBSyxDQUFDLFlBQVksQ0FBSSxLQUE2QixFQUFFLEdBQVc7WUFDOUQsSUFBSSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsUUFBUSxLQUFLLEVBQUU7Z0JBQ2IsS0FBSyxjQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2pCLE9BQU8sZ0JBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFpQixDQUFDO2lCQUNoRDtnQkFDRCxLQUFLLGNBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDZixPQUFPLEdBQW1CLENBQUM7aUJBQzVCO2dCQUNELEtBQUssY0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNuQixNQUFNLElBQUksR0FBbUIsTUFBTSxLQUFLLENBQUMsY0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN6RCxNQUFNLElBQUksR0FBRyxpQkFBTyxDQUFDLG1CQUFtQixDQUFDLGtCQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLE9BQU8sNEJBQWlCLENBQ3RCLElBQUksQ0FBQyxLQUFLLEVBQ1YsaUJBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FDbEIsQ0FBQztpQkFDbkI7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7b0JBQ1AsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQXdCLEtBQUssQ0FBQyxDQUFDO29CQUN6RCxPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFpQixDQUFDO2lCQUNqRDthQUNGO1FBQ0gsQ0FBQztRQUNELFlBQVk7UUFDWixLQUFLO1FBQ0wsWUFBWTtRQUNaLFlBQVksQ0FBUSxVQUE2QixFQUFFLE1BQVU7WUFDM0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFhLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBSSxLQUFxQixFQUFFLEtBQWE7WUFDbkQsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDdkMsT0FBTyxDQUFDLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNYLEtBQUssQ0FDTixDQUE0QixDQUFDO2FBQy9CO1lBQ0QsT0FBTyxNQUFNLFdBQVc7aUJBQ3JCLEdBQUcsQ0FBZSxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztpQkFDbEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNELFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNwRSxNQUFNLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1IsR0FBRyxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsSUFBSSxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDaEM7WUFDRCxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQzdELE1BQU0sS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7aUJBQ2xFO2dCQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixDQUM1QyxNQUFNLEVBQ04sUUFBUSxFQUNSLEdBQUcsRUFDSCxHQUFHLENBQ0osQ0FBQztnQkFDRixPQUFPLEdBQUcsQ0FBQzthQUNaO2lCQUFNO2dCQUNMLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLG9CQUFvQixDQUM5QyxNQUFNLEVBQ04sT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUNsQixRQUFRLEVBQ1IsR0FBRyxFQUNILEdBQUcsQ0FDSixDQUFDO2dCQUNGLE9BQU8sR0FBRyxDQUFDO2FBQ1o7UUFDSCxDQUFDO1FBQ0QsSUFBSSxFQUFFLEtBQUssRUFDVCxLQUEyQyxFQUMzQyxLQUFhLEVBQ2IsSUFBaUIsRUFDQSxFQUFFO1lBQ25CLE9BQU8sTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDaEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELE1BQU0sSUFBSSxHQUFtQixNQUFNLEtBQUssQ0FBQyxjQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekQsT0FBTyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FDaEMsT0FBTyxFQUNQLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFDakIsTUFBTSxFQUNOLFFBQVEsQ0FDVCxDQUFDO1FBQ0osQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBNVFELG9DQTRRQyJ9