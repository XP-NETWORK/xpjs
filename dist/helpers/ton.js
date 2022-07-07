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
            const nftColl = new tonweb_1.default.token.nft.NftCollection(ton.provider, {
                ownerAddress: new tonweb_1.default.Address(addr),
                nftItemCodeHex: tonweb_1.default.token.nft.NftItem.codeHex,
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
            const nftColl = new tonweb_1.default.token.nft.NftCollection(ton.provider, {
                ownerAddress: await bridge.getAddress(),
                nftItemCodeHex: tonweb_1.default.token.nft.NftItem.codeHex,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRTVCLHNDQUFrQztBQVFsQyw2Q0FBOEM7QUFvQ3ZDLEtBQUssVUFBVSxTQUFTLENBQUMsSUFBZTtJQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLDJCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDdEQsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO0tBQ3hCLENBQUMsQ0FBQztJQUVILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUE0QixDQUFDO0lBRTlDLE9BQU87UUFDTCxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsY0FBSyxDQUFDLEdBQUc7UUFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTO1FBQ3JCLEtBQUssQ0FBQywyQkFBMkI7WUFDL0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLE9BQU8sZ0JBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRO1lBQ3RFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ2pFLE1BQU0sQ0FBQyxNQUFNLENBQ2QsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUMvRCxZQUFZLEVBQUUsSUFBSSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLGNBQWMsRUFBRSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU87YUFDakQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsd0JBQXdCLENBQ3hELEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNqQixDQUFDO1lBQ0YsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDNUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUM5QixFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ25CLFVBQVU7Z0JBQ1YsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2hDLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDeEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUMxQixFQUFFLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDMUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQzlELENBQUMsQ0FBQztZQUVILGdCQUFnQjtZQUNoQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVU7WUFDMUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFFckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQy9ELFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLGNBQWMsRUFBRSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU87YUFDakQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsd0JBQXdCLENBQ3hELEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNqQixDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxXQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztnQkFDOUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNuQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQztnQkFDaEMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2FBQy9CLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDeEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUMxQixFQUFFLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDMUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2FBQzlELENBQUMsQ0FBQztZQUVILGdCQUFnQjtZQUNoQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxZQUFZLENBQUMsRUFBMEI7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZELFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsRUFBRSxFQUFFLENBQUM7YUFDTixDQUFDLENBQUM7WUFDSCxPQUFPO2dCQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07b0JBQ3ZCLFFBQVEsTUFBTSxFQUFFO3dCQUNkLEtBQUssZ0JBQWdCOzRCQUNuQixPQUFPLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUN6RCxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7d0JBQ3JDLEtBQUsscUJBQXFCOzRCQUN4QixPQUFPLE1BQU0sTUFBTSxDQUFDLE9BQU87aUNBQ3hCLFFBQVEsQ0FBQztnQ0FDUixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7Z0NBQ3ZCLFNBQVMsRUFBRSxNQUFPLENBQUMsRUFBRTtnQ0FDckIsTUFBTSxFQUFFLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUM7Z0NBQzdCLEtBQUssRUFBRSxDQUFDLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0NBQ2pELFFBQVEsRUFBRSxDQUFDO2dDQUNYLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDOzZCQUM3QyxDQUFDO2lDQUNELElBQUksRUFBRSxDQUFDO3FCQUNiO2dCQUNILENBQUM7YUFDRixDQUFDO1FBQ0osQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBNUdELDhCQTRHQyJ9