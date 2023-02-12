"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactory = void 0;
const consts_1 = require("../consts");
__exportStar(require("./cons"), exports);
__exportStar(require("./factories"), exports);
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const __1 = require("..");
const out_1 = require("@elrondnetwork/erdjs/out");
const hethers_1 = require("@hashgraph/hethers");
const algosdk_1 = __importDefault(require("algosdk"));
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const js_base64_1 = require("js-base64");
const heartbeat_1 = require("../heartbeat");
const algorand_1 = require("../helpers/algorand");
const hts_abi_1 = require("../helpers/hedera/hts_abi");
const cons_1 = require("./cons");
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
  const heartbeatRepo = (0, heartbeat_1.bridgeHeartbeat)(
    appConfig.heartbeatUri
  );
  const remoteExchangeRate = (0, cons_1.exchangeRateRepo)(
    appConfig.exchangeRateUri
  );
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
      helper = await consts_1.CHAIN_INFO.get(chain).constructor(
        cToP.get(chain)
      );
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
    const usdFee = Math.min(
      Math.max(toChainFee.min, feeR.times(toExRate * 0.1).toNumber()),
      toChainFee.max
    );
    const feeProfit = usdFee / fromExRate;
    return feeR
      .times(toExRate / fromExRate)
      .plus(feeProfit * 0.5)
      .times(consts_1.CHAIN_INFO.get(fromChain).decimals)
      .integerValue(bignumber_js_1.default.ROUND_CEIL);
  }
  const estimateFees = async (fromChain, toChain, nft, receiver, extraFee) => {
    const estimate = await toChain.estimateValidateTransferNft(
      receiver,
      nft,
      ""
    );
    let conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate,
      toChain.getFeeMargin()
    );
    if (extraFee) {
      conv = conv
        .multipliedBy(extraFee)
        .integerValue(bignumber_js_1.default.ROUND_CEIL);
      console.log("extra conv");
    }
    return conv;
  };
  const estimateSFTfees = async (fromChain, amount, price = 0.05) => {
    const rate = await remoteExchangeRate.getBatchedRate([
      consts_1.CHAIN_INFO.get(fromChain.getNonce()).currency,
    ]);
    const fromExRate = rate.get(
      consts_1.CHAIN_INFO.get(fromChain.getNonce()).currency
    );
    const y = price / fromExRate;
    const sftFees = Number(amount) <= 10 ? 0 : y * (Number(amount) - 10);
    return new bignumber_js_1.default(sftFees)
      .multipliedBy(consts_1.CHAIN_INFO.get(fromChain.getNonce()).decimals)
      .integerValue();
  };
  async function bridgeStatus() {
    const res = await heartbeatRepo.status();
    return Object.fromEntries(
      Object.entries(res).map(([c, s]) => [
        c,
        s.bridge_alive ? "alive" : "dead",
      ])
    );
  }
  async function estimateBatchFees(fromChain, toChain, nft, receiver) {
    const estimate = await toChain.estimateValidateTransferNftBatch(
      receiver,
      nft,
      new Array(nft.length).fill(toChain.XpNft)
    );
    const conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate.times(nft.length),
      toChain.getFeeMargin()
    );
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
      return typeof nft.native.meta?.token?.metadata?.wrapped !== "undefined";
    }
    try {
      checkNotOldWrappedNft(nft.collectionIdent);
    } catch (_) {
      return false;
    }
    const original = (await axios_1.default.get(nft.uri).catch(() => undefined))
      ?.data.wrapped;
    const contract = original?.contract || original?.source_mint_ident;
    tc && contract && (0, cons_1.checkBlockedContracts)(tc, contract);
    return typeof original !== "undefined";
  }
  async function algoOptInCheck(nft, toChain, receiver) {
    if ("meta" in nft.native) return;
    const nftDat = await axios_1.default.get(nft.uri);
    if (
      nftDat.data.wrapped.origin == consts_1.Chain.ALGORAND.toString() &&
      "isOptIn" in toChain &&
      !(await toChain.isOptIn(receiver, parseInt(nftDat.data.wrapped.assetID)))
    ) {
      throw Error("receiver hasn't opted-in to wrapped nft");
    }
  }
  async function getVerifiedContract(from, tc, fc, tokenId) {
    const res = await axios_1.default
      .post(
        `${appConfig.scVerifyUri}/default/`,
        {
          sc: from,
          chain: tc,
          fromChain: fc,
          tokenId: tokenId && !isNaN(Number(tokenId)) ? tokenId : undefined,
        },
        {
          headers: cons_1._headers,
        }
      )
      .catch(() => {
        return undefined;
      });
    return res?.data.data;
  }
  async function checkMintWith(from, to, targetChain, fromChain, tokenId) {
    const res = await axios_1.default
      .post(
        `${appConfig.scVerifyUri}/verify`,
        { from, to, targetChain, fromChain, tokenId },
        {
          headers: cons_1._headers,
        }
      )
      .catch(() => undefined);
    return res?.data.data == "allowed";
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
      await Promise.all(
        nfts.map(async (e) => {
          // @ts-ignore
          if (e.native.contractType && e.native.contractType === "ERC721") {
            throw new Error(`ERC721 is not supported`);
          }
          if (await isWrappedNft(e, from.getNonce())) {
            wrapped.push(e);
          } else {
            unwrapped.push(e);
          }
        })
      );
      unwrapped.length &&
        result.push(
          from.transferNftBatchToForeign(
            signer,
            to.getNonce(),
            receiver,
            unwrapped,
            mw || to.XpNft1155,
            new bignumber_js_1.default(fee)
          )
        );
      wrapped.length &&
        result.push(
          from.unfreezeWrappedNftBatch(
            signer,
            to.getNonce(),
            receiver,
            wrapped,
            new bignumber_js_1.default(fee)
          )
        );
      return await Promise.all(result);
    },
    estimateBatchFees,
    async whitelistEVM(chain, address) {
      const chainLocal = cToP.get(chain);
      if (!chainLocal) throw new Error("Chain not found");
      const params = await consts_1.CHAIN_INFO.get(chain)?.constructor(
        chainLocal
      );
      if (!params) throw new Error("An error occured");
      const isAddressValid = await params.validateAddress(address);
      if (!isAddressValid) throw new Error("Address is not valid");
      try {
        await chainLocal.notifier.notifyEVM(chain, address);
        return { success: true };
      } catch (error) {
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
        const response = this.transferNft(
          from,
          to,
          nft,
          sender,
          receiver,
          new bignumber_js_1.default(x).integerValue(),
          mintWith
        );
        return response;
      } else {
        const response = this.transferBatchNft(
          from,
          to,
          transfers,
          sender,
          receiver,
          new bignumber_js_1.default(x).integerValue(),
          mintWith
        );
        return response;
      }
      const response = this.transferBatchNft(
        from,
        to,
        transfers,
        sender,
        receiver,
        new bignumber_js_1.default(x).integerValue(),
        mintWith
      );
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
          const mnem = algosdk_1.default.secretKeyToMnemonic(
            js_base64_1.Base64.toUint8Array(key)
          );
          return (0, algorand_1.algoSignerWrapper)(
            algo.algod,
            algosdk_1.default.mnemonicToSecretKey(mnem)
          );
        }
        default: {
          const chainH = await inner(nonce);
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
      let res = await nftlistRest.get(`/nfts/${chain.getNonce()}/${owner}`);
      if (res.headers["Retry-After"]) {
        await new Promise((r) => setTimeout(r, 30000));
        return await this.nftList(chain, owner);
      }
      return res.data.data;
    },
    transferNft: async (
      fromChain,
      toChain,
      nft,
      sender,
      receiver,
      fee,
      mintWith,
      gasLimit,
      extraFee,
      gasPrice
    ) => {
      //@ts-ignore
      if (nft.native.contract) {
        if (![9, 18, 24, 31, 27].includes(fromChain.getNonce())) {
          //@ts-ignore
          checkNotOldWrappedNft(
            new ethers_1.utils.getAddress(nft.native.contract)
          );
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
      if (await isWrappedNft(nft, fromChain.getNonce(), toChain.getNonce())) {
        await algoOptInCheck(nft, toChain, receiver);
        const res = await fromChain.unfreezeWrappedNft(
          sender,
          receiver,
          nft,
          new bignumber_js_1.default(fee),
          toChain.getNonce().toString(),
          gasLimit,
          gasPrice
        );
        return res;
      } else {
        const mw =
          //@ts-ignore contract is checked
          "contract" in nft.native &&
          mintWith &&
          (await checkMintWith(
            nft.collectionIdent,
            mintWith,
            toChain.getNonce(),
            fromChain.getNonce(),
            (0, cons_1.prepareTokenId)(nft, fromChain.getNonce())
          ))
            ? mintWith
            : (0, cons_1.getDefaultContract)(nft, fromChain, toChain);
        console.log(`Minting With : ${mw}`);
        if (mw === undefined) {
          throw new Error(`Mint with is not set`);
        }
        const res = await fromChain.transferNftToForeign(
          sender,
          toChain.getNonce(),
          receiver,
          nft,
          new bignumber_js_1.default(fee),
          mw,
          gasLimit,
          gasPrice
        );
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
      const htscf = new hethers_1.ContractFactory(
        hts_abi_1.HEDERA_PROXY_ABI,
        hts_abi_1.HEDERA_PROXY_BC,
        sender
      );
      const hts_contract = htscf.attach(contractAddress);
      const cf = new hethers_1.ContractFactory(
        hts_abi_1.HEDERA_TOKEN_SERVICE_ABI,
        "0x",
        sender
      );
      const contract = cf.attach("0x0000000000000000000000000000000000000167");
      (
        await contract.associateToken(await sender.getAddress(), htsToken, {
          gasLimit: 1000000,
        })
      ).wait();
      const res = await hts_contract.functions.claimNft(
        serialNumber,
        htsToken,
        {
          gasLimit: 1000000,
        }
      );
      return res;
    },
    /**
     *  Returns all the claimable NFTs of the contract
     * @param proxyContract the address of the HTS Proxy contract that was used as mintWith in the transfer
     * @param sender wallet of the sender
     * @returns array of tokens that were minted
     */
    async listHederaClaimableNFT(proxyContract, htsToken, sender) {
      const cf = new hethers_1.ContractFactory(
        hts_abi_1.HEDERA_PROXY_ABI,
        hts_abi_1.HEDERA_PROXY_BC,
        sender
      );
      const contract = cf.attach(proxyContract);
      const tokens = await contract.functions.getClaimableNfts(
        await sender.getAddress(),
        htsToken,
        {
          gasLimit: 1000000,
        }
      );
      return tokens[0];
    },
    waitAlgorandNft: async (origin, hash, claimer) => {
      const action = await origin.extractAction(hash);
      return await txSocket.waitAlgorandNft(
        origin.getNonce(),
        claimer.address,
        action
      );
    },
    claimableAlgorandNfts: async (claimer) => {
      const algo = await inner(consts_1.Chain.ALGORAND);
      return await algo.claimableNfts(txSocket, claimer);
    },
    async checkWhitelist(chain, nft) {
      if (
        !chain.isNftWhitelisted ||
        (await isWrappedNft(nft, chain.getNonce()))
      ) {
        return true;
      }
      return await chain.isNftWhitelisted(nft);
    },
    isWrappedNft,
    setProvider,
  };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUE4QztBQUs5Qyx5Q0FBdUI7QUFDdkIsOENBQTRCO0FBRTVCLGdFQUFxQztBQUNyQywwQkFZWTtBQUVaLGtEQUFzRDtBQUN0RCxnREFBNkQ7QUFDN0Qsc0RBQThCO0FBQzlCLGtEQUEwQjtBQUMxQixtQ0FBdUM7QUFDdkMseUNBQW1DO0FBQ25DLDRDQUErQztBQUMvQyxrREFNNkI7QUFZN0IsdURBSW1DO0FBZ0JuQyxpQ0FNZ0I7QUFpUmhCLFNBQVMsZ0JBQWdCLENBQUMsV0FBaUM7SUFDekQsTUFBTSxJQUFJLEdBQWEsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELElB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
