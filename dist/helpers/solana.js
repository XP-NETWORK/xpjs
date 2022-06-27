"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solanaHelper = void 0;
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const __1 = require("..");
const xp_bridge_1 = __importDefault(require("./idl/xp_bridge"));
// Based on https://github.com/solana-labs/solana-program-library/blob/118bd047aa0f1ba1930b5bc4639d40aa2a375ccb/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts
async function getOrCreateAssociatedTokenAccount(connection, payer, mint, owner, allowOwnerOffCurve = false) {
    const associatedToken = await spl_token_1.getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve);
    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account;
    try {
        account = await spl_token_1.getAccount(connection, associatedToken);
    }
    catch (error) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof spl_token_1.TokenAccountNotFoundError ||
            error instanceof spl_token_1.TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const transaction = new web3_js_1.Transaction().add(spl_token_1.createAssociatedTokenAccountInstruction(payer.publicKey, associatedToken, owner, mint));
                await payer.sendAndConfirm(transaction);
            }
            catch (error) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }
            // Now this should always succeed
            account = await spl_token_1.getAccount(connection, associatedToken);
        }
        else {
            throw error;
        }
    }
    if (!account.mint.equals(mint))
        throw new spl_token_1.TokenInvalidMintError();
    if (!account.owner.equals(owner))
        throw new spl_token_1.TokenInvalidOwnerError();
    return account;
}
async function solanaHelper(args) {
    const conn = new web3_js_1.Connection(args.endpoint);
    const bridgeContract = new anchor_1.Program(xp_bridge_1.default, args.bridgeContractAddr);
    const [bridge] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from("bridge")], bridgeContract.programId);
    return {
        connection: conn,
        getNonce: () => __1.Chain.SOLANA,
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            anchor_1.setProvider(sender);
            const mintAddr = new web3_js_1.PublicKey(id.native.nftMint);
            const fromTokenAcc = await getOrCreateAssociatedTokenAccount(conn, sender, mintAddr, sender.publicKey);
            const toTokenAcc = await getOrCreateAssociatedTokenAccount(conn, sender, mintAddr, sender.publicKey, true);
            const tx = await bridgeContract.methods
                .freezeNft(chain_nonce, to, new anchor_1.BN(txFees.toString(10)), mintWith)
                .accounts({
                bridge,
                authority: sender.publicKey,
                from: fromTokenAcc.address,
                to: toTokenAcc.address,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            })
                .rpc();
            await args.notifier.notifySolana(tx);
            return tx;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            anchor_1.setProvider(sender);
            const mintAddr = new web3_js_1.PublicKey(id.native.nftMint);
            const tokenAcc = await getOrCreateAssociatedTokenAccount(conn, sender, mintAddr, sender.publicKey);
            const tx = await bridgeContract.methods
                .withdrawNft(parseInt(nonce), to, new anchor_1.BN(txFees.toString(10)))
                .accounts({
                bridge,
                authority: sender.publicKey,
                mint: tokenAcc.mint,
                tokenAccount: tokenAcc.address,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            })
                .rpc();
            await args.notifier.notifySolana(tx);
            return tx;
        },
        async estimateValidateTransferNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async estimateValidateUnfreezeNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async validateAddress(adr) {
            try {
                new web3_js_1.PublicKey(adr);
                return true;
            }
            catch (_a) {
                return false;
            }
        },
    };
}
exports.solanaHelper = solanaHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29sYW5hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc29sYW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUsrQjtBQUMvQixpREFVMkI7QUFDM0IsNkNBQXFFO0FBQ3JFLGdFQUFxQztBQUNyQywwQkFBMkI7QUFTM0IsZ0VBQXdDO0FBdUJ4Qyx5S0FBeUs7QUFDekssS0FBSyxVQUFVLGlDQUFpQyxDQUM5QyxVQUFzQixFQUN0QixLQUFtQixFQUNuQixJQUFlLEVBQ2YsS0FBZ0IsRUFDaEIsa0JBQWtCLEdBQUcsS0FBSztJQUUxQixNQUFNLGVBQWUsR0FBRyxNQUFNLHFDQUF5QixDQUNyRCxJQUFJLEVBQ0osS0FBSyxFQUNMLGtCQUFrQixDQUNuQixDQUFDO0lBRUYsb0hBQW9IO0lBQ3BILHFDQUFxQztJQUNyQyxJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSTtRQUNGLE9BQU8sR0FBRyxNQUFNLHNCQUFVLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0tBQ3pEO0lBQUMsT0FBTyxLQUFjLEVBQUU7UUFDdkIsMEdBQTBHO1FBQzFHLHdHQUF3RztRQUN4RyxtREFBbUQ7UUFDbkQsSUFDRSxLQUFLLFlBQVkscUNBQXlCO1lBQzFDLEtBQUssWUFBWSx5Q0FBNkIsRUFDOUM7WUFDQSx1RkFBdUY7WUFDdkYsSUFBSTtnQkFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQyxHQUFHLENBQ3ZDLG1EQUF1QyxDQUNyQyxLQUFLLENBQUMsU0FBUyxFQUNmLGVBQWUsRUFDZixLQUFLLEVBQ0wsSUFBSSxDQUNMLENBQ0YsQ0FBQztnQkFFRixNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDekM7WUFBQyxPQUFPLEtBQWMsRUFBRTtnQkFDdkIsK0ZBQStGO2dCQUMvRiw4REFBOEQ7YUFDL0Q7WUFFRCxpQ0FBaUM7WUFDakMsT0FBTyxHQUFHLE1B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