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
    cToP.set(consts_1.Chain.ELROND, chainParams.elrondParams);
    cToP.set(consts_1.Chain.HECO, chainParams.hecoParams);
    cToP.set(consts_1.Chain.BSC, chainParams.bscParams);
    cToP.set(consts_1.Chain.ETHEREUM, chainParams.ropstenParams);
    cToP.set(consts_1.Chain.AVALANCHE, chainParams.avalancheParams);
    cToP.set(consts_1.Chain.POLYGON, chainParams.polygonParams);
    cToP.set(consts_1.Chain.FANTOM, chainParams.fantomParams);
    cToP.set(consts_1.Chain.TRON, chainParams.tronParams);
    cToP.set(consts_1.Chain.CELO, chainParams.celoParams);
    cToP.set(consts_1.Chain.HARMONY, chainParams.harmonyParams);
    cToP.set(consts_1.Chain.ONT, chainParams.ontologyParams);
    cToP.set(consts_1.Chain.XDAI, chainParams.xDaiParams);
    cToP.set(consts_1.Chain.ALGORAND, chainParams.algorandParams);
    cToP.set(consts_1.Chain.FUSE, chainParams.fuseParams);
    cToP.set(consts_1.Chain.UNIQUE, chainParams.uniqueParams);
    cToP.set(consts_1.Chain.TEZOS, chainParams.tezosParams);
    cToP.set(consts_1.Chain.VELAS, chainParams.velasParams);
    cToP.set(consts_1.Chain.IOTEX, chainParams.iotexParams);
    cToP.set(consts_1.Chain.AURORA, chainParams.auroraParams);
    cToP.set(consts_1.Chain.GODWOKEN, chainParams.godwokenParams);
    cToP.set(consts_1.Chain.GATECHAIN, chainParams.gateChainParams);
    cToP.set(consts_1.Chain.VECHAIN, chainParams.vechainParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(appConfig, chainParams) {
    let helpers = new Map();
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
        let helper = helpers.get(chain);
        if (helper === undefined) {
            helper = await consts_1.CHAIN_INFO.get(chain).constructor(cToP.get(chain));
            helpers.set(chain, helper);
        }
        return helper;
    };
    async function calcExchangeFees(fromChain, toChain, val, toChainFee) {
        const rate = await remoteExchangeRate.getBatchedRate([
            consts_1.CHAIN_INFO.get(toChain).currency,
            consts_1.CHAIN_INFO.get(fromChain).currency,
        ]);
        const feeR = val.dividedBy(consts_1.CHAIN_INFO.get(toChain).decimals);
        const fromExRate = rate.get(consts_1.CHAIN_INFO.get(fromChain).currency);
        const toExRate = rate.get(consts_1.CHAIN_INFO.get(toChain).currency);
        const usdFee = Math.min(Math.max(toChainFee.min, feeR.times(toExRate * 0.1).toNumber()), toChainFee.max);
        const feeProfit = usdFee / fromExRate;
        return feeR
            .times(toExRate / fromExRate)
            .plus(feeProfit)
            .times(consts_1.CHAIN_INFO.get(fromChain).decimals)
            .integerValue(bignumber_js_1.default.ROUND_CEIL);
    }
    const estimateFees = async (fromChain, toChain, nft, receiver) => {
        const estimate = await toChain.estimateValidateTransferNft(receiver, nft, "");
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate, toChain.getFeeMargin());
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
        const estimate = await toChain.estimateValidateTransferNftBatch(receiver, nft, new Array(nft.length).fill(toChain.XpNft));
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate.times(nft.length), toChain.getFeeMargin());
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
    const oldXpWraps = new Set([
        "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
        "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
        "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
        "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
        "0xE773Be36b35e7B58a9b23007057b5e2D4f6686a1",
        "0xFC2b3dB912fcD8891483eD79BA31b8E5707676C9",
        "0xb4A252B3b24AF2cA83fcfdd6c7Fac04Ff9d45A7D",
    ]);
    function checkNotOldWrappedNft(contract) {
        if (oldXpWraps.has(contract)) {
            throw new Error(`${contract} is an old wrapped NFT`);
        }
    }
    function checkMintWith(mw, contracts) {
        return (contracts.find((x) => x.toLowerCase() === mw.toLowerCase().trim()) !=
            undefined);
    }
    async function isWrappedNft(nft, fc) {
        var _a, _b, _c, _d;
        if (fc === consts_1.Chain.TEZOS) {
            return (typeof ((_c = (_b = (_a = nft.native.meta) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.metadata) === null || _c === void 0 ? void 0 : _c.wrapped) !==
                "undefined");
        }
        try {
            checkNotOldWrappedNft(nft.collectionIdent);
        }
        catch (_) {
            return false;
        }
        return (typeof ((_d = (await axios_1.default.get(nft.uri).catch(() => undefined))) === null || _d === void 0 ? void 0 : _d.data.wrapped) !==
            "undefined");
    }
    async function algoOptInCheck(nft, toChain, receiver) {
        const nftDat = await axios_1.default.get(nft.uri);
        if (nftDat.data.wrapped.origin == consts_1.Chain.ALGORAND.toString() &&
            ("isOptIn" in toChain) &&
            !await toChain.isOptIn(receiver, parseInt(nftDat.data.wrapped.assetID))) {
            throw Error("receiver hasn't opted-in to wrapped nft");
        }
    }
    async function getVerifiedContracts(from, tc, fc) {
        const res = await axios_1.default.get(`https://sc-verify.xp.network/verify/list?from=${from}&targetChain=${tc}&fromChain=${fc}`);
        return res.data.data.map((r) => r.to);
    }
    return {
        getVerifiedContracts,
        balance: (i, a) => i.balance(a),
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
                if (await isWrappedNft(e, from.getNonce())) {
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
        async getDestinationTransaction(chain, targetNonce, txn) {
            const action = await chain.extractAction(txn);
            const hash = await txSocket.waitTxHash(targetNonce, action);
            const status = await chain.extractTxnStatus(hash);
            return [hash, status];
        },
        async pkeyToSigner(nonce, key) {
            switch (nonce) {
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
                    const chainH = (await inner(nonce));
                    return chainH.createWallet(key);
                }
            }
        },
        estimateFees,
        inner,
        bridgeStatus,
        updateParams(chainNonce, params) {
            helpers.delete(chainNonce);
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
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee, mintWith, gasLimit) => {
            //@ts-ignore
            if (nft.native.contract) {
                if (fromChain.getNonce() !== 9 && fromChain.getNonce() !== 18) {
                    //@ts-ignore
                    checkNotOldWrappedNft(new ethers_1.utils.getAddress(nft.native.contract));
                }
            }
            const mw = "contract" in nft.native &&
                mintWith &&
                checkMintWith(mintWith, await getVerifiedContracts(
                //@ts-expect-error contract is checked
                nft.native.contract.toLowerCase(), toChain.getNonce(), fromChain.getNonce()))
                ? mintWith
                : toChain.XpNft;
            if (appConfig.network === "mainnet") {
                await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            }
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver);
                console.log(new bignumber_js_1.default(fee).toString());
            }
            if (!(await toChain.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            if (mw === undefined) {
                throw new Error(`Mint with is not set`);
            }
            console.log(`Minting With : ${mw}`);
            if (await isWrappedNft(nft, fromChain.getNonce())) {
                await algoOptInCheck(nft, toChain, receiver);
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, new bignumber_js_1.default(fee), toChain.getNonce().toString());
                return res;
            }
            else {
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, new bignumber_js_1.default(fee), mw, gasLimit);
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
        async checkWhitelist(chain, nft) {
            if (!chain.isNftWhitelisted ||
                (await isWrappedNft(nft, chain.getNonce()))) {
                return true;
            }
            return await chain.isNftWhitelisted(nft);
        },
        isWrappedNft
    };
}
exports.ChainFactory = ChainFactory;
__exportStar(require("./factories"), exports);
__exportStar(require("./cons"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBR0Esc0NBQThDO0FBQzlDLDhDQUE0QjtBQUU1QiwwQkFZWTtBQUNaLGdFQUFxQztBQUVyQyxrREFBMEI7QUFDMUIsaUNBQTBDO0FBQzFDLGtEQUFzRDtBQUN0RCw0Q0FBK0M7QUFDL0MsbUNBQXVDO0FBQ3ZDLGtEQU02QjtBQUM3QixzREFBOEI7QUFDOUIseUNBQW1DO0FBbVBuQyxTQUFTLGdCQUFnQixDQUFDLFdBQWlDO0lBQ3pELE1BQU0sSUFBSSxHQUFhLElBQUksR0FBRyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxD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