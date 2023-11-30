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
exports.ChainFactory = exports.getClaimFee = exports.getStorageContract = void 0;
const consts_1 = require("../consts");
__exportStar(require("./utils"), exports);
__exportStar(require("./factories"), exports);
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const __1 = require("..");
const out_1 = require("@elrondnetwork/erdjs/out");
const hethers_1 = require("@hashgraph/hethers");
const algosdk_1 = __importDefault(require("algosdk"));
const ethers_1 = require("ethers");
const js_base64_1 = require("js-base64");
const heartbeat_1 = require("../services/heartbeat");
const exchangeRate_1 = require("../services/exchangeRate");
const nftList_1 = require("../services/nftList");
const scVerify_1 = require("../services/scVerify");
const algorand_1 = require("../helpers/algorand");
const hts_abi_1 = require("../helpers/hedera/hts_abi");
const utils_1 = require("./utils");
const BridgeStorage__factory_1 = require("xpnet-web3-contracts/dist/v3/factories/contracts/BridgeStorage__factory");
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
    cToP.set(consts_1.Chain.OPTIMISM, chainParams.optimismParams);
    cToP.set(consts_1.Chain.ZETA, chainParams.zetaParams);
    cToP.set(consts_1.Chain.ENERGI, chainParams.energiParams);
    cToP.set(consts_1.Chain.CASPER, chainParams.casperParams);
    cToP.set(consts_1.Chain.BASE, chainParams.baseParams);
    cToP.set(consts_1.Chain.FINDORA, chainParams.findoraParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
const getStorageContract = (config) => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(config.storegeNetwork);
    const storageContract = BridgeStorage__factory_1.BridgeStorage__factory.connect(config.storageContract, provider);
    return storageContract;
};
exports.getStorageContract = getStorageContract;
const getClaimFee = async (toChain, storageContract) => {
    const fee = await storageContract.chainFee(toChain);
    return String(fee);
};
exports.getClaimFee = getClaimFee;
function ChainFactory(appConfig, chainParams) {
    let helpers = new Map();
    let cToP = mapNonceToParams(chainParams);
    const heartbeatRepo = (0, heartbeat_1.bridgeHeartbeat)(appConfig.heartbeatUri);
    const remoteExchangeRate = (0, exchangeRate_1.exchangeRateRepo)(appConfig.exchangeRateUri);
    const txSocket = (0, __1.socketHelper)(appConfig.txSocketUri);
    const nftListService = (0, nftList_1.nftList)(appConfig.nftListUri, appConfig.nftListAuthToken);
    const scVerifyRest = (0, scVerify_1.scVerify)(appConfig.scVerifyUri);
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
            .plus(feeProfit)
            .times(consts_1.CHAIN_INFO.get(fromChain).decimals)
            .integerValue(bignumber_js_1.default.ROUND_CEIL);
    }
    const estimateFees = async (fromChain, toChain, nft, receiver, extraFee) => {
        const estimate = await toChain.estimateValidateTransferNft(receiver, nft, "");
        let conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate, toChain.getFeeMargin());
        if (extraFee) {
            conv = conv.multipliedBy(extraFee).integerValue(bignumber_js_1.default.ROUND_CEIL);
        }
        return fromChain.getExtraFees
            ? fromChain.getExtraFees(toChain.getNonce()).plus(conv)
            : conv;
    };
    const estimateWithContractDep = async (fromChain, toChain, nft) => {
        const from = fromChain.getNonce();
        const to = toChain.getNonce();
        const noDeploy = new Error(`${from} or ${to} is undeployable`);
        let calcContractDep = new bignumber_js_1.default("0");
        let originalContract;
        let originalChain;
        try {
            const { bool, wrapped } = await (0, utils_1.isWrappedNft)(nft, from, to);
            if (bool) {
                originalContract = wrapped?.contract;
                originalChain = wrapped?.origin;
                if (to == Number(originalChain))
                    throw noDeploy;
            }
            else {
                originalContract = nft.collectionIdent || nft.native.contract;
                originalChain = nft.native.chainId;
            }
            const fromType = consts_1.CHAIN_INFO.get(Number(originalChain))?.type;
            const toType = consts_1.CHAIN_INFO.get(to)?.type;
            const fromEnabled = [
                consts_1.ChainType.EVM,
                consts_1.ChainType.SOLANA,
                consts_1.ChainType.NEAR,
                consts_1.ChainType.APTOS,
                consts_1.ChainType.TON,
            ];
            const toEnabled = [
                consts_1.ChainType.EVM,
                consts_1.ChainType.SOLANA,
                consts_1.ChainType.NEAR,
                consts_1.ChainType.APTOS,
                consts_1.ChainType.TON,
                consts_1.ChainType.DFINITY,
            ];
            const deployableFrom = fromEnabled.find((type) => type === fromType);
            const deployableTo = toEnabled.find((type) => type === toType);
            if (!deployableFrom || !deployableTo)
                throw noDeploy;
            const _chain = from == Number(originalChain) //if first time sending
                ? to
                : to == Number(originalChain) //if sending back
                    ? from
                    : to; //all the rest
            const isMapped = await scVerifyRest.checkWithOutTokenId(fromChain, _chain, originalContract);
            if (!isMapped && toChain?.estimateContractDeploy) {
                //@ts-ignore
                const contractFee = await toChain?.estimateContractDeploy();
                calcContractDep = (await calcExchangeFees(from, to, contractFee, toChain.getFeeMargin())).multipliedBy(1.1);
            }
            return { calcContractDep };
        }
        catch (error) {
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
    async function algoOptInCheck(nft, toChain, receiver, wrapped) {
        if ("meta" in nft.native)
            return;
        //const nftDat = await axios.get(nft.uri);
        if (wrapped.origin == consts_1.Chain.ALGORAND.toString() &&
            "isOptIn" in toChain &&
            //@ts-ignore
            !(await toChain.isOptIn(receiver, parseInt(wrapped.assetID)))) {
            throw Error("receiver hasn't opted-in to wrapped nft");
        }
    }
    async function getVerifiedContract(from, tc, fc, _) {
        const res = await scVerifyRest.checkWithOutTokenId(fc, tc, from); /*await scVerifyRest.default(
                from,
                tc,
                fc,
                tokenId && !isNaN(Number(tokenId)) ? tokenId : undefined
            );*/
        return res?.data;
    }
    const estimateClaimFee = async (fromChain, storageContract) => {
        if (!storageContract) {
            storageContract = (0, exports.getStorageContract)(appConfig);
        }
        const v3_chainId = consts_1.CHAIN_INFO.get(fromChain.getNonce()).v3_chainId;
        if (!v3_chainId)
            return "0";
        return await (0, exports.getClaimFee)(v3_chainId, storageContract);
    };
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
                if ((await (0, utils_1.isWrappedNft)(e, from.getNonce())).bool) {
                    wrapped.push(e);
                }
                else {
                    unwrapped.push(e);
                }
            }));
            const toNonce = to.getNonce();
            unwrapped.length &&
                result.push(from.transferNftBatchToForeign(signer, toNonce, receiver, unwrapped, mw || to.XpNft1155, new bignumber_js_1.default(fee), cToP.get(toNonce)));
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
                const deplFees = (await estimateWithContractDep(from, to, transfers[0]))
                    .calcContractDep;
                if (deplFees.gt(0)) {
                    fee = new bignumber_js_1.default(fee)
                        .plus(deplFees)
                        .integerValue(bignumber_js_1.default.ROUND_CEIL);
                }
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
            return nftListService.get(chain, owner);
        },
        transferNft: async (fromChain, toChain, nft, sender, receiver, fee, mintWith, gasLimit, extraFee, gasPrice) => {
            const fromNonce = fromChain.getNonce();
            const toNonce = toChain.getNonce();
            //@ts-ignore
            if (nft.native.contract) {
                if (![9, 18, 24, 31, 27, 26].includes(fromNonce)) {
                    try {
                        (0, utils_1.checkNotOldWrappedNft)(
                        //@ts-ignore
                        ethers_1.utils.getAddress(nft.native.contract));
                    }
                    catch {
                        console.log("non evm nonce");
                    }
                }
            }
            if (appConfig.network === "mainnet") {
                await requireBridge([fromNonce, toNonce]);
            }
            if (!fee) {
                fee = await estimateFees(fromChain, toChain, nft, receiver, extraFee);
                const deplFees = (await estimateWithContractDep(fromChain, toChain, nft)).calcContractDep;
                if (deplFees.gt(0)) {
                    fee = new bignumber_js_1.default(fee)
                        .plus(deplFees)
                        .integerValue(bignumber_js_1.default.ROUND_CEIL);
                }
            }
            // if (!(await toChain.validateAddress(receiver))) {
            //   throw Error("invalid address");
            // }
            const { bool: unfreeze, wrapped } = await (0, utils_1.isWrappedNft)(nft, fromNonce, toNonce);
            if (unfreeze) {
                await algoOptInCheck(nft, toChain, receiver, wrapped);
                const res = await fromChain.unfreezeWrappedNft(sender, receiver, nft, new bignumber_js_1.default(fee), toNonce, gasLimit, gasPrice);
                return res;
            }
            else {
                const mw = 
                /*//@ts-ignore contract is checked
                          "contract" in nft.native &&
                          mintWith &&
                          (await checkMintWith(
                              nft.collectionIdent,
                              mintWith,
                              toNonce,
                              fromNonce,
                              prepareTokenId(nft, fromNonce)
                          ))
                              ? mintWith
                              : */ mintWith ||
                    (0, utils_1.getDefaultContract)(nft, fromChain, toChain);
                console.log(`Minting With : ${mw}`);
                if (mw === undefined) {
                    throw new Error(`Mint with is not set`);
                }
                const res = await fromChain.transferNftToForeign(sender, toNonce, receiver, nft, new bignumber_js_1.default(fee), mw, gasLimit, gasPrice, cToP.get(toNonce));
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
        hederaGetMintedCollection: async (from, claimer) => {
            const result = await txSocket.claimHederaNfts(from, claimer);
            return result;
        },
        async checkWhitelist(chain, nft) {
            if (!chain.isNftWhitelisted ||
                (await (0, utils_1.isWrappedNft)(nft, chain.getNonce())).bool) {
                return true;
            }
            return await chain.isNftWhitelisted(nft);
        },
        isWrappedNft: utils_1.isWrappedNft,
        setProvider,
        async lockNFT(from, to, nft, signer, receiver) {
            const toChain = consts_1.CHAIN_INFO.get(to.getNonce());
            if (!toChain?.v3_chainId) {
                throw new Error(`Chain ${toChain?.name} is not supported in Bridge v3`);
            }
            return await from.lockNFT(signer, toChain.v3_chainId, nft, receiver);
        },
        async claimNFT(from, to, txHash, signer, fee) {
            const storageContract = (0, exports.getStorageContract)(appConfig);
            const initialClaimData = await Promise.allSettled([
                fee || estimateClaimFee(from, storageContract),
                storageContract.chainRoyalty(consts_1.CHAIN_INFO.get(to.getNonce())?.v3_chainId),
            ]);
            console.log(initialClaimData, "initialClaimData");
            return await to.claimV3NFT(signer, helpers, from, txHash, storageContract, {
                fee: initialClaimData[0].status === "fulfilled"
                    ? initialClaimData[0].value
                    : "",
                royaltyReceiver: initialClaimData[1].status === "fulfilled"
                    ? initialClaimData[1].value
                    : "",
            });
        },
        estimateClaimFee,
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUF5RDtBQUt6RCwwQ0FBd0I7QUFDeEIsOENBQTRCO0FBRTVCLGdFQUFxQztBQUNyQywwQkFhWTtBQUVaLGtEQUFzRDtBQUN0RCxnREFBNkQ7QUFDN0Qsc0RBQThCO0FBQzlCLG1DQUF1QztBQUN2Qyx5Q0FBbUM7QUFDbkMscURBQXdEO0FBQ3hELDJEQUE0RDtBQUM1RCxpREFBOEM7QUFDOUMsbURBQWdEO0FBQ2hELGtEQU02QjtBQWdCN0IsdURBSW1DO0FBaUJuQyxtQ0FJaUI7QUFHakIsb0hBQWlIO0FBaVVqSCxTQUFTLGdCQUFnQixDQUFDLFdBQWlDO0lBQ3pELE1BQU0sSUFBSSxHQUFhLElBQUksR0FBRyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsTUFB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