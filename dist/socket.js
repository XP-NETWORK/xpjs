"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFpQnJFLFNBQWdCLGVBQWUsQ0FBQyxHQUFXLEVBQUUsT0FBaUQ7SUFDMUYsTUFBTSxNQUFNLEdBQUcscUJBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsTUFBTSxHQUFHLEdBQWE7UUFDckIsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsRUFBRTtRQUNMLENBQUMsRUFBRSxFQUFFO1FBQ0wsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsRUFBRTtLQUNMLENBQUM7SUFFQyxTQUFTLFNBQVMsQ0FBQyxLQUFhLEVBQUUsRUFBVSxFQUFFLElBQVk7O1FBQzVELE1BQU0sT0FBTyxHQUFHLE1BQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQywwQ0FBRSxPQUFPLENBQUM7UUFDeEMsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUNyQyxPQUFPO1NBQ1A7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsQ0FDTCxvQkFBb0IsRUFDcEIsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUMvQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQ0wsb0JBQW9CLEVBQ3BCLENBQUMsS0FBYSxFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLEVBQUU7UUFDL0MsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUNKLENBQUM7SUFHRixPQUFPO1FBQ1QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUI7O1lBQ2hELE1BQU0sSUFBSSxHQUFHLE1BQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxTQUFTLENBQUM7WUFDOUMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNsQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxLQUFLLEdBQW9CLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sS0FBSyxDQUFDO1FBQ3BCLENBQUM7S0FDRyxDQUFBO0FBQ04sQ0FBQztBQWhERCwwQ0FnREMifQ==