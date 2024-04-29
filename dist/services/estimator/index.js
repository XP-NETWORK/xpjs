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
        async getSignatureNear(fromChain, toChain, _nft, tokenContract, tokenId, to) {
            const result = await signer.post("/api/near/", {
                from: fromChain,
                to: toChain,
                receiver: to,
                nft: {
                    token_id: tokenId,
                    contract: tokenContract,
                },
            });
            console.log("near signature response", result);
            return result.data.data;
        },
        async getSignatureDfinity(fc, tc, to, num) {
            const result = await signer.post("/api/dfinity/", {
                from: fc,
                to: tc,
                receiver: to,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvZXN0aW1hdG9yL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQWtDMUIsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVztJQUMxQyxNQUFNLE1BQU0sR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQzFCLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsT0FBTztRQUNMLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDcEIsU0FBcUIsRUFDckIsT0FBbUIsRUFDbkIsSUFBWSxFQUNaLGFBQXFCLEVBQ3JCLE9BQWUsRUFDZixFQUFVO1lBRVYsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUU3QixZQUFZLEVBQUU7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsRUFBRSxFQUFFLE9BQU87Z0JBQ1gsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osR0FBRyxFQUFFO29CQUNILFFBQVEsRUFBRSxPQUFPO29CQUNqQixRQUFRLEVBQUUsYUFBYTtpQkFDeEI7YUFDRixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFXO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FFN0IsZUFBZSxFQUFFO2dCQUNsQixJQUFJLEVBQUUsRUFBRTtnQkFDUixFQUFFLEVBQUUsRUFBRTtnQkFDTixRQUFRLEVBQUUsRUFBRTtnQkFDWixHQUFHO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUTtZQUNqRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBRTdCLGNBQWMsRUFBRTtnQkFDakIsSUFBSTtnQkFDSixFQUFFO2dCQUNGLFFBQVE7Z0JBQ1IsR0FBRyxFQUFFO29CQUNILFFBQVE7b0JBQ1IsUUFBUTtpQkFDVDthQUNGLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBckRELDRDQXFEQyJ9