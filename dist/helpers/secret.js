"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const secretjs_1 = require("secretjs");
// TODO
const TRANSFER_GASL = new bignumber_js_1.default(0);
// TODO
const UNFREEZE_GASL = new bignumber_js_1.default(0);
async function secretHelperFactory(p) {
    const queryClient = await secretjs_1.SecretNetworkClient.create({
        grpcWebUrl: p.rpcUrl,
        chainId: p.chainId,
    });
    // TODO
    const gasPrice = 1;
    async function isApprovedForMinter(sender, nft) {
        const approval = await sender.query.snip721.GetTokenInfo({
            auth: {
                viewer: {
                    address: sender.address,
                    viewing_key: nft.native.vk,
                },
            },
            contract: {
                address: nft.collectionIdent,
                codeHash: nft.native.contractHash,
            },
            token_id: nft.native.tokenId,
        });
        for (let appr of approval.all_nft_info.access.approvals) {
            if (appr["spender"].toLowerCase() ===
                p.bridge.contractAddress.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    async function preTransfer(sender, nft) {
        // TODO: check if approved
        if (await isApprovedForMinter(sender, nft)) {
            return undefined;
        }
        const res = await sender.tx.compute.executeContract({
            sender: sender.address,
            contractAddress: nft.native.contract,
            codeHash: nft.native.contractHash,
            msg: {
                approve: {
                    spender: p.bridge.contractAddress,
                    token_id: nft.native.tokenId,
                },
            },
        }, {
            waitForCommit: true,
            gasLimit: 100000,
        });
        return res.transactionHash;
    }
    return {
        getFeeMargin() {
            return p.feeMargin;
        },
        getProvider() {
            return queryClient;
        },
        getNonce: () => 0x18,
        balance: async (address) => {
            var _a;
            const b = await queryClient.query.bank.balance({
                address,
                denom: "uscrt",
            });
            return new bignumber_js_1.default(((_a = b.balance) === null || _a === void 0 ? void 0 : _a.amount) || 0);
        },
        isApprovedForMinter,
        async mintNft(signer, args) {
            const minter = args.contract ? args.contract : p.umt;
            const tx = await signer.tx.compute.executeContract({
                contractAddress: minter.contractAddress,
                codeHash: minter.codeHash,
                msg: {
                    mint_nft: {
                        public_metadata: {
                            token_uri: args.url,
                        },
                        owner: signer.address,
                        transferable: true,
                    },
                },
                sender: signer.address,
            }, {
                waitForCommit: true,
                gasLimit: 50000,
            });
            return tx;
        },
        XpNft: `${p.xpnft.contractAddress},${p.xpnft.codeHash}`,
        validateAddress: async (a) => {
            try {
                secretjs_1.Bech32.decode(a);
                return true;
            }
            catch (_a) {
                return false;
            }
        },
        async nftList(owner, vk, contractAddress, codeHash) {
            const auth = {
                viewer: {
                    viewing_key: vk,
                    address: owner,
                },
            };
            if (!codeHash) {
                codeHash = await queryClient.query.compute.contractCodeHash(contractAddress);
            }
            const contract = {
                address: contractAddress,
                codeHash: codeHash || "",
            };
            const { token_list, generic_err } = (await queryClient.query.snip721.GetOwnedTokens({
                contract,
                auth,
                owner,
            }));
            if (generic_err)
                throw new Error(generic_err.msg);
            const response = [];
            await Promise.all(token_list.tokens.map(async (token) => {
                var _a, _b;
                const tokenInfo = await queryClient.query.snip721.GetTokenInfo({
                    contract,
                    auth,
                    token_id: token,
                });
                response.push({
                    collectionIdent: contractAddress,
                    uri: ((_a = tokenInfo.all_nft_info.info) === null || _a === void 0 ? void 0 : _a.token_uri) || "",
                    native: {
                        chainId: p.chainId,
                        contract: contractAddress,
                        contractHash: codeHash || "",
                        tokenId: token,
                        vk,
                    },
                    metaData: (_b = tokenInfo.all_nft_info.info) === null || _b === void 0 ? void 0 : _b.extension,
                });
            }));
            return response;
        },
        estimateValidateTransferNft: async () => {
            return TRANSFER_GASL.times(gasPrice);
        },
        estimateValidateUnfreezeNft: async () => {
            return UNFREEZE_GASL.times(gasPrice);
        },
        async setViewingKey(client, contract, vk) {
            const tx = await client.tx.snip721.setViewingKey({
                contractAddress: contract,
                msg: {
                    set_viewing_key: {
                        key: vk,
                    },
                },
                sender: client.address,
            }, {
                waitForCommit: true,
                gasLimit: 30000,
            });
            return tx;
        },
        preTransfer,
        preUnfreeze: preTransfer,
        transferNftToForeign: async (wallet, chainNonce, to, nft, fee, mw) => {
            const tx = await wallet.tx.compute.executeContract({
                sender: wallet.address,
                contractAddress: p.bridge.contractAddress,
                codeHash: p.bridge.codeHash,
                msg: {
                    freeze_nft: {
                        contract: nft.native.contract,
                        contract_hash: nft.native.contractHash,
                        viewer: {
                            viewing_key: nft.native.vk,
                            address: wallet.address,
                        },
                        token_id: nft.native.tokenId,
                        to,
                        chain_nonce: chainNonce,
                        minter: mw,
                    },
                },
                sentFunds: [
                    {
                        denom: "uscrt",
                        amount: fee.toString(10),
                    },
                ],
            }, { waitForCommit: true, gasLimit: 150000 });
            await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);
            return tx;
        },
        unfreezeWrappedNft: async (wallet, to, nft, fee, chainNonce) => {
            const tx = await wallet.tx.compute.executeContract({
                sender: wallet.address,
                contractAddress: p.bridge.contractAddress,
                codeHash: p.bridge.codeHash,
                msg: {
                    withdraw_nft: {
                        burner: nft.native.contract,
                        burner_hash: nft.native.contractHash,
                        token_id: nft.native.tokenId,
                        to,
                        chain_nonce: Number(chainNonce),
                    },
                },
                sentFunds: [
                    {
                        denom: "uscrt",
                        amount: fee.toString(10),
                    },
                ],
            }, { waitForCommit: true, gasLimit: 100000 });
            await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);
            return tx;
        },
    };
}
exports.secretHelperFactory = secretHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBMkQ7QUErRTNELE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ25CLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbkIsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxNQUFvQixFQUNwQixHQUEyQjtRQUUzQixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUN2RCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFO29CQUNOLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztvQkFDdkIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtpQkFDM0I7YUFDRjtZQUNELFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsR0FBRyxDQUFDLGVBQWU7Z0JBQzVCLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVk7YUFDbEM7WUFDRCxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPO1NBQzdCLENBQUMsQ0FBQztRQUNILEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENB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