"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evNotifier = void 0;
const axios_1 = __importDefault(require("axios"));
function evNotifier(url) {
    const api = axios_1.default.create({
        baseURL: url
    });
    return {
        async notifyWeb3(chainNonce, txHash) {
            await api.post("/tx/web3", {
                chain_nonce: chainNonce,
                tx_hash: txHash
            });
        },
        async notifyTron(txHash) {
            await api.post("/tx/tron", {
                tx_hash: txHash
            });
        },
        async notifyElrond(txHash) {
            await api.post("/tx/elrond", {
                tx_hash: txHash
            });
        },
        async notifyTezos(txHash) {
            await api.post("/tx/tezos", {
                tx_hash: txHash
            });
        }
    };
}
exports.evNotifier = evNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbm90aWZpZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBSzFCLFNBQWdCLFVBQVUsQ0FBQyxHQUFXO0lBQ2xDLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDckIsT0FBTyxFQUFFLEdBQUc7S0FDZixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFrQixFQUFFLE1BQWM7WUFDL0MsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZCLE9BQU8sRUFBRSxNQUFNO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDRCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWM7WUFDM0IsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsT0FBTyxFQUFFLE1BQU07YUFDbEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBYztZQUM3QixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN6QixPQUFPLEVBQUUsTUFBTTthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFjO1lBQzVCLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3hCLE9BQU8sRUFBRSxNQUFNO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSixDQUFBO0FBQ0wsQ0FBQztBQTVCRCxnQ0E0QkMifQ==