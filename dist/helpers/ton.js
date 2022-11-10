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
        const noTrx = setTimeout(() => {
            throw new Error("waitTonTrx timeout");
        }, 60 * 1000 * 20);
        while (!body) {
            console.log("TON:tring to find the trx...");
            await new Promise((r) => setTimeout(r, 10 * 1000));
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
            console.log(rSigner);
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
            //const txFeesFull = TonWeb.utils.toNano("0.08");
            //random value between  0.08 and 0.09 with 8 digits after .
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
                            value = new anchor_1.BN(params.value).toString();
                            return args.wallet.send(`https://app.tonkeeper.com/transfer/${params.to}?amount=${value}&text=NFTSend&bin=${payload}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRzVCLDZCQUFvQztBQUNwQyxzQ0FBa0M7QUFlbEMsNkNBQThDO0FBRzlDLHlDQUEyQztBQUMzQyxtRUFBMkM7QUFvRXBDLEtBQUssVUFBVSxTQUFTLENBQUMsSUFBZTtJQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLDJCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDdEQsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVO1FBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtLQUN4QixDQUFDLENBQUM7SUFFSCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBNEIsQ0FBQztJQUM5QyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzNCLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckQsS0FBSyxVQUFVLFVBQVUsQ0FDdkIsU0FBaUIsRUFDakIsS0FBYSxFQUNiLE9BQWUsRUFDZixPQUE4Qjs7UUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFeEMsSUFBSSxJQUFJLEdBQVcsRUFBRSxDQUFDO1FBRXRCLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRW5CLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRCw0QkFBNEI7WUFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0Qsc0JBQXNCO1lBQ3RCLElBQUksR0FBRyxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTs7Z0JBQzVCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxPQUFPLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztvQkFDL0IsQ0FBQyxDQUFDLE1BQUEsTUFBQSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxRQUFRLDBDQUFFLElBQUk7b0JBQ2pDLENBQUMsQ0FBQyxNQUFBLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxRQUFRLDBDQUFFLElBQUksQ0FBQztnQkFDN0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNyQyxDQUFDLENBQUMsTUFBQSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsMENBQUUsS0FBSztvQkFDNUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBRTFCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztnQkFFbkUsT0FBTyxPQUFPLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxLQUFLLENBQUM7WUFDbkQsQ0FBQyxDQUFDLDBDQUFFLElBQUksQ0FBQztTQUNWO1FBRUQsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBCLE1BQU0sSUFBSSxHQUFHLFVBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVsRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTlCLElBQUksT0FBTyxHQUFRLFNBQVMsQ0FBQztRQUU3QixPQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsZUFBSyxFQUNyQixnRUFBZ0Usa0JBQWtCLENBQ2hGLE1BQU0sQ0FDUCx3QkFBd0IsQ0FDMUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFekIsT0FBTyxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLENBQUM7U0FDckI7UUFFRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDbkMsQ0FBQztJQUVELE9BQU87UUFDTCxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDeEMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFLLENBQUMsR0FBRztRQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE9BQU8sSUFBSSxzQkFBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQjtZQUMvQixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixPQUFPLGdCQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUTtZQUN0RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUVyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFdBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNoRCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3ZELENBQUM7WUFFRixNQUFNLE1BQU0sR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzVDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNuQixVQUFVO2dCQUNWLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUNoQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3JELEtBQUssRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVztnQkFDMUIsSUFBSSxFQUFFLE9BQU87YUFDZCxDQUFDLENBQXNCLENBQUM7WUFFekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVO1lBQzNELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1lBRXJDLGlEQUFpRDtZQUNqRCwyREFBMkQ7WUFDM0QsTUFBTSxLQUFLLEdBQUcsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUMvQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQ2xELENBQUM7WUFFRixNQUFNLE1BQU0sR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlDLEVBQUUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQztnQkFDaEMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2FBQzFCLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUNyRCxLQUFLLEVBQUUsSUFBSSxXQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDakMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVztnQkFDMUIsSUFBSSxFQUFFLE9BQU87YUFDZCxDQUFDLENBQXNCLENBQUM7WUFFekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRS9DLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsZ0JBQWdCLENBQUMsSUFBYTtZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxQixJQUFJLE9BQU8sR0FBVyxFQUFFLENBQUM7WUFDekIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ2YsTUFBTSxNQUFNLEdBQWM7Z0JBQ3hCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07b0JBQ3ZCLFFBQVEsTUFBTSxFQUFFO3dCQUNkLEtBQUsscUJBQXFCOzRCQUN4QixPQUFPLEdBQUcsSUFBQSwwQkFBYyxFQUFDLE1BQU0sTUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsS0FBSyxHQUFHLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDekMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDckIsc0NBQ0UsTUFBTyxDQUFDLEVBQ1YsV0FBVyxLQUFLLHFCQUFxQixPQUFPLEVBQUUsQ0FDL0MsQ0FBQzt3QkFDSjs0QkFDRSxPQUFPLElBQUksQ0FBQztxQkFDZjtnQkFDSCxDQUFDO2dCQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBWTtvQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsT0FBTyxNQUFNLFVBQVUsQ0FDckIsT0FBTyxFQUNQLEtBQUssRUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsRUFDcEIsVUFBVSxDQUNYLENBQUM7Z0JBQ0osQ0FBQzthQUNGLENBQUM7WUFFRixPQUFPO2dCQUNMLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE1BQU0sRUFBRSxDQUFDO2FBQ1YsQ0FBQztRQUNKLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFhO1lBQzVCLElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztZQUN6QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixNQUFNLE1BQU0sR0FBYztnQkFDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtvQkFDdkIsUUFBUSxNQUFNLEVBQUU7d0JBQ2QsS0FBSyxxQkFBcUI7NEJBQ3hCLEtBQUssR0FBRyxNQUFPLENBQUMsS0FBSyxDQUFDOzRCQUV0QixPQUFPLEdBQUcsSUFBQSwwQkFBYyxFQUFDLE1BQU0sTUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ2hDLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDbkQ7b0NBQ0UsRUFBRSxFQUFFLE1BQU8sQ0FBQyxFQUFFO29DQUNkLEtBQUs7b0NBQ0wsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsSUFBSSxFQUFFLE9BQU87aUNBQ2Q7NkJBQ0YsQ0FBQyxDQUFDO3dCQUNMOzRCQUNFLE9BQU8sSUFBSSxDQUFDO3FCQUNmO2dCQUNILENBQUM7Z0JBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFZO29CQUMvQixPQUFPLENBQ0wsR0FBRzt3QkFDSCxDQUFDLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FDckUsQ0FBQztnQkFDSixDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELGFBQWEsQ0FBQyxJQUFhO1lBQ3pCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLE1BQU0sTUFBTSxHQUFjO2dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLHFCQUFxQjs0QkFDeEIsS0FBSyxHQUFHLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUM7Z0NBQzFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUs7Z0NBQ3ZCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQWE7Z0NBQ3ZDLEVBQUUsRUFBRSxNQUFPLENBQUMsRUFBRTtnQ0FDZCxLQUFLO2dDQUNMLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUk7Z0NBQ3RCLElBQUksRUFBRSwwQkFBMEIsTUFBTyxDQUFDLEVBQUUsRUFBRTtnQ0FDNUMsT0FBTyxFQUFFLElBQUEsMEJBQWMsRUFBQyxNQUFNLE1BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUN6RCxDQUFDLENBQUM7d0JBRUw7NEJBQ0UsT0FBTyxJQUFJLENBQUM7cUJBQ2Y7Z0JBQ0gsQ0FBQztnQkFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQThCO29CQUNqRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUN2RCxPQUFPLE1BQU0sVUFBVSxDQUNyQixHQUFHLENBQUMsUUFBUSxFQUNaLEtBQUssRUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsRUFDcEIsUUFBUSxDQUNULENBQUM7cUJBQ0g7eUJBQU07d0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUN2QztnQkFDSCxDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELFlBQVksQ0FBQyxFQUEwQjtZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDdkQsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dCQUN2QixFQUFFLEVBQUUsQ0FBQzthQUNOLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxHQUFjO2dCQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLGdCQUFnQjs0QkFDbkIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzt3QkFDekQsS0FBSyxxQkFBcUI7NEJBQ3hCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUNyQyxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxNQUFNLE1BQU0sQ0FBQyxPQUFPO2lDQUN4QixRQUFRLENBQUM7Z0NBQ1IsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dDQUN2QixTQUFTLEVBQUUsTUFBTyxDQUFDLEVBQUU7Z0NBQ3JCLE1BQU0sRUFBRSxJQUFJLFdBQUUsQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO2dDQUM3QixLQUFLLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO2dDQUNqRCxRQUFRLEVBQUUsQ0FBQztnQ0FDWCxPQUFPLEVBQUUsTUFBTyxDQUFDLElBQUk7NkJBQ3RCLENBQUM7aUNBQ0QsSUFBSSxFQUFFLENBQUM7cUJBQ2I7Z0JBQ0gsQ0FBQztnQkFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQXFCO29CQUN4QyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7YUFDRixDQUFDO1lBRUYsT0FBTztnQkFDTCxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUUsQ0FBQzthQUNWLENBQUM7UUFDSixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFwVEQsOEJBb1RDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5QkcifQ==