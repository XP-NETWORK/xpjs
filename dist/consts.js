"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
const algorand_1 = require("./helpers/algorand");
const tezos_1 = require("./helpers/tezos");
const secret_1 = require("./helpers/secret");
const solana_1 = require("./helpers/solana");
const ton_1 = require("./helpers/ton");
const dfinity_1 = require("./helpers/dfinity/dfinity");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-gateway.elrond.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://speedy-nodes-nyc.moralis.io/3749d19c2c6dbb6264f47871/bsc/testnet";
    TestNetRpcUri["ROPSTEN"] = "https://speedy-nodes-nyc.moralis.io/3749d19c2c6dbb6264f47871/eth/ropsten";
    TestNetRpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    TestNetRpcUri["POLYGON"] = "https://speedy-nodes-nyc.moralis.io/3749d19c2c6dbb6264f47871/polygon/mumbai";
    TestNetRpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
    TestNetRpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    TestNetRpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    TestNetRpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
    TestNetRpcUri["XDAI"] = "https://sokol.poa.network";
    TestNetRpcUri["UNIQUE"] = "https://rpc-opal.unique.network/";
    TestNetRpcUri["TEZOS"] = "https://hangzhounet.smartpy.io";
    TestNetRpcUri["VELAS"] = "https://explorer.testnet.velas.com/rpc";
    TestNetRpcUri["IOTEX"] = "https://babel-api.testnet.iotex.io";
    TestNetRpcUri["AURORA"] = "https://testnet.aurora.dev/";
    TestNetRpcUri["GODWOKEN"] = "https://godwoken-testnet-v1.ckbapp.dev";
    TestNetRpcUri["GATECHAIN"] = "https://meteora-evm.gatenode.cc";
    TestNetRpcUri["VECHAIN"] = "https://sync-testnet.veblocks.net";
    TestNetRpcUri["SECRET"] = "https://pulsar-2.api.trivium.network:9091/";
    TestNetRpcUri["SKALE"] = "https://staging-v2.skalenodes.com/v1/rapping-zuben-elakrab";
    TestNetRpcUri["HEDERA"] = "https://http://0.testnet.hedera.com/";
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
    MainNetRpcUri["XDAI"] = "https://gnosischain-rpc.gateway.pokt.network";
    MainNetRpcUri["FUSE"] = "https://rpc.fuse.io/";
    MainNetRpcUri["VELAS"] = "https://mainnet.velas.com/rpc";
    MainNetRpcUri["TEZOS"] = "https://mainnet.smartpy.io";
    MainNetRpcUri["IOTEX"] = "https://babel-api.mainnet.iotex.io";
    MainNetRpcUri["AURORA"] = "https://mainnet.aurora.dev";
    MainNetRpcUri["GODWOKEN"] = "https://v1.mainnet.godwoken.io/rpc";
    MainNetRpcUri["GATECHAIN"] = "https://evm.gatenode.cc";
    MainNetRpcUri["VECHAIN"] = "https://sync-mainnet.veblocks.net";
    MainNetRpcUri["SECRET"] = "https://scrt-rpc.blockpane.com:9091/";
    MainNetRpcUri["SKALE"] = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague";
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
})(Chain = exports.Chain || (exports.Chain = {}));
exports.CHAIN_INFO = new Map();
exports.CHAIN_INFO.set(Chain.ELROND, {
    name: "Elrond",
    nonce: 2,
    decimals: 1e18,
    constructor: elrond_1.elrondHelperFactory,
    blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
    currency: domain_1.SupportedCurrency.EGLD,
});
exports.CHAIN_INFO.set(Chain.HECO, {
    name: "HECO",
    nonce: 3,
    chainId: 256,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HT,
});
exports.CHAIN_INFO.set(Chain.BSC, {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.bscscan.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.BNB,
});
exports.CHAIN_INFO.set(Chain.ETHEREUM, {
    name: "Ethereum",
    nonce: 5,
    currency: domain_1.SupportedCurrency.ETH,
    chainId: 3,
    decimals: 1e18,
    blockExplorerUrl: "https://ropsten.etherscan.io/tx",
    constructor: web3_1.web3HelperFactory,
});
exports.CHAIN_INFO.set(Chain.AVALANCHE, {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: 1e18,
    blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AVAX,
});
exports.CHAIN_INFO.set(Chain.POLYGON, {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: 1e18,
    blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.MATIC,
});
exports.CHAIN_INFO.set(Chain.FANTOM, {
    name: "Fantom",
    nonce: 0x8,
    decimals: 1e18,
    chainId: 4002,
    blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.FTM,
});
exports.CHAIN_INFO.set(Chain.TRON, {
    name: "Tron",
    nonce: 0x9,
    decimals: 1e6,
    blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
    constructor: tron_1.tronHelperFactory,
    currency: domain_1.SupportedCurrency.TRX,
});
exports.CHAIN_INFO.set(Chain.CELO, {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.CELO,
});
exports.CHAIN_INFO.set(Chain.HARMONY, {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONE,
});
exports.CHAIN_INFO.set(Chain.ONT, {
    name: "Ontology",
    nonce: 0xd,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONT,
});
exports.CHAIN_INFO.set(Chain.XDAI, {
    name: "xDai",
    nonce: 0xe,
    decimals: 1e18,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.XDAI,
});
exports.CHAIN_INFO.set(Chain.ALGORAND, {
    name: "Algorand",
    nonce: 0xf,
    decimals: 1e6,
    chainId: undefined,
    blockExplorerUrl: "https://algoexplorer.io/tx",
    currency: domain_1.SupportedCurrency.ALGO,
    constructor: (p) => Promise.resolve((0, algorand_1.algorandHelper)(p)),
});
exports.CHAIN_INFO.set(Chain.FUSE, {
    name: "FUSE",
    nonce: 0x10,
    decimals: 1e18,
    chainId: undefined,
    blockExplorerUrl: "https://explorer.fuse.io/tx",
    currency: domain_1.SupportedCurrency.FUSE,
    constructor: web3_1.web3HelperFactory,
});
exports.CHAIN_INFO.set(Chain.UNIQUE, {
    name: "Unique",
    nonce: 0x11,
    decimals: 1e18,
    chainId: 8888,
    blockExplorerUrl: "CANT FIND",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OPL,
});
exports.CHAIN_INFO.set(Chain.TEZOS, {
    name: "Tezos",
    nonce: 0x12,
    decimals: 1e6,
    constructor: tezos_1.tezosHelperFactory,
    currency: domain_1.SupportedCurrency.XTZ,
    blockExplorerUrl: "https://tezblock.io/transaction",
});
exports.CHAIN_INFO.set(Chain.VELAS, {
    name: "Velas",
    blockExplorerUrl: "https://explorer.velas.com/tx",
    nonce: 0x13,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.VLX,
    chainId: 111,
});
exports.CHAIN_INFO.set(Chain.AURORA, {
    name: "Aurora",
    blockExplorerUrl: "https://aurorascan.dev/tx",
    nonce: Chain.AURORA,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AURORA,
    chainId: 1313161554,
});
exports.CHAIN_INFO.set(Chain.IOTEX, {
    name: "IoTeX",
    blockExplorerUrl: "https://iotexscan.io/tx",
    nonce: 0x14,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.IOTX,
    chainId: 4689,
});
exports.CHAIN_INFO.set(Chain.GODWOKEN, {
    name: "GodWoken",
    blockExplorerUrl: "https://aggron.layerview.io/tx/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x16,
    decimals: 1e18,
    currency: domain_1.SupportedCurrency.CKB,
    chainId: 868455272153094,
});
exports.CHAIN_INFO.set(Chain.GATECHAIN, {
    name: "GateChain",
    blockExplorerUrl: "https://gatescan.org/testnet/tx",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x17,
    decimals: 1e18,
    currency: domain_1.SupportedCurrency.GT,
    chainId: 85,
});
exports.CHAIN_INFO.set(Chain.VECHAIN, {
    name: "VeChain",
    blockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x19,
    currency: domain_1.SupportedCurrency.VET,
    decimals: 1e18,
    chainId: 39,
});
exports.CHAIN_INFO.set(Chain.SECRET, {
    name: "Secret",
    blockExplorerUrl: "",
    constructor: secret_1.secretHelperFactory,
    nonce: Chain.SECRET,
    currency: domain_1.SupportedCurrency.SCRT,
    decimals: 1e6,
});
exports.CHAIN_INFO.set(Chain.SOLANA, {
    name: "Solana",
    blockExplorerUrl: "",
    constructor: solana_1.solanaHelper,
    nonce: Chain.SOLANA,
    currency: domain_1.SupportedCurrency.SOL,
    decimals: 1e9,
});
exports.CHAIN_INFO.set(Chain.TON, {
    name: "TON",
    blockExplorerUrl: "",
    constructor: ton_1.tonHelper,
    nonce: Chain.TON,
    currency: domain_1.SupportedCurrency.TON,
    decimals: 1e9,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    name: "DFINITY",
    blockExplorerUrl: "",
    constructor: dfinity_1.dfinityHelper,
    nonce: Chain.DFINITY,
    currency: domain_1.SupportedCurrency.ICP,
    decimals: 1e8,
});
exports.CHAIN_INFO.set(Chain.HEDERA, {
    blockExplorerUrl: "https://hashscan.io/#/testnet/transaction",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HBAR,
    decimals: 1e6,
    nonce: Chain.HEDERA,
    name: "Hedera",
});
exports.CHAIN_INFO.set(Chain.SKALE, {
    name: "Skale",
    blockExplorerUrl: "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/tx/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.sFUEL,
    decimals: 1e18,
    chainId: 1564830818,
    nonce: Chain.SKALE,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    blockExplorerUrl: "",
    constructor: dfinity_1.dfinityHelper,
    currency: domain_1.SupportedCurrency.ICP,
    decimals: 1e8,
    name: "DFINITY",
    nonce: Chain.DFINITY,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBQzVCLDJDQUErRTtBQUUvRSw2Q0FJMEI7QUFDMUIsNkNBQTRFO0FBQzVFLHVDQUFnRTtBQUNoRSx1REFJbUM7QUFFbkMsNENBQTRDO0FBQzVDLElBQVksYUF5Qlg7QUF6QkQsV0FBWSxhQUFhO0lBQ3ZCLDZEQUE0QyxDQUFBO0lBQzVDLDREQUEyQyxDQUFBO0lBQzNDLGlHQUFnRixDQUFBO0lBQ2hGLHFHQUFvRixDQUFBO0lBQ3BGLHlFQUF3RCxDQUFBO0lBQ3hELHdHQUF1RixDQUFBO0lBQ3ZGLCtEQUE4QyxDQUFBO0lBQzlDLHlEQUF3QyxDQUFBO0lBQ3hDLGtFQUFpRCxDQUFBO0lBQ2pELHFEQUFvQyxDQUFBO0lBQ3BDLG1EQUFrQyxDQUFBO0lBQ2xDLDREQUEyQyxDQUFBO0lBQzNDLHlEQUF3QyxDQUFBO0lBQ3hDLGlFQUFnRCxDQUFBO0lBQ2hELDZEQUE0QyxDQUFBO0lBQzVDLHVEQUFzQyxDQUFBO0lBQ3RDLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLHNFQUFxRCxDQUFBO0lBQ3JELHFGQUFvRSxDQUFBO0lBQ3BFLGdFQUErQyxDQUFBO0lBQy9DLGlCQUFpQjtJQUNqQixhQUFhO0FBQ2YsQ0FBQyxFQXpCVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQXlCeEI7QUFFRCxJQUFZLGFBdUJYO0FBdkJELFdBQVksYUFBYTtJQUN2QixzREFBcUMsQ0FBQTtJQUNyQyxrRUFBaUQsQ0FBQTtJQUNqRCwwREFBeUMsQ0FBQTtJQUN6QywyRkFBMEUsQ0FBQTtJQUMxRSxvRUFBbUQsQ0FBQTtJQUNuRCxvREFBbUMsQ0FBQTtJQUNuQyxrREFB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