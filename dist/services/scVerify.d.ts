import { AxiosResponse } from "axios";
import { FullChain } from "..";
export type ScVerifyUtils = {
    getScVerifyAddr(address: string): string;
};
export interface ScVerifyService {
    checkWithOutTokenId(from: FullChain<any, any, any> & ScVerifyUtils, chain: number, sc: string): Promise<any>;
    list(from: string, targetChain: number, fromChain: number): Promise<any>;
    default(sc: string, chain: number, fromChain: number, tokenId: string | undefined): Promise<AxiosResponse<{
        data: string;
    }> | undefined>;
    verify(from: string, to: string, targetChain: number, fromChain: number, tokenId?: string): Promise<AxiosResponse<{
        data: "allowed" | "not allowed";
    }> | undefined>;
}
export declare function scVerify(url: string): ScVerifyService;
//# sourceMappingURL=scVerify.d.ts.map