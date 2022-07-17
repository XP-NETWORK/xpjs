"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    cToP.set(consts_1.Chain.SECRET, chainParams.secretParams);
    cToP.set(consts_1.Chain.HEDERA, chainParams.hederaParams);
    cToP.set(consts_1.Chain.SKALE, chainParams.skaleParams);
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
    const heartbeatRepo = (0, heartbeat_1.bridgeHeartbeat)(appConfig.heartbeatUri);
    const remoteExchangeRate = (0, cons_1.exchangeRateRepo)(appConfig.exchangeRateUri);
    const txSocket = (0, __1.socketHelper)(appConfig.txSocketUri);
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
        if ("meta" in nft.native)
            return;
        const nftDat = await axios_1.default.get(nft.uri);
        if (nftDat.data.wrapped.origin == consts_1.Chain.ALGORAND.toString() &&
            "isOptIn" in toChain &&
            !(await toChain.isOptIn(receiver, parseInt(nftDat.data.wrapped.assetID)))) {
            throw Error("receiver hasn't opted-in to wrapped nft");
        }
    }
    async function getVerifiedContracts(from, tc, fc) {
        try {
            const _from = ethers_1.ethers.utils.getAddress(from);
            const res = await axios_1.default.get(`${appConfig.scVerifyUri}/verify/list?from=${_from}&targetChain=${tc}&fromChain=${fc}`);
            return res.data.data.map((r) => r.to);
        }
        catch (err) {
            const res = await axios_1.default.get(`${appConfig.scVerifyUri}/verify/list?from=${from}&targetChain=${tc}&fromChain=${fc}`);
            return res.data.data.map((r) => r.to);
        }
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
                    return (0, algorand_1.algoSignerWrapper)(algo.algod, algosdk_1.default.mnemonicToSecretKey(mnem));
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
                if (fromChain.getNonce() !== 9 &&
                    fromChain.getNonce() !== 18 &&
                    fromChain.getNonce() !== 24) {
                    //@ts-ignore
                    checkNotOldWrappedNft(new ethers_1.utils.getAddress(nft.native.contract));
                }
            }
            const mw = "contract" in nft.native &&
                mintWith &&
                checkMintWith(mintWith, await getVerifiedContracts(nft.collectionIdent, toChain.getNonce(), fromChain.getNonce()))
                ? mintWith
                : "contractType" in nft.native &&
                    //@ts-ignore contractType is checked
                    nft.native.contractType === "ERC1155"
                    ? toChain.XpNft1155
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
        isWrappedNft,
    };
}
exports.ChainFactory = ChainFactory;
__exportStar(require("./factories"), exports);
__exportStar(require("./cons"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLHNDQUE4QztBQUM5Qyw4Q0FBNEI7QUFFNUIsMEJBWVk7QUFDWixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQUEwQztBQUMxQyxrREFBc0Q7QUFDdEQsNENBQStDO0FBQy9DLG1DQUF1QztBQUN2QyxrREFNNkI7QUFDN0Isc0RBQThCO0FBQzlCLHlDQUFtQztBQXFQbkMsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFpQztJQUN6RCxNQUFNLElBQUksR0FBYSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsSUFBSSxFQUFFLFdB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