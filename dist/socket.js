"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txnSocketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function pairActionAlgo(action_id) {
    const numId = parseInt(action_id);
    return numId >= 15 ? numId * 15 + 15 + numId : numId + 15 * 15;
}
function socketResBuf() {
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
function add_event(buf, chain, id, data) {
    const resolve = buf.getResolver(chain, id);
    if (resolve === undefined) {
        buf.setEventRes(chain, id, data);
        return;
    }
    resolve(data);
}
async function waitSocketData(buf, chain, action_id) {
    const data = buf.getEventRes(chain, action_id);
    if (data !== undefined) {
        buf.unsetAction(chain, action_id);
        return data;
    }
    const dataP = new Promise(r => {
        buf.setResolver(chain, action_id, r);
    });
    return await dataP;
}
/**
 * Create a [[TxnSocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
function txnSocketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const txbuf = socketResBuf();
    const algoBuf = socketResBuf();
    socket.on("tx_executed_event", (chain, action_id, hash) => {
        add_event(txbuf, chain, action_id, hash);
    });
    socket.on("algorand_minted_event", (_, action_id, app_id, nft_id) => add_event(algoBuf, 15, action_id, {
        appId: app_id,
        nftId: nft_id
    }));
    return {
        async waitTxHash(chain, action_id) {
            return await waitSocketData(txbuf, chain, action_id);
        },
        async waitAlgorandNft(action_id) {
            // Validator sends a an action paired with chain id
            // this is implementation dependent on validator
            const paired = pairActionAlgo(action_id).toString();
            return await waitSocketData(algoBuf, 15, paired);
        }
    };
}
exports.txnSocketHelper = txnSocketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUE4Q3JFLFNBQVMsY0FBYyxDQUFDLFNBQWlCO0lBQ3ZDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsQyxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsR0FBQyxFQUFFLENBQUM7QUFDL0QsQ0FBQztBQUVELFNBQVMsWUFBWTtJQUNuQixNQUFNLEtBQUssR0FBeUIsRUFBRSxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1FBQ3hDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNqQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNMLFdBQVcsQ0FDVCxRQUFnQixFQUNoQixTQUFpQjs7WUFFakIsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLE9BQU8sTUFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLDBDQUFFLE9BQU8sQ0FBQztRQUM3QyxDQUFDO1FBQ0QsV0FBVyxDQUNULFFBQWdCLEVBQ2hCLFNBQWlCLEVBQ2pCLFFBQTJCO1lBRTNCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUNELFdBQVcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCOztZQUM3QyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7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