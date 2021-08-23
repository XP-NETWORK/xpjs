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
            const locked = await getLockedNft(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCx1Q0FBZ0U7QUFHaEUsZ0VBQXFDO0FBQ3JDLG1DQWVpQjtBQUlqQixzREFBbUQ7QUEwQ25ELE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEcsTUFBTSxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUM5QixVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQ3hFO0FBQ0Q7O0dBRUc7QUFDSCxlQUFlO0FBQ2YsU0FBZ0IsS0FBSyxDQUFDLE1BQWtCO0lBQ3RDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdkQsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNoQztJQUNELE9BQU8sS0FBSyxHQUFHLEVB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