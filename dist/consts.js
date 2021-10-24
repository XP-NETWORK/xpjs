"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_INFO = exports.Chain = exports.RpcUri = void 0;
const elrond_1 = require("./helpers/elrond");
const tron_1 = require("./helpers/tron");
const web3_1 = require("./helpers/web3");
const domain_1 = require("crypto-exchange-rate/dist/model/domain");
// All the supported testnet uri's are here.
var RpcUri;
(function (RpcUri) {
    RpcUri["ELROND"] = "https://devnet-api.elrond.com";
    RpcUri["HECO"] = "https://http-testnet.hecochain.com";
    RpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
    RpcUri["ROPSTEN"] = "https://ropsten.infura.io/v3/182b3d3fb2d14d5fbe7421348624d1ce";
    RpcUri["AVALANCHE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    RpcUri["POLYGON"] = "https://matic-testnet-archive-rpc.bwarelabs.com";
    RpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
    RpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    RpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    RpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
})(RpcUri = exports.RpcUri || (exports.RpcUri = {}));
/**
 * An enum which represents the supported chains
 * Each field in the enum equals to the nonce of the chain.
 */
var Chain;
(function (Chain) {
    Chain[Chain["ELROND"] = 2] = "ELROND";
    Chain[Chain["HECO"] = 3] = "HECO";
    Chain[Chain["BSC"] = 4] = "BSC";
    Chain[Chain["ROPSTEN"] = 5] = "ROPSTEN";
    Chain[Chain["AVALANCE"] = 6] = "AVALANCE";
    Chain[Chain["POLYGON"] = 7] = "POLYGON";
    Chain[Chain["FANTOM"] = 8] = "FANTOM";
    Chain[Chain["TRON"] = 9] = "TRON";
    Chain[Chain["CELO"] = 11] = "CELO";
    Chain[Chain["HARMONY"] = 12] = "HARMONY";
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBcUU7QUFDckUseUNBQStEO0FBQy9ELHlDQUErRDtBQUMvRCxtRUFBMkU7QUFFM0UsNENBQTRDO0FBQzVDLElBQVksTUFXWDtBQVhELFdBQVksTUFBTTtJQUNoQixrREFBd0MsQ0FBQTtJQUN4QyxxREFBMkMsQ0FBQTtJQUMzQyxnRUFBc0QsQ0FBQTtJQUN0RCxtRkFBeUUsQ0FBQTtJQUN6RSxrRUFBd0QsQ0FBQTtJQUN4RCxxRUFBMkQsQ0FBQTtJQUMzRCx3REFBOEMsQ0FBQTtJQUM5QyxrREFBd0MsQ0FBQTtJQUN4QywyREFBaUQsQ0FBQTtJQUNqRCw4Q0FBb0MsQ0FBQTtBQUN0QyxDQUFDLEVBWFcsTUFBTSxHQUFOLGNBQU0sS0FBTixjQUFNLFFBV2pCO0FBQ0Q7OztHQUdHO0FBQ0gsSUFBWSxLQVdYO0FBWEQsV0FBWSxLQUFLO0lBQ2YscUNBQVUsQ0FBQTtJQUNWLGlDQUFRLENBQUE7SUFDUiwrQkFBTyxDQUFBO0lBQ1AsdUNBQVcsQ0FBQTtJQUNYLHlDQUFZLENBQUE7SUFDWix1Q0FBVyxDQUFBO0lBQ1gscUNBQVUsQ0FBQTtJQUNWLGlDQUFRLENBQUE7SUFDUixrQ0FBUyxDQUFBO0lBQ1Qsd0NBQVksQ0FBQTtBQUNkLENBQUMsRUFYVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFXaEI7QUFtQlksUUFBQSxVQUFVLEdBQWM7SUFDbkMsQ0FBQyxFQUFFO1FBQ0QsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQztRQUNSLFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyw0QkFBbUIsQ0FBQyxDQUFpQixDQUFDO1FBQzFELGdCQUFnQixFQUFFLGtEQUFrRDtRQUNwRSxRQUFRLEVBQUUsMEJBQWlCLENBQUMsSUFBSTtRQUNoQyxV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