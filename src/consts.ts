import { CrossChainHelper } from ".";
import {
  elrondHelperFactory,
  ElrondParams,
  ElrondHelper,
} from "./helpers/elrond";
import { tronHelperFactory, TronParams, TronHelper } from "./helpers/tron";
import { web3HelperFactory, Web3Params, Web3Helper } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";
import {
  AlgorandParams,
  AlgorandHelper,
  algorandHelper,
} from "./helpers/algorand";
import { AppConfig } from "./factory";
import { TezosHelper, tezosHelperFactory, TezosParams } from "./helpers/tezos";

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
  XDAI = "https://sokol.poa.network",
  UNIQUE = "https://rpc-opal.unique.network/",
  TEZOS = "https://hangzhounet.smartpy.io",
  VELAS = "https://explorer.testnet.velas.com/rpc",
  IOTEX = "https://babel-api.testnet.iotex.io",
  // TODO: Algorand
  // TODO: Fuse
}

export enum MainNetRpcUri {
  ELROND = "https://gateway.elrond.com",
  HECO = "https://http-mainnet-node.huobichain.com",
  BSC = "https://bsc-dataseed.binance.org/",
  ETHEREUM = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  AVALANCHE = "https://api.avax.network/ext/bc/C/rpc",
  POLYGON = "https://polygon-rpc.com",
  FANTOM = "https://rpc.ftm.tools/",
  TRON = "https://api.trongrid.io/",
  CELO = "https://forno.celo.org",
  HARMONY = "https://api.harmony.one",
  XDAI = "https://rpc.xdaichain.com/",
  FUSE = "https://rpc.fuse.io/",
  VELAS = "https://mainnet.velas.com/rpc",
  TEZOS = "https://mainnet.smartpy.io",
  IOTEX = "https://babel-api.mainnet.iotex.io",
  // TODO: Algorand
}

// Marker type
export type ChainNonce<_, __> = number;
export type ElrondNonce = ChainNonce<ElrondHelper, ElrondParams>;
export type Web3Nonce = ChainNonce<Web3Helper, Web3Params>;
export type TronNonce = ChainNonce<TronHelper, TronParams>;
export type AlgoNonce = ChainNonce<AlgorandHelper, AlgorandParams>;
export type TezosNonce = ChainNonce<TezosHelper, TezosParams>;

export namespace Chain {
  export const ELROND: ElrondNonce = 2;
  export const HECO: Web3Nonce = 3;
  export const BSC: Web3Nonce = 4;
  export const ETHEREUM: Web3Nonce = 5;
  export const AVALANCHE: Web3Nonce = 6;
  export const POLYGON: Web3Nonce = 7;
  export const FANTOM: Web3Nonce = 8;
  export const TRON: TronNonce = 9;
  export const CELO: Web3Nonce = 0xb;
  export const HARMONY: Web3Nonce = 0xc;
  export const XDAI: Web3Nonce = 0xe;
  export const ALGORAND: AlgoNonce = 0xf;
  export const FUSE: Web3Nonce = 0x10;
  export const UNIQUE: Web3Nonce = 0x11;
  export const TEZOS: TezosNonce = 0x12;
  export const VELAS: Web3Nonce = 0x13;
  export const IOTEX: Web3Nonce = 0x14;
}

interface ChainData {
  name: string;
  nonce: number;
  decimals: number;
  constructor: (
    params:
      | Web3Params
      | TronParams
      | ElrondParams
      | AlgorandParams
      | TezosParams
  ) => Promise<CrossChainHelper>;
  blockExplorerUrl: string;
  chainId?: number;
  currency: SupportedCurrency;
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
  },
  3: {
    name: "Heco",
    nonce: 3,
    chainId: 256,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.HT,
  },
  4: {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.bscscan.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.BNB,
  },
  5: {
    name: "Ropsten",
    nonce: 5,
    currency: SupportedCurrency.ETH,
    chainId: 3,
    decimals: 1e18,
    blockExplorerUrl: "https://ropsten.etherscan.io/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
  },
  6: {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: 1e18,
    blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.AVAX,
  },
  7: {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: 1e18,
    blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.MATIC,
  },
  8: {
    name: "Fantom",
    nonce: 0x8,
    decimals: 1e18,
    chainId: 4002,
    blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.FTM,
  },
  9: {
    name: "Tron",
    nonce: 0x9,
    decimals: 1e6,
    blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
    constructor: (p) => tronHelperFactory(p as TronParams),
    currency: SupportedCurrency.TRX,
  },
  11: {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.CELO,
  },
  12: {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.ONE,
  },
  13: {
    name: "Ontology",
    nonce: 0xd,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.ONT,
  },
  14: {
    name: "xDai",
    nonce: 0xe,
    decimals: 1e18,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.STAKE,
  },
  15: {
    name: "Algorand",
    nonce: 0xf,
    decimals: 1e6,
    chainId: undefined,
    blockExplorerUrl: "https://algoexplorer.io/tx",
    currency: SupportedCurrency.ALGO,
    constructor: (p) => Promise.resolve(algorandHelper(p as AlgorandParams)),
  },
  16: {
    name: "FUSE",
    nonce: 0x10,
    decimals: 1e18,
    chainId: undefined,
    blockExplorerUrl: "https://explorer.fuse.io/tx",
    currency: SupportedCurrency.FUSE,
    constructor: (p) => web3HelperFactory(p as Web3Params),
  },
  17: {
    name: "Unique",
    nonce: 0x11,
    decimals: 1e18,
    chainId: 8888,
    blockExplorerUrl: "CANT FIND",
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.OPL,
  },
  18: {
    name: "Tezos",
    nonce: 0x12,
    decimals: 1e6,
    constructor: (p) => tezosHelperFactory(p as TezosParams),
    currency: SupportedCurrency.XTZ,
    blockExplorerUrl: "https://tezblock.io/transaction",
  },
  19: {
    name: "Velas",
    blockExplorerUrl: "https://explorer.velas.com/tx",
    nonce: 0x13,
    decimals: 1e18,
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.VLX,
    chainId: 111,
  },
  20: {
    name: "IoTeX",
    blockExplorerUrl: "https://iotexscan.io/tx",
    nonce: 0x14,
    decimals: 1e18,
    constructor: (p) => web3HelperFactory(p as Web3Params),
    currency: SupportedCurrency.IOTX,
    chainId: 4689,
  },
};

export const Config: AppConfig = {
  exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
  nftListUri: "https://indexnft.herokuapp.com",
  nftListAuthToken:
    "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
  txSocketUri: "https://sockettx.herokuapp.com",
  tronScanUri: "https://apilist.tronscan.org/api/",
  heartbeatUri: "https://xpheartbeat.herokuapp.com",
};
