import { AppConfig, ChainFactory } from ".";
//@ts-ignore
import TronWeb from "tronweb";
import { Chain, MainNetRpcUri, TestNetRpcUri } from "../consts";
import { ethers } from "ethers";

const EVM_VALIDATORS = [
  "0xadFF46B0064a490c1258506d91e4325A277B22aE",
  "0xa50d8208B15F5e79A1ceABdB4a3ED1866CEB764c",
  "0xa3F99eF33eDA9E54DbA4c04a6133c0c507bA4352",
  // '0xAC415a404b5275EF9B3E1808870d8393eCa843Ec',
  // '0xca2e73418bEbe203c9E88407f68C216CdCd60b38',
  // '0x2523d5F7E74A885c720085713a71389845A8F0D2',
  // '0xEBAC44f9e63988112Eb4AfE8B8E03e179b6429A6'
];

export namespace ChainFactories {
  export const TestNetChainFactory = (moralis: AppConfig) => {
    return ChainFactory(moralis, {
      elrondParams: {
        node_uri: "https://devnet-api.elrond.com",
        minter_address:
          "erd1qqqqqqqqqqqqqpgq3cpmdjk5mwnvqqe7tswcwhdufsddjd4vk4as8qtp05",
        esdt_swap_address:
          "erd1qqqqqqqqqqqqqpgqsu5cn3h380l7cem86zfs6k904wnsa9hak4as942duy",
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
        provider: new TronWeb({fullhost: MainNetRpcUri.TRON}),
        middleware_uri: "string",
        erc1155_addr: "string",
        minter_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.TRON,
      },
      avalancheParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AVALANCHE),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.AVALANCHE,
      },
      polygonParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.POLYGON),
        minter_addr: "0xc6148C73f4beCbd7aE39ba23a9CeBa9518fF96BE",
        erc1155_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
        erc721_addr: "0xAE25CF0d6D8d7c420768Ed179Ef01cf80c3708B1",
        validators: [
          "0x060093d5559dcF01aeD66042Ba33bf243ee422b6",
          "0xd067607e5D22BD8Fb806e07090FaE9A048a8Fc0d",
          "0xB331E65875EeF5979b83DdF8aFB05bC5E86bB78D",
          "0xB6C11DC232ab25BD61b3efc7a95C971ec002127C",
          "0x848AF71847407d27fD8DD3A099F43F59B617C26a",
          "0x54E68543464e0253C5A9e83471fc00aa9866d7bE",
          "0x4Cfc8800606EDBd970298bB040Fc8D859c806702",
        ],
        nonce: Chain.POLYGON,
      },
      fantomParams: {
        provider:new ethers.providers.JsonRpcProvider(MainNetRpcUri.FANTOM),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.FANTOM,
      },
      bscParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ETHEREUM),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.BSC,
      },
      celoParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CELO),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.CELO,
      },
      harmonyParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HARMONY),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: ["string[]"],
        nonce: Chain.HARMONY,
      },
      ropstenParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ETHEREUM),
        minter_addr: "0x8C03d5A667A03Ef2A56E78609E510B6cB33147AD",
        erc1155_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
        erc721_addr: "0xe909b9b7667121d774133bcd4C1b6f3693239bc4",
        validators: [
          "0x060093d5559dcF01aeD66042Ba33bf243ee422b6",
          "0xd067607e5D22BD8Fb806e07090FaE9A048a8Fc0d",
          "0xB331E65875EeF5979b83DdF8aFB05bC5E86bB78D",
          "0xB6C11DC232ab25BD61b3efc7a95C971ec002127C",
          "0x848AF71847407d27fD8DD3A099F43F59B617C26a",
          "0x54E68543464e0253C5A9e83471fc00aa9866d7bE",
          "0x4Cfc8800606EDBd970298bB040Fc8D859c806702",
        ],
        nonce: Chain.ROPSTEN,
      },
    });
  };

  export const MainNetChainFactory = (moralis: AppConfig) => {
    return ChainFactory(moralis,{
      elrondParams: {
        node_uri: "https://elrondnode.xp.network/proxy/",
        minter_address:
          "erd1qqqqqqqqqqqqqpgqe4hsht34ut085demqk2g2llcznankw84p7tqx5s9ce",
        esdt_swap_address:
          "erd1qqqqqqqqqqqqqpgqkkcsf8aky3vn057086cgnps768ann7nfp7tqxppx53",
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
        nonce: Chain.ELROND,
      },
      tronParams: {
        provider: new TronWeb({ fullHost: TestNetRpcUri.TRON }),
        middleware_uri: "string",
        erc1155_addr: "string",
        minter_addr: "string",
        erc721_addr: "string",
        nonce: Chain.TRON,
        validators: [""],
      },
      avalancheParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.AVALANCHE),
        minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
        erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        validators: [""],
        nonce: Chain.AVALANCHE,
      },
      polygonParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.POLYGON),
        minter_addr: "0x2f072879411503580B8974A221bf76638C50a82a",
        erc1155_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
        erc721_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
        validators: EVM_VALIDATORS,
        nonce: Chain.POLYGON,
      },
      fantomParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.FANTOM),
        minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
        erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
        validators: EVM_VALIDATORS,
        nonce: Chain.FANTOM,
      },
      bscParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BSC),
        minter_addr: "0xF8679A16858cB7d21b3aF6b2AA1d6818876D3741",
        erc1155_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
        erc721_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
        validators: EVM_VALIDATORS,
        nonce: Chain.BSC,
      },
      celoParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.CELO),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: EVM_VALIDATORS,
        nonce: Chain.CELO,
      },
      harmonyParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.HARMONY),
        minter_addr: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        validators: [],
        nonce: Chain.HARMONY,
      },
      ropstenParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ROPSTEN),
        minter_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
        erc1155_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
        erc721_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
        validators: EVM_VALIDATORS,
        nonce: Chain.ROPSTEN,
      },
    });
  };
}
