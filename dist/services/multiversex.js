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
            let event = undefined;
            let timedout = false;
            const tm1 = setTimeout(() => {
                timedout = true;
            }, 1000 * 60 * 3);
            while (!event && !timedout) {
                const res = await api.get(`/transactions/${hash}?withResults=true`);
                event = res?.data?.results
                    ?.find((r) => r.logs)
                    ?.logs?.events?.find((e) => e.identifier === "lock721");
                !event && (await new Promise((r) => setTimeout(r, 10000)));
            }
            if (!event) {
                throw new Error(`Failed to get ${hash} event logs`);
            }
            clearTimeout(tm1);
            const args = (0, factory_1.decodeBase64Array)(event.topics);
            if (!args) {
                throw new Error(`Failed to decode ${hash} topics`);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGl2ZXJzZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvbXVsdGl2ZXJzZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBRTFCLHdDQUErQztBQVkvQyxTQUFnQixrQkFBa0IsQ0FDaEMsTUFBYyxFQUNkLFVBQWtCO0lBRWxCLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLE1BQU07S0FDaEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxLQUFLLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUN6QixPQUFPLEVBQUUsVUFBVTtLQUNwQixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUM7SUFFTixPQUFPO1FBQ0wsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTztZQUNwQyxNQUFNLE9BQU8sR0FBRyxDQUNkLE1BQU0sR0FBRyxDQUFDLFNBQVMsVUFBVSxHQUFHLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FDeEUsRUFBRSxJQUFJLENBQUM7WUFFUixJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLE9BQU8sYUFBYSxDQUFDLENBQUM7YUFDeEQ7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQVU7WUFDaEMsTUFBTSxjQUFjLEdBQUcsQ0FDckIsTUFBTSxHQUFHLENBQUMsZ0JBQWdCLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUMvRCxFQUFFLElBQUksQ0FBQztZQUVSLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLFVBQVUsa0JBQWtCLENBQUMsQ0FBQzthQUNoRTtZQUVELE9BQU8sY0FBYyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSTtZQUMzQixJQUFJLEtBQUssR0FBUSxTQUFTLENBQUM7WUFDM0IsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBRXJCLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFCLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDbEIsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFbEIsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixJQUFJLG1CQUFtQixDQUFDLENBQUM7Z0JBQ3BFLEtBQUssR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU87b0JBQ3hCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUMxQixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDO2dCQUUvRCxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixJQUFJLGFBQWEsQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxCLE1BQU0sSUFBSSxHQUFHLElBQUEsMkJBQWlCLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTdDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxTQUFTLENBQUMsQ0FBQzthQUNwRDtZQUVELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFlO2dCQUN2QyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvQix3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUE0QjtnQkFDM0MsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQWU7YUFDbkMsQ0FBQztRQUNKLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQTdFRCxnREE2RUMifQ==