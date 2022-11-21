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
    const associatedToken = await (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, allowOwnerOffCurve);
    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account;
    try {
        account = await (0, spl_token_1.getAccount)(connection, associatedToken);
    }
    catch (error) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof spl_token_1.TokenAccountNotFoundError ||
            error instanceof spl_token_1.TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, associatedToken, owner, mint));
                await payer.sendAndConfirm(transaction);
            }
            catch (error) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }
            // Now this should always succeed
            account = await (0, spl_token_1.getAccount)(connection, associatedToken);
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
    return {
        XpNft: args.xpnftAddr,
        connection: conn,
        getNonce: () => __1.Chain.SOLANA,
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            const bridgeContract = new anchor_1.Program(xp_bridge_1.default, args.bridgeContractAddr);
            const [bridge] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from("bridge")], bridgeContract.programId);
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
        getFeeMargin() {
            return args.feeMargin;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const bridgeContract = new anchor_1.Program(xp_bridge_1.default, args.bridgeContractAddr);
            const [bridge] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from("bridge")], bridgeContract.programId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29sYW5hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc29sYW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUFvRTtBQUNwRSxpREFVMkI7QUFDM0IsNkNBQXFFO0FBQ3JFLGdFQUFxQztBQUNyQywwQkFBMkI7QUFXM0IsZ0VBQXdDO0FBd0J4Qyx5S0FBeUs7QUFDekssS0FBSyxVQUFVLGlDQUFpQyxDQUM5QyxVQUFzQixFQUN0QixLQUFtQixFQUNuQixJQUFlLEVBQ2YsS0FBZ0IsRUFDaEIsa0JBQWtCLEdBQUcsS0FBSztJQUUxQixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUEscUNBQXlCLEVBQ3JELElBQUksRUFDSixLQUFLLEVBQ0wsa0JBQWtCLENBQ25CLENBQUM7SUFFRixvSEFBb0g7SUFDcEgscUNBQXFDO0lBQ3JDLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJO1FBQ0YsT0FBTyxHQUFHLE1BQU0sSUFBQSxzQkFBVSxFQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztLQUN6RDtJQUFDLE9BQU8sS0FBYyxFQUFFO1FBQ3ZCLDBHQUEwRztRQUMxRyx3R0FBd0c7UUFDeEcsbURBQW1EO1FBQ25ELElBQ0UsS0FBSyxZQUFZLHFDQUF5QjtZQUMxQyxLQUFLLFlBQVkseUNBQTZCLEVBQzlDO1lBQ0EsdUZBQXVGO1lBQ3ZGLElBQUk7Z0JBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBVyxFQUFFLENBQUMsR0FBRyxDQUN2QyxJQUFBLG1EQUF1QyxFQUNyQyxLQUFLLENBQUMsU0FBUyxFQUNmLGVBQWUsRUFDZixLQUFLLEVBQ0wsSUFBSSxDQUNMLENBQ0YsQ0FBQztnQkFFRixNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDekM7WUFBQyxPQUFPLEtBQWMsRUFBRTtnQkFDdkIsK0ZBQStGO2dCQUMvRiw4REFBOEQ7YUFDL0Q7WUFFRCxpQ0FBaUM7WUFD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