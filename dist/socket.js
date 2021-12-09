"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const axios_1 = __importDefault(require("axios"));
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
    const dbApi = axios_1.default.create({
        baseURL: uri
    });
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
        async waitAlgorandNft(sourceChain, receiver, action_id) {
            // Validator sends a an action paired with chain id
            // this is implementation dependent on validator
            const paired = pairAction(sourceChain, action_id).toString();
            const dbData = await dbApi.get(`/algorand_event/${receiver}/${paired}`);
            if (dbData.data.app_id) {
                return {
                    appId: parseInt(dbData.data.app_id),
                    nftId: parseInt(dbData.data.nft_id)
                };
            }
            return await waitSocketData(algoBuf, 15, paired);
        },
        async claimNfts(receiver) {
            const dbData = await dbApi.get(`/algorand_event/${receiver}`);
            return dbData.data.result;
        }
    };
}
exports.socketHelper = socketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsdURBQXFFO0FBaURyRSxTQUFTLFVBQVUsQ0FBQyxXQUFtQixFQUFFLFNBQWlCO0lBQ3hELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsQyxPQUFPLEtBQUssSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDeEcsQ0FBQztBQUVELFNBQVMsWUFBWTtJQUNuQixNQUFNLEtBQUssR0FBeUIsRUFBRSxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1FBQ3hDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNqQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNMLFdBQVcsQ0FDVCxRQUFnQixFQUNoQixTQUFpQjs7WUFFakIsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXZCLE9BQU8sTUFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLDBDQUFFLE9BQU8sQ0FBQztRQUM3QyxDQUFDO1FBQ0QsV0FBVyxDQUNULFFBQWdCLEVBQ2hCLFNBQWlCLEVBQ2pCLFFBQTJCO1lBRTNCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUNELFdBQVcsQ0FBQyxRQUFnQixFQUFFLFNBQWlCOztZQUM3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