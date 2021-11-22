import { ExchangeRateRepo } from "crypto-exchange-rate";
import { AlgorandNftListRepo, ElrdNftListRepo, EthNftJson, MoralisNftListRepo, NftListRepo } from "xpnet-nft-list";
import TronWeb from "tronweb";
export declare function elrondNftList(proxy: string): ElrdNftListRepo;
export declare type MoralisNetwork = "mainnet" | "testnet";
export declare function moralisNftList(server: string, appId: string, moralisSecret?: string, network?: MoralisNetwork): MoralisNftListRepo;
export declare function tronListNft(tronWeb: TronWeb, tronScan: string, xpnftAddr: string): NftListRepo<string, EthNftJson>;
export declare function algoListNft(baseURL: string): AlgorandNftListRepo;
export declare function exchangeRateRepo(baseUrl: string): ExchangeRateRepo;
