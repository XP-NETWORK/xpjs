"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.CHAIN_INFO = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
const algorand_1 = require("./helpers/algorand");
const tezos_1 = require("./helpers/tezos");
// All the supported testnet uri's are here.
var TestNetRpcUri;
(function (TestNetRpcUri) {
    TestNetRpcUri["ELROND"] = "https://devnet-api.elrond.com";
    TestNetRpcUri["HECO"] = "https://http-testnet.hecochain.com";
    TestNetRpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
    TestNetRpcUri["ROPSTEN"] = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    TestNetRpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    TestNetRpcUri["POLYGON"] = "https://matic-testnet-archive-rpc.bwarelabs.com";
    TestNetRpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
    TestNetRpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    TestNetRpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    TestNetRpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
    TestNetRpcUri["XDAI"] = "https://sokol.poa.network";
    TestNetRpcUri["UNIQUE"] = "https://rpc-opal.unique.network/";
    TestNetRpcUri["TEZOS"] = "https://hangzhounet.smartpy.io";
    TestNetRpcUri["VELAS"] = "https://explorer.testnet.velas.com/rpc";
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
    MainNetRpcUri["POLYGON"] = "https://rpc-mainnet.matic.network";
    MainNetRpcUri["FANTOM"] = "https://rpc.ftm.tools/";
    MainNetRpcUri["TRON"] = "https://api.trongrid.io/";
    MainNetRpcUri["CELO"] = "https://forno.celo.org";
    MainNetRpcUri["HARMONY"] = "https://api.harmony.one";
    MainNetRpcUri["XDAI"] = "https://rpc.xdaichain.com/";
    MainNetRpcUri["FUSE"] = "https://rpc.fuse.io/";
    MainNetRpcUri["VELAS"] = "https://mainnet.velas.com/rpc";
    MainNetRpcUri["TEZOS"] = "https://mainnet.smartpy.io";
    // TODO: Algorand
})(MainNetRpcUri = exports.MainNetRpcUri || (exports.MainNetRpcUri = {}));
var Chain;
(function (Chain) {
    Chain.ELROND = 2;
    Chain.HECO = 3;
    Chain.BSC = 4;
    Chain.ETHEREUM = 5;
    Chain.AVALANCHE = 6;
    Chain.POLYGON = 7;
    Chain.FANTOM = 8;
    Chain.TRON = 9;
    Chain.CELO = 0xb;
    Chain.HARMONY = 0xc;
    Chain.XDAI = 0xe;
    Chain.ALGORAND = 0xf;
    Chain.FUSE = 0x10;
    Chain.UNIQUE = 0x11;
    Chain.TEZOS = 0x12;
    Chain.VELAS = 0x13;
})(Chain = exports.Chain || (exports.Chain = {}));
exports.CHAIN_INFO = {
    2: {
        name: "Elrond",
        nonce: 2,
        decimals: 1e18,
        constructor: (p) => elrond_1.elrondHelperFactory(p),
        blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
        currency: domain_1.SupportedCurrency.EGLD,
    },
    3: {
        name: "Heco",
        nonce: 3,
        chainId: 256,
        decimals: 1e18,
        blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.HT,
    },
    4: {
        name: "BSC",
        nonce: 4,
        chainId: 97,
        decimals: 1e18,
        blockExplorerUrl: "https://testnet.bscscan.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.BNB,
    },
    5: {
        name: "Ropsten",
        nonce: 5,
        currency: domain_1.SupportedCurrency.ETH,
        chainId: 3,
        decimals: 1e18,
        blockExplorerUrl: "https://ropsten.etherscan.io/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
    },
    6: {
        name: "Avalanche",
        nonce: 6,
        chainId: 43113,
        decimals: 1e18,
        blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.AVAX,
    },
    7: {
        name: "Polygon",
        nonce: 0x7,
        chainId: 80001,
        decimals: 1e18,
        blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.MATIC,
    },
    8: {
        name: "Fantom",
        nonce: 0x8,
        decimals: 1e18,
        chainId: 4002,
        blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.FTM,
    },
    9: {
        name: "Tron",
        nonce: 0x9,
        decimals: 1e6,
        blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
        constructor: (p) => tron_1.tronHelperFactory(p),
        currency: domain_1.SupportedCurrency.TRX,
    },
    11: {
        name: "Celo",
        nonce: 0xb,
        decimals: 1e18,
        chainId: 44787,
        blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.CELO,
    },
    12: {
        name: "Harmony",
        nonce: 0xc,
        decimals: 1e18,
        chainId: 1666700000,
        blockExplorerUrl: "https://explorer.pops.one/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.ONE,
    },
    13: {
        name: "Ontology",
        nonce: 0xd,
        decimals: 1e18,
        chainId: 1666700000,
        blockExplorerUrl: "https://explorer.pops.one/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.ONT,
    },
    14: {
        name: "xDai",
        nonce: 0xe,
        decimals: 1e18,
        chainId: 0x64,
        blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.STAKE,
    },
    15: {
        name: "Algorand",
        nonce: 0xf,
        decimals: 1e6,
        chainId: undefined,
        blockExplorerUrl: "https://algoexplorer.io/tx",
        currency: domain_1.SupportedCurrency.ALGO,
        constructor: (p) => Promise.resolve(algorand_1.algorandHelper(p)),
    },
    16: {
        name: "FUSE",
        nonce: 0x10,
        decimals: 1e18,
        chainId: undefined,
        blockExplorerUrl: "https://explorer.fuse.io/tx",
        currency: domain_1.SupportedCurrency.FUSE,
        constructor: (p) => web3_1.web3HelperFactory(p),
    },
    17: {
        name: "Unique",
        nonce: 0x11,
        decimals: 1e18,
        chainId: 8888,
        blockExplorerUrl: "CANT FIND",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.OPL,
    },
    18: {
        name: "Tezos",
        nonce: 0x12,
        decimals: 1e6,
        constructor: (p) => tezos_1.tezosHelperFactory(p),
        currency: domain_1.SupportedCurrency.XTZ,
        blockExplorerUrl: "https://tezblock.io/transaction",
    },
    19: {
        name: "Velas",
        blockExplorerUrl: "https://explorer.velas.com/tx",
        nonce: 0x13,
        decimals: 1e18,
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.VLX,
        chainId: 111,
    },
};
exports.Config = {
    exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
    nftListUri: "https://indexnft.herokuapp.com",
    nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
    txSocketUri: "https://sockettx.herokuapp.com",
    tronScanUri: "https://apilist.tronscan.org/api/",
    heartbeatUri: "https://xpheartbeat.herokuapp.com",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBRTVCLDJDQUErRTtBQUUvRSw0Q0FBNEM7QUFDNUMsSUFBWSxhQWlCWDtBQWpCRCxXQUFZLGFBQWE7SUFDdkIseURBQXdDLENBQUE7SUFDeEMsNERBQTJDLENBQUE7SUFDM0MsdUVBQXNELENBQUE7SUFDdEQsMEZBQXlFLENBQUE7SUFDekUseUVBQXdELENBQUE7SUFDeEQsNEVBQTJELENBQUE7SUFDM0QsK0RBQThDLENBQUE7SUFDOUMseURBQXdDLENBQUE7SUFDeEMsa0VBQWlELENBQUE7SUFDakQscURBQW9DLENBQUE7SUFDcEMsbURBQWtDLENBQUE7SUFDbEMsNERBQTJDLENBQUE7SUFDM0MseURBQXdDLENBQUE7SUFDeEMsaUVBQWdELENBQUE7SUFDaEQsaUJBQWlCO0lBQ2pCLGFBQWE7QUFDZixDQUFDLEVBakJXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBaUJ4QjtBQUVELElBQVksYUFnQlg7QUFoQkQsV0FBWSxhQUFhO0lBQ3ZCLHNEQUFxQyxDQUFBO0lBQ3JDLGtFQUFpRCxDQUFBO0lBQ2pELDBEQUF5QyxDQUFBO0lBQ3pDLDJGQUEwRSxDQUFBO0lBQzFFLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLGtEQUFpQyxDQUFBO0lBQ2pDLGtEQUFpQyxDQUFBO0lBQ2pDLGdEQUErQixDQUFBO0lBQy9CLG9EQUFtQyxDQUFBO0lBQ25DLG9EQUFtQyxDQUFBO0lBQ25DLDhDQUE2QixDQUFBO0lBQzdCLHdEQUF1QyxDQUFBO0lBQ3ZDLHFEQUFvQyxDQUFBO0lBQ3BDLGlCQUFpQjtBQUNuQixDQUFDLEVBaEJXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBZ0J4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