"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const buf = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };
    function add_event(chain, id, hash) {
        const resolve = buf[chain][id].resolve;
        if (resolve === undefined) {
            buf[chain][id].event_res = hash;
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
            const hash = buf[chain][action_id].event_res;
            if (hash !== undefined) {
                buf[chain][action_id].event_res = undefined;
                return hash;
            }
            const hashP = new Promise(r => {
                buf[chain][action_id].resolve = r;
            });
            return await hashP;
        }
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFpQnJFLFNBQWdCLGVBQWUsQ0FBQyxHQUFXLEVBQUUsT0FBaUQ7SUFDMUYsTUFBTSxNQUFNLEdBQUcscUJBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsTUFBTSxHQUFHLEdBQWEsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUV2RCxTQUFTLFNBQVMsQ0FBQyxLQUFhLEVBQUUsRUFBVSxFQUFFLElBQVk7UUFDNUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN2QyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDMUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDaEMsT0FBTztTQUNQO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFFLENBQ0wsb0JBQW9CLEVBQ3BCLENBQUMsS0FBYSxFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUNMLG9CQUFvQixFQUNwQixDQUFDLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQVksRUFBRSxFQUFFO1FBQy9DLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FDSixDQUFDO0lBR0YsT0FBTztRQUNULEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCO1lBQ2hELE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDN0MsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztnQkFDNUMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE1BQU0sS0FBSyxHQUFvQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sS0FBSyxDQUFDO1FBQ3BCLENBQUM7S0FDRyxDQUFBO0FBQ04sQ0FBQztBQTFDRCwwQ0EwQ0MifQ==