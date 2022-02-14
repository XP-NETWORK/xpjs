import {
  ElrondHelper,
  ElrondParams,
  ElrondRawUnsignedTxn,
} from "../helpers/elrond";
import { TronHelper, TronParams, TronRawTxn } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import {
  Chain,
  ChainNonce,
  CHAIN_INFO,
  ElrondNonce,
  TronNonce,
  Web3Nonce,
} from "../consts";
export * from "./factories";

import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  extractWrappedMetadata,
  MintNft,
  MintRawTxn,
  NftInfo,
  PreTransferRawTxn,
  socketHelper,
  TransactionStatus,
  TransferNftForeign,
  TransferNftForeignUnsigned,
  UnfreezeForeignNft,
  UnfreezeForeignNftUnsigned,
  ValidateAddress,
  WrappedNftCheck,
} from "..";
import BigNumber from "bignumber.js";

import axios from "axios";
import { exchangeRateRepo } from "./cons";
import { UserSigner } from "@elrondnetwork/erdjs/out";
import { Erc721MetadataEx } from "../erc721_metadata";
import { bridgeHeartbeat } from "../heartbeat";
import { BigNumberish, PopulatedTransaction, utils } from "ethers";
import {
  AlgorandParams,
  AlgorandHelper,
  AlgoSignerH,
  algoSignerWrapper,
  ClaimNftInfo,
} from "../helpers/algorand";
import algosdk from "algosdk";
import { Base64 } from "js-base64";
import { TezosHelper, TezosParams } from "../helpers/tezos";
import {
  EstimateTxFeesBatch,
  TransferNftForeignBatch,
  UnfreezeForeignNftBatch,
} from "../helpers/chain";

export type CrossChainHelper =
  | ElrondHelper
  | Web3Helper
  | TronHelper
  | AlgorandHelper
  | TezosHelper;

type NftUriChain<RawNft> = ChainNonceGet & WrappedNftCheck<RawNft>;

type FullChain<Signer, RawNft, Resp> = TransferNftForeign<
  Signer,
  string,
  BigNumber,
  RawNft,
  Resp
> &
  UnfreezeForeignNft<Signer, string, BigNumber, RawNft, Resp> &
  EstimateTxFees<BigNumber, RawNft> &
  NftUriChain<RawNft> &
  ValidateAddress & { XpNft?: string } & EstimateTxFeesBatch<
    BigNumber,
    RawNft
  > &
  TransferNftForeignBatch<Signer, string, BigNumber, RawNft, Resp> &
  UnfreezeForeignNftBatch<Signer, string, BigNumber, RawNft, Resp>;

type RawTxnBuiladableChain<RawNft, Resp> = TransferNftForeignUnsigned<
  string,
  BigNumber,
  RawNft,
  Resp
> &
  UnfreezeForeignNftUnsigned<string, BigNumber, RawNft, Resp> &
  WrappedNftCheck<RawNft> &
  PreTransferRawTxn<RawNft, Resp> &
  MintRawTxn<Resp>;
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
  inner<T, P>(chain: ChainNonce<T, P>): Promise<T>;
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
  transferNft<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string,
    fee?: BigNumber.Value,
    mintWith?: string
  ): Promise<Resp>;

  transferBatchNft<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
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
    chain: NftUriChain<RawNft>,
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
  updateParams<T, TP>(nonce: ChainNonce<T, TP>, params: TP): void;
  nonceToChainNonce(nonce: number): ElrondNonce | TronNonce | Web3Nonce;
  pkeyToSigner<S>(
    nonce: ChainNonce<WrappedNftCheck<S>, unknown>,
    key: string
  ): Promise<S>;
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
  /**
   * Returns a raw txn (hopefully Typed JS Objects in all chains) which can be sent over the wire for signing and broadcasting.
   * @param from The chain from which the NFT is being sent.
   * @param toNonce The nonce of the chain to which the NFT is being sent.
   * @param sender the address of the sender of the NFT.
   * @param to the address of the receiver of the NFT.
   * @param nft the NFT to be transferred.
   * @param fee the fee to be paid for the transaction.
   */
  generateNftTxn<RawNftF, Resp>(
    from: RawTxnBuiladableChain<RawNftF, Resp>,
    toNonce: number,
    sender: string,
    to: string,
    nft: NftInfo<RawNftF>,
    fee: BigNumber,
    mintWith: string,
    nonce: string
  ): Promise<PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn>;

  generatePreTransferTxn<RawNftF, Resp>(
    from: RawTxnBuiladableChain<RawNftF, Resp>,
    sender: string,
    nft: NftInfo<RawNftF>,
    fee: BigNumber
  ): Promise<
    PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn | undefined
  >;

  generateMintTxn<RawNftF, Resp>(
    from: RawTxnBuiladableChain<RawNftF, Resp>,
    sender: string,
    nft: NftMintArgs
  ): Promise<PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn>;

  getVerifiedContracts(from: string, targetChain: number): Promise<string[]>;
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

type AllParams =
  | Web3Params
  | ElrondParams
  | TronParams
  | AlgorandParams
  | TezosParams
  | undefined;

function mapNonceToParams(
  chainParams: Partial<ChainParams>
): Map<number, AllParams> {
  const cToP = new Map<number, AllParams>();

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
export function ChainFactory(
  appConfig: AppConfig,
  chainParams: Partial<ChainParams>
): ChainFactory {
  let map = new Map<number, CrossChainHelper>();
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

  const inner = async <T, P>(chain: ChainNonce<T, P>): Promise<T> => {
    let helper = map.get(chain);
    if (helper === undefined) {
      helper = await CHAIN_INFO[chain].constructor(cToP.get(chain)!);
    }
    return helper! as any as T;
  };

  async function calcExchangeFees(
    fromChain: number,
    toChain: number,
    val: BigNumber
  ): Promise<BigNumber> {
    const exrate = await remoteExchangeRate.getExchangeRate(
      CHAIN_INFO[toChain].currency,
      CHAIN_INFO[fromChain].currency
    );

    return val
      .dividedBy(CHAIN_INFO[toChain].decimals)
      .times(exrate * 1.05)
      .times(CHAIN_INFO[fromChain].decimals)
      .integerValue(BigNumber.ROUND_CEIL);
  }
  const estimateFees = async <SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ) => {
    const estimate = await fromChain.estimateValidateTransferNft(
      receiver,
      nft,
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
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>[],
    receiver: string
  ): Promise<BigNumber> {
    const estimate = await fromChain.estimateValidateTransferNftBatch(
      receiver,
      nft,
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
    if (contracts.findIndex((x) => x === mw) !== -1) {
      return true;
    }
    return false;
  }

  function nonceToChainNonce(
    nonce: number
  ): ElrondNonce | Web3Nonce | TronNonce {
    switch (nonce) {
      case 2: {
        return Chain.ELROND;
      }
      case 3: {
        return Chain.HECO;
      }
      case 4: {
        return Chain.BSC;
      }
      case 5: {
        return Chain.ETHEREUM;
      }
      case 6: {
        return Chain.AVALANCHE;
      }
      case 7: {
        return Chain.POLYGON;
      }
      case 8: {
        return Chain.FANTOM;
      }
      case 9: {
        return Chain.TRON;
      }
      case 11: {
        return Chain.CELO;
      }
      case 12: {
        return Chain.HARMONY;
      }
      case 14: {
        return Chain.XDAI;
      }
      case 15: {
        return Chain.ALGORAND;
      }
      case 16: {
        return Chain.FUSE;
      }
      default: {
        throw Error(`unknown chain ${nonce}`);
      }
    }
  }

  async function getVerifiedContracts(
    from: string,
    tc: number
  ): Promise<string[]> {
    const res = await axios.get<{ data: { to: string }[] }>(
      `https://sc-verify.xp.network/verify/list?from=${from}&targetChain=${tc}`
    );
    return res.data.data.map((r) => r.to);
  }

  return {
    async generatePreTransferTxn(from, sender, nft, fee) {
      return await from.preTransferRawTxn(nft, sender, fee);
    },
    getVerifiedContracts,
    async generateNftTxn(
      chain,
      toNonce,
      sender,
      receiver,
      nft,
      fee,
      mw,
      nonce
    ) {
      if (await chain.isWrappedNft(nft, appConfig.wrappedNftPrefix)) {
        return chain.unfreezeWrappedNftTxn(
          receiver,
          nft,
          fee,
          sender,

          nonce
        );
      } else {
        return chain.transferNftToForeignTxn(
          toNonce,
          receiver,
          nft,
          fee,
          sender,
          mw
        );
      }
    },

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
          if (await from.isWrappedNft(e, appConfig.wrappedNftPrefix)) {
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
    async generateMintTxn(chain, sender, nft) {
      return await chain.mintRawTxn(nft, sender);
    },
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
    nonceToChainNonce,
    async pkeyToSigner<S>(nonce: ChainNonce<S, unknown>, key: string) {
      let chain = nonceToChainNonce(nonce);
      switch (chain) {
        case Chain.ELROND: {
          return UserSigner.fromPem(key) as unknown as S;
        }
        case Chain.TRON: {
          return key as unknown as S;
        }
        case Chain.ALGORAND: {
          const algo: AlgorandHelper = await inner(Chain.ALGORAND);
          const mnem = algosdk.secretKeyToMnemonic(Base64.toUint8Array(key));
          return algoSignerWrapper(
            algo.algod,
            algosdk.mnemonicToSecretKey(mnem)
          ) as unknown as S;
        }
        default: {
          const chainH = await inner<Web3Helper, Web3Nonce>(chain);
          return chainH.createWallet(key) as unknown as S;
        }
      }
    },
    estimateFees,
    inner,
    bridgeStatus,
    updateParams<T, TP>(chainNonce: ChainNonce<T, TP>, params: TP) {
      map.delete(chainNonce);
      cToP.set(chainNonce, params as any);
    },
    async nftList<T>(chain: NftUriChain<T>, owner: string) {
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
          await getVerifiedContracts(nft.native.contract, toChain.getNonce())
        )
          ? mintWith
          : fromChain.XpNft;

      await requireBridge([fromChain.getNonce(), toChain.getNonce()]);

      if (!fee) {
        fee = await estimateFees(fromChain, toChain, nft, receiver);
      }
      if (!(await toChain.validateAddress(receiver))) {
        throw Error("invalid address");
      }
      if (await fromChain.isWrappedNft(nft, appConfig.wrappedNftPrefix)) {
        const meta = await extractWrappedMetadata(nft);
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
