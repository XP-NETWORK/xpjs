"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scVerify = void 0;
const axios_1 = __importDefault(require("axios"));
const __1 = require("..");
/*interface SignatureServiceResponse {
  signature: string;
  fee: string;
}*/
function scVerify(url) {
    const request = axios_1.default.create({
        baseURL: url,
    });
    return {
        async checkWithOutTokenId(from, chain, sc) {
            return (await request
                .post("/default/checkWithOutTokenId", {
                from,
                chain,
                sc,
            })
                .catch(() => ({ data: false }))).data;
        },
        async list(from, targetChain, fromChain) {
            const res = await request
                .get(`/list?from=${from}&targetChain=${targetChain}&fromChain=${fromChain}&tokenId=1`)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NWZXJpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2NWZXJpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTZDO0FBQzdDLDBCQUE4QjtBQW9COUI7OztHQUdHO0FBRUgsU0FBZ0IsUUFBUSxDQUFDLEdBQVc7SUFDbEMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxFQUFVO1lBQy9ELE9BQU8sQ0FDTCxNQUFNLE9BQU87aUJBQ1YsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNwQyxJQUFJO2dCQUNKLEtBQUs7Z0JBQ0wsRUFBRTthQUNILENBQUM7aUJBQ0QsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUNsQyxDQUFDLElBQUksQ0FBQztRQUNULENBQUM7UUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVksRUFBRSxXQUFtQixFQUFFLFNBQWlCO1lBQzdELE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTztpQkFDdEIsR0FBRyxDQUNGLGNBQWMsSUFBSSxnQkFBZ0IsV0FBVyxjQUFjLFNBQVMsWUFBWSxDQUNqRjtpQkFDQSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBRW5ELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssQ0FBQyxNQUFNLENBQ1YsSUFBWSxFQUNaLEVBQVUsRUFDVixXQUFtQixFQUNuQixTQUFpQixFQUNqQixPQUFnQjtZQUVoQixPQUFPLE1BQU0sT0FBTztpQkFDakIsSUFBSSxDQUNILFNBQVMsRUFDVCxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFDN0M7Z0JBQ0UsT0FBTyxFQUFFLFlBQVE7YUFDbEIsQ0FDRjtpQkFDQSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTztZQUN6QyxPQUFPLE1BQU0sT0FBTztpQkFDakIsSUFBSSxDQUNILFdBQVcsRUFDWDtnQkFDRSxFQUFFO2dCQUNGLEtBQUs7Z0JBQ0wsU0FBUztnQkFDVCxPQUFPO2FBQ1IsRUFDRDtnQkFDRSxPQUFPLEVBQUUsWUFBUTthQUNsQixDQUNGO2lCQUNBLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxTQUFTLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFoRUQsNEJBZ0VDIn0=