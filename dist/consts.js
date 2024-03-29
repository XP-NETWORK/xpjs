"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.ChainType = exports.v3_ChainId = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/evm/web3");
const hedera_refactor_1 = require("./helpers/hedera/hedera_refactor");
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
const casper_1 = require("./helpers/casper/casper");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-gateway.multiversx.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
    TestNetRpcUri["ROPSTEN"] = "https://ethereum-sepolia.blockpi.network/v1/rpc/public";
    TestNetRpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    TestNetRpcUri["POLYGON"] = "https://polygon-mumbai.blockpi.network/v1/rpc/public";
    TestNetRpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
    TestNetRpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    TestNetRpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    TestNetRpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
    TestNetRpcUri["XDAI"] = "https://rpc.chiadochain.net";
    TestNetRpcUri["UNIQUE"] = "https://rpc-opal.unique.network/";
    TestNetRpcUri["TEZOS"] = "https://ghostnet.smartpy.io";
    TestNetRpcUri["VELAS"] = "https://evmexplorer.testnet.velas.com/rpc";
    TestNetRpcUri["IOTEX"] = "https://babel-api.testnet.iotex.io";
    TestNetRpcUri["AURORA"] = "https://testnet.aurora.dev/";
    TestNetRpcUri["GODWOKEN"] = "https://godwoken-testnet-v1.ckbapp.dev";
    TestNetRpcUri["GATECHAIN"] = "https://meteora-evm.gatenode.cc";
    TestNetRpcUri["VECHAIN"] = "https://sync-testnet.veblocks.net";
    TestNetRpcUri["SECRET"] = "https://api.pulsar.scrttestnet.com";
    TestNetRpcUri["SKALE"] = "https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar";
    TestNetRpcUri["HEDERA"] = "https://0.testnet.hedera.com/";
    TestNetRpcUri["HEDERA_RELAY"] = "https://pool.arkhia.io/hedera/testnet/json-rpc/v1/4aX6a8J73ca92NXecaddCa4C295x62ap/";
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
    TestNetRpcUri["ZETA"] = "https://zetachain-athens-evm.blockpi.network/v1/rpc/public";
    TestNetRpcUri["ENERGI"] = "https://nodeapi.test.energi.network";
    TestNetRpcUri["BASE"] = "https://base-goerli.diamondswap.org/rpc";
    TestNetRpcUri["FINDORA"] = "https://prod-testnet.prod.findora.org:8545";
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
    MainNetRpcUri["HEDERA_RELAY"] = "https://tools.xp.network/hedera-relay";
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
    MainNetRpcUri["OPTIMISM"] = "https://mainnet.optimism.io";
    MainNetRpcUri["CASPER"] = "https://rpc.mainnet.casperlabs.io/rpc";
    MainNetRpcUri["ZETA"] = "";
    MainNetRpcUri["ENERGI"] = "";
    MainNetRpcUri["BASE"] = "https://base.llamarpc.com";
    MainNetRpcUri["FINDORA"] = "";
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
    Chain.ZETA = 0x29; //41
    Chain.ENERGI = 0x2a; //42
    Chain.BASE = 0x2b; //43
    Chain.FINDORA = 0x2c; //44
})(Chain = exports.Chain || (exports.Chain = {}));
var v3_ChainId;
(function (v3_ChainId) {
    v3_ChainId["BSC"] = "BSC";
    v3_ChainId["POLYGON"] = "MATIC";
    v3_ChainId["ETHEREUM"] = "ETH";
    v3_ChainId["ELROND"] = "MULTIVERSX";
    v3_ChainId["TON"] = "TON";
    v3_ChainId["CASPER"] = "CASPER";
    v3_ChainId["DEFAULT"] = "";
})(v3_ChainId = exports.v3_ChainId || (exports.v3_ChainId = {}));
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
exports.CHAIN_INFO.set(Chain.HECO, {
    name: "HECO",
    nonce: 3,
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.BSC,
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
    v3_chainId: v3_ChainId.ETHEREUM,
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.ETH,
    chainId: 5,
    tnChainId: 11155111,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    blockExplorerUrl: "https://etherscan.io/tx/",
    blockExplorerUrlAddr: "https://etherscan.io/address/",
    tnBlockExplorerUrl: "https://sepolia.etherscan.io/tx/",
    tnBlockExplorerUrlAddr: "https://sepolia.etherscan.io/address/",
    constructor: web3_1.web3HelperFactory,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.AVALANCHE, {
    name: "Avalanche",
    nonce: 6,
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.POLYGON,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
    decimals: Decimals_1.DecimalsByCurrency.GT,
    currency: domain_1.SupportedCurrency.GT,
    currencySymbol: domain_1.SupportedCurrencyName.GT,
    chainId: 85,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.VECHAIN, {
    name: "VeChain",
    tnBlockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
    blockExplorerUrlAddr: "https://vechainstats.com/account/",
    blockExplorerUrl: "https://vechainstats.com/transaction/",
    tnBlockExplorerUrlAddr: "https://explore-testnet.vechain.org/accounts/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x19,
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
    currency: domain_1.SupportedCurrency.SCRT,
    currencySymbol: domain_1.SupportedCurrencyName.SCRT,
    decimals: Decimals_1.DecimalsByCurrency.SCRT,
    type: ChainType.COSMOS,
    blockExplorerUrl: "https://www.mintscan.io/secret/tx/",
    blockExplorerUrlAddr: "https://www.mintscan.io/secret/address/",
    tnBlockExplorerUrl: "https://testnet.ping.pub/secret/tx/",
    tnBlockExplorerUrlAddr: "https://testnet.ping.pub/secret/account/",
});
exports.CHAIN_INFO.set(Chain.SOLANA, {
    name: "Solana",
    blockExplorerUrl: "https://solscan.io/tx/",
    blockExplorerUrlAddr: "https://solscan.io/account/",
    tnBlockExplorerUrl: (tx) => `https://solscan.io/tx/${tx}?cluster=devnet`,
    tnBlockExplorerUrlAddr: (address) => `https://solscan.io/account/${address}?cluster=devnet`,
    constructor: solana_1.solanaHelper,
    nonce: Chain.SOLANA,
    v3_chainId: v3_ChainId.DEFAULT,
    currency: domain_1.SupportedCurrency.SOL,
    currencySymbol: domain_1.SupportedCurrencyName.SOL,
    decimals: Decimals_1.DecimalsByCurrency.SOL,
    type: ChainType.SOLANA,
});
exports.CHAIN_INFO.set(Chain.HEDERA, {
    blockExplorerUrl: "https://hashscan.io/mainnet/transaction/",
    tnBlockExplorerUrl: "https://hashscan.io/testnet/transaction/",
    //@ts-ignore
    constructor: hedera_refactor_1.HederaHelperFactory,
    currency: domain_1.SupportedCurrency.HBAR,
    currencySymbol: domain_1.SupportedCurrencyName.HBAR,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    nonce: Chain.HEDERA,
    name: "Hedera",
    type: ChainType.HEDERA,
    blockExplorerUrlAddr: "https://hashscan.io/mainnet/account/",
    tnBlockExplorerUrlAddr: "https://hashscan.io/testnet/account/",
    chainId: 295,
    tnChainId: 296,
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
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    constructor: dfinity_1.dfinityHelper,
    currency: domain_1.SupportedCurrency.ICP,
    currencySymbol: domain_1.SupportedCurrencyName.ICP,
    decimals: Decimals_1.DecimalsByCurrency.ICP,
    name: "DFINITY",
    nonce: Chain.DFINITY,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.DFINITY,
    blockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
    blockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
    tnBlockExplorerUrl: "https://dashboard.internetcomputer.org/account/",
    tnBlockExplorerUrlAddr: "https://dashboard.internetcomputer.org/account/",
    tnBlockExplorerUrlCollection: "https://dashboard.internetcomputer.org/canister/",
    blockExplorerUrlCollection: "https://dashboard.internetcomputer.org/canister/",
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.TON,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
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
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 3250,
    blockExplorerUrlAddr: "https://brisescan.com/address/",
    tnBlockExplorerUrl: "https://testnet-explorer.brisescan.com/tx/",
    tnBlockExplorerUrlAddr: "https://testnet-explorer.brisescan.com/address/",
    tnChainId: 64668,
});
exports.CHAIN_INFO.set(Chain.CASPER, {
    blockExplorerUrl: "https://cspr.live/deploy/",
    blockExplorerUrlAddr: "https://cspr.live/account/",
    tnBlockExplorerUrl: "https://testnet.cspr.live/deploy/",
    tnBlockExplorerUrlAddr: "https://testnet.cspr.live/account/",
    constructor: casper_1.casperHelper,
    currency: domain_1.SupportedCurrency.CSPR,
    currencySymbol: domain_1.SupportedCurrencyName.CSPR,
    decimals: Decimals_1.DecimalsByCurrency.CSPR,
    name: "Casper",
    nonce: Chain.CASPER,
    v3_chainId: v3_ChainId.CASPER,
    type: ChainType.CASPER,
});
exports.CHAIN_INFO.set(Chain.OPTIMISM, {
    blockExplorerUrl: "https://optimistic.etherscan.io/tx/",
    blockExplorerUrlAddr: "https://optimistic.etherscan.io/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OPTM,
    currencySymbol: domain_1.SupportedCurrencyName.OPTM,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Optimism",
    nonce: Chain.OPTIMISM,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 10,
    tnBlockExplorerUrl: "https://goerli-optimism.etherscan.io/tx/",
    tnBlockExplorerUrlAddr: "https://goerli-optimism.etherscan.io/address/",
    tnChainId: 420,
});
exports.CHAIN_INFO.set(Chain.ZETA, {
    blockExplorerUrl: "https://explorer.zetachain.com/cc/tx/",
    blockExplorerUrlAddr: "https://explorer.zetachain.com/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.ZETA,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Zeta",
    nonce: Chain.ZETA,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 7000,
    tnChainId: 7001,
    tnBlockExplorerUrl: "https://explorer.zetachain.com/cc/tx/",
    tnBlockExplorerUrlAddr: "https://explorer.zetachain.com/address/",
});
exports.CHAIN_INFO.set(Chain.ENERGI, {
    blockExplorerUrl: "https://explorer.energi.network/tx/",
    blockExplorerUrlAddr: "https://explorer.energi.network/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.NRG,
    currencySymbol: domain_1.SupportedCurrencyName.NRG,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Energi",
    nonce: Chain.ENERGI,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 39797,
    tnChainId: 49797,
    tnBlockExplorerUrl: "https://explorer.test.energi.network/tx/",
    tnBlockExplorerUrlAddr: "https://explorer.test.energi.network/address/",
});
exports.CHAIN_INFO.set(Chain.BASE, {
    blockExplorerUrl: "https://explorer.baseledger.net/tx/",
    blockExplorerUrlAddr: "https://explorer.baseledger.net/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ETH,
    currencySymbol: domain_1.SupportedCurrencyName.ETH,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Base Goerli",
    nonce: Chain.BASE,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 8453,
    tnBlockExplorerUrl: "https://goerli.basescan.org/tx/",
    tnBlockExplorerUrlAddr: "https://goerli.basescan.org/address/",
    tnChainId: 84531,
});
exports.CHAIN_INFO.set(Chain.FINDORA, {
    blockExplorerUrl: "https://evm.findorascan.io/tx/",
    blockExplorerUrlAddr: "https://evm.findorascan.io/address/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.FRA,
    currencySymbol: domain_1.SupportedCurrencyName.FRA,
    decimals: Decimals_1.DecimalsByCurrency.ETH,
    name: "Findora",
    nonce: Chain.FINDORA,
    v3_chainId: v3_ChainId.DEFAULT,
    type: ChainType.EVM,
    chainId: 2152,
    tnBlockExplorerUrl: "https://testnet-anvil.evm.findorascan.io/tx/",
    tnBlockExplorerUrlAddr: "https://testnet-anvil.evm.findorascan.io/address/",
    tnChainId: 2153,
});
setTimeout(() => {
    exports.CHAIN_INFO.set(Chain.ELROND, {
        name: "Elrond",
        nonce: 2,
        v3_chainId: v3_ChainId.ELROND,
        decimals: Decimals_1.DecimalsByCurrency.EGLD,
        constructor: elrond_1.elrondHelperFactory,
        blockExplorerUrl: "https://explorer.elrond.com/transactions/",
        blockExplorerUrlAddr: "https://explorer.elrond.com/address/",
        tnBlockExplorerUrl: "https://devnet-explorer.multiversx.com/transactions/",
        tnBlockExplorerUrlAddr: "https://devnet-explorer.multiversx.com/accounts/",
        currency: domain_1.SupportedCurrency.EGLD,
        currencySymbol: domain_1.SupportedCurrencyName.EGLD,
        type: ChainType.ELROND,
    });
}, 300);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFJaUM7QUFFakMseUNBQTJFO0FBQzNFLDZDQUErRTtBQUMvRSxzRUFBdUU7QUFDdkUsbUVBR2dEO0FBQ2hELDhFQUFpRztBQUNqRyxpREFJNEI7QUFDNUIsMkNBQStFO0FBRS9FLDZDQUkwQjtBQUMxQiw2Q0FBNEU7QUFDNUUsMkNBQW9FO0FBQ3BFLHVEQUltQztBQUNuQyx5Q0FBMkU7QUFDM0UsMkNBQXdFO0FBQ3hFLHlEQUdrQztBQUNsQyxvREFJaUM7QUFFakMsNENBQTRDO0FBQzVDLElBQVksYUEwQ1g7QUExQ0QsV0FBWSxhQUFhO0lBQ3ZCLGlFQUFnRCxDQUFBO0lBQ2hELDREQUEyQyxDQUFBO0lBQzNDLHVFQUFzRCxDQUFBO0lBQ3RELG1GQUFrRSxDQUFBO0lBQ2xFLHlFQUF3RCxDQUFBO0lBQ3hELGlGQUFnRSxDQUFBO0lBQ2hFLCtEQUE4QyxDQUFBO0lBQzlDLHlEQUF3QyxDQUFBO0lBQ3hDLGtFQUFpRCxDQUFBO0lBQ2pELHFEQUFvQyxDQUFBO0lBQ3BDLHFEQUFvQyxDQUFBO0lBQ3BDLDREQUEyQyxDQUFBO0lBQzNDLHNEQUFxQyxDQUFBO0lBQ3JDLG9FQUFtRCxDQUFBO0lBQ25ELDZEQUE0QyxDQUFBO0lBQzVDLHVEQUFzQyxDQUFBO0lBQ3RDLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDJGQUEwRSxDQUFBO0lBQzFFLHlEQUF3QyxDQUFBO0lBQ3hDLHFIQUFvRyxDQUFBO0lBQ3BHLHNEQUFxQyxDQUFBO0lBQ3JDLHVFQUFzRCxDQUFBO0lBQ3RELDREQUEyQyxDQUFBO0lBQzNDLGlFQUFnRCxDQUFBO0lBQ2hELHFFQUFvRCxDQUFBO0lBQ3BELHlEQUF3QyxDQUFBO0lBQ3hDLHNFQUFxRCxDQUFBO0lB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