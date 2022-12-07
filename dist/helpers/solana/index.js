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
            return {
                address: associatedToken,
                owner: tokenAccount.authority,
                ...tokenAccount,
            };
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
                return {
                    address: associatedToken,
                    owner: tokenAccount.authority,
                    ...tokenAccount,
                };
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
            catch {
                return false;
            }
        },
    };
}
exports.solanaHelper = solanaHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9zb2xhbmEvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBTStCO0FBQy9CLGlEQVUyQjtBQUMzQiw2Q0FBcUU7QUFDckUsZ0VBQXFDO0FBQ3JDLDZCQUE4QjtBQVk5QiwrQkFBNEI7QUF5QjVCLHlLQUF5SztBQUN6SyxLQUFLLFVBQVUsaUNBQWlDLENBQzlDLFVBQXNCLEVBQ3RCLEtBQW1CLEVBQ25CLElBQWUsRUFDZixLQUFnQixFQUNoQixrQkFBa0IsR0FBRyxLQUFLO0lBRTFCLE1BQU0sUUFBUSxHQUFHLElBQUksdUJBQWMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBQSxxQ0FBeUIsRUFDckQsSUFBSSxFQUNKLEtBQUssRUFDTCxrQkFBa0IsQ0FDbkIsQ0FBQztJQUVGLG9IQUFvSDtJQUNwSCxxQ0FBcUM7SUFDckMsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUk7UUFDRixPQUFPLEdBQUcsTUFBTSxJQUFBLHNCQUFVLEVBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0tBQ3pEO0lBQUMsT0FBTyxLQUFjLEVBQUU7UUFDdkIsMEdBQTBHO1FBQzFHLHdHQUF3RztRQUN4RyxtREFBbUQ7UUFDbkQsSUFDRSxLQUFLLFlBQVkscUNBQXlCO1lBQzFDLEtBQUssWUFBWSx5Q0FBNkIsRUFDOUM7WUFDQSx1RkFBdUY7WUFDdkYsSUFBSTtnQkFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLHFCQUFXLEVBQUUsQ0FBQyxHQUFHLENBQ3ZDLElBQUEsbURBQXVDLEVBQ3JDLEtBQUssQ0FBQyxTQUFTLEVBQ2YsZUFBZSxFQUNmLEtBQUssRUFDTCxJQUFJLENBQ0wsQ0FDRixDQUFDO2dCQUVGLE1BQU0sUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMs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