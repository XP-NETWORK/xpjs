"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.Chain = exports.MainNetRpcUri = exports.TestNetRpcUri = void 0;
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
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBcUU7QUFDckUseUNBQStEO0FBQy9ELHlDQUErRDtBQUMvRCxtRUFBMkU7QUFHM0UsNENBQTRDO0FBQzVDLElBQVksYUFZWDtBQVpELFdBQVksYUFBYTtJQUN2Qix5REFBd0MsQ0FBQTtJQUN4Qyw0REFBMkMsQ0FBQTtJQUMzQyx1RUFBc0QsQ0FBQTtJQUN0RCwwRkFBeUUsQ0FBQTtJQUN6RSx5RUFBd0QsQ0FBQTtJQUN4RCw0RUFBMkQsQ0FBQTtJQUMzRCwrREFBOEMsQ0FBQTtJQUM5Qyx5REFBd0MsQ0FBQTtJQUN4QyxrRUFBaUQsQ0FBQTtJQUNqRCxxREFBb0MsQ0FBQTtJQUNwQyxtREFBa0MsQ0FBQTtBQUNwQyxDQUFDLEVBWlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFZeEI7QUFFRCxJQUFZLGFBWVg7QUFaRCxXQUFZLGFBQWE7SUFDdkIsc0RBQXFDLENBQUE7SUFDckMsa0VBQWlELENBQUE7SUFDakQsMERBQXlDLENBQUE7SUFDekMsMkZBQTBFLENBQUE7SUFDMUUsb0VBQW1ELENBQUE7SUFDbkQsOERBQTZDLENBQUE7SUFDN0Msa0RBQWlDLENBQUE7SUFDakMsa0RBQWlDLENBQUE7SUFDakMsZ0RBQStCLENBQUE7SUFDL0Isb0RBQW1DLENBQUE7SUFDbkMsb0RBQW1DLENBQUE7QUFDckMsQ0FBQyxFQVpXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBWXhCO0FBT0QsSUFBaUIsS0FBSyxDQVlyQjtBQVpELFdBQWlCLEtBQUs7SUFDUCxZQUFNLEdBQWdCLENBQUMsQ0FBQztJQUN4QixVQUFJLEdBQWMsQ0FBQyxDQUFDO0lBQ3BCLFNBQUcsR0FBYyxDQUFDLENBQUM7SUFDbkIsY0FBUSxHQUFjLENBQUMsQ0FBQztJQUN4QixlQUFTLEdBQWMsQ0FBQyxDQUFDO0lBQ3pCLGFB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