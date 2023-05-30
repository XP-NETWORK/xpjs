"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dfinityHelper = void 0;
const agent_1 = require("@dfinity/agent");
const nns_1 = require("@dfinity/nns");
const principal_1 = require("@dfinity/principal");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const consts_1 = require("../../consts");
const idl_1 = require("./idl");
const isBrowser = global.window?.constructor.name === "Window";
const { IDL } = (isBrowser
    ? require("@dfinity/candid/lib/esm/index")
    : require("@dfinity/candid"));
const { decode, encode, Nat, Nat32, Nat8, Opt, PrincipalClass, Record, Text, Tuple, Vec, } = (isBrowser
    ? require("@dfinity/candid/lib/esm/idl")
    : require("@dfinity/candid/lib/cjs/idl"));
const Metadata = IDL.Variant({
    fungible: IDL.Record({
        decimals: IDL.Nat8,
        metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
        name: IDL.Text,
        symbol: IDL.Text,
    }),
    nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
});
const CommonError = IDL.Variant({
    InvalidToken: IDL.Text,
    Other: IDL.Text,
});
const Result_Bearer = IDL.Variant({
    ok: IDL.Text,
    err: CommonError,
});
const User = IDL.Variant({
    principal: IDL.Principal,
    address: IDL.Text,
});
const MintRequest = IDL.Record({
    to: User,
    metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
});
const ApproveRequest = Record({
    token: Text,
    subaccount: Opt(Vec(Nat8)),
    allowance: Nat,
    spender: new PrincipalClass(),
});
async function dfinityHelper(args) {
    //@ts-ignore
    const ledger = nns_1.LedgerCanister.create({ agent: args.agent });
    const minter = agent_1.Actor.createActor(idl_1.idlFactory, {
        agent: args.agent,
        canisterId: args.bridgeContract,
    });
    async function transferTxFee(amt, sender) {
        if (sender) {
            const res = await sender.requestTransfer({
                to: args.bridgeContract.toText(),
                amount: amt.integerValue().toNumber(),
            });
            return BigInt(res.height);
        }
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
            if (isBrowser) {
                //@ts-ignore
                args.agent = sender;
            }
            else {
                args.agent.replaceIdentity(sender);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, chain_nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), isBrowser ? sender : undefined);
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        async mintNft(owner, options) {
            const canister = principal_1.Principal.fromText(options.canisterId ? options.canisterId : args.umt.toText());
            if (isBrowser) {
                //@ts-ignore
                args.agent = owner;
            }
            const principal = isBrowser
                ? await args.agent.getPrincipal()
                : owner.getPrincipal();
            let mint = await args.agent.call(canister, {
                methodName: "mintNFT",
                arg: encode([MintRequest], [
                    {
                        metadata: [[...Buffer.from(options.uri)]],
                        to: {
                            principal,
                        },
                    },
                ]),
            });
            return mint;
        },
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            if (isBrowser) {
                //@ts-ignore
                args.agent = sender;
            }
            else {
                args.agent.replaceIdentity(sender);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, parseInt(nonce), to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), isBrowser ? sender : undefined);
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
                arg: encode([], []),
            });
            if ("reply" in response) {
                let decoded = decode([IDL.Vec(IDL.Tuple(Nat32, Metadata))], response.reply.arg)[0];
                await Promise.all(decoded.map(async (e) => {
                    let [tokenId, metadata] = e;
                    let tid = tokenIdentifier(contract, tokenId);
                    const ownerQuery = await args.agent.query(contract, {
                        methodName: "bearer",
                        arg: encode([Text], [tid]),
                    });
                    if ("reply" in ownerQuery) {
                        const response = decode([Result_Bearer], ownerQuery.reply.arg)[0];
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
            if (isBrowser) {
                //@ts-ignore
                args.agent = sender;
            }
            else {
                args.agent.replaceIdentity(sender);
            }
            const tid = tokenIdentifier(nft.collectionIdent, Number(nft.native.tokenId));
            const nftContract = principal_1.Principal.fromText(nft.native.canisterId);
            const approvedQuery = await args.agent.query(nftContract, {
                methodName: "getAllowances",
                arg: encode([Text], [tid]),
            });
            if ("reply" in approvedQuery) {
                let decoded = decode([Vec(Tuple(Nat32, new PrincipalClass()))], approvedQuery.reply.arg)[0];
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
                arg: encode([ApproveRequest], [
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
        getAccountIdentifier(principal) {
            const x = nns_1.AccountIdentifier.fromPrincipal({
                principal: principal_1.Principal.fromText(principal),
            });
            return x.toHex();
        },
    };
}
exports.dfinityHelper = dfinityHelper;
/***
 *
 *
{height: 6184161}
dfinity.ts:246 6184161n 'txFeeBlock'

 Uncaught (in promise) Error: Call was rejected:
  Request ID: 2b46b5f1b89494270d4866c280c75404b63736f381fbeb66aeb0bab483228c54
  Reject code: 5
  Reject text: Canister e3io4-qaaaa-aaaak-qasua-cai trapped explicitly: Panicked at 'called `Result::unwrap()` on an `Err` value: InvalidFee', src/minter/src/lib.rs:490:10

call_on_cleanup also failed:

Canister e3io4-qaaaa-aaaak-qasua-cai trapped explicitly: Panicked at 'called `Result::unwrap()` on an `Err` value: FailedToQueryFee("Failed to Query for fee. Code: NoError. Reason: cleanup")', src/minter/src/lib.rs:490:10

    at pollForResponse (index.ts:68:1)
    at async caller (actor.ts:372:1)
    at async Object.transferNftToForeign (dfinity.ts:248:1)
    at async onClickHandler (IcpWallet.jsx:126:1)
pollForResponse @ index.ts:68

 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFJeEIsc0NBQWlFO0FBRWpFLGtEQUErQztBQUMvQyxnRUFBcUM7QUFDckMseUNBQXFDO0FBa0JyQywrQkFBbUM7QUFlbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUUvRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDZCxTQUFTO0lBQ1AsQ0FBQyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztJQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQ2IsQ0FBQztBQUVwQixNQUFNLEVBQ0osTUFBTSxFQUNOLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLElBQUksRUFDSixHQUFHLEVBQ0gsY0FBYyxFQUNkLE1BQU0sRUFDTixJQUFJLEVBQ0osS0FBSyxFQUNMLEdBQUcsR0FDSixHQUFHLENBQ0YsU0FBUztJQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUM7SUFDeEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUN6QixDQUFDO0FBRXBCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDM0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSTtLQUNqQixDQUFDO0lBQ0Ys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