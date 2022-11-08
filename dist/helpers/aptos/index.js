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
            await new Promise((r) => setTimeout(r, 10000));
            await notifier.notifyAptos(receipt);
            return receipt;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFVQSxpQ0FBNkQ7QUFFN0QseUNBQXFDO0FBQ3JDLGdFQUFxQztBQUNyQyxtREFBK0M7QUEyQnhDLEtBQUssVUFBVSxXQUFXLENBQUMsRUFDaEMsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEdBQ0s7SUFDWixNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFL0QsT0FBTztRQUNMLFFBQVE7WUFDTixPQUFPLGNBQUssQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLElBQUk7Z0JBQ0YsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUM7UUFDRCxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxvQkFBb0IsQ0FDeEIsTUFBTSxFQUNOLFdBQVcsRUFDWCxFQUFFLEVBQ0YsRUFBRSxFQUNGLE1BQU0sRUFDTixRQUFRLEVBQ1IsU0FBVTtZQUVWLE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FDMUMsTUFBTSxFQUNOLGlCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFDOUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUNwQixFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQ3pCLFdBQVcsRUFDWCxFQUFFLEVBQ0YsUUFBUSxDQUNULENBQUM7WUFDRixNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUs7WUFDcEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsV0FBVyxDQUM1QyxNQUFNLEVBQ04saUJBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ3hCLGlCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFDOUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQ3pCLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUNwQixFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQ3pCLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFDZixFQUFFLEVBQ0YsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FDN0IsQ0FBQztZQUNGLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBNUVELGtDQTRFQyJ9