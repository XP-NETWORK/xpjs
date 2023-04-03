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
                .getSignatureNear(consts_1.Chain.NEAR, chain_nonce, id.native.tokenId, id.collectionIdent, id.native.tokenId, to)
                .catch(() => undefined);
            if (res) {
                const result = await sender.functionCall({
                    contractId: bridge,
                    args: {
                        token_id: id.native.tokenId,
                        chain_nonce,
                        to,
                        amt: new bignumber_js_1.default(txFees) /*.div(2)*/,
                        mint_with,
                        token_contract: id.native.contract,
                        ...(res?.signature
                            ? { sig_data: [...Buffer.from(res.signature, "hex")] }
                            : {}),
                    },
                    methodName: "freeze_nft",
                    attachedDeposit: new bn_js_1.BN(res?.fee) /*.div(new BN(2))*/,
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
            const res = await signatureSvc.getSignatureNear(consts_1.Chain.NEAR, nonce, id.native.tokenId, id.collectionIdent, id.native.tokenId, to);
            const result = await sender.functionCall({
                contractId: bridge,
                args: {
                    token_id: id.native.tokenId,
                    chain_nonce: parseInt(nonce),
                    to,
                    amt: parseInt(txFees.toString()),
                    token_contract: id.native.contract,
                    sig_data: [...Buffer.from(res?.signature, "hex")],
                },
                methodName: "withdraw_nft",
                attachedDeposit: new bn_js_1.BN(res?.fee),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGlDQUEyQjtBQUUzQiw2Q0FRcUI7QUFFckIseURBR21DO0FBRW5DLHNDQUFrQztBQThGM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFdBQVcsRUFDWCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFNBQVMsR0FDRTtJQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSxxQkFBTyxFQUFDO1FBQ3pCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsU0FBUztRQUNULE9BQU8sRUFBRSxFQUFFO0tBQ1osQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUN0QixPQUFnQixFQUNoQixHQUFxQixFQUNILEVBQUU7UUFDcEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUNuRCxNQUFNLE1BQU0sR0FBWSxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDakQsSUFBSSxFQUFFO2dCQUNKLFFBQVE7Z0JBQ1IsbUJBQW1CLEVBQUUsTUFBTTtnQkFDM0IsV0FBVyxFQUFFLElBQUk7YUFDbEI7WUFDRCxVQUFVLEVBQUUsUUFBUTtZQUNwQixVQUFVLEVBQUUsaUJBQWlCO1NBQzlCLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUVGLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRTtRQUM5QyxJQUFJLGlCQUFpQixHQUF1QixTQUFTLENBQUM7UUFDdEQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxNQUFNLE9B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