"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polkadotPalletHelperFactory = exports.polkadotHelperFactory = void 0;
const api_1 = require("@polkadot/api");
const api_contract_1 = require("@polkadot/api-contract");
const polkadotHelperFactory = async (node_uri, freezer_addr, abi) => {
    const provider = new api_1.WsProvider(node_uri);
    const api = await api_1.ApiPromise.create({ provider, types: runtimeTypes });
    const freezer = new api_contract_1.ContractPromise(api, abi, freezer_addr);
    const keyring = new api_1.Keyring();
    const faucet = keyring.addFromUri("//Bob", undefined, "sr25519");
    return {
        async transferFromFaucet(to, value) {
            return await api.tx.balances
                .transfer(to, value.toString())
                .signAndSend(faucet);
        },
        async transferNativeToForeign(sender, to, value) {
            return await freezer.tx
                .send({ value: value.toString(), gasLimit: -1 }, to)
                .signAndSend(sender);
        },
        async unfreezeWrapped(sender, to, value) {
            return await freezer.tx
                .withdrawWrapper({ value: 0, gasLimit: -1 }, to, value.toString())
                .signAndSend(sender);
        },
    };
};
exports.polkadotHelperFactory = polkadotHelperFactory;
const polkadotPalletHelperFactory = async (node_uri) => {
    const provider = new api_1.WsProvider(node_uri);
    const api = await api_1.ApiPromise.create({ provider, types: runtimeTypes });
    const keyring = new api_1.Keyring();
    const faucet = keyring.addFromUri("//Bob", undefined, "sr25519");
    return {
        async transferFromFaucet(to, value) {
            return await api.tx.balances.transfer(to, value).signAndSend(faucet);
        },
        async transferNativeToForeign(sender, to, value) {
            return await api.tx.freezer
                .send(to, value.toString())
                .signAndSend(sender);
        },
        async unfreezeWrapped(sender, to, value) {
            return await api.tx.freezer
                .withdrawWrapped(to, value.toString())
                .signAndSend(sender);
        },
        async transferNftToForeign(sender, to, nft_id) {
            return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender);
        },
        async unfreezeWrappedNft(sender, to, nft_id) {
            return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender);
        },
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sa2Fkb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wb2xrYWRvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFFaEUseURBQXlEO0FBOEJsRCxNQUFNLHFCQUFxQixHQUlILEtBQUssRUFDbEMsUUFBZ0IsRUFDaEIsWUFBb0IsRUFDcEIsR0FBaUIsRUFDakIsRUFBRTtJQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLGdCQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRTVELE1BQU0sT0FBTyxHQUFHLElBQUksYUFBTyxFQUFFLENBQUM7SUFDOUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRWpFLE9BQU87UUFDTCxLQUFLLENBQUMsa0JBQWtCLENBQ3RCLEVBQW1DLEVBQ25DLEtBQWtCO1lBRWxCLE9BQU8sTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVE7aUJBQ3pCLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUM5QixXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNELEtBQUssQ0FBQyx1QkFBdUIsQ0FDM0IsTUFBbUIsRUFDbkIsRUFBVSxFQUNWLEtBQWtCO1lBRWxCLE9BQU8sTUFBTSxPQUFPLENBQUMsRUFBRTtpQkFDcEIsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUs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