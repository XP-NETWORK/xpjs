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
const __1 = require("../..");
const idl_1 = require("./idl");
const ledger_did_1 = __importStar(require("./ledger.did"));
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
    const createMinter = async (agent) => agent_1.Actor.createActor(idl_1.idlFactory, {
        agent,
        canisterId: args.bridgeContract,
    });
    //adapt agent for different wallets
    const prepareAgent = (sender) => {
        //plug wallet
        if (sender.agent?.rootKey) {
            return sender.agent;
        }
        //bitfinity wallet
        if (sender.agent) {
            return args.agent;
        }
        //default
        args.agent.replaceIdentity(sender);
        return args.agent;
    };
    //@ts-ignore
    let ledger = nns_1.LedgerCanister.create({ agent: args.agent });
    const minter = await createMinter(args.agent);
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
    const getAccountIdentifier = (principal) => nns_1.AccountIdentifier.fromPrincipal({
        principal: principal_1.Principal.fromText(principal),
    }).toHex();
    async function transferTxFee(amt, sender) {
        //plug wallet
        if (sender.requestTransfer) {
            const res = await sender.requestTransfer({
                to: args.bridgeContract.toText(),
                amount: amt.integerValue().toNumber(),
            });
            return BigInt(res.height);
        }
        //bitfinity wallt
        if (sender.batchTransactions) {
            const res = (await new Promise(async (resolve, reject) => {
                await sender.batchTransactions([
                    {
                        idl: ledger_did_1.default,
                        canisterId: ledger_did_1.LEDGER_CANISTER,
                        methodName: "send_dfx",
                        args: [
                            {
                                to: getAccountIdentifier(args.bridgeContract.toText()),
                                fee: { e8s: BigInt(10000) },
                                amount: {
                                    e8s: BigInt(amt.integerValue().toString()),
                                },
                                memo: (0, __1.randomBigInt)(),
                                from_subaccount: [],
                                created_at_time: [],
                            },
                        ],
                        onSuccess: async (res) => {
                            resolve({ height: res });
                        },
                        onFail: (err) => {
                            console.log("transfer icp error", err);
                            reject(err);
                        },
                    },
                ], { host: undefined });
            }));
            return BigInt(res.height);
        }
        //default
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
        const agent = prepareAgent(sender);
        // const tid = tokenIdentifier(
        //   nft.collectionIdent,
        //   Number(nft.native.tokenId)
        // );
        // const nftContract = Principal.fromText(nft.native.canisterId);
        const nftCan = await agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
            agent,
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
    return {
        getMinter: () => minter,
        XpNft: args.xpnftId.toString(),
        getParams: () => args,
        getNonce: () => consts_1.Chain.DFINITY,
        estimateValidateTransferNft: async () => new bignumber_js_1.default(0),
        estimateValidateUnfreezeNft: async () => new bignumber_js_1.default(0),
        estimateContractDeploy: async () => {
            return new bignumber_js_1.default("500000");
        },
        validateAddress(adr) {
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
            const agent = prepareAgent(sender);
            if (!(await isApprovedForMinter(sender, id))) {
                throw new Error(`Nft not approved for minter`);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, chain_nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const minter = await createMinter(agent);
            const actionId = await minter.freeze_nft(txFeeBlock, principal_1.Principal.fromText(id.native.canisterId), BigInt(id.native.tokenId), BigInt(chain_nonce), to, mintWith, [...Buffer.from(sig.signature, "hex")]);
            await args.notifier.notifyDfinity(actionId.toString());
            return actionId.toString();
        },
        async mintNft(owner, options) {
            const agent = prepareAgent(owner);
            const canister = principal_1.Principal.fromText(options.canisterId ? options.canisterId : args.umt.toText());
            const principal = owner.agent
                ? await args.agent.getPrincipal()
                : owner.getPrincipal();
            const nftCan = await agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
                agent,
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
            const agent = prepareAgent(sender);
            if (!(await isApprovedForMinter(sender, id))) {
                throw new Error(`Nft not approved for minter`);
            }
            const sig = await args.signatureSvc.getSignatureDfinity(consts_1.Chain.DFINITY, nonce, to, 1);
            const txFeeBlock = await transferTxFee(new bignumber_js_1.default(sig.fee), sender);
            const minter = await createMinter(agent);
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
            const agent = prepareAgent(sender);
            if (await isApprovedForMinter(sender, nft)) {
                return undefined;
            }
            const tid = tokenIdentifier(nft.collectionIdent, Number(nft.native.tokenId));
            const actor = await agent_1.Actor.createActor(xpnft_idl_1.xpnftIdl, {
                canisterId: nft.collectionIdent,
                agent,
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
        getAccountIdentifier,
        async isNftWhitelisted(nft) {
            return await minter.is_whitelisted(principal_1.Principal.fromText(nft.native.canisterId));
        },
        //replace default createActor (of Actor class) with custom of Bitfinity Wallet signer (it has different interface than Actor.createActor)
        setActorCreator(provider) {
            agent_1.Actor.createActor = (iface, args) => {
                //@ts-ignore
                const cid = args.canisterId.toText
                    ? //@ts-ignore
                        args.canisterId.toText()
                    : args.canisterId;
                return provider.createActor({
                    canisterId: cid,
                    interfaceFactory: iface,
                    host: undefined,
                });
            };
        },
        withdraw_fees,
        encode_withdraw_fees,
        async validatedMint(actionId) {
            const data = await minter
                .get_validated_event(BigInt(actionId))
                .catch((e) => {
                console.log(e, "in validatedMint");
            });
            if (data?.at(0)?.ValidatedMint?.mint_with) {
                return data.at(0).ValidatedMint.mint_with.toString();
            }
            if (data?.at(0)?.ValidatedUnfreeze?.contract) {
                return data.at(0).ValidatedUnfreeze.contract.toString();
            }
            return "";
        },
    };
}
exports.dfinityHelper = dfinityHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGZpbml0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2RmaW5pdHkvZGZpbml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBDQUEyRTtBQUkzRSxzQ0FBaUU7QUFFakUsa0RBQStDO0FBQy9DLGdFQUFxQztBQUNyQyx5Q0FBcUM7QUFJckMsNkJBQXFDO0FBb0JyQywrQkFBbUM7QUFFbkMsMkRBQTBEO0FBQzFELHNEQUF3QztBQUN4QywyQ0FBcUQ7QUFjckQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztBQUUvRCxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FDZCxTQUFTO0lBQ1AsQ0FBQyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQztJQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQ2IsQ0FBQztBQUVwQixNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FDdEMsU0FBUztJQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUM7SUFDeEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUN6QixDQUFDO0FBRXBCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDM0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDbkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtRQUNkLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSTtLQUNqQixDQUFD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