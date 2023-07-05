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
        async near(from, to, contract, token_id, receiver) {
            const result = await signer.post("/api/near/", {
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
        async dfinity(from, to, receiver, num) {
            const result = await signer.post("/api/dfinity/", {
                from,
                to,
                receiver,
                num,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvZXN0aW1hdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQStCMUIsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVztJQUMxQyxNQUFNLE1BQU0sR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsT0FBTztRQUNMLEtBQUssQ0FBQyxJQUFJLENBQ1IsSUFBZ0IsRUFDaEIsRUFBYyxFQUNkLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLFFBQWdCO1lBRWhCLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FDOUIsWUFBWSxFQUNaO2dCQUNFLElBQUk7Z0JBQ0osRUFBRTtnQkFDRixRQUFRO2dCQUNSLEdBQUcsRUFBRTtvQkFDSCxRQUFRO29CQUNSLFFBQVE7aUJBQ1Q7YUFDRixDQUNGLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQVc7WUFDM0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUM5QixlQUFlLEVBQ2Y7Z0JBQ0UsSUFBSTtnQkFDSixFQUFFO2dCQUNGLFFBQVE7Z0JBQ1IsR0FBRzthQUNKLENBQ0YsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVE7WUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUM5QixjQUFjLEVBQ2Q7Z0JBQ0UsSUFBSTtnQkFDSixFQUFFO2dCQUNGLFFBQVE7Z0JBQ1IsR0FBRyxFQUFFO29CQUNILFFBQVE7b0JBQ1IsUUFBUTtpQkFDVDthQUNGLENBQ0YsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBdERELDRDQXNEQyJ9