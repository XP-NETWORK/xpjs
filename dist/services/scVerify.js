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
                if ((e.code == "404" || e.message.includes("404")) &&
                    from.getScVerifyAddr) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NWZXJpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2NWZXJpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXlEO0FBQ3pELDBCQUE4QjtBQThCOUIsU0FBZ0IsUUFBUSxDQUFDLEdBQVc7SUFDbEMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBUyxFQUFFLEtBQWEsRUFBRSxFQUFVO1lBQzVELE9BQU8sQ0FDTCxNQUFNLE9BQU87aUJBQ1YsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNwQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUIsS0FBSztnQkFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUN6RCxDQUFDO2lCQUNELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBYSxFQUFFLEVBQUU7Z0JBQzdCLElBQ0UsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLGVBQWUsRUFDcEI7b0JBQ0EsT0FBTyxNQUFNLE9BQU87eUJBQ2pCLElBQUksQ0FBQyw4QkFBOEIsRUFBRTt3QkFDcEMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQzFCLEtBQUs7d0JBQ0wsRUFBRTtxQkFDSCxDQUFDO3lCQUNELEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FDTCxDQUFDLElBQUksQ0FBQztRQUNULENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVksRUFBRSxXQUFtQixFQUFFLFNBQWlCO1lBQzdELE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTztpQkFDdEIsR0FBRyxDQUNGLHFCQUFxQixJQUFJLGdCQUFnQixXQUFXLGNBQWMsU0FBUyxZQUFZLENBQ3hGO2lCQUNBLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVsQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFbkQsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FDVixJQUFZLEVBQ1osRUFBVSxFQUNWLFdBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLE9BQWdCO1lBRWhCLE9BQU8sTUFBTSxPQUFPO2lCQUNqQixJQUFJLENBQ0gsU0FBUyxFQUNULEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUM3QztnQkFDRSxPQUFPLEVBQUUsWUFBUTthQUNsQixDQUNGO2lCQUNBLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO1lBQ3pDLE9BQU8sTUFBTSxPQUFPO2lCQUNqQixJQUFJLENBQ0gsV0FBVyxFQUNYO2dCQUNFLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxTQUFTO2dCQUNULE9BQU87YUFDUixFQUNEO2dCQUNFLE9BQU8sRUFBRSxZQUFRO2FBQ2xCLENBQ0Y7aUJBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixPQUFPLFNBQVMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQTlFRCw0QkE4RUMifQ==