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
        cell.bits.writeUint(0, 64);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLWJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Rvbi1icmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXVCO0FBQ3ZCLG9EQUFrRTtBQUNsRSw2QkFBbUU7QUFFbkUsZ0VBQXFDO0FBRXJDLE1BQU0sUUFBUSxHQUFHLGdCQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sSUFBSSxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQWdDN0IsTUFBYSxjQUFlLFNBQVEsUUFBc0M7SUFHeEUsWUFBWSxRQUFzQixFQUFFLE9BQXNCO1FBQ3hELEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFIM0IsMkJBQXNCLEdBQWEsRUFBRSxDQUFDO1FBc0R0QyxpQkFBWSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsZ0JBQWdCLENBQ2pCLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQ3RDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDbEIsZ0JBQWdCLENBQ2pCLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixnQkFBVyxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxD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