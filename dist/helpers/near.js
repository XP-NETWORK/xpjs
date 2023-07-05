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
async function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, whitelisted, walletUrl, signatureSvc, helperUrl, }) {
    const near = await (0, near_api_js_1.connect)({
        nodeUrl: rpcUrl,
        networkId,
        headers: {},
    });
    const isApproved = async (account, nft) => {
        const { tokenId: token_id, contract } = nft.native;
        const tokenData = await account.viewFunction({
            args: {
                token_id,
            },
            contractId: contract,
            methodName: "nft_token",
        });
        const approval_id = tokenData.approved_account_ids[bridge];
        if (!approval_id)
            return false;
        return await account.viewFunction({
            args: {
                token_id,
                approved_account_id: bridge,
                approval_id,
            },
            contractId: contract,
            methodName: "nft_is_approved",
        });
    };
    const getWalletCallbackUrl = (params) => {
        let walletCallbackUrl = undefined;
        if (globalThis.window !== undefined) {
            const network = location.pathname.match(/^\/(staging|testnet)\/.+/)?.at(1) || "";
            const query = new URLSearchParams(window.location.search.replace("?", ""));
            const wid = query.get("wid");
            const selectedNearWallet = query.get("selectedNearWallet");
            walletCallbackUrl = `${location.protocol}//${location.host}/${network}/connect?${wid ? `wid=${wid}&` : ""}${selectedNearWallet ? `selectedNearWallet=${selectedNearWallet}&` : ""}${params}`;
        }
        return walletCallbackUrl;
    };
    const notifyValidators = async (hash) => {
        //await new Promise((r) => setTimeout(r, 15_000));
        return notifier.notifyNear(hash);
    };
    return {
        notify: notifyValidators,
        async estimateValidateTransferNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0); // TODO
        },
        async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
            return new bignumber_js_1.default(0); // TODO
        },
        estimateContractDeploy: async () => {
            return new bignumber_js_1.default("5000000000000000000000000");
        },
        //async estimateContractDe
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
            const res = await signatureSvc
                .near(consts_1.Chain.NEAR, chain_nonce, id.collectionIdent, id.native.tokenId, to)
                .catch(() => undefined);
            if (res) {
                const tokenData = await sender.viewFunction({
                    args: {
                        token_id: id.native.tokenId,
                    },
                    contractId: id.native.contract,
                    methodName: "nft_token",
                });
                let approval_id = tokenData.approved_account_ids[bridge];
                if (!approval_id) {
                    approval_id = null;
                }
                const result = await sender.functionCall({
                    contractId: bridge,
                    args: {
                        token_id: id.native.tokenId,
                        chain_nonce,
                        to,
                        amt: new bignumber_js_1.default(txFees) /*.div(2)*/,
                        mint_with,
                        token_contract: id.native.contract,
                        ...(res.sig
                            ? {
                                sig_data: [...Buffer.from(res.sig, "hex")],
                            }
                            : {}),
                        approval_id,
                    },
                    methodName: "freeze_nft",
                    attachedDeposit: new bn_js_1.BN(res.fees) /*.div(new BN(2))*/,
                    gas: new bn_js_1.BN("300000000000000"),
                    ...(walletCallbackUrl ? { walletCallbackUrl } : {}),
                });
                await notifyValidators(result.transaction.hash);
                return [result, (0, providers_1.getTransactionLastResult)(result)];
            }
            else {
                return undefined;
            }
        },
        getFeeMargin() {
            return feeMargin;
        },
        getProvider() {
            return near;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const walletCallbackUrl = getWalletCallbackUrl(`NEARTRX=true&type=unfreeze&to=${nonce}&receiver=${encodeURIComponent(to)}&tokenId=${encodeURIComponent(id.native.tokenId)}&contract=${encodeURIComponent(id.native.contract)}`);
            const res = await signatureSvc.near(consts_1.Chain.NEAR, nonce, id.collectionIdent, id.native.tokenId, to);
            const result = await sender.functionCall({
                contractId: bridge,
                args: {
                    token_id: id.native.tokenId,
                    chain_nonce: nonce,
                    to,
                    amt: parseInt(txFees.toString()),
                    token_contract: id.native.contract,
                    sig_data: [...Buffer.from(res.sig, "hex")],
                },
                methodName: "withdraw_nft",
                attachedDeposit: new bn_js_1.BN(res.sig),
                gas: new bn_js_1.BN("300000000000000"),
                ...(walletCallbackUrl ? { walletCallbackUrl } : {}),
            });
            await notifyValidators(result.transaction.hash);
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
        async connectWallet(url) {
            if (typeof window === "undefined") {
                throw new Error("Browser method only");
            }
            const nearConnection = await (0, near_api_js_1.connect)({
                networkId,
                nodeUrl: rpcUrl,
                keyStore: new near_api_js_1.keyStores.BrowserLocalStorageKeyStore(),
                headers: {},
                walletUrl: url || walletUrl,
                helperUrl,
            });
            const wc = new near_api_js_1.WalletConnection(nearConnection, "");
            return wc;
        },
        async isNftWhitelisted(nft) {
            /*const result: boolean = await signer
              .viewFunction({
                args: {
                  contract_id: nft.native.contract,
                },
                contractId: bridge,
                methodName: "is_whitelist",
              })
              .catch(() => false);*/
            const res = (await whitelisted.get(`/near/whitelisted/${nft.native.contract}`))?.data;
            return Boolean(res?.isWhitelisted);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGlDQUEyQjtBQUUzQiw2Q0FRcUI7QUFFckIseURBR21DO0FBRW5DLHNDQUFrQztBQWdHM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFdBQVcsRUFDWCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsR0FDRTtJQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO1FBQ3pCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsU0FBUztRQUNULE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUN0QixPQUFnQixFQUNoQixHQUFxQixFQUNILEVBQUU7UUFDcEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUVuRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDM0MsSUFBSSxFQUFFO2dCQUNKLFFBQVE7YUFDVDtZQUNELFVBQVUsRUFBRSxRQUFRO1lBQ3BCLFVBQVUsRUFBRSxXQUFXO1NBQ3hCLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsV0FBVztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRS9CLE9BQU8sTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDO1lBQ2hDLElBQUksRUFBRTtnQkFDSixRQUFRO2dCQUNSLG1CQUFtQixFQUFFLE1BQU07Z0JBQzNCLFdBQVc7YUFDWjtZQUNELFVBQVUsRUFB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