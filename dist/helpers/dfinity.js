"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dfinityHelper = void 0;
const agent_1 = require("@dfinity/agent");
const idl_1 = require("@dfinity/candid/lib/cjs/idl");
const nns_1 = require("@dfinity/nns");
const principal_1 = require("@dfinity/principal");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const consts_1 = require("../consts");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMENBQXlFO0FBQ3pFLHFEQWFxQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyxzQ0FBa0M7QUFtQmxDLE1BQU0sY0FBYyxHQUFHLElBQUEsWUFBTSxFQUFDO0lBQzVCLEtBQUssRUFBRSxVQUFJO0lBQ1gsVUFBVSxFQUFFLElBQUEsU0FBRyxFQUFDLElBQUEsU0FBRyxFQUFDLFVBQUksQ0FBQyxDQUFDO0lBQzFCLFNBQVMsRUFBRSxTQUFHO0lBQ2QsT0FBTyxFQUFFLElBQUksb0JBQWMsRUFBRTtDQUM5QixDQUFDLENBQUM7QUFtQkksS0FBSyxVQUFVLGFBQWEsQ0FDakMsSUFBbUI7SUFFbkIsTUFBTSxNQUFNLEdBQUcsb0JBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFNUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxHQUFjO1FBQ3pDLE9BQU8sTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzNCLEVBQUUsRUFBRSx1QkFBaUIsQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZFLE1BQU0sRUFBRSxTQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBUTtTQUM3QyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRTtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FB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