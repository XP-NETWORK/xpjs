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
const ethers_1 = require("ethers");
const js_base64_1 = require("js-base64");
const heartbeat_1 = require("../services/heartbeat");
const exchangeRate_1 = require("../services/exchangeRate");
const nftList_1 = require("../services/nftList");
const scVerify_1 = require("../services/scVerify");
const algorand_1 = require("../helpers/algorand");
const hts_abi_1 = require("../helpers/hedera/hts_abi");
const utils_1 = require("./utils");
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
    cToP.set(consts_1.Chain.CASPER, chainParams.casperParams);
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
            .plus(feeProfit * 0.5)
            .times(consts_1.CHAIN_INFO.get(fromChain).decimals)
            .integerValue(bignumber_js_1.default.ROUND_CEIL);
    }
    const estimateFees = async (fromChain, toChain, nft, receiver, extraFee) => {
        const estimate = await toChain.estimateValidateTransferNft(receiver, nft, "");
        let conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate, toChain.getFeeMargin());
        if (extraFee) {
            conv = conv.multipliedBy(extraFee).integerValue(bignumber_js_1.default.ROUND_CEIL);
        }
        return fromChain.getExtraFees ? fromChain.getExtraFees().plus(conv) : conv;
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
            const deployable = [
                consts_1.ChainType.EVM,
                consts_1.ChainType.SOLANA,
                consts_1.ChainType.NEAR,
                consts_1.ChainType.APTOS,
                consts_1.ChainType.TON,
            ];
            const deployableFrom = deployable.find((type) => type === fromType);
            const deployableTo = deployable.find((type) => type === toType);
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
    /*async function checkMintWith(
          from: string,
          to: string,
          targetChain: number,
          fromChain: number,
          tokenId?: string
      ): Promise<boolean> {
          const res = await scVerifyRest.verify(
              from,
              to,
              targetChain,
              fromChain,
              tokenId
          );
  
          return res?.data.data == "allowed";
      }*/
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
        async checkWhitelist(chain, nft) {
            if (!chain.isNftWhitelisted ||
                (await (0, utils_1.isWrappedNft)(nft, chain.getNonce())).bool) {
                return true;
            }
            return await chain.isNftWhitelisted(nft);
        },
        isWrappedNft: utils_1.isWrappedNft,
        setProvider,
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUF5RDtBQUt6RCwwQ0FBd0I7QUFDeEIsOENBQTRCO0FBRTVCLGdFQUFxQztBQUNyQywwQkFhWTtBQUVaLGtEQUFzRDtBQUN0RCxnREFBNkQ7QUFDN0Qsc0RBQThCO0FBQzlCLG1DQUF1QztBQUN2Qyx5Q0FBbUM7QUFDbkMscURBQXdEO0FBQ3hELDJEQUE0RDtBQUM1RCxpREFBOEM7QUFDOUMsbURBQWdEO0FBQ2hELGtEQU02QjtBQWE3Qix1REFJbUM7QUFnQm5DLG1DQUlpQjtBQWtTakIsU0FBUyxnQkFBZ0IsQ0FBQyxXQUFpQztJQUN6RCxNQUFNLElBQUksR0FBYSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENB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