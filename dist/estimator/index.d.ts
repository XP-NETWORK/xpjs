import { ChainNonce } from "../type-utils";
export interface SignatureService {
    getSignatureNear(from: ChainNonce, toChain: ChainNonce, nft: string, tokenContract: string, tokenId: string, to: string): Promise<string>;
}
export declare function signatureService(url: string): SignatureService;
//# sourceMappingURL=index.d.ts.map