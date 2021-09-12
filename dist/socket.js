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
        },
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
            const hashP = new Promise((r) => {
                buf.setResolver(chain, action_id, r);
            });
            return await hashP;
        },
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUEyQ3JFLFNBQVMsUUFBUTtJQUNmLE1BQU0sS0FBSyxHQUFrQixFQUFFLENBQUM7SUFFaEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7UUFDeEMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ2pDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsV0FBVyxDQUNULFFBQWdCLEVBQ2hCLFNBQWlCOztZQUVqQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsT0FBTyxNQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsMENBQUUsT0FBTyxDQUFDO1FBQzdDLENBQUM7UUFDRCxXQUFXLENBQ1QsUUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsUUFBZ0M7WUFFaEMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsV0FBVyxDQUFDLFFBQWdCLEVBQUUsU0FBaUI7O1lBQzdDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2QixPQUFPLE1BQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxTQUFTLENBQUM7UUFDL0MsQ0FBQztRQUNELFdBQVcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCLEVBQUUsR0FBVztZQUMxRCxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2xELENBQUM7UUFDRCxXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtZQUM3QyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUN6QyxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGVBQWUsQ0FDN0IsR0FBVyxFQUNYLE9BQWlEO0lBRWpELE1BQU0sTUFBTSxHQUFHLHFCQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sR0FBRyxHQUFhLFFBQVEsRUFBRSxDQUFDO0lBRWpDLFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTtRQUN4RCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDUjtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsQ0FDUCxtQkFBbUIsRUFDbkIsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUNqRCxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQ0YsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQjtZQUMvQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3RCLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNsQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsTUFBTSxLQUFLLEdBQW9CLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDckIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBdENELDBDQXNDQyJ9