/*import {
  Metaplex,
  bundlrStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";*/
import {
  Wallet,
  BN,
  Program,
  AnchorProvider,
  Spl,
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
import {
  Connection,
  PublicKey,
  Transaction,
  //LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import BigNumber from "bignumber.js";
import { Chain } from "../..";
import { EvNotifier } from "../../services/notifier";
import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  BalanceCheck,
  MintNft,
  EstimateDeployFees,
} from "../chain";
import { IDL } from "./idl";

export type SolanaSigner = Wallet;

export type SolanaNft = {
  nftMint: string;
};

type SolanaMintArgs = {
  uri: string;
};

export type SolanaHelper = ChainNonceGet &
  BalanceCheck &
  MintNft<SolanaSigner, SolanaMintArgs, string> &
  TransferNftForeign<SolanaSigner, SolanaNft, string> &
  UnfreezeForeignNft<SolanaSigner, SolanaNft, string> &
  EstimateTxFees<SolanaNft> &
  ValidateAddress & {
    connection: Connection;
  } & { XpNft: string } & GetFeeMargins &
  GetProvider<Connection> &
  EstimateDeployFees;

export type SolanaParams = {
  endpoint: string;
  bridgeContractAddr: string;
  xpnftAddr: string;
  notifier: EvNotifier;
  feeMargin: FeeMargins;
};

// Based on https://github.com/solana-labs/solana-program-library/blob/118bd047aa0f1ba1930b5bc4639d40aa2a375ccb/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts
async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: SolanaSigner,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false
) {
  const provider = new AnchorProvider(connection, payer, {});

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

        await provider.sendAndConfirm(transaction);
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

  async function getOrCreateTokenAccount(
    mint: PublicKey,
    owner: PublicKey,
    provider: AnchorProvider
  ) {
    const tokenProgram = Spl.token(provider);
    const program = Spl.associatedToken(provider);

    const [associatedToken] = await PublicKey.findProgramAddress(
      [owner.toBuffer(), tokenProgram.programId.toBuffer(), mint.toBuffer()],
      program.programId
    );

    try {
      const tokenAccount = await tokenProgram.account.token.fetch(
        associatedToken
      );
      return {
        address: associatedToken,
        owner: tokenAccount.authority,
        ...tokenAccount,
      };
    } catch (e) {
      try {
        await program.methods
          .create()
          .accounts({
            mint,
            owner,
            associatedAccount: associatedToken,
          })
          .rpc();

        const tokenAccount = await tokenProgram.account.token.fetch(
          associatedToken
        );
        return {
          address: associatedToken,
          owner: tokenAccount.authority,
          ...tokenAccount,
        };
      } catch (e) {
        throw e;
      }
    }
  }

  return {
    XpNft: args.xpnftAddr,
    connection: conn,
    async balance(address: string) {
      return new BigNumber(await conn.getBalance(new PublicKey(address)));
    },
    getNonce: () => Chain.SOLANA,
    async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
      const provider = new AnchorProvider(conn, sender, {});
      const bridgeContract = new Program(
        IDL,
        args.bridgeContractAddr,
        provider
      );

      const [bridge, bridgeBump] = await PublicKey.findProgramAddress(
        [Buffer.from("bridge")],
        bridgeContract.programId
      );

      const mintAddr = new PublicKey(id.native.nftMint);
      const fromTokenAcc = await getOrCreateTokenAccount(
        mintAddr,
        sender.publicKey,
        provider
      );
      const toAccount = await getOrCreateTokenAccount(
        mintAddr,
        bridge,
        provider
      );
      const tx = await bridgeContract.methods
        .freezeNft(
          chain_nonce,
          to,
          new BN(txFees.toString(10)),
          mintWith,
          bridgeBump
        )
        .accounts({
          bridge,
          authority: sender.publicKey,
          from: fromTokenAcc.address,
          to: toAccount.address,
          tokenProgram: TOKEN_PROGRAM_ID,
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
      const provider = new AnchorProvider(conn, sender, {});
      const bridgeContract = new Program(
        IDL,
        args.bridgeContractAddr,
        provider
      );

      const [bridge, bridgeBump] = await PublicKey.findProgramAddress(
        [Buffer.from("bridge")],
        bridgeContract.programId
      );

      const mintAddr = new PublicKey(id.native.nftMint);

      const tokenAcc = await getOrCreateAssociatedTokenAccount(
        conn,
        sender,
        mintAddr,
        sender.publicKey
      ).catch((e) => {
        console.error(e);
        throw e;
      });

      const tx = await bridgeContract.methods
        .withdrawNft(nonce, to, new BN(txFees.toString(10)), bridgeBump)
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
    async estimateContractDeploy() {
      //0.01
      return new BigNumber(8000000);
    },
  };
}
