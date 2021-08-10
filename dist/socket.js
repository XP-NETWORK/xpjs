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
            case 0x1: {
                resolver = polkadot_awaiters['id'];
                if (resolver === undefined) {
                    polkadot_event_buf.set(id, hash);
                    return;
                }
                break;
            }
            case 0x2: {
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
    socket.on("transfer_nft_event", (chain, action_id, hash) => {
        add_event(chain, action_id, hash);
    });
    socket.on("unfreeze_nft_event", (chain, action_id, hash) => {
        add_event(chain, action_id, hash);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFZckUsU0FBZ0IsZUFBZSxDQUFDLEdBQVcsRUFBRSxPQUFpRDtJQUMxRixNQUFNLE1BQU0sR0FBRyxxQkFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVoQyxNQUFNLGlCQUFpQixHQUFhLEVBQUUsQ0FBQztJQUN2QyxNQUFNLGVBQWUsR0FBYSxFQUFFLENBQUM7SUFDckMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztJQUNyRCxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBRW5ELFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTtRQUN0RCxJQUFJLFFBQVEsQ0FBQztRQUNiLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDTixRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDakMsT0FBTztpQkFDVjtnQkFDRCxNQUFNO2FBQ1Q7WUFDRCxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNOLFFBQVEsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0IsT0FBTztpQkFDVjtnQkFDRCxNQUFNO2FBQ1Q7WUFDRCxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNwRDtRQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsQ0FDTCxvQkFBb0IsRUFDcEIsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUMvQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQ0wsb0JBQW9CLEVBQ3BCLENBQUMsS0FBYSxFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUNKLENBQUM7SUFHRixPQUFPO1FBQ0gsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQVU7WUFDL0IsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDcEIsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixPQUFPLElBQUksQ0FBQzthQUNmO1lBRUQsTUFBTSxLQUFLLEdBQW9CLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sS0FBSyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBVTtZQUM3QixNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxNQUFNLEtBQUssR0FBb0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzNDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sS0FBSyxDQUFDO1FBQ3ZCLENBQUM7S0FDSixDQUFBO0FBQ0wsQ0FBQztBQTNFRCwwQ0EyRUMifQ==