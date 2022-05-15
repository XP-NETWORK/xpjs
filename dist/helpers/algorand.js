"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorandHelper = exports.algoSignerWrapper = exports.typedAlgoSigner = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const utils_1 = require("@json-rpc-tools/utils");
const bignumber_js_1 = require("bignumber.js");
const js_base64_1 = require("js-base64");
const __1 = require("..");
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
// type MinWrappedNft = {
//   wrapped: {
//     origin: string;
//   };
// };
const encoder = new TextEncoder();
const MINT_NFT_COST = new bignumber_js_1.BigNumber(1000);
function algorandHelper(args) {
    const appAddr = algosdk_1.default.getApplicationAddress(args.sendNftAppId);
    const algod = new algosdk_1.default.Algodv2(args.algodApiKey, args.algodUri, args.algodPort);
    const indexer = new algosdk_1.default.Indexer(args.algodApiKey, args.indexerUri, args.algodPort);
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
    // async function compileProgram(
    //   client: Algodv2,
    //   programSource: string
    // ) {
    //   const enc = new TextEncoder();
    //   const programBytes = enc.encode(programSource);
    //   const compileResponse = await client.compile(programBytes).do();
    //   const compiledBytes = new Uint8Array(
    //     Buffer.from(compileResponse.result, 'base64')
    //   );
    //   return compiledBytes;
    // };
    // async function getMintPoolProgram(client: Algodv2, recv: any) {
    //   const poolSrc = fs.readFileSync(__dirname + '/bridge_pool.tmpl.teal');
    //   return await compileProgram(
    //     client,
    //     poolSrc.toString().replace('TMPL_RECV_ADDR', recv)
    //   );
    // }
    const transferNft = async (signer, chain_nonce, to, nft, txFees, mintWith) => {
        const suggested = await algod.getTransactionParams().do();
        const transferTx = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: 1,
            assetIndex: nft.native.nftId,
            suggestedParams: suggested,
        });
        const paymentTxn = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
            from: signer.address,
            suggestedParams: suggested,
            to: appAddr,
            amount: BigInt(txFees.toString()),
        });
        const appArgs = [
            encoder.encode("freeze_nft"),
            encoder.encode(to),
            new Uint8Array(Buffer.concat([
                Buffer.from(new Uint32Array([0]).buffer),
                Buffer.from(new Uint32Array([chain_nonce]).buffer).reverse(),
            ])),
        ];
        if (mintWith) {
            appArgs.push(encoder.encode(mintWith));
        }
        const tCallTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            appIndex: args.sendNftAppId,
            appArgs,
            foreignAssets: [nft.native.nftId],
            suggestedParams: suggested,
        });
        algosdk_1.default.assignGroupID([tCallTx, transferTx, paymentTxn]);
        const encodedTxns = [
            { txn: js_base64_1.Base64.fromUint8Array(tCallTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(transferTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(paymentTxn.toByte()) },
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
        await args.notifier.notifyAlgorand(sendRes.txId);
        return sendRes.txId;
    };
    async function isOptIn(addr, nftId) {
        const userRes = await indexer.lookupAccountByID(addr).do();
        const user = userRes["account"];
        if (!user.assets)
            return false;
        for (let i = 0; i < user["assets"].length; i++) {
            if (user["assets"][i]["asset-id"] === nftId) {
                return true;
            }
        }
        return false;
    }
    async function optInNft(signer, nft) {
        if (await isOptIn(signer.address, nft.nftId)) {
            return undefined;
        }
        const suggested = await algod.getTransactionParams().do();
        const optIn = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: signer.address,
            amount: 0,
            assetIndex: nft.nftId,
            suggestedParams: suggested,
        });
        const encodedTx = js_base64_1.Base64.fromUint8Array(optIn.toByte());
        const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTx[0].blob,
        });
        await waitTxnConfirm(res.txId);
        return res.txId;
    }
    async function claimNft(signer, info) {
        await optInNft(signer, info);
        const suggested = await algod.getTransactionParams().do();
        const txn = algosdk_1.default.makeApplicationNoOpTxnFromObject({
            from: signer.address,
            suggestedParams: suggested,
            appIndex: info.appId,
            appArgs: [encoder.encode("transfer_nft")],
            foreignAssets: [info.nftId],
        });
        const encodedTx = js_base64_1.Base64.fromUint8Array(txn.toByte());
        const signedTx = await signer.algoSigner.signTxn([{ txn: encodedTx }]);
        const res = await signer.algoSigner.send({
            ledger: signer.ledger,
            tx: signedTx[0].blob,
        });
        await waitTxnConfirm(res.txId);
        return res.txId;
    }
    return {
        XpNft: "",
        algod,
        getNonce: () => __1.Chain.ALGORAND,
        claimNft,
        optInNft,
        isOptIn,
        async balance(address) {
            const acc = await algod.accountInformation(address).do().catch(() => undefined);
            if (!acc)
                return new bignumber_js_1.BigNumber(0);
            return new bignumber_js_1.BigNumber(acc.amount);
        },
        async preTransfer(sender, nft, fee) {
            if (await isOptIn(appAddr, nft.native.nftId)) {
                return undefined;
            }
            const suggested = await algod.getTransactionParams().do();
            const callTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
                from: sender.address,
                appIndex: args.sendNftAppId,
                appArgs: [encoder.encode("optin_asset")],
                foreignAssets: [nft.native.nftId],
                suggestedParams: suggested,
            });
            const feesTx = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender.address,
                suggestedParams: suggested,
                to: appAddr,
                amount: BigInt(fee.toString()),
            });
            algosdk_1.default.assignGroupID([callTx, feesTx]);
            const encodedTxns = [
                { txn: js_base64_1.Base64.fromUint8Array(callTx.toByte()) },
                { txn: js_base64_1.Base64.fromUint8Array(feesTx.toByte()) },
            ];
            const signedTxns = await sender.algoSigner.signTxn(encodedTxns);
            const sendRes = await algod
                .sendRawTransaction([
                js_base64_1.Base64.toUint8Array(signedTxns[0].blob),
                js_base64_1.Base64.toUint8Array(signedTxns[1].blob),
            ])
                .do();
            await waitTxnConfirm(sendRes.txId);
            return suggested;
        },
        getFeeMargin() {
            return args.feeMargin;
        },
        transferNftToForeign: transferNft,
        unfreezeWrappedNft: async (signer, to, nft, txFees, nonce) => {
            const suggested = await algod.getTransactionParams().do();
            const transferTx = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: signer.address,
                to: appAddr,
                amount: 1,
                assetIndex: nft.native.nftId,
                suggestedParams: suggested,
            });
            const sTransferTx = await signer.algoSigner.signTxn([
                { txn: js_base64_1.Base64.fromUint8Array(transferTx.toByte()) },
            ]);
            const transferRes = await algod
                .sendRawTransaction(js_base64_1.Base64.toUint8Array(sTransferTx[0].blob))
                .do();
            await waitTxnConfirm(transferRes.txId);
            const paymentTxn = algosdk_1.default.makePaymentTxnWithSuggestedParamsFromObject({
                from: signer.address,
                suggestedParams: suggested,
                to: appAddr,
                amount: BigInt(txFees.toString()),
            });
            const appArgs = [
                encoder.encode("withdraw_nft"),
                encoder.encode(to),
                new Uint8Array(Buffer.from(new Uint32Array([parseInt(nonce)]).buffer).reverse()),
                new Uint8Array(Buffer.from("")),
            ];
            const tCallTx = algosdk_1.default.makeApplicationNoOpTxnFromObject({
                from: signer.address,
                appIndex: args.sendNftAppId,
                appArgs,
                foreignAssets: [nft.native.nftId],
                suggestedParams: suggested,
            });
            algosdk_1.default.assignGroupID([tCallTx, paymentTxn]);
            const encodedTxns = [
                { txn: js_base64_1.Base64.fromUint8Array(tCallTx.toByte()) },
                { txn: js_base64_1.Base64.fromUint8Array(paymentTxn.toByte()) },
            ];
            const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
            const sendRes = await algod
                .sendRawTransaction([
                js_base64_1.Base64.toUint8Array(signedTxns[0].blob),
                js_base64_1.Base64.toUint8Array(signedTxns[1].blob),
            ])
                .do();
            await waitTxnConfirm(sendRes.txId);
            await args.notifier.notifyAlgorand(sendRes.txId);
            return sendRes.txId;
        },
        estimateValidateTransferNft: () => Promise.resolve(MINT_NFT_COST),
        estimateValidateUnfreezeNft: () => Promise.resolve(MINT_NFT_COST),
        validateAddress: (adr) => Promise.resolve(algosdk_1.default.isValidAddress(adr)),
        claimableNfts: async (txSocket, owner) => {
            await txSocket.cleanNfts(owner);
            const claims = await txSocket.claimNfts(owner);
            const res = await Promise.all(claims.map(async (v) => {
                const appId = parseInt(v.app_id);
                const nftId = parseInt(v.nft_id);
                const assetRes = await indexer
                    .lookupAssetByID(nftId)
                    .do()
                    .catch(() => undefined);
                if (assetRes == undefined)
                    return [];
                const assetInfo = assetRes.asset;
                const bal = await indexer.lookupAssetBalances(nftId)
                    .currencyGreaterThan(0)
                    .currencyLessThan(2)
                    .limit(1)
                    .do();
                if (bal.balances[0].address == owner || bal.balances[0].amount == 0)
                    return [];
                return [
                    {
                        nftId,
                        appId,
                        uri: assetInfo.params.url,
                        name: assetInfo.params.name || "",
                    },
                ];
            }));
            return res.flat();
        },
        walletConnectSigner(connector, address) {
            const signer = {
                accounts(_) {
                    return Promise.resolve(connector.accounts.map((s) => ({ address: s })));
                },
                async signTxn(txns) {
                    const req = utils_1.formatJsonRpcRequest("algo_signTxn", [txns]);
                    const signed = await connector.sendCustomRequest(req);
                    const decoded = signed.map((s) => {
                        return {
                            blob: s !== null && s !== void 0 ? s : "",
                        };
                    });
                    if (decoded.length != txns.length) {
                        throw Error("Couldn't sign all transactions!");
                    }
                    return decoded;
                },
                send(info) {
                    return algod.sendRawTransaction(js_base64_1.Base64.toUint8Array(info.tx)).do();
                },
            };
            return {
                algoSigner: signer,
                address,
                ledger: "any",
            };
        },
        myAlgoSigner(myAlgo, address) {
            const signer = {
                async accounts(_) {
                    const accs = await myAlgo.connect();
                    return accs;
                },
                async signTxn(txns) {
                    const stxs = await myAlgo.signTransaction(txns.map(({ txn }) => txn));
                    return stxs.map((tx) => ({
                        txID: tx.txID,
                        blob: js_base64_1.Base64.fromUint8Array(tx.blob),
                    }));
                },
                send(info) {
                    return algod.sendRawTransaction(js_base64_1.Base64.toUint8Array(info.tx)).do();
                },
            };
            return {
                algoSigner: signer,
                address,
                ledger: "any",
            };
        },
    };
}
exports.algorandHelper = algorandHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxzREFBbUQ7QUFDbkQsaURBQTZEO0FBQzdELCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUFDbkMsMEJBVVk7QUE2Q1o7Ozs7O0dBS0c7QUFDSCxTQUFnQixlQUFlO0lBQzdCLDJEQUEyRDtJQUMzRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsRUFBRTtRQUNyQyxNQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsMkRBQTJEO0lBQzNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFSRCwwQ0FRQztBQUVELFNBQWdCLGlCQUFpQixDQUMvQixLQUFzQixFQUN0QixHQUFvQjtJQUVwQixNQUFNLE1BQU0sR0FBa0I7UUFDNUIsUUFBUSxDQUFDLENBQUM7WUFDUixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCO29CQUNFLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSTtpQkFDbEI7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUk7WUFDVixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDYixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FDcEMsaUJBQU8sQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDN0QsR0FBRyxDQUFDLEVBQUUsQ0FDUCxDQUFDO2dCQUNGLE9BQU87b0JBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO29CQUNqQixJQUFJLEVBQUUsa0JBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDekMsQ0FBQztZQUNK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