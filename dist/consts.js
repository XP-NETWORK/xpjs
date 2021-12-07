"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.CHAIN_INFO = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
const algorand_1 = require("./helpers/algorand");
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
    // TODO: Algorand
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
})(Chain = exports.Chain || (exports.Chain = {}));
exports.CHAIN_INFO = {
    2: {
        name: "Elrond",
        nonce: 2,
        decimals: 1e18,
        constructor: (p) => elrond_1.elrondHelperFactory(p),
        blockExplorerUrl: "https://devnet-explorer.elrond.com/transactions/",
        currency: domain_1.SupportedCurrency.EGLD,
        validators: [
            "erd1qqqqqqqqqqqqqpgqx8dhqmvpnm4f0ylhazn7elwrx7gvmwnnk4asyp83t6",
        ],
    },
    3: {
        name: "Heco",
        nonce: 3,
        chainId: 256,
        decimals: 1e18,
        blockExplorerUrl: "https://testnet.hecoinfo.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.HT,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    4: {
        name: "BSC",
        nonce: 4,
        chainId: 97,
        decimals: 1e18,
        blockExplorerUrl: "https://testnet.bscscan.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.BNB,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    5: {
        name: "Ropsten",
        nonce: 5,
        currency: domain_1.SupportedCurrency.ETH,
        chainId: 3,
        decimals: 1e18,
        blockExplorerUrl: "https://ropsten.etherscan.io/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    6: {
        name: "Avalanche",
        nonce: 6,
        chainId: 43113,
        decimals: 1e18,
        blockExplorerUrl: "https://cchain.explorer.avax-test.network/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.AVAX,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    7: {
        name: "Polygon",
        nonce: 0x7,
        chainId: 80001,
        decimals: 1e18,
        blockExplorerUrl: "https://mumbai.polygonscan.com/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.MATIC,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    8: {
        name: "Fantom",
        nonce: 0x8,
        decimals: 1e18,
        chainId: 4002,
        blockExplorerUrl: "https://explorer.testnet.fantom.network/transactions",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.FTM,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    9: {
        name: "Tron",
        nonce: 0x9,
        decimals: 1e6,
        blockExplorerUrl: "https://shasta.tronscan.org/#/transaction",
        constructor: (p) => tron_1.tronHelperFactory(p),
        currency: domain_1.SupportedCurrency.TRX,
        validators: ["TDESCaeTLQwvXv1GDz9Q1AKDMAmDk4AF6x"],
    },
    11: {
        name: "Celo",
        nonce: 0xb,
        decimals: 1e18,
        chainId: 44787,
        blockExplorerUrl: "https://alfajores-blockscout.celo-testnet.org/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.CELO,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    12: {
        name: "Harmony",
        nonce: 0xc,
        decimals: 1e18,
        chainId: 1666700000,
        blockExplorerUrl: "https://explorer.pops.one/tx",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.CELO,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    // 13: {
    //   name: "Ontology",
    //   nonce: 0xd,
    //   decimals: 1e18,
    //   chainId: 1666700000,
    //   blockExplorerUrl: "https://explorer.pops.one/tx",
    //   constructor: (p) => web3HelperFactory(p as Web3Params),
    //   currency: SupportedCurrency.CELO,
    //   validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    // },
    14: {
        name: "xDai",
        nonce: 0xe,
        decimals: 1e18,
        chainId: 0x64,
        blockExplorerUrl: "https://blockscout.com/xdai/mainnet/",
        constructor: (p) => web3_1.web3HelperFactory(p),
        currency: domain_1.SupportedCurrency.STAKE,
        validators: ["0x0F7F9b1675174e5F62CE85D640A5c064BcdFf76c"],
    },
    15: {
        name: "Algorand",
        nonce: 0xf,
        decimals: 1e6,
        chainId: undefined,
        blockExplorerUrl: "https://algoexplorer.io/tx",
        currency: domain_1.SupportedCurrency.ALGO,
        validators: ["BO4OK76FDVM4YUXLY4YPWBV4HDA6DBVS5RDDCGRNEXBQ2YQTCZPUBWY5Z4"],
        constructor: (p) => Promise.resolve(algorand_1.algorandHelper(p)),
    },
};
exports.Config = {
    exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
    nftListUri: "https://nftindexing.herokuapp.com",
    nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjI2ODQzNTQ1NSwiaWF0IjoxNjM4MTg3MTk5LCJleHAiOjE2Mzg3OTE5OTl9.aKs8K2V8K_rWqQPshae1EzuAEpPMVWBZakfmyBeeq-nJuiEKb1KBSle1F8LNemXLW_3_4KFwDjZrNOx0zA_GNw",
    txSocketUri: "https://sockettx.herokuapp.com",
    tronScanUri: "https://apilist.tronscan.org/api/",
    heartbeatUri: "https://xpheartbeat.herokuapp.com",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBRzVCLDRDQUE0QztBQUM1QyxJQUFZLGFBYVg7QUFiRCxXQUFZLGFBQWE7SUFDdkIseURBQXdDLENBQUE7SUFDeEMsNERBQTJDLENBQUE7SUFDM0MsdUVBQXNELENBQUE7SUFDdEQsMEZBQXlFLENBQUE7SUFDekUseUVBQXdELENBQUE7SUFDeEQsNEVBQTJELENBQUE7SUFDM0QsK0RBQThDLENBQUE7SUFDOUMseURBQXdDLENBQUE7SUFDeEMsa0VBQWlELENBQUE7SUFDakQscURBQW9DLENBQUE7SUFDcEMsbURBQWtDLENBQUE7SUFDbEMsaUJBQWlCO0FBQ25CLENBQUMsRUFiVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQWF4QjtBQUVELElBQVksYUFhWDtBQWJELFdBQVksYUFBYTtJQUN2QixzREFBcUMsQ0FBQTtJQUNyQyxrRUFBaUQsQ0FBQTtJQUNqRCwwREFBeUMsQ0FBQTtJQUN6QywyRkFBMEUsQ0FBQTtJQUMxRSxvRUFBbUQsQ0FBQTtJQUNuRCw4REFBNkMsQ0FBQTtJQUM3QyxrREFBaUMsQ0FBQTtJQUNqQyxrREFBaUMsQ0FBQTtJQUNqQyxnREFBK0IsQ0FBQTtJQUMvQixvREFBbUMsQ0FBQTtJQUNuQyxvREFBbUMsQ0FBQTtJQUNuQyxpQkFBaUI7QUFDbkIsQ0FBQyxFQWJXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBYXhCO0FBU0QsSUFBaUIsS0FBSyxDQWFyQjtBQWJELFdBQWlCLEtBQUs7SUFDUCxZQUFNLEdBQWdCLENBQUMsQ0FBQztJQUN4QixVQUFJLEdBQWMsQ0FBQyxDQUFDO0lBQ3BCLFNBQUcsR0FBYyxDQUFDLENBQUM7SUFDbkIsY0FBUSxHQUFjLENBQUMs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