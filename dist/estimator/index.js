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
            return result.data.data;
        },
    };
}
exports.signatureService = signatureService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXN0aW1hdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQWMxQixTQUFnQixnQkFBZ0IsQ0FBQyxHQUFXO0lBQzFDLE1BQU0sTUFBTSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUIsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDLENBQUM7SUFDSCxPQUFPO1FBQ0wsS0FBSyxDQUFDLGdCQUFnQixDQUNwQixTQUFxQixFQUNyQixPQUFtQixFQUNuQixHQUFXLEVBQ1gsYUFBcUIsRUFDckIsT0FBZSxFQUNmLEVBQVU7WUFFVixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQzlCLHFCQUFxQixFQUNyQjtnQkFDRSxTQUFTO2dCQUNULE9BQU87Z0JBQ1AsR0FBRztnQkFDSCxFQUFFO2dCQUNGLE9BQU87Z0JBQ1AsYUFBYTthQUNkLENBQ0YsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBM0JELDRDQTJCQyJ9