import { CrossChainHelper } from "./factory/crossChainHelper";
import { elrondHelperFactory, ElrondParams } from "./helpers/elrond";
import { tronHelperFactory, TronParams } from "./helpers/tron";
import { web3HelperFactory, Web3Params } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";

const HECO = "https://http-testnet.hecochain.com";

const BSC = "https://data-seed-prebsc-1-s1.binance.org:8545";

const AVALANCE = "https://api.avax-test.network/ext/bc/C/rpc";

const POLYGON = "https://matic-testnet-archive-rpc.bwarelabs.com";

const FANTOM = "https://rpc.testnet.fantom.network/";

const TRON = "https://api.shasta.trongrid.io/";

const CELO = "https://alfajores-forno.celo-testnet.org";

const HARMONY = "https://api.s0.b.hmny.io";

// All the supported testnet uri's are here.
export const RPCURI = {
  HECO,
  BSC,
  AVALANCE,
  POLYGON,
  FANTOM,
  TRON,
  CELO,
  HARMONY,
};

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
    currency: SupportedCurrency.CELO,
  },
};
