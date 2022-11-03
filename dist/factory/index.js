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
const hethers_1 = require("@hashgraph/hethers");
const hts_abi_1 = require("../helpers/hedera/hts_abi");
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
    cToP.set(consts_1.Chain.DFINITY, chainParams.dfinityParams);
    cToP.set(consts_1.Chain.NEAR, chainParams.nearParams);
    cToP.set(consts_1.Chain.MOONBEAM, chainParams.moonbeamParams);
    cToP.set(consts_1.Chain.ABEYCHAIN, chainParams.abeyChainParams);
    cToP.set(consts_1.Chain.TON, chainParams.tonParams);
    cToP.set(consts_1.Chain.APTOS, chainParams.aptosParams);
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
    const setProvider = async (chain, provider) => {
        const args = Object.assign(Object.assign({}, cToP.get(chain)), { provider });
        const helper = await consts_1.CHAIN_INFO.get(chain).constructor(args);
        helpers.set(chain, helper);
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
    const estimateFees = async (fromChain, toChain, nft, receiver, extraFee) => {
        const estimate = await toChain.estimateValidateTransferNft(receiver, nft, "");
        let conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate, toChain.getFeeMargin());
        if (extraFee) {
            conv = conv.multipliedBy(extraFee).integerValue(bignumber_js_1.default.ROUND_CEIL);
            console.log("extra conv");
        }
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
    async function getVerifiedContract(from, tc, fc, tokenId) {
        const res = await axios_1.default
            .post(`${appConfig.scVerifyUri}/default/`, {
            sc: from,
            chain: tc,
            fromChain: fc,
            tokenId,
        }, {
            headers: cons_1._headers,
        })
            .catch(() => {
            return undefined;
        });
        return res === null || res === void 0 ? void 0 : res.data.data;
    }
    async function checkMintWith(from, to, targetChain, fromChain, tokenId) {
        const res = await axios_1.default
            .post(`${appConfig.scVerifyUri}/verify`, { from, to, targetChain, fromChain, tokenId }, {
            headers: cons_1._headers,
        })
            .catch(() => undefined);
        return (res === null || res === void 0 ? void 0 : res.data.data) == "allowed";
    }
    return {
        getVerifiedContract,
        balance: (i, a) => i.balance(a),
        async transferBatchNft(from, to, nfts, signer, receiver, fee, mw) {
            let result = [];
            if (appConfig.network === "mainnet") {
                await requireBridge([from.getNonce(), to.getNonce()]);
            }
            if (!fee) {
                fee = await estimateBatchFees(from, to, nfts, receiver);
            }
            if (!(await to.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            console.log(`Batch Minting With: ${mw || to.XpNft1155}`);
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
            unwrapped.length &&
                result.push(from.transferNftBatchToForeign(signer, to.getNonce(), receiver, unwrapped, mw || to.XpNft1155, new bignumber_js_1.default(fee)));
            wrapped.length &&
                result.push(from.unfreezeWrappedNftBatch(signer, to.getNonce(), receiver, wrapped, new bignumber_js_1.default(fee)));
            return await Promise.all(result);
        },
        estimateBatchFees,
        async transferSft(from, to, nft, sender, receiver, amt, fee, mintWith) {
            let transfers = Array(parseInt(amt.toString())).fill(nft);
            if (!fee) {
                fee = await estimateFees(from, to, transfers[0], receiver);
            }
            const response = this.transferBatchNft(from, to, transfers, sender, receiver, new bignumber_js_1.default(fee).dividedToIntegerBy(5), mintWith);
            return response;
        },
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
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee, mintWith, gasLimit, extraFee) => {
            //@ts-ignore
            if (nft.native.contract) {
                if (![9, 18, 24, 31].includes(fromChain.getNonce())) {
                    //@ts-ignore
                    checkNotOldWrappedNft(new ethers_1.utils.getAddress(nft.native.contract));
                }
            }
            const tokenId = 
            //@ts-ignore
            nft.native && "tokenId" in nft.native && nft.native.tokenId.toString();
            if (appConfig.network === "mainnet") {
                await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            }
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver, extraFee);
                console.log(new bignumber_js_1.default(fee).toString());
            }
            if (!(await toChain.validateAddress(receiver))) {
                throw Error("invalid address");
            }
            if (await isWrappedNft(nft, fromChain.getNonce())) {
                await algoOptInCheck(nft, toChain, receiver);
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, new bignumber_js_1.default(fee), toChain.getNonce().toString(), gasLimit);
                return res;
            }
            else {
                const mw = "contract" in nft.native &&
                    mintWith &&
                    (await checkMintWith(nft.collectionIdent, mintWith, toChain.getNonce(), fromChain.getNonce(), tokenId && !isNaN(Number(tokenId)) ? tokenId : undefined))
                    ? mintWith
                    : (0, cons_1.getDefaultContract)(nft, fromChain, toChain);
                console.log(`Minting With : ${mw}`);
                if (mw === undefined) {
                    throw new Error(`Mint with is not set`);
                }
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, new bignumber_js_1.default(fee), mw, gasLimit);
                return res;
            }
        },
        mint: async (chain, owner, args) => {
            return await chain.mintNft(owner, args);
        },
        /**
         * Claim a transferred NFT
         * @param serialNumber The Serial Number of the claimable NFTs
         * @param contractAddress The MintWith HTS Proxy Contract used in the transfer
         * @param sender wallet of the sender
         * @returns txn response of the claimer
         */
        async claimHederaNFT(serialNumber, contractAddress, htsToken, sender) {
            const htscf = new hethers_1.ContractFactory(hts_abi_1.HEDERA_PROXY_ABI, hts_abi_1.HEDERA_PROXY_BC, sender);
            const hts_contract = htscf.attach(contractAddress);
            const cf = new hethers_1.ContractFactory(hts_abi_1.HEDERA_TOKEN_SERVICE_ABI, "0x", sender);
            const contract = cf.attach("0x0000000000000000000000000000000000000167");
            (await contract.associateToken(await sender.getAddress(), htsToken, {
                gasLimit: 1000000,
            })).wait();
            const res = await hts_contract.functions.claimNft(serialNumber, htsToken, {
                gasLimit: 1000000,
            });
            return res;
        },
        /**
         *  Returns all the claimable NFTs of the contract
         * @param proxyContract the address of the HTS Proxy contract that was used as mintWith in the transfer
         * @param sender wallet of the sender
         * @returns array of tokens that were minted
         */
        async listHederaClaimableNFT(proxyContract, htsToken, sender) {
            const cf = new hethers_1.ContractFactory(hts_abi_1.HEDERA_PROXY_ABI, hts_abi_1.HEDERA_PROXY_BC, sender);
            const contract = cf.attach(proxyContract);
            const tokens = await contract.functions.getClaimableNfts(await sender.getAddress(), htsToken, {
                gasLimit: 1000000,
            });
            return tokens[0];
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
        setProvider,
    };
}
exports.ChainFactory = ChainFactory;
__exportStar(require("./factories"), exports);
__exportStar(require("./cons"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLHNDQUE4QztBQUU5Qyw4Q0FBNEI7QUFFNUIsMEJBWVk7QUFDWixnRUFBcUM7QUFFckMsa0RBQTBCO0FBQzFCLGlDQUF3RTtBQUN4RSxrREFBc0Q7QUFDdEQsNENBQStDO0FBQy9DLG1DQUF1QztBQUN2QyxrREFNNkI7QUFDN0Isc0RBQThCO0FBQzlCLHlDQUFtQztBQXdCbkMsZ0RBQTZEO0FBQzdELHVEQUltQztBQStQbkMsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFpQztJQUN6RCxNQUFNLElBQUksR0FBYSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcs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