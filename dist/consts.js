"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.ChainType = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
const Decimals_1 = require("crypto-exchange-rate/dist/model/domain/Decimals");
const algorand_1 = require("./helpers/algorand");
const tezos_1 = require("./helpers/tezos");
const secret_1 = require("./helpers/secret");
const solana_1 = require("./helpers/solana");
const ton_1 = require("./helpers/ton");
const dfinity_1 = require("./helpers/dfinity/dfinity");
const near_1 = require("./helpers/near");
const aptos_1 = require("./helpers/aptos");
const web3_erc20_1 = require("./helpers/web3_erc20");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-gateway.elrond.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://data-seed-prebsc-2-s2.binance.org:8545/";
    TestNetRpcUri["ROPSTEN"] = "https://goerli.infura.io/v3/cec5dc92097a46f0b895ac1e89865467";
    TestNetRpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    TestNetRpcUri["POLYGON"] = "https://matic-mumbai.chainstacklabs.com";
    TestNetRpcUri["FANTOM"] = "https://fantom-testnet.public.blastapi.io";
    TestNetRpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    TestNetRpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    TestNetRpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
    TestNetRpcUri["XDAI"] = "https://sokol.poa.network";
    TestNetRpcUri["UNIQUE"] = "https://rpc-opal.unique.network/";
    TestNetRpcUri["TEZOS"] = "https://ghostnet.smartpy.io";
    TestNetRpcUri["VELAS"] = "https://explorer.testnet.velas.com/rpc";
    TestNetRpcUri["IOTEX"] = "https://babel-api.testnet.iotex.io";
    TestNetRpcUri["AURORA"] = "https://testnet.aurora.dev/";
    TestNetRpcUri["GODWOKEN"] = "https://godwoken-testnet-v1.ckbapp.dev";
    TestNetRpcUri["GATECHAIN"] = "https://meteora-evm.gatenode.cc";
    TestNetRpcUri["VECHAIN"] = "https://sync-testnet.veblocks.net";
    TestNetRpcUri["SECRET"] = "https://pulsar-2.api.trivium.network:9091/";
    TestNetRpcUri["SKALE"] = "https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar";
    TestNetRpcUri["HEDERA"] = "https://0.testnet.hedera.com/";
    TestNetRpcUri["NEAR"] = "https://rpc.testnet.near.org";
    TestNetRpcUri["MOONBEAM"] = "https://rpc.api.moonbase.moonbeam.network";
    TestNetRpcUri["ABEYCHAIN"] = "https://testrpc.abeychain.com";
    TestNetRpcUri["APTOS"] = "https://fullnode.testnet.aptoslabs.com";
    TestNetRpcUri["TON"] = "https://testnet.toncenter.com/api/v2/jsonRPC";
    TestNetRpcUri["SOLANA"] = "https://api.devnet.solana.com";
    TestNetRpcUri["CADUCEUS"] = "https://galaxy.block.caduceus.foundation";
    TestNetRpcUri["OKC"] = "https://exchaintestrpc.okex.org";
    TestNetRpcUri["ARBITRUM"] = "https://goerli-rollup.arbitrum.io/rpc";
    TestNetRpcUri["BITGERT"] = "https://testnet-rpc.brisescan.com";
    // TODO: Algorand
    // TODO: Fuse
})(TestNetRpcUri = exports.TestNetRpcUri || (exports.TestNetRpcUri = {}));
var MainNetRpcUri;
(function (MainNetRpcUri) {
    MainNetRpcUri["ELROND"] = "https://gateway.elrond.com";
    MainNetRpcUri["HECO"] = "https://http-mainnet-node.huobichain.com";
    MainNetRpcUri["BSC"] = "https://bsc-dataseed.binance.org/";
    MainNetRpcUri["ETHEREUM"] = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    MainNetRpcUri["AVALANCHE"] = "https://api.avax.network/ext/bc/C/rpc";
    MainNetRpcUri["POLYGON"] = "https://polygon-rpc.com";
    MainNetRpcUri["FANTOM"] = "https://rpc.ftm.tools/";
    MainNetRpcUri["TRON"] = "https://api.trongrid.io/";
    MainNetRpcUri["CELO"] = "https://forno.celo.org";
    MainNetRpcUri["HARMONY"] = "https://rpc.s0.t.hmny.io";
    MainNetRpcUri["XDAI"] = "https://gnosis.xp.network/node";
    MainNetRpcUri["FUSE"] = "https://rpc.fuse.io/";
    MainNetRpcUri["VELAS"] = "https://mainnet.velas.com/rpc";
    MainNetRpcUri["TEZOS"] = "https://mainnet.smartpy.io";
    MainNetRpcUri["IOTEX"] = "https://babel-api.mainnet.iotex.io";
    MainNetRpcUri["AURORA"] = "https://mainnet.aurora.dev";
    MainNetRpcUri["GODWOKEN"] = "https://v1.mainnet.godwoken.io/rpc";
    MainNetRpcUri["GATECHAIN"] = "https://evm.gatenode.cc";
    MainNetRpcUri["VECHAIN"] = "https://sync-mainnet.veblocks.net";
    MainNetRpcUri["SECRET"] = "https://grpc.mainnet.secretsaturn.net";
    MainNetRpcUri["SKALE"] = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague";
    MainNetRpcUri["NEAR"] = "https://rpc.mainnet.near.org";
    MainNetRpcUri["MOONBEAM"] = "https://rpc.api.moonbeam.network";
    MainNetRpcUri["ABEYCHAIN"] = "https://rpc.abeychain.com";
    MainNetRpcUri["TON"] = "https://toncenter.com/api/v2/jsonRPC";
    MainNetRpcUri["APTOS"] = "https://fullnode.mainnet.aptoslabs.com/";
    MainNetRpcUri["CADUCEUS"] = "https://mainnet.block.caduceus.foundation/";
    MainNetRpcUri["OKC"] = "https://exchainrpc.okex.org/";
    MainNetRpcUri["ARBITRUM"] = "string";
    MainNetRpcUri["BITGERT"] = "https://dedicated.brisescan.com";
    // TODO: Algorand
})(MainNetRpcUri = exports.MainNetRpcUri || (exports.MainNetRpcUri = {}));
var Chain;
(function (Chain) {
    Chain.ELROND = 2;
    Chain.HECO = 3;
    Chain.BSC = 4;
    Chain.ETHEREUM = 5;
    Chain.AVALANCHE = 0x6;
    Chain.POLYGON = 7;
    Chain.FANTOM = 8;
    Chain.TRON = 9;
    Chain.CELO = 0xb; //11
    Chain.HARMONY = 0xc; //12
    Chain.ONT = 0xd; //13
    Chain.XDAI = 0xe; //14
    Chain.ALGORAND = 0xf; //15
    Chain.FUSE = 0x10; // 16
    Chain.UNIQUE = 0x11; // 17
    Chain.TEZOS = 0x12; // 18
    Chain.VELAS = 0x13; // 19
    Chain.IOTEX = 0x14; // 20
    Chain.AURORA = 0x15; // 21
    Chain.GODWOKEN = 0x16; // 22
    Chain.GATECHAIN = 0x17; // 23
    Chain.SECRET = 0x18; // 24
    Chain.VECHAIN = 0x19; // 25
    Chain.SOLANA = 0x1a; // 26
    Chain.TON = 0x1b; // 27
    Chain.DFINITY = 0x1c; // 28
    Chain.HEDERA = 0x1d; // 29
    Chain.SKALE = 0x1e; // 30
    Chain.NEAR = 0x1f; // 31
    Chain.MOONBEAM = 0x20; // 32
    Chain.ABEYCHAIN = 0x21; // 33
    Chain.APTOS = 0x22; // 34
    Chain.CADUCEUS = 0x23; // 35
    Chain.OKC = 0x24; // 36
    Chain.ARBITRUM = 0x25; //37
    Chain.BITGERT = 0x26; //37
})(Chain = exports.Chain || (exports.Chain = {}));
var ChainType;
(function (ChainType) {
    ChainType["EVM"] = "EVM";
    ChainType["ELROND"] = "ELROND";
    ChainType["TRON"] = "TRON";
    ChainType["TEZOS"] = "TEZOS";
    ChainType["ALGORAND"] = "ALGORAND";
    ChainType["COSMOS"] = "COSMOS";
    ChainType["DFINITY"] = "DFINITY";
    ChainType["SOLANA"] = "SOLANA";
    ChainType["TON"] = "TON";
    ChainType["NEAR"] = "NEAR";
    ChainType["HEDERA"] = "HEDERA";
    ChainType["APTOS"] = "APTOS";
})(ChainType = exports.ChainType || (exports.ChainType = {}));
exports.CHAIN_INFO = new Map();
exports.CHAIN_INFO.set(Chain.ELROND, {
    name: "Elrond",
    nonce: 2,
    decimals: Decimals_1.DecimalsByCurrency.EGLD,
    constructor: elrond_1.elrondHelperFactory,
    blockExplorerUrl: "https://explorer.elrond.com/transactions/",
    blockExplorerUrlAddr: "https://explorer.elrond.com/address/",
    tnBlockExplorerUrl: "https://testnet-explorer.elrond.com/transactions/",
    tnBlockExplorerUrlAddr: "https://testnet-explorer.elrond.com/address/",
    currency: domain_1.SupportedCurrency.EGLD,
    type: ChainType.ELROND,
});
exports.CHAIN_INFO.set(Chain.HECO, {
    name: "HECO",
    nonce: 3,
    chainId: 256,
    decimals: Decimals_1.DecimalsByCurrency.HT,
    blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HT,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.BSC, {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: Decimals_1.DecimalsByCurrency.BNB,
    blockExplorerUrl: "https://bscscan.com/tx/",
    blockExplorerUrlAddr: "https://bscscan.com/address/",
    tnBlockExplorerUrl: "https://testnet.bscscan.com/tx/",
    tnBlockExplorerUrlAddr: "https://testnet.bscscan.com/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.BNB,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ETHEREUM, {
    name: "Ethereum",
    nonce: 5,
    currency: domain_1.SupportedCurrency.ETH,
    chainId: 5,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    blockExplorerUrl: "https://etherscan.io/tx/",
    blockExplorerUrlAddr: "https://etherscan.io/address/",
    tnBlockExplorerUrl: "https://goerli.etherscan.io/tx/",
    tnBlockExplorerUrlAddr: "https://goerli.etherscan.io/address/",
    constructor: web3_1.web3HelperFactory,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.AVALANCHE, {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: Decimals_1.DecimalsByCurrency.AVAX,
    blockExplorerUrl: "https://snowtrace.io/tx/",
    tnBlockExplorerUrl: "https://testnet.snowtrace.io/tx/",
    blockExplorerUrlAddr: "https://snowtrace.io/address/",
    tnBlockExplorerUrlAddr: "https://testnet.snowtrace.io/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AVAX,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.POLYGON, {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: Decimals_1.DecimalsByCurrency.MATIC,
    blockExplorerUrl: "https://polygonscan.com/tx/",
    tnBlockExplorerUrl: "https://mumbai.polygonscan.com/tx/",
    blockExplorerUrlAddr: "https://polygonscan.com/address/",
    tnBlockExplorerUrlAddr: "https://mumbai.polygonscan.com/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.MATIC,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.FANTOM, {
    name: "Fantom",
    nonce: 0x8,
    decimals: Decimals_1.DecimalsByCurrency.FTM,
    chainId: 4002,
    blockExplorerUrl: "https://ftmscan.com/tx/",
    blockExplorerUrlAddr: "https://ftmscan.com/address/",
    tnBlockExplorerUrlAddr: "https://testnet.ftmscan.com/address/",
    tnBlockExplorerUrl: "https://testnet.ftmscan.com/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.FTM,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.TRON, {
    name: "Tron",
    nonce: 0x9,
    decimals: Decimals_1.DecimalsByCurrency.TRX,
    blockExplorerUrl: "https://shasta.tronscan.org/#/transaction/",
    tnBlockExplorerUrl: "https://shasta.tronscan.org/#/transaction/",
    blockExplorerUrlAddr: "https://tronscan.io/#/address/",
    tnBlockExplorerUrlAddr: "https://shasta.tronscan.org/#/address/",
    constructor: tron_1.tronHelperFactory,
    currency: domain_1.SupportedCurrency.TRX,
    type: ChainType.TRON,
});
exports.CHAIN_INFO.set(Chain.CELO, {
    name: "Celo",
    nonce: 0xb,
    decimals: Decimals_1.DecimalsByCurrency.CELO,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.CELO,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.HARMONY, {
    name: "Harmony",
    nonce: 0xc,
    decimals: Decimals_1.DecimalsByCurrency.ONE,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.harmony.one/tx/",
    tnBlockExplorerUrl: "https://explorer.testnet.harmony.one/tx/",
    blockExplorerUrlAddr: "https://explorer.harmony.one/address/",
    tnBlockExplorerUrlAddr: "https://explorer.testnet.harmony.one/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONE,
    type: ChainType.EVM,
    rejectUnfreeze: [
        "0xb90Dc9e354001e6260DE670EDD6aBaDb890C6aC9",
        "0xAd6f94bDefB6D5ae941392Da5224ED083AE33adc",
    ],
});
exports.CHAIN_INFO.set(Chain.ONT, {
    name: "Ontology",
    nonce: 0xd,
    decimals: Decimals_1.DecimalsByCurrency.ONT,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONT,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.XDAI, {
    name: "xDai",
    nonce: 0xe,
    decimals: Decimals_1.DecimalsByCurrency.XDAI,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/tx/",
    blockExplorerUrlAddr: "https://blockscout.com/xdai/mainnet/address/",
    tnBlockExplorerUrl: "https://blockscout.com/xdai/testnet/tx/",
    tnBlockExplorerUrlAddr: "https://blockscout.com/xdai/testnet/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.XDAI,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ALGORAND, {
    name: "Algorand",
    nonce: 0xf,
    decimals: Decimals_1.DecimalsByCurrency.ALGO,
    chainId: undefined,
    blockExplorerUrl: "https://algoexplorer.io/tx/",
    tnBlockExplorerUrl: "https://testnet.algoexplorer.io/tx/",
    blockExplorerUrlAddr: "https://algoexplorer.io/address/",
    tnBlockExplorerUrlAddr: "https://testnet.algoexplorer.io/address/",
    currency: domain_1.SupportedCurrency.ALGO,
    constructor: (p) => Promise.resolve((0, algorand_1.algorandHelper)(p)),
    type: ChainType.ALGORAND,
});
exports.CHAIN_INFO.set(Chain.FUSE, {
    name: "FUSE",
    nonce: 0x10,
    decimals: Decimals_1.DecimalsByCurrency.FUSE,
    chainId: undefined,
    blockExplorerUrl: "https://explorer.fuse.io/tx/",
    tnBlockExplorerUrl: "https://explorer.fusespark.io/tx/",
    blockExplorerUrlAddr: "https://explorer.fuse.io/address/",
    tnBlockExplorerUrlAddr: "https://explorer.fusespark.io/address/",
    currency: domain_1.SupportedCurrency.FUSE,
    constructor: web3_1.web3HelperFactory,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.UNIQUE, {
    name: "Unique",
    nonce: 0x11,
    decimals: Decimals_1.DecimalsByCurrency.OPL,
    chainId: 8888,
    blockExplorerUrl: "CANT FIND",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OPL,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.TEZOS, {
    name: "Tezos",
    nonce: 0x12,
    decimals: Decimals_1.DecimalsByCurrency.XTZ,
    constructor: tezos_1.tezosHelperFactory,
    currency: domain_1.SupportedCurrency.XTZ,
    blockExplorerUrl: "https://tzkt.io/",
    tnBlockExplorerUrl: "https://ghostnet.tzkt.io/",
    tnBlockExplorerUrlAddr: "https://ghostnet.tzkt.io/",
    blockExplorerUrlAddr: "https://tzkt.io/",
    type: ChainType.TEZOS,
});
exports.CHAIN_INFO.set(Chain.VELAS, {
    name: "Velas",
    blockExplorerUrl: "https://explorer.velas.com/tx/",
    tnBlockExplorerUrlAddr: "https://explorer.testnet.velas.com/address/",
    blockExplorerUrlAddr: "https://explorer.velas.com/address/",
    tnBlockExplorerUrl: "https://explorer.testnet.velas.com/tx/",
    nonce: 0x13,
    decimals: Decimals_1.DecimalsByCurrency.VLX,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.VLX,
    chainId: 111,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.AURORA, {
    name: "Aurora",
    blockExplorerUrl: "https://aurorascan.dev/tx/",
    tnBlockExplorerUrl: "hhttps://testnet.aurorascan.dev/tx/",
    blockExplorerUrlAddr: "https://aurorascan.dev/address/",
    tnBlockExplorerUrlAddr: "https://testnet.aurorascan.dev/address",
    nonce: Chain.AURORA,
    decimals: Decimals_1.DecimalsByCurrency.AURORA,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AURORA,
    chainId: 1313161554,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.IOTEX, {
    name: "IoTeX",
    blockExplorerUrl: "https://iotexscan.io/tx/",
    blockExplorerUrlAddr: "https://iotexscan.io/address/",
    tnBlockExplorerUrl: "https://testnet.iotexscan.io/tx/",
    tnBlockExplorerUrlAddr: "https://testnet.iotexscan.io/address/",
    nonce: 0x14,
    decimals: Decimals_1.DecimalsByCurrency.IOTX,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.IOTX,
    chainId: 4689,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.GODWOKEN, {
    name: "GodWoken",
    blockExplorerUrl: "https://gwscan.com/tx/",
    tnBlockExplorerUrl: "https://v1.testnet.gwscan.com/tx/",
    blockExplorerUrlAddr: "https://gwscan.com/account/",
    tnBlockExplorerUrlAddr: "https://v1.testnet.gwscan.com/account/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x16,
    decimals: Decimals_1.DecimalsByCurrency.CKB,
    currency: domain_1.SupportedCurrency.CKB,
    chainId: 868455272153094,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.GATECHAIN, {
    name: "GateChain",
    blockExplorerUrl: "https://gatescan.org/tx/",
    tnBlockExplorerUrl: "https://gatescan.org/testnet/tx/",
    blockExplorerUrlAddr: "https://gatescan.org/address/",
    tnBlockExplorerUrlAddr: "https://gatescan.org/testnet/address/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x17,
    decimals: Decimals_1.DecimalsByCurrency.GT,
    currency: domain_1.SupportedCurrency.GT,
    chainId: 85,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.VECHAIN, {
    name: "VeChain",
    tnBlockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
    blockExplorerUrlAddr: "https://explore.vechain.org/accounts/",
    blockExplorerUrl: "https://explore.vechain.org/transactions/",
    tnBlockExplorerUrlAddr: "https://explore-testnet.vechain.org/accounts/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x19,
    currency: domain_1.SupportedCurrency.VET,
    decimals: Decimals_1.DecimalsByCurrency.VET,
    chainId: 39,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.SECRET, {
    name: "Secret",
    //blockExplorerUrl: "", // TODO
    constructor: secret_1.secretHelperFactory,
    nonce: Chain.SECRET,
    currency: domain_1.SupportedCurrency.SCRT,
    decimals: Decimals_1.DecimalsByCurrency.SCRT,
    type: ChainType.COSMOS,
    blockExplorerUrl: "https://atomscan.com/secret-network/transactions/",
    blockExplorerUrlAddr: "https://atomscan.com/secret-network/accounts/",
});
exports.CHAIN_INFO.set(Chain.SOLANA, {
    name: "Solana",
    blockExplorerUrl: "https://solscan.io/tx/",
    blockExplorerUrlAddr: "https://solscan.io/account/",
    tnBlockExplorerUrl: (tx) => `https://solscan.io/tx/${tx}?cluster=devnet`,
    tnBlockExplorerUrlAddr: (address) => `https://solscan.io/account/${address}?cluster=devnet`,
    constructor: solana_1.solanaHelper,
    nonce: Chain.SOLANA,
    currency: domain_1.SupportedCurrency.SOL,
    decimals: Decimals_1.DecimalsByCurrency.SOL,
    type: ChainType.SOLANA,
});
/*CHAIN_INFO.set(Chain.TON, {
  name: "TON",
  blockExplorerUrl: "", // TODO
  constructor: tonHelper,
  nonce: Chain.TON,
  currency: SupportedCurrency.TON,
  decimals: 1e9,
  type: ChainType.TON,
});
CHAIN_INFO.set(Chain.DFINITY, {
  name: "DFINITY",
  blockExplorerUrl: "", // TODO
  constructor: dfinityHelper,
  nonce: Chain.DFINITY,
  currency: SupportedCurrency.ICP,
  decimals: 1e8,
  type: ChainType.DFINITY,
});*/
exports.CHAIN_INFO.set(Chain.HEDERA, {
    blockExplorerUrl: "https://hashscan.io/#/mainnet/transaction/",
    tnBlockExplorerUrl: "https://hashscan.io/#/testnet/transaction/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HBAR,
    decimals: Decimals_1.DecimalsByCurrency.HBAR,
    nonce: Chain.HEDERA,
    name: "Hedera",
    type: ChainType.HEDERA,
    blockExplorerUrlAddr: "https://hashscan.io/#/mainnet/account/",
    tnBlockExplorerUrlAddr: "https://hashscan.io/#/testnet/account/",
});
exports.CHAIN_INFO.set(Chain.SKALE, {
    name: "Skale",
    //needs additional query params
    blockExplorerUrl: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/tx/",
    tnBlockExplorerUrl: "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/tx/",
    blockExplorerUrlAddr: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/address/",
    tnBlockExplorerUrlAddr: "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/address/",
    constructor: web3_erc20_1.web3ERC20HelperFactory,
    currency: domain_1.SupportedCurrency.ETH,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    tnChainId: 0x1482a7b2,
    nonce: Chain.SKALE,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    blockExplorerUrl: "",
    constructor: dfinity_1.dfinityHelper,
    currency: domain_1.SupportedCurrency.ICP,
    decimals: Decimals_1.DecimalsByCurrency.ICP,
    name: "DFINITY",
    nonce: Chain.DFINITY,
    type: ChainType.DFINITY,
});
exports.CHAIN_INFO.set(Chain.NEAR, {
    blockExplorerUrl: "https://explorer.mainnet.near.org/transactions/",
    tnBlockExplorerUrl: "https://explorer.testnet.near.org/transactions/",
    constructor: near_1.nearHelperFactory,
    currency: domain_1.SupportedCurrency.NEAR,
    decimals: Decimals_1.DecimalsByCurrency.NEAR,
    name: "NEAR",
    nonce: Chain.NEAR,
    type: ChainType.NEAR,
    blockExplorerUrlAddr: "https://explorer.mainnet.near.org/accounts/",
    tnBlockExplorerUrlAddr: "https://explorer.testnet.near.org/accounts/",
});
exports.CHAIN_INFO.set(Chain.MOONBEAM, {
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.GLMR,
    decimals: Decimals_1.DecimalsByCurrency.GLMR,
    name: "MoonBeam",
    nonce: Chain.MOONBEAM,
    chainId: 0x507,
    type: ChainType.EVM,
    blockExplorerUrlAddr: "https://moonbeam.moonscan.io/address/",
    tnBlockExplorerUrlAddr: "https://moonbase.moonscan.io/address/",
    blockExplorerUrl: "https://moonscan.io/tx/",
    tnBlockExplorerUrl: "https://moonbase.moonscan.io/tx/",
});
exports.CHAIN_INFO.set(Chain.ABEYCHAIN, {
    tnBlockExplorerUrl: "https://testnet-explorer.abeychain.com/tx/",
    tnBlockExplorerUrlAddr: "https://testnet-explorer.abeychain.com/address/",
    blockExplorerUrl: "https://scan.abeychain.com/tx/",
    blockExplorerUrlAddr: "https://scan.abeychain.com/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ABEY,
    decimals: Decimals_1.DecimalsByCurrency.ABEY,
    name: "AbeyChain",
    nonce: Chain.ABEYCHAIN,
    chainId: 178,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.APTOS, {
    constructor: aptos_1.aptosHelper,
    currency: domain_1.SupportedCurrency.APTOS,
    decimals: Decimals_1.DecimalsByCurrency.APTOS,
    name: "Aptos",
    nonce: Chain.APTOS,
    type: ChainType.APTOS,
    //needs additional query params
    blockExplorerUrl: "https://explorer.aptoslabs.com/txn/",
    blockExplorerUrlAddr: "https://explorer.aptoslabs.com/account/",
    tnBlockExplorerUrl: "https://explorer.aptoslabs.com/txn/",
    tnBlockExplorerUrlAddr: "https://explorer.aptoslabs.com/account/",
});
exports.CHAIN_INFO.set(Chain.TON, {
    name: "TON",
    constructor: ton_1.tonHelper,
    currency: domain_1.SupportedCurrency.TON,
    decimals: Decimals_1.DecimalsByCurrency.TON,
    nonce: Chain.TON,
    type: ChainType.TON,
    tnBlockExplorerUrl: "https://testnet.tonscan.org/tx/",
    blockExplorerUrl: "https://tonscan.org/tx/",
    blockExplorerUrlAddr: "https://tonscan.org/address/",
    tnBlockExplorerUrlAddr: "https://testnet.tonscan.org/address/",
});
exports.CHAIN_INFO.set(Chain.CADUCEUS, {
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.CMP,
    decimals: Decimals_1.DecimalsByCurrency.CMP,
    name: "Caduceus",
    nonce: Chain.CADUCEUS,
    blockExplorerUrl: "https://mainnet.scan.caduceus.foundation/tx/",
    tnBlockExplorerUrl: "https://galaxy.scan.caduceus.foundation/tx/",
    blockExplorerUrlAddr: "https://mainnet.scan.caduceus.foundation/address/",
    tnBlockExplorerUrlAddr: "https://galaxy.scan.caduceus.foundation/address/",
    type: ChainType.EVM,
    chainId: 256256,
    tnChainId: 512512,
});
exports.CHAIN_INFO.set(Chain.OKC, {
    blockExplorerUrl: "https://www.oklink.com/okc/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OKT,
    decimals: Decimals_1.DecimalsByCurrency.OKT,
    name: "OKC",
    nonce: Chain.OKC,
    type: ChainType.EVM,
    chainId: 66,
    blockExplorerUrlAddr: "https://www.oklink.com/en/okc/address/",
    tnBlockExplorerUrl: "https://www.oklink.com/okc-test/",
    tnBlockExplorerUrlAddr: "https://www.oklink.com/en/okc-test/address/",
    tnChainId: 65,
});
exports.CHAIN_INFO.set(Chain.ARBITRUM, {
    blockExplorerUrl: "https://explorer.arbitrum.io/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ETH,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Arbitrum",
    nonce: Chain.ARBITRUM,
    type: ChainType.EVM,
    chainId: 42161,
    blockExplorerUrlAddr: "https://explorer.arbitrum.io/address/",
    tnBlockExplorerUrl: "https://goerli-rollup-explorer.arbitrum.io/tx/",
    tnBlockExplorerUrlAddr: "https://goerli-rollup-explorer.arbitrum.io/address/",
    tnChainId: 421613,
});
exports.CHAIN_INFO.set(Chain.BITGERT, {
    blockExplorerUrl: "https://brisescan.com/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.BRISE,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Bitgert",
    nonce: Chain.BITGERT,
    type: ChainType.EVM,
    chainId: 3250,
    blockExplorerUrlAddr: "https://brisescan.com/address/",
    tnBlockExplorerUrl: "https://testnet-explorer.brisescan.com/tx/",
    tnBlockExplorerUrlAddr: "https://testnet-explorer.brisescan.com/address/",
    tnChainId: 64668,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUUzRSxtRUFBMkU7QUFDM0UsOEVBQWlHO0FBQ2pHLGlEQUk0QjtBQUM1QiwyQ0FBK0U7QUFFL0UsNkNBSTBCO0FBQzFCLDZDQUE0RTtBQUM1RSx1Q0FBZ0U7QUFDaEUsdURBSW1DO0FBQ25DLHlDQUEyRTtBQUMzRSwyQ0FBd0U7QUFDeEUscURBQStFO0FBRS9FLDRDQUE0QztBQUM1QyxJQUFZLGFBbUNYO0FBbkNELFdBQVksYUFBYTtJQUN2Qiw2REFBNEMsQ0FBQTtJQUM1Qyw0REFBMkMsQ0FBQTtJQUMzQyx3RUFBdUQsQ0FBQTtJQUN2RCx5RkFBd0UsQ0FBQTtJQUN4RSx5RUFBd0QsQ0FBQTtJQUN4RCxvRUFBbUQsQ0FBQTtJQUNuRCxxRUFBb0QsQ0FBQTtJQUNwRCx5REFBd0MsQ0FBQTtJQUN4QyxrRUFBaUQsQ0FBQTtJQUNqRCxxREFBb0MsQ0FBQTtJQUNwQyxtREFBa0MsQ0FBQTtJQUNsQyw0REFBMkMsQ0FBQTtJQUMzQyxzREFBcUMsQ0FBQTtJQUNyQyxpRUFBZ0QsQ0FBQTtJQUNoRCw2REFBNEMsQ0FBQTtJQUM1Qyx1REFBc0MsQ0FBQTtJQUN0QyxvRUFBbUQsQ0FBQTtJQUNuRCw4REFBNkMsQ0FBQTtJQUM3Qyw4REFBNkMsQ0FBQTtJQUM3QyxzRUFBcUQsQ0FBQTtJQUNyRCwyRkFBMEUsQ0FBQTtJQUMxRSx5REFBd0MsQ0FBQTtJQUN4QyxzREFBcUMsQ0FBQTtJQUNyQyx1RUFBc0QsQ0FBQTtJQUN0RCw0REFBMkMsQ0FBQTtJQUMzQyxpRUFBZ0QsQ0FBQTtJQUNoRCxxRUFBb0QsQ0FBQTtJQUNwRCx5REFBd0MsQ0FBQTtJQUN4QyxzRUFBcUQsQ0FBQTtJQUNyRCx3REFBdUMsQ0FBQTtJQUN2QyxtRUFBa0QsQ0FBQTtJQUNsRCw4REFB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