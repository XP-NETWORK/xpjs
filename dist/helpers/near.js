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
async function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, walletUrl, helperUrl, }) {
    const near = await (0, near_api_js_1.connect)({
        nodeUrl: rpcUrl,
        networkId,
        headers: {},
    });
    const isApproved = async (account, nft) => {
        const { tokenId: token_id, contract } = nft.native;
        const result = await account.functionCall({
            args: {
                token_id,
                approved_account_id: bridge,
                approval_id: null,
            },
            contractId: contract,
            methodName: "nft_is_approved",
        });
        const res = (0, providers_1.getTransactionLastResult)(result);
        return res;
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
        async balance(address) {
            const res = (await new near_api_js_1.Account(near.connection, address).getAccountBalance()).available;
            return new bignumber_js_1.default(res);
        },
        async mintNft(owner, options) {
            const result = await owner.functionCall({
                contractId: options.contract,
                methodName: "nft_mint",
                args: {
                    token_id: options.token_id,
                    token_owner_id: options.token_owner_id,
                    token_metadata: options.metadata,
                },
                attachedDeposit: new bn_js_1.default("10000000000000000000000"), // 0.01 Near
            });
            return [result, (0, providers_1.getTransactionLastResult)(result)];
        },
        async nftList(owner, contract) {
            const result = await owner.functionCall({
                contractId: contract,
                methodName: "nft_tokens_for_owner",
                args: { account_id: owner.accountId },
            });
            const res = (0, providers_1.getTransactionLastResult)(result);
            return res.map((r) => {
                return {
                    native: {
                        tokenId: r.token_id,
                        contract,
                    },
                    collectionIdent: contract,
                    uri: r.metadata.extra || r.metadata.media,
                };
            });
        },
        async preTransfer(sender, nft, _fee) {
            if (await isApproved(sender, nft)) {
                return undefined;
            }
            const result = await sender
                .functionCall({
                contractId: nft.native.contract,
                methodName: "nft_approve",
                args: {
                    token_id: nft.native.tokenId,
                    account_id: bridge,
                    msg: "Approval for NFT Transfer via XP Network Multichain NFT Bridge",
                },
                attachedDeposit: new bn_js_1.default("1000000000000000000000"), // 0.001 Near
            })
                .catch((e) => {
                return e["transaction_outcome"]["id"];
            });
            return result;
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
                    token_contract: id.native.contract,
                },
                methodName: "freeze_nft",
                attachedDeposit: new bn_js_1.default(txFees.toString()),
                gas: new bn_js_1.default((_a = gasLimit === null || gasLimit === void 0 ? void 0 : gasLimit.toString()) !== null && _a !== void 0 ? _a : near_api_js_1.DEFAULT_FUNCTION_CALL_GAS),
            });
            await notifier.notifyNear(result.transaction.hash);
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
                    token_contract: id.native.contract,
                },
                methodName: "withdraw_nft",
                attachedDeposit: new bn_js_1.default(txFees.toString()),
                gas: near_api_js_1.DEFAULT_FUNCTION_CALL_GAS,
            });
            await notifier.notifyNear(result.transaction.hash);
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
        async connectWallet() {
            if (typeof window === "undefined") {
                throw new Error("Browser method only");
            }
            const nearConnection = await (0, near_api_js_1.connect)({
                networkId,
                nodeUrl: rpcUrl,
                keyStore: new near_api_js_1.keyStores.BrowserLocalStorageKeyStore(),
                headers: {},
                walletUrl,
                helperUrl,
            });
            const wc = new near_api_js_1.WalletConnection(nearConnection, "");
            return wc;
        },
        async getContract(signer, _contract) {
            return new near_api_js_1.Contract(signer, _contract, {
                viewMethods: [],
                changeMethods: ["nft_mint"],
            });
        },
        async getUserMinter(keypair, address) {
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const keyPair = near_api_js_1.KeyPair.fromString(keypair);
            keyStore.setKey(networkId, address, keyPair);
            const signer = new near_api_js_1.InMemorySigner(keyStore);
            const provider = await (0, near_api_js_1.connect)({
                headers: {},
                nodeUrl: rpcUrl,
                networkId,
                signer,
            });
            return provider;
        },
    };
}
exports.nearHelperFactory = nearHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGtEQUF1QjtBQUV2Qiw2Q0FVcUI7QUFFckIseURBR21DO0FBQ25DLHNDQUFrQztBQTRFM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEdBQ0U7SUFDWCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEscUJBQU8sRUFBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLFNBQVM7UUFDVCxPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUMsQ0FBQztJQUVILE1BQU0sVUFBVSxHQUFHLEtBQUssRUFDdEIsT0FBZ0IsRUFDaEIsR0FBcUIsRUFDSCxFQUFFO1FBQ3BCLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQ3hDLElBQUksRUFBRTtnQkFDSixRQUFRO2dCQUNSLG1CQUFtQixFQUFFLE1BQU07Z0JBQzNCLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1lBQ0QsVUFBVSxFQUFFLFFBQVE7WUFDcEIsVUFBVSxFQUFFLGlCQUFpQjtTQUM5QixDQUFDLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFBLG9DQUF3QixFQUFDLE1BQU0sQ0FBWSxDQUFDO1FBQ3hELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNMLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTO1lBQ3pELE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sY0FBSyxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLENBQ1YsTUFBTSxJQUFJLHFCQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUNoRSxDQUFDLFNBQVMsQ0FBQztZQUNaLE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPO1lBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksQ0FBQztnQkFDdEMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRO2dCQUM1QixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsSUFBSSxFQUFFO29CQUNKLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtvQkFDMUIsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO29CQUN0QyxjQUFjLEVBQUUsT0FBTyxDQUFDLFFBQVE7aUJBQ2pDO2dCQUNELGVBQWUsRUFBRSxJQUFJLGVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLFlBQVk7YUFDakUsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLG9DQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVE7WUFDM0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDO2dCQUN0QyxVQUFVLEVBQUUsUUFBUTtnQkFDcEIsVUFBVSxFQUFFLHNCQUFzQjtnQkFDbEMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUU7YUFDdEMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQ0FBd0IsRUFBQyxNQUFNLENBQVUsQ0FBQztZQUV0RCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDbkIsT0FBTztvQkFDTCxNQUFNLEVBQUU7d0JBQ04sT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRO3dCQUNuQixRQUFRO3FCQUNUO29CQUNELGVBQWUsRUFBRSxRQUFRO29CQUN6QixHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLO2lCQUMxQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUk7WUFDakMsSUFBSSxNQUFNLFVBQVUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNO2lCQUN4QixZQUFZLENBQUM7Z0JBQ1osVUFBVSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUTtnQkFDL0IsVUFBVSxFQUFFLGFBQWE7Z0JBQ3pCLElBQUksRUFBRTtvQkFDSixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUM1QixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsR0FBRyxFQUFFLGdFQUFnRTtpQkFDdEU7Z0JBQ0QsZUFBZSxFQUFFLElBQUksZUFBRSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsYUFBYTthQUNqRSxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFDTCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQ0QsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLENBQUMsb0JBQW9CLENBQ3hCLE1BQU0sRUFDTixXQUFXLEVBQ1gsRUFBRSxFQUNGLEVBQUUsRUFDRixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVE7O1lBRVIsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUN2QyxVQUFVLEVBQUUsTUFBTTtnQkFDbEIsSUFBSSxFQUFFO29CQUNKLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU87b0JBQzNCLFdBQVc7b0JBQ1gsRUFBRTtvQkFDRixHQUFHLEVBQUUsSUFBSSxzQkFBUyxDQUFDLE1BQU0sQ0FBQztvQkFDMUIsU0FBUztvQkFDVCxjQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO2lCQUNuQztnQkFDRCxVQUFVLEVBQUUsWUFBWTtnQkFDeEIsZUFBZSxFQUFFLElBQUksZUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDMUMsR0FBRyxFQUFFLElBQUksZUFBRSxDQUFDLE1BQUEsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLFFBQVEsRUFBRSxtQ0FBSSx1Q0FBeUIsQ0FBQzthQUMvRCxDQUFDLENBQUM7WUFDSCxNQUFNLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUEsb0NBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxXQUFXO1lBQ1QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLO1lBQ3BELE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDdkMsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLElBQUksRUFBRTtvQkFDSixRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUMzQixXQUFXLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDNUIsRUFBRTtvQkFDRixHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtpQkFDbkM7Z0JBQ0QsVUFBVSxFQUFFLGNBQWM7Z0JBQzFCLGVBQWUsRUFBRSxJQUFJLGVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzFDLEdBQUcsRUFBRSx1Q0FBeUI7YUFDL0IsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLG9DQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLE1BQU0sSUFBSSxxQkFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDNUQsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWE7WUFDakIsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7Z0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN4QztZQUNELE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO2dCQUNuQyxTQUFTO2dCQUNULE9BQU8sRUFBRSxNQUFNO2dCQUNmLFFBQVEsRUFBRSxJQUFJLHVCQUFTLENBQUMsMkJBQTJCLEVBQUU7Z0JBQ3JELE9BQU8sRUFBRSxFQUFFO2dCQUNYLFNBQVM7Z0JBQ1QsU0FBUzthQUNWLENBQUMsQ0FBQztZQUNILE1BQU0sRUFBRSxHQUFHLElBQUksOEJBQWdCLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBZSxFQUFFLFNBQWlCO1lBQ2xELE9BQU8sSUFBSSxzQkFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7Z0JBQ3JDLFdBQVcsRUFBRSxFQUFFO2dCQUNmLGFBQWEsRUFBRSxDQUFDLFVBQVUsQ0FBQzthQUM1QixDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFlLEVBQUUsT0FBZTtZQUNsRCxNQUFNLFFBQVEsR0FBRyxJQUFJLHVCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNsRCxNQUFNLE9BQU8sR0FBRyxxQkFBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSw0QkFBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTVDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO2dCQUM3QixPQUFPLEVBQUUsRUFBRTtnQkFDWCxPQUFPLEVBQUUsTUFBTTtnQkFDZixTQUFTO2dCQUNULE1BQU07YUFDUCxDQUFDLENBQUM7WUFFSCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUExTUQsOENBME1DIn0=