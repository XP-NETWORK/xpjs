import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain, CHAIN_INFO } from "../consts";
import { NftInfo } from "testsuite-ts";
import { BigNumber } from "bignumber.js";

export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type ChainFactory = {
  inner(chainNonce: number): Promise<CrossChainHelper>;
  // IMO This should Return a transaction, which can be signed later by a wallet interface.
  transferNft(
    fromChain: Chain,
    toChain: Chain,
    nft: NftInfo,
    sender: any,
    receiver: any,
    validators: any[]
  ): Promise<void>;
  // The function that calls the different wallet methods.
  signTransaction(txn: any): Promise<any>;
};

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
  return cToP;
}

export function chainFactory(chainParams: ChainParams): ChainFactory {
  let map = new Map<number, CrossChainHelper>();
  let cToP = mapNonceToParams(chainParams);
  return {
    inner: async (chainNonce: number): Promise<CrossChainHelper> => {
      let helper = map.get(chainNonce);
      if (helper === undefined) {
        helper = await CHAIN_INFO[chainNonce].constructor(
          cToP.get(chainNonce)!
        );
      }
      return helper!;
    },
    // TODO: Find some way to make this more generic, return a txn receipt, throw an exception, etc.
    transferNft: async (
      fromChain: Chain,
      toChain: Chain,
      nft: NftInfo,
      sender: any,
      receiver: any,
      validators: any[]
    ): Promise<void> => {
      const fromHelper = map.get(fromChain)!;
      const estimate = await fromHelper.estimateValidateTransferNft(
        validators,
        receiver,
        nft as any
      );

      if (nft.chain === fromChain) {
        await fromHelper.transferNativeToForeign(
          sender,
          toChain,
          receiver,
          nft as any,
          estimate as string | (string & BigNumber) | (BigNumber & string)
        );
      } else {
        fromHelper.transferNftToForeign(
          sender,
          fromChain,
          receiver,
          nft as any,
          estimate as string | (string & BigNumber) | (BigNumber & string)
        );
      }
    },
    signTransaction: async (_txn: any): Promise<any> => {
      // TODO
      return true;
    },
  };
}
