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
const Metadata = candid_1.IDL.Variant({
    fungible: candid_1.IDL.Record({
        decimals: candid_1.IDL.Nat8,
        metadata: candid_1.IDL.Opt(candid_1.IDL.Vec(candid_1.IDL.Nat8)),
        name: candid_1.IDL.Text,
        symbol: candid_1.IDL.Text,
    }),
    nonfungible: candid_1.IDL.Record({ metadata: candid_1.IDL.Opt(candid_1.IDL.Vec(candid_1.IDL.Nat8)) }),
});
const CommonError = candid_1.IDL.Variant({
    InvalidToken: candid_1.IDL.Text,
    Other: candid_1.IDL.Text,
});
const Result_Bearer = candid_1.IDL.Variant({
    ok: candid_1.IDL.Text,
    err: CommonError,
});
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
        /// owner = principal of owner
        async nftList(owner, contract) {
            let aid = nns_1.AccountIdentifier.fromPrincipal({
                principal: principal_1.Principal.fromText(owner),
            });
            let tokens = [];
            const response = await args.agent.query(contract, {
                methodName: "getTokens",
                arg: (0, idl_1.encode)([], []),
            });
            if ("reply" in response) {
                let decoded = (0, idl_1.decode)([candid_1.IDL.Vec(candid_1.IDL.Tuple(idl_1.Nat32, Metadata))], response.reply.arg)[0];
                await Promise.all(decoded.map(async (e) => {
                    var _a;
                    let [tokenId, metadata] = e;
                    let tid = tokenIdentifier(contract, tokenId);
                    const ownerQuery = await args.agent.query(contract, {
                        methodName: "bearer",
                        arg: (0, idl_1.encode)([idl_1.Text], [tid]),
                    });
                    if ("reply" in ownerQuery) {
                        const response = (0, idl_1.decode)([Result_Bearer], ownerQuery.reply.arg)[0];
                        if ("ok" in response) {
                            if (response.ok === aid.toHex()) {
                                tokens.push({
                                    collectionIdent: contract,
                                    native: {
                                        canisterId: contract,
                                        tokenId: tokenId.toString(),
                                    },
                                    uri: Buffer.from((_a = metadata["nonfungible"]["metadata"][0]) !== null && _a !== void 0 ? _a : []).toString("utf-8"),
                                });
                            }
                        }
                    }
                }));
            }
            return tokens;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFDeEIsNENBQXNDO0FBQ3RDLHFEQVlxQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFlckMsK0JBQW1DO0FBZW5DLE1BQU0sUUFBUSxHQUFHLFlBQUcsQ0FBQyxPQUFPLENBQUM7SUFDM0IsUUFBUSxFQUFFLFlBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkIsUUFBUSxFQUFFLFlBQUcsQ0FBQyxJQUFJO1FBQ2xCLFFBQVEsRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLFlBQUcsQ0FBQyxHQUFHLENBQUMsWUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksRUFBRSxZQUFHLENBQUMsSUFBSTtRQUNkLE1BQU0sRUFBRSxZQUFHLENBQUMsSUFBSTtLQUNqQixDQUFDO0lBQ0YsV0FBVyxFQUFFLFlBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsR0FBRyxDQUFDLFlBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDbEUsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxXQUFXLEdBQUcsWUFBRyxDQUFDLE9BQU8sQ0FBQztJQUM5QixZQUFZLEVBQUUsWUFBRyxDQUFDLElBQUk7SUFDdEIsS0FBSyxFQUFFLFlBQUcsQ0FBQyxJQUFJO0NBQ2hCLENBQUMsQ0FBQztBQUVILE1BQU0sYUFBYSxHQUFHLFlBQUcsQ0FBQyxPQUFPLENBQUM7SUFDaEMsRUFBRSxFQUFFLFlBQUcsQ0FBQyxJQUFJO0lBQ1osR0FBRyxFQUFFLFdBQVc7Q0FDakIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsWUFBRyxDQUFDLE9BQU8sQ0FB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