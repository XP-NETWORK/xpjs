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
async function nearHelperFactory({ networkId, bridge, rpcUrl, xpnft, feeMargin, notifier, walletUrl, signatureSvc, helperUrl, }) {
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
        async isNftWhitelisted(nft, signer) {
            const result = await signer
                .viewFunction({
                args: {
                    contract_id: nft.native.contract,
                },
                contractId: bridge,
                methodName: "is_whitelist",
            })
                .catch(() => false);
            return result;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL25lYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBQ3JDLGlDQUEyQjtBQUUzQiw2Q0FRcUI7QUFFckIseURBR21DO0FBQ25DLHNDQUFrQztBQTRGM0IsS0FBSyxVQUFVLGlCQUFpQixDQUFDLEVBQ3RDLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxZQUFZLEVBQ1osU0FBUyxHQUNFO0lBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHFCQUFPLEVBQUM7UUFDekIsT0FBTyxFQUFFLE1BQU07UUFDZixTQUFTO1FBQ1QsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsR0FBRyxLQUFLLEVBQ3RCLE9BQWdCLEVBQ2hCLEdBQXFCLEVBQ0gsRUFBRTtRQUNwQixNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ25ELE1BQU0sTUFBTSxHQUFZLE1BQU0sT0FBTyxDQUFDLFlBQVksQ0FBQztZQUNqRCxJQUFJLEVBQUU7Z0JBQ0osUUFBUTtnQkFDUixtQkFBbUIsRUFBRSxNQUFNO2dCQUMzQixXQUFXLEVBQUUsSUFBSTthQUNsQjtZQUNELFVBQVUsRUFBRSxRQUFRO1lBQ3BCLFVBQVUsRUFBRSxpQkFBaUI7U0FDOUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFO1FBQzlDLElBQUksaUJBQWlCLEdBQXVCLFNBQVMsQ0FBQztRQUN0RCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ25DLE1BQU0sT0FBTyxHQUNYLFFB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