"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const near_api_js_1 = require("near-api-js");
const consts_1 = require("../consts");
async function nearHelperFactory({ networkId, bridge, rpcUrl, }) {
    const near = await (0, near_api_js_1.connect)({
        nodeUrl: rpcUrl,
        networkId,
        headers: {},
    });
    const getMinter = async (connection) => {
        return new near_api_js_1.Contract(connection, bridge, {
            changeMethods: ["freeze_nft"],
            viewMethods: [],
        });
    };
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mint_with, gasLimit) {
            const minter = await getMinter(sender);
            const resp = minter.freeze_nft({
                token_id: id.native.tokenId,
                chain_nonce,
                to,
                amt: new bignumber_js_1.default(txFees),
                mint_with,
            }, gasLimit !== null && gasLimit !== void 0 ? gasLimit : near_api_js_1.DEFAULT_FUNCTION_CALL_GAS, txFees);
            return resp;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const minter = await getMinter(sender);
            const resp = minter.withdraw_nft(
            // token_id: TokenId, chain_nonce: u8, to: String, amt: u128
            {
                token_id: id.native.tokenId,
                chain_nonce: nonce,
                to,
                amt: new bignumber_js_1.default(txFees),
            }, near_api_js_1.DEFAULT_FUNCTION_CALL_GAS, txFees);
            return resp;
        },
        async validateAddress(adr) {
            try {
                new near_api_js_1.Account(near.connection, adr).accountId;
                return true;
            }
            catch (e) {
                return false;
            }
        },
    };
}
exports.nearHelperFactory = nearHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLDZDQUtxQjtBQUNyQixzQ0FBa0M7QUEwQjNCLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxFQUN0QyxTQUFTLEVBQ1QsTUFBTSxFQUNOLE1BQU0sR0FDSztJQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO1FBQ3pCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsU0FBUztRQUNULE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFVBQW1CLEVBQUUsRUFBRTtRQUM5QyxPQUFPLElBQUksc0JBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO1lBQ3RDLGFBQWEsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUM3QixXQUFXLEVBQUUsRUFBRTtTQUNoQixDQUFRLENBQUM7SUFDWixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUztZQUN6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxRQUFRO1lBQ04sT0FBTyxjQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CLENBQ3hCLE1BQU0sRUFDTixXQUFXLEVBQ1gsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVE7WUFFUixNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUM1QjtnQkFDRSxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUMzQixXQUFXO2dCQUNYLEVBQUU7Z0JBQ0YsR0FBRyxFQUFFLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLFNBQVM7YUFDVixFQUNELFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLHVDQUF5QixFQUNyQyxNQUFNLENBQ1AsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSztZQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWTtZQUM5Qiw0REFBNEQ7WUFDNUQ7Z0JBQ0UsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDM0IsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLEVBQUU7Z0JBQ0YsR0FBRyxFQUFFLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUM7YUFDM0IsRUFDRCx1Q0FBeUIsRUFDekIsTUFBTSxDQUNQLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsSUFBSTtnQkFDRixJQUFJLHFCQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzVDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBM0VELDhDQTJFQyJ9