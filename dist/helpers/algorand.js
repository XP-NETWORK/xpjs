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
            if (await isOptIn(args.sendNftAppAddress, nft.native.nftId)) {
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
                new Uint8Array(Buffer.from(new Uint32Array([nonce]).buffer).reverse()),
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