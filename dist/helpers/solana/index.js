"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solanaHelper = void 0;
/*import {
  Metaplex,
  bundlrStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";*/
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
        async balance(address) {
            return new bignumber_js_1.default(await conn.getBalance(new web3_js_1.PublicKey(address)));
        },
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
        async mintNft() {
            /*console.log(Metaplex, walletAdapterIdentity, bundlrStorage);
            console.log(args, "args");
            console.log(sender, "sender");
            const provider = new AnchorProvider(conn, sender, {});
            console.log(provider.wallet, "provider");
      
            /*const txn = await conn.requestAirdrop(
              sender.publicKey,
              LAMPORTS_PER_SOL * 2
            );
            const block = await conn.getLatestBlockhash();
            const sig = conn.confirmTransaction(
              {
                blockhash: block.blockhash,
                lastValidBlockHeight: block.lastValidBlockHeight,
                signature: txn,
              },
              "finalized"
            );
            console.log(`Airdrop: ${txn}`);
            console.log(`sig ${sig}`);
            console.log(`Waiting for 5s`);
            await new Promise((r) => setTimeout(r, 5000));
            //sender.payer.secretKey.
            const _metaplex = Metaplex.make(conn)
              .use(walletAdapterIdentity(sender))
              .use(bundlrStorage());
            const nftc = _metaplex.nfts();
      
            const _col = await nftc.create(
              {
                name: "Uniair1",
                symbol: "UNIAIRT",
      
                uri: args.uri,
                sellerFeeBasisPoints: 0,
              },
              {
                commitment: "processed",
              }
            );
      
            console.log(_col);*/
            return "";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9zb2xhbmEvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7bUNBSW1DO0FBQ25DLGtEQU0rQjtBQUMvQixpREFVMkI7QUFDM0IsNkNBS3lCO0FBRXpCLGdFQUFxQztBQUNyQyw2QkFBOEI7QUFjOUIsK0JBQTRCO0FBK0I1Qix5S0FBeUs7QUFDekssS0FBSyxVQUFVLGlDQUFpQyxDQUM5QyxVQUFzQixFQUN0QixLQUFtQixFQUNuQixJQUFlLEVBQ2YsS0FBZ0IsRUFDaEIsa0JBQWtCLEdBQUcsS0FBSztJQUUxQixNQUFNLFFBQVEsR0FBRyxJQUFJLHVCQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUEscUNBQXlCLEVBQ3JELElBQUksRUFDSixLQUFLLEVBQ0wsa0JBQWtCLENBQ25CLENBQUM7SUFFRixvSEFBb0g7SUFDcEgscUNBQXFDO0lBQ3JDLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJO1FBQ0YsT0FBTyxHQUFHLE1BQU0sSUFBQSxzQkFBVSxFQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztLQUN6RDtJQUFDLE9BQU8sS0FBYyxFQUFFO1FBQ3ZCLDBHQUEwRztRQUMxRyx3R0FBd0c7UUFDeEcsbURBQW1EO1FBQ25ELElBQ0UsS0FBSyxZQUFZLHFDQUF5QjtZQUMxQyxLQUFLLFlBQVkseUNBQTZCLEVBQzlDO1lBQ0EsdUZBQXVGO1lBQ3ZGLElBQUk7Z0JBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxxQkFBVyxFQUFFLENBQUMsR0FBRyxDQUN2QyxJQUFBLG1EQUF1QyxFQUNyQyxLQUFLLENBQUMsU0FBUyxFQUNmLGVBQWUsRUFDZixLQUFLLEVBQ0wsSUFBSSxDQUNMLENBQ0YsQ0FBQztnQkFFRixNQUFNLFFBQVEsQ0FBQyxjQUFj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