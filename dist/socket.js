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
    socket.on("tx_executed_event", (chain, action_id, hash) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUEwQnJFOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLEdBQVcsRUFBRSxPQUFpRDtJQUMxRixNQUFNLE1BQU0sR0FBRyxxQkFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuQyxNQUFNLEdBQUcsR0FBYTtRQUNyQixDQUFDLEVBQUUsRUFBRTtRQUNMLENBQUMsRUFBRSxFQUFFO1FBQ0wsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsRUFBRTtRQUNMLENBQUMsRUFBRSxFQUFFO0tBQ0wsQ0FBQztJQUVDLFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTs7UUFDNUQsTUFBTSxPQUFPLEdBQUcsTUFBQSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLDBDQUFFLE9BQU8sQ0FBQztRQUN4QyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3JDLE9BQU87U0FDUDtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBRSxDQUNMLG1CQUFtQixFQUNuQixDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBRSxFQUFFO1FBQy9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FDSixDQUFDO0lBR0YsT0FBTztRQUNULEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCOztZQUNoRCxNQUFNLElBQUksR0FBRyxNQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsMENBQUUsU0FBUyxDQUFDO1lBQzlDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdkIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztnQkFDbEMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE1BQU0sS0FBSyxHQUFvQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxNQUFNLEtBQUssQ0FBQztRQUNwQixDQUFDO0tBQ0csQ0FBQTtBQUNOLENBQUM7QUExQ0QsMENBMENDIn0=