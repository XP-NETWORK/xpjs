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
async function dfinityHelper(args) {
    const ledger = nns_1.LedgerCanister.create({ agent: args.agent });
    async function transferTxFee(amt) {
        return await ledger.transfer({
            to: nns_1.AccountIdentifier.fromPrincipal({ principal: args.bridgeContract }),
            amount: nns_1.ICP.fromString(amt.toFixed()),
        });
    }
    async function waitActionId(requestId) {
        const pollStrat = agent_1.polling.defaultStrategy();
        const resp = await agent_1.polling.pollForResponse(args.agent, args.bridgeContract, requestId, pollStrat);
        return idl_1.decode([idl_1.Nat], resp)[0].toString();
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
                arg: idl_1.encode([idl_1.Nat64, new idl_1.PrincipalClass(), idl_1.Nat, idl_1.Nat64, idl_1.Text, idl_1.Text], [
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
                arg: idl_1.encode([idl_1.Nat64, new idl_1.PrincipalClass(), idl_1.Nat, idl_1.Nat64, idl_1.Text], [
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
            const nftContract = principal_1.Principal.fromText(nft.native.canisterId);
            const approvedQuery = await args.agent.query(nftContract, {
                methodName: "getApproved",
                arg: idl_1.encode([idl_1.Nat], [BigInt(nft.native.tokenId)]),
            });
            if ("reply" in approvedQuery &&
                idl_1.decode([new idl_1.PrincipalClass()], approvedQuery.reply.arg)[0].toString() ==
                    args.bridgeContract.toString()) {
                // already approved
                return;
            }
            const approveCall = await args.agent.call(nftContract, {
                methodName: "approve",
                arg: idl_1.encode([new idl_1.PrincipalClass(), idl_1.Nat], [args.bridgeContract, BigInt(nft.native.tokenId)]),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMENBQXlFO0FBQ3pFLHFEQU9xQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyxzQ0FBa0M7QUFvQzNCLEtBQUssVUFBVSxhQUFhLENBQ2pDLElBQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFHLG9CQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRTVELEtBQUssVUFBVSxhQUFhLENBQUMsR0FBYztRQUN6QyxPQUFPLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMzQixFQUFFLEVBQUUsdUJBQWlCLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2RSxNQUFNLEVBQUUsU0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQVE7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssVUFBVSxZQUFZLENBQUMsU0FBb0I7UUFDOUMsTUFBTSxTQUFTLEdBQUcsZUFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBTyxDQUFDLGVBQWUsQ0FDeEMsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsY0FBYyxFQUNuQixTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUM7UUFFRixPQUFPLFlBQU0sQ0FBQyxDQUFDLFNBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBWSxDQUFDO0lBQ3JELENBQUM7SUFFRCxPQUFPO1FBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1FBQzlCLFFB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