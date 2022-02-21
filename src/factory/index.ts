import {
  ElrondParams,
} from "../helpers/elrond";
import { TronParams } from "../helpers/tron";
import { Web3Params } from "../helpers/web3";
import {
  Chain,
  CHAIN_INFO,
  FEE_MARGIN,
} from "../consts";
export * from "./factories";

import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  MintNft,
  NftInfo,
  socketHelper,
  TransactionStatus,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "..";
import BigNumber from "bignumber.js";

import axios from "axios";
import { exchangeRateRepo } from "./cons";
import { UserSigner } from "@elrondnetwork/erdjs/out";
import { bridgeHeartbeat } from "../heartbeat";
import { utils } from "ethers";
import {
  AlgorandParams,
  AlgorandHelper,
  AlgoSignerH,
  algoSignerWrapper,
  ClaimNftInfo,
} from "../helpers/algorand";
import algosdk from "algosdk";
import { Base64 } from "js-base64";
import { TezosParams } from "../helpers/tezos";
import {
  EstimateTxFeesBatch,
  TransferNftForeignBatch,
  UnfreezeForeignNftBatch,
} from "../helpers/chain";
import { ChainNonce, HelperMap, InferChainH, InferChainParam, InferSigner, ParamMap } from "../type-utils";

type FullChain<Signer, RawNft, Resp> = TransferNftForeign<
  Signer,
  RawNft,
  Resp
> &
  UnfreezeForeignNft<Signer, RawNft, Resp> &
  EstimateTxFees<RawNft> &
  ChainNonceGet &
  ValidateAddress & { XpNft?: string };

type FullChainBatch<Signer, RawNft, Resp> = FullChain<Signer, RawNft, Resp> &
  TransferNftForeignBatch<Signer, RawNft, Resp> &
  UnfreezeForeignNftBatch<Signer, RawNft, Resp> &
  EstimateTxFeesBatch<RawNft>;

/**
 * A type representing a chain factory.
 *
 */
export type ChainFactory = {
  /**
   * Creates an helper factory for a given chain
   * @type T: Either {@link ElrondHelper} | {@link Web3Helper} | {@link TronHelper} as required.
   * @type P: Either {@link ElrondParams} | {@link Web3Params} | {@link TronParams} as required.
   * @param chain: {@link Chain} to create the helper for.
   */
  inner<T extends ChainNonce>(chain: T): Promise<InferChainH<T>>;
  /**
   * Whether or not the bridge is alive for a given chain
   * this is checked regardless before using any bridge related function(e.g transferNft) is called
   */
  bridgeStatus(): Promise<{ [chainNonce: number]: "alive" | "dead" }>;
  /**
   * Transfers the NFT from one chain to other.
   * @param fromChain {@link FullChain} the chain to transfer from. Use inner method of the factory to get this.
   * @param toChain {@link FullChain} the chain to transfer to. Use inner method of the factory to get this.
   * WARN: Algorand NFTs must be manually claimed by the receiver
   * @param nft {@link NftInfo} the nft to be transferred. Can be fetched from the `nftList` method of the factory.
   * @param sender {@link Sender} The owner of the NFT.
   * @param receiver Address of the Receiver of the NFT. Could be Web3 or Elrond or Tron Address.
   * @param fee validator fees from {@link estimateFees} (will be calculated automatically if not given)
   */
  transferNft<SignerF, RawNftF, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<never, unknown, unknown>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string,
    fee?: BigNumber.Value,
    mintWith?: string
  ): Promise<Resp>;

  transferBatchNft<SignerF, RawNftF, Resp>(
    fromChain: FullChainBatch<SignerF, RawNftF, Resp>,
    toChain: FullChainBatch<never, unknown, unknown>,
    nft: NftInfo<RawNftF>[],
    sender: SignerF,
    receiver: string,
    fee?: BigNumber.Value,
    mintWith?: string
  ): Promise<Resp[]>;
  /**
   * Mints an NFT on the chain.
   * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the `inner` method on the factory.
   * @param owner: {@link Signer} A signer to sign transaction, can come from either metamask, tronlink, or the elrond's maiar defi wallet.
   * @param args: {@link NftMintArgs} Arguments to mint the nft. Contract is must for web3 and tron. Identifier is must for elrond.
   */
  mint<Signer>(
    chain: MintNft<Signer, NftMintArgs, string>,
    owner: Signer,
    args: NftMintArgs
  ): Promise<string>;
  /**
   * Lists all the NFTs on the chain owner by {@param owner}.
   * @param chain: {@link NftUriChain<RawNft>} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
   * @param owner: Address of the owner of the NFT as a raw string.
   */
  nftList<RawNft>(
    chain: ChainNonceGet,
    owner: string
  ): Promise<NftInfo<RawNft>[]>;
  /**
   * Estimates the required fee for transferring an NFT.
   * @param fromChain: {@link FullChain} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
   * @param toChain: {@link FullChain} Chain to which the NFT must be sent. Can be obtained from the `inner` method on the factory.
   * @param nft: {@link NftInfo} The NFT that has to be transferred. Generally comes from the `nftList` method of the factory.
   * @param receiver: Address of the receiver of the NFT in raw string..
   */
  estimateFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ): Promise<BigNumber>;

  estimateBatchFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>[],
    receiver: string
  ): Promise<BigNumber>;
  /**
   *
   * @param nonce : {@link ChainNonce} could be a ElrondNonce, Web3Nonce, or TronNonce.
   * @param params : New Params to be set.
   */
  updateParams<T extends ChainNonce>(nonce: T, params: InferChainParam<T>): void;
  pkeyToSigner<S extends ChainNonce>(
    nonce: S,
    key: string
  ): Promise<InferSigner<InferChainH<S>>>;
  /**
   *
   * Get transaction in the destination chain
   * WARN: use claimAlgorandNft instead for algorand.
   *
   * @param chain source chain
   * @param destination destination chain
   * @param hash transaction hash from source chain
   *
   * @returns transaction hash in original chain, unique action id
   */
  getDestinationTransaction<Txn>(
    chain: ExtractAction<Txn> & ExtractTxnStatus,
    destination: number,
    hash: Txn
  ): Promise<[string, TransactionStatus]>;
  /**
   *
   * Claim an algorand nft
   *
   *
   * @param originChain chain from which the nft was transferred
   * @param txn Transaction Hash of the original
   * @param claimer the account which can claim the nft
   */
  waitAlgorandNft<Txn>(
    originChain: ExtractAction<Txn> & ChainNonceGet,
    txn: Txn,
    claimer: AlgoSignerH
  ): Promise<ClaimNftInfo>;
  /**
   *
   * @param claimer: the account which can claim the nfts
   */
  claimableAlgorandNfts(claimer: string): Promise<ClaimNftInfo[]>;

  getVerifiedContracts(
    from: string,
    targetChain: number,
    fc: number
  ): Promise<string[]>;
};

/**
 * A type representing all the supported chain params.
 */
export interface ChainParams {
  elrondParams: ElrondParams;
  hecoParams: Web3Params;
  bscParams: Web3Params;
  ropstenParams: Web3Params;
  avalancheParams: Web3Params;
  polygonParams: Web3Params;
  fantomParams: Web3Params;
  tronParams: TronParams;
  celoParams: Web3Params;
  harmonyParams: Web3Params;
  ontologyParams: Web3Params;
  xDaiParams: Web3Params;
  algorandParams: AlgorandParams;
  fuseParams: Web3Params;
  uniqueParams: Web3Params;
  tezosParams: TezosParams;
  velasParams: Web3Params;
  iotexParams: Web3Params;
  vechainParams: Web3Params;
}

export type MoralisNetwork = "mainnet" | "testnet";

/**
 * A struct for the configuration of the library.
 * @field exchangeRateUri: The URI of the exchange rate service.
 * @field moralisServer: The URI of the moralis server.
 * @field moralisAppId: The app id of the moralis server.
 * @field tronScanUri: The URI of the tron scan service.
 */
export interface AppConfig {
  exchangeRateUri: string;
  heartbeatUri: string;
  txSocketUri: string;
  nftListUri: string;
  nftListAuthToken: string;
  tronScanUri: string;
  wrappedNftPrefix: string;
}


function mapNonceToParams(
  chainParams: Partial<ChainParams>
): ParamMap {
  const cToP: ParamMap = new Map();
  cToP.set(Chain.ELROND, chainParams.elrondParams);
  cToP.set(Chain.HECO, chainParams.hecoParams);
  cToP.set(Chain.BSC, chainParams.bscParams);
  cToP.set(Chain.ETHEREUM, chainParams.ropstenParams);
  cToP.set(Chain.AVALANCHE, chainParams.avalancheParams);
  cToP.set(Chain.POLYGON, chainParams.polygonParams);
  cToP.set(Chain.FANTOM, chainParams.fantomParams);
  cToP.set(Chain.TRON, chainParams.tronParams);
  cToP.set(Chain.CELO, chainParams.celoParams!);
  cToP.set(Chain.HARMONY, chainParams.harmonyParams);
  cToP.set(Chain.ONT, chainParams.ontologyParams);
  cToP.set(Chain.XDAI, chainParams.xDaiParams);
  cToP.set(Chain.ALGORAND, chainParams.algorandParams);
  cToP.set(Chain.FUSE, chainParams.fuseParams);
  cToP.set(Chain.UNIQUE, chainParams.uniqueParams);
  cToP.set(Chain.TEZOS, chainParams.tezosParams);
  cToP.set(Chain.VELAS, chainParams.velasParams);
  cToP.set(Chain.IOTEX, chainParams.iotexParams);

  return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
export function ChainFactory(
  appConfig: AppConfig,
  chainParams: Partial<ChainParams>
): ChainFactory {
  let helpers: HelperMap<ChainNonce> = new Map();
  let cToP = mapNonceToParams(chainParams);

  const heartbeatRepo = bridgeHeartbeat(appConfig.heartbeatUri);

  const remoteExchangeRate = exchangeRateRepo(appConfig.exchangeRateUri);

  const txSocket = socketHelper(appConfig.txSocketUri);

  const nftlistRest = axios.create({
    baseURL: appConfig.nftListUri,
    headers: {
      Authorization: `Bearer ${appConfig.nftListAuthToken}`,
    },
  });

  const inner = async <T extends ChainNonce>(chain: T): Promise<InferChainH<T>> => {
    let helper = helpers.get(chain);
    if (helper === undefined) {
      helper = await CHAIN_INFO.get(chain)!.constructor(cToP.get(chain)!);
      helpers.set(chain, helper)
    }
    return helper!;
  };

  async function calcExchangeFees<T extends ChainNonce>(
    fromChain: T,
    toChain: T,
    val: BigNumber
  ): Promise<BigNumber> {
    const rate = await remoteExchangeRate.getBatchedRate([
      CHAIN_INFO.get(toChain)!.currency,
      CHAIN_INFO.get(fromChain)!.currency,
    ]);
    const feeR = val.dividedBy(CHAIN_INFO.get(toChain)!.decimals);
    const fromExRate = rate.get(CHAIN_INFO.get(fromChain)!.currency)!;
    const toExRate = rate.get(CHAIN_INFO.get(toChain)!.currency)!;
    const usdFee = Math.min(
      Math.max(FEE_MARGIN.min, feeR.times(toExRate * 0.1).toNumber()),
      FEE_MARGIN.max
    );
    const feeProfit = usdFee / fromExRate;

    return feeR
      .times(toExRate / fromExRate)
      .plus(feeProfit)
      .times(CHAIN_INFO.get(fromChain)!.decimals)
      .integerValue(BigNumber.ROUND_CEIL);
  }
  const estimateFees = async <SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ) => {
    const estimate = await toChain.estimateValidateTransferNft(
      receiver,
      nft as any,
      ""
    );
    const conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate
    );
    return conv;
  };

  async function bridgeStatus(): Promise<{ [x: number]: "alive" | "dead" }> {
    const res = await heartbeatRepo.status();
    return Object.fromEntries(
      Object.entries(res).map(([c, s]) => [
        c,
        s.bridge_alive ? "alive" : "dead",
      ])
    );
  }

  async function estimateBatchFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChainBatch<SignerF, RawNftF, Resp>,
    toChain: FullChainBatch<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>[],
    receiver: string
  ): Promise<BigNumber> {
    const estimate = await toChain.estimateValidateTransferNftBatch(
      receiver,
      nft as any,
      new Array(nft.length).fill(toChain.XpNft)
    );
    const conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate.times(nft.length)
    );
    return conv;
  }

  async function requireBridge(chains: number[]): Promise<void> {
    const status = await heartbeatRepo.status();
    let deadChain: number | undefined;
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

  const oldXpWraps: string[] = [
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

  async function checkNotOldWrappedNft(contract: string) {
    if (oldXpWraps.findIndex((x) => x === contract) !== -1) {
      throw new Error(`${contract} is an old wrapped NFT`);
    }
  }

  function checkMintWith(mw: string, contracts: string[]) {
    return (
      contracts.find((x) => x.toLowerCase() === mw.toLowerCase().trim()) !=
      undefined
    );
  }

  async function isWrappedNft(nft: NftInfo<unknown>) {
    return (typeof (await axios.get(nft.uri).catch(() => undefined))?.data.wrapped !== "undefined");
  }

  async function getVerifiedContracts(
    from: string,
    tc: number,
    fc: number
  ): Promise<string[]> {
    const res = await axios.get<{ data: { to: string }[] }>(
      `https://sc-verify.xp.network/verify/list?from=${from}&targetChain=${tc}&fromChain=${fc}`
    );
    return res.data.data.map((r) => r.to);
  }

  return {
    getVerifiedContracts,
    async transferBatchNft(from, to, nfts, signer, receiver, fee, mw) {
      type Result = ReturnType<typeof to.transferNftBatchToForeign>;
      let result: Result[] = [];
      await requireBridge([from.getNonce(), to.getNonce()]);

      if (!fee) {
        fee = await estimateBatchFees(from, to, nfts, receiver);
      }
      if (!(await to.validateAddress(receiver))) {
        throw Error("invalid address");
      }
      const wrapped: NftInfo<any>[] = [];
      const unwrapped: NftInfo<any>[] = [];
      await Promise.all(
        nfts.map(async (e) => {
          // @ts-ignore
          if (e.native.contractType && e.native.contractType === "ERC721") {
            throw new Error(`ERC721 is not supported`);
          }
          if (await isWrappedNft(e)) {
            wrapped.push(e);
          } else {
            unwrapped.push(e);
          }
        })
      );
      wrapped.length &&
        result.push(
          from.transferNftBatchToForeign(
            signer,
            to.getNonce(),
            receiver,
            unwrapped,
            mw || to.XpNft || "",
            new BigNumber(fee)
          )
        );
      unwrapped.length &&
        result.push(
          from.unfreezeWrappedNftBatch(
            signer,
            to.getNonce(),
            receiver,
            wrapped,
            new BigNumber(fee)
          )
        );
      return await Promise.all(result);
    },
    estimateBatchFees,
    async getDestinationTransaction<T>(
      chain: ExtractAction<T> & ExtractTxnStatus,
      targetNonce: number,
      txn: T
    ) {
      const action = await chain.extractAction(txn);
      const hash = await txSocket.waitTxHash(targetNonce, action);
      const status = await chain.extractTxnStatus(hash);
      return [hash, status];
    },
    async pkeyToSigner<T extends ChainNonce>(nonce: T, key: string) {
      switch (nonce) {
        case Chain.ELROND: {
          return UserSigner.fromPem(key);
        }
        case Chain.TRON: {
          return key;
        }
        case Chain.ALGORAND: {
          const algo = await inner(Chain.ALGORAND);
          const mnem = algosdk.secretKeyToMnemonic(Base64.toUint8Array(key));
          return algoSignerWrapper(
            algo.algod,
            algosdk.mnemonicToSecretKey(mnem)
          );
        }
        default: {
          const chainH = await inner(nonce) as any;
          return chainH.createWallet(key);
        }
      }
    },
    estimateFees,
    inner,
    bridgeStatus,
    updateParams<T extends ChainNonce>(chainNonce: T, params: InferChainParam<T>) {
      helpers.delete(chainNonce);
      cToP.set(chainNonce, params as any);
    },
    async nftList<T>(chain: ChainNonceGet, owner: string) {
      let res = await nftlistRest.get<{ data: NftInfo<T>[] }>(
        `/nfts/${chain.getNonce()}/${owner}`
      );

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
      mintWith
    ) => {
      //@ts-ignore
      if (nft.native.contract) {
        //@ts-ignore
        checkNotOldWrappedNft(new utils.getAddress(nft.native.contract));
      }

      const mw =
        //@ts-ignore
        nft.native.contract &&
        mintWith &&
        checkMintWith(
          mintWith,
          //@ts-ignore
          await getVerifiedContracts(
            //@ts-ignore
            nft.native.contract.toLowerCase(),
            toChain.getNonce(),
            fromChain.getNonce()
          )
        )
          ? mintWith
          : toChain.XpNft;

      await requireBridge([fromChain.getNonce(), toChain.getNonce()]);

      if (!fee) {
        fee = await estimateFees(fromChain, toChain, nft, receiver);
      }
      if (!(await toChain.validateAddress(receiver))) {
        throw Error("invalid address");
      }
      if (await isWrappedNft(nft)) {
        const res = await fromChain.unfreezeWrappedNft(
          sender,
          receiver,
          nft,
          new BigNumber(fee),
          toChain.getNonce().toString()
        );
        return res;
      } else {
        const res = await fromChain.transferNftToForeign(
          sender,
          toChain.getNonce(),
          receiver,
          nft,
          new BigNumber(fee),
          mw || ""
        );
        return res;
      }
    },
    mint: async <Signer>(
      chain: MintNft<Signer, NftMintArgs, string>,
      owner: Signer,
      args: NftMintArgs
    ): Promise<string> => {
      return await chain.mintNft(owner, args);
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
      const algo: AlgorandHelper = await inner(Chain.ALGORAND);
      return await algo.claimableNfts(txSocket, claimer);
    },
  };
}
/**
 * The interface that defines the arguments to mint an NFT.
 * @property contract is the address of the smart contract that will mint the NFT and it is mandatory for WEB3 and Tron Chains.
 * @property identifier is the identifier of the NFT to mint and it is mandatory for Elrond Chain.
 */
export interface NftMintArgs {
  readonly contract?: string;
  readonly uris: string[];
  readonly identifier?: string;
  readonly quantity?: number | undefined;
  readonly name?: string;
  readonly royalties?: number | undefined;
  readonly hash?: string | undefined;
  readonly attrs: string | undefined;
}

export * from "./factories";
export * from "./cons";
