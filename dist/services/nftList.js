"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nftList = void 0;
const axios_1 = __importDefault(require("axios"));
const __1 = require("..");
function nftList(url, nftListAuthToken) {
    const nftlistRest = axios_1.default.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${nftListAuthToken}`,
        },
    });
    //if this is mainnet, than backup it with staging indexer
    const nftlistRestBackup = url === __1.AppConfigs.MainNet().nftListUri &&
        axios_1.default.create({
            baseURL: __1.AppConfigs.Staging().nftListUri,
            headers: {
                Authorization: `Bearer ${nftListAuthToken}`,
            },
        });
    return {
        async get(chain, owner) {
            if (chain.getNftListAddr) {
                owner = chain.getNftListAddr(owner);
            }
            let res = await nftlistRest
                .get(`/nfts/${chain.getNonce()}/${owner}`)
                .catch(async (e) => {
                if (!nftlistRestBackup)
                    return e;
                return await nftlistRestBackup.get(`/nfts/${chain.getNonce()}/${owner}`);
            });
            if (res.headers["Retry-After"]) {
                await new Promise((r) => setTimeout(r, 30000));
                return await this.get(chain, owner);
            }
            return res.data.data;
        },
    };
}
exports.nftList = nftList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmZ0TGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9uZnRMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQUMxQiwwQkFBd0Q7QUFjeEQsU0FBZ0IsT0FBTyxDQUFJLEdBQVcsRUFBRSxnQkFBd0I7SUFDOUQsTUFBTSxXQUFXLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMvQixPQUFPLEVBQUUsR0FBRztRQUNaLE9BQU8sRUFBRTtZQUNQLGFBQWEsRUFBRSxVQUFVLGdCQUFnQixFQUFFO1NBQzVDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgseURBQXlEO0lBQ3pELE1BQU0saUJBQWlCLEdBQ3JCLEdBQUcsS0FBSyxjQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsVUFBVTtRQUN2QyxlQUFLLENBQUMsTUFBTSxDQUFDO1lBQ1gsT0FBTyxFQUFFLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVO1lBQ3hDLE9BQU8sRUFBRTtnQkFDUCxhQUFhLEVBQUUsVUFBVSxnQkFBZ0IsRUFBRTthQUM1QztTQUNGLENBQUMsQ0FBQztJQUNMLE9BQU87UUFDTCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQXVDLEVBQUUsS0FBYTtZQUM5RCxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLEtBQUssR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxXQUFXO2lCQUN4QixHQUFHLENBRUQsU0FBUyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUM7aUJBQ3ZDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxpQkFBaUI7b0JBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQyxHQUFHLENBRS9CLFNBQVMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7WUFFTCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF6Q0QsMEJBeUNDIn0=