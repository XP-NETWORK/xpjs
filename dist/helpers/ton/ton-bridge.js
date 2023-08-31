"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        this.nwls = [];
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
                return this.whiteListedCollections.concat(this.nwls);
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
                        (this.whiteListedCollections = []), 10000;
                    });
                }
                return whitelistedCollections.concat(this.nwls);
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
    async init() {
        try {
            //@ts-ignore
            const nwls = await Promise.resolve().then(() => __importStar(require("./nwl"))).catch((_) => undefined);
            if (nwls) {
                this.nwls.push(...nwls.default);
            }
        }
        catch (_) { }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLWJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL3Rvbi90b24tYnJpZGdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsa0RBQXVCO0FBQ3ZCLG9EQUFrRTtBQUNsRSw2QkFBbUU7QUFFbkUsZ0VBQXFDO0FBRXJDLE1BQU0sUUFBUSxHQUFHLGdCQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sSUFBSSxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztBQWdDN0IsTUFBYSxjQUFlLFNBQVEsUUFBc0M7SUFJeEUsWUFBWSxRQUFzQixFQUFFLE9BQXNCO1FBQ3hELEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFKM0IsMkJBQXNCLEdBQWEsRUFBRSxDQUFDO1FBQ3RDLFNBQUksR0FBYSxFQUFFLENBQUM7UUFnRXBCLGlCQUFZLEdBQUcsS0FBSyxJQUFJLEVBQUU7WUFDeEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDdEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUNsQixnQkFBZ0IsQ0FDakIsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLGtCQUFhLEdBQUcsS0FBSyxJQUFJLEVBQUU7WUFDekIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDdEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUNsQixnQkFBZ0IsQ0FDakIsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLGdC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