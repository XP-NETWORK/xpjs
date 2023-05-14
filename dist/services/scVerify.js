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
                fromChain: from,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NWZXJpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2NWZXJpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTZDO0FBQzdDLDBCQUE4QjtBQW9COUI7OztHQUdHO0FBRUgsU0FBZ0IsUUFBUSxDQUFDLEdBQVc7SUFDbEMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxFQUFVO1lBQy9ELE9BQU8sQ0FDTCxNQUFNLE9BQU87aUJBQ1YsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNwQyxTQUFTLEVBQUUsSUFBSTtnQkFDZixLQUFLO2dCQUNMLEVBQUU7YUFDSCxDQUFDO2lCQUNELEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDbEMsQ0FBQyxJQUFJLENBQUM7UUFDVCxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFZLEVBQUUsV0FBbUIsRUFBRSxTQUFpQjtZQUM3RCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU87aUJBQ3RCLEdBQUcsQ0FDRixjQUFjLElBQUksZ0JBQWdCLFdBQVcsY0FBYyxTQUFTLFlBQVksQ0FDakY7aUJBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVuRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxLQUFLLENBQUMsTUFBTSxDQUNWLElBQVksRUFDWixFQUFVLEVBQ1YsV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsT0FBZ0I7WUFFaEIsT0FBTyxNQUFNLE9BQU87aUJBQ2pCLElBQUksQ0FDSCxTQUFTLEVBQ1QsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQzdDO2dCQUNFLE9BQU8sRUFBRSxZQUFRO2FBQ2xCLENBQ0Y7aUJBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU87WUFDekMsT0FBTyxNQUFNLE9BQU87aUJBQ2pCLElBQUksQ0FDSCxXQUFXLEVBQ1g7Z0JBQ0UsRUFBRTtnQkFDRixLQUFLO2dCQUNMLFNBQVM7Z0JBQ1QsT0FBTzthQUNSLEVBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLFlBQVE7YUFDbEIsQ0FDRjtpQkFDQSxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLE9BQU8sU0FBUyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBaEVELDRCQWdFQyJ9