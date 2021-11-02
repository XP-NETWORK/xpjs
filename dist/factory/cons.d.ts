import { ExchangeRateRepo } from "crypto-exchange-rate";
import { ElrdNftListRepo, MoralisNftListRepo } from "xpnet-nft-list";
export declare function elrondNftList(proxy: string): ElrdNftListRepo;
export declare function moralisNftList(server: string, appId: string): MoralisNftListRepo;
export declare function exchangeRateRepo(baseUrl: string): ExchangeRateRepo;
