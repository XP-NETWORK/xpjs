import axios from "axios";
import { ChainNonce } from "../type-utils";

export interface SignatureService {
  getSignatureNear(
    from: ChainNonce,
    toChain: ChainNonce,
    nft: string,
    tokenContract: string,
    tokenId: string,
    to: string
  ): Promise<SignatureServiceResponse>;
}

interface SignatureServiceResponse {
  signature: string;
  fee: string;
}

export function signatureService(url: string): SignatureService {
  const signer = axios.create({
    baseURL: url,
  });
  return {
    async getSignatureNear(
      fromChain: ChainNonce,
      toChain: ChainNonce,
      nft: string,
      tokenContract: string,
      tokenId: string,
      to: string
    ) {
      const result = await signer.post<{ data: SignatureServiceResponse }>(
        "/api/get-signature/",
        {
          fromChain,
          toChain,
          nft,
          to,
          tokenId,
          tokenContract,
        }
      );
      console.log("near signature response", result);
      return result.data.data;
    },
  };
}
