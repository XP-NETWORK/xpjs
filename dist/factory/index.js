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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNDQUE4QztBQUs5Qyx5Q0FBdUI7QUFDdkIsOENBQTRCO0FBRTVCLGdFQUFxQztBQUNyQywwQkFZWTtBQUVaLGtEQUFzRDtBQUN0RCxnREFBNkQ7QUFDN0Qsc0RBQThCO0FBQzlCLGtEQUEwQjtBQUMxQixtQ0FBdUM7QUFDdkMseUNBQW1DO0FBQ25DLDRDQUErQztBQUMvQyxrREFNNkI7QUFZN0IsdURBSW1DO0FBZ0JuQyxpQ0FNZ0I7QUErUWhCLFNBQVMsZ0JBQWdCLENBQUMsV0FBaUM7SUFDekQsTUFBTSxJQUFJLEdBQWEsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFLLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELElB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
