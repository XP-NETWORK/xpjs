import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
} from "@project-serum/anchor";
import {
  Account,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidOwnerError,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { Chain } from "..";
import { evNotifier, EvNotifier } from "../notifier";
import {
  ChainNonceGet,
  EstimateTxFees,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";
import BridgeIdl from "./idl/xp_bridge";

export type SolanaSigner = AnchorProvider;

export type SolanaNft = {
  nftMint: string;
};

export type SolanaHelper = ChainNonceGet &
  TransferNftForeign<SolanaSigner, SolanaNft, string> &
  UnfreezeForeignNft<SolanaSigner, SolanaNft, string> &
  EstimateTxFees<SolanaNft> &
  ValidateAddress & {
    connection: Connection;
  };

export type SolanaParams = {
  endpoint: string;
  bridgeContractAddr: string;
  xpnftAddr: string;
  notifier: EvNotifier;
};

// Based on https://github.com/solana-labs/solana-program-library/blob/118bd047aa0f1ba1930b5bc4639d40aa2a375ccb/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts
async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: SolanaSigner,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false
) {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    owner,
    allowOwnerOffCurve
  );

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  let account: Account;
  try {
    account = await getAccount(connection, associatedToken);
  } catch (error: unknown) {
    // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
    // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
    // TokenInvalidAccountOwnerError in this code path.
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      // As this isn't atomic, it's possible others can create associated accounts meanwhile.
      try {
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedToken,
            owner,
            mint
          )
        );

        await payer.sendAndConfirm(transaction);
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }

      // Now this should always succeed
      account = await getAccount(connection, associatedToken);
    } else {
      throw error;
    }
  }

  if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
  if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

  return account;
}

export async function solanaHelper(args: SolanaParams): Promise<SolanaHelper> {
  const conn = new Connection(args.endpoint);
  const bridgeContract = new Program(BridgeIdl, args.bridgeContractAddr);

  const [bridge] = await PublicKey.findProgramAddress(
    [Buffer.from("bridge")],
    bridgeContract.programId
  );

  return {
    connection: conn,
    getNonce: () => Chain.SOLANA,
    async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
      setProvider(sender);

      const mintAddr = new PublicKey(id.native.nftMint);
      const fromTokenAcc = await getOrCreateAssociatedTokenAccount(
        conn,
        sender,
        mintAddr,
        sender.publicKey
      );
      const toTokenAcc = await getOrCreateAssociatedTokenAccount(
        conn,
        sender,
        mintAddr,
        sender.publicKey,
        true
      );
      const tx = await bridgeContract.methods
        .freezeNft(chain_nonce, to, new BN(txFees.toString(10)), mintWith)
        .accounts({
          bridge,
          authority: sender.publicKey,
          from: fromTokenAcc.address,
          to: toTokenAcc.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      await args.notifier.notifySolana(tx);

      return tx;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      setProvider(sender);

      const mintAddr = new PublicKey(id.native.nftMint);

      const tokenAcc = await getOrCreateAssociatedTokenAccount(
        conn,
        sender,
        mintAddr,
        sender.publicKey
      );

      const tx = await bridgeContract.methods
        .withdrawNft(parseInt(nonce), to, new BN(txFees.toString(10)))
        .accounts({
          bridge,
          authority: sender.publicKey,
          mint: tokenAcc.mint,
          tokenAccount: tokenAcc.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      await args.notifier.notifySolana(tx);

      return tx;
    },
    async estimateValidateTransferNft() {
      return new BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft() {
      return new BigNumber(0); // TODO
    },
    async validateAddress(adr) {
      try {
        new PublicKey(adr);
        return true;
      } catch {
        return false;
      }
    },
  };
}
