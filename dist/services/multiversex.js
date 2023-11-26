"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiversexService = void 0;
const axios_1 = __importDefault(require("axios"));
const factory_1 = require("../factory");
function multiversexService(apiUrl, indexerUrl) {
    const api = axios_1.default.create({
        baseURL: apiUrl,
    });
    const index = axios_1.default.create({
        baseURL: indexerUrl,
    });
    index;
    return {
        async getTokenInfo(collection, tokenId) {
            const nftData = (await api(`/nfts/${collection + "-" + tokenId}`).catch(() => undefined))?.data;
            if (!nftData) {
                throw new Error(`Failed to get ${tokenId} token data`);
            }
            return nftData;
        },
        async getCollectionInfo(collection) {
            const collectionData = (await api(`/collections/${collection}`).catch(() => undefined))?.data;
            if (!collectionData) {
                throw new Error(`Failed to get ${collection} collection data`);
            }
            return collectionData;
        },
        async getLockDecodedArgs(hash) {
            /*const data = {
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
                      await index.get("/logs/_search", data).catch((e) => {
                          console.log(e, "ee");
                          return undefined;
                      })
                  )?.data?.hits?.hits[0]?._source?.events?.find((e: any) => e.identifier === "lock721");*/
            const res = await api.get(`/transactions/${hash}?withResults=true`);
            const event = res?.data?.results
                ?.find((r) => r.logs)
                ?.logs?.events?.find((e) => e.identifier === "lock721");
            if (!event) {
                throw new Error(`Failed to get ${hash} events`);
            }
            console.log(event, "event");
            const args = (0, factory_1.decodeBase64Array)(event.topics);
            if (!args) {
                throw new Error(`Failed to decode ${hash} topics`);
            }
            console.log(args, "decoded args");
            return {
                tokenId: String(args[1].charCodeAt(0)),
                destinationChain: args[2],
                destinationUserAddress: args[3],
                sourceNftContractAddress: args[4],
                tokenAmount: String(args[5].charCodeAt(0)),
                nftType: args[6],
                sourceChain: args[7],
            };
        },
    };
}
exports.multiversexService = multiversexService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGl2ZXJzZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvbXVsdGl2ZXJzZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBRTFCLHdDQUErQztBQVkvQyxTQUFnQixrQkFBa0IsQ0FDaEMsTUFBYyxFQUNkLFVBQWtCO0lBRWxCLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLE1BQU07S0FDaEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxLQUFLLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUN6QixPQUFPLEVBQUUsVUFBVTtLQUNwQixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUM7SUFFTixPQUFPO1FBQ0wsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTztZQUNwQyxNQUFNLE9BQU8sR0FBRyxDQUNkLE1BQU0sR0FBRyxDQUFDLFNBQVMsVUFBVSxHQUFHLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FDeEUsRUFBRSxJQUFJLENBQUM7WUFFUixJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLE9BQU8sYUFBYSxDQUFDLENBQUM7YUFDeEQ7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVU7WUFDaEMsTUFBTSxjQUFjLEdBQUcsQ0FDckIsTUFBTSxHQUFHLENBQUMsZ0JBQWdCLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUMvRCxFQUFFLElBQUksQ0FBQztZQUVSLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLFVBQVUsa0JBQWtCLENBQUMsQ0FBQzthQUNoRTtZQUVELE9BQU8sY0FBYyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSTtZQUMzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBHQXdCOEY7WUFFOUYsTUFBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLG1CQUFtQixDQUFDLENBQUM7WUFDcEUsTUFBTSxLQUFLLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPO2dCQUM5QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLElBQUksU0FBUyxDQUFDLENBQUM7YUFDakQ7WUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUU1QixNQUFNLElBQUksR0FBRyxJQUFBLDJCQUFpQixFQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLElBQUksU0FBUyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVsQyxPQUFPO2dCQUNMLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBZTtnQkFDdkMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDL0Isd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBNEI7Z0JBQzNDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFlO2FBQ25DLENBQUM7UUFDSixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUE3RkQsZ0RBNkZDIn0=