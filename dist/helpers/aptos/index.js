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
async function aptosHelper({ feeMargin, rpcUrl, xpnft, bridge, notifier, }) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFVQSxpQ0FBNkQ7QUFFN0QseUNBQXFDO0FBQ3JDLGdFQUFxQztBQUNyQyxtREFBK0M7QUEwQnhDLEtBQUssVUFBVSxXQUFXLENBQUMsRUFDaEMsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsR0FDSTtJQUNaLE1BQU0sTUFBTSxHQUFHLElBQUksbUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2QyxNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELE9BQU87UUFDTCxRQUFRO1lBQ04sT0FBTyxjQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTyxTQUFTLENBQUM7UUFDbkIsQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLE1BQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDO1FBQ0QsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CLENBQ3hCLE1BQU0sRUFDTixXQUFXLEVBQ1gsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLEVBQ04sUUFBUSxFQUNSLFNBQVU7WUFFVixNQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQyxTQUFTLENBQzFDLE1BQU0sRUFDTixpQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQzlDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUN6QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDcEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUN6QixXQUFXLEVBQ1gsRUFBRSxFQUNGLFFBQVEsQ0FDVCxDQUFDO1lBQ0YsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwQyxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLO1lBQ3BELE1BQU0sT0FBTyxHQUFHLE1BQU0sWUFBWSxDQUFDLFdBQVcsQ0FDNUMsTUFBTSxFQUNOLGlCQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUN4QixpQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQzlDLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUN6QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFDcEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFDckMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUN6QixRQUFRLENBQUMsS0FBSyxDQUFDLEVBQ2YsRUFBRSxFQUNGLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQzdCLENBQUM7WUFDRixNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQTNFRCxrQ0EyRUMifQ==