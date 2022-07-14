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
    async function preTransfer(sender, nft) {
        // TODO: check if approved
        const res = await sender.tx.compute.executeContract({
            sender: sender.address,
            contractAddress: nft.native.contract,
            codeHash: nft.native.contractHash,
            msg: {
                approve: {
                    spender: p.bridge.contractAddress,
                    token_id: nft.native.token_id,
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
            const { token_list } = await queryClient.query.snip721.GetOwnedTokens({
                contract,
                auth,
                owner,
            });
            const response = [];
            await Promise.all(token_list.tokens.map(async (token) => {
                var _a;
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
                        token_id: token,
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
                        token_id: nft.native.token_id,
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
            await p.notifier.notifySecret(tx.transactionHash);
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
                        token_id: nft.native.token_id,
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
            await p.notifier.notifySecret(tx.transactionHash);
            return tx;
        },
    };
}
exports.secretHelperFactory = secretHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBMkQ7QUFnRTNELE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ25CLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbkIsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsTUFBb0IsRUFDcEIsR0FBMkI7UUFFM0IsMEJBQTBCO1FBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUNqRDtZQUNFLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTztZQUN0QixlQUFlLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQ3BDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVk7WUFDakMsR0FBRyxFQUFFO2dCQUNILE9BQU8sRUFBRTtvQkFDUCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlO29CQUNqQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRO2lCQUM5QjthQUNGO1NBQ0YsRUFDRDtZQUNFLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFFBQVEsRUFBRSxNQUFPO1NBQ2xCLENBQ0YsQ0FBQztR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