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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFDeEIsNENBQXNDO0FBQ3RDLHFEQVlxQztBQUNyQyxzQ0FBc0U7QUFDdEUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFnQnJDLCtCQUFtQztBQWVuQyxNQUFNLFFBQVEsR0FBRyxZQUFHLENBQUMsT0FBTyxDQUFDO0lBQzNCLFFBQVEsRUFBRSxZQUFHLENBQUMsTUFBTSxDQUFDO1FBQ25CLFFBQVEsRUFBRSxZQUFHLENBQUMsSUFBSTtRQUNsQixRQUFRLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsR0FBRyxDQUFDLFlBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLEVBQUUsWUFBRyxDQUFDLElBQUk7UUFDZCxNQUFNLEVBQUUsWUFBRyxDQUFDLElBQUk7S0FDakIsQ0FBQztJQUNGLFdBQVcsRUFBRSxZQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ2xFLENBQUMsQ0FBQztBQUNILE1BQU0sV0FBVyxHQUFHLFlBQUcsQ0FBQyxPQUFPLENBQUM7SUFDOUIsWUFBWSxFQUFFLFlBQUcsQ0FBQyxJQUFJO0lBQ3RCLEtBQUssRUFBRSxZQUFHLENBQUMsSUFBSTtDQUNoQixDQUFDLENBQUM7QUFFSCxNQUFNLGFBQWEsR0FBRyxZQUFHLENBQUMsT0FBTyxDQUFDO0lBQ2hDLEVBQUUsRUFBRSxZQUFHLENBQUMsSUFBSTtJQUNaLEdBQUcsRUFBRSxXQUFXO0NBQ2pCLENBQUMsQ0FBQztBQUVILE1BQU0sSUFBSSxHQUFHLFlBQUcsQ0FBQyxPQUFPLENB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