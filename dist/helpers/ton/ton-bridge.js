"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeContract = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const ton_1 = require("ton");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const Contract = tonweb_1.default.Contract;
const Cell = tonweb_1.default.boc.Cell;
class BridgeContract extends Contract {
    constructor(provider, options) {
        super(provider, options);
        this.whiteListedCollections = [];
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
            if (this.whiteListedCollections.length)
                return this.whiteListedCollections;
            const address = (await this.getAddress()).toString();
            const readContract = async (tries = 1) => {
                try {
                    const res = await this.provider.call(address, "get_whitelist");
                    return res["stack"][0][1].bytes;
                }
                catch (e) {
                    if (tries < 4) {
                        return readContract(tries + 1);
                    }
                    return undefined;
                }
            };
            const bytes = await readContract();
            if (!bytes) {
                throw new Error("Could not load bridge contract state");
            }
            try {
                const cell = ton_1.Cell.fromBoc(Buffer.from(bytes, "base64")).at(0);
                const slice = ton_1.Slice.fromCell(cell);
                const whitelistedCollectionsMap = (0, ton_1.parseDictRefs)(slice, 256);
                const whitelistedCollections = Array.from(whitelistedCollectionsMap.keys()).map((collection) => ton_1.Address.parseRaw(`0:${new bignumber_js_1.default(collection).toString(16)}`).toFriendly());
                if (!this.whiteListedCollections.length) {
                    this.whiteListedCollections = whitelistedCollections;
                    setTimeout(() => {
                        (this.whiteListedCollections = []), 5000;
                    });
                }
                return whitelistedCollections;
            }
            catch (e) {
                console.log(e.message, "error when parsing whitelisted collectons");
                throw new Error(e.message + "::error when parsing whitelisted collectons");
            }
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
        cell.bits.writeUint(10, 64);
        cell.bits.writeAddress(new tonweb_1.default.Address(this.options.burner)); // target address
        cell.bits.writeAddress(await this.getAddress()); // bridge as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(new bn_js_1.default(0)); // forward amount
        cell.bits.writeBit(true); // forward_payload in this slice, not separate cell
        const msg = new Cell();
        msg.bits.writeUint(params.chainNonce, 8);
        msg.bits.writeUint(params.to.length, 16);
        msg.bits.writeBytes(params.to);
        msg.bits.writeBytes(new Uint8Array(12));
        cell.refs[0] = msg;
        return cell;
    }
    async createFreezeBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(20, 64);
        cell.bits.writeAddress(await this.getAddress()); // target address
        cell.bits.writeAddress(await this.getAddress()); // undefined as response address
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLWJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL3Rvbi90b24tYnJpZGdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUF1QjtBQUN2QixvREFBa0U7QUFDbEUsNkJBQW1FO0FBRW5FLGdFQUFxQztBQUVyQyxNQUFNLFFBQVEsR0FBRyxnQkFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLElBQUksR0FBRyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFnQzdCLE1BQWEsY0FBZSxTQUFRLFFBQXNDO0lBR3hFLFlBQVksUUFBc0IsRUFBRSxPQUFzQjtRQUN4RCxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBSDNCLDJCQUFzQixHQUFhLEVBQUUsQ0FBQztRQXNEdEMsaUJBQVksR0FBRyxLQUFLLElBQUksRUFBRTtZQUN4QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUN0QyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQ2xCLGdCQUFnQixDQUNqQixDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxLQUFLLElBQUksRUFBRTtZQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUN0QyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQ2xCLGdCQUFnQixDQUNqQixDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsZ0JBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtZQUN2QixNQUFNLE9BQU8sR0FBRyxNQUFN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