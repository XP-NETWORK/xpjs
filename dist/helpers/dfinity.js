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
const consts_1 = require("../consts");
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
    async function transferTxFee(amt) {
        return await ledger.transfer({
            to: nns_1.AccountIdentifier.fromPrincipal({ principal: args.bridgeContract }),
            amount: nns_1.ICP.fromString(amt.toFixed()),
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
    async function waitActionId(requestId) {
        const pollStrat = agent_1.polling.defaultStrategy();
        const resp = await agent_1.polling.pollForResponse(args.agent, args.bridgeContract, requestId, pollStrat);
        return (0, idl_1.decode)([idl_1.Nat], resp)[0].toString();
    }
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
            const freezeCall = await args.agent.call(args.bridgeContract, {
                methodName: "freeze_nft",
                arg: (0, idl_1.encode)([idl_1.Nat64, new idl_1.PrincipalClass(), idl_1.Nat, idl_1.Nat64, idl_1.Text, idl_1.Text], [
                    txFeeBlock,
                    principal_1.Principal.fromText(id.native.canisterId),
                    BigInt(id.native.tokenId),
                    chain_nonce,
                    to,
                    mintWith,
                ]),
            });
            const actionId = await waitActionId(freezeCall.requestId);
            await args.notifier.notifyDfinity(actionId);
            return Buffer.from(freezeCall.requestId).toString("hex");
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
            const withdrawCall = await args.agent.call(args.bridgeContract, {
                methodName: "withdraw_nft",
                arg: (0, idl_1.encode)([idl_1.Nat64, new idl_1.PrincipalClass(), idl_1.Nat, idl_1.Nat64, idl_1.Text], [
                    txFeeBlock,
                    principal_1.Principal.fromText(id.native.canisterId),
                    BigInt(id.native.tokenId),
                    nonce,
                    to,
                ]),
            });
            const actionId = await waitActionId(withdrawCall.requestId);
            await args.notifier.notifyDfinity(actionId);
            return Buffer.from(withdrawCall.requestId).toString("hex");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMENBTXdCO0FBQ3hCLDRDQUFzQztBQUN0QyxxREFhcUM7QUFDckMsc0NBQXNFO0FBQ3RFLGtEQUErQztBQUMvQyxnRUFBcUM7QUFDckMsc0NBQWtDO0FBMkJsQyxNQUFNLElBQUksR0FBRyxZQUFHLENBQUMsT0FBTyxDQUFDO0lBQ3ZCLFNBQVMsRUFBRSxZQUFHLENBQUMsU0FBUztJQUN4QixPQUFPLEVBQUUsWUFBRyxDQUFDLElBQUk7Q0FDbEIsQ0FBQyxDQUFDO0FBT0gsTUFBTSxXQUFXLEdBQUcsWUFBRyxDQUFDLE1BQU0sQ0FBQztJQUM3QixFQUFFLEVBQUUsSUFBSTtJQUNSLFFBQVEsRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLFlBQUcsQ0FBQyxHQUFHLENBQUMsWUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3JDLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLElBQUEsWUFBTSxFQUFDO0lBQzVCLEtBQUssRUFBRSxVQUFJO0lBQ1gsVUFBVSxFQUFFLElBQUEsU0FBRyxFQUFDLElBQUEsU0FBRyxFQUFDLFVBQUksQ0FBQyxDQUFDO0lBQzFCLFNBQVMsRUFBRSxTQUFHO0lBQ2QsT0FBTyxFQUFFLElBQUksb0JBQWMsRUFBRTtDQUM5QixDQUFDLENBQUM7QUF1QkksS0FBSyxVQUFVLGFBQWEsQ0FDakMsSUFBbUI7SUFFbkIsTUFBTSxNQUFNLEdBQUcsb0JBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFNUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxHQUFjO1FBQ3pDLE9BQU8sTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzNCLEVBQUUsRUFBRSx1QkFBaUIsQ0FBQyxhQUFhLENBQUMsRUFB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