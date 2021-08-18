"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
/**
 * Create a [[TxnSocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const buf = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {}
    };
    function add_event(chain, id, hash) {
        var _a;
        const resolve = (_a = buf[chain][id]) === null || _a === void 0 ? void 0 : _a.resolve;
        if (resolve === undefined) {
            buf[chain][id] = { event_res: hash };
            return;
        }
        resolve(hash);
    }
    socket.on("transfer_nft_event", (chain, action_id, hash) => {
        add_event(chain, action_id, hash);
    });
    socket.on("unfreeze_nft_event", (chain, action_id, hash) => {
        add_event(chain, action_id, hash);
    });
    return {
        async waitTxHash(chain, action_id) {
            var _a;
            const hash = (_a = buf[chain][action_id]) === null || _a === void 0 ? void 0 : _a.event_res;
            if (hash !== undefined) {
                buf[chain][action_id] = undefined;
                return hash;
            }
            const hashP = new Promise(r => {
                buf[chain][action_id] = { resolve: r };
            });
            return await hashP;
        }
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUEwQnJFOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLEdBQVcsRUFBRSxPQUFpRDtJQUMxRixNQUFNLE1BQU0sR0FBRyxxQkFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuQyxNQUFNLEdBQUcsR0FBYTtRQUNyQixDQUFDLEVBQUUsRUFBRTtRQUNMLENBQUMsRUFBRSxFQUFFO1FBQ0wsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsRUFBRTtRQUNMLENBQUMsRUFBRSxFQUFFO0tBQ0wsQ0FBQztJQUVDLFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTs7UUFDNUQsTUFBTSxPQUFPLEdBQUcsTUFBQSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLDBDQUFFLE9BQU8sQ0FBQztRQUN4QyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3JDLE9BQU87U0FDUDtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBRSxDQUNMLG9CQUFvQixFQUNwQixDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBRSxFQUFFO1FBQy9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FDTCxvQkFBb0IsRUFDcEIsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUMvQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQ0osQ0FBQztJQUdGLE9BQU87UUFDVCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQjs7WUFDaEQsTUFBTSxJQUFJLEdBQUcsTUFBQSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLDBDQUFFLFNBQVMsQ0FBQztZQUM5QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLEtBQUssR0FBb0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUNHLENBQUE7QUFDTixDQUFDO0FBaERELDBDQWdEQyJ9