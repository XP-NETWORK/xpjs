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
const LUT_HEX_4b = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
    LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xf]}${LUT_HEX_4b[n & 0xf]}`;
}
/**
 * @internal
 */
// End Pre-Init
function toHex(buffer) {
    let out = "";
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
            return new bignumber_js_1.default(res["data"]["free"].toString());
        },
    };
    return [base, api];
}
function hasAddrField(ob) {
    return ob.hasOwnField("address") && typeof ob.address == "string";
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
            const ev = events.find((e) => e.event.method == filter);
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
        const com = (await api.query.nft.lockedCommodities(hash));
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
            const res = await api.query.erc1155.balances.multi(chain_nonces.map((c) => [address, c]));
            // Convert list of balances to [chain_nonce, balance]
            return new Map(res.map((b, i) => [
                chain_nonces[i],
                b.isSome ? new bignumber_js_1.default(b.unwrap().toString()) : new bignumber_js_1.default(0),
            ]));
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
            await api.tx.sudo
                .sudo(api.tx.nft.mint(addr, toHex(info)))
                .signAndSend(sudoSigner, { nonce: -1 });
        },
        async listNft(owner) {
            const com = (await api.query.nft.commoditiesForAccount(owner.toString()));
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
                data: packed.getData_asU8(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCx1Q0FBZ0U7QUFPaEUsZ0VBQXFDO0FBQ3JDLG1DQWVpQjtBQU1qQiwyQ0FBMkU7QUFDM0Usc0RBQW9EO0FBeUNwRCxNQUFNLFVBQVUsR0FBRztJQUNqQixHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0lBQ0gsR0FBRztJQUNILEdBQUc7SUFDSCxHQUFHO0NBQ0osQ0FBQztBQUNGLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDOUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUN4RTtBQUNEOztHQUVHO0FBQ0gsZUFBZTtBQUNmLFNBQWdCLEtBQUssQ0FBQyxNQUFrQjtJQUN0QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3ZELEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDaEM7SUFDRCxPQUFP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