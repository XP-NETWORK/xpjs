"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorandHelper = exports.algoSignerWrapper = exports.typedAlgoSigner = void 0;
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
function algoSignerWrapper(algod, acc) {
    return {
        accounts(_) {
            return Promise.resolve([{
                    address: acc.addr
                }]);
        },
        signTxn(txns) {
            return Promise.resolve(txns.map(t => {
                const signed = algosdk_1.default.signTransaction(algosdk_1.default.decodeUnsignedTransaction(js_base64_1.Base64.toUint8Array(t.txn)), acc.sk);
                return {
                    txID: signed.txID,
                    blob: js_base64_1.Base64.fromUint8Array(signed.blob)
                };
            }));
        },
        send({ tx }) {
            return algod.sendRawTransaction(js_base64_1.Base64.toUint8Array(tx)).do();
        }
    };
}
exports.algoSignerWrapper = algoSignerWrapper;
const encoder = new TextEncoder();
const MINT_NFT_COST = new bignumber_js_1.BigNumber(1000);
function algorandHelper(args) {
    const appAddr = algosdk_1.default.getApplicationAddress(args.sendNftAppId);
    const algod = new algosdk_1.default.Algodv2(args.algodApiKey, args.algodUri, args.algodPort);
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
        const signedTxCall = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTxCall[0].blob
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
                new Uint8Array(Buffer.concat([
                    Buffer.from(new Uint32Array([0]).buffer),
                    Buffer.from(new Uint32Array([chain_nonce]).buffer).reverse()
                ]))
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
            js_base64_1.Base64.toUint8Array(signedTxns[2].blob)
        ]).do();
        await waitTxnConfirm(sendRes.txId, 10000);
        return sendRes.txId;
    };
    return {
        algod,
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
        validateAddress: (adr) => Promise.resolve(algosdk_1.default.isValidAddress(adr)),
        async claimNft(signer, info) {
            const suggested = await algod.getTransactionParams().do();
            const optIn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: signer.address,
                to: signer.address,
                amount: 0,
                assetIndex: info.nftId,
                suggestedParams: suggested
            });
            const encodedTx = js_base64_1.Base64.fromUint8Array(optIn.toByte());
            const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
            const res = await signer.algoSigner.send({
                ledger: signer.ledger,
                tx: signedTx[0].blob
            });
            await waitTxnConfirm(res.txId, 10000);
            const callTxn = algosdk_1.default.makeApplicationNoOpTxnFromObject({
                from: signer.address,
                appIndex: info.appId,
                appArgs: [
                    encoder.encode("transfer_nft")
                ],
                foreignAssets: [info.nftId],
                suggestedParams: suggested,
            });
            const encodedCall = js_base64_1.Base64.fromUint8Array(callTxn.toByte());
            const signedCall = await signer.algoSigner.signTxn([{
                    txn: encodedCall,
                }]);
            const callRes = await signer.algoSigner.send({
                ledger: signer.ledger,
                tx: signedCall[0].blob
            });
            await waitTxnConfirm(callRes.txId, 10000);
            return callRes.txId;
        }
    };
}
exports.algorandHelper = algorandHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsa0RBQTBCO0FBQzFCLCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUFtQ25DOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZUFBZTtJQUMzQiwyREFBMkQ7SUFDM0QsSUFBSSxPQUFPLFVBQVUsS0FBSyxXQUFXLEVBQUU7UUFDbkMsTUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUM1QztJQUVELDJEQUEyRDtJQUMzRCxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDO0FBUkQsMENBUUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUFzQixFQUFFLEdBQW9CO0lBQzFFLE9BQU87UUFDSCxRQUFRLENBQUMsQ0FBQztZQUNOLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwQixPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUk7aUJBQ3BCLENBQUMsQ0FBQyxDQUFBO1FBQ1AsQ0FBQztRQUNELE9BQU8sQ0FBQyxJQUFJO1lBQ1IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sTUFBTSxHQUFHLGlCQUFPLENBQUMsZUFBZSxDQUNsQyxpQkFBTyxDQUFDLHlCQUF5QixDQUFDLGtCQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUM3RCxHQUFHLENBQUMsRUFBRSxDQUNULENBQUM7Z0JBQ0YsT0FBTztvQkFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7b0JBQ2pCLElBQUksRUFBRSxrQkFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2lCQUMzQyxDQUFBO1lBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNQLENBQUM7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