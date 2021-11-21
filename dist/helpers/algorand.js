"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorandHelper = exports.typedAlgoSigner = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = require("bignumber.js");
const js_base64_1 = require("js-base64");
/**
 * This library is written in typescript.
 * unfortunately the browser extension injects the AlgoSigner in a way we can't get a typed object wwithout this hack.
 *
 * @return Strongly typed AlgoSigner from extension
 */
function typedAlgoSigner() {
    //@ts-expect-error why do you inject libraries like this :|
    if (typeof AlgoSigner === "undefined") {
        throw Error("algosigner not available!");
    }
    //@ts-expect-error why do you inject libraries like this :|
    return AlgoSigner;
}
exports.typedAlgoSigner = typedAlgoSigner;
const encoder = new TextEncoder();
const MINT_NFT_COST = new bignumber_js_1.BigNumber(1000);
function algorandHelper(args) {
    const appAddr = algosdk_1.default.getApplicationAddress(args.sendNftAppId);
    const algod = new algosdk_1.default.Algodv2(args.algodApiKey, args.algodUri);
    async function waitTxnConfirm(txId, timeout) {
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
                if (pendingInfo['confirmed-round'] !== null &&
                    pendingInfo['confirmed-round'] > 0) {
                    // Got the completed Transaction
                    return pendingInfo;
                }
                if (pendingInfo['pool-error'] != null &&
                    pendingInfo['pool-error'].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error(`Transaction Rejected pool error${pendingInfo['pool-error']}`);
                }
            }
            await algod.statusAfterBlock(currentround).do();
            currentround += 1;
        }
        throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
    }
    const transferNft = async (signer, chain_nonce, to, nft, txFees) => {
        const suggested = await algod.getTransactionParams().do();
        const callTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: args.sendNftAppId,
            appArgs: [
                encoder.encode("opt_in_nft")
            ],
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested
        });
        const encodedTx = js_base64_1.Base64.fromUint8Array(callTx.toByte());
        const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTx[0].blob
        });
        await waitTxnConfirm(res.txId, 10000);
        const feesTx = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: BigInt(txFees.toString()),
            suggestedParams: suggested
        });
        const transferTx = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: 1,
            assetIndex: nft.native.nftId,
            suggestedParams: suggested
        });
        const tCallTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
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
        algosdk_1.default.assignGroupID([feesTx, transferTx, tCallTx]);
        const encodedTxns = [
            { txn: js_base64_1.Base64.fromUint8Array(feesTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(transferTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(tCallTx.toByte()) }
        ];
        const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
        const sendRes = await algod.sendRawTransaction([
            js_base64_1.Base64.toUint8Array(signedTxns[0].blob),
            js_base64_1.Base64.toUint8Array(signedTxns[1].blob),
            js_base64_1.Base64.toUint8Array(signedTx[2].blob)
        ]).do();
        await waitTxnConfirm(sendRes.txId, 10000);
        return sendRes.txId;
    };
    return {
        getNonce: () => args.nonce,
        isWrappedNft(nft) {
            return nft.native.creator === appAddr;
        },
        transferNftToForeign: transferNft,
        unfreezeWrappedNft: async (signer, to, nft, txFees) => {
            const nftMeta = await axios_1.default.get(nft.uri);
            return await transferNft(signer, parseInt(nftMeta.data.wrapped.origin), to, nft, txFees);
        },
        estimateValidateTransferNft: () => Promise.resolve(MINT_NFT_COST),
        estimateValidateUnfreezeNft: () => Promise.resolve(MINT_NFT_COST),
        validateAddress: (adr) => Promise.resolve(algosdk_1.default.isValidAddress(adr))
    };
}
exports.algorandHelper = algorandHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsa0RBQTBCO0FBQzFCLCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUE4Qm5DOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZUFBZTtJQUMzQiwyREFBMkQ7SUFDM0QsSUFBSSxPQUFPLFVBQVUsS0FBSyxXQUFXLEVBQUU7UUFDbkMsTUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUM1QztJQUVELDJEQUEyRDtJQUMzRCxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDO0FBUkQsMENBUUM7QUE2QkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLHdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFMUMsU0FBZ0IsY0FBYyxDQUFDLElBQWtCO0lBQzdDLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sS0FBSyxHQUFHLElBQUksaUJBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFbEUsS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUFZLEVBQUUsT0FBZTtRQUN2RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN6QyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVc7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUMsSUFBSSxZQUFZLEdBQUcsVUFBVSxD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