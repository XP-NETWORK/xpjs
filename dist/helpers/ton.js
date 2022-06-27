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
async function tonHelper(args) {
    // const bridge = new BridgeContract(args.tonweb.provider, {
    //   burner: args.burnerAddr
    // });
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
        async transferNftToForeign() {
            // TODO
            return "";
        },
        async unfreezeWrappedNft() {
            // TODO
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvdG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEyQztBQUMzQyxnRUFBcUM7QUFDckMsb0RBQTRCO0FBRTVCLHNDQUFrQztBQTRDM0IsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFlO0lBQzdDLDREQUE0RDtJQUM1RCw0QkFBNEI7SUFDNUIsTUFBTTtJQUVOLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUE0QixDQUFDO0lBRTlDLE9BQU87UUFDTCxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsY0FBSyxDQUFDLEdBQUc7UUFDekIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTO1FBQ3JCLEtBQUssQ0FBQywyQkFBMkI7WUFDL0IsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLE9BQU8sZ0JBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9CO1lBQ3hCLE9BQU87WUFDUCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCO1lBQ3RCLE9BQU87WUFDUCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxZQUFZLENBQUMsRUFBMEI7WUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZELFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsRUFBRSxFQUFFLENBQUM7YUFDTixDQUFDLENBQUM7WUFDSCxPQUFPO2dCQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07b0JBQ3ZCLFFBQVEsTUFBTSxFQUFFO3dCQUNkLEtBQUssZ0JBQWdCOzRCQUNuQixPQUFPLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUN6RCxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxDQUFDLE1BQU0sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7d0JBQ3JDLEtBQUsscUJBQXFCOzRCQUN4QixPQUFPLE1BQU0sTUFBTSxDQUFDLE9BQU87aUNBQ3hCLFFBQVEsQ0FBQztnQ0FDUixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7Z0NBQ3ZCLFNBQVMsRUFBRSxNQUFPLENBQUMsRUFBRTtnQ0FDckIsTUFBTSxFQUFFLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUM7Z0NBQzdCLEtBQUssRUFBRSxDQUFDLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0NBQ2pELFFBQVEsRUFBRSxDQUFDO2dDQUNYLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDOzZCQUM3QyxDQUFDO2lDQUNELElBQUksRUFBRSxDQUFDO3FCQUNiO2dCQUNILENBQUM7YUFDRixDQUFDO1FBQ0osQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBdkRELDhCQXVEQyJ9