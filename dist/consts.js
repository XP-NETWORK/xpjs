"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.ChainType = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
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
const near_1 = require("./helpers/near");
const aptos_1 = require("./helpers/aptos");
const web3_erc20_1 = require("./helpers/web3_erc20");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-gateway.elrond.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
    TestNetRpcUri["ROPSTEN"] = "https://ethereum-goerli-rpc.allthatnode.com";
    TestNetRpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    TestNetRpcUri["POLYGON"] = "https://matic-mumbai.chainstacklabs.com";
    TestNetRpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
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
    TestNetRpcUri["SKALE"] = "https://staging-v2.skalenodes.com/v1/actual-secret-cebalrai";
    TestNetRpcUri["HEDERA"] = "https://0.testnet.hedera.com/";
    TestNetRpcUri["NEAR"] = "https://rpc.testnet.near.org";
    TestNetRpcUri["MOONBEAM"] = "https://rpc.api.moonbase.moonbeam.network";
    TestNetRpcUri["ABEYCHAIN"] = "https://testrpc.abeychain.com";
    TestNetRpcUri["APTOS"] = "https://fullnode.devnet.aptoslabs.com";
    TestNetRpcUri["TON"] = "https://testnet.toncenter.com/api/v2/jsonRPC";
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
})(Chain = exports.Chain || (exports.Chain = {}));
var ChainType;
(function (ChainType) {
    ChainType["EVM"] = "EVM";
    ChainType["ELROND"] = "ELROND";
    ChainType["TRON"] = "TRON";
    ChainType["TEZOS"] = "TEZOS";
    ChainType["ALGORAND"] = "ALGORAND";
    ChainType["SECRET"] = "SECRET";
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
    decimals: 1e18,
    constructor: elrond_1.elrondHelperFactory,
    blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
    currency: domain_1.SupportedCurrency.EGLD,
    type: ChainType.ELROND,
});
exports.CHAIN_INFO.set(Chain.HECO, {
    name: "HECO",
    nonce: 3,
    chainId: 256,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HT,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.BSC, {
    name: "BSC",
    nonce: 4,
    chainId: 97,
    decimals: 1e18,
    blockExplorerUrl: "https://testnet.bscscan.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.BNB,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ETHEREUM, {
    name: "Ethereum",
    nonce: 5,
    currency: domain_1.SupportedCurrency.ETH,
    chainId: 5,
    decimals: 1e18,
    blockExplorerUrl: "https://goerli.etherscan.io/tx",
    constructor: web3_1.web3HelperFactory,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.AVALANCHE, {
    name: "Avalanche",
    nonce: 6,
    chainId: 43113,
    decimals: 1e18,
    blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AVAX,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.POLYGON, {
    name: "Polygon",
    nonce: 0x7,
    chainId: 80001,
    decimals: 1e18,
    blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.MATIC,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.FANTOM, {
    name: "Fantom",
    nonce: 0x8,
    decimals: 1e18,
    chainId: 4002,
    blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.FTM,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.TRON, {
    name: "Tron",
    nonce: 0x9,
    decimals: 1e6,
    blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
    constructor: tron_1.tronHelperFactory,
    currency: domain_1.SupportedCurrency.TRX,
    type: ChainType.TRON,
});
exports.CHAIN_INFO.set(Chain.CELO, {
    name: "Celo",
    nonce: 0xb,
    decimals: 1e18,
    chainId: 44787,
    blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.CELO,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.HARMONY, {
    name: "Harmony",
    nonce: 0xc,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONE,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ONT, {
    name: "Ontology",
    nonce: 0xd,
    decimals: 1e18,
    chainId: 1666700000,
    blockExplorerUrl: "https://explorer.pops.one/tx",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ONT,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.XDAI, {
    name: "xDai",
    nonce: 0xe,
    decimals: 1e18,
    chainId: 0x64,
    blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.XDAI,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ALGORAND, {
    name: "Algorand",
    nonce: 0xf,
    decimals: 1e6,
    chainId: undefined,
    blockExplorerUrl: "https://algoexplorer.io/tx",
    currency: domain_1.SupportedCurrency.ALGO,
    constructor: (p) => Promise.resolve((0, algorand_1.algorandHelper)(p)),
    type: ChainType.ALGORAND,
});
exports.CHAIN_INFO.set(Chain.FUSE, {
    name: "FUSE",
    nonce: 0x10,
    decimals: 1e18,
    chainId: undefined,
    blockExplorerUrl: "https://explorer.fuse.io/tx",
    currency: domain_1.SupportedCurrency.FUSE,
    constructor: web3_1.web3HelperFactory,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.UNIQUE, {
    name: "Unique",
    nonce: 0x11,
    decimals: 1e18,
    chainId: 8888,
    blockExplorerUrl: "CANT FIND",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.OPL,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.TEZOS, {
    name: "Tezos",
    nonce: 0x12,
    decimals: 1e6,
    constructor: tezos_1.tezosHelperFactory,
    currency: domain_1.SupportedCurrency.XTZ,
    blockExplorerUrl: "https://tezblock.io/transaction",
    type: ChainType.TEZOS,
});
exports.CHAIN_INFO.set(Chain.VELAS, {
    name: "Velas",
    blockExplorerUrl: "https://explorer.velas.com/tx",
    nonce: 0x13,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.VLX,
    chainId: 111,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.AURORA, {
    name: "Aurora",
    blockExplorerUrl: "https://aurorascan.dev/tx",
    nonce: Chain.AURORA,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.AURORA,
    chainId: 1313161554,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.IOTEX, {
    name: "IoTeX",
    blockExplorerUrl: "https://iotexscan.io/tx",
    nonce: 0x14,
    decimals: 1e18,
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.IOTX,
    chainId: 4689,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.GODWOKEN, {
    name: "GodWoken",
    blockExplorerUrl: "https://aggron.layerview.io/tx/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x16,
    decimals: 1e18,
    currency: domain_1.SupportedCurrency.CKB,
    chainId: 868455272153094,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.GATECHAIN, {
    name: "GateChain",
    blockExplorerUrl: "https://gatescan.org/testnet/tx",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x17,
    decimals: 1e18,
    currency: domain_1.SupportedCurrency.GT,
    chainId: 85,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.VECHAIN, {
    name: "VeChain",
    blockExplorerUrl: "https://explore-testnet.vechain.org/transactions/",
    constructor: web3_1.web3HelperFactory,
    nonce: 0x19,
    currency: domain_1.SupportedCurrency.VET,
    decimals: 1e18,
    chainId: 39,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.SECRET, {
    name: "Secret",
    blockExplorerUrl: "",
    constructor: secret_1.secretHelperFactory,
    nonce: Chain.SECRET,
    currency: domain_1.SupportedCurrency.SCRT,
    decimals: 1e6,
    type: ChainType.SECRET,
});
exports.CHAIN_INFO.set(Chain.SOLANA, {
    name: "Solana",
    blockExplorerUrl: "",
    constructor: solana_1.solanaHelper,
    nonce: Chain.SOLANA,
    currency: domain_1.SupportedCurrency.SOL,
    decimals: 1e9,
    type: ChainType.SOLANA,
});
exports.CHAIN_INFO.set(Chain.TON, {
    name: "TON",
    blockExplorerUrl: "",
    constructor: ton_1.tonHelper,
    nonce: Chain.TON,
    currency: domain_1.SupportedCurrency.TON,
    decimals: 1e9,
    type: ChainType.TON,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    name: "DFINITY",
    blockExplorerUrl: "",
    constructor: dfinity_1.dfinityHelper,
    nonce: Chain.DFINITY,
    currency: domain_1.SupportedCurrency.ICP,
    decimals: 1e8,
    type: ChainType.DFINITY,
});
exports.CHAIN_INFO.set(Chain.HEDERA, {
    blockExplorerUrl: "https://hashscan.io/#/testnet/transaction",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.HBAR,
    decimals: 1e6,
    nonce: Chain.HEDERA,
    name: "Hedera",
    type: ChainType.HEDERA,
});
exports.CHAIN_INFO.set(Chain.SKALE, {
    name: "Skale",
    blockExplorerUrl: "https://rapping-zuben-elakrab.explorer.staging-v2.skalenodes.com/tx/",
    constructor: web3_erc20_1.web3ERC20HelperFactory,
    currency: domain_1.SupportedCurrency.SKL,
    decimals: 1e18,
    chainId: 1564830818,
    nonce: Chain.SKALE,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.DFINITY, {
    blockExplorerUrl: "",
    constructor: dfinity_1.dfinityHelper,
    currency: domain_1.SupportedCurrency.ICP,
    decimals: 1e8,
    name: "DFINITY",
    nonce: Chain.DFINITY,
    type: ChainType.DFINITY,
});
exports.CHAIN_INFO.set(Chain.NEAR, {
    blockExplorerUrl: "https://explorer.testnet.near.org/transactions/",
    constructor: near_1.nearHelperFactory,
    currency: domain_1.SupportedCurrency.NEAR,
    decimals: 1e8,
    name: "NEAR",
    nonce: Chain.NEAR,
    type: ChainType.NEAR,
});
exports.CHAIN_INFO.set(Chain.MOONBEAM, {
    blockExplorerUrl: "https://moonbase.moonscan.io/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.GLMR,
    decimals: 1e18,
    name: "MoonBeam",
    nonce: Chain.MOONBEAM,
    chainId: 0x507,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.ABEYCHAIN, {
    blockExplorerUrl: "https://testnet-explorer.abeychain.com/",
    constructor: web3_1.web3HelperFactory,
    currency: domain_1.SupportedCurrency.ABEY,
    decimals: 1e18,
    name: "AbeyChain",
    nonce: Chain.ABEYCHAIN,
    chainId: 178,
    type: ChainType.EVM,
});
exports.CHAIN_INFO.set(Chain.APTOS, {
    blockExplorerUrl: "https://explorer.aptoslabs.com/",
    constructor: aptos_1.aptosHelper,
    currency: domain_1.SupportedCurrency.APTOS,
    decimals: 1e18,
    name: "Aptos",
    nonce: Chain.APTOS,
    type: ChainType.APTOS,
});
exports.CHAIN_INFO.set(Chain.TON, {
    name: "TON",
    constructor: ton_1.tonHelper,
    currency: domain_1.SupportedCurrency.TON,
    decimals: 1e9,
    nonce: Chain.TON,
    type: ChainType.TON,
    blockExplorerUrl: "https://testnet.tonscan.org/tx/",
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUUzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBQzVCLDJDQUErRTtBQUUvRSw2Q0FJMEI7QUFDMUIsNkNBQTRFO0FBQzVFLHVDQUFnRTtBQUNoRSx1REFJbUM7QUFDbkMseUNBQTJFO0FBQzNFLDJDQUF3RTtBQUN4RSxxREFBK0U7QUFFL0UsNENBQTRDO0FBQzVDLElBQVksYUE4Qlg7QUE5QkQsV0FBWSxhQUFhO0lBQ3ZCLDZEQUE0QyxDQUFBO0lBQzVDLDREQUEyQyxDQUFBO0lBQzNDLHVFQUFzRCxDQUFBO0lBQ3RELHdFQUF1RCxDQUFBO0lBQ3ZELHlFQUF3RCxDQUFBO0lBQ3hELG9FQUFtRCxDQUFBO0lBQ25ELCtEQUE4QyxDQUFBO0lBQzlDLHlEQUF3QyxDQUFBO0lBQ3hDLGtFQUFpRCxDQUFBO0lBQ2pELHFEQUFvQyxDQUFBO0lBQ3BDLG1EQUFrQyxDQUFBO0lBQ2xDLDREQUEyQyxDQUFBO0lBQzNDLHNEQUFxQyxDQUFBO0lBQ3JDLGlFQUFnRCxDQUFBO0lBQ2hELDZEQUE0QyxDQUFBO0lBQzVDLHVEQUFzQyxDQUFBO0lBQ3RDLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLDhEQUE2QyxDQUFBO0lBQzdDLHNFQUFxRCxDQUFBO0lBQ3JELHNGQUFxRSxDQUFBO0lBQ3JFLHlEQUF3QyxDQUFBO0lBQ3hDLHNEQUFxQyxDQUFBO0lBQ3JDLHVFQUFzRCxDQUFBO0lBQ3RELDREQUEyQyxDQUFBO0lBQzNDLGdFQUErQyxDQUFBO0lBQy9DLHFFQUFvRCxDQUFBO0lBQ3BELGlCQUFpQjtJQUNqQixhQUFhO0FBQ2YsQ0FBQyxFQTlCVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQThCeEI7QUFFRCxJQUFZLGFBNEJYO0FBNUJE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