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
    const signer = {
        accounts(_) {
            return Promise.resolve([
                {
                    address: acc.addr,
                },
            ]);
        },
        signTxn(txns) {
            return Promise.resolve(txns.map((t) => {
                const signed = algosdk_1.default.signTransaction(algosdk_1.default.decodeUnsignedTransaction(js_base64_1.Base64.toUint8Array(t.txn)), acc.sk);
                return {
                    txID: signed.txID,
                    blob: js_base64_1.Base64.fromUint8Array(signed.blob),
                };
            }));
        },
        send({ tx }) {
            return algod.sendRawTransaction(js_base64_1.Base64.toUint8Array(tx)).do();
        },
    };
    return {
        algoSigner: signer,
        address: acc.addr,
        ledger: "any",
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
        if (typeof status === "undefined")
            throw new Error("Unable to get node status");
        const startround = status["last-round"] + 1;
        let currentround = startround;
        while (currentround < startround + timeout) {
            const pendingInfo = await algod.pendingTransactionInformation(txId).do();
            if (pendingInfo !== undefined) {
                if (pendingInfo["confirmed-round"] !== null &&
                    pendingInfo["confirmed-round"] > 0) {
                    // Got the completed Transaction
                    return pendingInfo;
                }
                if (pendingInfo["pool-error"] != null &&
                    pendingInfo["pool-error"].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error(`Transaction Rejected pool error${pendingInfo["pool-error"]}`);
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
            appArgs: [encoder.encode("opt_in_nft")],
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested,
        });
        const encodedTx = js_base64_1.Base64.fromUint8Array(callTx.toByte());
        const signedTxCall = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTxCall[0].blob,
        });
        await waitTxnConfirm(res.txId, 10000);
        const feesTx = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: BigInt(txFees.toString()),
            suggestedParams: suggested,
        });
        const transferTx = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: 1,
            assetIndex: nft.native.nftId,
            suggestedParams: suggested,
        });
        const tCallTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: args.sendNftAppId,
            appArgs: [
                encoder.encode("receive_nft"),
                encoder.encode(to),
                new Uint8Array(Buffer.concat([
                    Buffer.from(new Uint32Array([0]).buffer),
                    Buffer.from(new Uint32Array([chain_nonce]).buffer).reverse(),
                ])),
            ],
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested,
        });
        algosdk_1.default.assignGroupID([feesTx, transferTx, tCallTx]);
        const encodedTxns = [
            { txn: js_base64_1.Base64.fromUint8Array(feesTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(transferTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(tCallTx.toByte()) },
        ];
        const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
        const sendRes = await algod
            .sendRawTransaction([
            js_base64_1.Base64.toUint8Array(signedTxns[0].blob),
            js_base64_1.Base64.toUint8Array(signedTxns[1].blob),
            js_base64_1.Base64.toUint8Array(signedTxns[2].blob),
        ])
            .do();
        await waitTxnConfirm(sendRes.txId, 10000);
        return sendRes.txId;
    };
    async function claimNft(signer, info) {
        const suggested = await algod.getTransactionParams().do();
        const optIn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: signer.address,
            amount: 0,
            assetIndex: info.nftId,
            suggestedParams: suggested,
        });
        const encodedTx = js_base64_1.Base64.fromUint8Array(optIn.toByte());
        const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTx[0].blob,
        });
        await waitTxnConfirm(res.txId, 10000);
        const callTxn = algosdk_1.default.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: info.appId,
            appArgs: [encoder.encode("transfer_nft")],
            foreignAssets: [info.nftId],
            suggestedParams: suggested,
        });
        const encodedCall = js_base64_1.Base64.fromUint8Array(callTxn.toByte());
        const signedCall = await signer.algoSigner.signTxn([
            {
                txn: encodedCall,
            },
        ]);
        const callRes = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedCall[0].blob,
        });
        await waitTxnConfirm(callRes.txId, 10000);
        return callRes.txId;
    }
    return {
        algod,
        getNonce: () => args.nonce,
        claimNft,
        async claimAlgorandNft(signer, sourceChain, action, socket) {
            const info = await socket.waitAlgorandNft(sourceChain, action);
            return await claimNft(signer, info);
        },
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
    };
}
exports.algorandHelper = algorandHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxzREFBOEI7QUFDOUIsa0RBQTBCO0FBQzFCLCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUFvRG5DOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZUFBZTtJQUM3QiwyREFBMkQ7SUFDM0QsSUFBSSxPQUFPLFVBQVUsS0FBSyxXQUFXLEVBQUU7UUFDckMsTUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUMxQztJQUVELDJEQUEyRDtJQUMzRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBUkQsMENBUUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FDL0IsS0FBc0IsRUFDdEIsR0FBb0I7SUFFcEIsTUFBTSxNQUFNLEdBQWtCO1FBQzVCLFFBQVEsQ0FBQyxDQUFDO1lBQ1IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUNyQjtvQkFDRSxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUk7aUJBQ2xCO2FBQ0YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sQ0FBQyxJQUFJO1lBQ1YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2IsTUFBTSxNQUFNLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQ3BDLGlCQUFPLENBQUMseUJBQXlCLENBQUMsa0JBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzdELEdBQUcsQ0FBQyxFQUFFLENBQ1AsQ0FBQztnQkFDRixPQUFPO29CQUNMLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtvQkFDakIsSUFBSSxFQUFFLGtCQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7aUJBQ3pDLENBQUM7WUFDSixDQUFDLENBQUMs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