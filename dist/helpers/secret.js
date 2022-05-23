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
        chainId: p.chainId
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
                }
            }
        });
        return res.transactionHash;
    }
    return {
        getNonce: () => 0x18,
        balance: async (address) => {
            var _a;
            const b = await queryClient.query.bank.balance({
                address,
                denom: 'uscrt'
            });
            return new bignumber_js_1.default(((_a = b.balance) === null || _a === void 0 ? void 0 : _a.amount) || 0);
        },
        validateAddress: async (a) => {
            try {
                secretjs_1.Bech32.decode(a);
                return true;
            }
            catch (_a) {
                return false;
            }
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
                        minter: mw
                    }
                },
                sentFunds: [{
                        denom: 'uscrt',
                        amount: fee.toString(10)
                    }]
            }, { waitForCommit: true });
            await p.notifier.notifySecret(tx.transactionHash);
            return tx.transactionHash;
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
                        chain_nonce: chainNonce
                    }
                },
                sentFunds: [{
                        denom: 'uscrt',
                        amount: fee.toString(10)
                    }]
            }, { waitForCommit: true });
            await p.notifier.notifySecret(tx.transactionHash);
            return tx.transactionHash;
        }
    };
}
exports.secretHelperFactory = secretHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBdUQ7QUFxQ3ZELE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQUMsQ0FBZTtJQUN2RCxNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ25CLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbkIsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUFvQixFQUFFLEdBQTJCO1FBQzFFLDBCQUEwQjtRQUMxQixNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztZQUNsRCxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDdEIsZUFBZSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUNwQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZO1lBQ2pDLEdBQUcsRUFBRTtnQkFDSCxPQUFPLEVBQUU7b0JBQ1AsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZTtvQkFDakMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUTtpQkFDOUI7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUM3QixDQUFDO0lBRUQsT0FBTztRQUNM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