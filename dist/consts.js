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
    constructor: web3_1.web3HelperFactory,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUUzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBQzVCLDJDQUErRTtBQUUvRSw2Q0FJMEI7QUFDMUIsNkNBQTRFO0FBQzVFLHVDQUFnRTtBQUNoRSx1REFJbUM7QUFDbkMseUNBQTJFO0FBQzNFLDJDQUF3RTtBQUV4RSw0Q0FBNEM7QUFDNUMsSUFBWSxhQTZCWDtBQTdCRCxXQUFZLGFBQWE7SUFDdkIsNkRBQTRDLENBQUE7SUFDNUMsNERBQTJDLENBQUE7SUFDM0MsdUVBQXNELENBQUE7SUFDdEQsd0VBQXVELENBQUE7SUFDdkQseUVBQXdELENBQUE7SUFDeEQsb0VBQW1ELENBQUE7SUFDbkQsK0RBQThDLENBQUE7SUFDOUMseURBQXdDLENBQUE7SUFDeEMsa0VBQWlELENBQUE7SUFDakQscURBQW9DLENBQUE7SUFDcEMsbURBQWtDLENBQUE7SUFDbEMsNERBQTJDLENBQUE7SUFDM0Msc0RBQXFDLENBQUE7SUFDckMsaUVBQWdELENBQUE7SUFDaEQsNkRBQTRDLENBQUE7SUFDNUMsdURBQXNDLENBQUE7SUFDdEMsb0VBQW1ELENBQUE7SUFDbkQsOERBQTZDLENBQUE7SUFDN0MsOERBQTZDLENBQUE7SUFDN0Msc0VBQXFELENBQUE7SUFDckQsc0ZBQXFFLENBQUE7SUFDckUseURBQXdDLENBQUE7SUFDeEMsc0RBQXFDLENBQUE7SUFDckMsdUVBQXNELENBQUE7SUFDdEQsNERBQTJDLENBQUE7SUFDM0MsZ0VBQStDLENBQUE7SUFDL0MsaUJBQWlCO0lBQ2pCLGFBQWE7QUFDZixDQUFDLEVBN0JXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBNkJ4QjtBQUVELElBQVksYUEyQlg7QUEzQkQsV0FBWSxhQUFhO0lBQ3ZCLHNEQUFxQyxDQUFBO0lB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