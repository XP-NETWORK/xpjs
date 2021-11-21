import algosdk from "algosdk";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import { Base64 } from "js-base64";
import { AlgoNft } from "xpnet-nft-list";
import { ChainNonceGet, EstimateTxFees, NftInfo, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WrappedNftCheck } from "..";

type TxResp = {
    txId: string;
}

type SignedTxn = {
    txID: string;
    blob: string;
}

type Ledger = "MainNet" | "TestNet";

type BrowserSigner = {
    accounts(args: { ledger: Ledger }): Promise<{ address: string[] }>;
    signTxn(transactions: { txn: string }[]): Promise<SignedTxn[]>;
    send(info: { ledger: Ledger, tx: string }): Promise<TxResp>;
}

/**
 * Selected address & ledger must be given explicitly
 */
export type AlgoSignerH = {
    readonly algoSigner: BrowserSigner;
    readonly address: string;
    readonly ledger: Ledger;
}

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

export type AlgorandHelper = ChainNonceGet &
    WrappedNftCheck<AlgoNft> &
    TransferNftForeign<
        AlgoSignerH,
        string,
        BigNumber,
        AlgoNft,
        string
    > &
    UnfreezeForeignNft<AlgoSignerH, string, BigNumber, AlgoNft, string> &
    EstimateTxFees<BigNumber> &
    ValidateAddress;


export type AlgorandArgs = {
    algodApiKey: string;
    algodUri: string;
    sendNftAppId: number;
    nonce: number;
}

type MinWrappedNft = {
    wrapped: {
        origin: string
    }
};

const encoder = new TextEncoder();
const MINT_NFT_COST = new BigNumber(1000);

export function algorandHelper(args: AlgorandArgs): AlgorandHelper {
    const appAddr = algosdk.getApplicationAddress(args.sendNftAppId);
    const algod = new algosdk.Algodv2(args.algodApiKey, args.algodUri)

    async function waitTxnConfirm(txId: string, timeout: number) {
        const status = await algod.status().do();
        if (typeof status === 'undefined')
          throw new Error('Unable to get node status');

        const startround = status['last-round'] + 1;
        let currentround = startround;
        while (currentround < startround + timeout) {
          const pendingInfo = await algod
            .pendingTransactionInformation(txId)
            .do();
          if (pendingInfo !== undefined) {
            if (
              pendingInfo['confirmed-round'] !== null &&
              pendingInfo['confirmed-round'] > 0
            ) {
              // Got the completed Transaction
              return pendingInfo;
            }
      
            if (
              pendingInfo['pool-error'] != null &&
              pendingInfo['pool-error'].length > 0
            ) {
              // If there was a pool error, then the transaction has been rejected!
              throw new Error(
                `Transaction Rejected pool error${pendingInfo['pool-error']}`
              );
            }
          }
          await algod.statusAfterBlock(currentround).do();
          currentround += 1;
        }

        throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
    }

    const transferNft = async (
        signer: AlgoSignerH,
        chain_nonce: number,
        to: string,
        nft: NftInfo<AlgoNft>,
        txFees: BigNumber
    ) => {
        const suggested = await algod.getTransactionParams().do();
        const callTx = algosdk.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: args.sendNftAppId,
            appArgs: [
                encoder.encode("opt_in_nft")
            ],
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested
        });
        const encodedTx = Base64.fromUint8Array(callTx.toByte());
        const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTx[0].blob
        });
        await waitTxnConfirm(res.txId, 10000);

        const feesTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: BigInt(txFees.toString()),
            suggestedParams: suggested
        })
        const transferTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: 1,
            assetIndex: nft.native.nftId,
            suggestedParams: suggested
        });
        const tCallTx = algosdk.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: args.sendNftAppId,
            appArgs: [
                encoder.encode("receive_nft"),
                encoder.encode(to),
                encoder.encode(chain_nonce.toString())
            ],
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested
        });
        algosdk.assignGroupID([feesTx, transferTx, tCallTx]);
        const encodedTxns = [
            { txn: Base64.fromUint8Array(feesTx.toByte()) },
            { txn: Base64.fromUint8Array(transferTx.toByte()) },
            { txn: Base64.fromUint8Array(tCallTx.toByte()) }
        ];
        const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
        const sendRes = await algod.sendRawTransaction([
            Base64.toUint8Array(signedTxns[0].blob),
            Base64.toUint8Array(signedTxns[1].blob),
            Base64.toUint8Array(signedTx[2].blob)
        ]).do();
        await waitTxnConfirm(sendRes.txId, 10000);

        return sendRes.txId as string;
    }
    return {
        getNonce: () => args.nonce,
        isWrappedNft(nft) {
            return nft.native.creator === appAddr
        },
        transferNftToForeign: transferNft,
        unfreezeWrappedNft: async (
            signer,
            to,
            nft,
            txFees
        ) => {
            const nftMeta = await axios.get<MinWrappedNft>(nft.uri);
            return await transferNft(
                signer,
                parseInt(nftMeta.data.wrapped.origin),
                to,
                nft,
                txFees
            )
        },
        estimateValidateTransferNft: () => Promise.resolve(MINT_NFT_COST),
        estimateValidateUnfreezeNft: () => Promise.resolve(MINT_NFT_COST),
        validateAddress: (adr) => Promise.resolve(algosdk.isValidAddress(adr))
    }
}