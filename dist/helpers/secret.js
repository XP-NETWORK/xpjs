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
            }, { waitForCommit: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBMkQ7QUErQzNELE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ25CLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbkIsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsTUFBb0IsRUFDcEIsR0FBMkI7UUFFM0IsMEJBQTBCO1FBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUNqRDtZQUNFLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTztZQUN0QixlQUFlLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQ3BDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVk7WUFDakMsR0FBRyxFQUFFO2dCQUNILE9BQU8sRUFBRTtvQkFDUCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlO29CQUNqQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRO2lCQUM5QjthQUNGO1NBQ0YsRUFDRDtZQUNFLGFBQWEsRUFBRSxJQUFJO1lBQ25CLFFBQVEsRUFBRSxNQUFPO1NBQ2xCLENBQ0YsQ0FBQztR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