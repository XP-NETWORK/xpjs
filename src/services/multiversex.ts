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
      const data = {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          _source: ["events"],
          query: {
            bool: {
              should: [
                {
                  terms: {
                    originalTxHash: [hash],
                  },
                },
              ],
            },
          },
        },
      };
      const event = (
        await index("/logs/_search", data)
      )?.data?.hits?.hits[0]?._source?.events?.find(
        (e: any) => e.identifier === "lock721"
      );

      if (!event) {
        throw new Error(`Failed to get ${hash} events`);
      }

      console.log(event, "event");

      const args = decodeBase64Array(event.topics);

      if (!args) {
        throw new Error(`Failed to decode ${hash} topics`);
      }

      console.log(args, "decoded args");

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
