import { ChainParams } from ".";
//@ts-ignore
import TronWeb from "tronweb";
import { Chain, MainNetRpcUri, TestNetRpcUri } from "../consts";
import { ethers } from "ethers";
import { TezosToolkit } from "@taquito/taquito";
import { evNotifier } from "../services/notifier";
import { Driver, SimpleNet } from "@vechain/connex-driver";
import * as thor from "web3-providers-connex";
import { Framework } from "@vechain/connex-framework";
import { hethers } from "@hashgraph/hethers";
import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import TonWeb from "tonweb";
import { FeeMargins } from "../helpers/chain";
import { signatureService } from "../services/estimator";
import { whitelistedService } from "../services/whitelisted";
import { AppConfigs } from "..";
import { hederaService } from "../services/hederaApi";

/*const EVM_VALIDATORS = [
  "0xffa74a26bf87a32992bb4be080467bb4a8019e00",
  "0x837b2eb764860b442c971f98f505e7c5f419edd7",
  "0x9671ce5a02eb53cf0f2cbd220b34e50c39c0bf23",
  "0x90e79cc7a06dbd227569920a8c4a625f630d77f4",
  "0xdc80905cafeda39cb19a566baeef52472848e82f",
  "0x77745cd585798e55938940e3d4dd0fd7cde7bdd6",
  "0xc2a29b4e9fa71e9033a52611544403241c56ac5e",
];*/

// const _EVM_TESTNET_VALIDATORS = [
//   "0x50aCEC08ce70aa4f2a8ab2F45d8dCd1903ea4E14",
//   "0xae87208a5204B6606d3AB177Be5fdf62267Cd499",
//   "0x5002258315873AdCbdEF25a8E71C715A4f701dF5",
// ];

const middleware_uri = "https://notifier.xp.network";
const testnet_middleware_uri =
  "https://testnet-notifier.xp.network/notify-test/";

const signature_service_uri_staging = "https://tools.xp.network/fee-oracle";
const signature_service_uri_prod = "https://fee-validator.herokuapp.com";
const sig_testnet_uri = "https://testnet-notifier.xp.network/oracle/";
const sig = signatureService(sig_testnet_uri);
const signatureSvc_prod = signatureService(signature_service_uri_prod);
const signatureSvc_staging = signatureService(signature_service_uri_staging);

export namespace ChainFactoryConfigs {
  export const TestNet: () => Promise<Partial<ChainParams>> = async () => {
    const feeMargin = { min: 1, max: 5 };

    const notifier = evNotifier(testnet_middleware_uri);

    // VeChain related:
    const net = new SimpleNet(TestNetRpcUri.VECHAIN);
    const driver = await Driver.connect(net);
    const provider = thor.ethers.modifyProvider(
      new ethers.providers.Web3Provider(
        new thor.ConnexProvider({ connex: new Framework(driver) })
      )
    );

    return {
      elrondParams: {
        node_uri: TestNetRpcUri.ELROND,
        minter_address:
          "erd1qqqqqqqqqqqqqpgqy2nx5z4cpr90de4sga2v2yx62fph3lg8g6vskt0k2f",
        esdt_swap_address:
          "erd1qqqqqqqqqqqqqpgqc854pa9ruzgs5f8rdzzc02xgq8kqku3ng6vs59vmf8",
        esdt_nft: "XPNFT-af3fde",
        esdt_swap: "WEGLD-708f9b",
        notifier,
        nonce: 2,
        feeMargin,
      },
      casperParams: {
        network: "casper-test",
        rpc: TestNetRpcUri.CASPER,
        bridge:
          "hash-b98df19ef3a2b1d5330dcc7c98ffa7d1ee8f07e62f7bcdeb996cbc08bd9a9e80",
        xpnft:
          "hash-e1b2053806777e058ffa8566c47793ce403530a195953c9c1f063cf5fb05a396",
        umt: "hash-23ecf377ab0de596cbda5b6e1cdfd230bad2f8eee688d7b5902bd560ffd96b4e",
        notifier,
        feeMargin,
        sig,
      },
      tonParams: {
        tonweb: new TonWeb(
          new TonWeb.HttpProvider(TestNetRpcUri.TON, {
            apiKey:
              "abe8c1222f19b0891a9a35889d112dc88562093467db8dda39961eeacd50f9b1",
          })
        ),
        bridgeAddr: "kQBwUu-b4O6qDYq3iDRvsYUnTD6l3WCxLXkv0aH6ywAaPs3c",
        burnerAddr: "kQCbH9gGgqJzXuusUVajW_40brrl2fxTYqMkk6HUhJnIgOQA",
        xpnftAddr: "EQDji0YH-SNT-qi6o5dQQBLeWL0Xmm46fnqj34EYhOL34WDc",
        feeMargin,
        extraFees: new Map().set(Chain.ETHEREUM, "1"),
        notifier,
      },
      baseParams: {
        erc1155_addr: "0x97DBa947956d40D95C13bCcee2F5EaAd8558FF81",
        erc721_addr: "0xf33e51DccC7727F1ac62782de7811712420841a0",
        erc1155Minter: "0x9e80c0Cd4c8ac838263e114E4E565284BcEBF254",
        erc721Minter: "0x9539D4776B7D71B8D74e8d55E4a2b9397f30935f",
        feeMargin,
        notifier,
        noWhitelist: true,
        minter_addr: "0x0cD3bF4F57f370286E8984c1ca4CE8D1a4Fc9412",
        nonce: Chain.BASE,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BASE),
      },
      solanaParams: {
        xpnftAddr: "C7bw5dJZwhjWd6TZE3LnE2b1RLqWDiy9XRMA1rajPKQY",
        bridgeContractAddr: "FXaXLtmkuoJCJeX6BnLwQJWgT8cPdwuXN8BmmQzVvuRA",
        endpoint: TestNetRpcUri.SOLANA,
        notifier,
        feeMargin,
      },
      vechainParams: {
        notifier,

        feeMargin,
        nonce: Chain.VECHAIN,
        provider,
        minter_addr: "0x5142f6Cc88a9a91b4F6a1972Ce412d57245092A8",
        erc721_addr: "0x1cCF127eB11bD9bdbf2b4000dCef04c34C13850B",
        erc1155_addr: "0x1109b0CAB4C4e51aBA040a8A6d16273c305941F8",
        erc721Minter: "0x1E749e1580889334Bd61254fFab15c1B3ADe1Afd",
        erc1155Minter: "0xDA5e020bA795191ff97A5AF97631bACbdcD1354b",
      },
      tronParams: {
        provider: new TronWeb({ fullHost: TestNetRpcUri.TRON }),
        notifier,
        minter_addr: "TY46GA3GGdMtu9GMaaSPPSQtqq9CZAv5sK",
        erc721_addr: "TDhb2kyurMwoc1eMndKzqNebji1ap1DJC4",
        erc1155_addr: "TBeSKv5RSFLAi7SCD7hR64xuvP6N26oEqR",
        erc1155Minter: "TBeSKv5RSFLAi7SCD7hR64xuvP6N26oEqR",
        erc721Minter: "TMVDt5PP53eQro5hLafibv2xWzSSDSMyjy",
        validators: [
          "TJuG3kvmGBDxGyUPBbvKePUjbopLurtqSo",
          "TN9bHXEWditocT4Au15mgm7JM56XBnRCvm",
          "TRHLhivxVogGhtxKn6sC8UF2Fr3WBdaT8N",
        ],
        nonce: Chain.TRON,
        feeMargin,
      },
      caduceusParams: {
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.CADUCEUS),
        erc1155_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        erc721_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        erc1155Minter: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        erc721Minter: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
        minter_addr: "0x3fe9EfFa80625B8167B2F0d8cF5697F61D77e4a2",
        nonce: Chain.CADUCEUS,
      },
      zetaParams: {
        erc721Minter: "0xF2D5d1835b47CcBd538BABeEF49D44B29e162E2a",
        erc1155Minter: "0xF313e70ed3D0920e159869216b447e29d9666E84",
        erc1155_addr: "0xf66C7826ce154D4f190E5D9F81492E1b6064be1a",
        erc721_addr: "0x88B236a8bB82bC84e1074a9595538DF444a6F021",
        minter_addr: "0x62c2749D02DDF48FbE68222D82966fcE30120806",
        feeMargin,
        nonce: Chain.ZETA,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ZETA),
      },
      energiParams: {
        erc721Minter: "0x9aa2F5D64FF55465B0724d2c445bcEbbb71b6354",
        erc1155Minter: "0xcEA2C8C09Bb8D3cCAc0055559BEFd22711640083",
        erc1155_addr: "0x65A5E91BcaDCc218C04A8888019aC0BC09a75EA4",
        erc721_addr: "0x790c52dF90Df669452643beE8d2378eecC62091c",
        minter_addr: "0x5dbA6A6cFCA07d44bd29Ec52f4d323dF9912e3AF",
        feeMargin,
        nonce: Chain.ENERGI,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ENERGI),
      },
      findoraParams: {
        erc721Minter: "0x833A2efC56B3625829727bb9D15F70cd2971Cd84",
        erc1155Minter: "0x539daC37CF7d918fe93897D4C02277a220cE3a6e",
        erc1155_addr: "0xfba2Eb48b18d436B8884E2A0c791D936D0022587",
        erc721_addr: "0xa8b11D31D8083eD5Ef0261ef9ADcf867898E1b5a",
        minter_addr: "0xDb199384BA327126653Ab8AcAB1fB3D5d88E2Ee2",
        feeMargin,
        nonce: Chain.FINDORA,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.FINDORA),
      },
      avalancheParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.AVALANCHE),
        minter_addr: "0xDdF1f6B8Ae8cd26dBE7C4C3ed9ac8E6D8B3a4FdC",
        erc721_addr: "0xE1D8Df2e06797F22e7ce25c95A7ddccb926f8A1E",
        erc1155Minter: "0xfA9214AEe59a6631A400DC039808457524dE70A2",
        erc721Minter: "0x54Db938575DD089702822F191AEbB25C2Af7D1Ef",
        erc1155_addr: "0xfA9214AEe59a6631A400DC039808457524dE70A2",
        nonce: Chain.AVALANCHE,
        feeMargin,
      },
      polygonParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.POLYGON),
        minter_addr: "0x224f78681099D66ceEdf4E52ee62E5a98CCB4b9e",
        erc721_addr: "0xb678b13E41a47e46A4046a4D8315b32E0F34389c",
        erc1155Minter: "0x5A768f8dDC67ccCA1431879BcA28E93a6c7722bb",
        erc1155_addr: "0xc1D778Ce89154357471bA6c4C6E51f0e590FFe57",
        erc721Minter: "0x6516E2D3387A9CF4E5e868E7842D110c95A9f3B4",
        nonce: Chain.POLYGON,
        feeMargin,
      },
      dfinityParams: {
        agent: new HttpAgent({
          host: "https://ic0.app",
        }),
        bridgeContract: Principal.fromText("53bb2-rqaaa-aaaap-aa3vq-cai"),
        xpnftId: Principal.fromText("5ogqx-qyaaa-aaaap-aa3wa-cai"),
        umt: Principal.fromText("54aho-4iaaa-aaaap-aa3va-cai"),
        notifier,
        feeMargin,
        signatureSvc: signatureSvc_prod,
      },
      moonbeamParams: {
        nonce: Chain.MOONBEAM,
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.MOONBEAM),
        erc721Minter: "0x1F71E80E1E785dbDB34c69909C11b71bAd8D9802",
        erc1155Minter: "0x10E3EE8526Cc7610393E2f6e25dEee0bD38d057e",
        erc1155_addr: "0xd023739a76Df4cC6260A1Ba25e8BEbCe8389D60D",
        erc721_addr: "0x42027aF22E36e839e138dc387F1b7428a85553Cc",
        minter_addr: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
      },
      aptosParams: {
        rpcUrl: TestNetRpcUri.APTOS,
        bridge:
          "0x42ef1f5fcf8398a07c57d8320f510e82588bac408d820679918c0f87270e932e",
        xpnft: "XPNFT",
        notifier,
        feeMargin,
        nonce: Chain.APTOS,
        network: "testnet",
      },
      abeyChainParams: {
        nonce: Chain.ABEYCHAIN,
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ABEYCHAIN),
        erc721Minter: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
        erc1155Minter: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        erc1155_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        erc721_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        minter_addr: "0x3fe9EfFa80625B8167B2F0d8cF5697F61D77e4a2",
      },
      fantomParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.FANTOM),
        minter_addr: "0x8B6841976AbC28917eD950B2d80342186dC19D6f",
        erc721_addr: "0xDb199384BA327126653Ab8AcAB1fB3D5d88E2Ee2",
        erc1155Minter: "0xfba2Eb48b18d436B8884E2A0c791D936D0022587",
        erc1155_addr: "0xa8b11D31D8083eD5Ef0261ef9ADcf867898E1b5a",
        erc721Minter: "0x539daC37CF7d918fe93897D4C02277a220cE3a6e",
        nonce: Chain.FANTOM,
        feeMargin,
      },
      bscParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BSC),
        minter_addr: "0x3Dd26fFf61D2a79f5fB77100d6daDBF073F334E6",
        erc721_addr: "0x783eF7485DCF27a3Cf59F5A0A406eEe3f9b2AaeB",
        erc1155Minter: "0x5dA3b7431f4581a7d35aEc2f3429174DC0f2A2E1",
        erc721Minter: "0x97CD6fD6cbFfaa24f5c858843955C2601cc7F2b9",
        erc1155_addr: "0xb5278A4808e2345A3B9d08bAc8909A121aFaEBB3",
        nonce: Chain.BSC,
        feeMargin,
      },
      celoParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.CELO),
        minter_addr: "0x9a287810bA8F0564DaDd9F2Ea9B7B2459497416B",
        erc721_addr: "0x3F51015C76D7A64514E9B86D500bBFD44F95bdE9",
        erc1155_addr: "",
        erc1155Minter: "string",
        erc721Minter: "string",
        nonce: Chain.CELO,
        feeMargin,
      },
      harmonyParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.HARMONY),
        minter_addr: "0x198Cae9EE853e7b44E99c0b35Bddb451F83485d5",
        erc721_addr: "0x1280c5c11bF0aAaaEAeBc998893B42e08B26fD5A",
        erc1155Minter: "0xB546c2358A6e4b0B83192cCBB83CaE37FA572fe1",
        erc721Minter: "0xb036640d6f7cAfd338103dc60493250561Af2eBc",
        erc1155_addr: "0x44FCF0001A2B03260e4Bba44AF93a60C64cE79A2",
        nonce: Chain.HARMONY,
        feeMargin,
      },
      ropstenParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ROPSTEN),
        erc1155_addr: "0x46Df0d0Dd629d61BDFA567dE61912FDeD883A60d",
        erc721_addr: "0x33DC209D33AddF60cf90Dd4B10f9a198A1A93f63",
        erc1155Minter: "0xE90105827d04522e52AdfA6BF695730E5706C0C2",
        erc721Minter: "0x90d38996B210D45bDF2FD54d091C6061dff0dA9F",
        minter_addr: "0x04a5f9158829Cae5a0a549954AdEaBD47BbB3d2d",
        nonce: Chain.ETHEREUM,
        feeMargin,
      },
      okcParams: {
        erc721Minter: "0xaB9eD7b9734471249255B4d969B32995015116d9",
        erc1155Minter: "0x48B218C9f626F079b82f572E3c5B46251c40fc47",
        erc1155_addr: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
        erc721_addr: "0xbED4a5b36fae07943589a0b34CC2Ec3a1c208E53",
        minter_addr: "0x7cB14C4aB12741B5ab185C6eAFb5Eb7b5282A032",
        feeMargin,
        nonce: Chain.OKC,
        notifier,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.OKC),
      },
      arbitrumParams: {
        erc721Minter: "0x10E3EE8526Cc7610393E2f6e25dEee0bD38d057e",
        erc1155Minter: "0xd023739a76Df4cC6260A1Ba25e8BEbCe8389D60D",
        erc1155_addr: "0x42027aF22E36e839e138dc387F1b7428a85553Cc",
        erc721_addr: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
        minter_addr: "0xaB9eD7b9734471249255B4d969B32995015116d9",
        feeMargin,
        nonce: Chain.ARBITRUM,
        notifier,

        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.ARBITRUM),
      },
      bitgertParams: {
        erc721Minter: "0xf185759aDb97977b419e3bc25b14E751c93865e",
        erc1155Minter: "0xb0801bffD146c21EF91E86625756aAa7f74aDB3a",
        erc1155_addr: "0x7b7Bb6ba1796f2C766cFae6A2C60463766615c69",
        erc721_addr: "0x56E5298Ba72125DbF8180b199f74aC2B51d31Deb",
        minter_addr: "0x39d4F26213245D33f506ECA1ce68D08dCF4d8d14",
        feeMargin,
        nonce: Chain.BITGERT,
        notifier,

        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.BITGERT),
      },

      xDaiParams: {
        notifier,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.XDAI),
        minter_addr: "0x90d38996B210D45bDF2FD54d091C6061dff0dA9F",
        erc721_addr: "0x0e02b55e1D0ec9023A04f1278F39685B53739010",
        erc1155Minter: "0x0AA29baB4F811A9f3dcf6a0F9cAEa9bE18ECED78",
        erc721Minter: "0x7cB14C4aB12741B5ab185C6eAFb5Eb7b5282A032",
        erc1155_addr: "0x1C6d7aa611B30C9C1e5f52068E145b77b0e661b2",
        nonce: Chain.XDAI,
        noWhitelist: true,
        feeMargin,
      },
      algorandParams: {
        algodApiKey:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        indexerUri: "https://algoindexer.testnet.algoexplorerapi.io",
        algodUri: "https://node.testnet.algoexplorerapi.io",
        nonce: Chain.ALGORAND,
        sendNftAppId: 83148194,
        sendNftAppAddress:
          "IWWZVASJCPHOXCGQFOI3CTEVYGWTMUDD2PTMMGS3TLQNKNFUHTU4W56ZDQ",
        algodPort: 443,
        notifier,
        feeMargin,
      },
      auroraParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.AURORA),
        erc721_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        minter_addr: "0x3fe9EfFa80625B8167B2F0d8cF5697F61D77e4a2",
        erc1155Minter: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        erc1155_addr: "",
        erc721Minter: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
        nonce: Chain.AURORA,
        feeMargin,
      },
      uniqueParams: {
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.UNIQUE),
        nonce: Chain.UNIQUE,
        erc721_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        erc1155_addr: "",
        minter_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        erc1155Minter: "string",
        erc721Minter: "string",
        notifier,

        feeMargin,
      },
      tezosParams: {
        bridgeAddress: "KT1Td3kTKZxeFkRGyi2kHdzWhbnRZ8YvbNGs",
        notifier,
        Tezos: new TezosToolkit(TestNetRpcUri.TEZOS),
        xpnftAddress: "KT1UmaiaSEuuAbEeWaQfyehi6zG8DGrcsRAg",
        validators: [
          "tz1iKCCYmhayfpp1HvVA8Fmp4PkY5Z7XnDdX",
          "tz1g4CJW1mzVLvN8ycHFg9JScpuzYrJhZcnD",
          "tz1exbY3JKPRpo2KLegK8iqoVNRLn1zFrnZi",
        ],
        feeMargin,
      },
      velasParams: {
        notifier,
        noWhitelist: true,
        erc721_addr: "0xE657b66d683bF4295325c5E66F6bb0fb6D1F7551",
        erc1155_addr: "0x5D822bA2a0994434392A0f947C83310328CFB0DE",
        minter_addr: "0x5051679FEDf0D7F01Dc23e72674d0ED58de9be6a",
        erc1155Minter: "0x941972fa041F507eBb8CfD5d11C05Eb1a51f2E95",
        erc721Minter: "0x5df32A2F15D021DeF5086cF94fbCaC4594208A26",
        nonce: Chain.VELAS,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.VELAS),
        feeMargin,
      },
      iotexParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.IOTEX),
        minter_addr: "0xE657b66d683bF4295325c5E66F6bb0fb6D1F7551",
        erc721_addr: "0x5D822bA2a0994434392A0f947C83310328CFB0DE",
        erc1155_addr: "0x46Df0d0Dd629d61BDFA567dE61912FDeD883A60d",
        erc1155Minter: "0x5df32A2F15D021DeF5086cF94fbCaC4594208A26",
        erc721Minter: "0xC3dB3dBcf007961541BE1ddF15cD4ECc0Fc758d5",
        nonce: Chain.IOTEX,
        feeMargin,
      },
      hederaParams: {
        notifier,
        hederaApi: hederaService(
          "https://testnet.mirrornode.hedera.com/api/v1"
        ),
        provider: hethers.getDefaultProvider("testnet") as any,
        evmProvider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.HEDERA),
        feeMargin,
        nonce: Chain.HEDERA,
        noWhitelist: true,
        htcToken: "0xE410Bf9E4a071bFc9BE4fd0071d4dcf00c0aCBAB",
        erc721_addr: "0xf7509aD93340d059DFae7ae013768F88EeEF90e0",
        erc1155_addr: "0xf7509aD93340d059DFae7ae013768F88EeEF90e0",
        minter_addr: "0x94a75d94f2Ee0E840753dB85CAC649963bCbe2Ab",
        erc721Minter: "0x000000000000000000000000000000000037008d",
        erc1155Minter: "0x0000000000000000000000000000000000370090",
      },
      skaleParams: {
        nonce: Chain.SKALE,
        notifier,

        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.SKALE),
        feeMargin,
        erc1155_addr: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
        erc1155Minter: "0x48B218C9f626F079b82f572E3c5B46251c40fc47",
        erc721Minter: "0xaB9eD7b9734471249255B4d969B32995015116d9",
        erc721_addr: "0xbED4a5b36fae07943589a0b34CC2Ec3a1c208E53",
        minter_addr: "0x7cB14C4aB12741B5ab185C6eAFb5Eb7b5282A032",
        paymentTokenAddress: "0x0F00f81162ABC95Ee6741a802A1218C67C42e714",
      },
      godwokenParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.GODWOKEN),
        minter_addr: "0x3fe9EfFa80625B8167B2F0d8cF5697F61D77e4a2",
        erc721_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        erc1155_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        erc721Minter: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
        erc1155Minter: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        nonce: Chain.GODWOKEN,
        feeMargin,
      },
      gateChainParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.GATECHAIN),
        minter_addr: "0x2B24de7BFf5d2ab01b1C53682Ee5987c9BCf1BAc",
        erc721_addr: "0x3fe9EfFa80625B8167B2F0d8cF5697F61D77e4a2",
        erc1155_addr: "0x8CEe805FE5FA49e81266fcbC27F37D85062c1707",
        erc721Minter: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        erc1155Minter: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        nonce: Chain.GATECHAIN,
        feeMargin,
      },
      secretParams: {
        notifier,
        rpcUrl: TestNetRpcUri.SECRET,
        bridge: {
          contractAddress: "secret1ecsxtsrct6h647lpztnnzc9e47ezh0uu673c8h",
          codeHash:
            "29a127369d1f4326fb684435fde702fa9619c812dfb5b3a1929529bab0e308e0",
        },
        xpnft: {
          contractAddress: "secret1x4afa2shvq4uwwtl0ld8qnjfm3jkmyvap3yn9g",
          codeHash:
            "090ab9b7968745369f8888302a16650164e2ffc2f44c393a7382f74e122a9a8e",
        },
        umt: {
          contractAddress: "secret146snljq0kjsva7qrx4am54nv3fhfaet7srx4n2",
          codeHash:
            "af076a49141264ec048270318f1358c9be193893c3f829425cab53ee5eb05e5c",
        },
        chainId: "pulsar-2",
        feeMargin,
      },

      nearParams: {
        networkId: "testnet",
        nonce: Chain.NEAR,
        rpcUrl: TestNetRpcUri.NEAR,
        bridge: "xp_new_bridge.testnet",
        xpnft: "xp_new_nft.testnet",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        feeMargin,
        whitelisted: whitelistedService(AppConfigs.TestNet()),
        notifier,
        signatureSvc: signatureSvc_prod,
      },
    };
  };

  export const Staging: () => Promise<Partial<ChainParams>> = async () => {
    const feeMargin: FeeMargins = { min: 1, max: 5 };
    const notifier = evNotifier("https://bridge1.xp.network/notifier");

    return {
      tonParams: {
        extraFees: new Map().set(Chain.ETHEREUM, "1"),
        bridgeAddr: "kQAhrkiW7pA5eE_7vtz7_AQhHznfqR0VFyTGs4mgyaVLPgfG",
        burnerAddr: "kQBo5aNuDXghpZ2u9yMdfaR9oVQEuRddNLCoNg8YgI_k2MOE",
        notifier,
        tonweb: new TonWeb(
          new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
            apiKey:
              "05645d6b549f33bf80cee8822bd63df720c6781bd00020646deb7b2b2cd53b73",
          })
        ),
        xpnftAddr: "EQCgk1I2zujGrXaNXnWZEtFD93tSKNjvRfqKV0xp7EswHgw9",
        feeMargin,
      },
      casperParams: {
        bridge:
          "hash-9af986599cf7625dae425a9e0e65b333d0d0daaaa67abca5b5abcf59e65b81b4",
        feeMargin,
        network: "casper",
        notifier,
        rpc: MainNetRpcUri.CASPER,
        sig: signatureSvc_staging,
        umt: "to be filled",
        xpnft:
          "hash-7319bb6688fd3dcd8ef90d5df3e4f2782d007fd9ab3c7bb1390fa6c88743bfb2",
      },
      arbitrumParams: {
        erc721Minter: "0x66A47ff1b6d3072942582dACe797BEe8C9F28273",
        erc1155Minter: "0xBF180ceEcDA4b5449AF8618a1DE2B82211eDC82c",
        erc1155_addr: "0x0d0Dc4013a078BF36FD1E632032a9d8eFcD3D2dc",
        erc721_addr: "0x7deC0896CFaFB47D6d8416d07C6bFba06c86B938",
        minter_addr: "0x79a3C39EF62F5052Af6C8b7874fB0FD809e4e998",
        feeMargin,
        nonce: Chain.ARBITRUM,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ARBITRUM),
      },
      nearParams: {
        networkId: "mainnet",
        nonce: Chain.NEAR,
        rpcUrl: MainNetRpcUri.NEAR,
        bridge:
          "e138f27300334f546bbd792e65dc8753af29d534c5248a3f55e875693bddcf19",
        xpnft: "damphir7.near",
        feeMargin,
        notifier,
        whitelisted: whitelistedService(AppConfigs.Staging()),
        walletUrl: "https://wallet.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        signatureSvc: signatureSvc_staging,
      },
      solanaParams: {
        xpnftAddr: "",
        bridgeContractAddr: "kVvEBTB1h9GWEC7GcuDNTEmk6uxbCM11GvSmwvuCAwx",
        endpoint: MainNetRpcUri.SOLANA,
        notifier,
        feeMargin,
      },
      hederaParams: {
        notifier,
        hederaApi: hederaService(
          "https://mainnet-public.mirrornode.hedera.com/api/v1"
        ),
        provider: hethers.getDefaultProvider() as any,
        evmProvider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HEDERA),
        feeMargin,
        nonce: Chain.HEDERA,
        noWhitelist: true,
        htcToken: "0x10677B39A30A1f84ffae8aFCc23F210CafCEBc94",
        erc721_addr: "0x2f374eDEEAdA5aD8D26d7BC804753D7d27E8fa77",
        erc1155_addr: "0x2f374eDEEAdA5aD8D26d7BC804753D7d27E8fa77",
        minter_addr: "0x75c65c71bf2f8f29ab51d8423f9b390f709fc275",
        erc721Minter: "0x000000000000000000000000000000000037008d",
        erc1155Minter: "0x0000000000000000000000000000000000370090",
      },
      caduceusParams: {
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CADUCEUS),
        erc1155_addr: "0x820c0b504fe85b43E3c43D2EA24cb764ad78d52e",
        erc721_addr: "0x086815f8154e3cdD89cD3aEc78377e3197a572d0",
        erc1155Minter: "0xe3266d5181FffE43A205ce5bE9437B9f717Bad84",
        erc721Minter: "0x8411EeadD374bDE549F61a166FFBeFca592bC60a",
        minter_addr: "0x28c43F505d210D6f8f78C58b450b76890dc76F21",
        nonce: Chain.CADUCEUS,
      },
      optimismParams: {
        erc721Minter: "0xBb5e9896cEe600DaC470775B6f235Db105E861BD",
        erc1155Minter: "0x35c3c3959d19A310Fc052545fCC29200dc440CdA",
        erc1155_addr: "0xF9DfD29ddEDEa3224f9c7E12c7Bbe37101341786",
        erc721_addr: "0x55B1D1891ABb21A5d245d149B49007b55Bd3746D",
        minter_addr: "0x4ceDb46481d7118E1D292C318E37510E5919bBe6",
        feeMargin,
        nonce: Chain.OPTIMISM,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(TestNetRpcUri.OPTIMISM),
      },

      avalancheParams: {
        notifier,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AVALANCHE),
        erc721Minter: "0xb3cE27eDadFE006f9f47C5ed5b62E63DFd9Cf3bD",
        erc1155Minter: "0x23d399368EF31ca950E4Fd2063F2e4A5ACC0f9c2",
        erc721_addr: "0xcEFC9182e9AB181b3FED4e89CdA55E0B9010aFe1",
        minter_addr: "0x52e7D07DE51F8163E0f29061EaAa7D3FEaf6b47E",
        erc1155_addr: "0x77037e4f8aCb09f9bdedB9311bB6d9e74ed44371",
        nonce: Chain.AVALANCHE,
        feeMargin,
        noWhitelist: true,
      },
      algorandParams: {
        algodApiKey: "kZWDAxYR7Y6S6RoyfGIi28SATZ5DfTIs5pF0UMW4",
        algodUri: "https://mainnet-algorand.api.purestake.io/ps2",
        indexerUri: "https://mainnet-algorand.api.purestake.io/idx2",
        nonce: Chain.ALGORAND,
        sendNftAppId: 942656248,
        sendNftAppAddress:
          "NWFARCYRP7AGZBRLQXAK55YM4F7MIM6NMZ6SAWUBNGM2MGE73WO7UZI7VA",
        algodPort: 443,
        notifier,
        feeMargin,
      },
      fantomParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FANTOM),
        erc721Minter: "",
        erc1155Minter: "",
        erc1155_addr: "0xAE3bF9a0abd3D753aBB579c6E8BFD5D5F5e89c70",
        erc721_addr: "0x3CF207B7E4633400B8A29B3c758296d290a51345",
        minter_addr: "0xD0060e9d327fCeF5A0B0919e3624eABa56565348",
        nonce: Chain.FANTOM,
        feeMargin,
      },
      elrondParams: {
        node_uri: MainNetRpcUri.ELROND,
        minter_address:
          "erd1qqqqqqqqqqqqqpgqacac9ux4uz0pjg8ck2sf0ugxre0feczzvcas2tsatn",
        esdt_swap_address:
          "erd1qqqqqqqqqqqqqpgqjlnfddgj2dl4kz3x4n55yhfv7v06mxhzvcas2ec5ps",
        esdt_nft: "XPNFT-976581",
        esdt_swap: "WEGLD-8c393e",
        notifier,
        nonce: Chain.ELROND,
        feeMargin,
      },
      harmonyParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HARMONY),
        minter_addr: "0x77037e4f8aCb09f9bdedB9311bB6d9e74ed44371",
        erc721_addr: "0x23d399368EF31ca950E4Fd2063F2e4A5ACC0f9c2",
        erc1155_addr: "0xb3cE27eDadFE006f9f47C5ed5b62E63DFd9Cf3bD",
        erc1155Minter: "0x28c43F505d210D6f8f78C58b450b76890dc76F21",
        erc721Minter: "0x086815f8154e3cdD89cD3aEc78377e3197a572d0",
        nonce: Chain.HARMONY,
        feeMargin,
      },
      velasParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.VELAS),
        erc721Minter: "0x4d739e4953CE42f71604cbE142FD293841F9ed1c",
        erc1155Minter: "0xeEc7955F2F7AA4E36B582D8f022c9417ecB75a44",
        erc721_addr: "0x19678D8f9601AD0F099D401A3f82e4d6745B0e56",
        erc1155_addr: "0x4a153028F0b40C41432127E050015963D130b01A",
        minter_addr: "0xe535A8De7C42a8bc1633f16965fbc259a3Ef58B6",
        nonce: Chain.VELAS,
        feeMargin,
      },
      bscParams: {
        notifier,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.BSC),
        erc721Minter: "0x83feaeA88b1377970E7cD11492d084B63e09C87E",
        erc1155_addr: "0x1B20ceec70e9635f5B56928de16A9dBc8EB8e3b6",
        erc1155Minter: "0x5Af6A4C6E261315C5B7811bEb9c620CfF4722793",
        erc721_addr: "0x9796B2F03e3afF786048cd67a1D33282476AB1d4",
        minter_addr: "0x7Eac6825A851d79ae24301eA497AD8db2a0F4976",
        nonce: Chain.BSC,
        feeMargin,
        noWhitelist: true,
      },
      secretParams: {
        bridge: {
          contractAddress: "secret1t0g8tvc0tyvpwdsdc5zepa9j2ptr3vfte26qhu",
          codeHash:
            "684afe616d92b29c097c5f00365d07c005e99c90ff1227507a0284b601a2cc5e",
        },
        xpnft: {
          contractAddress: "secret1ggvqzks96k7hawhdx3harrtnffhttrrq2qxmdg",
          codeHash:
            "b7f44f7d2f72bfec52b027ee6b3ef802246735b50b2bfe747851876f818d7f45",
        },
        notifier,
        rpcUrl: MainNetRpcUri.SECRET,
        umt: {
          contractAddress: "",
          codeHash: "",
        },
        chainId: "24",
        feeMargin,
      },
      abeyChainParams: {
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ABEYCHAIN),
        erc1155_addr: "0x8776073043eef8929F4a9cBa8Aacc6B59A21BA52",
        erc1155Minter: "0x5Ed657a379e06CBAc1Ba1a9cF6D28e71c66B0c83",
        erc721_addr: "0x3C8C51809Ee58E9D3BA37e37112843e41DcBD7B7",
        erc721Minter: "0xD580913Ef2c8CA4Ca90D4bE6851ACa004cf586D8",
        minter_addr: "0x14db0f56042Fa87F3b3921E871f87248f4C56A71",
        nonce: Chain.ABEYCHAIN,
      },
      moonbeamParams: {
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.MOONBEAM),
        erc1155_addr: "0x554560C6800f123B4A713F80A5AC9F21486F5De8",
        erc721_addr: "0x6f64e03fcc34b774b3b82825a91aABA336Fbf931",
        erc1155Minter: "0xA97FD39705583296221f39cb245fb573B28722A1",
        erc721Minter: "0x0e5C62beAD14795F3eA9969B139F5433DF85319e",
        minter_addr: "0xce50496C6616F4688d5775966E302A49e3876Dff",
        nonce: Chain.MOONBEAM,
      },
      polygonParams: {
        notifier,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.POLYGON),
        erc721Minter: "0x32732607F67f9FC2007AF84e54B2ea9042327ed3",
        erc1155Minter: "0x62E26979F555Ec475981D8D1A7e269f747643f22",
        erc721_addr: "0x54024A9351B7aD68921914942f776489E71c467e",
        erc1155_addr: "0x8D3e050555356a2eD4ad8cfFb189994035F5803C",
        minter_addr: "0xF712f9De44425d8845A1d597a247Fe88F4A23b6f",
        nonce: Chain.POLYGON,
        feeMargin,
        noWhitelist: true,
      },
      skaleParams: {
        notifier,
        feeMargin,
        nonce: Chain.SKALE,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.SKALE),
        erc721Minter: "0x0e02b55e1D0ec9023A04f1278F39685B53739010",
        erc1155Minter: "0x90d38996B210D45bDF2FD54d091C6061dff0dA9F",
        erc1155_addr: "0xE90105827d04522e52AdfA6BF695730E5706C0C2",
        erc721_addr: "0x46Df0d0Dd629d61BDFA567dE61912FDeD883A60d",
        minter_addr: "0x33DC209D33AddF60cf90Dd4B10f9a198A1A93f63",
        paymentTokenAddress: "0x59ab97Ee239e02112652587F9Ef86CB6F762983b", // Euphoria ETH (ETH) Token
      },
      okcParams: {
        erc721Minter: "0x8B7f2bC31976230E374B93DF88D6eCD14f7B5D7F",
        erc1155Minter: "0xf331D7A450C2fB7ca7B58b675e46D7E344A57186",
        erc1155_addr: "0xD580913Ef2c8CA4Ca90D4bE6851ACa004cf586D8",
        erc721_addr: "0x5Ed657a379e06CBAc1Ba1a9cF6D28e71c66B0c83",
        minter_addr: "0x8776073043eef8929F4a9cBa8Aacc6B59A21BA52",
        feeMargin,
        nonce: Chain.OKC,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.OKC),
      },
      aptosParams: {
        rpcUrl: MainNetRpcUri.APTOS,
        bridge:
          "0x42ef1f5fcf8398a07c57d8320f510e82588bac408d820679918c0f87270e932e",
        xpnft: "XPNFT",
        notifier,
        feeMargin,
        nonce: Chain.APTOS,
        network: "staging",
      },
      dfinityParams: {
        agent: new HttpAgent({
          host: "https://ic0.app",
        }),
        bridgeContract: Principal.fromText("eqfbe-gaaaa-aaaap-abiyq-cai"),
        xpnftId: Principal.fromText("cvkpw-tyaaa-aaaap-qbjda-cai"),
        umt: Principal.fromText("c4jek-fqaaa-aaaap-qbjcq-cai"),
        notifier,
        feeMargin,
        signatureSvc: signatureSvc_staging,
      },
    };
  };

  export const MainNet: () => Promise<Partial<ChainParams>> = async () => {
    const feeMargin = { min: 1, max: 5 };
    const notifier = evNotifier(middleware_uri);

    // VeChain related:
    const net = new SimpleNet(MainNetRpcUri.VECHAIN);
    const driver = await Driver.connect(net);
    const provider = thor.ethers.modifyProvider(
      new ethers.providers.Web3Provider(
        new thor.ConnexProvider({ connex: new Framework(driver) })
      )
    );

    return {
      tonParams: {
        bridgeAddr: "kQBpucKquLw9uwGfLe_KHt65YWnchjoY2VPSsKDTI7JqrcLm",
        burnerAddr: "kQBR45AvvaO9a-rGfVkR0INx3JwoR-HngYA3tfctlGM1_Ml7",
        notifier,
        tonweb: new TonWeb(
          new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
            apiKey:
              "05645d6b549f33bf80cee8822bd63df720c6781bd00020646deb7b2b2cd53b73",
          })
        ),
        xpnftAddr: "EQABqbZubs5e3QQF3lxVZMvdaxlaIdNQWq8W1rn8rvVvWHys",
        extraFees: new Map().set(Chain.ETHEREUM, "1"),
        feeMargin: { min: 1.5, max: 5 },
      },
      elrondParams: {
        node_uri: MainNetRpcUri.ELROND,
        minter_address:
          "erd1qqqqqqqqqqqqqpgq3y98dyjdp72lwzvd35yt4f9ua2a3n70v0drsfycvu8",
        esdt_swap_address:
          "erd1qqqqqqqqqqqqqpgq5vuvac70kn36yk4rvf9scr6p8tlu23220drsfgszfy",
        esdt_nft: "XPNFT-cb7482",
        esdt_swap: "WEGLD-5f1f8d",
        notifier,
        nonce: Chain.ELROND,
        feeMargin,
      },
      caduceusParams: {
        notifier,
        feeMargin,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CADUCEUS),
        erc1155_addr: "0xF8AE68714fF6704883281603a22b56f47eB23511",
        erc721_addr: "0x97799bEDB7AD04d61899F0255BA12EAF641d666D",
        erc1155Minter: "0xFbA4cB4B617328cfE7a92907e4fb34bf1d798eBA",
        erc721Minter: "0x6b3b43029dD4695f8780d7f16E0313dA02d9507B",
        minter_addr: "0x98e9510261F34438e340c03cD35b492f87f628A8",
        nonce: Chain.CADUCEUS,
      },
      okcParams: {
        erc721Minter: "0x8411EeadD374bDE549F61a166FFBeFca592bC60a",
        erc1155Minter: "0xe3266d5181FffE43A205ce5bE9437B9f717Bad84",
        erc1155_addr: "0x820c0b504fe85b43E3c43D2EA24cb764ad78d52e",
        erc721_addr: "0x086815f8154e3cdD89cD3aEc78377e3197a572d0",
        minter_addr: "0x28c43F505d210D6f8f78C58b450b76890dc76F21",
        feeMargin,
        nonce: Chain.OKC,
        notifier,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.OKC),
      },
      optimismParams: {
        erc721Minter: "0x7deC0896CFaFB47D6d8416d07C6bFba06c86B938",
        erc1155Minter: "0x79a3C39EF62F5052Af6C8b7874fB0FD809e4e998",
        erc1155_addr: "0x6912B65711431820DfbcE2526Ab801fa76161B7C",
        erc721_addr: "0xDfC4bF686Adf9B4B5c33277661Ce1640651cB0b6",
        minter_addr: "0xb709848FB8446D4991407486Eda08b2936CD0050",
        feeMargin,
        nonce: Chain.OPTIMISM,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.OPTIMISM),
      },
      arbitrumParams: {
        erc721Minter: "0x536dDc3Be14A980d3cd15635b3D05985C297FD07",
        erc1155Minter: "0x4F4F48f70892475b0D4863f61F47157Dd1Db9F1a",
        erc1155_addr: "0xBd2005050a99142d7B77B415e7b603633f3B3746",
        erc721_addr: "0x445712E8dcf35E42FFAbb79b900aADcE2284fB65",
        minter_addr: "0x72d270bb71A90B82260b12c31D427C3F33AC0692",
        feeMargin,
        nonce: Chain.ARBITRUM,
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ARBITRUM),
      },
      bitgertParams: {
        erc721Minter: "string",
        erc1155Minter: "string",
        erc1155_addr: "string",
        erc721_addr: "string",
        minter_addr: "string",
        feeMargin,
        nonce: Chain.BITGERT,
        notifier,

        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.BITGERT),
      },
      dfinityParams: {
        agent: new HttpAgent({
          host: "https://ic0.app",
        }),
        bridgeContract: Principal.fromText("nwewk-zyaaa-aaaan-qd3kq-cai"),
        xpnftId: Principal.fromText("n7h5w-pqaaa-aaaan-qd3la-cai"),
        umt: Principal.fromText("mvi7m-naaaa-aaaan-qd3ma-cai"),
        notifier,
        feeMargin,
        signatureSvc: signatureSvc_prod,
      },
      vechainParams: {
        notifier,

        feeMargin,
        nonce: Chain.VECHAIN,

        provider,
        minter_addr: "0xE860cef926E5e76E0E88fdc762417a582F849C27",
        erc721_addr: "0xf0E778BD5C4c2F219A2A5699e3AfD2D82D50E271",
        erc1155_addr: "",
        erc721Minter: "0x6e2B43FeF2E750e1562AC572e60B6C484a027424",
        erc1155Minter: "0x4E3a506800b894f3d7B46475Ab693DD5a567bB5C",
      },
      tronParams: {
        provider: new TronWeb({ fullHost: MainNetRpcUri.TRON }),
        notifier,
        minter_addr: "TAncANF5aYbvgXDatmwTdvTa5N9PTrq95k",
        erc721_addr: "TVdp7szDHg3opRyuciQaJi93LLk7y83hrC",
        erc1155_addr: "",
        erc1155Minter: "TYoj1JVpJt1TAWBFj3GkaKLC2vrcFnjZ1G",
        erc721Minter: "TPSQTbFWaxiDZbGD7MoqR6N2aWDSWBUNfA",
        validators: [
          "TJuG3kvmGBDxGyUPBbvKePUjbopLurtqSo",
          "TN9bHXEWditocT4Au15mgm7JM56XBnRCvm",
          "TRHLhivxVogGhtxKn6sC8UF2Fr3WBdaT8N",
          "TJuG3kvmGBDxGyUPBbvKePUjbopLurtqSo",
          "TN9bHXEWditocT4Au15mgm7JM56XBnRCvm",
          "TRHLhivxVogGhtxKn6sC8UF2Fr3WBdaT8N",
          "TJuG3kvmGBDxGyUPBbvKePUjbopLurtqSo",
        ],
        nonce: Chain.TRON,
        feeMargin,
      },
      avalancheParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AVALANCHE),
        erc721Minter: "0x9b2bACF4E69c81EF4EF42da84872aAC39ce7EC62",
        erc1155Minter: "0x73E8deFC951D228828da35Ff8152f25c1e5226fa",
        erc721_addr: "0x7bf2924985CAA6192D721B2B9e1109919aC6ff58",
        minter_addr: "0xC254a8D4eF5f825FD31561bDc69551ed2b8db134",
        erc1155_addr: "0x73E8deFC951D228828da35Ff8152f25c1e5226fa",
        nonce: Chain.AVALANCHE,
        feeMargin,
      },
      polygonParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.POLYGON),
        erc721Minter: "0x7E8493F59274651Cc0919feCf12E6A77153cdA72",
        erc1155Minter: "0x73E8deFC951D228828da35Ff8152f25c1e5226fa",
        erc721_addr: "0xC254a8D4eF5f825FD31561bDc69551ed2b8db134",
        erc1155_addr: "0x7bf2924985CAA6192D721B2B9e1109919aC6ff58",
        minter_addr: "0x14CAB7829B03D075c4ae1aCF4f9156235ce99405",
        nonce: Chain.POLYGON,
        feeMargin,
      },
      fantomParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FANTOM),
        erc721Minter: "0xC81D46c6F2D59182c5A64FD5C372266c98985AdF",
        erc1155Minter: "0x146a99Ff19ece88EC87f5be03085cA6CD3163E15",
        erc1155_addr: "0x4bA4ADdc803B04b71412439712cB1911103380D6",
        erc721_addr: "0x75f93b47719Ab5270d27cF28a74eeA247d5DfeFF",
        minter_addr: "0x97dd1B3AE755539F56Db8b29258d7C925b20b84B",
        nonce: Chain.FANTOM,
        feeMargin,
      },
      bscParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.BSC),
        erc721Minter: "0xa66dA346C08dD77bfB7EE5E68C45010B6F2538ff",
        erc1155_addr: "0x3F888c0Ee72943a3Fb1c169684A9d1e8DEB9f537",
        erc1155Minter: "0xF5e0c79CB0B7e7CF6Ad2F9779B01fe74F958964a",
        erc721_addr: "0x0cC5F00e673B0bcd1F780602CeC6553aec1A57F0",
        minter_addr: "0x0B7ED039DFF2b91Eb4746830EaDAE6A0436fC4CB",
        nonce: Chain.BSC,
        feeMargin,
      },
      celoParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.CELO),
        minter_addr: "string",
        erc721_addr: "string",
        erc1155Minter: "string",
        erc721Minter: "string",
        erc1155_addr: "",
        nonce: Chain.CELO,
        feeMargin,
      },
      harmonyParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HARMONY),
        minter_addr: "0x1358844f14feEf4D99Bc218C9577d1c7e0Cb2E89",
        erc721_addr: "0xDcAA2b071c1851D8Da43f85a34a5A57d4Fa93A1A",
        erc1155_addr: "0xFEeD85607C1fbc2f30EAc13281480ED6265e121E",
        erc1155Minter: "0xF547002799955812378137FA30C21039E69deF05",
        erc721Minter: "0x57d2Ad1a14C77627D5f82B7A0F244Cfe391e59C5",
        nonce: Chain.HARMONY,
        feeMargin,
      },
      ropstenParams: {
        notifier,

        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ETHEREUM),
        minter_addr: "0x1cC24128C04093d832D4b50609e182ed183E1688",
        erc721_addr: "0x32E8854DC2a5Fd7049DCF10ef2cb5f01300c7B47",
        erc1155_addr: "0x041AE550CB0e76a3d048cc2a4017BbCB74756b43",
        erc1155Minter: "0xca8E2a118d7674080d71762a783b0729AadadD42",
        erc721Minter: "0xF547002799955812378137FA30C21039E69deF05",
        nonce: Chain.ETHEREUM,
        feeMargin,
        noWhitelist: true,
      },
      xDaiParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.XDAI),
        erc721Minter: "0x82A7d50A0030935808dAF6e5f0f06645866fb7Bb",
        erc1155Minter: "0xFEeD85607C1fbc2f30EAc13281480ED6265e121E",
        erc721_addr: "0x1358844f14feEf4D99Bc218C9577d1c7e0Cb2E89",
        erc1155_addr: "0xDcAA2b071c1851D8Da43f85a34a5A57d4Fa93A1A",
        minter_addr: "0x81e1Fdad0658b69914801aBaDA7Aa0Abb31653E5",
        nonce: Chain.XDAI,
        feeMargin,
      },
      algorandParams: {
        algodApiKey: "kZWDAxYR7Y6S6RoyfGIi28SATZ5DfTIs5pF0UMW4",
        algodUri: "https://mainnet-algorand.api.purestake.io/ps2",
        indexerUri: "https://mainnet-algorand.api.purestake.io/idx2",
        nonce: Chain.ALGORAND,
        sendNftAppId: 769053604,
        sendNftAppAddress:
          "4NADOO3YSROEIB7Z3QF2KWPFVHKQELRNLIBBF357EV3ZKVZVFVCAQBMBIY",
        algodPort: 443,
        notifier,
        feeMargin,
      },
      fuseParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.FUSE),
        erc721Minter: "0xC81D46c6F2D59182c5A64FD5C372266c98985AdF",
        erc1155Minter: "0x146a99Ff19ece88EC87f5be03085cA6CD3163E15",
        erc721_addr: "0x93239b1CF8CAd847f387735876EdBa7D75ae4f7A",
        erc1155_addr: "0x2496b44516c8639dA00E8D12ccE64862e3760190",
        minter_addr: "0xa66dA346C08dD77bfB7EE5E68C45010B6F2538ff",
        nonce: Chain.FUSE,
        feeMargin,
      },
      tezosParams: {
        bridgeAddress: "KT1WKtpe58XPCqNQmPmVUq6CZkPYRms5oLvu",
        notifier,
        Tezos: new TezosToolkit(MainNetRpcUri.TEZOS),
        xpnftAddress: "KT1NEx6MX2GUEKMTX9ydyu8mn9WBNEz3QPEp",
        validators: [
          "tz1MwAQrsg5EgeFD1AQHT2FTutnj9yQJNcjM",
          "tz1b5AMdXs9nDxsqoN9wa3HTusvhahgBRWuF",
          "tz1L5DjmMEHbj5npRzZewSARLmTQQyESW4Mj",
          "tz1csq1THV9rKQQexo2XfSjSEJEg2wRCSHsD",
          "tz1TBhd1NeZNtWsTbecee8jDMDzeBNLmpViN",
          "tz1SHcDnXRgb7kWidiaM2J6bbTS7x5jzBr67",
        ],
        feeMargin,
      },
      velasParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.VELAS),
        erc721Minter: "0x3F888c0Ee72943a3Fb1c169684A9d1e8DEB9f537",
        erc1155Minter: "0x0cC5F00e673B0bcd1F780602CeC6553aec1A57F0",
        erc721_addr: "0x9e5761f7A1360E8B3E9d30Ed9dd3161E8b75d4E8",
        erc1155_addr: "0x0B7ED039DFF2b91Eb4746830EaDAE6A0436fC4CB",
        minter_addr: "0x40d8160A0Df3D9aad75b9208070CFFa9387bc051",
        nonce: Chain.VELAS,
        feeMargin,
      },
      iotexParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.IOTEX),
        minter_addr: "0x4bA4ADdc803B04b71412439712cB1911103380D6",
        erc721_addr: "0x6eD7dfDf9678eCb2051c46A1A5E38B4f310b18c5",
        erc721Minter: "0xD87755CCeaab0edb28b3f0CD7D6405E1bB827B65",
        erc1155Minter: "0x81e1Fdad0658b69914801aBaDA7Aa0Abb31653E5",
        erc1155_addr: "0x93Ff4d90a548143c28876736Aa9Da2Bb7B1b52D4",
        nonce: Chain.IOTEX,
        feeMargin,
      },
      auroraParams: {
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.AURORA),
        minter_addr: "0x32E8854DC2a5Fd7049DCF10ef2cb5f01300c7B47",
        erc721_addr: "0x041AE550CB0e76a3d048cc2a4017BbCB74756b43",
        erc1155_addr: "0xca8E2a118d7674080d71762a783b0729AadadD42",
        erc1155Minter: "0x0000000000000000000000000000000000000000",
        erc721Minter: "0x0000000000000000000000000000000000000000",
        nonce: Chain.AURORA,
        notifier,
        noWhitelist: true,
        feeMargin,
      },
      godwokenParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.GODWOKEN),
        minter_addr: "0xeBCDdF17898bFFE81BCb3182833ba44f4dB25525",
        erc721_addr: "0x9cdda01E00A5A425143F952ee894ff99B5F7999F",
        erc1155_addr: "0x34933A5958378e7141AA2305Cdb5cDf514896035",
        erc721Minter: "0x0000000000000000000000000000000000000000",
        erc1155Minter: "0x0000000000000000000000000000000000000000",
        nonce: Chain.GODWOKEN,
        feeMargin,
      },
      gateChainParams: {
        notifier,
        noWhitelist: true,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.GATECHAIN),
        minter_addr: "0xFc7f7fD2DBdAF6D8F3ee3f222b3a6a9f89729f05",
        erc721_addr: "0xD6939f722B977afd7DD934A31bc94d08d4ea4336",
        erc1155_addr: "",
        erc1155Minter: "0xc45759e51CdDBa46db4D1becC8B8Bcbe5d4a9bB4",
        erc721Minter: "0x0000000000000000000000000000000000000000",
        nonce: Chain.GATECHAIN,
        feeMargin,
      },
      skaleParams: {
        notifier,

        feeMargin,
        nonce: Chain.SKALE,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.SKALE),
        erc721Minter: "0xC71C2e7b5Ee01f2cb08b41E240976E8Be6012fB0",
        erc1155Minter: "0xbe6cB5C730C07a788dAB0aD7ed629d9c418a9c14",
        erc1155_addr: "0x783cA58315336dD646aCeCF0b55f728099ee73ec",
        erc721_addr: "0xf4C24d031C336CdcC5CC251E5abbE777235A65f3",
        minter_addr: "0xa8440b0702923A54bb0FF3B55f458Cfe8142C1A0",
        paymentTokenAddress: "0x59ab97Ee239e02112652587F9Ef86CB6F762983b", // Euphoria ETH (ETH) Token
      },
      moonbeamParams: {
        nonce: Chain.MOONBEAM,
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.MOONBEAM),
        erc721Minter: "",
        erc1155Minter: "",
        erc1155_addr: "0xe535A8De7C42a8bc1633f16965fbc259a3Ef58B6",
        erc721_addr: "0xfD3Ce0a10D4731b136a7C9e3f8a37edA1EFbf77f",
        minter_addr: "0xBA3Cc81cfc54a4ce99638b5da1F17b15476E7231",
      },
      abeyChainParams: {
        nonce: Chain.ABEYCHAIN,
        notifier,
        noWhitelist: true,
        feeMargin,
        provider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.ABEYCHAIN),
        erc721Minter: "0xBb5e9896cEe600DaC470775B6f235Db105E861BD",
        erc1155Minter: "0x35c3c3959d19A310Fc052545fCC29200dc440CdA",
        erc1155_addr: "0xF9DfD29ddEDEa3224f9c7E12c7Bbe37101341786",
        erc721_addr: "0x55B1D1891ABb21A5d245d149B49007b55Bd3746D",
        minter_addr: "0x4ceDb46481d7118E1D292C318E37510E5919bBe6",
      },
      solanaParams: {
        xpnftAddr: "",
        bridgeContractAddr: "8bJT5J4tFzeBcxhd7i3KhYUVr7oAV4z7ijau2mTCcXD1",
        endpoint: MainNetRpcUri.SOLANA,
        notifier,
        feeMargin,
      },
      secretParams: {
        notifier,
        rpcUrl: MainNetRpcUri.SECRET,
        bridge: {
          contractAddress: "secret18f66qjjuyudmh7q6s50hwpt9y679lanjs82jkg",
          codeHash:
            "224f175c92947bbfd656d26e21b5eee40f73eac6aa6b64c328db3c55261ee6b4",
        },
        xpnft: {
          contractAddress: "secret16zcej6asqrtfq08u3fdjhs03zpl7lgy7q32eps",
          codeHash:
            "b7f44f7d2f72bfec52b027ee6b3ef802246735b50b2bfe747851876f818d7f45",
        },
        umt: {
          contractAddress: "",
          codeHash: "",
        },
        chainId: "24",
        feeMargin,
      },
      nearParams: {
        networkId: "mainnet",
        nonce: Chain.NEAR,
        rpcUrl: MainNetRpcUri.NEAR,
        bridge:
          "1a5c1f4fea55549b4cb8746f42f0a9d79e5aa7a91d3596f12fdd592db15d803e",
        xpnft:
          "ef7649710758ed794071230a59493cb390ca67cd202e9548fbbb0ed9d961b463",
        feeMargin,
        notifier,
        whitelisted: whitelistedService(AppConfigs.MainNet()),
        walletUrl: "https://wallet.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        signatureSvc: signatureSvc_prod,
      },
      hederaParams: {
        notifier,
        provider: hethers.getDefaultProvider() as any,
        evmProvider: new ethers.providers.JsonRpcProvider(MainNetRpcUri.HEDERA),
        hederaApi: hederaService(
          "https://mainnet-public.mirrornode.hedera.com/api/v1"
        ),
        feeMargin,
        nonce: Chain.HEDERA,
        Xpnfthtsclaims: "0x00000000000000000000000000000000002db2d8",
        htcToken: "0x00000000000000000000000000000000002DB2d9",
        erc721_addr: "0x00000000000000000000000000000000002db2d5",
        erc1155_addr: "0x00000000000000000000000000000000002db2d5",
        minter_addr: "0x00000000000000000000000000000000002da8a2",
        erc721Minter: "",
        erc1155Minter: "",
      },
    };
  };
}
