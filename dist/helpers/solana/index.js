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
const __1 = require("../..");
const idl_1 = require("./idl");
// Based on https://github.com/solana-labs/solana-program-library/blob/118bd047aa0f1ba1930b5bc4639d40aa2a375ccb/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts
async function getOrCreateAssociatedTokenAccount(connection, payer, mint, owner, allowOwnerOffCurve = false) {
    const provider = new anchor_1.AnchorProvider(connection, payer, {});
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
                await provider.sendAndConfirm(transaction);
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
    async function getOrCreateTokenAccount(mint, owner, provider) {
        const tokenProgram = anchor_1.Spl.token(provider);
        const program = anchor_1.Spl.associatedToken(provider);
        const [associatedToken] = await web3_js_1.PublicKey.findProgramAddress([owner.toBuffer(), tokenProgram.programId.toBuffer(), mint.toBuffer()], program.programId);
        try {
            const tokenAccount = await tokenProgram.account.token.fetch(associatedToken);
            return Object.assign({ address: associatedToken, owner: tokenAccount.authority }, tokenAccount);
        }
        catch (e) {
            try {
                await program.methods
                    .create()
                    .accounts({
                    mint,
                    owner,
                    associatedAccount: associatedToken,
                })
                    .rpc();
                const tokenAccount = await tokenProgram.account.token.fetch(associatedToken);
                return Object.assign({ address: associatedToken, owner: tokenAccount.authority }, tokenAccount);
            }
            catch (e) {
                throw e;
            }
        }
    }
    return {
        XpNft: args.xpnftAddr,
        connection: conn,
        getNonce: () => __1.Chain.SOLANA,
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            const provider = new anchor_1.AnchorProvider(conn, sender, {});
            const bridgeContract = new anchor_1.Program(idl_1.IDL, args.bridgeContractAddr, provider);
            const [bridge, bridgeBump] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from("bridge")], bridgeContract.programId);
            const mintAddr = new web3_js_1.PublicKey(id.native.nftMint);
            const fromTokenAcc = await getOrCreateTokenAccount(mintAddr, sender.publicKey, provider);
            const toAccount = await getOrCreateTokenAccount(mintAddr, bridge, provider);
            const tx = await bridgeContract.methods
                .freezeNft(chain_nonce, to, new anchor_1.BN(txFees.toString(10)), mintWith, bridgeBump)
                .accounts({
                bridge,
                authority: sender.publicKey,
                from: fromTokenAcc.address,
                to: toAccount.address,
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
            console.log(`Unfreezing`);
            const provider = new anchor_1.AnchorProvider(conn, sender, {});
            const bridgeContract = new anchor_1.Program(idl_1.IDL, args.bridgeContractAddr, provider);
            const [bridge, bridgeBump] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from("bridge")], bridgeContract.programId);
            const mintAddr = new web3_js_1.PublicKey(id.native.nftMint);
            const tokenAcc = await getOrCreateAssociatedTokenAccount(conn, sender, mintAddr, sender.publicKey).catch((e) => {
                console.error(e);
                throw e;
            });
            const tx = await bridgeContract.methods
                .withdrawNft(parseInt(nonce), to, new anchor_1.BN(txFees.toString(10)), bridgeBump)
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
        getProvider() {
            return conn;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9zb2xhbmEvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBTStCO0FBQy9CLGlEQVUyQjtBQUMzQiw2Q0FBcUU7QUFDckUsZ0VBQXFDO0FBQ3JDLDZCQUE4QjtBQVk5QiwrQkFBNEI7QUF5QjVCLHlLQUF5SztBQUN6SyxLQUFLLFVBQVUsaUNBQWlDLENBQzlDLFVBQXNCLEVBQ3RCLEtBQW1CLEVBQ25CLElBQWUsRUFDZixLQUFnQixFQUNoQixrQkFBa0IsR0FBRyxLQUFLO0lBRTFCLE1BQU0sUUFBUSxHQUFHLElBQUksdUJBQWMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBQSxxQ0FBeUIsRUFDckQsSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsQ0FDbkIsQ0FBQztJQUVGLG9IQUFvSDtJQUNwSCxxQ0FBcUM7SUFDckMsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUk7UUFDRixPQUFPLEdBQUcsTUFBTSxJQUFBLHNCQUFVLEVBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0tBQ3pEO0lBQUMsT0FBTyxLQUFjLEVBQUU7UUFDdkIsMEdBQTBHO1FBQzFHLHdHQUF3RztRQUN4RyxtREFBbUQ7UUFDbkQsSUFDRSxLQUFLLFlBQVkscUNBQXlCO1lBQzFDLEtBQUssWUFBWSx5Q0FBNkIsRUFDOUM7WUFDQSx1RkFBdUY7WUFDdkYsSUFBSTtnQkFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQyxHQUFHLENBQ3ZDLElBQUEsbURBQXVDLEVBQ3JDLEtBQUssQ0FBQyxTQUFTLEVBQ2YsZUFBZSxFQUNmLEtBQUssRUFDTCxJQUFJLENBQ0wsQ0FDRixDQUFDO2dCQUVGLE1BQU0sUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMs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