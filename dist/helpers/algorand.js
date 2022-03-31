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
    const transferNft = async (signer, chain_nonce, to, nft, _txFees, mintWith) => {
        const suggested = await algod.getTransactionParams().do();
        const transferTx = algosdk_1.default.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: signer.address,
            to: appAddr,
            amount: 1,
            assetIndex: nft.native.nftId,
            suggestedParams: suggested,
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
        algosdk_1.default.assignGroupID([tCallTx, transferTx]);
        const encodedTxns = [
            { txn: js_base64_1.Base64.fromUint8Array(tCallTx.toByte()) },
            { txn: js_base64_1.Base64.fromUint8Array(transferTx.toByte()) },
        ];
        const signedTxns = await signer.algoSigner.signTxn(encodedTxns);
        const sendRes = await algod
            .sendRawTransaction([
            js_base64_1.Base64.toUint8Array(signedTxns[0].blob),
            js_base64_1.Base64.toUint8Array(signedTxns[1].blob),
        ])
            .do();
        await waitTxnConfirm(sendRes.txId);
        return sendRes.txId;
    };
    async function isOptIn(addr, nftId) {
        const user = await algod.accountInformation(addr).do();
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
            foreignAssets: [info.nftId]
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
        async preTransfer(sender, nft, _fee) {
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
                amount: _fee.toNumber()
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
        transferNftToForeign: transferNft,
        unfreezeWrappedNft: async (signer, to, nft, txFees, nonce) => {
            // const nftMeta = await axios.get<MinWrappedNft>(nft.uri);
            return await transferNft(signer, parseInt(nonce), to, nft, txFees);
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
                const assetInfo = await algod.getAssetByID(nftId).do();
                return {
                    nftId,
                    appId,
                    uri: assetInfo.params.url,
                    name: assetInfo.params.name || "",
                };
            }));
            return res;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxnb3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9hbGdvcmFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxzREFBbUQ7QUFDbkQsaURBQTZEO0FBQzdELCtDQUF5QztBQUN6Qyx5Q0FBbUM7QUFDbkMsMEJBVVk7QUE0Q1o7Ozs7O0dBS0c7QUFDSCxTQUFnQixlQUFlO0lBQzdCLDJEQUEyRDtJQUMzRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsRUFBRTtRQUNyQyxNQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsMkRBQTJEO0lBQzNELE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFSRCwwQ0FRQztBQUVELFNBQWdCLGlCQUFpQixDQUMvQixLQUFzQixFQUN0QixHQUFvQjtJQUVwQixNQUFNLE1BQU0sR0FBa0I7UUFDNUIsUUFBUSxDQUFDLENBQUM7WUFDUixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCO29CQUNFLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSTtpQkFDbEI7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxDQUFDLElBQUk7WUFDVixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDYixNQUFNLE1BQU0sR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FDcEMsaUJBQU8sQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDN0QsR0FBRyxDQUFDLEVBQUUsQ0FDUCxDQUFDO2dCQUNGLE9BQU87b0JBQ0wsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO29CQUNqQixJQUFJLEVBQUUsa0JBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDekMsQ0FBQztZQUNK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