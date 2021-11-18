import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain, ChainNonce, CHAIN_INFO } from "../consts";
export * from "./factories"

import {
  ChainNonceGet,
  EstimateTxFees,
  MintNft,
  NftInfo,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WrappedNftCheck,
} from "..";
import BigNumber from "bignumber.js";

import axios from "axios";
import { elrondNftList, exchangeRateRepo, moralisNftList, tronListNft } from "./cons";
import { Address } from "@elrondnetwork/erdjs/out";
import { Erc721MetadataEx } from "../erc721_metadata";
import { bridgeHeartbeat } from "../heartbeat";

export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type NftUriChain<RawNft> = ChainNonceGet &
  WrappedNftCheck<RawNft>;

type FullChain<Signer, RawNft> = TransferNftForeign<
  Signer,
  string,
  BigNumber,
  RawNft
> &
  UnfreezeForeignNft<Signer, string, BigNumber, RawNft> &
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
   * @param nft {@link NftInfo} the nft to be transferred. Can be fetched from the `nftList` method of the factory.
   * @param sender {@link Sender} The owner of the NFT.
   * @param receiver Address of the Receiver of the NFT. Could be Web3 or Elrond or Tron Address.
   */
  transferNft<SignerF, RawNftF, SignerT, RawNftT>(
    fromChain: FullChain<SignerF, RawNftF>,
    toChain: FullChain<SignerT, RawNftT>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string,
    fee?: BigNumber
  ): Promise<string>;
  /**
   * Mints an NFT on the chain.
   * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the `inner` method on the factory.
   * @param owner: {@link Signer} A signer to sign transaction, can come from either metamask, tronlink, or the elrond's maiar defi wallet.
   * @param args: {@link NftMintArgs} Arguments to mint the nft. Contract is must for web3 and tron. Identifier is must for elrond.
   */
  mint<Signer, R>(
    chain: MintNft<Signer, NftMintArgs, R>,
    owner: Signer,
    args: NftMintArgs
  ): Promise<R>;
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
  estimateFees<SignerF, RawNftF, SignerT, RawNftT>(
    fromChain: FullChain<SignerF, RawNftF>,
    toChain: FullChain<SignerT, RawNftT>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ): Promise<BigNumber>;
  /**
   * 
   * @param nonce : {@link ChainNonce} could be a ElrondNonce, Web3Nonce, or TronNonce.
   * @param params : New Params to be set.
   */
  updateParams<T, TP>(nonce: ChainNonce<T, TP>, params: TP): void;
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
}

/**
 * A struct for the configuration of the library.
 * @field exchangeRateUri: The URI of the exchange rate service.
 * @field moralisServer: The URI of the moralis server.
 * @field moralisAppId: The app id of the moralis server.
 * @field tronScanUri: The URI of the tron scan service.
 */
export interface AppConfig {
  exchangeRateUri: string,
  heartbeatUri: string,
  moralisServer: string,
  moralisAppId: string,
  tronScanUri: string,
  moralisSecret?: string,
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
  chainParams: Partial<ChainParams>,
): ChainFactory {
  let map = new Map<number, CrossChainHelper>();
  let cToP = mapNonceToParams(chainParams);

  const heartbeatRepo = bridgeHeartbeat(appConfig.heartbeatUri);

  const remoteExchangeRate = exchangeRateRepo(appConfig.exchangeRateUri);

  const elrondNftRepo = elrondNftList(chainParams.elrondParams?.node_uri || '');
  const moralisNftRepo = moralisNftList(appConfig.moralisServer, appConfig.moralisAppId, appConfig.moralisSecret);
  const tronNftRepo = chainParams.tronParams && tronListNft(
    chainParams.tronParams.provider,
    appConfig.tronScanUri,
    chainParams.tronParams.erc721_addr
  );

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
  const estimateFees = async <SignerF, RawNftF, SignerT, RawNftT>(
    fromChain: FullChain<SignerF, RawNftF>,
    toChain: FullChain<SignerT, RawNftT>,
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
      Object.entries(res)
        .map(([c, s]) => [c, s.bridge_alive ? "alive" : "dead"])
    );
  }

  async function requireBridge(chains: number[]): Promise<void> {
    const status = await heartbeatRepo.status();
    let deadChain: number | undefined;
    const alive = chains.every(c => {
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

  return {
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
          res = await elrondNftRepo.nfts(BigInt(chain.getNonce()), new Address(owner)) as any as NftInfo<T>[];
          break;
        case Chain.TRON:
          res = await tronNftRepo!.nfts(BigInt(0x9), owner) as any as NftInfo<T>[];
          break;
        case Chain.FANTOM:
        case Chain.XDAI:
          res = await nftlistRest.get(`/web3/${chain.getNonce()}/${owner}`).then(v => v.data);
          break;
        default:
          res = await moralisNftRepo.nfts(BigInt(chain.getNonce()), owner) as any as NftInfo<T>[];
          break;
      }

      return res;
    },
    transferNft: async (fromChain, toChain, nft, sender, receiver, fee) => {
      await requireBridge([fromChain.getNonce(), toChain.getNonce()]);

      if (!fee) {
        fee = await estimateFees(fromChain, toChain, nft, receiver);
      }
      if (!await toChain.validateAddress(receiver)) {
        throw Error('invalid address');
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
      chain: MintNft<Signer, NftMintArgs, any>,
      owner: Signer,
      args: NftMintArgs
    ): Promise<any> => {
      return chain.mintNft(owner, args);
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
