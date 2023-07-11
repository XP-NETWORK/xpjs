import axios from "axios";
import { ChainNonceGet, NftInfo, AppConfigs } from "..";
import { InferNativeNft } from "../type-utils";

export interface NftList<T> {
  get(
    chain: ChainNonceGet,
    owner: string
  ): Promise<NftInfo<InferNativeNft<T>>[]>;
}

export type NftListUtils = {
  getNftListAddr(address: string): string;
};

export function nftList<T>(url: string, nftListAuthToken: string): NftList<T> {
  const nftlistRest = axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${nftListAuthToken}`,
    },
  });

  //if this is mainnet, than backup it with staging indexer
  const nftlistRestBackup =
    url === AppConfigs.MainNet().nftListUri &&
    axios.create({
      baseURL: AppConfigs.Staging().nftListUri,
      headers: {
        Authorization: `Bearer ${nftListAuthToken}`,
      },
    });
  return {
    async get(chain: ChainNonceGet & T & NftListUtils, owner: string) {
      if (chain.getNftListAddr) {
        owner = chain.getNftListAddr(owner);
      }

      let res = await nftlistRest
        .get<{
          data: NftInfo<InferNativeNft<T>>[];
        }>(`/nfts/${chain.getNonce()}/${owner}`)
        .catch(async (e) => {
          if (!nftlistRestBackup) return e;
          return await nftlistRestBackup.get<{
            data: NftInfo<InferNativeNft<T>>[];
          }>(`/nfts/${chain.getNonce()}/${owner}`);
        });

      if (res.headers["Retry-After"]) {
        await new Promise((r) => setTimeout(r, 30000));
        return await this.get(chain, owner);
      }
      return res.data.data;
    },
  };
}
