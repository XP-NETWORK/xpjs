"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scVerify = void 0;
const axios_1 = __importDefault(require("axios"));
const __1 = require("..");
function scVerify(url) {
    const request = axios_1.default.create({
        baseURL: url,
    });
    return {
        async checkWithOutTokenId(from, chain, sc) {
            return (await request
                .post("/default/checkWithOutTokenId", {
                fromChain: from.getNonce(),
                chain,
                sc: from.getScVerifyAddr ? from.getScVerifyAddr(sc) : sc,
            })
                .catch(async (e) => {
                //@ts-ignore
                if (e.code === "404" && from.getScVerifyAddr) {
                    return await request
                        .post("/default/checkWithOutTokenId", {
                        fromChain: from.getNonce(),
                        chain,
                        sc,
                    })
                        .catch(() => ({ data: false }));
                }
                return { data: false };
            })).data;
        },
        async list(from, targetChain, fromChain) {
            const res = await request
                .get(`/verify/list?from=${from}&targetChain=${targetChain}&fromChain=${fromChain}&tokenId=1`)
                .catch(() => ({ data: false }));
            if (res.data.data)
                return res.data.data.length > 0;
            return false;
        },
        async verify(from, to, targetChain, fromChain, tokenId) {
            return await request
                .post(`/verify`, { from, to, targetChain, fromChain, tokenId }, {
                headers: __1._headers,
            })
                .catch(() => undefined);
        },
        async default(sc, chain, fromChain, tokenId) {
            return await request
                .post(`/default/`, {
                sc,
                chain,
                fromChain,
                tokenId,
            }, {
                headers: __1._headers,
            })
                .catch(() => {
                return undefined;
            });
        },
    };
}
exports.scVerify = scVerify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NWZXJpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2NWZXJpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXlEO0FBQ3pELDBCQUE4QjtBQThCOUIsU0FBZ0IsUUFBUSxDQUFDLEdBQVc7SUFDbEMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQWEsRUFBRSxFQUFVO1lBQ3ZELE9BQU8sQ0FDTCxNQUFNLE9BQU87aUJBQ1YsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNwQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUIsS0FBSztnQkFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUN6RCxDQUFDO2lCQUNELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBYSxFQUFFLEVBQUU7Z0JBQzdCLFlBQVk7Z0JBQ1osSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUM1QyxPQUFPLE1BQU0sT0FBTzt5QkFDakIsSUFBSSxDQUFDLDhCQUE4QixFQUFFO3dCQUNwQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDMUIsS0FBSzt3QkFDTCxFQUFFO3FCQUNILENBQUM7eUJBQ0QsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNuQztnQkFDRCxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUNMLENBQUMsSUFBSSxDQUFDO1FBQ1QsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWSxFQUFFLFdBQW1CLEVBQUUsU0FBaUI7WUFDN0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPO2lCQUN0QixHQUFHLENBQ0YscUJBQXFCLElBQUksZ0JBQWdCLFdBQVcsY0FBYyxTQUFTLFlBQVksQ0FDeEY7aUJBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVuRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxLQUFLLENBQUMsTUFBTSxDQUNWLElBQVksRUFDWixFQUFVLEVBQ1YsV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsT0FBZ0I7WUFFaEIsT0FBTyxNQUFNLE9BQU87aUJBQ2pCLElBQUksQ0FDSCxTQUFTLEVBQ1QsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQzdDO2dCQUNFLE9BQU8sRUFBRSxZQUFRO2FBQ2xCLENBQ0Y7aUJBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU87WUFDekMsT0FBTyxNQUFNLE9BQU87aUJBQ2pCLElBQUksQ0FDSCxXQUFXLEVBQ1g7Z0JBQ0UsRUFBRTtnQkFDRixLQUFLO2dCQUNMLFNBQVM7Z0JBQ1QsT0FBTzthQUNSLEVBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFlBQVE7YUFDbEIsQ0FDRjtpQkFDQSxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLE9BQU8sU0FBUyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBNUVELDRCQTRFQyJ9