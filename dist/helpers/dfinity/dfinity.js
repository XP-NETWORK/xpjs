"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dfinityHelper = void 0;
const agent_1 = require("@dfinity/agent");
const candid_1 = require("@dfinity/candid");
const idl_1 = require("@dfinity/candid/lib/cjs/idl");
const nns_1 = require("@dfinity/nns");
const principal_1 = require("@dfinity/principal");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const consts_1 = require("../../consts");
const idl_2 = require("./idl");
const User = candid_1.IDL.Variant({
    principal: candid_1.IDL.Principal,
    address: candid_1.IDL.Text,
});
const MintRequest = candid_1.IDL.Record({
    to: User,
    metadata: candid_1.IDL.Opt(candid_1.IDL.Vec(candid_1.IDL.Nat8)),
});
const ApproveRequest = (0, idl_1.Record)({
    token: idl_1.Text,
    subaccount: (0, idl_1.Opt)((0, idl_1.Vec)(idl_1.Nat8)),
    allowance: idl_1.Nat,
    spender: new idl_1.PrincipalClass(),
});
async function dfinityHelper(args) {
    const ledger = nns_1.LedgerCanister.create({ agent: args.agent });
    const minter = agent_1.Actor.createActor(idl_2.idlFactory, {
        agent: args.agent,
        canisterId: args.bridgeContract,
    });
    async function transferTxFee(amt) {
        return await ledger.transfer({
            to: nns_1.AccountIdentifier.fromPrincipal({
                principal: args.bridgeContract,
            }),
            amount: nns_1.ICP.fromE8s(BigInt(amt.toString())),
        });
    }
    const to32bits = (num) => {
        let b = new ArrayBuffer(4);
        new DataView(b).setUint32(0, num);
        1 << 5;
        return Array.from(new Uint8Array(b));
    };
    const tokenIdentifier = (principal, index) => {
        const padding = Buffer.from("\x0Atid");
        const array = new Uint8Array([
            ...padding,
            ...principal_1.Principal.fromText(principal).toUint8Array(),
            ...to32bits(index),
        ]);
        return principal_1.Principal.fromUint8Array(array).toText();
    };
    // async function waitActionId(requestId: RequestId) {
    //   const pollStrat = polling.defaultStrategy();
    //   const resp = await polling.pollForResponse(
    //     args.agent,
    //     args.bridgeContract,
    //     requestId,
    //     pollStrat
    //   );
    //   return decode([Nat], resp)[0].toString() as string;
    // }
    return {
        XpNft: args.xpnftId.toString(),
        getNonce: () => consts_1.Chain.DFINITY,
        estimateValidateTransferNft: async () => new bignumber_js_1.default(0),
        estimateValidateUnfreezeNft: async () => new bignumber_js_1.default(0),
        async validateAddress(adr) {
            try {
                principal_1.Principal.fromText(adr);
                return true;
            }
            catch (_a) {
                return false;
            }
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            args.agent.replaceIdentity(sender);
            const txFeeBlock = await transferTxFee(txFees);
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith);
            await args.notifier.notifyDfinity(actionId.toString());
            return "NO TX RESP YET";
        },
        async mintNft(owner, options) {
            const canister = principal_1.Principal.fromText(options.canisterId ? options.canisterId : args.umt.toText());
            let mint = await args.agent.call(canister, {
                methodName: "mintNFT",
                arg: (0, idl_1.encode)([MintRequest], [
                    {
                        metadata: [[...Buffer.from(options.uri)]],
                        to: {
                            principal: owner.getPrincipal(),
                        },
                    },
                ]),
            });
            return mint;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            args.agent.replaceIdentity(sender);
            const txFeeBlock = await transferTxFee(txFees);
            const actionId = await minter.withdraw_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(nonce), to);
            await args.notifier.notifyDfinity(actionId.toString());
            return "NO TX RESP YET";
        },
        async preTransfer(sender, nft) {
            args.agent.replaceIdentity(sender);
            const tid = tokenIdentifier(nft.collectionIdent, Number(nft.native.tokenId));
            const nftContract = principal_1.Principal.fromText(nft.native.canisterId);
            const approvedQuery = await args.agent.query(nftContract, {
                methodName: "getAllowances",
                arg: (0, idl_1.encode)([idl_1.Text], [tid]),
            });
            if ("reply" in approvedQuery) {
                let decoded = (0, idl_1.decode)([(0, idl_1.Vec)((0, idl_1.Tuple)(idl_1.Nat32, new idl_1.PrincipalClass()))], approvedQuery.reply.arg)[0];
                for (const item of decoded) {
                    if (item[0] === Number(nft.native.tokenId)) {
                        if (item[1].toText() === args.bridgeContract.toText()) {
                            return undefined;
                        }
                    }
                }
            }
            const approveCall = await args.agent.call(nftContract, {
                methodName: "approve",
                arg: (0, idl_1.encode)([ApproveRequest], [
                    {
                        token: tid,
                        allowance: BigInt(1),
                        spender: args.bridgeContract,
                        subaccount: [],
                    },
                ]),
            });
            return Buffer.from(approveCall.requestId).toString("hex");
        },
        getFeeMargin() {
            return args.feeMargin;
        },
        async balance(address) {
            const bal = await ledger.accountBalance({
                accountIdentifier: nns_1.AccountIdentifier.fromPrincipal({
                    principal: principal_1.Principal.fromText(address),
                }),
            });
            const e8s = bal.toE8s().toString();
            return new bignumber_js_1.default(e8s);
        },
    };
}
exports.dfinityHelper = dfinityHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFDeEIsNENBQXNDO0FBQ3RDLHFEQVlxQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFjckMsK0JBQW1DO0FBZW5DLE1BQU0sSUFBSSxHQUFHLFlBQUcsQ0FBQyxPQUFPLENBQUM7SUFDdkIsU0FBUyxFQUFFLFlBQUcsQ0FBQyxTQUFTO0lBQ3hCLE9BQU8sRUFBRSxZQUFHLENBQUMsSUFBSTtDQUNsQixDQUFDLENBQUM7QUFPSCxNQUFNLFdBQVcsR0FBRyxZQUFHLENBQUMsTUFBTSxDQUFDO0lBQzdCLEVBQUUsRUFBRSxJQUFJO0lBQ1IsUUFBUSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDckMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxjQUFjLEdBQUcsSUFBQSxZQUFNLEVBQUM7SUFDNUIsS0FBSyxFQUFFLFVBQUk7SUFDWCxVQUFVLEVBQUUsSUFBQSxTQUFHLEVBQUMsSUFBQSxTQUFHLEVBQUMsVUFBSSxDQUFDLENBQUM7SUFDMUIsU0FBUyxFQUFFLFNBQUc7SUFDZCxPQUFPLEVBQUUsSUFBSSxvQkFBYyxFQUFFO0NBQzlCLENBQUMsQ0FBQztBQXVCSSxLQUFLLFVBQVUsYUFBYSxDQUNqQyxJQUFtQjtJQUVuQixNQUFNLE1BQU0sR0FBRyxvQkFBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUU1RCxNQUFNLE1BQU0sR0FBNEIsYUFBSyxDQUFDLFdBQVcsQ0FBQyxnQkFBVSxFQUFFO1FBQ3BFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztRQUNqQixVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWM7S0FDaEMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxVQUFVLGFBQWEsQ0FBQyxHQUFjO1FBQ3pDLE9BQU8sTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzNCLEVBQUUsRUFBRSx1QkFBaUIsQ0FBQyxhQUFhLENBQUM7Z0JBQ2xDLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYzthQUMvQixDQUFDO1lBQ0YsTUFBTSxFQUFFLFNBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQzVDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFO1FBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNQLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQztJQUVGLE1BQU0sZUFBZSxHQUFHLENBQUMsU0FBaUIsRUFBRSxLQUFhLEVBQUUsRUFBRTtRQUMzRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDO1lBQzNCLEdBQUcsT0FBTztZQUNWLEdBQUcscUJBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxFQUFFO1lBQy9DLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUNuQixDQUFDLENBQUM7UUFDSCxPQUFPLHFCQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xELENBQUMsQ0FBQztJQUVGLHNEQUFzRDtJQUN0RCxpREFBaUQ7SUFDakQsZ0RBQWdEO0lBQ2hELGtCQUFrQjtJQUNsQiwyQkFBMkI7SUFDM0IsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixPQUFPO0lBRVAsd0RBQXdEO0lBQ3hELElBQUk7SUFFSixPQUFPO1FBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1FBQzlCLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFLLENBQUMsT0FBTztRQUM3QiwyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUM7UUFDekQsMkJBQTJCLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3pELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLHFCQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsV0FBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNkO1FBQ0gsQ0FBQztRQUNELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFFBQVE7WUFDdEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUN0QyxVQUFVLEVBQ1YscUJBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQ3pCLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFDbkIsRUFBRSxFQUNGLFFBQVEsQ0FDVCxDQUFDO1lBRUYsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUV2RCxPQUFPLGdCQUFnQixDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPO1lBQzFCLE1BQU0sUUFBUSxHQUFHLHFCQUFTLENBQUMsUUFBUSxDQUNqQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUM1RCxDQUFDO1lBQ0YsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pDLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixHQUFHLEVBQUUsSUFBQSxZQUFNLEVBQ1QsQ0FBQyxXQUFXLENBQUMsRUFDYjtvQkFDRTt3QkFDRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDekMsRUFBRSxFQUFFOzRCQUNGLFNBQVMsRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFO3lCQUNoQztxQkFDYTtpQkFDakIsQ0FDRjthQUNGLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSztZQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVuQyxNQUFNLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUvQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQ3hDLFVBQVUsRUFDVixxQkFBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUN4QyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUNiLEVBQUUsQ0FDSCxDQUFDO1lBRUYsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUV2RCxPQUFPLGdCQUFnQixDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHO1lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5DLE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FDekIsR0FBRyxDQUFDLGVBQWUsRUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQzNCLENBQUM7WUFFRixNQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO2dCQUN4RCxVQUFVLEVBQUUsZUFBZTtnQkFDM0IsR0FBRyxFQUFFLElBQUEsWUFBTSxFQUFDLENBQUMsVUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sSUFBSSxhQUFhLEVBQUU7Z0JBQzVCLElBQUksT0FBTyxHQUErQixJQUFBLFlBQU0sRUFDOUMsQ0FBQyxJQUFBLFNBQUcsRUFBQyxJQUFBLFdBQUssRUFBQyxXQUFLLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ3pDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUN4QixDQUFDLENBQUMsQ0FBUSxDQUFDO2dCQUNaLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFO29CQUMxQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDMUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRTs0QkFDckQsT0FBTyxTQUFTLENBQUM7eUJBQ2xCO3FCQUNGO2lCQUNGO2FBQ0Y7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckQsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLEdBQUcsRUFBRSxJQUFBLFlBQU0sRUFDVCxDQUFDLGNBQWMsQ0FBQyxFQUNoQjtvQkFDRTt3QkFDRSxLQUFLLEVBQUUsR0FBRzt3QkFDVixTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDcEIsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjO3dCQUM1QixVQUFVLEVBQUUsRUFBRTtxQkFDZjtpQkFDRixDQUNGO2FBQ0YsQ0FBQyxDQUFDO1lBRUgsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTztZQUNuQixNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQ3RDLGlCQUFpQixFQUFFLHVCQUFpQixDQUFDLGFBQWEsQ0FBQztvQkFDakQsU0FBUyxFQUFFLHFCQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztpQkFDdkMsQ0FBQzthQUNILENBQUMsQ0FBQztZQUVILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVuQyxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUEvS0Qsc0NBK0tDIn0=