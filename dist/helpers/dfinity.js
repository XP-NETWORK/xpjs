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
            const nftContract = principal_1.Principal.fromText(nft.native.canisterId);
            const approvedQuery = await args.agent.query(nftContract, {
                methodName: "getApproved",
                arg: (0, idl_1.encode)([idl_1.Nat], [BigInt(nft.native.tokenId)]),
            });
            if ("reply" in approvedQuery &&
                (0, idl_1.decode)([new idl_1.PrincipalClass()], approvedQuery.reply.arg)[0].toString() ==
                    args.bridgeContract.toString()) {
                // already approved
                return;
            }
            const approveCall = await args.agent.call(nftContract, {
                methodName: "approve",
                arg: (0, idl_1.encode)([new idl_1.PrincipalClass(), idl_1.Nat], [args.bridgeContract, BigInt(nft.native.tokenId)]),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMENBQXlFO0FBQ3pFLHFEQU9xQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyxzQ0FBa0M7QUFvQzNCLEtBQUssVUFBVSxhQUFhLENBQ2pDLElBQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFHLG9CQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRTVELEtBQUssVUFBVSxhQUFhLENBQUMsR0FBYztRQUN6QyxPQUFPLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMzQixFQUFFLEVBQUUsdUJBQWlCLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2RSxNQUFNLEVBQUUsU0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQVE7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssVUFBVSxZQUFZLENBQUMsU0FBb0I7UUFDOUMsTUFBTSxTQUFTLEdBQUcsZUFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sZUFBTyxDQUFDLGVBQWUsQ0FDeEMsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsY0FBYyxFQUNuQixTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUM7UUFFRixPQUFPLElBQUEsWUFBTSxFQUFDLENBQUMsU0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFZLENBQUM7SUFDckQsQ0FBQztJQUVELE9BQU87UUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7UUFD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