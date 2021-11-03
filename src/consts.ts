import { CrossChainHelper } from ".";
import { elrondHelperFactory, ElrondParams } from "./helpers/elrond";
import { tronHelperFactory, TronParams } from "./helpers/tron";
import { web3HelperFactory, Web3Params } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";
import { ElrondHelper, Web3Helper, TronHelper } from "validator";

// All the supported testnet uri's are here.
export enum TestNetRpcUri {
  ELROND = "https://devnet-api.elrond.com",
  HECO = "https://http-testnet.hecochain.com",
  BSC = "https://data-seed-prebsc-1-s1.binance.org:8545",
  ROPSTEN = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
  POLYGON = "https://matic-testnet-archive-rpc.bwarelabs.com",
  FANTOM = "https://rpc.testnet.fantom.network/",
  TRON = "https://api.shasta.trongrid.io/",
  CELO = "https://alfajores-forno.celo-testnet.org",
  HARMONY = "https://api.s0.b.hmny.io",
  XDAI = "https://sokol.poa.network"
}

export enum MainNetRpcUri {
  ELROND = "https://gateway.elrond.com",
  HECO = "https://http-mainnet-node.huobichain.com",
  BSC = "https://bsc-dataseed.binance.org/",
  ETHEREUM = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  AVALANCHE = "https://api.avax.network/ext/bc/C/rpc",
  POLYGON = "https://rpc-mainnet.matic.network",
  FANTOM = "https://rpc.ftm.tools/",
  TRON = "https://api.trongrid.io/",
  CELO = "https://forno.celo.org",
  HARMONY = "https://api.harmony.one",
  XDAI = "https://rpc.xdaichain.com/"
}

export type ChainNonce<T, P> = number & ThisType<T> & ThisType<P>;
export type ElrondNonce = ChainNonce<ElrondHelper, ElrondParams>;
export type Web3Nonce = ChainNonce<Web3Helper, Web3Params>;
export type TronNonce = ChainNonce<TronHelper, TronParams>;

export namespace Chain {
  export const ELROND: ElrondNonce = 2;
  export const HECO: Web3Nonce = 3;
  export const BSC: Web3Nonce = 4;
  export const ROPSTEN: Web3Nonce = 5;
  export const AVALANCHE: Web3Nonce = 6;
  export const POLYGON: Web3Nonce = 7;
  export const FANTOM: Web3Nonce = 8;
  export const TRON: TronNonce = 9;
  export const CELO: Web3Nonce = 0xb;
  export const HARMONY: Web3Nonce = 0xc;
  export const XDAI: Web3Nonce = 0xe;
}

interface ChainData {
  name: string;
  nonce: number;
  decimals: number;
  constructor: (
    params: Web3Params | TronParams | ElrondParams
  ) => Promise<CrossChainHelper>;
  blockExplorerUrl: string;
  chainId?: number;
  currency: SupportedCurrency;
  validators: string[];
}

interface ChainInfo {
  [nonce: number]: ChainData;
}

export const CHAIN_INFO: ChainInfo = {
  2: {
    name: "Elrond",
    nonce: 2,
    decimals: 1e18,
    constructor: (p) => elrondHelperFactory(p as ElrondParams),
    blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
    currency: SupportedCurrency.EGLD,
    validators: [
      "erd1qqqqqqqqqqqqqpgqx8dhqmvpnm4f0ylhazn7elwrx7gvmwnnk4asyp83t6",
    ],
  },
  3: {
    name: "Heco",
    nonce: 3,
    chainId: 256,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.HT,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  4: {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.bscscan.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.BNB,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  5: {
    name: "Ropsten",
    nonce: 5,
    currency: SupportedCurrency.ETH,
    chainId: 3,
    decimals: 1e18,
    blockExplorerUrl: "https://ropsten.etherscan.io/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  6: {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: 1e18,
    blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.AVAX,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  7: {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: 1e18,
    blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.MATIC,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  8: {
    name: "Fantom",
    nonce: 0x8,
    decimals: 1e18,
    chainId: 4002,
    blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.FTM,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  9: {
    name: "Tron",
    nonce: 0x9,
    decimals: 1e6,
    blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
    constructor: (p) => tronHelperFactory(p as TronParams),
    currency: SupportedCurrency.TRX,
    validators: ["TDESCaeTLQwvXv1GDz9Q1AKDMAmDk4AF6x"],
  },
  11: {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.CELO,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  12: {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.CELO,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  },
  // 13: {
  //   name: "Ontology",
  //   nonce: 0xd,
  //   decimals: 1e18,
  //   chainId: 1666700000,
  //   blockExplorerUrl: "https://explorer.pops.one/tx",
  //   constructor: (p) => web3HelperFactory(p as Web3Params),
  //   currency: SupportedCurrency.CELO,
  //   validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  // },
  14: {
    name: "xDai",
    nonce: 0xe,
    decimals: 1e18,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.STAKE,
    validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
  }
};
