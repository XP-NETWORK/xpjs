"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const buf = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFpQnJFLFNBQWdCLGVBQWUsQ0FBQyxHQUFXLEVBQUUsT0FBaUQ7SUFDMUYsTUFBTSxNQUFNLEdBQUcscUJBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO0lBRXRCLFNBQVMsU0FBUyxDQUFDLEtBQWEsRUFBRSxFQUFVLEVBQUUsSUFBWTtRQUM1RCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3ZDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUMxQixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNoQyxPQUFPO1NBQ1A7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsQ0FDTCxvQkFBb0IsRUFDcEIsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUMvQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQ0wsb0JBQW9CLEVBQ3BCLENBQUMsS0FBYSxFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUNKLENBQUM7SUFHRixPQUFPO1FBQ1QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUI7WUFDaEQsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUM1QyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxLQUFLLEdBQW9CLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUNHLENBQUE7QUFDTixDQUFDO0FBMUNELDBDQTBDQyJ9