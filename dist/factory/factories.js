"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactories = void 0;
const _1 = require(".");
//@ts-ignore
const tronweb_1 = __importDefault(require("tronweb"));
const consts_1 = require("../consts");
const ethers_1 = require("ethers");
const EVM_VALIDATORS = [
    "0xadFF46B0064a490c1258506d91e4325A277B22aE",
    "0xa50d8208B15F5e79A1ceABdB4a3ED1866CEB764c",
    "0xa3F99eF33eDA9E54DbA4c04a6133c0c507bA4352",
    // '0xAC415a404b5275EF9B3E1808870d8393eCa843Ec',
    // '0xca2e73418bEbe203c9E88407f68C216CdCd60b38',
    // '0x2523d5F7E74A885c720085713a71389845A8F0D2',
    // '0xEBAC44f9e63988112Eb4AfE8B8E03e179b6429A6'
];
const EVM_TESTNET_VALIDATORS = [
    "0x060093d5559dcF01aeD66042Ba33bf243ee422b6",
    "0xd067607e5D22BD8Fb806e07090FaE9A048a8Fc0d",
    "0xB331E65875EeF5979b83DdF8aFB05bC5E86bB78D",
    "0xB6C11DC232ab25BD61b3efc7a95C971ec002127C",
    "0x848AF71847407d27fD8DD3A099F43F59B617C26a",
    "0x54E68543464e0253C5A9e83471fc00aa9866d7bE",
    "0x4Cfc8800606EDBd970298bB040Fc8D859c806702",
];
var ChainFactories;
(function (ChainFactories) {
    ChainFactories.TestNetChainFactory = (moralis) => {
        return _1.ChainFactory(moralis, {
            elrondParams: {
                node_uri: consts_1.TestNetRpcUri.ELROND,
                minter_address: "erd1qqqqqqqqqqqqqpgq3cpmdjk5mwnvqqe7tswcwhdufsddjd4vk4as8qtp05",
                esdt_swap_address: "erd1qqqqqqqqqqqqqpgqsu5cn3h380l7cem86zfs6k904wnsa9hak4as942duy",
                esdt: "XPNET-acb2d0",
                esdt_nft: "XPNFT-1a124f",
                esdt_swap: "WEGLD-fdf787",
                validators: [
                    "erd1akrlykhmjl8ykhfukhykzdvcnyay5d0kvdazc82wwt7cvn83arzsgg7w9c",
                    "erd1dt2mttgf2xpdy9jlxlrd0fcr3nf4sly2tpmam0djq7jj65axvkyqv6hu20",
                    "erd1hd3afqqhunypqdz292qledsxwtjlnf9t60mftf4xq5tuyutnqntqg5dng4",
                    "erd14qgeqvr2lfnv7m3nzrmpzdzr5tecns50s82qndk2s84qhw3fg6vsfcaffa",
                    "erd16gztcqtjzr20ytrwm2wefylydfxhgv7a96kwppa5z3840x4rvavqeazy0v",
                    "erd19tydrsuwcpcnwku5p90xk3n82gxhmvz54s8fsvz6yhc4ugq67f4qaayrex",
                    "erd1575jxqnmt9q495xtmre0gmxpc9gjzrcx9ypw7gls5xg59k0m73ksgp0xfu",
                ],
                nonce: 2,
            },
            tronParams: {
                provider: new tronweb_1.default({ fullhost: consts_1.MainNetRpcUri.TRON }),
                middleware_uri: "string",
                erc1155_addr: "string",
                minter_addr: "string",
                erc721_addr: "string",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.TRON,
            },
            avalancheParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.AVALANCHE),
                minter_addr: "0x273c507D8E21cDE039491B14647Fe9278D88e91D",
                erc1155_addr: "0x04F75a27cE2FDC591C71a88f1EcaC7e5Ce44f5Fc",
                erc721_addr: "0xCC5Bc84C3FDbcF262AaDD9F76652D6784293dD9e",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.AVALANCHE,
            },
            polygonParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.POLYGON),
                minter_addr: "0xc6148C73f4beCbd7aE39ba23a9CeBa9518fF96BE",
                erc1155_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
                erc721_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.POLYGON,
            },
            fantomParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.FANTOM),
                minter_addr: "0x4Bd915C3e39cfF4eac842255965E79061c38cACD",
                erc1155_addr: "0xAAd4F7BB5FB661181D500829e60010043833a85B",
                erc721_addr: "0x72aC6A36de2f72BD39e9c782e9db0DCc41FEbfe2",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.FANTOM,
            },
            bscParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.ETHEREUM),
                minter_addr: "0x346cb8F9081CA561946E5F0f258e64dB7C075465",
                erc1155_addr: "0x434541d6aA0e8395d30e6E6Dd0A83680bc8Cd4B7",
                erc721_addr: "0x4BC19A536178cf7E8EE49206357f68c891752FA0",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.BSC,
            },
            celoParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.CELO),
                minter_addr: "0x00CAC06Dd0BB4103f8b62D280fE9BCEE8f26fD59",
                erc1155_addr: "0xAD2935E147b61175D5dc3A9e7bDa93B0975A43BA",
                erc721_addr: "0x06b3244b086cecC40F1e5A826f736Ded68068a0F",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.CELO,
            },
            harmonyParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.HARMONY),
                minter_addr: "0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C",
                erc1155_addr: "0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C",
                erc721_addr: "0xB82008565FdC7e44609fA118A4a681E92581e680",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.HARMONY,
            },
            ropstenParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.ETHEREUM),
                minter_addr: "0x8C03d5A667A03Ef2A56E78609E510B6cB33147AD",
                erc1155_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
                erc721_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
                validators: EVM_TESTNET_VALIDATORS,
                nonce: consts_1.Chain.ROPSTEN,
            },
        });
    };
    ChainFactories.MainNetChainFactory = (moralis) => {
        return _1.ChainFactory(moralis, {
            elrondParams: {
                node_uri: consts_1.MainNetRpcUri.ELROND,
                minter_address: "erd1qqqqqqqqqqqqqpgqe4hsht34ut085demqk2g2llcznankw84p7tqx5s9ce",
                esdt_swap_address: "erd1qqqqqqqqqqqqqpgqkkcsf8aky3vn057086cgnps768ann7nfp7tqxppx53",
                esdt: "XPNET-0e265d",
                esdt_nft: "XPNFT-9d19d5",
                esdt_swap: "WEGLD-6823c1",
                validators: [
                    "erd1lwyjz0adjd3vqpcjqs5rntw6sxzf9pvqussadygy2u76mz9ap7tquc0z5s",
                    "erd1tzc9qltpntlgnpetrz58llqsg93dnxety54umln0kuq2k6dajf6qk796wh",
                    "erd14aw3kvmepsffajkywp6autxxf7zy77uvnhy9e93wwz4qjkd88muquys007",
                    "erd1nj85l5qx2gn2euj4hnjzq464euwzh8fe6txkf046nttne7y3cl4qmndgya",
                    "erd1fl3mpjnrev7x5dz4un0hpzhvny4dlv4d2zt38yhqe37u9ulzx2aqeqr8sr",
                    "erd16kufez3g0tmxhyra2ysgpkqckurqe80ulxet8dfffm0t28tnavpstr0s93",
                    "erd1wua3q7zja2g08gyta4pkd4eax2r03c3edsz72dp90m3z69rk8yuqqnrg63",
                ],
                nonce: consts_1.Chain.ELROND,
            },
            tronParams: {
                provider: new tronweb_1.default({ fullHost: consts_1.TestNetRpcUri.TRON }),
                middleware_uri: "string",
                erc1155_addr: "string",
                minter_addr: "string",
                erc721_addr: "string",
                nonce: consts_1.Chain.TRON,
                validators: [""],
            },
            avalancheParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.AVALANCHE),
                minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
                erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
                erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.AVALANCHE,
            },
            polygonParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.POLYGON),
                minter_addr: "0x2f072879411503580B8974A221bf76638C50a82a",
                erc1155_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
                erc721_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.POLYGON,
            },
            fantomParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.FANTOM),
                minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
                erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
                erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.FANTOM,
            },
            bscParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.BSC),
                minter_addr: "0xF8679A16858cB7d21b3aF6b2AA1d6818876D3741",
                erc1155_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
                erc721_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.BSC,
            },
            celoParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.CELO),
                minter_addr: "string",
                erc1155_addr: "string",
                erc721_addr: "string",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.CELO,
            },
            harmonyParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.HARMONY),
                minter_addr: "string",
                erc1155_addr: "string",
                erc721_addr: "string",
                validators: [],
                nonce: consts_1.Chain.HARMONY,
            },
            ropstenParams: {
                provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.ROPSTEN),
                minter_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
                erc1155_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
                erc721_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
                validators: EVM_VALIDATORS,
                nonce: consts_1.Chain.ROPSTEN,
            },
        });
    };
})(ChainFactories = exports.ChainFactories || (exports.ChainFactories = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZhY3RvcnkvZmFjdG9yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdCQUE0QztBQUM1QyxZQUFZO0FBQ1osc0RBQThCO0FBQzlCLHNDQUFnRTtBQUNoRSxtQ0FBZ0M7QUFFaEMsTUFBTSxjQUFjLEdBQUc7SUFDckIsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsZ0RBQWdEO0lBQ2hELGdEQUFnRDtJQUNoRCxnREFBZ0Q7SUFDaEQsK0NBQStDO0NBQ2hELENBQUM7QUFFRixNQUFNLHNCQUFzQixHQUFHO0lBQzdCLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztDQUM3QyxDQUFDO0FBRUYsSUFBaUIsY0FBYyxDQW9MOUI7QUFwTEQsV0FBaUIsY0FBYztJQUNoQixrQ0FBbUIsR0FBRyxDQUFDLE9BQWtCLEVBQUUsRUFBRTtRQUN4RCxPQUFPLGVBQVksQ0FBQyxPQUFPLEVBQUU7WUFDM0IsWUFBWSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxzQkFBYSxDQUFDLE1BQU07Z0JBQzlCLGNBQWMsRUFDWixnRUFBZ0U7Z0JBQ2xFLGlCQUFpQixFQUNmLGdFQUFnRTtnQkFDbEUsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixTQUFTLEVBQUUsY0FBYztnQkFDekIsVUFBVSxFQUFFO29CQUNWLGdFQUFnRTtvQkFDaEUsZ0VBQWdFO29CQUNoRSxnRUFBZ0U7b0JBQ2hFLGdFQUFnRTtvQkFDaEUsZ0VBQWdFO29CQUNoRSxnRUFBZ0U7b0JBQ2hFLGdFQUFnRTtpQkFDakU7Z0JBQ0QsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNELFVBQVUsRUFBRTtnQkFDVixRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFD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