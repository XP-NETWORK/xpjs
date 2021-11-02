import { CrossChainHelper } from ".";
import { ElrondParams } from "./helpers/elrond";
import { TronParams } from "./helpers/tron";
import { Web3Params } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";
import { ElrondHelper, Web3Helper, TronHelper } from "validator";
export declare enum TestNetRpcUri {
    ELROND = "https://devnet-api.elrond.com",
    HECO = "https://http-testnet.hecochain.com",
    BSC = "https://data-seed-prebsc-1-s1.binance.org:8545",
    ROPSTEN = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
    POLYGON = "https://matic-testnet-archive-rpc.bwarelabs.com",
    FANTOM = "https://rpc.testnet.fantom.network/",
    TRON = "https://api.shasta.trongrid.io/",
    CELO = "https://alfajores-forno.celo-testnet.org",
    HARMONY = "https://api.s0.b.hmny.io"
}
export declare enum MainNetRpcUri {
    ELROND = "https://gateway.elrond.com",
    HECO = "https://http-mainnet-node.huobichain.com",
    BSC = "https://bsc-dataseed.binance.org/",
    ETHEREUM = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    AVALANCHE = "https://api.avax.network/ext/bc/C/rpc",
    POLYGON = "https://rpc-mainnet.matic.network",
    FANTOM = "https://rpc.ftm.tools/",
    TRON = "https://api.trongrid.io/",
    CELO = "https://forno.celo.org",
    HARMONY = "https://api.harmony.one"
}
export declare type ChainNonce<T, P> = number & ThisType<T> & ThisType<P>;
export declare type ElrondNonce = ChainNonce<ElrondHelper, ElrondParams>;
export declare type Web3Nonce = ChainNonce<Web3Helper, Web3Params>;
export declare type TronNonce = ChainNonce<TronHelper, TronParams>;
export declare namespace Chain {
    const ELROND: ElrondNonce;
    const HECO: Web3Nonce;
    const BSC: Web3Nonce;
    const ROPSTEN: Web3Nonce;
    const AVALANCHE: Web3Nonce;
    const POLYGON: Web3Nonce;
    const FANTOM: Web3Nonce;
    const TRON: TronNonce;
    const CELO: Web3Nonce;
    const HARMONY: Web3Nonce;
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
