"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bn_js_1 = require("bn.js");
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
            changeMethods: ["freeze_nft", "withdraw_nft"],
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
        getProvider() {
            return near;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const minter = await getMinter(sender);
            const resp = minter.withdraw_nft(
            // token_id: TokenId, chain_nonce: u8, to: String, amt: u128
            {
                args: {
                    token_id: id.native.tokenId,
                    chain_nonce: parseInt(nonce),
                    to,
                    amt: parseInt(txFees.toString()),
                },
                gas: near_api_js_1.DEFAULT_FUNCTION_CALL_GAS,
                amount: new bn_js_1.BN(txFees.toString()),
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGlDQUEyQjtBQUUzQiw2Q0FNcUI7QUFDckIsc0NBQWtDO0FBaUMzQixLQUFLLFVBQVUsaUJBQWlCLENBQUMsRUFDdEMsU0FBUyxFQUNULE1BQU0sRUFDTixNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsR0FDRTtJQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO1FBQ3pCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsU0FBUztRQUNULE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLFVBQW1CLEVBQUUsRUFBRTtRQUM5QyxPQUFPLElBQUksc0JBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO1lBQ3RDLGFBQWEsRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUM7WUFDN0MsV0FBVyxFQUFFLEVBQUU7U0FDaEIsQ0FBUSxDQUFDO0lBQ1osQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNMLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sY0FBSyxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO1FBQ0QsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLENBQUMsb0JBQW9CLENBQ3hCLE1BQU0sRUFDTixXQUFXLEVBQ1gsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVE7WUFFUixNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUM1QjtnQkFDRSxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUMzQixXQUFXO2dCQUNYLEVBQUU7Z0JBQ0YsR0FBRyxFQUFFLElBQUksc0JBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLFNBQVM7YUFDVixFQUNELFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLHVDQUF5QixFQUNyQyxNQUFNLENBQ1AsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsV0FBVztZQUNULE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSztZQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWTtZQUM5Qiw0REFBNEQ7WUFDNUQ7Z0JBQ0UsSUFBSSxFQUFFO29CQUNKLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU87b0JBQzNCLFdBQVcsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDO29CQUM1QixFQUFFO29CQUNGLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNqQztnQkFDRCxHQUFHLEVBQUUsdUNBQXlCO2dCQUM5QixNQUFNLEVBQUUsSUFBSSxVQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ2xDLENBQ0YsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLElBQUkscUJBQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDNUMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF0RkQsOENBc0ZDIn0=