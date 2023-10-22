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
    const getContract = async (address) => await request.get(`/contracts/${address}`).catch(() => undefined);
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
            const res = await getContract(address);
            return Boolean(res);
        },
        async getEVMAddress(address) {
            const res = await getContract(address);
            if (res?.data?.evm_address) {
                return res.data.evm_address;
            }
            throw new Error("Failed to convert address to EVM format");
        },
        async getEVMAccount(address) {
            const res = await request.get(`/accounts/${address}`);
            if (res?.data?.evm_address) {
                return res.data.evm_address;
            }
            throw new Error("Failed to convert address to EVM format");
        },
        async readContract(to, data) {
            const res = await request.post(`/contracts/call`, {
                data,
                to,
            });
            return res.data.result;
        },
    };
}
exports.hederaService = hederaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2hlZGVyYUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFXMUIsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDdkMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxPQUFlLEVBQUUsRUFBRSxDQUM1QyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVwRSxPQUFPO1FBQ0wsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPO1lBQ3JCLElBQUk7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFDbkI7WUFBQyxNQUFNO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPO1lBQ3ZCLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMzRCxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU87WUFDdEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN6QixNQUFNLEdBQUcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQzdCO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDRCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0RCxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQzdCO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQVUsRUFBRSxJQUFTO1lBQ3RDLE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDaEQsSUFBSTtnQkFDSixFQUFFO2FBQ0gsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN6QixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUEvQ0Qsc0NBK0NDIn0=