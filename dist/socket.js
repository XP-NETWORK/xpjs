"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const socket_io_client_1 = require("socket.io-client");
function pairAction(sourceChain, action_id) {
    const numId = parseInt(action_id);
    return numId >= sourceChain ? numId * numId + sourceChain + numId : numId + sourceChain * sourceChain;
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
    const dataP = new Promise((r) => {
        buf.setResolver(chain, action_id, r);
    });
    return await dataP;
}
/**
 * Create a [[SocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
function socketHelper(uri, options) {
    const socket = socket_io_client_1.io(uri, options);
    const txbuf = socketResBuf();
    const algoBuf = socketResBuf();
    socket.on("tx_executed_event", (chain, action_id, hash) => {
        add_event(txbuf, chain, action_id, hash);
    });
    socket.on("algorand_minted_event", (_, action_id, app_id, nft_id) => add_event(algoBuf, 15, action_id, {
        appId: app_id,
        nftId: nft_id,
    }));
    return {
        async waitTxHash(chain, action_id) {
            return await waitSocketData(txbuf, chain, action_id);
        },
        async waitAlgorandNft(sourceChain, action_id) {
            // Validator sends a an action paired with chain id
            // this is implementation dependent on validator
            const paired = pairAction(sourceChain, action_id).toString();
            console.log(paired);
            return await waitSocketData(algoBuf, 15, paired);
        },
    };
}
exports.socketHelper = socketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBcUU7QUFnRHJFLFNBQVMsVUFBVSxDQUFDLFdBQW1CLEVBQUUsU0FBaUI7SUFDeEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sS0FBSyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUN4RyxDQUFDO0FBRUQsU0FBUyxZQUFZO0lBQ25CLE1BQU0sS0FBSyxHQUF5QixFQUFFLENBQUM7SUFFdkMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7UUFDeEMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ2pDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsV0FBVyxDQUNULFFBQWdCLEVBQ2hCLFNBQWlCOztZQUVqQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsT0FBTyxNQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsMENBQUUsT0FBTyxDQUFDO1FBQzdDLENBQUM7UUFDRCxXQUFXLENBQ1QsUUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsUUFBMkI7WUFFM0IsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBQ0QsV0FBVyxDQUFDLFFBQWdCLEVBQUUsU0FBaUI7O1lBQzdDLFlBQVksQ0FBQyxRQUFR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