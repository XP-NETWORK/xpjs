import { ChainNonce } from "../type-utils";
export interface SignatureService {
    getSignatureNear(from: ChainNonce, toChain: ChainNonce, nft: string, tokenContract: string, tokenId: string, to: string): Promise<SignatureServiceResponse>;
    getSignatureDfinity(fc: ChainNonce, tc: ChainNonce, to: string, num: number): Promise<SignatureServiceResponse>;
}
interface SignatureServiceResponse {
    signature: string;
    fee: string;
}
export declare function signatureService(url: string): SignatureService;
export {};
//# sourceMappingURL=index.d.ts.map