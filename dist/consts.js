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
    RpcUri["HECO"] = "https://http-testnet.hecochain.com";
    RpcUri["BSC"] = "https://data-seed-prebsc-1-s1.binance.org:8545";
    RpcUri["AVALANCE"] = "https://api.avax-test.network/ext/bc/C/rpc";
    RpcUri["POLYGON"] = "https://matic-testnet-archive-rpc.bwarelabs.com";
    RpcUri["FANTOM"] = "https://rpc.testnet.fantom.network/";
    RpcUri["TRON"] = "https://api.shasta.trongrid.io/";
    RpcUri["CELO"] = "https://alfajores-forno.celo-testnet.org";
    RpcUri["HARMONY"] = "https://api.s0.b.hmny.io";
})(RpcUri = exports.RpcUri || (exports.RpcUri = {}));
var Chain;
(function (Chain) {
    Chain[Chain["HECO"] = 3] = "HECO";
    Chain[Chain["BSC"] = 4] = "BSC";
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
        currency: domain_1.SupportedCurrency.CELO,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBcUU7QUFDckUseUNBQStEO0FBQy9ELHlDQUErRDtBQUMvRCxtRUFBMkU7QUFFM0UsNENBQTRDO0FBQzVDLElBQVksTUFTWDtBQVRELFdBQVksTUFBTTtJQUNoQixxREFBMkMsQ0FBQTtJQUMzQyxnRUFBc0QsQ0FBQTtJQUN0RCxpRUFBdUQsQ0FBQTtJQUN2RCxxRUFBMkQsQ0FBQTtJQUMzRCx3REFBOEMsQ0FBQTtJQUM5QyxrREFBd0MsQ0FBQTtJQUN4QywyREFBaUQsQ0FBQTtJQUNqRCw4Q0FBb0MsQ0FBQTtBQUN0QyxDQUFDLEVBVFcsTUFBTSxHQUFOLGNBQU0sS0FBTixjQUFNLFFBU2pCO0FBRUQsSUFBWSxLQVNYO0FBVEQsV0FBWSxLQUFLO0lBQ2YsaUNBQVEsQ0FBQTtJQUNSLCtCQUFPLENBQUE7SUFDUCx5Q0FBWSxDQUFBO0lBQ1osdUNBQVcsQ0FBQTtJQUNYLHFDQUFVLENBQUE7SUFDVixpQ0FBUSxDQUFBO0lBQ1Isa0NBQVMsQ0FBQTtJQUNULHdDQUFZLENBQUE7QUFDZCxDQUFDLEVBVFcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBU2hCO0FBa0JZLFFBQUEsVUFBVSxHQUFjO0lBQ25DLENBQUMsRUFBRTtRQUNELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUM7UUFDUixRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNEJBQW1CLENBQUMsQ0FBaUIsQ0FBQztRQUMxRCxnQkFBZ0IsRUFBRSxrREFBa0Q7UUFDcEUsUUFBUSxFQUFFLDBCQUFpQixDQUFDLElBQUk7S0FDakM7SUFDRCxDQUFDLEVBQUU7UUFDRCxJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxDQUFDO1FBQ1IsT0FBTyxFQUFFLEdBQUc7UUFDWixR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