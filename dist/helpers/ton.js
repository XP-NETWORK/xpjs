"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tonHelper = void 0;
const anchor_1 = require("@project-serum/anchor");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const consts_1 = require("../consts");
const ton_bridge_1 = require("./ton-bridge");
async function tonHelper(args) {
    const bridge = new ton_bridge_1.BridgeContract(args.tonweb.provider, {
        address: args.bridgeAddr,
        burner: args.burnerAddr,
    });
    const ton = args.tonweb;
    ton.provider.sendBoc = (b) => ton.provider.send("sendBocReturnHash", { boc: b });
    return {
        getNonce: () => consts_1.Chain.TON,
        XpNft: args.xpnftAddr,
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
            const txFeesFull = new anchor_1.BN(txFees.toString(10));
            const nftFee = tonweb_1.default.utils.toNano("0.07");
            const payload = await bridge.createFreezeBody({
                amount: txFeesFull.sub(nftFee),
                to: Buffer.from(to),
                chainNonce,
                mintWith: Buffer.from(mintWith),
            });
            const res = (await rSigner.send("ton_sendTransaction", {
                value: txFeesFull.toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            await new Promise((r) => setTimeout(r, 10000));
            await args.notifier.notifyTon(res.hash);
            return res.hash;
        },
        async unfreezeWrappedNft(signer, to, nft, _txFees, chainNonce) {
            const rSigner = signer.wallet || ton;
            const txFeesFull = tonweb_1.default.utils.toNano("0.08");
            const nftFee = tonweb_1.default.utils.toNano("0.05");
            const payload = await bridge.createWithdrawBody({
                to: new Uint8Array(Buffer.from(to)),
                chainNonce: parseInt(chainNonce),
                txFees: txFeesFull.sub(nftFee),
            });
            const res = (await rSigner.send("ton_sendTransaction", {
                value: txFeesFull.toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            await new Promise((r) => setTimeout(r, 10000));
            await args.notifier.notifyTon(res.hash);
            return res.hash;
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
            };
            return {
                wallet: wWallet,
                accIdx: 0,
            };
        },
    };
}
exports.tonHelper = tonHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRzVCLHNDQUFrQztBQVdsQyw2Q0FBOEM7QUFzQ3ZDLEtBQUssVUFBVSxTQUFTLENBQUMsSUFBZTtJQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLDJCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDdEQsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVO1FBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtLQUN4QixDQUFDLENBQUM7SUFFSCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBNEIsQ0FBQztJQUM5QyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzNCLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckQsT0FBTztRQUNMLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFLLENBQUMsR0FBRztRQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDckIsS0FBSyxDQUFDLDJCQUEyQjtZQUMvQixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkI7WUFDL0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsT0FBTyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELFlBQVk7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