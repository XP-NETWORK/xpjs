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
            amount: BigInt(amt.toString()),
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
            catch {
                return false;
            }
        },
        async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
            args.agent.replaceIdentity(sender);
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, chain_nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee));
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
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
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            args.agent.replaceIdentity(sender);
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, parseInt(nonce), to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee));
            const actionId = await minter.withdraw_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(nonce), to, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
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
                                    uri: Buffer.from(metadata["nonfungible"]["metadata"][0] ?? []).toString("utf-8"),
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
            const e8s = bal.toString();
            return new bignumber_js_1.default(e8s);
        },
    };
}
exports.dfinityHelper = dfinityHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFDeEIsNENBQXNDO0FBQ3RDLHFEQVlxQztBQUNyQyxzQ0FBaUU7QUFDakUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFrQnJDLCtCQUFtQztBQWVuQyxNQUFNLFFBQVEsR0FBRyxZQUFHLENBQUMsT0FBTyxDQUFDO0lBQzNCLFFBQVEsRUFBRSxZQUFHLENBQUMsTUFBTSxDQUFDO1FBQ25CLFFBQVEsRUFBRSxZQUFHLENBQUMsSUFBSTtRQUNsQixRQUFRLEVBQUUsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsR0FBRyxDQUFDLFlBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLEVBQUUsWUFBRyxDQUFDLElBQUk7UUFDZCxNQUFNLEVBQUUsWUFBRyxDQUFDLElBQUk7S0FDakIsQ0FBQztJQUNGLFdBQVcsRUFBRSxZQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsWUFBRyxDQUFDLEdBQUcsQ0FBQyxZQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ2xFLENBQUMsQ0FBQztBQUNILE1BQU0sV0FBVyxHQUFHLFlBQUcsQ0FBQyxPQUFPLENBQUM7SUFDOUIsWUFBWSxFQUFFLFlBQUcsQ0FBQyxJQUFJO0lBQ3RCLEtBQUssRUFBRSxZQUFHLENBQUMsSUFBSTtDQUNoQixDQUFDLENBQUM7QUFFSCxNQUFNLGFBQWEsR0FBRyxZQUFHLENBQUMsT0FBTyxDQUFDO0lBQ2hDLEVBQUUsRUFBRSxZQUFHLENBQUMsSUFBSTtJQUNaLEdBQUcsRUFBRSxXQUFXO0NBQ2pCLENBQUMsQ0FBQztBQUVILE1BQU0sSUFBSSxHQUFHLFlBQUcsQ0FBQyxPQUFPLENB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