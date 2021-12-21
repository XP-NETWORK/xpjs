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
    TestNetRpcUri["UNIQUE"] = "https://rpc-opal.unique.network/";
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
        currency: domain_1.SupportedCurrency.CELO,
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
};
exports.Config = {
    exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
    nftListUri: "https://indexnft.herokuapp.com",
    nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
    txSocketUri: "https://sockettx.herokuapp.com",
    tronScanUri: "https://apilist.tronscan.org/api/",
    heartbeatUri: "https://xpheartbeat.herokuapp.com",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FJMEI7QUFDMUIseUNBQTJFO0FBQzNFLHlDQUEyRTtBQUMzRSxtRUFBMkU7QUFDM0UsaURBSTRCO0FBRzVCLDRDQUE0QztBQUM1QyxJQUFZLGFBZVg7QUFmRCxXQUFZLGFBQWE7SUFDdkIseURBQXdDLENBQUE7SUFDeEMsNERBQTJDLENBQUE7SUFDM0MsdUVBQXNELENBQUE7SUFDdEQsMEZBQXlFLENBQUE7SUFDekUseUVBQXdELENBQUE7SUFDeEQsNEVBQTJELENBQUE7SUFDM0QsK0RBQThDLENBQUE7SUFDOUMseURBQXdDLENBQUE7SUFDeEMsa0VBQWlELENBQUE7SUFDakQscURBQW9DLENBQUE7SUFDcEMsbURBQWtDLENBQUE7SUFDbEMsNERBQTJDLENBQUE7SUFDM0MsaUJBQWlCO0lBQ2pCLGFBQWE7QUFDZixDQUFDLEVBZlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFleEI7QUFFRCxJQUFZLGFBY1g7QUFkRCxXQUFZLGFBQWE7SUFDdkIsc0RBQXFDLENBQUE7SUFDckMsa0VBQWlELENBQUE7SUFDakQsMERBQXlDLENBQUE7SUFDekMsMkZBQTBFLENBQUE7SUFDMUUsb0VBQW1ELENBQUE7SUFDbkQsOERBQTZDLENBQUE7SUFDN0Msa0RBQWlDLENBQUE7SUFDakMsa0RBQWlDLENBQUE7SUFDakMsZ0RBQStCLENBQUE7SUFDL0Isb0RBQW1DLENBQUE7SUFDbkMsb0RBQW1DLENBQUE7SUFDbkMsOENBQTZCLENBQUE7SUFDN0IsaUJBQWlCO0FBQ25CLENBQUMsRUFkVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQWN4QjtBQVNELElBQWlCLEtBQUssQ0FlckI7QUFmRCxXQUFpQixLQUFLO0lBQ1AsWUFBTSxHQUFnQixDQUFDLENBQUM7SUFDeEIsVUFBSSxHQUFjLENBQUMsQ0FBQztJ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