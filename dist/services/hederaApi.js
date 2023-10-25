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
        async getTranactionIdByHash(hash) {
            const getTimestamp = (hash) => new Promise(async (resolve, reject) => {
                let timestamp;
                const tm = setTimeout(() => reject("Time out on getTimestapm "), 120 * 1000);
                while (!timestamp) {
                    await new Promise((r) => setTimeout(r, 3000));
                    const result = await request
                        .get(`/contracts/results/${hash}`)
                        .catch(() => undefined);
                    timestamp = result?.data?.timestamp;
                }
                clearTimeout(tm);
                resolve(timestamp);
            });
            const timestamp = await getTimestamp(hash);
            const error = new Error(`Failed to decode ${hash} to transactionId`);
            if (!timestamp) {
                throw error;
            }
            await new Promise((r) => setTimeout(r, 4000));
            const transactions = await request
                .get(`/transactions?timestamp=${timestamp}`)
                .catch(() => undefined);
            const transaction = transactions?.data?.transactions?.at(0);
            if (!transaction?.transaction_id) {
                throw error;
            }
            return transaction.transaction_id;
        },
    };
}
exports.hederaService = hederaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2hlZGVyYUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFZMUIsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDdkMsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixPQUFPLEVBQUUsR0FBRztLQUNiLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxPQUFlLEVBQUUsRUFBRSxDQUM1QyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVwRSxPQUFPO1FBQ0wsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPO1lBQ3JCLElBQUk7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFDbkI7WUFBQyxNQUFNO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2FBQ1g7UUFDSCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPO1lBQ3ZCLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMzRCxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU87WUFDdEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELEtBQUss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