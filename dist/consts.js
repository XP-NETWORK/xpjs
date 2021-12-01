"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.CHAIN_INFO = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
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
    // TODO: Algorand
};
exports.Config = {
    exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
    txSocketUri: "https://sockettx.herokuapp.com",
    moralisServer: "https://azz9akudh6cf.usemoralis.com:2053/server",
    moralisAppId: "vt2JeuihhzyV9vgYbeAYO5BVSaCOdkAKr608XJOv",
    tronScanUri: "https://apilist.tronscan.org/api/",
    heartbeatUri: "https://xpheartbeat.herokuapp.com",
    moralisNetwork: "mainnet",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFJM0UsNENBQTRDO0FBQzVDLElBQVksYUFhWDtBQWJELFdBQVksYUFBYTtJQUN2Qix5REFBd0MsQ0FBQTtJQUN4Qyw0REFBMkMsQ0FBQTtJQUMzQyx1RUFBc0QsQ0FBQTtJQUN0RCwwRkFBeUUsQ0FBQTtJQUN6RSx5RUFBd0QsQ0FBQTtJQUN4RCw0RUFBMkQsQ0FBQTtJQUMzRCwrREFBOEMsQ0FBQTtJQUM5Qyx5REFBd0MsQ0FBQTtJQUN4QyxrRUFBaUQsQ0FBQTtJQUNqRCxxREFBb0MsQ0FBQTtJQUNwQyxtREFBa0MsQ0FBQTtJQUNsQyxpQkFBaUI7QUFDbkIsQ0FBQyxFQWJXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBYXhCO0FBRUQsSUFBWSxhQWFYO0FBYkQsV0FBWSxhQUFhO0lBQ3ZCLHNEQUFxQyxDQUFBO0lBQ3JDLGtFQUFpRCxDQUFBO0lBQ2pELDBEQUF5QyxDQUFBO0lBQ3pDLDJGQUEwRSxDQUFBO0lBQzFFLG9FQUFtRCxDQUFBO0lBQ25ELDhEQUE2QyxDQUFBO0lBQzdDLGtEQUFpQyxDQUFBO0lBQ2pDLGtEQUFpQyxDQUFBO0lBQ2pDLGdEQUErQixDQUFBO0lBQy9CLG9EQUFtQyxDQUFBO0lBQ25DLG9EQUFtQyxDQUFBO0lBQ25DLGlCQUFpQjtBQUNuQixDQUFDLEVBYlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFheEI7QUFTRCxJQUFpQixLQUFLLENBYXJCO0FBYkQsV0FBaUIsS0FBSztJQUNQLFlBQU0sR0FBZ0IsQ0FBQyxDQUFDO0lBQ3hCLFVBQUksR0FBYyxDQUFDLENBQUM7SUFDcEIsU0FBRyxHQUFjLENBQUMsQ0FBQztJQUNuQixjQUFRLEdBQWMsQ0FBQyxDQUFDO0lBQ3hCLGVB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