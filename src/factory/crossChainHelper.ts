import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { CHAIN_INFO } from "../consts";

export type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type ChainFactory = {
  inner(chainNonce: number): Promise<CrossChainHelper>;
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
  };
}
