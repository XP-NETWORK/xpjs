export interface HederaService {
    getTokens(addresss: string): Promise<{
        token_id: string;
        balance: number;
    }[]>;
    getokenInfo(tokenId: string): Promise<{
        treasury_account_id: string;
    }>;
    isContract(address: string): Promise<boolean>;
    getEVMAddress(address: string): Promise<string>;
    readContract(to: string, data: any): Promise<any>;
    getEVMAccount(address: string): Promise<string>;
}
export declare function hederaService(url: string): HederaService;
//# sourceMappingURL=hederaApi.d.ts.map