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
    const queryClient = new secretjs_1.SecretNetworkClient({
        url: p.rpcUrl,
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
            contract_address: nft.native.contract,
            code_hash: nft.native.contractHash,
            msg: {
                approve: {
                    spender: p.bridge.contractAddress,
                    token_id: nft.native.tokenId,
                },
            },
        }, {
            waitForCommit: true,
            gasLimit: 250000,
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
            const b = await queryClient.query.bank.balance({
                address,
                denom: "uscrt",
            });
            return new bignumber_js_1.default(b.balance?.amount || 0);
        },
        isApprovedForMinter,
        async mintNft(signer, args) {
            const minter = args.contract ? args.contract : p.umt;
            const tx = await signer.tx.compute.executeContract({
                contract_address: minter.contractAddress,
                code_hash: minter.codeHash,
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
                gasLimit: 500000,
            });
            return tx;
        },
        XpNft: `${p.xpnft.contractAddress},${p.xpnft.codeHash}`,
        validateAddress: async (a) => {
            try {
                secretjs_1.Bech32.decode(a);
                return true;
            }
            catch {
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
                codeHash = (await queryClient.query.compute.codeHashByContractAddress({
                    contract_address: contractAddress,
                })).code_hash;
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
                const tokenInfo = await queryClient.query.snip721.GetTokenInfo({
                    contract,
                    auth,
                    token_id: token,
                });
                response.push({
                    collectionIdent: contractAddress,
                    uri: tokenInfo.all_nft_info.info?.token_uri || "",
                    native: {
                        chainId: p.chainId,
                        contract: contractAddress,
                        contractHash: codeHash || "",
                        tokenId: token,
                        vk,
                        metadata: tokenInfo.all_nft_info.info?.extension,
                    },
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
                contract_address: contract,
                msg: {
                    set_viewing_key: {
                        key: vk,
                    },
                },
                sender: client.address,
            }, {
                waitForCommit: true,
                gasLimit: 500000,
            });
            return tx;
        },
        preTransfer,
        preUnfreeze: preTransfer,
        transferNftToForeign: async (wallet, chainNonce, to, nft, fee, mw) => {
            const tx = await wallet.tx.compute.executeContract({
                sender: wallet.address,
                contract_address: p.bridge.contractAddress,
                code_hash: p.bridge.codeHash,
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
                sent_funds: [
                    {
                        denom: "uscrt",
                        amount: fee.toString(10),
                    },
                ],
            }, { waitForCommit: true, gasLimit: 500000 });
            await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);
            return tx;
        },
        unfreezeWrappedNft: async (wallet, to, nft, fee, chainNonce) => {
            const tx = await wallet.tx.compute.executeContract({
                sender: wallet.address,
                contract_address: p.bridge.contractAddress,
                code_hash: p.bridge.codeHash,
                msg: {
                    withdraw_nft: {
                        burner: nft.native.contract,
                        burner_hash: nft.native.contractHash,
                        token_id: nft.native.tokenId,
                        to,
                        chain_nonce: Number(chainNonce),
                    },
                },
                sent_funds: [
                    {
                        denom: "uscrt",
                        amount: fee.toString(10),
                    },
                ],
            }, { waitForCommit: true, gasLimit: 500000 });
            await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);
            return tx;
        },
    };
}
exports.secretHelperFactory = secretHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBbUU7QUF1Rm5FLE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxJQUFJLDhCQUFtQixDQUFDO1FBQzFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtRQUNiLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztLQUNuQixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBRW5CLEtBQUssVUFBVSxtQkFBbUIsQ0FDaEMsTUFBb0IsRUFDcEIsR0FBMkI7UUFFM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDdkQsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRTtvQkFDTixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87b0JBQ3ZCLFdBQVcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7aUJBQzNCO2FBQ0Y7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlO2dCQUM1QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZO2FBQ2xDO1lBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTztTQUM3QixDQUFDLENBQUM7UUFDSCxLQUFLLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFB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