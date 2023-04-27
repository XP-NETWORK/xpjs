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
    const algod = new algosdk_1.default.Algodv2({ "X-API-Key": args.algodApiKey }, args.algodUri, "");
    const indexer = new algosdk_1.default.Indexer({ "X-API-Key": args.algodApiKey }, args.indexerUri, "");
    async function waitTxnConfirm(txId) {
        const status = await algod.status().do();
        let lastRound = status["last-round"];
        algod.pendingTransactionsInformation();
        let pendingInfo = (await algod
            .pendingTransactionInformation(txId)
            .do()
            .catch(() => ({})));
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
            const acc = await algod
                .accountInformation(address)
                .do()
                .catch(() => undefined);
            if (!acc)
                return new bignumber_js_1.BigNumber(0);
            return new bignumber_js_1.BigNumber(acc.amount);
        },
        async preTransfer(sender, nft, fee) {
            if (await isOptIn(sender.address, nft.native.nftId)) {
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
                const bal = await indexer
                    .lookupAssetBalances(nftId)
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
                    const req = (0, utils_1.formatJsonRpcRequest)("algo_signTxn", [txns]);
                    const signed = await connector.sendCustomRequest(req);
                    const decoded = signed.map((s) => {
                        return {
                            blob: s ?? "",
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
        async getTokenURI(_, tokenId) {
            if (tokenId) {
                const res = await indexer.lookupAssetByID(+tokenId).do();
                if (res?.asset?.params) {
                    return res.asset.params.url;
                }
            }
            return "";
        },
    };
}
exports.algorandHelper = algorandHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxzREFBbUQ7QUFDbkQsaURBQTZEO0FBQzdELCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUFDbkMsMEJBVVk7QUE2Q1o7Ozs7O0dBS0c7QUFDSCxTQUFnQixlQUFlO0lBQzdCLDJEQUEyRDtJQUMzRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsRUFBRTtRQUNyQyxNQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsMkRBQTJEO0lBQzNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFSRCwwQ0FRQztBQUVELFNBQWdCLGlCQUFpQixDQUMvQixLQUFzQixFQUN0QixHQUFvQjtJQUVwQixNQUFNLE1BQU0sR0FBa0I7UUFDNUIsUUFBUSxDQUFDLENBQUM7WUFDUixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCO29CQUNFLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSTtpQkFDbEI7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUk7WUFDVixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDYixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FDcEMsaUJBQU8sQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDN0QsR0FBRyxDQUFDLEVBQUUsQ0FDUCxDQUFDO2dCQUNGLE9BQU87b0JBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO29CQUNqQixJQUFJLEVBQUUsa0JBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDekMsQ0FBQztZQUNK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