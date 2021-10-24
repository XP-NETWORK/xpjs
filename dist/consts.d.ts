import { CrossChainHelper } from "./factory/crossChainHelper";
import { ElrondParams } from "./helpers/elrond";
import { TronParams } from "./helpers/tron";
import { Web3Params } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";
export declare enum RpcUri {
    ELROND = "https://devnet-api.elrond.com",
    HECO = "https://http-testnet.hecochain.com",
    BSC = "https://data-seed-prebsc-1-s1.binance.org:8545",
    ROPSTEN = "https://ropsten.infura.io/v3/182b3d3fb2d14d5fbe7421348624d1ce",
    AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
    POLYGON = "https://matic-testnet-archive-rpc.bwarelabs.com",
    FANTOM = "https://rpc.testnet.fantom.network/",
    TRON = "https://api.shasta.trongrid.io/",
    CELO = "https://alfajores-forno.celo-testnet.org",
    HARMONY = "https://api.s0.b.hmny.io"
}
/**
 * An enum which represents the supported chains
 * Each field in the enum equals to the nonce of the chain.
 */
export declare enum Chain {
    ELROND = 2,
    HECO = 3,
    BSC = 4,
    ROPSTEN = 5,
    AVALANCE = 6,
    POLYGON = 7,
    FANTOM = 8,
    TRON = 9,
    CELO = 11,
    HARMONY = 12
}
interface ChainData {
    name: string;
    nonce: number;
    decimals: number;
    constructor: (params: Web3Params | TronParams | ElrondParams) => Promise<CrossChainHelper>;
    blockExplorerUrl: string;
    chainId?: number;
    currency: SupportedCurrency;
    validators: string[];
}
interface ChainInfo {
    [nonce: number]: ChainData;
}
export declare const CHAIN_INFO: ChainInfo;
export {};
