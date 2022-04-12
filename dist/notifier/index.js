"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evNotifier = void 0;
const axios_1 = __importDefault(require("axios"));
function evNotifier(url) {
    const api = axios_1.default.create({
        baseURL: url,
    });
    return {
        async notifyWeb3(fromChain, fromHash, actionId, type, toChain, txFees, senderAddress, targetAddress, nftUri) {
            await api.post("/tx/web3", {
                chain_nonce: fromChain,
                tx_hash: fromHash,
                actionId,
                type,
                toChain,
                txFees,
                senderAddress,
                targetAddress,
                nftUri,
            });
        },
        async notifyTron(txHash) {
            await api.post("/tx/tron", {
                tx_hash: txHash,
            });
        },
        async notifyElrond(txHash, sender, uris, action_id) {
            await api.post("/tx/elrond", {
                tx_hash: txHash,
                sender,
                uris,
                action_id,
            });
        },
        async notifyTezos(txHash) {
            await api.post("/tx/tezos", {
                tx_hash: txHash,
            });
        },
        async notifyAlgorand(txHash) {
            await api.post("/tx/algorand", {
                tx_hash: txHash
            });
        }
    };
}
exports.evNotifier = evNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbm90aWZpZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBSTFCLFNBQWdCLFVBQVUsQ0FBQyxHQUFXO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0wsS0FBSyxDQUFDLFVBQVUsQ0FDZCxTQUFpQixFQUNqQixRQUFnQixFQUNoQixRQUFpQixFQUNqQixJQUFhLEVBQ2IsT0FBZ0IsRUFDaEIsTUFBZSxFQUNmLGFBQXNCLEVBQ3RCLGFBQXNCLEVBQ3RCLE1BQWU7WUFFZixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN6QixXQUFXLEVBQUUsU0FBUztnQkFDdEIsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLFFBQVE7Z0JBQ1IsSUFBSTtnQkFDSixPQUFPO2dCQUNQLE1BQU07Z0JBQ04sYUFBYTtnQkFDYixhQUFhO2dCQUNiLE1BQU07YUFDUCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjO1lBQzdCLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pCLE9BQU8sRUFBRSxNQUFNO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUNoQixNQUFjLEVBQ2QsTUFBYyxFQUNkLElBQWMsRUFDZCxTQUFpQjtZQUVqQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUMzQixPQUFPLEVBQUUsTUFBTTtnQkFDZixNQUFNO2dCQUNOLElBQUk7Z0JBQ0osU0FBUzthQUNWLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQWM7WUFDOUIsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDMUIsT0FBTyxFQUFFLE1BQU07YUFDaEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBYztZQUNqQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUM3QixPQUFPLEVBQUUsTUFBTTthQUNoQixDQUFDLENBQUE7UUFDSixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUExREQsZ0NBMERDIn0=