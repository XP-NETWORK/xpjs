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
__exportStar(require("./utils"), exports);
__exportStar(require("./factories"), exports);
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const __1 = require("..");
const out_1 = require("@elrondnetwork/erdjs/out");
const hethers_1 = require("@hashgraph/hethers");
const algosdk_1 = __importDefault(require("algosdk"));
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const js_base64_1 = require("js-base64");
const heartbeat_1 = require("../services/heartbeat");
const exchangeRate_1 = require("../services/exchangeRate");
const algorand_1 = require("../helpers/algorand");
const hts_abi_1 = require("../helpers/hedera/hts_abi");
const utils_1 = require("./utils");
const base64url_1 = __importDefault(require("base64url"));
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
    cToP.set(consts_1.Chain.SOLANA, chainParams.solanaParams);
    cToP.set(consts_1.Chain.CADUCEUS, chainParams.caduceusParams);
    cToP.set(consts_1.Chain.OKC, chainParams.okcParams);
    cToP.set(consts_1.Chain.ARBITRUM, chainParams.arbitrumParams);
    cToP.set(consts_1.Chain.BITGERT, chainParams.bitgertParams);
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
    const remoteExchangeRate = (0, exchangeRate_1.exchangeRateRepo)(appConfig.exchangeRateUri);
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
        const args = {
            ...cToP.get(chain),
            provider,
        };
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
            .plus(feeProfit * 0.5)
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
    const estimateWithContractDep = async (fromChain, toChain, nft) => {
        let calcContractDep = new bignumber_js_1.default("0"), originalContract, originalChain;
        try {
            const { bool, wrapped } = await isWrappedNft(nft, fromChain.getNonce(), toChain.getNonce());
            if (bool) {
                originalContract = wrapped?.contract;
                originalChain = wrapped?.origin;
            }
            else {
                originalContract = nft.collectionIdent || nft.native.contract;
                originalChain = nft.native.chainId;
            }
            const [checkWithOutTokenId, verifyList] = await Promise.all([
                axios_1.default
                    .post(`https://sc-verify.xp.network/default/checkWithOutTokenId`, {
                    fromChain: Number(originalChain),
                    chain: fromChain?.getNonce() == originalChain //if first time sending
                        ? Number(toChain.getNonce())
                        : toChain.getNonce() == originalChain //if sending back
                            ? Number(fromChain.getNonce())
                            : Number(toChain.getNonce()),
                    sc: originalContract,
                })
                    .catch(() => false),
                axios_1.default
                    .get(`https://sc-verify.xp.network/verify/list?from=${originalContract}&targetChain=${toChain.getNonce()}&fromChain=${fromChain.getNonce()}&tokenId=1`)
                    .then((res) => {
                    return res.data.data.length > 0 && res.data.code == 200;
                })
                    .catch(() => false),
            ]);
            if (!checkWithOutTokenId && !verifyList && toChain?.estimateContractDep) {
                //@ts-ignore
                const contractFee = await toChain?.estimateContractDep(toChain);
                calcContractDep = (await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), contractFee, toChain.getFeeMargin())).multipliedBy(1.2);
            }
            return { calcContractDep };
        }
        catch (error) {
            console.log(error.message, console.log("error in estimateWithContractDep"));
            return { calcContractDep };
        }
    };
    const estimateSFTfees = async (fromChain, amount, price = 0.05) => {
        const rate = await remoteExchangeRate.getBatchedRate([
            consts_1.CHAIN_INFO.get(fromChain.getNonce()).currency,
        ]);
        const fromExRate = rate.get(consts_1.CHAIN_INFO.get(fromChain.getNonce()).currency);
        const y = price / fromExRate;
        const sftFees = Number(amount) <= 10 ? 0 : y * (Number(amount) - 10);
        return new bignumber_js_1.default(sftFees)
            .multipliedBy(consts_1.CHAIN_INFO.get(fromChain.getNonce()).decimals)
            .integerValue();
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
    async function isWrappedNft(nft, fc, tc) {
        if (fc === consts_1.Chain.TEZOS) {
            return {
                bool: typeof nft.native.meta?.token?.metadata?.wrapped !==
                    "undefined",
                wrapped: undefined,
            };
        }
        try {
            checkNotOldWrappedNft(nft.collectionIdent);
        }
        catch (_) {
            return { bool: false, wrapped: undefined };
        }
        if (/w\/$/.test(nft.uri)) {
            nft = {
                ...nft,
                uri: nft.uri + nft.native.tokenId,
            };
        }
        const wrapped = (await axios_1.default.get(nft.uri).catch(() => undefined))?.data
            .wrapped;
        const contract = wrapped?.contract || wrapped?.source_mint_ident;
        tc && contract && (0, utils_1.checkBlockedContracts)(tc, contract);
        return { bool: typeof wrapped !== "undefined", wrapped };
    }
    async function algoOptInCheck(nft, toChain, receiver, wrapped) {
        if ("meta" in nft.native)
            return;
        //const nftDat = await axios.get(nft.uri);
        if (wrapped.origin == consts_1.Chain.ALGORAND.toString() &&
            "isOptIn" in toChain &&
            !(await toChain.isOptIn(receiver, parseInt(wrapped.assetID)))) {
            throw Error("receiver hasn't opted-in to wrapped nft");
        }
    }
    async function getVerifiedContract(from, tc, fc, tokenId) {
        const res = await axios_1.default
            .post(`${appConfig.scVerifyUri}/default/`, {
            sc: from,
            chain: tc,
            fromChain: fc,
            tokenId: tokenId && !isNaN(Number(tokenId)) ? tokenId : undefined,
        }, {
            headers: utils_1._headers,
        })
            .catch(() => {
            return undefined;
        });
        return res?.data.data;
    }
    async function checkMintWith(from, to, targetChain, fromChain, tokenId) {
        const res = await axios_1.default
            .post(`${appConfig.scVerifyUri}/verify`, { from, to, targetChain, fromChain, tokenId }, {
            headers: utils_1._headers,
        })
            .catch(() => undefined);
        return res?.data.data == "allowed";
    }
    return {
        estimateWithContractDep,
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
                if (
                // @ts-ignore
                e.native.contractType &&
                    // @ts-ignore
                    e.native.contractType === "ERC721") {
                    throw new Error(`ERC721 is not supported`);
                }
                if ((await isWrappedNft(e, from.getNonce())).bool) {
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
        async whitelistEVM(chain, address) {
            const chainLocal = cToP.get(chain);
            if (!chainLocal)
                throw new Error("Chain not found");
            const params = await consts_1.CHAIN_INFO.get(chain)?.constructor(chainLocal);
            if (!params)
                throw new Error("An error occured");
            const isAddressValid = await params.validateAddress(address);
            if (!isAddressValid)
                throw new Error("Address is not valid");
            try {
                await chainLocal.notifier.notifyEVM(chain, address);
                return { success: true };
            }
            catch (error) {
                throw new Error("An error occured");
            }
        },
        async transferSft(from, to, nft, sender, receiver, amt, fee, mintWith) {
            if (Number(amt) > 50)
                throw new Error("Currenly more that 50 SFTs is not supported");
            let transfers = Array(parseInt(amt.toString())).fill(nft);
            if (!fee) {
                fee = await estimateFees(from, to, transfers[0], receiver);
            }
            const sftFees = await estimateSFTfees(from, amt, 0.05);
            const x = new bignumber_js_1.default(fee).plus(sftFees);
            console.log(x.toNumber());
            if (amt === BigInt(1)) {
                const response = this.transferNft(from, to, nft, sender, receiver, new bignumber_js_1.default(x).integerValue(), mintWith);
                return response;
            }
            else {
                const response = this.transferBatchNft(from, to, transfers, sender, receiver, new bignumber_js_1.default(x).integerValue(), mintWith);
                return response;
            }
            const response = this.transferBatchNft(from, to, transfers, sender, receiver, new bignumber_js_1.default(x).integerValue(), mintWith);
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
        estimateSFTfees,
        inner,
        bridgeStatus,
        updateParams(chainNonce, params) {
            helpers.delete(chainNonce);
            cToP.set(chainNonce, params);
        },
        async nftList(chain, owner) {
            if (chain.getNonce() === consts_1.Chain.TON) {
                console.log("decode for ton");
                owner = base64url_1.default.encode(owner);
            }
            let res = await nftlistRest.get(`/nfts/${chain.getNonce()}/${owner}`);
            if (res.headers["Retry-After"]) {
                await new Promise((r) => setTimeout(r, 30000));
                return await this.nftList(chain, owner);
            }
            return res.data.data;
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee, mintWith, gasLimit, extraFee, gasPrice) => {
            //@ts-ignore
            if (nft.native.contract) {
                if (![9, 18, 24, 31, 27, 26].includes(fromChain.getNonce())) {
                    try {
                        checkNotOldWrappedNft(
                        //@ts-ignore
                        ethers_1.utils.getAddress(nft.native.contract));
                    }
                    catch {
                        console.log("non evm nonce");
                    }
                }
            }
            if (appConfig.network === "mainnet") {
                await requireBridge([fromChain.getNonce(), toChain.getNonce()]);
            }
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver, extraFee);
                console.log(new bignumber_js_1.default(fee).toString());
            }
            // if (!(await toChain.validateAddress(receiver))) {
            //   throw Error("invalid address");
            // }
            const { bool: unfreeze, wrapped } = await isWrappedNft(nft, fromChain.getNonce(), toChain.getNonce());
            if (unfreeze) {
                await algoOptInCheck(nft, toChain, receiver, wrapped);
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, new bignumber_js_1.default(fee), toChain.getNonce().toString(), gasLimit, gasPrice);
                return res;
            }
            else {
                const mw = 
                //@ts-ignore contract is checked
                "contract" in nft.native &&
                    mintWith &&
                    (await checkMintWith(nft.collectionIdent, mintWith, toChain.getNonce(), fromChain.getNonce(), (0, utils_1.prepareTokenId)(nft, fromChain.getNonce())))
                    ? mintWith
                    : (0, utils_1.getDefaultContract)(nft, fromChain, toChain);
                console.log(`Minting With : ${mw}`);
                if (mw === undefined) {
                    throw new Error(`Mint with is not set`);
                }
                const res = await fromChain.transferNftToForeign(sender, toChain.getNonce(), receiver, nft, new bignumber_js_1.default(fee), mw, gasLimit, gasPrice);
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
                (await isWrappedNft(nft, chain.getNonce())).bool) {
                return true;
            }
            return await chain.isNftWhitelisted(nft);
        },
        isWrappedNft,
        setProvider,
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUE4QztBQUs5QywwQ0FBd0I7QUFDeEIsOENBQTRCO0FBRTVCLGdFQUFxQztBQUNyQywwQkFZWTtBQUVaLGtEQUFzRDtBQUN0RCxnREFBNkQ7QUFDN0Qsc0RBQThCO0FBQzlCLGtEQUEwQjtBQUMxQixtQ0FBdUM7QUFDdkMseUNBQW1DO0FBQ25DLHFEQUF3RDtBQUN4RCwyREFBNEQ7QUFDNUQsa0RBTTZCO0FBWTdCLHVEQUltQztBQWdCbkMsbUNBS2lCO0FBQ2pCLDBEQUFrQztBQTRSbEMsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFpQztJQUN6RCxNQUFNLElBQUksR0FBYSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENB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