"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const polkadot_awaiters = {};
    const elrond_awaiters = {};
    const polkadot_event_buf = new Map();
    const elrond_event_buf = new Map();
    function add_event(chain, id, hash) {
        let resolver;
        switch (chain) {
            case "POLKADOT": {
                resolver = polkadot_awaiters['id'];
                if (resolver === undefined) {
                    polkadot_event_buf.set(id, hash);
                    return;
                }
                break;
            }
            case "ELROND": {
                resolver = elrond_awaiters['id'];
                if (resolver === undefined) {
                    elrond_event_buf.set(id, hash);
                    return;
                }
                break;
            }
            default: throw Error(`Unhandled chain ${chain}`);
        }
        resolver(hash);
    }
    socket.on("transfer_nft_event", (chain, event, hash) => {
        add_event(chain, event.action_id.toString(), hash);
    });
    socket.on("unfreeze_nft_event", (chain, event, hash) => {
        add_event(chain, event.id.toString(), hash);
    });
    return {
        async waitTxHashPolkadot(id) {
            const hash = polkadot_event_buf.get(id);
            if (hash !== undefined) {
                polkadot_event_buf.delete(id);
                return hash;
            }
            const hashP = new Promise(r => {
                polkadot_awaiters['id'] = r;
            });
            return await hashP;
        },
        async waitTxHashElrond(id) {
            const hash = elrond_event_buf.get(id);
            if (hash !== undefined) {
                elrond_event_buf.delete(id);
                return hash;
            }
            const hashP = new Promise(r => {
                elrond_awaiters['id'] = r;
            });
            return await hashP;
        }
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFhckUsU0FBZ0IsZUFBZSxDQUFDLEdBQVcsRUFBRSxPQUFpRDtJQUMxRixNQUFNLE1BQU0sR0FBRyxxQkFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVoQyxNQUFNLGlCQUFpQixHQUFhLEVBQUUsQ0FBQztJQUN2QyxNQUFNLGVBQWUsR0FBYSxFQUFFLENBQUM7SUFDckMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUNyRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBRW5ELFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTtRQUN0RCxJQUFJLFFBQVEsQ0FBQztRQUNiLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxVQUFVLENBQUMsQ0FBQztnQkFDYixRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDakMsT0FBTztpQkFDVjtnQkFDRCxNQUFNO2FBQ1Q7WUFDRCxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUNYLFFBQVEsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0IsT0FBTztpQkFDVjtnQkFDRCxNQUFNO2FBQ1Q7WUFDRCxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNwRDtRQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsQ0FDTCxvQkFBb0IsRUFDcEIsQ0FBQyxLQUFhLEVBQUUsS0FBMEIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUN4RCxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUNMLG9CQUFvQixFQUNwQixDQUFDLEtBQWEsRUFBRSxLQUEwQixFQUFFLElBQVksRUFBRSxFQUFFO1FBQ3hELFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQ0osQ0FBQztJQUdGLE9BQU87UUFDSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBVTtZQUMvQixNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxNQUFNLEtBQUssR0FBb0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzNDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUNELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFVO1lBQzdCLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3BCLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDNUIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELE1BQU0sS0FBSyxHQUFvQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDM0MsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDdkIsQ0FBQztLQUNKLENBQUE7QUFDTCxDQUFDO0FBM0VELDBDQTJFQyJ9