"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function txResBuf() {
    const inner = {};
    const requireChain = (chain_id) => {
        if (inner[chain_id] === undefined) {
            inner[chain_id] = {};
        }
    };
    return {
        getResolver(chain_id, action_id) {
            var _a;
            requireChain(chain_id);
            return (_a = inner[chain_id][action_id]) === null || _a === void 0 ? void 0 : _a.resolve;
        },
        setResolver(chain_id, action_id, resolver) {
            requireChain(chain_id);
            inner[chain_id][action_id] = { resolve: resolver };
        },
        getEventRes(chain_id, action_id) {
            var _a;
            requireChain(chain_id);
            return (_a = inner[chain_id][action_id]) === null || _a === void 0 ? void 0 : _a.event_res;
        },
        setEventRes(chain_id, action_id, res) {
            requireChain(chain_id);
            inner[chain_id][action_id] = { event_res: res };
        },
        unsetAction(chain_id, action_id) {
            requireChain(chain_id);
            inner[chain_id][action_id] = undefined;
        }
    };
}
/**
 * Create a [[TxnSocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const buf = txResBuf();
    function add_event(chain, id, hash) {
        const resolve = buf.getResolver(chain, id);
        if (resolve === undefined) {
            buf.setEventRes(chain, id, hash);
            return;
        }
        resolve(hash);
    }
    socket.on("tx_executed_event", (chain, action_id, hash) => {
        add_event(chain, action_id, hash);
    });
    return {
        async waitTxHash(chain, action_id) {
            const hash = buf.getEventRes(chain, action_id);
            if (hash !== undefined) {
                buf.unsetAction(chain, action_id);
                return hash;
            }
            const hashP = new Promise(r => {
                buf.setResolver(chain, action_id, r);
            });
            return await hashP;
        }
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFrQ3JFLFNBQVMsUUFBUTtJQUNoQixNQUFNLEtBQUssR0FBa0IsRUFBRSxDQUFDO0lBRWhDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1FBQ3pDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNsQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3JCO0lBQ0YsQ0FBQyxDQUFBO0lBRUQsT0FBTztRQUNOLFdBQVcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCOztZQUM5QyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsT0FBTyxNQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsMENBQUUsT0FBTyxDQUFDO1FBQzVDLENBQUM7UUFDRCxXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLFFBQWdDO1lBQ2hGLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUNELFdBQVcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCOztZQUM5QyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsT0FBTyxNQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsMENBQUUsU0FBUyxDQUFDO1FBQzlDLENBQUM7UUFDRCxXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLEdBQVc7WUFDM0QsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsV0FBVyxDQUFDLFFBQWdCLEVBQUUsU0FBaUI7WUFDOUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDeEMsQ0FBQztLQUNELENBQUE7QUFDRixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixlQUFlLENBQUMsR0FBVyxFQUFFLE9BQWlEO0lBQzFGLE1BQU0sTUFBTSxHQUFHLHFCQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLE1BQU0sR0FBRyxHQUFhLFFBQVEsRUFBRSxDQUFDO0lBRTlCLFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTtRQUM1RCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDMUIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDUDtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBRSxDQUNMLG1CQUFtQixFQUNuQixDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBRSxFQUFFO1FBQy9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FDSixDQUFDO0lBR0YsT0FBTztRQUNULEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCO1lBQ2hELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdkIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLEtBQUssR0FBb0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUNHLENBQUE7QUFDTixDQUFDO0FBcENELDBDQW9DQyJ9