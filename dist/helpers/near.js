"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bn_js_1 = require("bn.js");
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
        const result = await account.viewFunction({
            args: {
                token_id,
                approved_account_id: bridge,
                approval_id: null,
            },
            contractId: contract,
            methodName: "nft_is_approved",
        });
        return result;
    };
    const getWalletCallbackUrl = (params) => {
        let walletCallbackUrl = undefined;
        if (globalThis.window !== undefined) {
            const network = location.pathname.match(/^\/(staging|testnet)\/.+/)?.at(1) || "";
            walletCallbackUrl = `${location.protocol}//${location.host}/${network}/connect?${params}`;
        }
        return walletCallbackUrl;
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
                attachedDeposit: new bn_js_1.BN("10000000000000000000000"), // 0.01 Near
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
        async preTransfer(sender, nft, _fee, args) {
            if (await isApproved(sender, nft)) {
                return undefined;
            }
            if (!args) {
                throw new Error("Missing args");
            }
            const { receiver, to } = args;
            const walletCallbackUrl = getWalletCallbackUrl(`NEARTRX=true&type=approve&to=${to}&receiver=${encodeURIComponent(receiver)}&tokenId=${encodeURIComponent(nft.native.tokenId)}`);
            const result = await sender.functionCall({
                contractId: nft.native.contract,
                methodName: "nft_approve",
                args: {
                    token_id: nft.native.tokenId,
                    account_id: bridge,
                },
                attachedDeposit: new bn_js_1.BN("1000000000000000000000"),
                ...(walletCallbackUrl ? { walletCallbackUrl } : {}),
            });
            return result.transaction_outcome.id;
        },
        XpNft: xpnft,
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mint_with) {
            const walletCallbackUrl = getWalletCallbackUrl(`NEARTRX=true&type=transfer&to=${chain_nonce}&receiver=${encodeURIComponent(to)}&tokenId=${encodeURIComponent(id.native.tokenId)}&contract=${encodeURIComponent(id.native.contract)}`);
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
                attachedDeposit: new bn_js_1.BN(txFees.toString(10)),
                gas: new bn_js_1.BN("46000000000000"),
                ...(walletCallbackUrl ? { walletCallbackUrl } : {}),
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
            const walletCallbackUrl = getWalletCallbackUrl(`NEARTRX=true&type=unfreeze&to=${nonce}&receiver=${encodeURIComponent(to)}&tokenId=${encodeURIComponent(id.native.tokenId)}&contract=${encodeURIComponent(id.native.contract)}`);
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
                attachedDeposit: new bn_js_1.BN(txFees.toString(10)),
                gas: new bn_js_1.BN(65000000000000),
                ...(walletCallbackUrl ? { walletCallbackUrl } : {}),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGlDQUEyQjtBQUUzQiw2Q0FTcUI7QUFFckIseURBR21DO0FBQ25DLHNDQUFrQztBQW9GM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxTQUFTLEdBQ0U7SUFDWCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEscUJBQU8sRUFBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLFNBQVM7UUFDVCxPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUMsQ0FBQztJQUVILE1BQU0sVUFBVSxHQUFHLEtBQUssRUFDdEIsT0FBZ0IsRUFDaEIsR0FBcUIsRUFDSCxFQUFFO1FBQ3BCLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkQsTUFBTSxNQUFNLEdBQVksTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQ2pELElBQUksRUFBRTtnQkFDSixRQUFRO2dCQUNSLG1CQUFtQixFQUFFLE1BQU07Z0JBQzNCLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1lBQ0QsVUFBVSxFQUFFLFFBQVE7WUFDcEIsVUFBVSxFQUFFLGlCQUFpQjtTQUM5QixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDLENBQUM7SUFFRixNQUFNLG9CQUFvQixHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDOUMsSUFBSSxpQkFBaUIsR0FBdUIsU0FBUyxDQUFDO1FBQ3RELElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDbkMsTUFBTSxPQUFPLEdBQ1gsUUFBUSxDQUFDLFFB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