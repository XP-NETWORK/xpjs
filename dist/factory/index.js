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
const ethers_1 = require("ethers");
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
    cToP.set(19, chainParams.velasParams);
    cToP.set(20, chainParams.iotexParams);
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
    const estimateFees = async (fromChain, toChain, nft, receiver) => {
        const estimate = await fromChain.estimateValidateTransferNft(receiver, nft, "");
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
        return conv;
    };
    async function bridgeStatus() {
        const res = await heartbeatRepo.status();
        return Object.fromEntries(Object.entries(res).map(([c, s]) => [
            c,
            s.bridge_alive ? "alive" : "dead",
        ]));
    }
    async function estimateBatchFees(fromChain, toChain, nft, receiver) {
        const estimate = await fromChain.estimateValidateTransferNftBatch(receiver, nft, new Array(nft.length).fill(toChain.XpNft));
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate.times(nft.length));
        return conv;
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
    const oldXpWraps = [
        "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
        "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
        "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
        "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
        "0xE773Be36b35e7B58a9b23007057b5e2D4f6686a1",
        "0xFC2b3dB912fcD8891483eD79BA31b8E5707676C9",
        "0xb4A252B3b24AF2cA83fcfdd6c7Fac04Ff9d45A7D",
    ];
    async function checkNotOldWrappedNft(contract) {
        if (oldXpWraps.findIndex((x) => x === contract) !== -1) {
            throw new Error(`${contract} is an old wrapped NFT`);
        }
    }
    function checkMintWith(mw, contracts) {
        return (contracts.find((x) => x.toLowerCase() === mw.toLowerCase().trim()) !=
            undefined);
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
    async function getVerifiedContracts(from, tc, fc) {
        const res = await axios_1.default.get(`https://sc-verify.xp.network/verify/list?from=${from}&targetChain=${tc}&fromChain=${fc}`);
        return res.data.data.map((r) => r.to);
    }
    return {
        async generatePreTransferTxn(from, sender, nft, fee) {
            return await from.preTransferRawTxn(nft, sender, fee);
        },
        getVerifiedContracts,
        async generateNftTxn(chain, toNonce, sender, receiver, nft, fee, mw, nonce) {
            if (await chain.isWrappedNft(nft, appConfig.wrappedNftPrefix)) {
                return chain.unfreezeWrappedNftTxn(receiver, nft, fee, sender, nonce);
            }
            else {
                return chain.transferNftToForeignTxn(toNonce, receiver, nft, fee, sender, mw);
            }
        },
        async transferBatchNft(from, to, nfts, signer, receiver, fee, mw) {
            let result = [];
            await requireBridge([from.getNonce(), to.getNonce()]);
            if (!fee) {
                fee = await estimateBatchFees(from, to, nfts, receiver);
            }
            if (!(await to.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            const wrapped = [];
            const unwrapped = [];
            await Promise.all(nfts.map(async (e) => {
                // @ts-ignore
                if (e.native.contractType && e.native.contractType === "ERC721") {
                    throw new Error(`ERC721 is not supported`);
                }
                if (await from.isWrappedNft(e, appConfig.wrappedNftPrefix)) {
                    wrapped.push(e);
                }
                else {
                    unwrapped.push(e);
                }
            }));
            wrapped.length &&
                result.push(from.transferNftBatchToForeign(signer, to.getNonce(), receiver, unwrapped, mw || to.XpNft || "", new bignumber_js_1.default(fee)));
            unwrapped.length &&
                result.push(from.unfreezeWrappedNftBatch(signer, to.getNonce(), receiver, wrapped, new bignumber_js_1.default(fee)));
            return await Promise.all(result);
        },
        estimateBatchFees,
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
            let res = await nftlistRest.get(`/nfts/${chain.getNonce()}/${owner}`);
            if (res.headers["Retry-After"]) {
                await new Promise((r) => setTimeout(r, 30000));
                return await this.nftList(chain, owner);
            }
            return res.data.data;
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee, mintWith) => {
            //@ts-ignore
            if (nft.native.contract) {
                //@ts-ignore
                checkNotOldWrappedNft(new ethers_1.utils.getAddress(nft.native.contract));
            }
            const mw = 
            //@ts-ignore
            nft.native.contract &&
                mintWith &&
                checkMintWith(mintWith, 
                //@ts-ignore
                await getVerifiedContracts(
                //@ts-ignore
                nft.native.contract.toLowerCase(), toChain.getNonce(), fromChain.getNonce()))
                ? mintWith
                : toChain.XpNft;
            await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver);
            }
            if (!(await toChain.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            if (await fromChain.isWrappedNft(nft, appConfig.wrappedNftPrefix)) {
                const meta = await __1.extractWrappedMetadata(nft);
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, new bignumber_js_1.default(fee), toChain.getNonce().toString());
                return res;
            }
            else {
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, new bignumber_js_1.default(fee), mw || "");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBT0Esc0NBT21CO0FBQ25CLDhDQUE0QjtBQUU1QiwwQkFrQlk7QUFDWixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQUEwQztBQUMxQyxrREFBc0Q7QUFFdEQsNENBQStDO0FBQy9DLG1DQUEyRTtBQUMzRSxrREFNNkI7QUFDN0Isc0RBQThCO0FBQzlCLHlDQUFtQztBQTZRbkMsU0FBUyxnQkFBZ0IsQ0FDdkIsV0FBaUM7SUFFakMsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFFMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVwQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENB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