import { DepTrxData } from "../helpers/chain";
export interface MultiversexService {
    getTokenInfo(collection: string, tokenId: string): Promise<{
        uris: string[];
        royalties: number;
    }>;
    getCollectionInfo(collection: string): Promise<{
        name: string;
    }>;
    getLockDecodedArgs(hash: string): Promise<DepTrxData>;
}
export declare function multiversexService(apiUrl: string, indexerUrl: string): MultiversexService;
//# sourceMappingURL=multiversex.d.ts.map