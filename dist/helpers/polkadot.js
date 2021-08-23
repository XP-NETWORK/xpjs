"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polkadotPalletHelperFactory = exports.toHex = void 0;
/**
 * Polkadot Implementation for cross chain traits
 * @module
 */
const api_1 = require("@polkadot/api");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("./chain");
const types_1 = require("@polkadot/types");
const encoding_1 = require("validator/dist/encoding");
const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
    LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}
/**
 * @internal
 */
// End Pre-Init
function toHex(buffer) {
    let out = '';
    for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
        out += LUT_HEX_8b[buffer[idx]];
    }
    return `0x${out}`;
}
exports.toHex = toHex;
async function basePolkadotHelper(node_uri) {
    const provider = new api_1.WsProvider(node_uri);
    const api = await api_1.ApiPromise.create({ provider, types: runtimeTypes });
    const base = {
        async balance(address) {
            const res = await api.query.system.account(address);
            return new bignumber_js_1.default(res['data']['free'].toString());
        }
    };
    return [base, api];
}
function hasAddrField(ob) {
    return ob.hasOwnField('address') && typeof ob.address == "string";
}
async function resolve_event_id(ext, filter, signer, options) {
    let call;
    if (options) {
        options.nonce = -1;
        call = async (cb) => await ext.signAndSend(signer, options, cb);
    }
    else {
        call = async (cb) => await ext.signAndSend(signer, { nonce: -1 }, cb);
    }
    const evP = new Promise((res, rej) => {
        call(({ events, status }) => {
            if (!status.isInBlock) {
                return;
            }
            const ev = events.find(e => e.event.method == filter);
            if (ev === undefined) {
                rej();
                return;
            }
            const action_id = new bignumber_js_1.default(ev.event.data[0].toString());
            const hash = status.asInBlock;
            res([hash, action_id]);
        });
    });
    try {
        return await evP;
    }
    catch (e) {
        if (e.message.contains("Priority is too low")) {
            throw chain_1.ConcurrentSendError();
        }
        throw e;
    }
}
/**
 * Create an object implementing Cross Chain utilities for Polkadot
 *
 * @param node_uri URI of the polkadot node
 */
const polkadotPalletHelperFactory = async (node_uri) => {
    const [base, api] = await basePolkadotHelper(node_uri);
    const keyring = new api_1.Keyring();
    const sudoSigner = keyring.createFromUri("//Alice", undefined, "sr25519");
    const decoder = new TextDecoder();
    function nftListMapper([nft_id, data]) {
        return [nft_id.toString(), data];
    }
    async function getLockedNft(hash) {
        const com = await api.query.nft.lockedCommodities(hash);
        if (com.isNone) {
            return undefined;
        }
        const [_owner, dat] = com.unwrap();
        return dat;
    }
    return Object.assign(Object.assign({}, base), { async balanceWrapped(address, chain_nonce) {
            const res = await api.query.erc1155.balances(address, chain_nonce);
            return new bignumber_js_1.default(res.toString());
        },
        async balanceWrappedBatch(address, chain_nonces) {
            // Multi query with address, chain_nonce
            const res = await api.query.erc1155.balances.multi(chain_nonces.map(c => [address, c]));
            // Convert list of balances to [chain_nonce, balance]
            return new Map(res.map((b, i) => [chain_nonces[i], b.isSome ? new bignumber_js_1.default(b.unwrap().toString()) : new bignumber_js_1.default(0)]));
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            return await resolve_event_id(api.tx.freezer.send(chain_nonce, to, value.toString()), "TransferFrozen", sender.sender, sender.options);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            return await resolve_event_id(api.tx.freezer.withdrawWrapped(chain_nonce, to, value.toString()), "UnfreezeWrapped", sender.sender, sender.options);
        },
        async transferNftToForeign(sender, chain_nonce, to, nft_id) {
            return await resolve_event_id(api.tx.freezer.sendNft(chain_nonce, to, nft_id), "TransferUniqueFrozen", sender.sender, sender.options);
        },
        async unfreezeWrappedNft(sender, to, nft_id) {
            return await resolve_event_id(api.tx.freezer.withdrawWrappedNft(to, nft_id), "UnfreezeUniqueWrapped", sender.sender, sender.options);
        },
        async mintNft(owner, info) {
            let addr;
            // "static typing :|"
            if (typeof owner.sender == "string") {
                addr = owner.sender;
            }
            else if (hasAddrField(owner.sender)) {
                addr = owner.sender.address;
            }
            else {
                addr = owner.sender.toString();
            }
            await api.tx.sudo.sudo(api.tx.nft.mint(addr, toHex(info))).signAndSend(sudoSigner, { nonce: -1 });
        },
        async listNft(owner) {
            const com = await api.query.nft.commoditiesForAccount(owner.toString());
            if (com.isNone) {
                return new Map();
            }
            const c = Array.from(com.unwrap()).map(nftListMapper);
            return new Map(c);
        },
        getLockedNft,
        decodeWrappedNft(raw_data) {
            const packed = encoding_1.NftPacked.deserializeBinary(Uint8Array.from(raw_data));
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8()
            };
        },
        async decodeUrlFromRaw(data) {
            const locked = await getLockedNft(new types_1.U8aFixed(api.registry, data, 256));
            if (locked === undefined) {
                throw Error("not a locked nft");
            }
            return decoder.decode(locked.slice(-24));
        } });
};
exports.polkadotPalletHelperFactory = polkadotPalletHelperFactory;
const runtimeTypes = {
    ActionId: "u128",
    TokenId: "u64",
    CommodityId: "H256",
    CommodityInfo: "Bytes",
    NftId: "H256",
    NftInfo: "Bytes",
    Erc1155Balance: "Balance",
    Commodity: "(H256, Bytes)",
    LocalAction: {
        _enum: {
            //@ts-expect-error enum struct
            Unfreeze: {
                to: "AccountId",
                value: "Balance",
            },
            //@ts-expect-error enum struct
            RpcCall: {
                contract: "AccountId",
                call_data: "Bytes",
            },
            //@ts-expect-error enum struct
            TransferWrapped: {
                to: "AccountId",
                value: "Balance",
            },
        },
    },
    ActionInfo: {
        action: "LocalAction",
        validators: "BTreeSet<AccountId>",
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCx1Q0FBZ0U7QUFHaEUsZ0VBQXFDO0FBQ3JDLG1DQWVpQjtBQUdqQiwyQ0FBeUU7QUFDekUsc0RBQW1EO0FBMENuRCxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3BHLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDOUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUN4RTtBQUNEOztHQUVHO0FBQ0gsZUFBZTtBQUNmLFNBQWdCLEtBQUssQ0FBQyxNQUFrQjtJQUN0QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3ZELEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDaEM7SUFDRCxPQUFP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