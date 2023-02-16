"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptosHelper = void 0;
const aptos_1 = require("aptos");
const consts_1 = require("../../consts");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bridge_client_1 = require("./bridge_client");
async function aptosHelper({ feeMargin, rpcUrl, xpnft, bridge, notifier, network, }) {
    const client = new aptos_1.AptosClient(rpcUrl);
    const bridgeClient = new bridge_client_1.BridgeClient(client, bridge, network);
    const coinClient = new aptos_1.CoinClient(client);
    return {
        getNonce() {
            return consts_1.Chain.APTOS;
        },
        getFeeMargin() {
            return feeMargin;
        },
        setPetraSigner(signer) {
            //imposter
            client.generateSignSubmitTransaction = async function (_, payload) {
                return signer.signAndSubmitTransaction(payload);
            };
        },
        balance: async (address) => {
            return new bignumber_js_1.default((await coinClient.checkBalance(address)).toString());
        },
        async validateAddress(adr) {
            try {
                await client.getAccount(adr);
                return true;
            }
            catch (e) {
                return false;
            }
        },
        XpNft: xpnft,
        async estimateValidateTransferNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0);
        },
        async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0);
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith, _gasLimit) {
            const receipt = await bridgeClient.freezeNft(sender, aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version, BigInt(txFees.toString()), chain_nonce, to, mintWith);
            await new Promise((r) => setTimeout(r, 10000));
            await notifier.notifyAptos(receipt);
            return receipt;
        },
        getProvider() {
            return client;
        },
        async mintNft(owner, options) {
            //AptosAccount.fromAptosAccountObject({""})
            const tc = new aptos_1.TokenClient(client);
            if (options.createCollection) {
                await tc.createCollection(owner, "UMT", "UserNftMinter - Mint your NFTs Here To Test", "https://example.com", BigInt(2 ** 64) - BigInt(1));
                const response = await tc.createToken(owner, "UMT", options.name, options.description, 1, options.uri, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                return response;
            }
            else {
                const response = await tc.createToken(owner, options.collection, options.name, options.description, 1, options.uri, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                return response;
            }
        },
        async claimNFT(signer, params) {
            const tokenClient = new aptos_1.TokenClient(client);
            const claim = await tokenClient.claimToken(signer, params.sender, params.creator, params.collectionName, params.name, params.propertyVersion);
            return claim;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const receipt = await bridgeClient.withdrawNft(sender, aptos_1.HexString.ensure(bridge), aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version.toString(), BigInt(txFees.toString()), parseInt(nonce), to, id.native.collection_creator);
            await new Promise((r) => setTimeout(r, 10000));
            await notifier.notifyAptos(receipt);
            return receipt;
        },
    };
}
exports.aptosHelper = aptosHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFjQSxpQ0FNZTtBQUVmLHlDQUFxQztBQUNyQyxnRUFBcUM7QUFDckMsbURBQStDO0FBd0R4QyxLQUFLLFVBQVUsV0FBVyxDQUFDLEVBQ2hDLFNBQVMsRUFDVCxNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxHQUNLO0lBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUxQyxPQUFPO1FBQ0wsUUFBUTtZQUNOLE9BQU8sY0FBSyxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxjQUFjLENBQUMsTUFBVztZQUN4QixVQUFVO1lBQ1YsTUFBTSxDQUFDLDZCQUE2QixHQUFHLEtBQUssV0FDMUMsQ0FBZSxFQUNmLE9BQVk7Z0JBRVosT0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNELE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDekIsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsSUFBSTtnQkFDRixN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