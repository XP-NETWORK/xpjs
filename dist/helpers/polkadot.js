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
    const keyring = new api_1.Keyring();
    const faucet = keyring.addFromUri("//Bob", undefined, "sr25519");
    const base = {
        async transferFromFaucet(to, value) {
            return await api.tx.balances
                .transfer(to, value.toString())
                .signAndSend(faucet);
        },
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
            return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender.sender, sender.options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx1Q0FBZ0U7QUFFaEUseURBQXlEO0FBRXpELGdFQUFxQztBQXVDckMsS0FBSyxVQUFVLGtCQUFrQixDQUMvQixRQUFnQjtJQUVkLE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLGdCQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBR3ZFLE1BQU0sT0FBTyxHQUFHLElBQUksYUFBTyxFQUFFLENBQUM7SUFDOUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRWpFLE1BQU0sSUFBSSxHQUFHO1FBQ1gsS0FBSyxDQUFDLGtCQUFrQixDQUN0QixFQUFtQyxFQUNuQyxLQUFrQjtZQUVsQixPQUFPLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRO2lCQUN6QixRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDOUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUNYLE9BQWlCO1lBR2pCLE1BQU0sR0FBRyxHQUFRLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpELE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FDRixDQUFBO0lBRUQsT0FBTyxDQUFDLElBQUks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