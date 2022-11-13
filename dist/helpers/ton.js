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
const emitter_1 = require("../emitter");
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
        var _a;
        console.log(exBodyMsg, "TON:exBodyMsg");
        let body = "";
        let stop = false;
        const setStop = () => {
            stop = true;
            emitter_1.Emitter === null || emitter_1.Emitter === void 0 ? void 0 : emitter_1.Emitter.removeEventListener("cancel tonKeeper", setStop);
            throw new Error("User has declined transaction");
        };
        const noTrx = setTimeout(() => {
            stop = true;
            throw new Error("waitTonTrx timeout");
        }, 60 * 1000 * 20);
        emitter_1.Emitter === null || emitter_1.Emitter === void 0 ? void 0 : emitter_1.Emitter.addEventListener("cancel tonKeeper", setStop);
        while (!body) {
            console.log("TON:tring to find the trx...");
            await new Promise((r) => setTimeout(r, 10 * 1000));
            if (stop)
                return;
            //get last 20 trx of address
            const trxs = await ton.provider.getTransactions(address, 20);
            //find body of the trx
            body = (_a = trxs.find((trx) => {
                var _a, _b, _c, _d, _e;
                const messages = trx[msgType];
                let message = "";
                let msgVal = "";
                message = Array.isArray(messages)
                    ? (_b = (_a = messages === null || messages === void 0 ? void 0 : messages.at(0)) === null || _a === void 0 ? void 0 : _a.msg_data) === null || _b === void 0 ? void 0 : _b.body
                    : (_c = messages === null || messages === void 0 ? void 0 : messages.msg_data) === null || _c === void 0 ? void 0 : _c.body;
                msgVal = Array.isArray(trx["out_msgs"])
                    ? (_e = (_d = trx.out_msgs) === null || _d === void 0 ? void 0 : _d.at(0)) === null || _e === void 0 ? void 0 : _e.value
                    : trx["out_msgs"].value;
                trx.utime * 1000 >= +new Date(Date.now() - 1000 * 60 * 5) &&
                    console.log(trx.utime, "trx happend no more than 5 minutes ago");
                return message === exBodyMsg && msgVal === value;
            })) === null || _a === void 0 ? void 0 : _a.data;
        }
        clearTimeout(noTrx);
        const dict = ton_1.Cell.fromBoc(Buffer.from(body, "base64"))[0].hash();
        const exHash = dict.toString("base64");
        console.log(exHash, "exHash");
        let trxData = undefined;
        while (trxData === undefined) {
            await new Promise((r) => setTimeout(r, 6 * 1000));
            const res = await (0, axios_1.default)(`https://toncenter.com/api/index/getTransactionByHash?tx_hash=${encodeURIComponent(exHash)}&include_msg_body=true`).catch(() => undefined);
            trxData = res === null || res === void 0 ? void 0 : res.data;
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
            const value = tonweb_1.default.utils.toNano((Math.random() * (0.09 - 0.08) + 0.08).toFixed(8));
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
                            return args.wallet.send(`https://app.tonkeeper.com/transfer/${params.to}?amount=${new anchor_1.BN(value).toString(10)}&bin=${encodeURIComponent(payload)}`);
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    console.log(res);
                    return await waitTonTrx(payload, value, args.config.address, "out_msgs");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRzVCLDZCQUFvQztBQUNwQyxzQ0FBa0M7QUFlbEMsNkNBQThDO0FBRTlDLHdDQUFxQztBQUdyQyx5Q0FBMkM7QUFDM0MsbUVBQTJDO0FBb0VwQyxLQUFLLFVBQVUsU0FBUyxDQUFDLElBQWU7SUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3RELE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVTtRQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7S0FDeEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQTRCLENBQUM7SUFDOUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUMzQixHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJELEtBQUssVUFBVSxVQUFVLENBQ3ZCLFNBQWlCLEVBQ2pCLEtBQWEsRUFDYixPQUFlLEVBQ2YsT0FBOEI7O1FBRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXhDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7UUFDakIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxJQUFJLENBQUM7WUFDWixpQkFBTyxhQUFQLGlCQUFPLHVCQUFQLGlCQUFPLENBQUUsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztRQUNGLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUN4QyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVuQixpQkFBTyxhQUFQLGlCQUFPLHVCQUFQLGlCQUFPLENBQUUsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdkQsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUM1QyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksSUFBSTtnQkFBRSxPQUFPO1lBQ2pCLDRCQUE0QjtZQUM1QixNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3RCxzQkFBc0I7WUFDdEIsSUFBSSxHQUFHLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFOztnQkFDNUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QixJQUFJLE9BQU8sR0FBVyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztnQkFFeEIsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO29CQUMvQixDQUFDLENBQUMsTUFBQSxNQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLDBDQUFFLFFBQVEsMENBQUUsSUFBSTtvQkFDakMsQ0FBQyxDQUFDLE1BQUEsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLFFBQVEsMENBQUUsSUFBSSxDQUFDO2dCQUM3QixNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3JDLENBQUMsQ0FBQyxNQUFBLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxLQUFLO29CQUM1QixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFFMUIsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO2dCQUVuRSxPQUFPLE9BQU8sS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLEtBQUssQ0FBQztZQUNuRCxDQUFDLENBQUMsMENBQUUsSUFBSSxDQUFDO1NBQ1Y7UUFFRCxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFcEIsTUFBTSxJQUFJLEdBQUcsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWxFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFOUIsSUFBSSxPQUFPLEdBQVEsU0FBUyxDQUFDO1FBRTdCLE9BQU8sT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUM1QixNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxlQUFLLEVBQ3JCLGdFQUFnRSxrQkFBa0IsQ0FDaEYsTUFBTSxDQUNQLHdCQUF3QixDQUMxQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV6QixPQUFPLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLElBQUksQ0FBQztTQUNyQjtRQUVELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRUQsT0FBTztRQUNMLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUN4QyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDeEMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQUssQ0FBQyxHQUFHO1FBQ3pCLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUztRQUNyQixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkI7WUFDL0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLE9BQU8sZ0JBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRO1lBQ3RFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1lBRXJDLE1BQU0sVUFBVSxHQUFHLElBQUksV0FBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ2hELGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDdkQsQ0FBQztZQUVGLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDNUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM5QixFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLFVBQVU7Z0JBQ1YsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2hDLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU1QyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUNyRCxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0JBQzFCLElBQUksRUFBRSxPQUFPO2FBQ2QsQ0FBQyxDQUFzQixDQUFDO1lBRXpCLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVTtZQUMzRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUVyQyxNQUFNLEtBQUssR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQy9CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FDbEQsQ0FBQztZQUVGLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDOUMsRUFBRSxFQUFFLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUNoQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFdEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3JELEtBQUssRUFBRSxJQUFJLFdBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXO2dCQUMxQixJQUFJLEVBQUUsT0FBTzthQUNkLENBQUMsQ0FBc0IsQ0FBQztZQUV6QixNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFL0MsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFhO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFCLElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztZQUN6QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixNQUFNLE1BQU0sR0FBYztnQkFDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtvQkFDdkIsUUFBUSxNQUFNLEVBQUU7d0JBQ2QsS0FBSyxxQkFBcUI7NEJBQ3hCLE9BQU8sR0FBRyxJQUFBLDBCQUFjLEVBQUMsTUFBTSxNQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUMxRCxLQUFLLEdBQUcsTUFBTyxDQUFDLEtBQUssQ0FBQzs0QkFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDckIsc0NBQ0UsTUFBTyxDQUFDLEVBQ1YsV0FBVyxJQUFJLFdBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsa0JBQWtCLENBQzdELE9BQU8sQ0FDUixFQUFFLENBQ0osQ0FBQzt3QkFFSjs0QkFDRSxPQUFPLElBQUksQ0FBQztxQkFDZjtnQkFDSCxDQUFDO2dCQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBWTtvQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsT0FBTyxNQUFNLFVBQVUsQ0FDckIsT0FBTyxFQUNQLEtBQUssRUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsRUFDcEIsVUFBVSxDQUNYLENBQUM7Z0JBQ0osQ0FBQzthQUNGLENBQUM7WUFFRixPQUFPO2dCQUNMLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE1BQU0sRUFBRSxDQUFDO2FBQ1YsQ0FBQztRQUNKLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFhO1lBQzVCLElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztZQUN6QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixNQUFNLE1BQU0sR0FBYztnQkFDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtvQkFDdkIsUUFBUSxNQUFNLEVBQUU7d0JBQ2QsS0FBSyxxQkFBcUI7NEJBQ3hCLEtBQUssR0FBRyxNQUFPLENBQUMsS0FBSyxDQUFDOzRCQUV0QixPQUFPLEdBQUcsSUFBQSwwQkFBYyxFQUFDLE1BQU0sTUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ2hDLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDbkQ7b0NBQ0UsRUFBRSxFQUFFLE1BQU8sQ0FBQyxFQUFFO29DQUNkLEtBQUs7b0NBQ0wsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsSUFBSSxFQUFFLE9BQU87aUNBQ2Q7NkJBQ0YsQ0FBQyxDQUFDO3dCQUNMOzRCQUNFLE9BQU8sSUFBSSxDQUFDO3FCQUNmO2dCQUNILENBQUM7Z0JBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFZO29CQUMvQixPQUFPLENBQ0wsR0FBRzt3QkFDSCxDQUFDLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FDckUsQ0FBQztnQkFDSixDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELGFBQWEsQ0FBQyxJQUFhO1lBQ3pCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLE1BQU0sTUFBTSxHQUFjO2dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLHFCQUFxQjs0QkFDeEIsS0FBSyxHQUFHLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUM7Z0NBQzFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUs7Z0NBQ3ZCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQWE7Z0NBQ3ZDLEVBQUUsRUFBRSxNQUFPLENBQUMsRUFBRTtnQ0FDZCxLQUFLO2dDQUNMLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUk7Z0NBQ3RCLElBQUksRUFBRSwwQkFBMEIsTUFBTyxDQUFDLEVBQUUsRUFBRTtnQ0FDNUMsT0FBTyxFQUFFLElBQUEsMEJBQWMsRUFBQyxNQUFNLE1BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUN6RCxDQUFDLENBQUM7d0JBRUw7NEJBQ0UsT0FBTyxJQUFJLENBQUM7cUJBQ2Y7Z0JBQ0gsQ0FBQztnQkFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQThCO29CQUNqRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUN2RCxPQUFPLE1BQU0sVUFBVSxDQUNyQixHQUFHLENBQUMsUUFBUSxFQUNaLEtBQUssRUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsRUFDcEIsUUFBUSxDQUNULENBQUM7cUJBQ0g7eUJBQU07d0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUN2QztnQkFDSCxDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELFlBQVksQ0FBQyxFQUEwQjtZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDdkQsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dCQUN2QixFQUFFLEVBQUUsQ0FBQzthQUNOLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxHQUFjO2dCQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLGdCQUFnQjs0QkFDbkIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzt3QkFDekQsS0FBSyxxQkFBcUI7NEJBQ3hCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUNyQyxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxNQUFNLE1BQU0sQ0FBQyxPQUFPO2lDQUN4QixRQUFRLENBQUM7Z0NBQ1IsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dDQUN2QixTQUFTLEVBQUUsTUFBTyxDQUFDLEVBQUU7Z0NBQ3JCLE1BQU0sRUFBRSxJQUFJLFdBQUUsQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO2dDQUM3QixLQUFLLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO2dDQUNqRCxRQUFRLEVBQUUsQ0FBQztnQ0FDWCxPQUFPLEVBQUUsTUFBTyxDQUFDLElBQUk7NkJBQ3RCLENBQUM7aUNBQ0QsSUFBSSxFQUFFLENBQUM7cUJBQ2I7Z0JBQ0gsQ0FBQztnQkFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQXFCO29CQUN4QyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7YUFDRixDQUFDO1lBRUYsT0FBTztnQkFDTCxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUUsQ0FBQzthQUNWLENBQUM7UUFDSixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUE5VEQsOEJBOFRDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5QkcifQ==