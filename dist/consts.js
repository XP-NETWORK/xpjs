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
    TestNetRpcUri["IOTEX"] = "https://babel-api.testnet.iotex.io";
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
    MainNetRpcUri["HARMONY"] = "https://api.harmony.one";
    MainNetRpcUri["XDAI"] = "https://rpc.xdaichain.com/";
    MainNetRpcUri["FUSE"] = "https://rpc.fuse.io/";
    MainNetRpcUri["VELAS"] = "https://mainnet.velas.com/rpc";
    MainNetRpcUri["TEZOS"] = "https://mainnet.smartpy.io";
    MainNetRpcUri["IOTEX"] = "https://babel-api.mainnet.iotex.io";
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
    Chain.IOTEX = 0x14;
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
    20: {
        name: "IoTeX",
        blockExplorerUrl: "https://iotexscan.io/tx",
        nonce: 0x14,
        decimals: 1e18,
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.IOTX,
        chainId: 4689,
    },
};
exports.Config = {
    exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
    nftListUri: "https://indexnft.herokuapp.com",
    nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
    txSocketUri: "transaction-socket.xp.network",
    tronScanUri: "https://apilist.tronscan.org/api/",
    heartbeatUri: "https://xpheartbeat.herokuapp.com",
    wrappedNftPrefix: "https://nft.xp.network/w/",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBRTVCLDJDQUErRTtBQUUvRSw0Q0FBNEM7QUFDNUMsSUFBWSxhQWtCWDtBQWxCRCxXQUFZLGFBQWE7SUFDdkIseURBQXdDLENBQUE7SUFDeEMsNERBQTJDLENBQUE7SUFDM0MsdUVBQXNELENBQUE7SUFDdEQsMEZBQXlFLENBQUE7SUFDekUseUVBQXdELENBQUE7SUFDeEQsNEVBQTJELENBQUE7SUFDM0QsK0RBQThDLENBQUE7SUFDOUMseURBQXdDLENBQUE7SUFDeEMsa0VBQWlELENBQUE7SUFDakQscURBQW9DLENBQUE7SUFDcEMsbURBQWtDLENBQUE7SUFDbEMsNERBQTJDLENBQUE7SUFDM0MseURBQXdDLENBQUE7SUFDeEMsaUVBQWdELENBQUE7SUFDaEQsNkRBQTRDLENBQUE7SUFDNUMsaUJBQWlCO0lBQ2pCLGFBQWE7QUFDZixDQUFDLEVBbEJXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBa0J4QjtBQUVELElBQVksYUFpQlg7QUFqQkQsV0FBWSxhQUFhO0lBQ3ZCLHNEQUFxQyxDQUFBO0lBQ3JDLGtFQUFpRCxDQUFBO0lBQ2pELDBEQUF5QyxDQUFBO0lBQ3pDLDJGQUEwRSxDQUFBO0lBQzFFLG9FQUFtRCxDQUFBO0lBQ25ELG9EQUFtQyxDQUFBO0lBQ25DLGtEQUFpQyxDQUFBO0lBQ2pDLGtEQUFpQyxDQUFBO0lBQ2pDLGdEQUErQixDQUFBO0lBQy9CLG9EQUFtQyxDQUFBO0lBQ25DLG9EQUFtQyxDQUFBO0lBQ25DLDhDQUE2QixDQUFBO0lBQzdCLHdEQUF1QyxDQUFBO0lBQ3ZDLHFEQUFvQyxDQUFBO0lBQ3BDLDZEQUE0QyxDQUFBO0lBQzVDLGlCQUFpQjtBQUNuQixDQUFDLEVB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