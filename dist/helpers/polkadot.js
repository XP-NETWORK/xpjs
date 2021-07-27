"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polkadotPalletHelperFactory = exports.polkadotHelperFactory = void 0;
const api_1 = require("@polkadot/api");
const api_contract_1 = require("@polkadot/api-contract");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
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
const polkadotHelperFactory = async (node_uri, freezer_addr, abi) => {
    const [base, api] = await basePolkadotHelper(node_uri);
    const freezer = new api_contract_1.ContractPromise(api, abi, freezer_addr);
    return Object.assign(Object.assign({}, base), { async transferNativeToForeign(sender, to, value) {
            return await freezer.tx
                .send({ value: value.toString(), gasLimit: -1 }, to)
                .signAndSend(sender.sender, sender.options);
        },
        async unfreezeWrapped(sender, to, value) {
            return await freezer.tx
                .withdrawWrapper({ value: 0, gasLimit: -1 }, to, value.toString())
                .signAndSend(sender.sender, sender.options);
        } });
};
exports.polkadotHelperFactory = polkadotHelperFactory;
function hasAddrField(ob) {
    return ob.hasOwnField('address') && typeof ob.address == "string";
}
const polkadotPalletHelperFactory = async (node_uri) => {
    const [base, api] = await basePolkadotHelper(node_uri);
    return Object.assign(Object.assign({}, base), { async transferNativeToForeign(sender, to, value) {
            return await api.tx.freezer
                .send(to, value.toString())
                .signAndSend(sender.sender, sender.options);
            ;
        },
        async unfreezeWrapped(sender, to, value) {
            return await api.tx.freezer
                .withdrawWrapped(to, value.toString())
                .signAndSend(sender.sender, sender.options);
        },
        async transferNftToForeign(sender, to, nft_id) {
            return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender.sender, sender.options);
        },
        async unfreezeWrappedNft(sender, to, nft_id) {
            return await api.tx.freezer.withdrawWrappedNft(to, nft_id).signAndSend(sender.sender, sender.options);
        },
        async mintNft(owner, info) {
            let addr;
            if (typeof owner.sender == "string") {
                addr = owner.sender;
            }
            else if (hasAddrField(owner.sender)) {
                addr = owner.sender.address;
            }
            else {
                addr = owner.sender.toString();
            }
            await api.tx.nft.mint(addr, info)
                .signAndSend(owner.sender, owner.options);
        },
        async listNft(owner) {
            const com = await api.query.nft.commoditiesForAccount(owner.toString());
            const c = com.toJSON();
            return new Map(Object.entries(c));
        } });
};
exports.polkadotPalletHelperFactory = polkadotPalletHelperFactory;
const runtimeTypes = {
    ActionId: "u128",
    TokenId: "u128",
    CommodityId: "H256",
    CommodityInfo: "Vec<u8>",
    NftId: "H256",
    NftInfo: "Vec<u8>",
    EgldBalance: "Balance",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx1Q0FBdUQ7QUFFdkQseURBQXlEO0FBRXpELGdFQUFxQztBQXlDckMsS0FBSyxVQUFVLGtCQUFrQixDQUMvQixRQUFnQjtJQUVkLE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLGdCQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sSUFBSSxHQUFHO1FBQ1gsS0FBSyxDQUFDLE9BQU8sQ0FDWCxPQUFpQjtZQUdqQixNQUFNLEdBQUcsR0FBUSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDO0tBQ0YsQ0FBQTtJQUVELE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUVNLE1BQU0scUJBQXFCLEdBSUgsS0FBSyxFQUNsQyxRQUFnQixFQUNoQixZQUFvQixFQUNwQixHQUFpQixFQUNqQixFQUFFO0lBQ0YsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRTVELHVDQUNLLElBQUksS0FDUCxLQUFLLENBQUMsdUJBQXVCLENBQzNCLE1BQWMs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