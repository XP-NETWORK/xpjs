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
async function aptosHelper({ feeMargin, rpcUrl, xpnft, bridge, }) {
    const client = new aptos_1.AptosClient(rpcUrl);
    const bridgeClient = new bridge_client_1.BridgeClient(client);
    return {
        getNonce() {
            return consts_1.Chain.APTOS;
        },
        getFeeMargin() {
            return feeMargin;
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
        async transferNftToForeign(sender, _chain_nonce, _to, id, _txFees, _mintWith, _gasLimit) {
            const receipt = await bridgeClient.freezeNft(sender, aptos_1.HexString.ensure(bridge), aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version.toString());
            return receipt;
        },
        async unfreezeWrappedNft(_sender, _to, _id, _txFees, _nonce) {
            throw new Error("Method not implemented.");
        },
    };
}
exports.aptosHelper = aptosHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFVQSxpQ0FBNkQ7QUFFN0QseUNBQXFDO0FBQ3JDLGdFQUFxQztBQUNyQyxtREFBK0M7QUF3QnhDLEtBQUssVUFBVSxXQUFXLENBQUMsRUFDaEMsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxHQUNNO0lBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU5QyxPQUFPO1FBQ0wsUUFBUTtZQUNOLE9BQU8sY0FBSyxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsSUFBSTtnQkFDRixNQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztRQUNELEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUztZQUN6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUztZQUN6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFNLEVBQ04sWUFBWSxFQUNaLEdBQUcsRUFDSCxFQUFFLEVBQ0YsT0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFVO1lBRVYsTUFBTSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsU0FBUyxDQUMxQyxNQUFNLEVBQ04saUJBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ3hCLGlCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFDOUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUNwQixFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUN0QyxDQUFDO1lBQ0YsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTTtZQUN6RCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBdkRELGtDQXVEQyJ9