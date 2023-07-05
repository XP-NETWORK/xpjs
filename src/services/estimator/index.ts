import axios from "axios";
import { ChainNonce } from "../../type-utils";

export interface SignatureService {
  near(
    from: ChainNonce,
    toChain: ChainNonce,
    tokenContract: string,
    tokenId: string,
    to: string
  ): Promise<SignatureServiceResponse>;
  dfinity(
    fc: ChainNonce,
    tc: ChainNonce,
    to: string,
    num: number
  ): Promise<SignatureServiceResponse>;
}

interface SignatureServiceResponse {
  sig: string;
  fees: string;
}

export function signatureService(url: string): SignatureService {
  const signer = axios.create({
    baseURL: url,
  });
  return {
    async near(
      from: ChainNonce,
      to: ChainNonce,
      contract: string,
      token_id: string,
      receiver: string
    ) {
      const result = await signer.post<{ data: SignatureServiceResponse }>(
        "/api/near/",
        {
          from,
          to,
          receiver,
          nft: {
            token_id,
            contract,
          },
        }
      );
      return result.data.data;
    },
    async dfinity(from, to, receiver, num: number) {
      const result = await signer.post<{ data: SignatureServiceResponse }>(
        "/api/dfinity/",
        {
          from,
          to,
          receiver,
          num,
        }
      );
      return result.data.data;
    },
  };
}
