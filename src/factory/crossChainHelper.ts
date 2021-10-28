import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain, ChainNonce, CHAIN_INFO } from "../consts";

import { BareNft, ChainNonceGet, DecodeRawNft, DecodeWrappedNft, EstimateTxFees, MintNft, NftInfo, PackNft, PopulateDecodedNft, TransferNftForeign, UnfreezeForeignNft, WrappedNftCheck } from "..";
import {
  cachedExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";
import BigNumber from "bignumber.js";
import { Transaction } from "ethers";
import axios, { AxiosResponse } from "axios";

export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type NftUriChain<RawNft> = ChainNonceGet
  & WrappedNftCheck<RawNft>
  & DecodeWrappedNft<RawNft>
  & DecodeRawNft<RawNft>
  & PopulateDecodedNft<RawNft>;

type FullChain<Signer, RawNft, Tx> = TransferNftForeign<Signer, string, BigNumber, RawNft, Tx, string>
  & UnfreezeForeignNft<Signer, string, BigNumber, RawNft, Tx, string>
  & EstimateTxFees<RawNft, BigNumber>
  & PackNft<RawNft>
  & NftUriChain<RawNft>;

/**
 * A type representing a chain factory.
 *
 */
type ChainFactory = {
  /**
   * Create a cross chain helper object
   * @param chain: {@link Chain} to create the helper for
   */
  inner<T, P>(chain: ChainNonce<T, P>): Promise<T>;
  // IMO This should Return a transaction, which can be signed later by a wallet interface.
  transferNft<
    SignerF,
    RawNftF,
    TxF,
    SignerT,
    RawNftT,
    TxT
  >(
    fromChain: FullChain<SignerF, RawNftF, TxF>,
    toChain: FullChain<SignerT, RawNftT, TxT>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string
  ): Promise<string>;
  /**
   * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the {@link inner} method.
   * @param owner: {@link Signer} A signer to  sign transaction, can come from either metamask, tronlink, or the elrond's maiar wallet.
   * @param args: {@link NftMintArgs} Arguments to mint the nft.
   */
  mint<Signer, R>(
    chain: MintNft<Signer, NftMintArgs, R>,
    owner: Signer,
    args: NftMintArgs
  ): Promise<R>;
  nftList<RawNft>(
    chain: NftUriChain<RawNft>,
    owner: string
  ): Promise<NftInfo<RawNft>[]>;
  nftUri<RawNft>(
    chain: NftUriChain<RawNft>,
    nft: NftInfo<RawNft>
  ): Promise<BareNft>;
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
}

function mapNonceToParams(
  chainParams: Partial<ChainParams>
): Map<number, Web3Params | ElrondParams | TronParams | undefined> {
  const cToP = new Map<number, Web3Params | ElrondParams | TronParams | undefined>();

  cToP.set(2, chainParams.elrondParams);
  cToP.set(3, chainParams.hecoParams);
  cToP.set(4, chainParams.bscParams);

  cToP.set(6, chainParams.avalancheParams);
  cToP.set(7, chainParams.polygonParams);
  cToP.set(8, chainParams.fantomParams);
  cToP.set(9, chainParams.tronParams);

  cToP.set(11, chainParams.celoParams);
  cToP.set(12, chainParams.harmonyParams);
  cToP.set(13, chainParams.ontologyParams);
  return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
export function ChainFactory(chainParams: Partial<ChainParams>): ChainFactory {
  let map = new Map<number, CrossChainHelper>();
  let cToP = mapNonceToParams(chainParams);
  function configBatchExchangeService(): NetworkModel.BatchExchangeRateService {
    return NetworkModel.batchExchangeRateService(
      "https://testing-bridge.xp.network/exchange"
    );
  }
  const remoteExchangeRate = cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
      configBatchExchangeService(),
      NetworkModel.exchangeRateDtoMapper()
    )
  );
  const nftlistRest = axios.create({
    baseURL: 'https://nft-list.herokuapp.com/'
  });

  const inner = async <T, P>(chain: ChainNonce<T, P>): Promise<T> => {
    let helper = map.get(chain);
    if (helper === undefined) {
      helper = await CHAIN_INFO[chain].constructor(cToP.get(chain)!);
    }
    return helper! as any as T;
  };

  async function calcExchangeFees(fromChain: number, toChain: number, val: BigNumber): Promise<BigNumber> {
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

  return {
    inner,
    async nftList<T>(
      chain: NftUriChain<T>,
      owner: string
    ) {
      let endpoint;
      switch (chain.getNonce()) {
        case Chain.ELROND:
          endpoint = `/elrond/${owner}`;
          break;
        default:
          endpoint = `/web3/${chain.getNonce()}/${owner}`;
          break;
      }
      const res: AxiosResponse<NftInfo<T>[]> = await nftlistRest.get(endpoint);

      return res.data;
    },
    async nftUri(
      chain,
      nft
    ) {
      if (chain.isWrappedNft(nft)) {
        const decoded = chain.decodeWrappedNft(nft);
        const helper: CrossChainHelper = await inner(decoded.chain_nonce);
        const native = await helper.decodeNftFromRaw(decoded.data);
        return await helper.populateNft(native as any);
      }
      return {
        uri: nft.uri,
        chainId: chain.getNonce().toString()
      };
    },
    transferNft: async (
      fromChain,
      toChain,
      nft,
      sender,
      receiver
    ): Promise<string> => {
      if (fromChain.isWrappedNft(nft)) {
        const decoded = fromChain.decodeWrappedNft(nft);
        if (decoded.chain_nonce != toChain.getNonce()) {
          throw Error("trying to send wrapped nft to non-origin chain!!!");
        }
        const approxNft = await toChain.decodeNftFromRaw(decoded.data);
        const estimate = await toChain.estimateValidateUnfreezeNft(
          receiver,
          approxNft
        );
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
        const [, action] = await fromChain.unfreezeWrappedNft(
          sender,
          receiver,
          nft,
          conv
        );
        return action;
      } else {
        const packed = fromChain.wrapNftForTransfer(nft);
        const estimate = await toChain.estimateValidateTransferNft(
          receiver,
          packed
        );
        const conv = await calcExchangeFees(fromChain.getNonce(), toChain.getNonce(), estimate);
        const [, action] = await fromChain.transferNftToForeign(
          sender,
          toChain.getNonce(),
          receiver,
          nft,
          conv
        )
        return action;
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
