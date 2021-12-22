import { ChainParams } from ".";
//@ts-ignore
import TronWeb from "tronweb";
import { Chain, MainNetRpcUri, TestNetRpcUri } from "../consts";
import { ethers } from "ethers";
import { TezosToolkit } from "@taquito/taquito";

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

const middleware_uri = "https://notifierrest.herokuapp.com";

export namespace ChainFactoryConfigs {
  export const TestNet: () => Partial<ChainParams> = () => ({
    elrondParams: {
      node_uri: TestNetRpcUri.ELROND,
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
      provider: new TronWeb({ fullHost: TestNetRpcUri.TRON }),
      middleware_uri,
      erc1155_addr: "string",
      minter_addr: "string",
      erc721_addr: "string",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.TRON,
    },
    avalancheParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.AVALANCHE),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.AVALANCHE,
    },
    polygonParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.POLYGON),
      minter_addr: "0xeed0fF20D9B1bd398b709e0d0405AC2B697e6083",
      erc1155_addr: "0xFC58eB64D9257526cbA96C2Dda8Adc3d25Db770F",
      erc721_addr: "0xf6d7B49B239FdE7EBfa82793911B812f42C06f6A",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.POLYGON,
    },
    fantomParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.FANTOM),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.FANTOM,
    },
    bscParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BSC),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.BSC,
    },
    celoParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.CELO),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.CELO,
    },
    harmonyParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.HARMONY),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.HARMONY,
    },
    ropstenParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ROPSTEN),
      minter_addr: "0x4378A403B0122197EE6ae579bA37Ba392E8cf828",
      erc1155_addr: "0x5F6565049969902bC6709Fdb2a89E81F1dAeA204",
      erc721_addr: "0x2BA6Aa59933e54ce14aab8Fd4a061a8E66713423",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.ETHEREUM,
    },
    xDaiParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.XDAI),
      minter_addr: "0xB6F4Bd61aaD6EaEE8C4e5a5CF99A2fa1dd1E929a",
      erc1155_addr: "0xC26f32b14d64306E493476b411d29d8822a2B353",
      erc721_addr: "0xeE5519A1Fa69367539CFc16d6BfC2c1477f57d33",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.XDAI,
    },
    algorandParams: {
      algodApiKey:
        "e5b7d342b8a742be5e213540669b611bfd67465b754e7353eca8fd19b1efcffd",
      algodUri: "https://algorand-node.xp.network/",
      algoIndexer: "https://algoexplorerapi.io/idx2",
      nonce: Chain.ALGORAND,
      sendNftAppId: 458971166,
      algodPort: 443,
    },
    uniqueParams: {
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.UNIQUE),
      nonce: Chain.UNIQUE,
      erc1155_addr: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
      erc721_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
      minter_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
      validators: EVM_TESTNET_VALIDATORS,
      middleware_uri,
    },
    tezosParams: {
      bridgeAddress: "KT1MRYxBimYh1PUt3LBhEAmvr7YMK2L7kqCL",
      Tezos: new TezosToolkit(TestNetRpcUri.TEZOS),
      xpnftAddress: "KT1F7THd96y39MYKkTXmLyWkDZQ3H6QgubLh",
      validators: [
        "tz1e4QByQTYQyj98cBiM42hejkMWB2Pg6iXg",
        "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
        "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
      ],
    },
  });

  export const MainNet: () => Partial<ChainParams> = () => ({
    elrondParams: {
      node_uri: MainNetRpcUri.ELROND,
      minter_address:
        "erd1qqqqqqqqqqqqqpgq98ufyktqukxqw79f7n22sr3u6n05u7d7p7tqmzhv32",
      esdt_swap_address:
        "erd1qqqqqqqqqqqqqpgqgc9vfqcdqw0ucu602elf0lt4tysfmxpep7tqhrrr9x",
      esdt: "XPNET-738176",
      esdt_nft: "XPNFT-676422",
      esdt_swap: "WEGLD-071de0",
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
      provider: new TronWeb({ fullHost: MainNetRpcUri.TRON }),
      middleware_uri,
      erc1155_addr: "TSg3nSjuSuVf5vEk6f2WwM9Ph8bEaNNz9B",
      minter_addr: "TMx1nCzbK7tbBinLh29CewahpbR1k64c8E",
      erc721_addr: "TRON",
      nonce: Chain.TRON,
      validators: EVM_VALIDATORS,
    },
    avalancheParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AVALANCHE),
      minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
      erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
      erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
      validators: EVM_VALIDATORS,
      nonce: Chain.AVALANCHE,
    },
    polygonParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.POLYGON),
      minter_addr: "0x2f072879411503580B8974A221bf76638C50a82a",
      erc1155_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
      erc721_addr: "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
      validators: EVM_VALIDATORS,
      nonce: Chain.POLYGON,
    },
    fantomParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FANTOM),
      minter_addr: "0x5B916EFb0e7bc0d8DdBf2d6A9A7850FdAb1984C4",
      erc1155_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
      erc721_addr: "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
      validators: EVM_VALIDATORS,
      nonce: Chain.FANTOM,
    },
    bscParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.BSC),
      minter_addr: "0xF8679A16858cB7d21b3aF6b2AA1d6818876D3741",
      erc1155_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
      erc721_addr: "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
      validators: EVM_VALIDATORS,
      nonce: Chain.BSC,
    },
    celoParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CELO),
      minter_addr: "string",
      erc1155_addr: "string",
      erc721_addr: "string",
      validators: EVM_VALIDATORS,
      nonce: Chain.CELO,
    },
    harmonyParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HARMONY),
      minter_addr: "string",
      erc1155_addr: "string",
      erc721_addr: "string",
      validators: [],
      nonce: Chain.HARMONY,
    },
    ropstenParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ETHEREUM),
      minter_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
      erc1155_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
      erc721_addr: "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
      validators: EVM_VALIDATORS,
      nonce: Chain.ETHEREUM,
    },
    xDaiParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.XDAI),
      minter_addr: "0x14fb9d669d4ddf712f1c56Ba7C54FF82D9be6377",
      erc1155_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
      erc721_addr: "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
      validators: EVM_VALIDATORS,
      nonce: Chain.XDAI,
    },
    algorandParams: {
      algodApiKey:
        "e5b7d342b8a742be5e213540669b611bfd67465b754e7353eca8fd19b1efcffd",
      algodUri: "https://algorand-node.xp.network/",
      nonce: Chain.ALGORAND,
      sendNftAppId: 458971166,
      algodPort: 443,
    },
    fuseParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FUSE),
      minter_addr: "0xb4A252B3b24AF2cA83fcfdd6c7Fac04Ff9d45A7D",
      erc1155_addr: "0xAcE819D882CEEF314191DaD13D2Bf3731Df80988",
      erc721_addr: "0xE773Be36b35e7B58a9b23007057b5e2D4f6686a1",
      validators: EVM_VALIDATORS,
      nonce: Chain.FUSE,
    },
  });
}
