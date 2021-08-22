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
    function nftListMapper([nft_id, data]) {
        return [nft_id.toString(), data];
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
        async getLockedNft(hash) {
            const com = await api.query.nft.lockedCommodities(hash);
            if (com.isNone) {
                return undefined;
            }
            const [_owner, dat] = com.unwrap();
            return dat;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCx1Q0FBZ0U7QUFHaEUsZ0VBQXFDO0FBQ3JDLG1DQVlpQjtBQTJDakIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwRyxNQUFNLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQzlCLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDeEU7QUFDRDs7R0FFRztBQUNILGVBQWU7QUFDZixTQUFnQixLQUFLLENBQUMsTUFBa0I7SUFDdEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN2RCxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ2hDO0lBQ0QsT0FBTyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ3BC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