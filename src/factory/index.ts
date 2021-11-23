import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
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
  MintNft,
  NftInfo,
  socketHelper,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WrappedNftCheck,
} from "..";
import BigNumber from "bignumber.js";

import axios from "axios";
import {
  algoListNft,
  elrondNftList,
  exchangeRateRepo,
  moralisNftList,
  moralisTestnetNftList,
  tronListNft,
} from "./cons";
import { Address, UserSigner } from "@elrondnetwork/erdjs/out";
import { Erc721MetadataEx } from "../erc721_metadata";
import { bridgeHeartbeat } from "../heartbeat";
import { Wallet } from "ethers";
import { AlgorandArgs, AlgorandHelper, AlgoSignerH, ClaimNftInfo } from "../helpers/algorand";
import algosdk from "algosdk";
import { Base64 } from "js-base64";


export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type NftUriChain<RawNft> = ChainNonceGet & WrappedNftCheck<RawNft>;

type FullChain<Signer, RawNft, Resp> = TransferNftForeign<
  Signer,
  string,
  BigNumber,
  RawNft,
  Resp
> &
  UnfreezeForeignNft<Signer, string, BigNumber, RawNft, Resp> &
  EstimateTxFees<BigNumber> &
  NftUriChain<RawNft> &
  ValidateAddress;

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
    fee?: BigNumber
  ): Promise<Resp>;
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
    chain: ExtractAction<Txn>,
    destination: number,
    hash: Txn,
  ): Promise<string>;
  /**
   * 
   * Claim an algorand nft
   * 
   * 
   * @param originChain chain from which the nft was transferred
   * @param txn Transaction Hash of the original
   * @param claimer the account which can claim the nft
   */
  claimAlgorandNft<Txn>(
    originChain: ExtractAction<Txn>,
    txn: Txn,
    claimer: AlgoSignerH
  ): Promise<string>
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
  algorandParams: AlgorandArgs;
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
  moralisServer: string;
  moralisAppId: string;
  tronScanUri: string;
  moralisSecret?: string;
  moralisNetwork: MoralisNetwork;
}

function mapNonceToParams(
  chainParams: Partial<ChainParams>
): Map<number, Web3Params | ElrondParams | TronParams | undefined> {
  const cToP = new Map<
    number,
    Web3Params | ElrondParams | TronParams | undefined
  >();

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

  const elrondNftRepo = elrondNftList(chainParams.elrondParams?.node_uri || "");
  const moralisNftRepo =
    appConfig.moralisNetwork === "mainnet"
      ? moralisNftList(
          appConfig.moralisServer,
          appConfig.moralisAppId,
          appConfig.moralisSecret
        )
      : moralisTestnetNftList(
          appConfig.moralisServer,
          appConfig.moralisAppId,
          appConfig.moralisSecret
        );
  const tronNftRepo =
    chainParams.tronParams &&
    tronListNft(
      chainParams.tronParams.provider,
      appConfig.tronScanUri,
      chainParams.tronParams.erc721_addr
    );
  const algoNftRepo =
    chainParams.algorandParams &&
    algoListNft(chainParams.algorandParams.algodUri);

  const nftlistRest = axios.create({
    baseURL: "https://nft-list.herokuapp.com/",
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
    if (fromChain.isWrappedNft(nft)) {
      const estimate = await toChain.estimateValidateUnfreezeNft(
        receiver,
        nft.uri
      );
      const conv = await calcExchangeFees(
        fromChain.getNonce(),
        toChain.getNonce(),
        estimate
      );
      return conv;
    } else {
      const estimate = await toChain.estimateValidateTransferNft(
        receiver,
        "a".repeat(55) // approx size of uri
      );
      const conv = await calcExchangeFees(
        fromChain.getNonce(),
        toChain.getNonce(),
        estimate
      );
      return conv;
    }
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
      default: {
        throw Error(`unknown chain ${nonce}`);
      }
    }
  }

  return {
    async getDestinationTransaction<T>(chain: ExtractAction<T>, targetNonce: number, hash: T) {
      const action = await chain.extractAction(hash);
      return await txSocket.waitTxHash(targetNonce, action);
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
          const mnem = algosdk.secretKeyToMnemonic(Base64.toUint8Array(key));
          return algosdk.mnemonicToSecretKey(mnem) as unknown as S;
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
      let res: NftInfo<T>[];
      switch (chain.getNonce()) {
        case Chain.ELROND:
          res = (await elrondNftRepo.nfts(
            BigInt(chain.getNonce()),
            new Address(owner)
          )) as any as NftInfo<T>[];
          break;
        case Chain.TRON:
          res = (await tronNftRepo!.nfts(
            BigInt(0x9),
            owner
          )) as any as NftInfo<T>[];
          break;
        case Chain.ALGORAND:
          res = (await algoNftRepo!.nfts(
            BigInt(0xf),
            owner
          )) as any as NftInfo<T>[];
          break;
        case Chain.FANTOM:
        case Chain.XDAI:
          res = await nftlistRest
            .get(`/web3/${chain.getNonce()}/${owner}`)
            .then((v) => v.data);
          break;
        default:
          res = (await moralisNftRepo.nfts(
            BigInt(chain.getNonce()),
            owner
          )) as any as NftInfo<T>[];
          break;
      }

      return res;
    },
    transferNft: async (fromChain, toChain, nft, sender, receiver, fee) => {
      await requireBridge([fromChain.getNonce(), toChain.getNonce()]);

      if (!fee) {
        fee = await estimateFees(fromChain, toChain, nft, receiver);
      }
      if (!(await toChain.validateAddress(receiver))) {
        throw Error("invalid address");
      }
      if (fromChain.isWrappedNft(nft)) {
        const meta = await axios.get<Erc721MetadataEx<unknown>>(nft.uri);
        if (meta.data.wrapped.origin != toChain.getNonce().toString()) {
          throw Error("trying to send wrapped nft to non-origin chain!!!");
        }
        const res = await fromChain.unfreezeWrappedNft(
          sender,
          receiver,
          nft,
          fee
        );
        return res;
      } else {
        const res = await fromChain.transferNftToForeign(
          sender,
          toChain.getNonce(),
          receiver,
          nft,
          fee
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
    claimAlgorandNft: async (
      origin,
      hash,
      claimer
    ) => {
      const action = await origin.extractAction(hash);
      const algo: AlgorandHelper = await inner(Chain.ALGORAND);

      return await algo.claimAlgorandNft(claimer, action, txSocket);
    }
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
