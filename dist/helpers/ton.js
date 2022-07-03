"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tonHelper = void 0;
const anchor_1 = require("@project-serum/anchor");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const nft_collection_d_1 = require("tonweb/dist/types/contract/token/nft/nft-collection.d");
const nft_item_d_1 = require("tonweb/dist/types/contract/token/nft/nft-item.d");
const consts_1 = require("../consts");
const ton_bridge_1 = require("./ton-bridge");
async function tonHelper(args) {
    const bridge = new ton_bridge_1.BridgeContract(args.tonweb.provider, {
        burner: args.burnerAddr,
    });
    const ton = args.tonweb;
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
        async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
            const rSigner = signer.wallet || ton;
            const addr = (await rSigner.send("ton_requestAccounts", undefined))[signer.accIdx];
            const nftColl = new nft_collection_d_1.NftCollection(ton.provider, {
                ownerAddress: new tonweb_1.default.Address(addr),
                nftItemCodeHex: nft_item_d_1.NftItem.codeHex,
            });
            const nftItemAddr = await nftColl.getNftItemAddressByIndex(nft.native.nftId);
            const txFeesFull = new anchor_1.BN(txFees.toString(10));
            const nftFee = tonweb_1.default.utils.toNano("0.05");
            const payload = await bridge.createFreezeBody({
                amount: txFeesFull.sub(nftFee),
                to: Buffer.from(to),
                chainNonce,
                mintWith: Buffer.from(mintWith),
            });
            await rSigner.send("ton_sendTransaction", {
                value: nftFee.toString(10),
                to: nftItemAddr.toString(true, true, true),
                data: Buffer.from(await payload.getRepr()).toString("base64"),
            });
            // TODO: Tx hash
            return "";
        },
        async unfreezeWrappedNft(signer, to, nft, txFees, chainNonce) {
            const rSigner = signer.wallet || ton;
            const nftColl = new nft_collection_d_1.NftCollection(ton.provider, {
                ownerAddress: await bridge.getAddress(),
                nftItemCodeHex: nft_item_d_1.NftItem.codeHex,
            });
            const nftItemAddr = await nftColl.getNftItemAddressByIndex(nft.native.nftId);
            const txFeesFull = new anchor_1.BN(txFees.toString(10));
            const nftFee = tonweb_1.default.utils.toNano("0.05");
            const payload = await bridge.createWithdrawBody({
                to: Buffer.from(to),
                chainNonce: parseInt(chainNonce),
                txFees: txFeesFull.sub(nftFee),
            });
            await rSigner.send("ton_sendTransaction", {
                value: nftFee.toString(10),
                to: nftItemAddr.toString(true, true, true),
                data: Buffer.from(await payload.getRepr()).toString("base64"),
            });
            // TODO: tx hash
            return "";
        },
        tonKpWrapper(kp) {
            const wallet = new tonweb_1.default.Wallets.all.v3R2(ton.provider, {
                publicKey: kp.publicKey,
                wc: 0,
            });
            return {
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
                                payload: Buffer.from(params.data, "base64"),
                            })
                                .send();
                    }
                },
            };
        },
    };
}
exports.tonHelper = tonHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRTVCLDRGQUFzRjtBQUN0RixnRkFBMEU7QUFDMUUsc0NBQWtDO0FBUWxDLDZDQUE4QztBQW9DdkMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFlO0lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksMkJBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUN0RCxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7S0FDeEIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQTRCLENBQUM7SUFFOUMsT0FBTztRQUNMLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFLLENBQUMsR0FBRztRQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDckIsS0FBSyxDQUFDLDJCQUEyQjtZQUMvQixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkI7WUFDL0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsT0FBTyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVE7WUFDdEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFDckMsTUFBTSxJQUFJLEdBQUcs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