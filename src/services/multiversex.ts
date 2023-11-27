import axios from "axios";
import { DepTrxData } from "../helpers/chain";
import { decodeBase64Array } from "../factory";
import { V3_ChainId } from "../type-utils";

export interface MultiversexService {
  getTokenInfo(
    collection: string,
    tokenId: string
  ): Promise<{ uris: string[]; royalties: number }>;
  getCollectionInfo(collection: string): Promise<{ name: string }>;
  getLockDecodedArgs(hash: string): Promise<DepTrxData>;
}

export function multiversexService(
  apiUrl: string,
  indexerUrl: string
): MultiversexService {
  const api = axios.create({
    baseURL: apiUrl,
  });

  const index = axios.create({
    baseURL: indexerUrl,
  });

  index;

  return {
    async getTokenInfo(collection, tokenId) {
      const nftData = (
        await api(`/nfts/${collection + "-" + tokenId}`).catch(() => undefined)
      )?.data;

      if (!nftData) {
        throw new Error(`Failed to get ${tokenId} token data`);
      }

      return nftData;
    },
    async getCollectionInfo(collection) {
      const collectionData = (
        await api(`/collections/${collection}`).catch(() => undefined)
      )?.data;

      if (!collectionData) {
        throw new Error(`Failed to get ${collection} collection data`);
      }

      return collectionData;
    },
    async getLockDecodedArgs(hash) {
      let event: any = undefined;
      let timedout = false;

      const tm1 = setTimeout(() => {
        timedout = true;
      }, 1000 * 60 * 3);

      while (!event && !timedout) {
        const res = await api.get(`/transactions/${hash}?withResults=true`);
        event = res?.data?.results
          ?.find((r: any) => r.logs)
          ?.logs?.events?.find((e: any) => e.identifier === "lock721");

        !event && (await new Promise((r) => setTimeout(r, 10_000)));
      }

      if (!event) {
        throw new Error(`Failed to get ${hash} event logs`);
      }

      clearTimeout(tm1);

      const args = decodeBase64Array(event.topics);

      if (!args) {
        throw new Error(`Failed to decode ${hash} topics`);
      }

      return {
        tokenId: String(args[1].charCodeAt(0)),
        destinationChain: args[2] as V3_ChainId,
        destinationUserAddress: args[3],
        sourceNftContractAddress: args[4],
        tokenAmount: String(args[5].charCodeAt(0)),
        nftType: args[6] as "singular" | "multiple",
        sourceChain: args[7] as V3_ChainId,
      };
    },
  };
}
