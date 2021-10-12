import { Interface } from "@ethersproject/abi/lib/interface";
import { Provider } from "@ethersproject/abstract-provider";
//@ts-ignore
import { TronWeb } from "tronweb";
import {
  TronHelper,
  Web3Helper,
  ElrondHelper,
  web3HelperFactory,
  tronHelperFactory,
  elrondHelperFactory,
} from "..";
type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;

type ChainFactory = {
  inner(chainNonce: number): Promise<CrossChainHelper>;
};

interface ElrondParams {
  node_uri: string;
  minter_address: string;
  esdt_swap_address: string;
  esdt: string;
  esdt_nft: string;
  esdt_swap: string;
}

interface TronParams {
  provider: TronWeb;
  middleware_uri: string;
  erc1155_addr: string;
  minter_addr: string;
  minter_abi: JSON;
}

interface Web3Params {
  provider: Provider;
  minter_addr: string;
  minter_abi: Interface;
  erc1155_addr: string;
}

export const CHAIN_INFO = {
  2: {
    name: "Elrond",
    nonce: 2,
    native: "EGLD",
    decimals: 1e18,
    constructor: elrondHelperFactory,
  },
  3: {
    name: "Heco",
    nonce: 3,
    chainId: 256,
    decimals: 1e18,
    blockExplorerUrls: "https://testnet.hecoinfo.com/tx",
    constructor: web3HelperFactory,
  },
  4: {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: 1e18,
    blockExplorerUrls: "https://testnet.bscscan.com/tx",
    constructor: web3HelperFactory,
  },
  6: {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: 1e18,
    blockExplorerUrls: "https://cchain.explorer.avax-test.network/tx",
    constructor: web3HelperFactory,
  },
  7: {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: 1e18,
    blockExplorerUrls: "https://mumbai.polygonscan.com/tx",
    constructor: web3HelperFactory,
  },
  8: {
    name: "Fantom",
    nonce: 0x8,
    decimals: 1e18,
    chainId: 4002,
    blockExplorerUrls: "https://explorer.testnet.fantom.network/transactions",
    constructor: web3HelperFactory,
  },
  9: {
    name: "Tron",
    nonce: 0x9,
    decimals: 1e6,
    blockExplorerUrls: "https://shasta.tronscan.org/#/transaction",
    constructor: tronHelperFactory,
  },
  11: {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrls: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: web3HelperFactory,
  },
  12: {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrls: "https://explorer.pops.one/tx",
    constructor: web3HelperFactory,
  },
};


export function chainFactory(
  elrondParams: ElrondParams,
  tronParams: TronParams,
  web3Params: Web3Params
): ChainFactory {
  let map = new Map<number, CrossChainHelper>();
  return {
    inner: async (chainNonce: number): Promise<CrossChainHelper> => {
      let helper = map.get(chainNonce);
      if (helper === undefined) {
        helper = await CHAIN_INFO[chainNonce].constructor();
      }
      return helper!;
    },
  };
}
