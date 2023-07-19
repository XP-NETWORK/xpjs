import axios, { AxiosResponse, AxiosError } from "axios";
import { _headers } from "..";

import { FullChain } from "..";

export type ScVerifyUtils = {
  getScVerifyAddr(address: string): string;
};

export interface ScVerifyService {
  checkWithOutTokenId(
    from: FullChain<any, any, any> & ScVerifyUtils,
    chain: number,
    sc: string
  ): Promise<any>;
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

export function scVerify(url: string): ScVerifyService {
  const request = axios.create({
    baseURL: url,
  });
  return {
    async checkWithOutTokenId(from: any, chain: number, sc: string) {
      return (
        await request
          .post("/default/checkWithOutTokenId", {
            fromChain: from.getNonce(),
            chain,
            sc: from.getScVerifyAddr ? from.getScVerifyAddr(sc) : sc,
          })
          .catch(async (e: AxiosError) => {
            if (
              (e.code == "404" || e.message.includes("404")) &&
              from.getScVerifyAddr
            ) {
              return await request
                .post("/default/checkWithOutTokenId", {
                  fromChain: from.getNonce(),
                  chain,
                  sc,
                })
                .catch(() => ({ data: false }));
            }
            return { data: false };
          })
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
