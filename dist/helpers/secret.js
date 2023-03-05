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
            const contract = {
                address: contractAddress,
                codeHash: codeHash || '',
            };
            const { token_list } = await queryClient.query.snip721.GetOwnedTokens({
                contract,
                auth,
                owner,
            });
            const response = [];
            await Promise.all(token_list?.tokens?.map(async (token) => {
                const tokenInfo = await queryClient.query.snip721.GetTokenInfo({
                    contract,
                    auth,
                    token_id: token,
                });
                response.push({
                    collectionIdent: contractAddress,
                    uri: tokenInfo.all_nft_info.info?.token_uri || '',
                    native: {
                        chainId: p.chainId,
                        contract: contractAddress,
                        contractHash: codeHash || '',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBbUU7QUF1Rm5FLE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxJQUFJLDhCQUFtQixDQUFDO1FBQzFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtRQUNiLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztLQUNuQixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBRW5CLEtBQUssVUFBVSxtQkFBbUIsQ0FDaEMsTUFBb0IsRUFDcEIsR0FBMkI7UUFFM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDdkQsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRTtvQkFDTixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87b0JBQ3ZCLFdBQVcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7aUJBQzNCO2FBQ0Y7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLEdBQUcsQ0FBQyxlQUFlO2dCQUM1QixRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZO2FBQ2xDO1lBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTztTQUM3QixDQUFDLENBQUM7UUFDSCxLQUFLLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN2RCxJQUNHLElBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RDLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxFQUN0QztnQkFDQSxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLFVBQVUsV0FBVyxDQUN4QixNQUFvQixFQUNwQixHQUEyQjtRQUUzQiwwQkFBMEI7UUFDMUIsSUFBSSxNQUFNLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRTtZQUMxQyxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUNqRDtZQUNFLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTztZQUN0QixnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDckMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWTtZQUNsQyxHQUFHLEVBQUU7Z0JBQ0gsT0FBTyxFQUFFO29CQUNQLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWU7b0JBQ2pDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU87aUJBQzdCO2FBQ0Y7U0FDRixFQUNEO1lBQ0UsYUFBYSxFQUFFLElBQUk7WUFDbkIsUUFBUSxFQUFFLE1BQU87U0FDbEIsQ0FDRixDQUFDO1FBQ0YsT0FBTyxHQUFHLENBQUMsZUFBZSxDQUFDO0lBQzdCLENBQUM7SUFFRCxPQUFPO1FBQ0wsWUFBWTtZQUNWLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO1FBQ0QsV0FBVztZQUNULE9BQU8sV0FBVyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtRQUNwQixPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3pCLE1BQU0sQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUM3QyxPQUFPO2dCQUNQLEtBQUssRUFBRSxPQUFPO2FBQ2YsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELG1CQUFtQjtRQUNuQixLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDckQsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQ2hEO2dCQUNFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxlQUFlO2dCQUN4QyxTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVE7Z0JBQzFCLEdBQUcsRUFBRTtvQkFDSCxRQUFRLEVBQUU7d0JBQ1IsZUFBZSxFQUFFOzRCQUNmLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRzt5QkFDcEI7d0JBQ0QsS0FBSyxFQUFFLE1BQU0sQ0FBQyxPQUFPO3dCQUNyQixZQUFZLEVBQUUsSUFBSTtxQkFDbkI7aUJBQ29CO2dCQUN2QixNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU87YUFDdkIsRUFDRDtnQkFDRSxhQUFhLEVBQUUsSUFBSTtnQkFDbkIsUUFBUSxFQUFFLE1BQU87YUFDbEIsQ0FDRixDQUFDO1lBQ0YsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBQ0QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDdkQsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQixJQUFJO2dCQUNGLGlCQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsTUFBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxlQUFlLEVBQUUsUUFBUTtZQUNoRCxNQUFNLElBQUksR0FBRztnQkFDWCxNQUFNLEVBQUU7b0JBQ0osV0FBVyxFQUFFLEVBQUU7b0JBQ2YsT0FBTyxFQUFFLEtBQUs7aUJBQ2pCO2FBQ0osQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUFHO2dCQUNiLE9BQU8sRUFBRSxlQUFlO2dCQUN4QixRQUFRLEVBQUUsUUFBUSxJQUFJLEVBQUU7YUFDM0IsQ0FBQztZQUVGLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztnQkFDbEUsUUFBUTtnQkFDUixJQUFJO2dCQUNKLEtBQUs7YUFDUixDQUEyQixDQUFDO1lBRTdCLE1BQU0sUUFBUSxHQUE2QixFQUFFLENBQUM7WUFFOUMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUNiLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDcEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7b0JBQzNELFFBQVE7b0JBQ1IsSUFBSTtvQkFDSixRQUFRLEVBQUUsS0FBSztpQkFDbEIsQ0FBQyxDQUFDO2dCQUNILFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ1YsZUFBZSxFQUFFLGVBQWU7b0JBQ2hDLEdBQUcsRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLElBQUksRUFBRTtvQkFDakQsTUFBTSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTzt3QkFDbEIsUUFBUSxFQUFFLGVBQWU7d0JBQ3pCLFlBQVksRUFBRSxRQUFRLElBQUksRUFBRTt3QkFDNUIsT0FBTyxFQUFFLEtBQUs7d0JBQ2QsRUFBRTt3QkFDRixRQUFRLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUztxQkFDbkQ7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQ0wsQ0FBQztZQUNBLE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFDRCwyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN0QyxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELDJCQUEyQixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3RDLE9BQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDdEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQzlDO2dCQUNFLGdCQUFnQixFQUFFLFFBQVE7Z0JBQzFCLEdBQUcsRUFBRTtvQkFDSCxlQUFlLEVBQUU7d0JBQ2YsR0FBRyxFQUFFLEVBQUU7cUJBQ1I7aUJBQ0Y7Z0JBQ0QsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPO2FBQ3ZCLEVBQ0Q7Z0JBQ0UsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLFFBQVEsRUFBRSxNQUFPO2FBQ2xCLENBQ0YsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELFdBQVc7UUFDWCxXQUFXLEVBQUUsV0FBVztRQUN4QixvQkFBb0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUNuRSxNQUFNLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FDaEQ7Z0JBQ0UsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPO2dCQUN0QixnQkFBZ0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWU7Z0JBQzFDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQzVCLEdBQUcsRUFBRTtvQkFDSCxVQUFVLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUTt3QkFDN0IsYUFBYSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWTt3QkFDdEMsTUFBTSxFQUFFOzRCQUNOLFdBQVcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQzFCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTzt5QkFDeEI7d0JBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTzt3QkFDNUIsRUFBRTt3QkFDRixXQUFXLEVBQUUsVUFBVTt3QkFDdkIsTUFBTSxFQUFFLEVBQUU7cUJBQ1g7aUJBQ0Y7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWO3dCQUNFLEtBQUssRUFBRSxPQUFPO3dCQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztxQkFDekI7aUJBQ0Y7YUFDRixFQUNELEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTyxFQUFFLENBQzNDLENBQUM7WUFFRixNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVqRSxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFO1lBQzdELE1BQU0sRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUNoRDtnQkFDRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU87Z0JBQ3RCLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZTtnQkFDMUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUTtnQkFDNUIsR0FBRyxFQUFFO29CQUNILFlBQVksRUFBRTt3QkFDWixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRO3dCQUMzQixXQUFXLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZO3dCQUNwQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPO3dCQUM1QixFQUFFO3dCQUNGLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDO3FCQUNoQztpQkFDRjtnQkFDRCxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsS0FBSyxFQUFFLE9BQU87d0JBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO3FCQUN6QjtpQkFDRjthQUNGLEVBQ0QsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFPLEVBQUUsQ0FDM0MsQ0FBQztZQUVGLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWpFLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBMVBELGtEQTBQQyJ9