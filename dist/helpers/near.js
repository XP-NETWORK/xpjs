"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const near_api_js_1 = require("near-api-js");
const consts_1 = require("../consts");
async function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, }) {
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
        XpNft: xpnft,
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
        getFeeMargin() {
            return feeMargin;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLDZDQUtxQjtBQUNyQixzQ0FBa0M7QUErQjNCLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxFQUN0QyxTQUFTLEVBQ1QsTUFBTSxFQUNOLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxHQUNFO0lBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHFCQUFPLEVBQUM7UUFDekIsT0FBTyxFQUFFLE1BQU07UUFDZixTQUFTO1FBQ1QsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsVUFBbUIsRUFBRSxFQUFFO1FBQzlDLE9BQU8sSUFBSSxzQkFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUU7WUFDdEMsYUFBYSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQzdCLFdBQVcsRUFBRSxFQUFFO1NBQ2hCLENBQVEsQ0FBQztJQUNaLENBQUMsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUztZQUN6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELFFBQVE7WUFDTixPQUFPLGNBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEIsQ0FBQztRQUNELEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFNLEVBQ04sV0FBVyxFQUNYLEVBQUUsRUFDRixFQUFFLEVBQ0YsTUFBTSxFQUNOLFNBQVMsRUFDVCxRQUFRO1lBRVIsTUFBTSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FDNUI7Z0JBQ0UsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDM0IsV0FBVztnQkFDWCxFQUFFO2dCQUNGLEdBQUcsRUFBRSxJQUFJLHNCQUFTLENBQUMsTUFBTSxDQUFDO2dCQUMxQixTQUFTO2FBQ1YsRUFDRCxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSx1Q0FBeUIsRUFDckMsTUFBTSxDQUNQLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTyxTQUFTLENBQUM7UUFDbkIsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSztZQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWTtZQUM5Qiw0REFBNEQ7WUFDNUQ7Z0JBQ0UsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDM0IsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLEVBQUU7Z0JBQ0YsR0FBRyxFQUFFLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUM7YUFDM0IsRUFDRCx1Q0FBeUIsRUFDekIsTUFBTSxDQUNQLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsSUFBSTtnQkFDRixJQUFJLHFCQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzVDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBakZELDhDQWlGQyJ9