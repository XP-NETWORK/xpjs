import { ExchangeRateRepo } from "crypto-exchange-rate";
import { ElrdNftListRepo, EthNftJson, MoralisNftListRepo, NftListRepo } from "xpnet-nft-list";
import TronWeb from "tronweb";
export declare function elrondNftList(proxy: string): ElrdNftListRepo;
export declare function moralisNftList(server: string, appId: string): MoralisNftListRepo;
export declare function tronListNft(tronWeb: TronWeb, tronScan: string, xpnftAddr: string): NftListRepo<string, EthNftJson>;
export declare function exchangeRateRepo(baseUrl: string): ExchangeRateRepo;
