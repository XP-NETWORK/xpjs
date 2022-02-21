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
import { ChainV, InferChainH, InferChainParam } from "./type-utils";

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

// WARN: __helper and __params are markers
export type ChainNonce<H, P> = number & { __helper: H, __params: P };
export type ElrondNonce = ChainNonce<ElrondHelper, ElrondParams>;
export type Web3Nonce = ChainNonce<Web3Helper, Web3Params>;
export type TronNonce = ChainNonce<TronHelper, TronParams>;
export type AlgoNonce = ChainNonce<AlgorandHelper, AlgorandParams>;
export type TezosNonce = ChainNonce<TezosHelper, TezosParams>;

export namespace Chain {
  export const ELROND = 2 as ElrondNonce;
  export const HECO = 3 as Web3Nonce;
  export const BSC = 4 as Web3Nonce;
  export const ETHEREUM = 5 as Web3Nonce;
  export const AVALANCHE = 6 as Web3Nonce;
  export const POLYGON = 7 as Web3Nonce;
  export const FANTOM = 8 as Web3Nonce;
  export const TRON = 9 as TronNonce;
  export const CELO = 0xb as Web3Nonce;
  export const HARMONY = 0xc as Web3Nonce;
  export const ONT = 0xd as Web3Nonce;
  export const XDAI = 0xe as Web3Nonce;
  export const ALGORAND = 0xf as AlgoNonce;
  export const FUSE = 0x10 as Web3Nonce;
  export const UNIQUE = 0x11 as Web3Nonce;
  export const TEZOS = 0x12 as TezosNonce;
  export const VELAS = 0x13 as Web3Nonce;
  export const IOTEX = 0x14 as Web3Nonce;
}

interface ChainData<T extends ChainV> {
  name: string;
  nonce: number;
  decimals: number;
  constructor: (p: InferChainParam<T>) => Promise<InferChainH<T>>;
  blockExplorerUrl: string;
  chainId?: number;
  currency: SupportedCurrency;
}

type ChainInfo = {
  set<T extends ChainV>(k: T, v: ChainData<T> | undefined): void;
  get<T extends ChainV>(k: T): ChainData<T> | undefined;
}

export const CHAIN_INFO: ChainInfo = new Map();
CHAIN_INFO.set(Chain.ELROND, {
  name: "Elrond",
  nonce: 2,
  decimals: 1e18,
  constructor: elrondHelperFactory as any,
  blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
  currency: SupportedCurrency.EGLD
});
CHAIN_INFO.set(Chain.HECO, {
  name: "Heco",
  nonce: 3,
  chainId: 256,
  decimals: 1e18,
  blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.HT,
});
CHAIN_INFO.set(Chain.BSC, {
  name: "BSC",
  nonce: 4,
  chainId: 97,
  decimals: 1e18,
  blockExplorerUrl: "https://testnet.bscscan.com/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.BNB,
});
CHAIN_INFO.set(Chain.ETHEREUM, {
  name: "Ropsten",
  nonce: 5,
  currency: SupportedCurrency.ETH,
  chainId: 3,
  decimals: 1e18,
  blockExplorerUrl: "https://ropsten.etherscan.io/tx",
  constructor: web3HelperFactory,
});
CHAIN_INFO.set(Chain.AVALANCHE, {
  name: "Avalanche",
  nonce: 6,
  chainId: 43113,
  decimals: 1e18,
  blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.AVAX,
});
CHAIN_INFO.set(Chain.POLYGON, {
  name: "Polygon",
  nonce: 0x7,
  chainId: 80001,
  decimals: 1e18,
  blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.MATIC,
});
CHAIN_INFO.set(Chain.FANTOM, {
  name: "Fantom",
  nonce: 0x8,
  decimals: 1e18,
  chainId: 4002,
  blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.FTM,
})
CHAIN_INFO.set(Chain.TRON, {
  name: "Tron",
  nonce: 0x9,
  decimals: 1e6,
  blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
  constructor: tronHelperFactory,
  currency: SupportedCurrency.TRX,
});
CHAIN_INFO.set(Chain.CELO, {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: web3HelperFactory,
    currency: SupportedCurrency.CELO,
})
CHAIN_INFO.set(Chain.HARMONY, {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3HelperFactory,
    currency: SupportedCurrency.ONE
})
CHAIN_INFO.set(Chain.ONT, {
    name: "Ontology",
    nonce: 0xd,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3HelperFactory,
    currency: SupportedCurrency.ONT,
})
CHAIN_INFO.set(Chain.XDAI, {
    name: "xDai",
    nonce: 0xe,
    decimals: 1e18,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
    constructor: web3HelperFactory,
    currency: SupportedCurrency.STAKE
})
CHAIN_INFO.set(Chain.ALGORAND, {
    name: "Algorand",
    nonce: 0xf,
    decimals: 1e6,
    chainId: undefined,
    blockExplorerUrl: "https://algoexplorer.io/tx",
    currency: SupportedCurrency.ALGO,
    constructor: (p) => Promise.resolve(algorandHelper(p)),
});
CHAIN_INFO.set(Chain.FUSE, {
    name: "FUSE",
    nonce: 0x10,
    decimals: 1e18,
    chainId: undefined,
    blockExplorerUrl: "https://explorer.fuse.io/tx",
    currency: SupportedCurrency.FUSE,
    constructor: web3HelperFactory,
})
CHAIN_INFO.set(Chain.UNIQUE, {
    name: "Unique",
    nonce: 0x11,
    decimals: 1e18,
    chainId: 8888,
    blockExplorerUrl: "CANT FIND",
    constructor: web3HelperFactory,
    currency: SupportedCurrency.OPL,
})
CHAIN_INFO.set(Chain.TEZOS, {
    name: "Tezos",
    nonce: 0x12,
    decimals: 1e6,
    constructor: tezosHelperFactory,
    currency: SupportedCurrency.XTZ,
    blockExplorerUrl: "https://tezblock.io/transaction",
})
CHAIN_INFO.set(Chain.VELAS, {
    name: "Velas",
    blockExplorerUrl: "https://explorer.velas.com/tx",
    nonce: 0x13,
    decimals: 1e18,
    constructor: web3HelperFactory,
    currency: SupportedCurrency.VLX,
    chainId: 111,
})
CHAIN_INFO.set(Chain.IOTEX, {
    name: "IoTeX",
    blockExplorerUrl: "https://iotexscan.io/tx",
    nonce: 0x14,
    decimals: 1e18,
    constructor: web3HelperFactory,
    currency: SupportedCurrency.IOTX,
    chainId: 4689,
});

export const Config: AppConfig = {
  exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
  nftListUri: "https://indexnft.herokuapp.com",
  nftListAuthToken:
    "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
  txSocketUri: "transaction-socket.xp.network",
  tronScanUri: "https://apilist.tronscan.org/api/",
  heartbeatUri: "https://xpheartbeat.herokuapp.com",
  wrappedNftPrefix: "https://nft.xp.network/w/",
};

export const FEE_MARGIN = { min: 0.5, max: 5 }