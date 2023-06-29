export interface HederaService {
    getTokens(addresss: string): Promise<{
        token_id: string;
        balance: number;
    }[]>;
    getokenInfo(tokenId: string): Promise<{
        treasury_account_id: string;
    }>;
    isContract(address: string): Promise<boolean>;
    readContract(to: string, data: any): Promise<any>;
}
export declare function hederaService(url: string): HederaService;
//# sourceMappingURL=hederaApi.d.ts.map