"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeContract = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const Contract = tonweb_1.default.Contract;
const Cell = tonweb_1.default.boc.Cell;
class BridgeContract extends Contract {
    constructor(provider, options) {
        super(provider, options);
        this.getPublicKey = async () => {
            const address = await this.getAddress();
            const result = await this.provider.call2(address.toString(), "get_public_key");
            return result;
        };
        this.isInitialized = async () => {
            const address = await this.getAddress();
            const result = await this.provider.call2(address.toString(), "is_initialized");
            return result;
        };
        this.getActionId = async () => {
            const address = await this.getAddress();
            const result = await this.provider.call2(address.toString(), "get_action_id");
            return result;
        };
        this.getWhitelist = async () => {
            const address = await this.getAddress();
            const result = await this.provider.call2(address.toString(), "get_whitelist");
            return result;
        };
        this.methods.seqno = () => {
            return {
                call: async () => {
                    const address = await this.getAddress();
                    let n = null;
                    try {
                        n = (await provider.call2(address.toString(), "seqno")).toNumber();
                    }
                    catch (e) {
                        console.log(e);
                    }
                    return n;
                },
            };
        };
        this.methods.getPublicKey = this.getPublicKey;
        this.methods.isInitialized = this.isInitialized;
        this.methods.getActionId = this.getActionId;
        this.methods.getWhitelist = this.getWhitelist;
    }
    serializeUri(uri) {
        return new TextEncoder().encode(encodeURI(uri));
    }
    async createWithdrawBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(new tonweb_1.default.Address(this.options.burner)); // target address
        cell.bits.writeAddress(await this.getAddress()); // bridge as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(new bn_js_1.default(0)); // forward amount
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell
        const msg = new Cell();
        msg.bits.writeUint(params.chainNonce, 8);
        msg.bits.writeBytes(params.to);
        cell.refs[0] = msg;
        return cell;
    }
    async createFreezeBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(await this.getAddress()); // target address
        cell.bits.writeAddress(undefined); // undefined as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.amount || new bn_js_1.default(0));
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell
        const payload = new Cell();
        payload.bits.writeUint(params.chainNonce, 8);
        payload.bits.writeUint(params.to.length, 16);
        payload.bits.writeBytes(params.to);
        payload.bits.writeBytes(params.mintWith);
        cell.refs[0] = payload;
        return cell;
    }
}
exports.BridgeContract = BridgeContract;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLWJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Rvbi1icmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXVCO0FBQ3ZCLG9EQUFrRTtBQUdsRSxNQUFNLFFBQVEsR0FBRyxnQkFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLElBQUksR0FBRyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUErQjdCLE1BQWEsY0FBZSxTQUFRLFFBQXNDO0lBQ3hFLFlBQVksUUFBc0IsRUFBRSxPQUFzQjtRQUN4RCxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBK0QzQixpQkFBWSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsZ0JBQWdCLENBQ2pCLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsZ0JBQWdCLENBQ2pCLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixnQkFBVyxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsZUFBZSxDQUNoQixDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsaUJBQVksR0FBRyxLQUFLLElBQUksRUFBRTtZQUN4QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUN0QyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQ2xCLGVBQWUsQ0FDaEIsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQS9GQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUU7WUFDeEIsT0FBTztnQkFDTCxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ2YsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDYixJQUFJO3dCQUNGLENBQUMsR0FBRyxDQUFDLE1BQU0sUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDcEU7b0JBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDaEI7b0JBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQzthQUNGLENBQUM7UUFDSixDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ2hELENBQUM7SUFFRCxZQUFZLENBQUMsR0FBVztRQUN0QixPQUFPLElBQUksV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBc0I7UUFDN0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLGdCQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtRQUNsRixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsNkJBQTZCO1FBQzlFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxtREFBbUQ7UUFFOUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUVuQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBb0I7UUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCO1FBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO1FBQ25FLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1EQUFtRDtRQUU5RSxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FxQ0Y7QUFwR0Qsd0NBb0dDIn0=