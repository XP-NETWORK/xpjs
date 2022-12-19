"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
  ton.provider.sendBoc = (b) =>
    ton.provider.send("sendBocReturnHash", { boc: b });
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
    while (!body) {
      console.log("TON:tring to find the trx...");
      await new Promise((r) => {
        fastResolve = r;
        setTimeout(r, 10 * 1000);
      });
      if (stop) return;
      //get last 20 trx of address
      const trxs = await ton.provider.getTransactions(address, 20);
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
      const res = await (0, axios_1.default)(
        `https://toncenter.com/api/index/getTransactionByHash?tx_hash=${encodeURIComponent(
          exHash
        )}&include_msg_body=true`
      ).catch(() => undefined);
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
      const txFeesFull = new anchor_1.BN(txFees.toString(10)).add(
        tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7))
      );
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
      const res = await rSigner.send("ton_sendTransaction", {
        value: txFeesFull.toString(10),
        to: nft.native.nftItemAddr,
        data: payload,
      });
      const hash = await rSigner.handleResponse(res);
      await args.notifier.notifyTon(hash);
      return hash;
    },
    async unfreezeWrappedNft(signer, to, nft, _txFees, chainNonce) {
      const rSigner = signer.wallet || ton;
      const value = new anchor_1.BN(_txFees.toString(10)).add(
        tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7))
      );
      const nftFee = tonweb_1.default.utils.toNano("0.05");
      const payload = await bridge.createWithdrawBody({
        to: new Uint8Array(Buffer.from(to)),
        chainNonce: parseInt(chainNonce),
        txFees: value.sub(nftFee),
      });
      console.log(value.toString(10), "v");
      console.log(nft.native.nftItemAddr);
      console.log("TON:unfreezeWrappedNft");
      const res = await rSigner.send("ton_sendTransaction", {
        value: new anchor_1.BN(value).toString(10),
        to: nft.native.nftItemAddr,
        data: payload,
      });
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
              payload = (0, js_base64_1.fromUint8Array)(
                await params.data.toBoc(false)
              );
              value = params.value;
              return args.wallet.send(
                `https://app.tonkeeper.com/transfer/${
                  params.to
                }?amount=${new anchor_1.BN(value).toString(
                  10
                )}&bin=${encodeURIComponent(payload)}&open=1`
              );
            default:
              return null;
          }
        },
        async handleResponse(res) {
          console.log(res);
          return await waitTonTrx(
            payload,
            value,
            args.config.address,
            "out_msgs"
          );
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
              payload = (0, js_base64_1.fromUint8Array)(
                await params.data.toBoc(false)
              );
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
          return (
            res &&
            (await waitTonTrx(payload, value, args.config.address, "out_msgs"))
          );
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
                payload: (0, js_base64_1.fromUint8Array)(
                  await params.data.toBoc(false)
                ),
              });
            default:
              return null;
          }
        },
        async handleResponse(res) {
          if (res.type === "success" && res.response != undefined) {
            return await waitTonTrx(
              res.response,
              value,
              args.config.address,
              "in_msg"
            );
          } else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRzVCLDZCQUFvQztBQUNwQyxzQ0FBa0M7QUFlbEMsNkNBQThDO0FBRTlDLHdDQUFxQztBQUdyQyx5Q0FBMkM7QUFDM0MsbUVBQTJDO0FBb0VwQyxLQUFLLFVBQVUsU0FBUyxDQUFDLElBQWU7SUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3RELE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVTtRQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7S0FDeEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQTRCLENBQUM7SUFDOUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUMzQixHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJELEtBQUssVUFBVSxVQUFVLENBQ3ZCLFNBQWlCLEVBQ2pCLEtBQWEsRUFDYixPQUFlLEVBQ2YsT0FBOEI7UUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFeEMsSUFBSSxJQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNqQixJQUFJLFdBQWdCLENBQUM7UUFDckIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLElBQUksR0FBRyxJQUFJLENBQUM7WUFDWixpQkFBTyxFQUFFLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lB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
