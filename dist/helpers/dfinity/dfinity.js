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
    let ledger = nns_1.LedgerCanister.create({ agent: args.agent });
    let minter = agent_1.Actor.createActor(idl_1.idlFactory, {
        agent: args.agent,
        canisterId: args.bridgeContract,
    });
    const encode_withdraw_fees = async (to, actionId) => {
        /*const numbers = await minter.encode_withdraw_fees(BigInt(actionId), {
                to: Principal.fromText(to),
            });*/
        const x = encode([IDL.Nat, IDL.Record({ to: IDL.Principal })], [
            BigInt(actionId),
            {
                to: principal_1.Principal.fromText(to),
            },
        ]);
        return Buffer.from(x);
    };
    const withdraw_fees = async (to, actionId, sig) => {
        await minter.withdraw_fees(BigInt(actionId), { to: principal_1.Principal.fromText(to) }, Array.from(sig));
        return true;
    };
    async function transferTxFee(amt, sender) {
        if (sender.requestTransfer) {
            const res = await sender.requestTransfer({
                to: args.bridgeContract.toText(),
                amount: amt.integerValue().toNumber(),
            });
            console.log(res, "res");
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
    const adaptPlug = (agent) => {
        minter = agent_1.Actor.createActor(idl_1.idlFactory, {
            agent,
            canisterId: args.bridgeContract,
        });
        /* ledger = LedgerCanister.create({
                agent,
            });*/
    };
    return {
        XpNft: args.xpnftId.toString(),
        getParams: () => args,
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
            isBrowser
                ? //@ts-ignore
                    adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, chain_nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        async mintNft(owner, options) {
            const canister = principal_1.Principal.fromText(options.canisterId ? options.canisterId : args.umt.toText());
            if (isBrowser) {
                //@ts-ignore
                args.agent = owner.agent;
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
            isBrowser
                ? //@ts-ignore
                    adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, parseInt(nonce), to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const actionId = await minter.withdraw_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(nonce), to, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        /// owner = principal of owner
        async nftList(owner, contract = args.xpnftId.toText()) {
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
                args.agent = sender.agent;
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
        async isNftWhitelisted(nft) {
            return await minter.is_whitelisted(principal_1.Principal.fromText(nft.native.canisterId));
        },
        withdraw_fees,
        encode_withdraw_fees,
    };
}
exports.dfinityHelper = dfinityHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FNd0I7QUFJeEIsc0NBQWlFO0FBRWpFLGtEQUErQztBQUMvQyxnRUFBcUM7QUFDckMseUNBQXFDO0FBb0JyQywrQkFBbUM7QUFlbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUUvRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDZCxTQUFTO0lBQ1AsQ0FBQyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztJQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQ2IsQ0FBQztBQUVwQixNQUFNLEVBQ0osTUFBTSxFQUNOLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLElBQUksRUFDSixHQUFHLEVBQ0gsY0FBYyxFQUNkLE1BQU0sRUFDTixJQUFJLEVBQ0osS0FBSyxFQUNMLEdBQUcsR0FDSixHQUFHLENBQ0YsU0FBUztJQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUM7SUFDeEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUN6QixDQUFDO0FBRXBCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDM0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSTtLQUNqQixDQUFDO0lBQ0Ys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