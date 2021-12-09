import algosdk, { SuggestedParams } from "algosdk";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import { Base64 } from "js-base64";
import {
  AlgorandSocketHelper,
  ChainNonceGet,
  EstimateTxFees,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WrappedNftCheck,
} from "..";

type TxResp = {
  txId: string;
};

type AlgoNft = {
  "metadata-hash"?: string;
  name?: string;
  "unit-name"?: string;
  url: string;
  creator: string;
  nftId: number;
};

type SignedTxn = {
  txID: string;
  blob: string;
};

type Ledger = "MainNet" | "TestNet" | "any";

type BrowserSigner = {
  accounts(args: { ledger: Ledger }): Promise<{ address: string }[]>;
  signTxn(transactions: { txn: string }[]): Promise<SignedTxn[]>;
  send(info: { ledger: Ledger; tx: string }): Promise<TxResp>;
};

export type ClaimNftInfo = {
  appId: number;
  nftId: number;
};

/**
 * Selected address & ledger must be given explicitly
 */
export type AlgoSignerH = {
  readonly algoSigner: BrowserSigner;
  readonly address: string;
  readonly ledger: Ledger;
};

/**
 * This library is written in typescript.
 * unfortunately the browser extension injects the AlgoSigner in a way we can't get a typed object wwithout this hack.
 *
 * @return Strongly typed AlgoSigner from extension
 */
export function typedAlgoSigner(): BrowserSigner {
  //@ts-expect-error why do you inject libraries like this :|
  if (typeof AlgoSigner === "undefined") {
    throw Error("algosigner not available!");
  }

  //@ts-expect-error why do you inject libraries like this :|
  return AlgoSigner;
}

export function algoSignerWrapper(
  algod: algosdk.Algodv2,
  acc: algosdk.Account
): AlgoSignerH {
  const signer: BrowserSigner = {
    accounts(_) {
      return Promise.resolve([
        {
          address: acc.addr,
        },
      ]);
    },
    signTxn(txns) {
      return Promise.resolve(
        txns.map((t) => {
          const signed = algosdk.signTransaction(
            algosdk.decodeUnsignedTransaction(Base64.toUint8Array(t.txn)),
            acc.sk
          );
          return {
            txID: signed.txID,
            blob: Base64.fromUint8Array(signed.blob),
          };
        })
      );
    },
    send({ tx }) {
      return algod.sendRawTransaction(Base64.toUint8Array(tx)).do();
    },
  };

  return {
    algoSigner: signer,
    address: acc.addr,
    ledger: "any",
  };
}

export interface ClaimAlgorandNft {
  claimAlgorandNft(
    signer: AlgoSignerH,
    sourceChain: number,
    actionId: string,
    socket: AlgorandSocketHelper
  ): Promise<string>;
}

export type AlgorandHelper = ChainNonceGet &
  WrappedNftCheck<AlgoNft> &
  TransferNftForeign<AlgoSignerH, string, BigNumber, AlgoNft, string> &
  UnfreezeForeignNft<AlgoSignerH, string, BigNumber, AlgoNft, string> &
  EstimateTxFees<BigNumber> &
  ValidateAddress & {
    claimNft(claimer: AlgoSignerH, info: ClaimNftInfo): Promise<string>;
    claimableNfts(txSocket: AlgorandSocketHelper, owner: string): Promise<ClaimNftInfo[]>;
  } & {
    algod: algosdk.Algodv2;
  } & ClaimAlgorandNft & Pick<PreTransfer<AlgoSignerH, AlgoNft, SuggestedParams>, "preTransfer">;

export type AlgorandParams = {
  algodApiKey: string;
  algodUri: string;
  algodPort: number | undefined;
  sendNftAppId: number;
  nonce: number;
};

type MinWrappedNft = {
  wrapped: {
    origin: string;
  };
};

const encoder = new TextEncoder();
const MINT_NFT_COST = new BigNumber(1000);

export function algorandHelper(args: AlgorandParams): AlgorandHelper {
  const appAddr = algosdk.getApplicationAddress(args.sendNftAppId);
  const algod = new algosdk.Algodv2(
    args.algodApiKey,
    args.algodUri,
    args.algodPort
  );

  async function waitTxnConfirm(txId: string) {
    const status = await algod.status().do();
    let lastRound = status["last-round"];
    let pendingInfo = await algod.pendingTransactionInformation(txId).do();
    while (
      !(pendingInfo["confirmed-round"] && pendingInfo["confirmed-round"] > 0)
    ) {
      lastRound += 1;
      await algod.statusAfterBlock(lastRound).do();
      pendingInfo = await algod.pendingTransactionInformation(txId).do();
    }
  }

  const transferNft = async (
    signer: AlgoSignerH,
    chain_nonce: number,
    to: string,
    nft: NftInfo<AlgoNft>,
    txFees: BigNumber
  ) => {
    const suggested = await algod.getTransactionParams().do();
    const feesTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: signer.address,
      to: appAddr,
      amount: BigInt(txFees.toString()),
      suggestedParams: suggested,
    });
    const transferTx =
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: signer.address,
        to: appAddr,
        amount: 1,
        assetIndex: nft.native.nftId,
        suggestedParams: suggested,
      });
    const tCallTx = algosdk.makeApplicationNoOpTxnFromObject({
      from: signer.address,
      appIndex: args.sendNftAppId,
      appArgs: [
        encoder.encode("receive_nft"),
        encoder.encode(to),
        new Uint8Array(
          Buffer.concat([
            Buffer.from(new Uint32Array([0]).buffer),
            Buffer.from(new Uint32Array([chain_nonce]).buffer).reverse(),
          ])
        ),
      ],
      foreignAssets: [nft.native.nftId],
      suggestedParams: suggested,
    });
    algosdk.assignGroupID([feesTx, transferTx, tCallTx]);
    const encodedTxns = [
      { txn: Base64.fromUint8Array(feesTx.toByte()) },
      { txn: Base64.fromUint8Array(transferTx.toByte()) },
      { txn: Base64.fromUint8Array(tCallTx.toByte()) },
    ];
    const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
    const sendRes = await algod
      .sendRawTransaction([
        Base64.toUint8Array(signedTxns[0].blob),
        Base64.toUint8Array(signedTxns[1].blob),
        Base64.toUint8Array(signedTxns[2].blob),
      ])
      .do();
    await waitTxnConfirm(sendRes.txId);

    return sendRes.txId as string;
  };

  async function claimNft(signer: AlgoSignerH, info: ClaimNftInfo) {
    const suggested = await algod.getTransactionParams().do();
    const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: signer.address,
      to: signer.address,
      amount: 0,
      assetIndex: info.nftId,
      suggestedParams: suggested,
    });
    const encodedTx = Base64.fromUint8Array(optIn.toByte());
    const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
    const res = await signer.algoSigner.send({
      ledger: signer.ledger,
      tx: signedTx[0].blob,
    });
    await waitTxnConfirm(res.txId);

    const callTxn = algosdk.makeApplicationNoOpTxnFromObject({
      from: signer.address,
      appIndex: info.appId,
      appArgs: [encoder.encode("transfer_nft")],
      foreignAssets: [info.nftId],
      suggestedParams: suggested,
    });
    const encodedCall = Base64.fromUint8Array(callTxn.toByte());
    const signedCall = await signer.algoSigner.signTxn([
      {
        txn: encodedCall,
      },
    ]);
    const callRes = await signer.algoSigner.send({
      ledger: signer.ledger,
      tx: signedCall[0].blob,
    });

    await waitTxnConfirm(callRes.txId);
    return callRes.txId;
  }

  return {
    algod,
    getNonce: () => args.nonce,
    claimNft,
    async claimAlgorandNft(signer, sourceChain, action, socket) {
      const info = await socket.waitAlgorandNft(sourceChain, signer.address, action);

      return await claimNft(signer, info);
    },
    async preTransfer(sender, nft, _fee) {
      const user = await algod.accountInformation(appAddr).do()
      for (let i = 0; i < user["assets"].length; i++) {
        if (user["assets"][i]["asset-id"] === nft.native.nftId) {
          return undefined
        }
      }
      const suggested = await algod.getTransactionParams().do();
      const callTx = algosdk.makeApplicationNoOpTxnFromObject({
        from: sender.address,
        appIndex: args.sendNftAppId,
        appArgs: [encoder.encode("opt_in_nft")],
        foreignAssets: [nft.native.nftId],
        suggestedParams: suggested,
      });
      const encodedTx = Base64.fromUint8Array(callTx.toByte());
      const signedTxCall = await sender.algoSigner.signTxn([{ txn: encodedTx }]);
      const res = await sender.algoSigner.send({
        ledger: sender.ledger,
        tx: signedTxCall[0].blob,
      });
      await waitTxnConfirm(res.txId);
      return suggested
    },

    isWrappedNft(nft) {
      return nft.native.creator === appAddr;
    },
    transferNftToForeign: transferNft,
    unfreezeWrappedNft: async (signer, to, nft, txFees) => {
      const nftMeta = await axios.get<MinWrappedNft>(nft.uri);
      return await transferNft(
        signer,
        parseInt(nftMeta.data.wrapped.origin),
        to,
        nft,
        txFees
      );
    },
    estimateValidateTransferNft: () => Promise.resolve(MINT_NFT_COST),
    estimateValidateUnfreezeNft: () => Promise.resolve(MINT_NFT_COST),
    validateAddress: (adr) => Promise.resolve(algosdk.isValidAddress(adr)),
    claimableNfts: async (txSocket: AlgorandSocketHelper, owner: string) => {
      const claims = await txSocket.claimNfts(owner);
      const nfts = new Set<number>();
      const user = await algod.accountInformation(appAddr).do()
      for (let i = 0; i < user["assets"].length; i++) {
        if (user["assets"][i]["amount"].toString() === "1") {
          nfts.add(user["assets"][i]["asset-id"]);
        }
      }

      claims.filter((v) => !nfts.has(v.nftId));

      return claims;
    }
  };
}
