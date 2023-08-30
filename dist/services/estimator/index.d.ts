import { ChainNonce } from "../../type-utils";
export interface SignatureService {
    getSignatureNear(from: ChainNonce, toChain: ChainNonce, nft: string, tokenContract: string, tokenId: string, to: string): Promise<SignatureServiceResponse>;
    getSignatureDfinity(fc: ChainNonce, tc: ChainNonce, to: string, num: number): Promise<SignatureServiceResponse>;
    casper(from: ChainNonce, to: ChainNonce, receiver: string, contract: string, token_id: string): Promise<SignatureServiceResponse>;
}
interface SignatureServiceResponse {
    signature: string;
    fee: string;
    fees?: string;
    sig?: string;
}
export declare function signatureService(url: string): SignatureService;
export {};
//# sourceMappingURL=index.d.ts.map