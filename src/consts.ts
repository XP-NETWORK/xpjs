import {
  elrondHelperFactory,
  ElrondParams,
  ElrondHelper,
} from "./helpers/elrond";
import { tronHelperFactory, TronParams, TronHelper } from "./helpers/tron";
import { web3HelperFactory, Web3Params, Web3Helper } from "./helpers/evm/web3";
import { HederaHelperFactory } from "./helpers/hedera/hedera_refactor";
import {
  SupportedCurrency,
  SupportedCurrencyName,
} from "crypto-exchange-rate/dist/model/domain";
import { DecimalsByCurrency as Decimals } from "crypto-exchange-rate/dist/model/domain/Decimals";
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
import { tonHelper, TonHelper, TonParams } from "./helpers/ton/ton";
import {
  dfinityHelper,
  DfinityHelper,
  DfinityParams,
} from "./helpers/dfinity/dfinity";
import { NearHelper, NearParams, nearHelperFactory } from "./helpers/near";
import { aptosHelper, AptosHelper, AptosParams } from "./helpers/aptos";
import {
  web3ERC20HelperFactory,
  Web3ERC20Params,
} from "./helpers/evm/web3_erc20";
import {
  CasperHelper,
  CasperParams,
  casperHelper,
} from "./helpers/casper/casper";

// All the supported testnet uri's are here.
export enum TestNetRpcUri {
  ELROND = "https://devnet-gateway.multiversx.com",
  HECO = "https://http-testnet.hecochain.com",
  BSC = "https://data-seed-prebsc-1-s1.binance.org:8545",
  ROPSTEN = "https://goerli.infura.io/v3/cec5dc92097a46f0b895ac1e89865467",
  AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
  POLYGON = "https://polygon-mumbai.blockpi.network/v1/rpc/public",
  FANTOM = "https://rpc.testnet.fantom.network/",
  TRON = "https://api.shasta.trongrid.io/",
  CELO = "https://alfajores-forno.celo-testnet.org",
  HARMONY = "https://api.s0.b.hmny.io",
  XDAI = "https://rpc.chiadochain.net",
  UNIQUE = "https://rpc-opal.unique.network/",
  TEZOS = "https://ghostnet.smartpy.io",
  VELAS = "https://evmexplorer.testnet.velas.com/rpc",
  IOTEX = "https://babel-api.testnet.iotex.io",
  AURORA = "https://testnet.aurora.dev/",
  GODWOKEN = "https://godwoken-testnet-v1.ckbapp.dev",
  GATECHAIN = "https://meteora-evm.gatenode.cc",
  VECHAIN = "https://sync-testnet.veblocks.net",
  SECRET = "https://api.pulsar.scrttestnet.com",
  SKALE = "https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar",
  HEDERA = "https://0.testnet.hedera.com/",
  HEDERA_RELAY = "https://pool.arkhia.io/hedera/testnet/json-rpc/v1/4aX6a8J73ca92NXecaddCa4C295x62ap/", //"https://testnet.hashio.io/api", //"https://pool.arkhia.io/hedera/testnet/json-rpc/v1/4aX6a8J73ca92NXecaddCa4C295x62ap/",
  NEAR = "https://rpc.testnet.near.org",
  MOONBEAM = "https://rpc.api.moonbase.moonbeam.network",
  ABEYCHAIN = "https://testrpc.abeychain.com",
  APTOS = "https://fullnode.testnet.aptoslabs.com",
  TON = "https://testnet.toncenter.com/api/v2/jsonRPC",
  SOLANA = "https://api.devnet.solana.com",
  CADUCEUS = "https://galaxy.block.caduceus.foundation",
  OKC = "https://exchaintestrpc.okex.org",
  ARBITRUM = "https://goerli-rollup.arbitrum.io/rpc",
  BITGERT = "https://testnet-rpc.brisescan.com",
  CASPER = "https://rpc.testnet.casperlabs.io/rpc",
  OPTIMISM = "https://goerli.optimism.io",
  ZETA = "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
  ENERGI = "https://nodeapi.test.energi.network",
  BASE = "https://base-goerli.diamondswap.org/rpc",
  FINDORA = "https://prod-testnet.prod.findora.org:8545",
  // TODO: Algorand
  // TODO: Fuse
}

export enum MainNetRpcUri {
  ELROND = "https://gateway.multiversx.com",
  HECO = "https://http-mainnet-node.huobichain.com",
  BSC = "https://bsc-dataseed.binance.org/",
  ETHEREUM = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  AVALANCHE = "https://api.avax.network/ext/bc/C/rpc",
  POLYGON = "https://polygon-rpc.com",
  FANTOM = "https://rpc.fantom.network/",
  TRON = "https://api.trongrid.io/",
  CELO = "https://forno.celo.org",
  HARMONY = "https://rpc.s0.t.hmny.io",
  XDAI = "https://rpc.gnosischain.com",
  FUSE = "https://rpc.fuse.io/",
  VELAS = "https://mainnet.velas.com/rpc",
  TEZOS = "https://mainnet.smartpy.io",
  IOTEX = "https://babel-api.mainnet.iotex.io",
  AURORA = "https://mainnet.aurora.dev",
  GODWOKEN = "https://v1.mainnet.godwoken.io/rpc",
  GATECHAIN = "https://evm.gatenode.cc",
  VECHAIN = "https://sync-mainnet.veblocks.net",
  SECRET = "https://secret-4.api.trivium.network:9091/",
  SKALE = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague",
  HEDERA = "https://mainnet.hashio.io/api",
  HEDERA_RELAY = "https://tools.xp.network/hedera-relay",
  NEAR = "https://rpc.mainnet.near.org",
  MOONBEAM = "https://rpc.api.moonbeam.network",
  ABEYCHAIN = "https://rpc.abeychain.com",
  TON = "https://toncenter.com/api/v2/jsonRPC",
  APTOS = "https://fullnode.mainnet.aptoslabs.com/",
  CADUCEUS = "https://mainnet.block.caduceus.foundation/",
  OKC = "https://exchainrpc.okex.org/",
  ARBITRUM = "https://nova.arbitrum.io/rpc",
  BITGERT = "https://dedicated.brisescan.com",
  SOLANA = "https://solana-mainnet.g.alchemy.com/v2/4Fm2r6LjJO91nXrKVcZBQXcWgtVe-_gx",
  OPTIMISM = "https://mainnet.optimism.io",
  CASPER = "https://rpc.mainnet.casperlabs.io/rpc",
  ZETA = "",
  ENERGI = "",
  BASE = "",
  FINDORA = "",
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
type Web3ERC20Meta = [Web3Helper, Web3ERC20Params];
type AptosMeta = [AptosHelper, AptosParams];
type CasperMeta = [CasperHelper, CasperParams];

// Static Assert to Ensure all values of Chain are in MetaMap
type MetaMapAssert = { [idx in (typeof Chain)[keyof typeof Chain]]: unknown };

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
  0x1e: Web3ERC20Meta;
  0x1f: NearMeta;
  0x20: Web3Meta;
  0x21: Web3Meta;
  0x22: AptosMeta;
  0x23: Web3Meta;
  0x24: Web3Meta;
  0x25: Web3Meta;
  0x26: Web3Meta;
  0x27: CasperMeta;
  0x28: Web3Meta;
  0x29: Web3Meta;
  0x2a: Web3Meta;
  0x2b: Web3Meta;
  0x2c: Web3Meta;
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
  export const APTOS = 0x22; // 34
  export const CADUCEUS = 0x23; // 35
  export const OKC = 0x24; // 36
  export const ARBITRUM = 0x25; //37
  export const BITGERT = 0x26; //38
  export const CASPER = 0x27; //39
  export const OPTIMISM = 0x28; //40
  export const ZETA = 0x29; //41
  export const ENERGI = 0x2a; //42
  export const BASE = 0x2b; //43
  export const FINDORA = 0x2c; //44
}

export enum v3_ChainId {
  BSC = "BSC",
  POLYGON = "MATIC",
  DEFAULT = "",
}

interface ChainData<T extends ChainNonce> {
  name: string;
  nonce: number;
  decimals: number;
  constructor: (p: InferChainParam<T>) => Promise<InferChainH<T>>;
  blockExplorerUrl: string;
  tnBlockExplorerUrl?: string | ((tx: string) => string);
  chainId?: number;
  tnChainId?: number;
  currency: SupportedCurrency;
  currencySymbol: SupportedCurrencyName;
  type: string;
  v3_chainId: `${v3_ChainId}`;
  blockExplorerUrlAddr?: string;
  blockExplorerUrlCollection?: string;
  tnBlockExplorerUrlCollection?: string;
  tnBlockExplorerUrlAddr?: string | ((tx: string) => string);
  rejectUnfreeze?: string[];
}

type ChainInfo = {
  set<T extends ChainNonce>(k: T, v: ChainData<T> | undefined): void;
  get<T extends ChainNonce>(k: T): ChainData<T> | undefined;
} & Map<ChainNonce, ChainData<ChainNonce>>;

export enum ChainType {
  EVM = "EVM",
  ELROND = "ELROND",
  TRON = "TRON",
  TEZOS = "TEZOS",
  ALGORAND = "ALGORAND",
  COSMOS = "COSMOS",
  DFINITY = "DFINITY",
  SOLANA = "SOLANA",
  TON = "TON",
  NEAR = "NEAR",
  HEDERA = "HEDERA",
  APTOS = "APTOS",
  CASPER = "CASPER",
}

export const CHAIN_INFO: ChainInfo = new Map();
CHAIN_INFO.set(Chain.ELROND, {
  name: "Elrond",
  nonce: 2,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.EGLD,
  constructor: elrondHelperFactory,
  blockExplorerUrl: "https://explorer.elrond.com/transactions/",
  blockExplorerUrlAddr: "https://explorer.elrond.com/address/",
  tnBlockExplorerUrl: "https://testnet-explorer.elrond.com/transactions/",
  tnBlockExplorerUrlAddr: "https://testnet-explorer.elrond.com/address/",
  currency: SupportedCurrency.EGLD,
  currencySymbol: SupportedCurrencyName.EGLD,
  type: ChainType.ELROND,
});
CHAIN_INFO.set(Chain.HECO, {
  name: "HECO",
  nonce: 3,
  v3_chainId: v3_ChainId.DEFAULT,
  chainId: 256,
  decimals: Decimals.HT,
  blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.HT,
  currencySymbol: SupportedCurrencyName.HT,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.BSC, {
  name: "BSC",
  nonce: 4,
  v3_chainId: v3_ChainId.BSC,
  chainId: 97,
  decimals: Decimals.BNB,
  blockExplorerUrl: "https://bscscan.com/tx/",
  blockExplorerUrlAddr: "https://bscscan.com/address/",
  tnBlockExplorerUrl: "https://testnet.bscscan.com/tx/",
  tnBlockExplorerUrlAddr: "https://testnet.bscscan.com/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.BNB,
  currencySymbol: SupportedCurrencyName.BNB,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.ETHEREUM, {
  name: "Ethereum",
  nonce: 5,
  v3_chainId: v3_ChainId.DEFAULT,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.ETH,
  chainId: 5,
  decimals: Decimals.ETH,
  blockExplorerUrl: "https://etherscan.io/tx/",
  blockExplorerUrlAddr: "https://etherscan.io/address/",
  tnBlockExplorerUrl: "https://goerli.etherscan.io/tx/",
  tnBlockExplorerUrlAddr: "https://goerli.etherscan.io/address/",
  constructor: web3HelperFactory,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.AVALANCHE, {
  name: "Avalanche",
  nonce: 6,
  v3_chainId: v3_ChainId.DEFAULT,
  chainId: 43113,
  decimals: Decimals.AVAX,
  blockExplorerUrl: "https://snowtrace.io/tx/",
  tnBlockExplorerUrl: "https://testnet.snowtrace.io/tx/",
  blockExplorerUrlAddr: "https://snowtrace.io/address/",
  tnBlockExplorerUrlAddr: "https://testnet.snowtrace.io/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.AVAX,
  currencySymbol: SupportedCurrencyName.AVAX,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.POLYGON, {
  name: "Polygon",
  nonce: 0x7,
  v3_chainId: v3_ChainId.POLYGON,
  chainId: 80001,
  decimals: Decimals.MATIC,
  blockExplorerUrl: "https://polygonscan.com/tx/",
  tnBlockExplorerUrl: "https://mumbai.polygonscan.com/tx/",
  blockExplorerUrlAddr: "https://polygonscan.com/address/",
  tnBlockExplorerUrlAddr: "https://mumbai.polygonscan.com/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.MATIC,
  currencySymbol: SupportedCurrencyName.MATIC,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.FANTOM, {
  name: "Fantom",
  nonce: 0x8,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.FTM,
  chainId: 4002,
  blockExplorerUrl: "https://ftmscan.com/tx/",
  blockExplorerUrlAddr: "https://ftmscan.com/address/",
  tnBlockExplorerUrlAddr: "https://testnet.ftmscan.com/address/",
  tnBlockExplorerUrl: "https://testnet.ftmscan.com/tx/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.FTM,
  currencySymbol: SupportedCurrencyName.FTM,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.TRON, {
  name: "Tron",
  nonce: 0x9,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.TRX,
  blockExplorerUrl: "https://shasta.tronscan.org/#/transaction/",
  tnBlockExplorerUrl: "https://shasta.tronscan.org/#/transaction/",
  blockExplorerUrlAddr: "https://tronscan.io/#/address/",
  tnBlockExplorerUrlAddr: "https://shasta.tronscan.org/#/address/",
  constructor: tronHelperFactory,
  currency: SupportedCurrency.TRX,
  currencySymbol: SupportedCurrencyName.TRX,
  type: ChainType.TRON,
});
CHAIN_INFO.set(Chain.CELO, {
  name: "Celo",
  nonce: 0xb,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.CELO,
  chainId: 44787,
  blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.CELO,
  currencySymbol: SupportedCurrencyName.CELO,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.HARMONY, {
  name: "Harmony",
  nonce: 0xc,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.ONE,
  chainId: 1666700000,
  blockExplorerUrl: "https://explorer.harmony.one/tx/",
  tnBlockExplorerUrl: "https://explorer.testnet.harmony.one/tx/",
  blockExplorerUrlAddr: "https://explorer.harmony.one/address/",
  tnBlockExplorerUrlAddr: "https://explorer.testnet.harmony.one/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ONE,
  currencySymbol: SupportedCurrencyName.ONE,
  type: ChainType.EVM,
  rejectUnfreeze: [
    "0xb90Dc9e354001e6260DE670EDD6aBaDb890C6aC9",
    "0xAd6f94bDefB6D5ae941392Da5224ED083AE33adc",
  ],
});
CHAIN_INFO.set(Chain.ONT, {
  name: "Ontology",
  nonce: 0xd,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.ONT,
  chainId: 1666700000,
  blockExplorerUrl: "https://explorer.pops.one/tx",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ONT,
  currencySymbol: SupportedCurrencyName.ONT,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.XDAI, {
  name: "xDai",
  nonce: 0xe,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.XDAI,
  chainId: 0x64,
  blockExplorerUrl: "https://blockscout.com/xdai/mainnet/tx/",
  blockExplorerUrlAddr: "https://blockscout.com/xdai/mainnet/address/",
  tnBlockExplorerUrl: "https://blockscout.com/xdai/testnet/tx/",
  tnBlockExplorerUrlAddr: "https://blockscout.com/xdai/testnet/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.XDAI,
  currencySymbol: SupportedCurrencyName.XDAI,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.ALGORAND, {
  name: "Algorand",
  nonce: 0xf,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.ALGO,
  chainId: undefined,
  blockExplorerUrl: "https://algoexplorer.io/tx/",
  tnBlockExplorerUrl: "https://testnet.algoexplorer.io/tx/",
  blockExplorerUrlAddr: "https://algoexplorer.io/address/",
  tnBlockExplorerUrlAddr: "https://testnet.algoexplorer.io/address/",
  currency: SupportedCurrency.ALGO,
  currencySymbol: SupportedCurrencyName.ALGO,
  constructor: (p) => Promise.resolve(algorandHelper(p)),
  type: ChainType.ALGORAND,
});
CHAIN_INFO.set(Chain.FUSE, {
  name: "FUSE",
  nonce: 0x10,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.FUSE,
  chainId: undefined,
  blockExplorerUrl: "https://explorer.fuse.io/tx/",
  tnBlockExplorerUrl: "https://explorer.fusespark.io/tx/",
  blockExplorerUrlAddr: "https://explorer.fuse.io/address/",
  tnBlockExplorerUrlAddr: "https://explorer.fusespark.io/address/",
  currencySymbol: SupportedCurrencyName.FUSE,
  currency: SupportedCurrency.FUSE,
  constructor: web3HelperFactory,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.UNIQUE, {
  name: "Unique",
  nonce: 0x11,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.OPL,
  chainId: 8888,
  blockExplorerUrl: "CANT FIND",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.OPL,
  currencySymbol: SupportedCurrencyName.OPL,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.TEZOS, {
  name: "Tezos",
  nonce: 0x12,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.XTZ,
  constructor: tezosHelperFactory,
  currency: SupportedCurrency.XTZ,
  currencySymbol: SupportedCurrencyName.XTZ,
  blockExplorerUrl: "https://tzkt.io/",
  tnBlockExplorerUrl: "https://ghostnet.tzkt.io/",
  tnBlockExplorerUrlAddr: "https://ghostnet.tzkt.io/",
  blockExplorerUrlAddr: "https://tzkt.io/",
  type: ChainType.TEZOS,
});
CHAIN_INFO.set(Chain.VELAS, {
  name: "Velas",
  v3_chainId: v3_ChainId.DEFAULT,
  blockExplorerUrl: "https://explorer.velas.com/tx/",
  tnBlockExplorerUrlAddr: "https://explorer.testnet.velas.com/address/",
  blockExplorerUrlAddr: "https://explorer.velas.com/address/",
  tnBlockExplorerUrl: "https://explorer.testnet.velas.com/tx/",
  nonce: 0x13,
  decimals: Decimals.VLX,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.VLX,
  currencySymbol: SupportedCurrencyName.VLX,
  chainId: 111,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.AURORA, {
  name: "Aurora",
  blockExplorerUrl: "https://aurorascan.dev/tx/",
  tnBlockExplorerUrl: "hhttps://testnet.aurorascan.dev/tx/",
  blockExplorerUrlAddr: "https://aurorascan.dev/address/",
  tnBlockExplorerUrlAddr: "https://testnet.aurorascan.dev/address",
  nonce: Chain.AURORA,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.AURORA,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.AURORA,
  chainId: 1313161554,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.IOTEX, {
  name: "IoTeX",
  blockExplorerUrl: "https://iotexscan.io/tx/",
  blockExplorerUrlAddr: "https://iotexscan.io/address/",
  tnBlockExplorerUrl: "https://testnet.iotexscan.io/tx/",
  tnBlockExplorerUrlAddr: "https://testnet.iotexscan.io/address/",
  nonce: 0x14,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.IOTX,
  constructor: web3HelperFactory,
  currency: SupportedCurrency.IOTX,
  currencySymbol: SupportedCurrencyName.IOTX,
  chainId: 4689,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.GODWOKEN, {
  name: "GodWoken",
  blockExplorerUrl: "https://gwscan.com/tx/",
  tnBlockExplorerUrl: "https://v1.testnet.gwscan.com/tx/",
  blockExplorerUrlAddr: "https://gwscan.com/account/",
  tnBlockExplorerUrlAddr: "https://v1.testnet.gwscan.com/account/",
  constructor: web3HelperFactory,
  nonce: 0x16,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.CKB,
  currency: SupportedCurrency.CKB,
  currencySymbol: SupportedCurrencyName.CKB,
  chainId: 868455272153094,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.GATECHAIN, {
  name: "GateChain",
  blockExplorerUrl: "https://gatescan.org/tx/",
  tnBlockExplorerUrl: "https://gatescan.org/testnet/tx/",
  blockExplorerUrlAddr: "https://gatescan.org/address/",
  tnBlockExplorerUrlAddr: "https://gatescan.org/testnet/address/",
  constructor: web3HelperFactory,
  nonce: 0x17,
  v3_chainId: v3_ChainId.DEFAULT,
  decimals: Decimals.GT,
  currency: SupportedCurrency.GT,
  currencySymbol: SupportedCurrencyName.GT,
  chainId: 85,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.VECHAIN, {
  name: "VeChain",
  tnBlockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
  blockExplorerUrlAddr: "https://vechainstats.com/account/",
  blockExplorerUrl: "https://vechainstats.com/transaction/",
  tnBlockExplorerUrlAddr: "https://explore-testnet.vechain.org/accounts/",
  constructor: web3HelperFactory,
  nonce: 0x19,
  v3_chainId: v3_ChainId.DEFAULT,
  currency: SupportedCurrency.VET,
  currencySymbol: SupportedCurrencyName.VET,
  decimals: Decimals.VET,
  chainId: 39,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.SECRET, {
  name: "Secret",
  //blockExplorerUrl: "", // TODO
  constructor: secretHelperFactory,
  nonce: Chain.SECRET,
  v3_chainId: v3_ChainId.DEFAULT,
  currency: SupportedCurrency.SCRT,
  currencySymbol: SupportedCurrencyName.SCRT,
  decimals: Decimals.SCRT,
  type: ChainType.COSMOS,
  blockExplorerUrl: "https://www.mintscan.io/secret/tx/",
  blockExplorerUrlAddr: "https://www.mintscan.io/secret/address/",
  tnBlockExplorerUrl: "https://testnet.ping.pub/secret/tx/",
  tnBlockExplorerUrlAddr: "https://testnet.ping.pub/secret/account/",
});
CHAIN_INFO.set(Chain.SOLANA, {
  name: "Solana",
  blockExplorerUrl: "https://solscan.io/tx/",
  blockExplorerUrlAddr: "https://solscan.io/account/",
  tnBlockExplorerUrl: (tx: string) =>
    `https://solscan.io/tx/${tx}?cluster=devnet`,
  tnBlockExplorerUrlAddr: (address: string) =>
    `https://solscan.io/account/${address}?cluster=devnet`,
  constructor: solanaHelper,
  nonce: Chain.SOLANA,
  v3_chainId: v3_ChainId.DEFAULT,
  currency: SupportedCurrency.SOL,
  currencySymbol: SupportedCurrencyName.SOL,
  decimals: Decimals.SOL,
  type: ChainType.SOLANA,
});

CHAIN_INFO.set(Chain.HEDERA, {
  blockExplorerUrl: "https://hashscan.io/mainnet/transaction/",
  tnBlockExplorerUrl: "https://hashscan.io/testnet/transaction/",
  //@ts-ignore
  constructor: HederaHelperFactory,
  currency: SupportedCurrency.HBAR,
  currencySymbol: SupportedCurrencyName.HBAR,
  decimals: Decimals.ETH,
  nonce: Chain.HEDERA,
  name: "Hedera",
  type: ChainType.HEDERA,
  blockExplorerUrlAddr: "https://hashscan.io/mainnet/account/",
  tnBlockExplorerUrlAddr: "https://hashscan.io/testnet/account/",
  chainId: 295,
  tnChainId: 296,
});

CHAIN_INFO.set(Chain.SKALE, {
  name: "Skale",
  //needs additional query params
  blockExplorerUrl:
    "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/tx/",
  tnBlockExplorerUrl:
    "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/tx/",
  blockExplorerUrlAddr:
    "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/address/",
  tnBlockExplorerUrlAddr:
    "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/address/",
  constructor: web3ERC20HelperFactory,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.ETH,
  decimals: Decimals.ETH,
  tnChainId: 0x1482a7b2,
  nonce: Chain.SKALE,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
});

CHAIN_INFO.set(Chain.DFINITY, {
  constructor: dfinityHelper,
  currency: SupportedCurrency.ICP,
  currencySymbol: SupportedCurrencyName.ICP,
  decimals: Decimals.ICP,
  name: "DFINITY",
  nonce: Chain.DFINITY,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.DFINITY,
  blockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
  blockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
  tnBlockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
  tnBlockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
  tnBlockExplorerUrlCollection:
    "https://dashboard.internetcomputer.org/canister/",
  blockExplorerUrlCollection:
    "https://dashboard.internetcomputer.org/canister/",
});

CHAIN_INFO.set(Chain.NEAR, {
  blockExplorerUrl: "https://explorer.mainnet.near.org/transactions/",
  tnBlockExplorerUrl: "https://explorer.testnet.near.org/transactions/",
  constructor: nearHelperFactory,
  currency: SupportedCurrency.NEAR,
  currencySymbol: SupportedCurrencyName.NEAR,
  decimals: Decimals.NEAR,
  name: "NEAR",
  nonce: Chain.NEAR,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.NEAR,
  blockExplorerUrlAddr: "https://explorer.mainnet.near.org/accounts/",
  tnBlockExplorerUrlAddr: "https://explorer.testnet.near.org/accounts/",
});

CHAIN_INFO.set(Chain.MOONBEAM, {
  constructor: web3HelperFactory,
  currency: SupportedCurrency.GLMR,
  currencySymbol: SupportedCurrencyName.GLMR,
  decimals: Decimals.GLMR,
  name: "MoonBeam",
  nonce: Chain.MOONBEAM,
  v3_chainId: v3_ChainId.DEFAULT,
  chainId: 0x507,
  type: ChainType.EVM,
  blockExplorerUrlAddr: "https://moonbeam.moonscan.io/address/",
  tnBlockExplorerUrlAddr: "https://moonbase.moonscan.io/address/",
  blockExplorerUrl: "https://moonscan.io/tx/",
  tnBlockExplorerUrl: "https://moonbase.moonscan.io/tx/",
});

CHAIN_INFO.set(Chain.ABEYCHAIN, {
  tnBlockExplorerUrl: "https://testnet-explorer.abeychain.com/tx/",
  tnBlockExplorerUrlAddr: "https://testnet-explorer.abeychain.com/address/",
  blockExplorerUrl: "https://scan.abeychain.com/tx/",
  blockExplorerUrlAddr: "https://scan.abeychain.com/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ABEY,
  currencySymbol: SupportedCurrencyName.ABEY,
  decimals: Decimals.ABEY,
  name: "ABEY",
  nonce: Chain.ABEYCHAIN,
  v3_chainId: v3_ChainId.DEFAULT,
  chainId: 178,
  type: ChainType.EVM,
});
CHAIN_INFO.set(Chain.APTOS, {
  constructor: aptosHelper,
  currency: SupportedCurrency.APTOS,
  currencySymbol: SupportedCurrencyName.APTOS,
  decimals: Decimals.APTOS,
  name: "Aptos",
  nonce: Chain.APTOS,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.APTOS,
  //needs additional query params
  blockExplorerUrl: "https://explorer.aptoslabs.com/txn/",
  blockExplorerUrlAddr: "https://explorer.aptoslabs.com/account/",
  tnBlockExplorerUrl: "https://explorer.aptoslabs.com/txn/",
  tnBlockExplorerUrlAddr: "https://explorer.aptoslabs.com/account/",
});
CHAIN_INFO.set(Chain.TON, {
  name: "TON",
  constructor: tonHelper,
  currency: SupportedCurrency.TON,
  currencySymbol: SupportedCurrencyName.TON,
  decimals: Decimals.TON,
  nonce: Chain.TON,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.TON,
  tnBlockExplorerUrl: "https://testnet.tonscan.org/tx/",
  blockExplorerUrl: "https://tonscan.org/tx/",
  blockExplorerUrlAddr: "https://tonscan.org/address/",
  tnBlockExplorerUrlAddr: "https://testnet.tonscan.org/address/",
});
CHAIN_INFO.set(Chain.CADUCEUS, {
  constructor: web3HelperFactory,
  currency: SupportedCurrency.CMP,
  currencySymbol: SupportedCurrencyName.CMP,
  decimals: Decimals.CMP,
  name: "Caduceus",
  nonce: Chain.CADUCEUS,
  v3_chainId: v3_ChainId.DEFAULT,
  blockExplorerUrl: "https://mainnet.scan.caduceus.foundation/tx/",
  tnBlockExplorerUrl: "https://galaxy.scan.caduceus.foundation/tx/",
  blockExplorerUrlAddr: "https://mainnet.scan.caduceus.foundation/address/",
  tnBlockExplorerUrlAddr: "https://galaxy.scan.caduceus.foundation/address/",
  type: ChainType.EVM,
  chainId: 256256,
  tnChainId: 512512,
});
CHAIN_INFO.set(Chain.OKC, {
  blockExplorerUrl: "https://www.oklink.com/okc/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.OKT,
  currencySymbol: SupportedCurrencyName.OKT,
  decimals: Decimals.OKT,
  name: "OKC",
  nonce: Chain.OKC,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 66,
  blockExplorerUrlAddr: "https://www.oklink.com/en/okc/address/",
  tnBlockExplorerUrl: "https://www.oklink.com/okc-test/",
  tnBlockExplorerUrlAddr: "https://www.oklink.com/en/okc-test/address/",
  tnChainId: 65,
});
CHAIN_INFO.set(Chain.ARBITRUM, {
  blockExplorerUrl: "https://nova.arbiscan.io/tx/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.ETH,
  decimals: Decimals.ETH,
  name: "Arbitrum",
  nonce: Chain.ARBITRUM,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 42170,
  blockExplorerUrlAddr: "https://nova.arbiscan.io/address/",
  tnBlockExplorerUrl: "https://goerli-rollup-explorer.arbitrum.io/tx/",
  tnBlockExplorerUrlAddr: "https://goerli-rollup-explorer.arbitrum.io/address/",
  tnChainId: 421613,
});
CHAIN_INFO.set(Chain.BITGERT, {
  blockExplorerUrl: "https://brisescan.com/tx/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.BRISE,
  currencySymbol: SupportedCurrencyName.BRISE,
  decimals: Decimals.ETH,
  name: "Bitgert",
  nonce: Chain.BITGERT,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 3250,
  blockExplorerUrlAddr: "https://brisescan.com/address/",
  tnBlockExplorerUrl: "https://testnet-explorer.brisescan.com/tx/",
  tnBlockExplorerUrlAddr: "https://testnet-explorer.brisescan.com/address/",
  tnChainId: 64668,
});

CHAIN_INFO.set(Chain.CASPER, {
  blockExplorerUrl: "https://cspr.live/deploy/",
  blockExplorerUrlAddr: "https://cspr.live/address/",
  tnBlockExplorerUrl: "https://testnet.cspr.live/deploy/",
  tnBlockExplorerUrlAddr: "https://testnet.cspr.live/address/",
  constructor: casperHelper,
  currency: SupportedCurrency.CSPR,
  currencySymbol: SupportedCurrencyName.CSPR,
  decimals: Decimals.CSPR,
  name: "Casper",
  nonce: Chain.CASPER,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.CASPER,
});

CHAIN_INFO.set(Chain.OPTIMISM, {
  blockExplorerUrl: "https://optimistic.etherscan.io/tx/",
  blockExplorerUrlAddr: "https://optimistic.etherscan.io/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.OPTM,
  currencySymbol: SupportedCurrencyName.OPTM,
  decimals: Decimals.ETH,
  name: "Optimism",
  nonce: Chain.OPTIMISM,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 10,
  tnBlockExplorerUrl: "https://goerli-optimism.etherscan.io/tx/",
  tnBlockExplorerUrlAddr: "https://goerli-optimism.etherscan.io/address/",
  tnChainId: 420,
});

CHAIN_INFO.set(Chain.ZETA, {
  blockExplorerUrl: "https://explorer.zetachain.com/cc/tx/",
  blockExplorerUrlAddr: "https://explorer.zetachain.com/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.ZETA,
  decimals: Decimals.ETH,
  name: "Zeta",
  nonce: Chain.ZETA,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 7000,
  tnChainId: 7001,
  tnBlockExplorerUrl: "https://explorer.zetachain.com/cc/tx/",
  tnBlockExplorerUrlAddr: "https://explorer.zetachain.com/address/",
});

CHAIN_INFO.set(Chain.ENERGI, {
  blockExplorerUrl: "https://explorer.energi.network/tx/",
  blockExplorerUrlAddr: "https://explorer.energi.network/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.NRG,
  currencySymbol: SupportedCurrencyName.NRG,
  decimals: Decimals.ETH,
  name: "Energi",
  nonce: Chain.ENERGI,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 39797,
  tnChainId: 49797,
  tnBlockExplorerUrl: "https://explorer.test.energi.network/tx/",
  tnBlockExplorerUrlAddr: "https://explorer.test.energi.network/address/",
});

CHAIN_INFO.set(Chain.BASE, {
  blockExplorerUrl: "https://explorer.baseledger.net/tx/",
  blockExplorerUrlAddr: "https://explorer.baseledger.net/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.ETH,
  currencySymbol: SupportedCurrencyName.ETH,
  decimals: Decimals.ETH,
  name: "Base Goerli",
  nonce: Chain.BASE,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 8453,
  tnBlockExplorerUrl: "https://goerli.basescan.org/tx/",
  tnBlockExplorerUrlAddr: "https://goerli.basescan.org/address/",
  tnChainId: 84531,
});

CHAIN_INFO.set(Chain.FINDORA, {
  blockExplorerUrl: "https://evm.findorascan.io/tx/",
  blockExplorerUrlAddr: "https://evm.findorascan.io/address/",
  constructor: web3HelperFactory,
  currency: SupportedCurrency.FRA,
  currencySymbol: SupportedCurrencyName.FRA,
  decimals: Decimals.ETH,
  name: "Findora",
  nonce: Chain.FINDORA,
  v3_chainId: v3_ChainId.DEFAULT,
  type: ChainType.EVM,
  chainId: 2152,
  tnBlockExplorerUrl: "https://testnet-anvil.evm.findorascan.io/tx/",
  tnBlockExplorerUrlAddr: "https://testnet-anvil.evm.findorascan.io/address/",
  tnChainId: 2153,
});
