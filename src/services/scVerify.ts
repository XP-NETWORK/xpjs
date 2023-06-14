import axios, { AxiosResponse } from "axios";
import { _headers } from "..";

export interface ScVerifyService {
  checkWithOutTokenId(from: number, chain: number, sc: string): Promise<any>;
  list(from: string, targetChain: number, fromChain: number): Promise<any>;
  default(
    sc: string,
    chain: number,
    fromChain: number,
    tokenId: string | undefined
  ): Promise<AxiosResponse<{ data: string }> | undefined>;
  verify(
    from: string,
    to: string,
    targetChain: number,
    fromChain: number,
    tokenId?: string
  ): Promise<AxiosResponse<{ data: "allowed" | "not allowed" }> | undefined>;
}

/*interface SignatureServiceResponse {
  signature: string;
  fee: string;
}*/

export function scVerify(url: string): ScVerifyService {
  const request = axios.create({
    baseURL: url,
  });
  return {
    async checkWithOutTokenId(from: number, chain: number, sc: string) {
      return (
        await request
          .post("/default/checkWithOutTokenId", {
            fromChain: from,
            chain,
            sc,
          })
          .catch(() => ({ data: false }))
      ).data;
    },

    async list(from: string, targetChain: number, fromChain: number) {
      const res = await request
        .get(
          `/verify/list?from=${from}&targetChain=${targetChain}&fromChain=${fromChain}&tokenId=1`
        )
        .catch(() => ({ data: false }));

      if (res.data.data) return res.data.data.length > 0;

      return false;
    },
    async verify(
      from: string,
      to: string,
      targetChain: number,
      fromChain: number,
      tokenId?: string
    ) {
      return await request
        .post(
          `/verify`,
          { from, to, targetChain, fromChain, tokenId },
          {
            headers: _headers,
          }
        )
        .catch(() => undefined);
    },
    async default(sc, chain, fromChain, tokenId) {
      return await request
        .post(
          `/default/`,
          {
            sc,
            chain,
            fromChain,
            tokenId,
          },
          {
            headers: _headers,
          }
        )
        .catch(() => {
          return undefined;
        });
    },
  };
}
