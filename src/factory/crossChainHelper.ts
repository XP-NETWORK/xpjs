import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain, CHAIN_INFO } from "../consts";

import { MintNft } from "..";
import { Address, ISigner } from "@elrondnetwork/erdjs/out";
import { Signer } from "ethers";
import {
  cachedExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";
import BigNumber from "bignumber.js";

export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

/**
 * A type representing a chain factory.
 *
 */
type ChainFactory = {
  /**
   * Create a cross chain helper object
   * @param chain: {@link Chain} to create the helper for
   */
  inner(chain: Chain): Promise<CrossChainHelper>;
  // IMO This should Return a transaction, which can be signed later by a wallet interface.
  transferNft(
    fromChain: Chain,
    toChain: Chain,
    nft: any,
    sender: any,
    receiver: any
  ): Promise<any>;
  /**
   * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the {@link inner} method.
   * @param owner: {@link Signer} A signer to  sign transaction, can come from either metamask, tronlink, or the elrond's maiar wallet.
   * @param args: {@link NftMintArgs} Arguments to mint the nft.
   */
  mint<Signer>(
    chain: MintNft<Signer, NftMintArgs, any>,
    owner: Signer,
    args: NftMintArgs
  ): Promise<any>;
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
  chainParams: ChainParams
): Map<number, Web3Params | ElrondParams | TronParams> {
  const cToP = new Map<number, Web3Params | ElrondParams | TronParams>();

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
export function ChainFactory(chainParams: ChainParams): ChainFactory {
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

  const inner = async (chain: Chain): Promise<CrossChainHelper> => {
    let helper = map.get(chain);
    if (helper === undefined) {
      helper = await CHAIN_INFO[chain].constructor(cToP.get(chain)!);
    }
    return helper!;
  };

  return {
    inner,
    // TODO: Find some way to make this more generic, return a txn receipt, throw an exception, etc.
    transferNft: async (
      fromChain: Chain,
      toChain: Chain,
      nft: any,
      sender: ISigner & Signer & string,
      receiver: Address & string
    ): Promise<any> => {
      const fromHelper = await inner(fromChain);
      const toHelper = await inner(toChain);
      const estimate = await toHelper.estimateValidateTransferNft(
        receiver,
        nft
      );
      console.log(`Estimate : ${estimate}`);
      const exrate = await remoteExchangeRate.getExchangeRate(
        CHAIN_INFO[toChain].currency,
        CHAIN_INFO[fromChain].currency
      );
      const conv = estimate
        .dividedBy(CHAIN_INFO[toChain].decimals)
        .times(exrate * 1.05)
        .times(CHAIN_INFO[fromChain].decimals)
        .integerValue(BigNumber.ROUND_CEIL);
      console.log("Converted Value: ", conv.toString());
      if (nft.chain === fromChain) {
        const transfer = await fromHelper.transferNativeToForeign(
          sender,
          toChain,
          receiver,
          nft,
          conv
        );
        return transfer;
      } else {
        if (fromHelper.isWrappedNft(nft)) {
          await fromHelper.unfreezeWrappedNft(sender, receiver, nft.id, conv);
          if (fromChain == toChain) {
            return;
          } else {
            const receipt = await fromHelper.transferNftToForeign(
              sender,
              fromChain,
              receiver,
              nft,
              conv
            );
            return receipt;
          }
        }
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
