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
            const result = await signer.post("/api/get-signature", {
                fromChain: fc,
                toChain: tc,
                to,
                num,
            });
            console.log("dfinity signature response", result);
            return result.data.data;
        },
    };
}
exports.signatureService = signatureService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXN0aW1hdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQXlCMUIsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVztJQUMxQyxNQUFNLE1BQU0sR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsT0FBTztRQUNMLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDcEIsU0FBcUIsRUFDckIsT0FBbUIsRUFDbkIsR0FBVyxFQUNYLGFBQXFCLEVBQ3JCLE9BQWUsRUFDZixFQUFVO1lBRVYsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUM5QixxQkFBcUIsRUFDckI7Z0JBQ0UsU0FBUztnQkFDVCxPQUFPO2dCQUNQLEdBQUc7Z0JBQ0gsRUFBRTtnQkFDRixPQUFPO2dCQUNQLGFBQWE7YUFDZCxDQUNGLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFXO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FDOUIsb0JBQW9CLEVBQ3BCO2dCQUNFLFNBQVMsRUFBRSxFQUFFO2dCQUNiLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEVBQUU7Z0JBQ0YsR0FBRzthQUNKLENBQ0YsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF6Q0QsNENBeUNDIn0=