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
    return numId >= sourceChain
        ? numId * numId + sourceChain + numId
        : numId + sourceChain * sourceChain;
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
            requireChain(chain_id);
            return inner[chain_id][action_id]?.resolve;
        },
        setResolver(chain_id, action_id, resolver) {
            requireChain(chain_id);
            inner[chain_id][action_id] = { resolve: resolver };
        },
        getEventRes(chain_id, action_id) {
            requireChain(chain_id);
            return inner[chain_id][action_id]?.event_res;
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
    const socket = (0, socket_io_client_1.io)(uri, options);
    const txbuf = socketResBuf();
    const algoBuf = socketResBuf();
    const dbApi = axios_1.default.create({
        baseURL: uri,
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
                    nftId: parseInt(dbData.data.nft_id),
                };
            }
            return await waitSocketData(algoBuf, 15, paired);
        },
        async claimNfts(receiver) {
            const dbData = await dbApi.get(`/algorand_event/${receiver}`);
            return dbData.data.result;
        },
        async cleanNfts(owner) {
            await dbApi.delete(`/algorand_event/${owner}`);
        },
    };
}
exports.socketHelper = socketHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsdURBQXFFO0FBc0RyRSxTQUFTLFVBQVUsQ0FBQyxXQUFtQixFQUFFLFNBQWlCO0lBQ3hELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsQyxPQUFPLEtBQUssSUFBSSxXQUFXO1FBQ3pCLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLFdBQVcsR0FBRyxLQUFLO1FBQ3JDLENBQUMsQ0FBQyxLQUFLLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUN4QyxDQUFDO0FBRUQsU0FBUyxZQUFZO0lBQ25CLE1BQU0sS0FBSyxHQUF5QixFQUFFLENBQUM7SUFFdkMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7UUFDeEMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ2pDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsV0FBVyxDQUNULFFBQWdCLEVBQ2hCLFNBQWlCO1lBRWpCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDN0MsQ0FBQztRQUNELFdBQVcsQ0FDVCxRQUFnQixFQUNoQixTQUFpQixFQUNqQixRQUEyQjtZQUUzQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFDRCxXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtZQUM3QyxZQUFZ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