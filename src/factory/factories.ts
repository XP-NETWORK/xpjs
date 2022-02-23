import { ChainParams } from ".";
//@ts-ignore
import TronWeb from "tronweb";
import { Chain, MainNetRpcUri, TestNetRpcUri } from "../consts";
import { ethers } from "ethers";
import { TezosToolkit } from "@taquito/taquito";

const EVM_VALIDATORS = [
  "0xffa74a26bf87a32992bb4be080467bb4a8019e00",
  "0x837b2eb764860b442c971f98f505e7c5f419edd7",
  "0x9671ce5a02eb53cf0f2cbd220b34e50c39c0bf23",
  "0x90e79cc7a06dbd227569920a8c4a625f630d77f4",
  "0xdc80905cafeda39cb19a566baeef52472848e82f",
  "0x77745cd585798e55938940e3d4dd0fd7cde7bdd6",
  "0xc2a29b4e9fa71e9033a52611544403241c56ac5e",
];

const EVM_TESTNET_VALIDATORS = [
  "0x50aCEC08ce70aa4f2a8ab2F45d8dCd1903ea4E14",
  "0xae87208a5204B6606d3AB177Be5fdf62267Cd499",
  "0x5002258315873AdCbdEF25a8E71C715A4f701dF5"
];

const middleware_uri = "https://notifier.xp.network";

export namespace ChainFactoryConfigs {
  export const TestNet: () => Partial<ChainParams> = () => ({
    elrondParams: {
      node_uri: TestNetRpcUri.ELROND,
      minter_address:
        "erd1qqqqqqqqqqqqqpgqzses02wme3gsx320dpja2p2kk3rckgcfksmsj8grdk",
      esdt_swap_address:
        "erd1qqqqqqqqqqqqqpgqwu3ulmuxppa2e537ajst468wplkxxsqyksms9az8at",
      esdt_nft: "XPNFT-aca910",
      esdt_swap: "WEGLD-f8dc4c",
      nonce: 2,
    },
    tronParams: {
      provider: new TronWeb({ fullHost: TestNetRpcUri.TRON }),
      middleware_uri,
      minter_addr: "41cecf8ffbed6433c1cae2fe196925109aebc726f2",
      erc721_addr: "41226a324faa855cf0e4774c682c9d772b72dd811e",
      validators: EVM_TESTNET_VALIDATORS,
      nonce: Chain.TRON,
    },
    avalancheParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.AVALANCHE),
      minter_addr: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
      erc721_addr: "0x42027aF22E36e839e138dc387F1b7428a85553Cc",
      erc1155Minter: "0x10E3EE8526Cc7610393E2f6e25dEee0bD38d057e",
      erc721Minter: "0x1F71E80E1E785dbDB34c69909C11b71bAd8D9802",
      nonce: Chain.AVALANCHE,
    },
    polygonParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.POLYGON),
      minter_addr: "0x1A9C0d370b6e93dFdbEA1145011Bc551bB1a2B60",
      erc721_addr: "0x5051679FEDf0D7F01Dc23e72674d0ED58de9be6a",
      erc1155Minter: "0x5D822bA2a0994434392A0f947C83310328CFB0DE",
      erc721Minter: "0x941972fa041F507eBb8CfD5d11C05Eb1a51f2E95",
      nonce: Chain.POLYGON,
    },
    fantomParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.FANTOM),
      minter_addr: "0x9a287810bA8F0564DaDd9F2Ea9B7B2459497416B",
      erc721_addr: "0x3F51015C76D7A64514E9B86D500bBFD44F95bdE9",
      erc1155Minter: "string",
      erc721Minter: "string",
      nonce: Chain.FANTOM,
    },
    bscParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BSC),
      minter_addr: "0xbde1262d472aDd62C495a601806c22d228c2d70d",
      erc721_addr: "0xD90e3e365C204CE22755fEfcbA0E221a2B8a17f6",
      erc1155Minter: "0xDF7a8f8452E367fA0562d67FEb90aD746b3DD99A",
      erc721Minter: "0x20929C60f0158A21521dFe695A3876871874C472",
      nonce: Chain.BSC,
    },
    celoParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.CELO),
      minter_addr: "0x9a287810bA8F0564DaDd9F2Ea9B7B2459497416B",
      erc721_addr: "0x3F51015C76D7A64514E9B86D500bBFD44F95bdE9",
      erc1155Minter: "string",
      erc721Minter: "string",
      nonce: Chain.CELO,
    },
    harmonyParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.HARMONY),
      minter_addr: "0xCbA56d441da86dEfe31d3AdDeEc2bA04f7e27d9e",
      erc721_addr: "0x0AA29baB4F811A9f3dcf6a0F9cAEa9bE18ECED78",
      erc1155Minter: "0xbED4a5b36fae07943589a0b34CC2Ec3a1c208E53",
      erc721Minter: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
      nonce: Chain.HARMONY,
    },
    ropstenParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ROPSTEN),
      minter_addr: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
      erc721_addr: "0x48B218C9f626F079b82f572E3c5B46251c40fc47",
      erc1155Minter: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
      erc721Minter: "0x42027aF22E36e839e138dc387F1b7428a85553Cc",
      nonce: Chain.ETHEREUM,
    },
    xDaiParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.XDAI),
      minter_addr: "0x9a287810bA8F0564DaDd9F2Ea9B7B2459497416B",
      erc721_addr: "0x3F51015C76D7A64514E9B86D500bBFD44F95bdE9",
      erc1155Minter: "string",
      erc721Minter: "string",
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
      erc721_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
      minter_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
      erc1155Minter: "string",
      erc721Minter: "string",
      middleware_uri,
    },
    tezosParams: {
      bridgeAddress: "KT1MRYxBimYh1PUt3LBhEAmvr7YMK2L7kqCL",
      middlewareUri: middleware_uri,
      Tezos: new TezosToolkit(TestNetRpcUri.TEZOS),
      xpnftAddress: "KT1F7THd96y39MYKkTXmLyWkDZQ3H6QgubLh",
      validators: [
        "tz1e4QByQTYQyj98cBiM42hejkMWB2Pg6iXg",
        "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
        "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
      ],
    },
    velasParams: {
      middleware_uri,
      erc721_addr: "0x80653c90614155633252d32698164DBbBC421782",
      minter_addr: "0x3F51015C76D7A64514E9B86D500bBFD44F95bdE9",
      erc1155Minter: "string",
      erc721Minter: "string",
      nonce: Chain.VELAS,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.VELAS),
    },
    iotexParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.IOTEX),
      minter_addr: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
      erc721_addr: "0x48B218C9f626F079b82f572E3c5B46251c40fc47",
      erc1155Minter: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
      erc721Minter: "0x42027aF22E36e839e138dc387F1b7428a85553Cc",
      nonce: Chain.IOTEX,
    },
  });

  export const MainNet: () => Partial<ChainParams> = () => ({
    elrondParams: {
      node_uri: MainNetRpcUri.ELROND,
      minter_address:
        "erd1qqqqqqqqqqqqqpgq3y98dyjdp72lwzvd35yt4f9ua2a3n70v0drsfycvu8",
      esdt_swap_address:
        "erd1qqqqqqqqqqqqqpgq5vuvac70kn36yk4rvf9scr6p8tlu23220drsfgszfy",
      esdt_nft: "XPNFT-cb7482",
      esdt_swap: "WEGLD-5f1f8d",
      nonce: Chain.ELROND,
    },
    tronParams: {
      provider: new TronWeb({ fullHost: MainNetRpcUri.TRON }),
      middleware_uri,
      minter_addr: "TMx1nCzbK7tbBinLh29CewahpbR1k64c8E",
      erc721_addr: "TRON",
      nonce: Chain.TRON,
      validators: EVM_VALIDATORS,
    },
    avalancheParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AVALANCHE),
      erc721Minter: "0x9b2bACF4E69c81EF4EF42da84872aAC39ce7EC62",
      erc1155Minter: "0x7E8493F59274651Cc0919feCf12E6A77153cdA72",
      erc721_addr: "0x7bf2924985CAA6192D721B2B9e1109919aC6ff58",
      minter_addr: "0xC254a8D4eF5f825FD31561bDc69551ed2b8db134",
      nonce: Chain.AVALANCHE,
    },
    polygonParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.POLYGON),
      erc721Minter: "0x7E8493F59274651Cc0919feCf12E6A77153cdA72",
      erc1155Minter: "0x73E8deFC951D228828da35Ff8152f25c1e5226fa",
      erc721_addr: "0xC254a8D4eF5f825FD31561bDc69551ed2b8db134",
      minter_addr: "0x14CAB7829B03D075c4ae1aCF4f9156235ce99405",
      nonce: Chain.POLYGON,
    },
    fantomParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FANTOM),
      erc721Minter: "0xC81D46c6F2D59182c5A64FD5C372266c98985AdF",
      erc1155Minter: "0x146a99Ff19ece88EC87f5be03085cA6CD3163E15",
      erc721_addr: "0xF5e792c1e8E626a4496D580b8c2b4d51bF80eFB7",
      minter_addr: "0xC0D56171C798F9508CF39B25f19826B699F16693",
      nonce: Chain.FANTOM,
    },
    bscParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.BSC),
      erc721Minter: "0xa66dA346C08dD77bfB7EE5E68C45010B6F2538ff",
      erc1155Minter: "0xF5e0c79CB0B7e7CF6Ad2F9779B01fe74F958964a",
      erc721_addr: "0x0cC5F00e673B0bcd1F780602CeC6553aec1A57F0",
      minter_addr: "0x0B7ED039DFF2b91Eb4746830EaDAE6A0436fC4CB",
      nonce: Chain.BSC,
    },
    celoParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CELO),
      minter_addr: "string",
      erc721_addr: "string",
      erc1155Minter: "string",
      erc721Minter: "string",
      nonce: Chain.CELO,
    },
    harmonyParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HARMONY),
      minter_addr: "0xCbA56d441da86dEfe31d3AdDeEc2bA04f7e27d9e",
      erc721_addr: "0x0AA29baB4F811A9f3dcf6a0F9cAEa9bE18ECED78",
      erc1155Minter: "0xbED4a5b36fae07943589a0b34CC2Ec3a1c208E53",
      erc721Minter: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
      nonce: Chain.HARMONY,
    },
    ropstenParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ETHEREUM),
      minter_addr: "0x1cC24128C04093d832D4b50609e182ed183E1688",
      erc721_addr: "0x32E8854DC2a5Fd7049DCF10ef2cb5f01300c7B47",
      erc1155Minter: "0xca8E2a118d7674080d71762a783b0729AadadD42",
      erc721Minter: "0xF547002799955812378137FA30C21039E69deF05",
      nonce: Chain.ETHEREUM,
    },
    xDaiParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.XDAI),
      erc721Minter: "0x82A7d50A0030935808dAF6e5f0f06645866fb7Bb",
      erc1155Minter: "0xFEeD85607C1fbc2f30EAc13281480ED6265e121E",
      erc721_addr: "0x1358844f14feEf4D99Bc218C9577d1c7e0Cb2E89",
      minter_addr: "0x81e1Fdad0658b69914801aBaDA7Aa0Abb31653E5",
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
      erc721Minter: "0xC81D46c6F2D59182c5A64FD5C372266c98985AdF",
      erc1155Minter: "0x146a99Ff19ece88EC87f5be03085cA6CD3163E15",
      erc721_addr: "0xF5e792c1e8E626a4496D580b8c2b4d51bF80eFB7",
      minter_addr: "0xC0D56171C798F9508CF39B25f19826B699F16693",
      nonce: Chain.FUSE,
    },
    tezosParams: {
      bridgeAddress: "KT1B2zBPLVe51oXeuBJ8c7p2vHhi37jGxGHR",
      middlewareUri: middleware_uri,
      Tezos: new TezosToolkit(MainNetRpcUri.TEZOS),
      xpnftAddress: "KT1FxthB8GQvT7HnuczSp1qJk4w7dR5umKrx",
      validators: [
        "tz1bxXSUcu1PqceWBw1zwc4zMRQuSLpbQ5VX",
        "tz1VBF2LXnnnqKqKmTQqdESGx91kVLKyZMv4",
        "tz1hMBJzUouzXYRk3mpdVi2QHY2gP594Kk2G",
      ],
    },
    velasParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.VELAS),
      erc721Minter: "0x3F888c0Ee72943a3Fb1c169684A9d1e8DEB9f537",
      erc1155Minter: "0x0cC5F00e673B0bcd1F780602CeC6553aec1A57F0",
      erc721_addr: "0x9e5761f7A1360E8B3E9d30Ed9dd3161E8b75d4E8",
      minter_addr: "0x40d8160A0Df3D9aad75b9208070CFFa9387bc051",
      nonce: Chain.VELAS,
    },
    iotexParams: {
      middleware_uri,
      provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.IOTEX),
      minter_addr: "0x0E99a77fedf8D1Eb783078D1Aa84160a5CBE96D7",
      erc721_addr: "0xF03d628aD8Ae53919A3E65A0cB85dD8765963C56",
      erc721Minter: "0xD87755CCeaab0edb28b3f0CD7D6405E1bB827B65",
      erc1155Minter: "0x81e1Fdad0658b69914801aBaDA7Aa0Abb31653E5",
      nonce: Chain.IOTEX,
    },
  });
}
