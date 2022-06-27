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
        async notifyWeb3(fromChain, fromHash, actionId, type, toChain, txFees, senderAddress, targetAddress, nftUri, tokenId, contract) {
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
                tokenId,
                contract,
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
                tx_hash: txHash,
            });
        },
        async notifySecret(txHash) {
            await api.post("/tx/scrt", { tx_hash: txHash });
        },
        async notifySolana(txHash) {
            await api.post("/tx/solana", { tx_hash: txHash });
        },
        async notifyDfinity(actionId) {
            await api.post("/tx/dfinity", { action_id: actionId });
        },
    };
}
exports.evNotifier = evNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbm90aWZpZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBSTFCLFNBQWdCLFVBQVUsQ0FBQyxHQUFXO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0wsS0FBSyxDQUFDLFVBQVUsQ0FDZCxTQUFpQixFQUNqQixRQUFnQixFQUNoQixRQUFpQixFQUNqQixJQUFhLEVBQ2IsT0FBZ0IsRUFDaEIsTUFBZSxFQUNmLGFBQXNCLEVBQ3RCLGFBQXNCLEVBQ3RCLE1BQWUsRUFDZixPQUFnQixFQUNoQixRQUFpQjtZQUVqQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN6QixXQUFXLEVBQUUsU0FBUztnQkFDdEIsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLFFBQVE7Z0JBQ1IsSUFBSTtnQkFDSixPQUFPO2dCQUNQLE1BQU07Z0JBQ04sYUFBYTtnQkFDYixhQUFhO2dCQUNiLE1BQU07Z0JBQ04sT0FBTztnQkFDUCxRQUFRO2FBQ1QsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYztZQUM3QixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN6QixPQUFPLEVBQUUsTUFBTTthQUNoQixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FDaEIsTUFBYyxFQUNkLE1BQWMsRUFDZCxJQUFjLEVBQ2QsU0FBNkI7WUFFN0IsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDM0IsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsTUFBTTtnQkFDTixJQUFJO2dCQUNKLFNBQVM7YUFDVixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFjO1lBQzlCLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQzFCLE9BQU8sRUFBRSxNQUFNO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQWM7WUFDakMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDN0IsT0FBTyxFQUFFLE1BQU07YUFDaEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBYztZQUMvQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBYztZQUMvQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBZ0I7WUFDbEMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXZFRCxnQ0F1RUMifQ==