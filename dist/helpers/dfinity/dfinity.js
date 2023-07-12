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
const xpnft_idl_1 = require("./xpnft.idl");
const isBrowser = global.window?.constructor.name === "Window";
const { IDL } = (isBrowser
    ? require("@dfinity/candid/lib/esm/index")
    : require("@dfinity/candid"));
const { decode, encode, Nat32, Text } = (isBrowser
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
    async function isApprovedForMinter(sender, nft) {
        sender.agent ? adaptPlug(sender.agent) : args.agent.replaceIdentity(sender);
        // const tid = tokenIdentifier(
        //   nft.collectionIdent,
        //   Number(nft.native.tokenId)
        // );
        // const nftContract = Principal.fromText(nft.native.canisterId);
        const nftCan = agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
            agent: args.agent,
            canisterId: nft.native.canisterId,
        });
        const allowances = await nftCan.getAllowances();
        for (const [idx, principal] of allowances) {
            if (idx.toString() === nft.native.tokenId &&
                principal.toString() === args.bridgeContract.toString()) {
                return true;
            }
        }
        return false;
    }
    const adaptPlug = (agent) => {
        minter = agent_1.Actor.createActor(idl_1.idlFactory, {
            agent,
            canisterId: args.bridgeContract,
        });
        args.agent = agent;
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
        getExtraFees() {
            return new bignumber_js_1.default(0);
        },
        async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
            sender.agent
                ? adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            if (!(await isApprovedForMinter(sender, id))) {
                throw new Error(`Nft not approved for minter`);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, chain_nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        async mintNft(owner, options) {
            const canister = principal_1.Principal.fromText(options.canisterId ? options.canisterId : args.umt.toText());
            if (owner.agent)
                args.agent = owner.agent;
            const principal = owner.agent
                ? await args.agent.getPrincipal()
                : owner.getPrincipal();
            const nftCan = agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
                agent: args.agent,
                canisterId: canister,
            });
            let mint = await nftCan.mintNFT({
                metadata: [[...Buffer.from(options.uri)]],
                to: {
                    principal,
                },
            });
            return mint;
        },
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            sender.agent
                ? adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            if (!(await isApprovedForMinter(sender, id))) {
                throw new Error(`Nft not approved for minter`);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const actionId = await minter.withdraw_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(nonce), to, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        isApprovedForMinter,
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
            sender.agent
                ? adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            if (await isApprovedForMinter(sender, nft)) {
                return undefined;
            }
            const tid = tokenIdentifier(nft.collectionIdent, Number(nft.native.tokenId));
            const actor = agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
                canisterId: nft.collectionIdent,
                agent: args.agent,
            });
            await actor.approve({
                allowance: 1n,
                spender: args.bridgeContract,
                subaccount: [],
                token: tid,
            });
            return "no hash";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBDQUEyRTtBQUkzRSxzQ0FBaUU7QUFFakUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFzQnJDLCtCQUFtQztBQUVuQyxzREFBd0M7QUFDeEMsMkNBQXFEO0FBY3JELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7QUFFL0QsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQ2QsU0FBUztJQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUM7SUFDMUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUNiLENBQUM7QUFFcEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQ3RDLFNBQVM7SUFDUCxDQUFDLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0lBQ3hDLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FDekIsQ0FBQztBQUVwQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDO0lBQzNCLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ25CLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNsQixRQUFRLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDZCxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUk7S0FDakIsQ0FBQztJQUNGLFdBQVcsRUFBRSxHQUFHLENBQUMs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