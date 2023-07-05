import { ChainNonce } from "../../type-utils";
export interface SignatureService {
    near(from: ChainNonce, toChain: ChainNonce, tokenContract: string, tokenId: string, to: string): Promise<SignatureServiceResponse>;
    dfinity(fc: ChainNonce, tc: ChainNonce, to: string, num: number): Promise<SignatureServiceResponse>;
    casper(from: ChainNonce, to: ChainNonce, receiver: string, contract: string, token_id: string): Promise<SignatureServiceResponse>;
}
interface SignatureServiceResponse {
    sig: string;
    fees: string;
}
export declare function signatureService(url: string): SignatureService;
export {};
//# sourceMappingURL=index.d.ts.map