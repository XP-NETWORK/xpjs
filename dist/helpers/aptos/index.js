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
                const trx = await signer.signAndSubmitTransaction(payload);
                return trx.hash;
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
            const receipt = await bridgeClient.withdrawNft(sender, aptos_1.HexString.ensure(bridge), aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version.toString(), BigInt(txFees.toString()), nonce, to, id.native.collection_creator);
            await new Promise((r) => setTimeout(r, 10000));
            await notifier.notifyAptos(receipt);
            return receipt;
        },
    };
}
exports.aptosHelper = aptosHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFhQSxpQ0FNZTtBQUVmLHlDQUFxQztBQUNyQyxnRUFBcUM7QUFDckMsbURBQStDO0FBNER4QyxLQUFLLFVBQVUsV0FBVyxDQUFDLEVBQ2hDLFNBQVMsRUFDVCxNQUFNLEVBQ04sS0FBSyxFQUNMLE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxHQUNLO0lBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELE1BQU0sVUFBVSxHQUFHLElBQUksa0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUxQyxPQUFPO1FBQ0wsUUFBUTtZQUNOLE9BQU8sY0FBSyxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxjQUFjLENBQUMsTUFBVztZQUN4QixVQUFVO1lBQ1YsTUFBTSxDQUFDLDZCQUE2QixHQUFHLEtBQUssV0FDMUMsQ0FBZSxFQUNmLE9BQVk7Z0JBRVosTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztZQUNsQixDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUN6QixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLE1BQU0sVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDNUUsQ0FBQztR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