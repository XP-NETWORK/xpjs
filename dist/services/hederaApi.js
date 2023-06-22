"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hederaService = void 0;
const axios_1 = __importDefault(require("axios"));
function hederaService(url) {
    const request = axios_1.default.create({
        baseURL: url,
    });
    return {
        async getTokens(address) {
            try {
                const res = (await request.get(`/accounts/${address}/tokens`)).data;
                return res.tokens;
            }
            catch {
                return [];
            }
        },
        async getokenInfo(tokenId) {
            const res = (await request.get(`/tokens/${tokenId}`)).data;
            return res;
        },
        async isContract(address) {
            const res = await request.get(`/contracts/${address}`).catch(() => false);
            return Boolean(res);
        },
    };
}
exports.hederaService = hederaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2hlZGVyYUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFRMUIsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDdkMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU87WUFDckIsSUFBSTtnQkFDRixNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQzthQUNuQjtZQUFDLE1BQU07Z0JBQ04sT0FBTyxFQUFFLENBQUM7YUFDWDtRQUNILENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU87WUFDdkIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzNELE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUNELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTztZQUN0QixNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF0QkQsc0NBc0JDIn0=