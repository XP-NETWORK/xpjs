"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactoryConfigs = void 0;
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
var ChainFactoryConfigs;
(function (ChainFactoryConfigs) {
    ChainFactoryConfigs.TestNet = () => ({
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
            provider: new tronweb_1.default({ fullHost: consts_1.TestNetRpcUri.TRON }),
            middleware_uri: "string",
            erc1155_addr: "string",
            minter_addr: "string",
            erc721_addr: "string",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.TRON,
        },
        avalancheParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.AVALANCHE),
            minter_addr: "0x273c507D8E21cDE039491B14647Fe9278D88e91D",
            erc1155_addr: "0x04F75a27cE2FDC591C71a88f1EcaC7e5Ce44f5Fc",
            erc721_addr: "0xCC5Bc84C3FDbcF262AaDD9F76652D6784293dD9e",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.AVALANCHE,
        },
        polygonParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.POLYGON),
            minter_addr: "0xc6148C73f4beCbd7aE39ba23a9CeBa9518fF96BE",
            erc1155_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
            erc721_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.POLYGON,
        },
        fantomParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.FANTOM),
            minter_addr: "0x4Bd915C3e39cfF4eac842255965E79061c38cACD",
            erc1155_addr: "0xAAd4F7BB5FB661181D500829e60010043833a85B",
            erc721_addr: "0x72aC6A36de2f72BD39e9c782e9db0DCc41FEbfe2",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.FANTOM,
        },
        bscParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.BSC),
            minter_addr: "0x346cb8F9081CA561946E5F0f258e64dB7C075465",
            erc1155_addr: "0x434541d6aA0e8395d30e6E6Dd0A83680bc8Cd4B7",
            erc721_addr: "0x4BC19A536178cf7E8EE49206357f68c891752FA0",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.BSC,
        },
        celoParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.CELO),
            minter_addr: "0x00CAC06Dd0BB4103f8b62D280fE9BCEE8f26fD59",
            erc1155_addr: "0xAD2935E147b61175D5dc3A9e7bDa93B0975A43BA",
            erc721_addr: "0x06b3244b086cecC40F1e5A826f736Ded68068a0F",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.CELO,
        },
        harmonyParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.HARMONY),
            minter_addr: "0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C",
            erc1155_addr: "0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C",
            erc721_addr: "0xB82008565FdC7e44609fA118A4a681E92581e680",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.HARMONY,
        },
        ropstenParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.ROPSTEN),
            minter_addr: "0x8C03d5A667A03Ef2A56E78609E510B6cB33147AD",
            erc1155_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
            erc721_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.ETHEREUM,
        },
        xDaiParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.TestNetRpcUri.XDAI),
            minter_addr: "string",
            erc1155_addr: "string",
            erc721_addr: "string",
            validators: EVM_TESTNET_VALIDATORS,
            nonce: consts_1.Chain.XDAI,
        },
    });
    ChainFactoryConfigs.MainNet = () => ({
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
            provider: new tronweb_1.default({ fullHost: consts_1.MainNetRpcUri.TRON }),
            middleware_uri: "string",
            erc1155_addr: "string",
            minter_addr: "string",
            erc721_addr: "string",
            nonce: consts_1.Chain.TRON,
            validators: [""],
        },
        avalancheParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.AVALANCHE),
            minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
            erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
            erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.AVALANCHE,
        },
        polygonParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.POLYGON),
            minter_addr: "0x2f072879411503580B8974A221bf76638C50a82a",
            erc1155_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
            erc721_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.POLYGON,
        },
        fantomParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.FANTOM),
            minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
            erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
            erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.FANTOM,
        },
        bscParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.BSC),
            minter_addr: "0xF8679A16858cB7d21b3aF6b2AA1d6818876D3741",
            erc1155_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
            erc721_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.BSC,
        },
        celoParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.CELO),
            minter_addr: "string",
            erc1155_addr: "string",
            erc721_addr: "string",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.CELO,
        },
        harmonyParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.HARMONY),
            minter_addr: "string",
            erc1155_addr: "string",
            erc721_addr: "string",
            validators: [],
            nonce: consts_1.Chain.HARMONY,
        },
        ropstenParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.ETHEREUM),
            minter_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
            erc1155_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
            erc721_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.ETHEREUM,
        },
        xDaiParams: {
            provider: new ethers_1.ethers.providers.JsonRpcProvider(consts_1.MainNetRpcUri.XDAI),
            minter_addr: "0xcE0066b1008237625dDDBE4a751827de037E53D2",
            erc1155_addr: "0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513",
            erc721_addr: "0xAdE429ba898c34722e722415D722A70a297cE3a2",
            validators: EVM_VALIDATORS,
            nonce: consts_1.Chain.XDAI,
        },
    });
})(ChainFactoryConfigs = exports.ChainFactoryConfigs || (exports.ChainFactoryConfigs = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZhY3RvcnkvZmFjdG9yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLFlBQVk7QUFDWixzREFBOEI7QUFDOUIsc0NBQWdFO0FBQ2hFLG1DQUFnQztBQUVoQyxNQUFNLGNBQWMsR0FBRztJQUNyQiw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1QyxnREFBZ0Q7SUFDaEQsZ0RBQWdEO0lBQ2hELGdEQUFnRDtJQUNoRCwrQ0FBK0M7Q0FDaEQsQ0FBQztBQUVGLE1BQU0sc0JBQXNCLEdBQUc7SUFDN0IsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0NBQzdDLENBQUM7QUFFRixJQUFpQixtQkFBbUIsQ0FnTW5DO0FBaE1ELFdBQWlCLG1CQUFtQjtJQUNyQiwyQkFBTyxHQUErQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELFlBQVksRUFBRTtZQUNaLFFBQVEsRUFBRSxzQkFBYSxDQUFDLE1BQU07WUFDOUIsY0FBYyxFQUNaLGdFQUFnRTtZQUNsRSxpQkFBaUIsRUFDZixnRUFBZ0U7WUFDbEUsSUFBSSxFQUFFLGNBQWM7WUFDcEIsUUFBUSxFQUFFLGNBQWM7WUFDeEIsU0FBUyxFQUFFLGNBQWM7WUFDekIsVUFBVSxFQUFFO2dCQUNWLGdFQUFnRTtnQkFDaEUsZ0VBQWdFO2dCQUNoRSxnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTtnQkFDaEUsZ0VBQWdFO2dCQUNoRSxnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTthQUNqRTtZQUNELEtBQUssRUFBRSxDQUFDO1NBQ1Q7UUFDRCxVQUFVLEVBQUU7WUFDVixRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkQsY0FBYyxFQUFFLFFBQVE7WUFDeEIsWUFBWSxFQUFFLFFBQVE7WUFDdEIsV0FBVyxFQUFFLFFBQVE7WUFDckIsV0FBVyxFQUFFLFFBQVE7WUFDckIsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxLQUFLLEVBQUUsY0FBSyxDQUFDLElBQUk7U0FDbEI7UUFDRCxlQUFlLEVBQUU7WUFDZixRQUFRLEVBQUUsSUFBSSxlQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxzQkFBYSxDQUFDLFNBQVMsQ0FBQztZQUN2RSxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFlBQVksRUFBRSw0Q0FBNEM7WUFDMUQsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxVQUFVLEVBQUUsc0JBQXNCO1lBQ2xDLEtBQUssRUFBRSxjQUFLLENBQUMsU0FBUztTQUN2QjtRQUNELGFBQWEsRUFBRTtZQUNiLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3JFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxzQkFBc0I7WUFDbEMsS0FBSyxFQUFFLGNBQUssQ0FBQyxPQUFPO1NBQ3JCO1FBQ0QsWUFBWSxFQUFFO1lBQ1osUUFBUSxFQUFFLElBQUksZUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsc0JBQWEsQ0FBQyxNQUFNLENBQUM7WUFDcEUsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxLQUFLLEVBQUUsY0FBSyxDQUFDLE1BQU07U0FDcEI7UUFDRCxTQUFTLEVBQUU7WUFDVCxRQUFRLEVBQUUsSUFBSSxlQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxzQkFBYSxDQUFDLEdBQUcsQ0FBQztZQUNqRSxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFlBQVksRUFBRSw0Q0FBNEM7WUFDMUQsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxVQUFVLEVBQUUsc0JBQXNCO1lBQ2xDLEtBQUssRUFBRSxjQUFLLENBQUMsR0FBRztTQUNqQjtRQUNELFVBQVUsRUFBRTtZQUNWLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2xFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxzQkFBc0I7WUFDbEMsS0FBSyxFQUFFLGNBQUssQ0FBQyxJQUFJO1NBQ2xCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsUUFBUSxFQUFFLElBQUksZUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsc0JBQWEsQ0FBQyxPQUFPLENBQUM7WUFDckUsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxLQUFLLEVBQUUsY0FBSyxDQUFDLE9BQU87U0FDckI7UUFDRCxhQUFhLEVBQUU7WUFDYixRQUFRLEVBQUUsSUFBSSxlQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxzQkFBYSxDQUFDLE9BQU8sQ0FBQztZQUNyRSxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFlBQVksRUFBRSw0Q0FBNEM7WUFDMUQsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxVQUFVLEVBQUUsc0JBQXNCO1lBQ2xDLEtBQUssRUFBRSxjQUFLLENBQUMsUUFBUTtTQUN0QjtRQUNELFVBQVUsRUFBRTtZQUNWLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2xFLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFlBQVksRUFBRSxRQUFRO1lBQ3RCLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFVBQVUsRUFBRSxzQkFBc0I7WUFDbEMsS0FBSyxFQUFFLGNBQUssQ0FBQyxJQUFJO1NBQ2xCO0tBQ0YsQ0FBQyxDQUFDO0lBRVUsMkJBQU8sR0FBK0IsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN4RCxZQUFZLEVBQUU7WUFDWixRQUFRLEVBQUUsc0JBQWEsQ0FBQyxNQUFNO1lBQzlCLGNBQWMsRUFDWixnRUFBZ0U7WUFDbEUsaUJBQWlCLEVBQ2YsZ0VBQWdFO1lBQ2xFLElBQUksRUFBRSxjQUFjO1lBQ3BCLFFBQVEsRUFBRSxjQUFjO1lBQ3hCLFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTtnQkFDaEUsZ0VBQWdFO2dCQUNoRSxnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTtnQkFDaEUsZ0VBQWdFO2dCQUNoRSxnRUFBZ0U7YUFDakU7WUFDRCxLQUFLLEVBQUUsY0FBSyxDQUFDLE1BQU07U0FDcEI7UUFDRCxVQUFVLEVBQUU7WUFDVixRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLHNCQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkQsY0FBYyxFQUFFLFFBQVE7WUFDeEIsWUFBWSxFQUFFLFFBQVE7WUFDdEIsV0FBVyxFQUFFLFFBQVE7WUFDckIsV0FBVyxFQUFFLFFBQVE7WUFDckIsS0FBSyxFQUFFLGNBQUssQ0FBQyxJQUFJO1lBQ2pCLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUNqQjtRQUNELGVBQWUsRUFBRTtZQUNmLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsU0FBUyxDQUFDO1lBQ3ZFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxjQUFjO1lBQzFCLEtBQUssRUFBRSxjQUFLLENBQUMsU0FBUztTQUN2QjtRQUNELGFBQWEsRUFBRTtZQUNiLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3JFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxjQUFjO1lBQzFCLEtBQUssRUFBRSxjQUFLLENBQUMsT0FBTztTQUNyQjtRQUNELFlBQVksRUFBRTtZQUNaLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsTUFBTSxDQUFDO1lBQ3BFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxjQUFjO1lBQzFCLEtBQUssRUFBRSxjQUFLLENBQUMsTUFBTTtTQUNwQjtRQUNELFNBQVMsRUFBRTtZQUNULFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsR0FBRyxDQUFDO1lBQ2pFLFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsWUFBWSxFQUFFLDRDQUE0QztZQUMxRCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFVBQVUsRUFBRSxjQUFjO1lBQzFCLEtBQUssRUFBRSxjQUFLLENBQUMsR0FBRztTQUNqQjtRQUNELFVBQVUsRUFBRTtZQUNWLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsSUFBSSxDQUFDO1lBQ2xFLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFlBQVksRUFBRSxRQUFRO1lBQ3RCLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFVBQVUsRUFBRSxjQUFjO1lBQzFCLEtBQUssRUFBRSxjQUFLLENBQUMsSUFBSTtTQUNsQjtRQUNELGFBQWEsRUFBRTtZQUNiLFFBQVEsRUFBRSxJQUFJLGVBQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLHNCQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3JFLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFlBQVksRUFBRSxRQUFRO1lBQ3RCLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsS0FBSyxFQUFFLGNBQUssQ0FBQyxPQUFPO1NBQ3JCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsUUFBUSxFQUFFLElBQUksZUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsc0JBQWEsQ0FBQyxRQUFRLENBQUM7WUFDdEUsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsVUFBVSxFQUFFLGNBQWM7WUFDMUIsS0FBSyxFQUFFLGNBQUssQ0FBQyxRQUFRO1NBQ3RCO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsUUFBUSxFQUFFLElBQUksZUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsc0JBQWEsQ0FBQyxJQUFJLENBQUM7WUFDbEUsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFdBQVcsRUFBRSw0Q0FBNEM7WUFDekQsVUFBVSxFQUFFLGNBQWM7WUFDMUIsS0FBSyxFQUFFLGNBQUssQ0FBQyxJQUFJO1NBQ2xCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxFQWhNZ0IsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFnTW5DIn0=