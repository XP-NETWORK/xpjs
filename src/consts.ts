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
import { TezosHelper, tezosHelperFactory, TezosParams } from "./helpers/tezos";
import { ChainNonce, InferChainH, InferChainParam } from "./type-utils";
import {
  SecretHelper,
  secretHelperFactory,
  SecretParams,
} from "./helpers/secret";
import { solanaHelper, SolanaHelper, SolanaParams } from "./helpers/solana";
import { tonHelper, TonHelper, TonParams } from "./helpers/ton";
import {
  dfinityHelper,
  DfinityHelper,
  DfinityParams,
} from "./helpers/dfinity/dfinity";
import { NearHelper, NearParams, nearHelperFactory } from "./helpers/near";

// All the supported testnet uri's are here.
export enum TestNetRpcUri {
  ELROND = "https://devnet-gateway.elrond.com",
  HECO = "https://http-testnet.hecochain.com",
  BSC = "https://data-seed-prebsc-1-s1.binance.org:8545",
  ROPSTEN = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
  POLYGON = "https://matic-mumbai.chainstacklabs.com",
  FANTOM = "https://rpc.testnet.fantom.network/",
  TRON = "https://api.shasta.trongrid.io/",
  CELO = "https://alfajores-forno.celo-testnet.org",
  HARMONY = "https://api.s0.b.hmny.io",
  XDAI = "https://sokol.poa.network",
  UNIQUE = "https://rpc-opal.unique.network/",
  TEZOS = "https://ghostnet.smartpy.io",
  VELAS = "https://explorer.testnet.velas.com/rpc",
  IOTEX = "https://babel-api.testnet.iotex.io",
  AURORA = "https://testnet.aurora.dev/",
  GODWOKEN = "https://godwoken-testnet-v1.ckbapp.dev",
  GATECHAIN = "https://meteora-evm.gatenode.cc",
  VECHAIN = "https://sync-testnet.veblocks.net",
  SECRET = "https://pulsar-2.api.trivium.network:9091/",
  SKALE = "https://staging-v2.skalenodes.com/v1/rapping-zuben-elakrab",
  HEDERA = "https://0.testnet.hedera.com/",
  NEAR = "https://rpc.testnet.near.org",
  MOONBEAM = "https://rpc.api.moonbase.moonbeam.network",
  ABEYCHAIN = "https://testrpc.abeychain.com",
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
  HARMONY = "https://rpc.s0.t.hmny.io",
  XDAI = "https://gnosis.xp.network/node",
  FUSE = "https://rpc.fuse.io/",
  VELAS = "https://mainnet.velas.com/rpc",
  TEZOS = "https://mainnet.smartpy.io",
  IOTEX = "https://babel-api.mainnet.iotex.io",
  AURORA = "https://mainnet.aurora.dev",
  GODWOKEN = "https://v1.mainnet.godwoken.io/rpc",
  GATECHAIN = "https://evm.gatenode.cc",
  VECHAIN = "https://sync-mainnet.veblocks.net",
  SECRET = "https://secret-4.api.trivium.network:9091",
  SKALE = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague",
  NEAR = "https://rpc.mainnet.near.org",
  MOONBEAM = "https://rpc.api.moonbeam.network",
  ABEYCHAIN = "https://rpc.abeychain.com",
  // TODO: Algorand
}

type ElrondMeta = [ElrondHelper, ElrondParams];
type Web3Meta = [Web3Helper, Web3Params];
type TronMeta = [TronHelper, TronParams];
type AlgoMeta = [AlgorandHelper, AlgorandParams];
type TezosMeta = [TezosHelper, TezosParams];
type SecretMeta = [SecretHelper, SecretParams];
type SolanaMeta = [SolanaHelper, SolanaParams];
type TonMeta = [TonHelper, TonParams];
type DfinityMeta = [DfinityHelper, DfinityParams];
type NearMeta = [NearHelper, NearParams];

// Static Assert to Ensure all values of Chain are in MetaMap
type MetaMapAssert = { [idx in typeof Chain[keyof typeof Chain]]: unknown };

export type MetaMap = {
  2: ElrondMeta;
  3: Web3Meta;
  4: Web3Meta;
  5: Web3Meta;
  6: Web3Meta;
  7: Web3Meta;
  8: Web3Meta;
  9: TronMeta;
  0xb: Web3Meta;
  0xc: Web3Meta;
  0xd: Web3Meta;
  0xe: Web3Meta;
  0xf: AlgoMeta;
  0x10: Web3Meta;
  0x11: Web3Meta;
  0x12: TezosMeta;
  0x13: Web3Meta;
  0x14: Web3Meta;
  0x15: Web3Meta;
  0x16: Web3Meta;
  0x17: Web3Meta;
  0x18: SecretMeta;
  0x19: Web3Meta;
  0x1a: SolanaMeta;
  0x1b: TonMeta;
  0x1c: DfinityMeta;
  0x1d: Web3Meta;
  0x1e: Web3Meta;
  0x1f: NearMeta;
  0x20: Web3Meta;
  0x21: Web3Meta;
} & MetaMapAssert;

export namespace Chain {
  export const ELROND = 2;
  export const HECO = 3;
  export const BSC = 4;
  export const ETHEREUM = 5;
  export const AVALANCHE = 0x6;
  export const POLYGON = 7;
  export const FANTOM = 8;
  export const TRON = 9;
  export const CELO = 0xb; //11
  export const HARMONY = 0xc; //12
  export const ONT = 0xd; //13
  export const XDAI = 0xe; //14
  export const ALGORAND = 0xf; //15
  export const FUSE = 0x10; // 16
  export const UNIQUE = 0x11; // 17
  export const TEZOS = 0x12; // 18
  export const VELAS = 0x13; // 19
  export const IOTEX = 0x14; // 20
  export const AURORA = 0x15; // 21
  export const GODWOKEN = 0x16; // 22
  export const GATECHAIN = 0x17; // 23
  export const SECRET = 0x18; // 24
  export const VECHAIN = 0x19; // 25
  export const SOLANA = 0x1a; // 26
  export const TON = 0x1b; // 27
  export const DFINITY = 0x1c; // 28
  export const HEDERA = 0x1d; // 29
  export const SKALE = 0x1e; // 30
  export const NEAR = 0x1f; // 31
  export const MOONBEAM = 0x20; // 32
  export const ABEYCHAIN = 0x21; // 33
}

interface ChainData<T extends ChainNonce> {
  name: string;
  nonce: number;
  decimals: number;
  constructor: (p: InferChainParam<T>) => Promise<InferChainH<T>>;
  blockExplorerUrl: string;
  chainId?: number;
  currency: SupportedCurrency;
}

type ChainInfo = {
  set<T extends ChainNonce>(k: T, v: ChainData<T> | undefined): void;
  get<T extends ChainNonce>(k: T): ChainData<T> | undefined;
};

export const CHAIN_INFO: ChainInfo = new Map();
CHAIN_INFO.set(Chain.ELROND, {
  name: "Elrond",
  nonce: 2,
  decimals: 1e18,
  constructor: elrondHelperFactory,
  blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
  currency: SupportedCurrency.EGLD,
});
CHAIN_INFO.set(Chain.HECO, {
  name: "HECO",
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
  name: "Ethereum",
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
});
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
});
CHAIN_INFO.set(Chain.HARMONY, {
  name: "Harmony",
  nonce: 0xc,
  decimals: 1e18,
  chainId: 1666700000,
  blockExplorerUrl: "https://explorer.pops.one/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ONE,
});
CHAIN_INFO.set(Chain.ONT, {
  name: "Ontology",
  nonce: 0xd,
  decimals: 1e18,
  chainId: 1666700000,
  blockExplorerUrl: "https://explorer.pops.one/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ONT,
});
CHAIN_INFO.set(Chain.XDAI, {
  name: "xDai",
  nonce: 0xe,
  decimals: 1e18,
  chainId: 0x64,
  blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.XDAI,
});
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
});
CHAIN_INFO.set(Chain.UNIQUE, {
  name: "Unique",
  nonce: 0x11,
  decimals: 1e18,
  chainId: 8888,
  blockExplorerUrl: "CANT FIND",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.OPL,
});
CHAIN_INFO.set(Chain.TEZOS, {
  name: "Tezos",
  nonce: 0x12,
  decimals: 1e6,
  constructor: tezosHelperFactory,
  currency: SupportedCurrency.XTZ,
  blockExplorerUrl: "https://tezblock.io/transaction",
});
CHAIN_INFO.set(Chain.VELAS, {
  name: "Velas",
  blockExplorerUrl: "https://explorer.velas.com/tx",
  nonce: 0x13,
  decimals: 1e18,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.VLX,
  chainId: 111,
});
CHAIN_INFO.set(Chain.AURORA, {
  name: "Aurora",
  blockExplorerUrl: "https://aurorascan.dev/tx",
  nonce: Chain.AURORA,
  decimals: 1e18,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.AURORA,
  chainId: 1313161554,
});
CHAIN_INFO.set(Chain.IOTEX, {
  name: "IoTeX",
  blockExplorerUrl: "https://iotexscan.io/tx",
  nonce: 0x14,
  decimals: 1e18,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.IOTX,
  chainId: 4689,
});
CHAIN_INFO.set(Chain.GODWOKEN, {
  name: "GodWoken",
  blockExplorerUrl: "https://aggron.layerview.io/tx/",
  constructor: web3HelperFactory,
  nonce: 0x16,
  decimals: 1e18,
  currency: SupportedCurrency.CKB,
  chainId: 868455272153094,
});
CHAIN_INFO.set(Chain.GATECHAIN, {
  name: "GateChain",
  blockExplorerUrl: "https://gatescan.org/testnet/tx",
  constructor: web3HelperFactory,
  nonce: 0x17,
  decimals: 1e18,
  currency: SupportedCurrency.GT,
  chainId: 85,
});
CHAIN_INFO.set(Chain.VECHAIN, {
  name: "VeChain",
  blockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
  constructor: web3HelperFactory,
  nonce: 0x19,
  currency: SupportedCurrency.VET,
  decimals: 1e18,
  chainId: 39,
});
CHAIN_INFO.set(Chain.SECRET, {
  name: "Secret",
  blockExplorerUrl: "", // TODO
  constructor: secretHelperFactory,
  nonce: Chain.SECRET,
  currency: SupportedCurrency.SCRT,
  decimals: 1e6,
});
CHAIN_INFO.set(Chain.SOLANA, {
  name: "Solana",
  blockExplorerUrl: "", // TODO
  constructor: solanaHelper,
  nonce: Chain.SOLANA,
  currency: SupportedCurrency.SOL,
  decimals: 1e9,
});
CHAIN_INFO.set(Chain.TON, {
  name: "TON",
  blockExplorerUrl: "", // TODO
  constructor: tonHelper,
  nonce: Chain.TON,
  currency: SupportedCurrency.TON,
  decimals: 1e9,
});
CHAIN_INFO.set(Chain.DFINITY, {
  name: "DFINITY",
  blockExplorerUrl: "", // TODO
  constructor: dfinityHelper,
  nonce: Chain.DFINITY,
  currency: SupportedCurrency.ICP,
  decimals: 1e8,
});
CHAIN_INFO.set(Chain.HEDERA, {
  blockExplorerUrl: "https://hashscan.io/#/testnet/transaction",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.HBAR,
  decimals: 1e6,
  nonce: Chain.HEDERA,
  name: "Hedera",
});

CHAIN_INFO.set(Chain.SKALE, {
  name: "Skale",
  blockExplorerUrl:
    "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/tx/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.SKL,
  decimals: 1e18,
  chainId: 1564830818,
  nonce: Chain.SKALE,
});

CHAIN_INFO.set(Chain.DFINITY, {
  blockExplorerUrl: "", // TODO
  constructor: dfinityHelper,
  currency: SupportedCurrency.ICP,
  decimals: 1e8,
  name: "DFINITY",
  nonce: Chain.DFINITY,
});

CHAIN_INFO.set(Chain.NEAR, {
  blockExplorerUrl: "https://explorer.testnet.near.org/transactions/",
  constructor: nearHelperFactory,
  currency: SupportedCurrency.NEAR,
  decimals: 1e8,
  name: "NEAR",
  nonce: Chain.NEAR,
});

CHAIN_INFO.set(Chain.MOONBEAM, {
  blockExplorerUrl: "https://moonbase.moonscan.io/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.GLMR,
  decimals: 1e18,
  name: "MoonBeam",
  nonce: Chain.MOONBEAM,
  chainId: 0x507,
});

CHAIN_INFO.set(Chain.ABEYCHAIN, {
  blockExplorerUrl: "https://testnet-explorer.abeychain.com/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ABEY,
  decimals: 1e18,
  name: "AbeyChain",
  nonce: Chain.ABEYCHAIN,
  chainId: 178,
});
