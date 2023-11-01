"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.ChainType = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
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
    TestNetRpcUri["ROPSTEN"] = "https://goerli.infura.io/v3/cec5dc92097a46f0b895ac1e89865467";
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
    MainNetRpcUri["BASE"] = "";
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
    blockExplorerUrlAddr: "https://vechainstats.com/account/",
    blockExplorerUrl: "https://vechainstats.com/transaction/",
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
    blockExplorerUrl: "https://cspr.live/deploy/",
    blockExplorerUrlAddr: "https://cspr.live/address/",
    tnBlockExplorerUrl: "https://testnet.cspr.live/deploy/",
    tnBlockExplorerUrlAddr: "https://testnet.cspr.live/address/",
    constructor: casper_1.casperHelper,
    currency: domain_1.SupportedCurrency.CSPR,
    currencySymbol: domain_1.SupportedCurrencyName.CSPR,
    decimals: Decimals_1.DecimalsByCurrency.CSPR,
    name: "Casper",
    nonce: Chain.CASPER,
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
    type: ChainType.EVM,
    chainId: 2152,
    tnBlockExplorerUrl: "https://testnet-anvil.evm.findorascan.io/tx/",
    tnBlockExplorerUrlAddr: "https://testnet-anvil.evm.findorascan.io/address/",
    tnChainId: 2153,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLDZDQUErRTtBQUMvRSxzRUFBdUU7QUFDdkUsbUVBR2dEO0FBQ2hELDhFQUFpRztBQUNqRyxpREFJNEI7QUFDNUIsMkNBQStFO0FBRS9FLDZDQUkwQjtBQUMxQiw2Q0FBNEU7QUFDNUUsMkNBQW9FO0FBQ3BFLHVEQUltQztBQUNuQyx5Q0FBMkU7QUFDM0UsMkNBQXdFO0FBQ3hFLHlEQUdrQztBQUNsQyxvREFJaUM7QUFFakMsNENBQTRDO0FBQzVDLElBQVksYUEwQ1g7QUExQ0QsV0FBWSxhQUFhO0lBQ3ZCLGlFQUFnRCxDQUFBO0lBQ2hELDREQUEyQyxDQUFBO0lBQzNDLHVFQUFzRCxDQUFBO0lBQ3RELHlGQUF3RSxDQUFBO0lBQ3hFLHlFQUF3RCxDQUFBO0lBQ3hELGlGQUFnRSxDQUFBO0lBQ2hFLCtEQUE4QyxDQUFBO0lBQzlDLHlEQUF3QyxDQUFBO0lBQ3hDLGtFQUFpRCxDQUFBO0lBQ2pELHFEQUFvQyxDQUFBO0lBQ3BDLHFEQUFvQyxDQUFBO0lBQ3BDLDREQUEyQyxDQUFBO0lBQzNDLHNEQUFxQyxDQUFBO0lBQ3JDLG9FQUFtRCxDQUFBO0lBQ25ELDZEQUE0QyxDQUFBO0lBQzVDLHVEQUFzQyxDQUFBO0lBQ3RDLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLDJGQUEwRSxDQUFBO0lBQzFFLHlEQUF3QyxDQUFBO0lBQ3hDLHFIQUFvRyxDQUFBO0lBQ3BHLHNEQUFxQyxDQUFBO0lBQ3JDLHVFQUFzRCxDQUFBO0lBQ3RELDREQUEyQyxDQUFBO0lBQzNDLGlFQUFnRCxDQUFBO0lBQ2hELHFFQUFvRCxDQUFBO0lBQ3BELHlEQUF3QyxDQUFBO0lBQ3hDLHNFQUFxRCxDQUFBO0lB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