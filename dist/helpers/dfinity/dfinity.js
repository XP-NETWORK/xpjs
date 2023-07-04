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
        isBrowser
            ? //@ts-ignore
                adaptPlug(sender.agent)
            : args.agent.replaceIdentity(sender);
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
        getExtraFees() {
            return new bignumber_js_1.default(0);
        },
        async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
            isBrowser
                ? //@ts-ignore
                    adaptPlug(sender.agent)
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
            if (isBrowser) {
                //@ts-ignore
                args.agent = owner.agent;
            }
            const principal = isBrowser
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
            isBrowser
                ? //@ts-ignore
                    adaptPlug(sender.agent)
                : args.agent.replaceIdentity(sender);
            if (!(await isApprovedForMinter(sender, id))) {
                throw new Error(`Nft not approved for minter`);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, parseInt(nonce), to, 1);
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
            isBrowser
                ? //@ts-ignore
                    adaptPlug(sender.agent)
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