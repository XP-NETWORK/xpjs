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
    async function waitTxnConfirm(txId) {
        const status = await algod.status().do();
        let lastRound = status["last-round"];
        let pendingInfo = await algod.pendingTransactionInformation(txId).do();
        while (!(pendingInfo["confirmed-round"] && pendingInfo["confirmed-round"] > 0)) {
            lastRound += 1;
            await algod.statusAfterBlock(lastRound).do();
            pendingInfo = await algod.pendingTransactionInformation(txId).do();
        }
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
        await waitTxnConfirm(res.txId);
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
        await waitTxnConfirm(sendRes.txId);
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
        await waitTxnConfirm(res.txId);
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
        await waitTxnConfirm(callRes.txId);
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