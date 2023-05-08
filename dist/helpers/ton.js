"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tonHelper = void 0;
const anchor_1 = require("@project-serum/anchor");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const ton_1 = require("ton");
const consts_1 = require("../consts");
const ton_bridge_1 = require("./ton-bridge");
const emitter_1 = require("../services/emitter");
const js_base64_1 = require("js-base64");
const axios_1 = __importDefault(require("ton/node_modules/axios"));
async function tonHelper(args) {
    const bridge = new ton_bridge_1.BridgeContract(args.tonweb.provider, {
        address: args.bridgeAddr,
        burner: args.burnerAddr,
    });
    const ton = args.tonweb;
    ton.provider.sendBoc = (b) => ton.provider.send("sendBocReturnHash", { boc: b });
    async function waitTonTrx(exBodyMsg, value, address, msgType) {
        console.log(exBodyMsg, "TON:exBodyMsg");
        let body = "";
        let stop = false;
        let fastResolve;
        const setStop = () => {
            stop = true;
            emitter_1.Emitter?.removeEventListener("cancel tonKeeper", setStop);
            fastResolve(true);
            throw new Error("User has declined transaction");
        };
        const noTrx = setTimeout(() => {
            stop = true;
            throw new Error("waitTonTrx timeout");
        }, 60 * 1000 * 20);
        emitter_1.Emitter?.addEventListener("cancel tonKeeper", setStop);
        await new Promise((r) => {
            setTimeout(r, 10 * 1000);
        });
        async function getUserTrxs(address) {
            try {
                await new Promise((r) => {
                    setTimeout(r, 30 * 1000);
                });
                const trxs = await ton.provider.getTransactions(address, 20);
                return trxs;
            }
            catch (e) {
                console.log(e, "new iterration 30 sec");
                return await getUserTrxs(address);
            }
        }
        while (!body) {
            console.log("TON:tring to find the trx...");
            if (stop)
                return;
            //get last 20 trx of address
            const timeout = setTimeout(() => {
                throw new Error("TON: timeout when trying to send trx");
            }, 60 * 1000 * 10);
            const trxs = await getUserTrxs(address);
            if (trxs) {
                clearTimeout(timeout);
            }
            //find body of the trx
            body = trxs.find((trx) => {
                const messages = trx[msgType];
                let message = "";
                let msgVal = "";
                message = Array.isArray(messages)
                    ? messages?.at(0)?.msg_data?.body
                    : messages?.msg_data?.body;
                msgVal = Array.isArray(trx["out_msgs"])
                    ? trx.out_msgs?.at(0)?.value
                    : trx["out_msgs"].value;
                trx.utime * 1000 >= +new Date(Date.now() - 1000 * 60 * 5) &&
                    console.log(trx.utime, "trx happend no more than 5 minutes ago");
                return message === exBodyMsg && msgVal === value;
            })?.data;
        }
        clearTimeout(noTrx);
        const dict = ton_1.Cell.fromBoc(Buffer.from(body, "base64"))[0].hash();
        const exHash = dict.toString("base64");
        console.log(exHash, "exHash");
        let trxData = undefined;
        while (trxData === undefined) {
            await new Promise((r) => setTimeout(r, 6 * 1000));
            const res = await (0, axios_1.default)(`https://toncenter.com/api/index/getTransactionByHash?tx_hash=${encodeURIComponent(exHash)}&include_msg_body=true`).catch(() => undefined);
            trxData = res?.data;
        }
        return trxData[0]["in_msg"].hash;
    }
    return {
        preTransfer: () => Promise.resolve(true),
        preUnfreeze: () => Promise.resolve(true),
        getNonce: () => consts_1.Chain.TON,
        XpNft: args.xpnftAddr,
        async balance(address) {
            return new bignumber_js_1.default(await ton.getBalance(address));
        },
        async estimateValidateTransferNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async estimateValidateUnfreezeNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async validateAddress(adr) {
            return tonweb_1.default.Address.isValid(adr);
        },
        getFeeMargin() {
            return args.feeMargin;
        },
        async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
            const rSigner = signer.wallet || ton;
            const txFeesFull = new anchor_1.BN(txFees.toString(10)).add(tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7)));
            const nftFee = tonweb_1.default.utils.toNano("0.07");
            const payload = await bridge.createFreezeBody({
                amount: txFeesFull.sub(nftFee),
                to: Buffer.from(to),
                chainNonce,
                mintWith: Buffer.from(mintWith),
            });
            console.log(txFeesFull.toString(10), "val");
            console.log("TON:transferNftToForeign");
            console.log(nft.native.nftItemAddr);
            const res = (await rSigner.send("ton_sendTransaction", {
                value: txFeesFull.toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            const hash = await rSigner.handleResponse(res);
            await args.notifier.notifyTon(hash);
            return hash;
        },
        async unfreezeWrappedNft(signer, to, nft, _txFees, chainNonce) {
            const rSigner = signer.wallet || ton;
            const value = new anchor_1.BN(_txFees.toString(10)).add(tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7)));
            const nftFee = tonweb_1.default.utils.toNano("0.05");
            const payload = await bridge.createWithdrawBody({
                to: new Uint8Array(Buffer.from(to)),
                chainNonce: parseInt(chainNonce),
                txFees: value.sub(nftFee),
            });
            console.log(value.toString(10), "v");
            console.log(nft.native.nftItemAddr);
            console.log("TON:unfreezeWrappedNft");
            const res = (await rSigner.send("ton_sendTransaction", {
                value: new anchor_1.BN(value).toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            const hash = await rSigner.handleResponse(res);
            await args.notifier.notifyTon(hash);
            return hash;
        },
        tonKeeperWrapper(args) {
            console.log(args, "args");
            let payload = "";
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            payload = (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false));
                            value = params.value;
                            return args.wallet.send(`https://app.tonkeeper.com/transfer/${params.to}?amount=${new anchor_1.BN(value).toString(10)}&bin=${encodeURIComponent(payload)}&open=1`);
                        //!
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    console.log(res);
                    const result = await waitTonTrx(payload, value, args.config.address, "out_msgs");
                    args.wallet.onSuccess && args.wallet.onSuccess();
                    return result;
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonWalletWrapper(args) {
            let payload = "";
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            value = params.value;
                            payload = (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false));
                            console.log(payload, "payload");
                            return await args.wallet.send("ton_sendTransaction", [
                                {
                                    to: params.to,
                                    value,
                                    dataType: "boc",
                                    data: payload,
                                },
                            ]);
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    return (res &&
                        (await waitTonTrx(payload, value, args.config.address, "out_msgs")));
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonHubWrapper(args) {
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            value = new anchor_1.BN(params.value).toString();
                            return await args.wallet.requestTransaction({
                                seed: args.config.seed,
                                appPublicKey: args.config.appPublicKey,
                                to: params.to,
                                value,
                                timeout: 5 * 60 * 1000,
                                text: `ton_sendTransaction to ${params.to}`,
                                payload: (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false)),
                            });
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    if (res.type === "success" && res.response != undefined) {
                        return await waitTonTrx(res.response, value, args.config.address, "in_msg");
                    }
                    else {
                        throw new Error(`TonHub:${res.type}`);
                    }
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonKpWrapper(kp) {
            const wallet = new tonweb_1.default.Wallets.all.v3R2(ton.provider, {
                publicKey: kp.publicKey,
                wc: 0,
            });
            const wWallet = {
                async send(method, params) {
                    switch (method) {
                        case "ton_getBalance":
                            return await ton.getBalance(await wallet.getAddress());
                        case "ton_requestAccounts":
                            return [await wallet.getAddress()];
                        case "ton_sendTransaction":
                            return await wallet.methods
                                .transfer({
                                secretKey: kp.secretKey,
                                toAddress: params.to,
                                amount: new anchor_1.BN(params.value),
                                seqno: (await wallet.methods.seqno().call()) || 0,
                                sendMode: 3,
                                payload: params.data,
                            })
                                .send();
                    }
                },
                async handleResponse(res) {
                    return res.hash;
                },
            };
            return {
                wallet: wWallet,
                accIdx: 0,
            };
        },
        async isNftWhitelisted(nft) {
            const collectionAddress = nft.native?.collectionAddress;
            if (!collectionAddress)
                return false;
            const whitelistedCollections = await bridge.getWhitelist();
            return whitelistedCollections.includes(collectionAddress) ? true : false;
        },
    };
}
exports.tonHelper = tonHelper;
/**
 *
 *     const ton = new TonWeb(
      new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
        apiKey:
          "05645d6b549f33bf80cee8822bd63df720c6781bd00020646deb7b2b2cd53b73",
      })
    );

    const trxs = await ton.provider.getTransactions(
      "EQBhSfdrfydwE4Sl4-sWUYhNHsQcVTGR3p2JA14C2_PNdgfs",
      20
    );

    console.log(trxs);

    let data = new Cell();
    console.log(data);
    const dict = Cell.fromBoc(
      Buffer.from(
        "te6cckECDAEAAtkAA7V2FJ92t/J3AThKXj6xZRiE0exBxVMZHenYkDXgLb8812AAAdm2v+2EFpyXsCyPQOlDXCGvDlGdb9/YPNRPgD98AgAsIvgTYcYAAAHZqugyeDY2O1EgADRtIKRIAQIDAgHgBAUAgnIXMm/rsAMDO9FDdU/1I47b332HXYKcIvfN53pZj/VL8XxAXw8HICdzOmVFlgwy6XfTfJTbuplVQh4PnMQir/B3AhEMgouGGZPPBEAKCwHhiADCk+7W/k7gJwlLx9YsoxCaPYg4qmMjvTsSBrwFt+ea7AHPX0P+BlViv5FLRo4uUALd1xnuqimnA//t0BCCufv3iVjYINGcRw+ljDnirrtKYcGN629BfyEuTEj2eIBH7pAxTU0YuxsdqmAAAABAABwGAQHfBwFoYgBuLG9sHzPjFfimuHMhmTMm2J2PjG2QS0wA58SpRc6PpiAmJaAAAAAAAAAAAAAAAAAAAQgBsWgAwpPu1v5O4CcJS8fWLKMQmj2IOKpjI707Ega8Bbfnmu0ANxY3tg+Z8Yr8U1w5kMyZk2xOx8Y2yCWmAHPiVKLnR9MQExLQAAYuoZgAADs21/2whMbHaiTACAGfX8w9FAAAAAAAAAAAgAhTrcJncddU9sZlDMvNz2ZSqJDp5YplXYGBr0ckiINkEAPcWJzy2hGXRIgyzC2jzCbLkfjUINlQYAjIgr3kCXkEFBgJAHIHACoweDQ3QmYwZGFlNmU5MmU0OWEzYzk1ZTViMGM3MTQyMjg5MUQ1Y2Q0RkUAAAAAAAAAAAAAAAAAnUGdgxOIAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAb8mRfJBMLqFQAAAAAAACAAAAAAADChE7JLQbmSipXzKEUnUNwnWjHPBXefxRxAbt/uNGHeZA0DgsouCJ3A==",
        "base64"
      )
    )[0].hash();
    console.log("Hash: " + dict.toString("base64"));
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRzVCLDZCQUFvQztBQUNwQyxzQ0FBa0M7QUFnQmxDLDZDQUE4QztBQUU5QyxpREFBOEM7QUFHOUMseUNBQTJDO0FBQzNDLG1FQUEyQztBQXVFcEMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFlO0lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksMkJBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUN0RCxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVU7UUFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO0tBQ3hCLENBQUMsQ0FBQztJQUVILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUE0QixDQUFDO0lBQzlDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDM0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVyRCxLQUFLLFVBQVUsVUFBVSxDQUN2QixTQUFpQixFQUNqQixLQUFhLEVBQ2IsT0FBZSxFQUNmLE9BQThCO1FBRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXhDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7UUFDakIsSUFBSSxXQUFnQixDQUFDO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ1osaUJBQU8sRUFBRSxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztZ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