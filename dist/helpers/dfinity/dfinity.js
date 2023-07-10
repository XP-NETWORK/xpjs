"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const utils = __importStar(require("@dfinity/utils"));
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
        const ValidateWithdrawFees = IDL.Record({ to: IDL.Principal });
        const x = encode([IDL.Nat, ValidateWithdrawFees], [
            BigInt(actionId),
            {
                to: principal_1.Principal.fromText(to),
            },
        ]);
        return utils.arrayBufferToUint8Array(x);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBDQU13QjtBQUl4QixzQ0FBaUU7QUFFakUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFvQnJDLCtCQUFtQztBQUVuQyxzREFBd0M7QUFjeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUUvRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDZCxTQUFTO0lBQ1AsQ0FBQyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztJQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQ2IsQ0FBQztBQUVwQixNQUFNLEVBQ0osTUFBTSxFQUNOLE1BQU0sRUFDTixHQUFHLEVBQ0gsS0FBSyxFQUNMLElBQUksRUFDSixHQUFHLEVBQ0gsY0FBYyxFQUNkLE1BQU0sRUFDTixJQUFJLEVBQ0osS0FBSyxFQUNMLEdBQUcsR0FDSixHQUFHLENBQ0YsU0FBUztJQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUM7SUFDeEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUN6QixDQUFDO0FBRXBCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDM0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNkLE1BQU0s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