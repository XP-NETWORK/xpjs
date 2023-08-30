"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureService = void 0;
const axios_1 = __importDefault(require("axios"));
function signatureService(url) {
    const signer = axios_1.default.create({
        baseURL: url,
    });
    return {
        async getSignatureNear(fromChain, toChain, nft, tokenContract, tokenId, to) {
            const result = await signer.post("/api/get-signature/", {
                fromChain,
                toChain,
                nft,
                to,
                tokenId,
                tokenContract,
            });
            console.log("near signature response", result);
            return result.data.data;
        },
        async getSignatureDfinity(fc, tc, to, num) {
            const result = await signer.post("/api/get-signature/", {
                fromChain: fc,
                toChain: tc,
                to,
                num,
                nft: {},
            });
            return result.data.data;
        },
        async casper(from, to, receiver, contract, token_id) {
            const result = await signer.post("/api/casper/", {
                from,
                to,
                receiver,
                nft: {
                    token_id,
                    contract,
                },
            });
            return result.data.data;
        },
    };
}
exports.signatureService = signatureService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvZXN0aW1hdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQWtDMUIsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVztJQUMxQyxNQUFNLE1BQU0sR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsT0FBTztRQUNMLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDcEIsU0FBcUIsRUFDckIsT0FBbUIsRUFDbkIsR0FBVyxFQUNYLGFBQXFCLEVBQ3JCLE9BQWUsRUFDZixFQUFVO1lBRVYsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUU3QixxQkFBcUIsRUFBRTtnQkFDeEIsU0FBUztnQkFDVCxPQUFPO2dCQUNQLEdBQUc7Z0JBQ0gsRUFBRTtnQkFDRixPQUFPO2dCQUNQLGFBQWE7YUFDZCxDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFXO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FFN0IscUJBQXFCLEVBQUU7Z0JBQ3hCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEVBQUU7Z0JBQ0YsR0FBRztnQkFDSCxHQUFHLEVBQUUsRUFBRTthQUNSLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVE7WUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUU3QixjQUFjLEVBQUU7Z0JBQ2pCLElBQUk7Z0JBQ0osRUFBRTtnQkFDRixRQUFRO2dCQUNSLEdBQUcsRUFBRTtvQkFDSCxRQUFRO29CQUNSLFFBQVE7aUJBQ1Q7YUFDRixDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXJERCw0Q0FxREMifQ==