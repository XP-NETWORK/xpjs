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
    const bridgeClient = new bridge_client_1.BridgeClient(client, bridge);
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith, _gasLimit) {
            const receipt = await bridgeClient.freezeNft(sender, aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version, BigInt(txFees.toString()), chain_nonce, to, mintWith);
            return receipt;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const receipt = await bridgeClient.withdrawNft(sender, aptos_1.HexString.ensure(bridge), aptos_1.HexString.ensure(id.native.collection_creator), id.native.collection_name, id.native.token_name, id.native.property_version.toString(), BigInt(txFees.toString()), parseInt(nonce), to, id.native.collection_creator);
            return receipt;
        },
    };
}
exports.aptosHelper = aptosHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFVQSxpQ0FBNkQ7QUFFN0QseUNBQXFDO0FBQ3JDLGdFQUFxQztBQUNyQyxtREFBK0M7QUF3QnhDLEtBQUssVUFBVSxXQUFXLENBQUMsRUFDaEMsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxHQUNNO0lBQ1osTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXZDLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFdEQsT0FBTztRQUNMLFFBQVE7WUFDTixPQUFPLGNBQUssQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLElBQUk7Z0JBQ0YsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUM7UUFDRCxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxvQkFBb0IsQ0FDeEIsTUFBTSxFQUNOLFdBQVcsRUFDWCxFQUFFLEVBQ0YsRUFBRSxFQUNGLE1BQU0sRUFDTixRQUFRLEVBQ1IsU0FBVTtZQUVWLE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FDMUMsTUFBTSxFQUNOLGlCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFDOUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUNwQixFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQ3pCLFdBQVcsRUFDWCxFQUFFLEVBQ0YsUUFBUSxDQUNULENBQUM7WUFDRixPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLO1lBQ3BELE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFdBQVcsQ0FDNUMsTUFBTSxFQUNOLGlCQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUN4QixpQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQzlDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUN6QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDcEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUN6QixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQ2YsRUFBRSxFQUNGLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQzdCLENBQUM7WUFDRixPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF0RUQsa0NBc0VDIn0=