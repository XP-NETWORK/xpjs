"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polkadotPalletHelperFactory = exports.toHex = void 0;
const api_1 = require("@polkadot/api");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
    LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}
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
        call = async (cb) => await ext.signAndSend(signer, options, cb);
    }
    else {
        call = async (cb) => await ext.signAndSend(signer, cb);
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
    return await evP;
}
const polkadotPalletHelperFactory = async (node_uri) => {
    const [base, api] = await basePolkadotHelper(node_uri);
    const keyring = new api_1.Keyring();
    const sudoSigner = keyring.createFromUri("//Alice", undefined, "sr25519");
    return Object.assign(Object.assign({}, base), { async transferNativeToForeign(sender, chain_nonce, to, value) {
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
            await api.tx.sudo.sudo(api.tx.nft.mint(addr, toHex(info))).signAndSend(sudoSigner);
        },
        async listNft(owner) {
            const com = await api.query.nft.commoditiesForAccount(owner.toString());
            if (com.isNone) {
                return new Map();
            }
            const c = com.toJSON();
            return new Map(Object.entries(c));
        },
        async getLockedNft(hash) {
            const com = await api.query.nft.lockedCommodities(hash);
            if (com.isNone) {
                return undefined;
            }
            const [_owner, dat] = com.unwrap();
            return dat.toU8a();
        } });
};
exports.polkadotPalletHelperFactory = polkadotPalletHelperFactory;
const runtimeTypes = {
    ActionId: "u128",
    TokenId: "u64",
    CommodityId: "H256",
    CommodityInfo: "Vec<u8>",
    NftId: "H256",
    NftInfo: "Vec<u8>",
    Erc1155Balance: "Balance",
    Commodity: "(H256, Vec<u8>)",
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
                call_data: "Vec<u8>",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx1Q0FBZ0U7QUFHaEUsZ0VBQXFDO0FBMkNyQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3BHLE1BQU0sVUFBVSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7SUFDOUIsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUN4RTtBQUNELGVBQWU7QUFDZixTQUFnQixLQUFLLENBQUMsTUFBa0I7SUFDdEMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN2RCxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ2hDO0lBQ0QsT0FBTyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFORCxzQkFNQztBQUVELEtBQUssVUFBVSxrQkFB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