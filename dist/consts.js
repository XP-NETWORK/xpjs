"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.ChainType = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/evm/web3");
const browserAdapted_1 = require("./helpers/hedera/browserAdapted");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
const Decimals_1 = require("crypto-exchange-rate/dist/model/domain/Decimals");
const algorand_1 = require("./helpers/algorand");
const tezos_1 = require("./helpers/tezos");
const secret_1 = require("./helpers/secret");
const solana_1 = require("./helpers/solana");
const ton_1 = require("./helpers/ton/ton");
const dfinity_1 = require("./helpers/dfinity/dfinity");
const near_1 = require("./helpers/near");
const aptos_1 = require("./helpers/aptos");
const web3_erc20_1 = require("./helpers/evm/web3_erc20");
const casper_1 = require("./helpers/casper");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-gateway.multiversx.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
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
    TestNetRpcUri["SECRET"] = "https://api.pulsar.scrttestnet.com";
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
    TestNetRpcUri["CASPER"] = "https://rpc.testnet.casperlabs.io/rpc";
    TestNetRpcUri["OPTIMISM"] = "https://goerli.optimism.io";
    // TODO: Algorand
    // TODO: Fuse
})(TestNetRpcUri = exports.TestNetRpcUri || (exports.TestNetRpcUri = {}));
var MainNetRpcUri;
(function (MainNetRpcUri) {
    MainNetRpcUri["ELROND"] = "https://gateway.multiversx.com";
    MainNetRpcUri["HECO"] = "https://http-mainnet-node.huobichain.com";
    MainNetRpcUri["BSC"] = "https://bsc-dataseed.binance.org/";
    MainNetRpcUri["ETHEREUM"] = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    MainNetRpcUri["AVALANCHE"] = "https://api.avax.network/ext/bc/C/rpc";
    MainNetRpcUri["POLYGON"] = "https://polygon-rpc.com";
    MainNetRpcUri["FANTOM"] = "https://rpc.fantom.network/";
    MainNetRpcUri["TRON"] = "https://api.trongrid.io/";
    MainNetRpcUri["CELO"] = "https://forno.celo.org";
    MainNetRpcUri["HARMONY"] = "https://rpc.s0.t.hmny.io";
    MainNetRpcUri["XDAI"] = "https://rpc.gnosischain.com";
    MainNetRpcUri["FUSE"] = "https://rpc.fuse.io/";
    MainNetRpcUri["VELAS"] = "https://mainnet.velas.com/rpc";
    MainNetRpcUri["TEZOS"] = "https://mainnet.smartpy.io";
    MainNetRpcUri["IOTEX"] = "https://babel-api.mainnet.iotex.io";
    MainNetRpcUri["AURORA"] = "https://mainnet.aurora.dev";
    MainNetRpcUri["GODWOKEN"] = "https://v1.mainnet.godwoken.io/rpc";
    MainNetRpcUri["GATECHAIN"] = "https://evm.gatenode.cc";
    MainNetRpcUri["VECHAIN"] = "https://sync-mainnet.veblocks.net";
    MainNetRpcUri["SECRET"] = "https://secret-4.api.trivium.network:9091/";
    MainNetRpcUri["SKALE"] = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague";
    MainNetRpcUri["HEDERA"] = "https://mainnet.hashio.io/api";
    MainNetRpcUri["NEAR"] = "https://rpc.mainnet.near.org";
    MainNetRpcUri["MOONBEAM"] = "https://rpc.api.moonbeam.network";
    MainNetRpcUri["ABEYCHAIN"] = "https://rpc.abeychain.com";
    MainNetRpcUri["TON"] = "https://toncenter.com/api/v2/jsonRPC";
    MainNetRpcUri["APTOS"] = "https://fullnode.mainnet.aptoslabs.com/";
    MainNetRpcUri["CADUCEUS"] = "https://mainnet.block.caduceus.foundation/";
    MainNetRpcUri["OKC"] = "https://exchainrpc.okex.org/";
    MainNetRpcUri["ARBITRUM"] = "https://nova.arbitrum.io/rpc";
    MainNetRpcUri["BITGERT"] = "https://dedicated.brisescan.com";
    MainNetRpcUri["SOLANA"] = "https://solana-mainnet.g.alchemy.com/v2/4Fm2r6LjJO91nXrKVcZBQXcWgtVe-_gx";
    MainNetRpcUri["OPTIMISM"] = "https://goerli.optimism.io";
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
    Chain.BITGERT = 0x26; //38
    Chain.CASPER = 0x27; //39
    Chain.OPTIMISM = 0x28; //40
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
    ChainType["CASPER"] = "CASPER";
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
    currencySymbol: domain_1.SupportedCurrencyName.EGLD,
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
    currencySymbol: domain_1.SupportedCurrencyName.HT,
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
    currencySymbol: domain_1.SupportedCurrencyName.BNB,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ETHEREUM, {
    name: "Ethereum",
    nonce: 5,
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.ETH,
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
    currencySymbol: domain_1.SupportedCurrencyName.AVAX,
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
    currencySymbol: domain_1.SupportedCurrencyName.MATIC,
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
    currencySymbol: domain_1.SupportedCurrencyName.FTM,
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
    currencySymbol: domain_1.SupportedCurrencyName.TRX,
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
    currencySymbol: domain_1.SupportedCurrencyName.CELO,
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
    currencySymbol: domain_1.SupportedCurrencyName.ONE,
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
    currencySymbol: domain_1.SupportedCurrencyName.ONT,
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
    currencySymbol: domain_1.SupportedCurrencyName.XDAI,
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
    currencySymbol: domain_1.SupportedCurrencyName.ALGO,
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
    currencySymbol: domain_1.SupportedCurrencyName.FUSE,
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
    currencySymbol: domain_1.SupportedCurrencyName.OPL,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.TEZOS, {
    name: "Tezos",
    nonce: 0x12,
    decimals: Decimals_1.DecimalsByCurrency.XTZ,
    constructor: tezos_1.tezosHelperFactory,
    currency: domain_1.SupportedCurrency.XTZ,
    currencySymbol: domain_1.SupportedCurrencyName.XTZ,
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
    currencySymbol: domain_1.SupportedCurrencyName.VLX,
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
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.AURORA,
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
    currencySymbol: domain_1.SupportedCurrencyName.IOTX,
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
    currencySymbol: domain_1.SupportedCurrencyName.CKB,
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
    currencySymbol: domain_1.SupportedCurrencyName.GT,
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
    currencySymbol: domain_1.SupportedCurrencyName.VET,
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
    currencySymbol: domain_1.SupportedCurrencyName.SCRT,
    decimals: Decimals_1.DecimalsByCurrency.SCRT,
    type: ChainType.COSMOS,
    blockExplorerUrl: "https://secretnodes.com/secret/transactions/",
    blockExplorerUrlAddr: "https://secretnodes.com/secret/accounts/",
    tnBlockExplorerUrl: "https://secretnodes.com/pulsar/transactions/",
    tnBlockExplorerUrlAddr: "https://secretnodes.com/pulsar/accounts/",
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
    currencySymbol: domain_1.SupportedCurrencyName.SOL,
    decimals: Decimals_1.DecimalsByCurrency.SOL,
    type: ChainType.SOLANA,
});
exports.CHAIN_INFO.set(Chain.HEDERA, {
    blockExplorerUrl: "https://hashscan.io/mainnet/transactionsById/",
    tnBlockExplorerUrl: "https://hashscan.io/testnet/transactionsById/",
    //@ts-ignore
    constructor: typeof window !== "undefined" ? browserAdapted_1.web3HelperFactory : web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HBAR,
    currencySymbol: domain_1.SupportedCurrencyName.HBAR,
    decimals: Decimals_1.DecimalsByCurrency.HBAR,
    nonce: Chain.HEDERA,
    name: "Hedera",
    type: ChainType.HEDERA,
    blockExplorerUrlAddr: "https://hashscan.io/mainnet/account/",
    tnBlockExplorerUrlAddr: "https://hashscan.io/testnet/account/",
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
    currencySymbol: domain_1.SupportedCurrencyName.ETH,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    tnChainId: 0x1482a7b2,
    nonce: Chain.SKALE,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    constructor: dfinity_1.dfinityHelper,
    currency: domain_1.SupportedCurrency.ICP,
    currencySymbol: domain_1.SupportedCurrencyName.ICP,
    decimals: Decimals_1.DecimalsByCurrency.ICP,
    name: "DFINITY",
    nonce: Chain.DFINITY,
    type: ChainType.DFINITY,
    blockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
    blockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
    tnBlockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
    tnBlockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
});
exports.CHAIN_INFO.set(Chain.NEAR, {
    blockExplorerUrl: "https://explorer.mainnet.near.org/transactions/",
    tnBlockExplorerUrl: "https://explorer.testnet.near.org/transactions/",
    constructor: near_1.nearHelperFactory,
    currency: domain_1.SupportedCurrency.NEAR,
    currencySymbol: domain_1.SupportedCurrencyName.NEAR,
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
    currencySymbol: domain_1.SupportedCurrencyName.GLMR,
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
    currencySymbol: domain_1.SupportedCurrencyName.ABEY,
    decimals: Decimals_1.DecimalsByCurrency.ABEY,
    name: "ABEY",
    nonce: Chain.ABEYCHAIN,
    chainId: 178,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.APTOS, {
    constructor: aptos_1.aptosHelper,
    currency: domain_1.SupportedCurrency.APTOS,
    currencySymbol: domain_1.SupportedCurrencyName.APTOS,
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
    currencySymbol: domain_1.SupportedCurrencyName.TON,
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
    currencySymbol: domain_1.SupportedCurrencyName.CMP,
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
    currencySymbol: domain_1.SupportedCurrencyName.OKT,
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
    blockExplorerUrl: "https://nova.arbiscan.io/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.ETH,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Arbitrum",
    nonce: Chain.ARBITRUM,
    type: ChainType.EVM,
    chainId: 42170,
    blockExplorerUrlAddr: "https://nova.arbiscan.io/address/",
    tnBlockExplorerUrl: "https://goerli-rollup-explorer.arbitrum.io/tx/",
    tnBlockExplorerUrlAddr: "https://goerli-rollup-explorer.arbitrum.io/address/",
    tnChainId: 421613,
});
exports.CHAIN_INFO.set(Chain.BITGERT, {
    blockExplorerUrl: "https://brisescan.com/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.BRISE,
    currencySymbol: domain_1.SupportedCurrencyName.BRISE,
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
exports.CHAIN_INFO.set(Chain.CASPER, {
    blockExplorerUrl: "https://testnet.cspr.live/address/",
    constructor: casper_1.casperHelper,
    currency: domain_1.SupportedCurrency.CSPR,
    currencySymbol: domain_1.SupportedCurrencyName.CSPR,
    decimals: Decimals_1.DecimalsByCurrency.SOL,
    name: "Casper",
    nonce: Chain.CASPER,
    type: ChainType.CASPER,
});
exports.CHAIN_INFO.set(Chain.OPTIMISM, {
    //blockExplorerUrl: "https://optimistic.etherscan.io/tx/",
    //blockExplorerUrlAddr: "https://optimistic.etherscan.io/address/",
    blockExplorerUrl: "https://goerli-optimism.etherscan.io/tx/",
    blockExplorerUrlAddr: "https://goerli-optimism.etherscan.io/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OPTM,
    currencySymbol: domain_1.SupportedCurrencyName.OPTM,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Optimism",
    nonce: Chain.OPTIMISM,
    type: ChainType.EVM,
    //chainId: 10,
    chainId: 420,
    tnBlockExplorerUrl: "https://goerli-optimism.etherscan.io/tx/",
    tnBlockExplorerUrlAddr: "https://goerli-optimism.etherscan.io/address/",
    tnChainId: 420,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLDZDQUErRTtBQUMvRSxvRUFBMkY7QUFFM0YsbUVBR2dEO0FBQ2hELDhFQUFpRztBQUNqRyxpREFJNEI7QUFDNUIsMkNBQStFO0FBRS9FLDZDQUkwQjtBQUMxQiw2Q0FBNEU7QUFDNUUsMkNBQW9FO0FBQ3BFLHVEQUltQztBQUNuQyx5Q0FBMkU7QUFDM0UsMkNBQXdFO0FBQ3hFLHlEQUdrQztBQUNsQyw2Q0FBNEU7QUFFNUUsNENBQTRDO0FBQzVDLElBQVksYUFxQ1g7QUFyQ0QsV0FBWSxhQUFhO0lBQ3ZCLGlFQUFnRCxDQUFBO0lBQ2hELDREQUEyQyxDQUFBO0lBQzNDLHVFQUFzRCxDQUFBO0lBQ3RELHlGQUF3RSxDQUFBO0lBQ3hFLHlFQUF3RCxDQUFBO0lBQ3hELG9FQUFtRCxDQUFBO0lBQ25ELHFFQUFvRCxDQUFBO0lBQ3BELHlEQUF3QyxDQUFBO0lBQ3hDLGtFQUFpRCxDQUFBO0lBQ2pELHFEQUFvQyxDQUFBO0lBQ3BDLG1EQUFrQyxDQUFBO0lBQ2xDLDREQUEyQyxDQUFBO0lBQzNDLHNEQUFxQyxDQUFBO0lBQ3JDLGlFQUFnRCxDQUFBO0lBQ2hELDZEQUE0QyxDQUFBO0lBQzVDLHVEQUFzQyxDQUFBO0lBQ3RDLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDJGQUEwRSxDQUFBO0lBQzFFLHlEQUF3QyxDQUFBO0lBQ3hDLHNEQUFxQyxDQUFBO0lBQ3JDLHVFQUFzRCxDQUFBO0lBQ3RELDREQUEyQyxDQUFBO0lBQzNDLGlFQUFnRCxDQUFBO0lBQ2hELHFFQUFvRCxDQUFBO0lBQ3BELHlEQUF3QyxDQUFBO0lBQ3hDLHNFQUFxRCxDQUFBO0lBQ3JELHdEQUF1QyxDQUFBO0lB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