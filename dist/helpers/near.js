"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bn_js_1 = __importDefault(require("bn.js"));
const near_api_js_1 = require("near-api-js");
const providers_1 = require("near-api-js/lib/providers");
const consts_1 = require("../consts");
async function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, }) {
    const near = await (0, near_api_js_1.connect)({
        nodeUrl: rpcUrl,
        networkId,
        headers: {},
    });
    return {
        async estimateValidateTransferNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0); // TODO
        },
        async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0); // TODO
        },
        getNonce() {
            return consts_1.Chain.NEAR;
        },
        XpNft: xpnft,
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mint_with, gasLimit) {
            var _a;
            const result = await sender.functionCall({
                contractId: bridge,
                args: {
                    token_id: id.native.tokenId,
                    chain_nonce,
                    to,
                    amt: new bignumber_js_1.default(txFees),
                    mint_with,
                },
                methodName: "freeze_nft",
                attachedDeposit: new bn_js_1.default(txFees.toString()),
                gas: new bn_js_1.default((_a = gasLimit === null || gasLimit === void 0 ? void 0 : gasLimit.toString()) !== null && _a !== void 0 ? _a : near_api_js_1.DEFAULT_FUNCTION_CALL_GAS),
            });
            return [result, (0, providers_1.getTransactionLastResult)(result)];
        },
        getFeeMargin() {
            return feeMargin;
        },
        getProvider() {
            return near;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const result = await sender.functionCall({
                contractId: bridge,
                args: {
                    token_id: id.native.tokenId,
                    chain_nonce: parseInt(nonce),
                    to,
                    amt: parseInt(txFees.toString()),
                },
                methodName: "withdraw_nft",
                attachedDeposit: new bn_js_1.default(txFees.toString()),
                gas: near_api_js_1.DEFAULT_FUNCTION_CALL_GAS,
            });
            return [result, (0, providers_1.getTransactionLastResult)(result)];
        },
        async validateAddress(adr) {
            try {
                await new near_api_js_1.Account(near.connection, adr).getAccountBalance();
                return true;
            }
            catch (e) {
                return false;
            }
        },
    };
}
exports.nearHelperFactory = nearHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGtEQUF1QjtBQUV2Qiw2Q0FBZ0Y7QUFDaEYseURBR21DO0FBQ25DLHNDQUFrQztBQWtDM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEdBQ0U7SUFDWCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEscUJBQU8sRUFBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLFNBQVM7UUFDVCxPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTCxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUztZQUN6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELFFBQVE7WUFDTixPQUFPLGNBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEIsQ0FBQztRQUNELEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFNLEVBQ04sV0FBVyxFQUNYLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxFQUNOLFNBQVMsRUFDVCxRQUFROztZQUVSLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDdkMsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLElBQUksRUFBRTtvQkFDSixRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUMzQixXQUFXO29CQUNYLEVBQUU7b0JBQ0YsR0FBRyxFQUFFLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUM7b0JBQzFCLFNBQVM7aUJBQ1Y7Z0JBQ0QsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLGVBQWUsRUFBRSxJQUFJLGVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzFDLEdBQUcsRUFBRSxJQUFJLGVBQUUsQ0FBQyxNQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxRQUFRLEVBQUUsbUNBQUksdUNBQXlCLENBQUM7YUFDL0QsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLG9DQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsV0FBVztZQUNULE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSztZQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZDLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixJQUFJLEVBQUU7b0JBQ0osUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDM0IsV0FBVyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQzVCLEVBQUU7b0JBQ0YsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ2pDO2dCQUNELFVBQVUsRUFBRSxjQUFjO2dCQUMxQixlQUFlLEVBQUUsSUFBSSxlQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMxQyxHQUFHLEVBQUUsdUNBQXlCO2FBQy9CLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBQSxvQ0FBd0IsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsSUFBSTtnQkFDRixNQUFNLElBQUkscUJBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBOUVELDhDQThFQyJ9