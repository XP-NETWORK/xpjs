"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elrondHelperFactory = void 0;
const erdjs_1 = require("@elrondnetwork/erdjs");
const transactionWatcher_1 = require("@elrondnetwork/erdjs/out/transactionWatcher");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
function isEsdtNftInfo(maybe) {
    return maybe.creator != undefined;
}
;
const elrondHelperFactory = async (node_uri, minter_address, middleware_uri, esdt, esdt_nft) => {
    const provider = new erdjs_1.ProxyProvider(node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(minter_address);
    const eventMiddleware = axios_1.default.create({
        baseURL: middleware_uri,
    });
    const providerRest = axios_1.default.create({
        baseURL: node_uri
    });
    const esdtHex = Buffer.from(esdt, "utf-8");
    const esdtNftHex = Buffer.from(esdt_nft, "utf-8");
    const handleEvent = async (tx_hash) => {
        await new Promise(r => setTimeout(r, 3000));
        const watcher = new transactionWatcher_1.TransactionWatcher(tx_hash, provider);
        await watcher.awaitNotarized();
        const res = (await transactionResult(tx_hash))["smartContractResults"];
        const id = filterEventId(res);
        await emitEvent(eventMiddleware, id.toString());
        return id;
    };
    const syncAccount = async (signer) => {
        const account = new erdjs_1.Account(signer.getAddress());
        await account.sync(provider);
        return account;
    };
    const signAndSend = async (signer, tx) => {
        const acc = await syncAccount(signer);
        tx.setNonce(acc.nonce);
        await signer.sign(tx);
        await tx.send(provider);
        return tx;
    };
    const transactionResult = async (tx_hash) => {
        const uri = `/transaction/${tx_hash.toString()}?withResults=true`;
        while (true) {
            // TODO: type safety
            const res = await providerRest.get(uri);
            const data = res.data;
            if (data["code"] != "successful") {
                throw Error("failed to execute txn");
            }
            const tx_info = data["data"]["transaction"];
            if (tx_info["status"] == "pending") {
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
            if (tx_info["status"] != "success") {
                throw Error("failed to execute txn");
            }
            return tx_info;
        }
    };
    const unsignedTransferTxn = (to, value) => {
        return new erdjs_1.Transaction({
            receiver: mintContract,
            gasLimit: new erdjs_1.GasLimit(50000000),
            value: new erdjs_1.Balance(value.toString()),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("freezeSend"))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const unsignedMintNftTxn = (owner, { identifier, quantity, name, royalties, hash, attrs, uris }) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("ESDTNFTCreate"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(identifier, 'utf-8')))
            .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(quantity !== null && quantity !== void 0 ? quantity : 1)))
            .addArg(new erdjs_1.BytesValue(Buffer.from(name, 'utf-8')))
            .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(royalties !== null && royalties !== void 0 ? royalties : 0)))
            .addArg(new erdjs_1.BytesValue(hash ? Buffer.from(hash, 'utf-8') : Buffer.alloc(0)))
            .addArg(new erdjs_1.BytesValue(attrs ? Buffer.from(attrs, 'utf-8') : Buffer.alloc(0)));
        for (const uri of uris) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from(uri, 'utf-8')));
        }
        return new erdjs_1.Transaction({
            receiver: owner,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: baseArgs.build()
        });
    };
    const unsignedTransferNftTxn = (address, to, { token, nonce }) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("ESDTNFTTransfer"))
                .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(token, "utf-8")))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(nonce)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BytesValue(Buffer.from("freezeSendNft", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const unsignedUnfreezeNftTxn = (address, to, id) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("ESDTNFTTransfer"))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtNftHex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(id)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BytesValue(Buffer.from("withdrawNft", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const unsignedUnfreezeTxn = (to, value) => {
        return new erdjs_1.Transaction({
            receiver: mintContract,
            gasLimit: new erdjs_1.GasLimit(50000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("ESDTTransfer"))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtHex))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(value)))
                .addArg(new erdjs_1.BytesValue(Buffer.from("withdraw", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const listNft = async (owner) => {
        const raw = await providerRest(`/address/${owner}/esdt`);
        const dat = raw.data.data.esdts;
        const ents = Object.entries(dat);
        return new Map(ents.filter(([_ident, info]) => isEsdtNftInfo(info)));
    };
    const unsignedIssueESDTNft = (name, ticker, canFreeze, canWipe, canTransferNFTCreateRole) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("issueNonFungible"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(name, 'utf-8')))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(ticker, 'utf-8')));
        if (canFreeze !== undefined) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from("canFreeze", 'ascii')))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canFreeze ? "true" : "false", 'ascii')));
        }
        if (canWipe !== undefined) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from("canWipe", 'ascii')))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canWipe ? "true" : "false", "ascii")));
        }
        if (canTransferNFTCreateRole !== undefined) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from('canTransferNFTCreateRole', 'ascii')))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canTransferNFTCreateRole ? "true" : "false", "ascii")));
        }
        return new erdjs_1.Transaction({
            receiver: ESDT_ISSUE_ADDR,
            value: new erdjs_1.Balance(ESDT_ISSUE_COST),
            gasLimit: new erdjs_1.GasLimit(60000000),
            data: baseArgs.build()
        });
    };
    const unsignedSetESDTRoles = (token, target, roles) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("setSpecialRole"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(token)))
            .addArg(new erdjs_1.AddressValue(target));
        for (const role of roles) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from(role, 'utf-8')));
        }
        return new erdjs_1.Transaction({
            receiver: ESDT_ISSUE_ADDR,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: baseArgs.build()
        });
    };
    return {
        rawTxnResult: transactionResult,
        handleTxnEvent: handleEvent,
        unsignedTransferTxn,
        unsignedUnfreezeTxn,
        unsignedTransferNftTxn,
        unsignedUnfreezeNftTxn,
        unsignedMintNftTxn,
        unsignedSetESDTRoles,
        async balance(address) {
            const wallet = new erdjs_1.Account(new erdjs_1.Address(address));
            await wallet.sync(provider);
            return wallet.balance.valueOf();
        },
        async transferNativeToForeign(sender, to, value) {
            const txu = unsignedTransferTxn(to, value);
            const tx = await signAndSend(sender, txu);
            const id = await handleEvent(tx.getHash());
            return [tx, id];
        },
        async unfreezeWrapped(sender, to, value) {
            const txu = unsignedUnfreezeTxn(to, value);
            const tx = await signAndSend(sender, txu);
            const id = await handleEvent(tx.getHash());
            return [tx, id];
        },
        async transferNftToForeign(sender, to, info) {
            const txu = unsignedTransferNftTxn(sender.getAddress(), to, info);
            const tx = await signAndSend(sender, txu);
            const id = await handleEvent(tx.getHash());
            return [tx, id];
        },
        async unfreezeWrappedNft(sender, to, nonce) {
            const txu = unsignedUnfreezeNftTxn(sender.getAddress(), to, nonce);
            const tx = await signAndSend(sender, txu);
            const eid = await handleEvent(tx.getHash());
            return [tx, eid];
        },
        unsignedIssueESDTNft,
        async issueESDTNft(sender, name, ticker, canFreeze = false, canWipe = false, canTransferNFTCreateRole = false) {
            const txu = unsignedIssueESDTNft(name, ticker, canFreeze, canWipe, canTransferNFTCreateRole);
            await signAndSend(sender, txu);
        },
        async mintNft(owner, args) {
            const txu = unsignedMintNftTxn(owner.getAddress(), args);
            await signAndSend(owner, txu);
        },
        listNft,
        async getLockedNft({ token, nonce }) {
            const nfts = await listNft(minter_address);
            return nfts.get(`${token}-0${nonce.toString(16)}`);
        },
        async setESDTRole(manager, token, target, roles) {
            const txu = unsignedSetESDTRoles(token, target, roles);
            await signAndSend(manager, txu);
        }
    };
};
exports.elrondHelperFactory = elrondHelperFactory;
function filterEventId(results) {
    for (const res of results) {
        if (res["nonce"] === 0) {
            continue;
        }
        const data = res.data.split("@");
        if (data[0] != "" || data[1] != "6f6b" || data.length != 3) {
            continue;
        }
        try {
            return parseInt(data[2], 16);
        }
        catch (NumberFormatException) {
            continue;
        }
    }
    throw Error(`invalid result: ${results.toString()}`);
}
async function emitEvent(middleware, id) {
    await middleware.post("/event/transfer", undefined, { headers: { id } });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQWlCOEI7QUFDOUIsb0ZBQWtGO0FBQ2xGLGtEQUE2QztBQUM3QyxnRUFBcUM7QUFjckMsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFPLENBQUMsZ0VBQWdFLENBQUMsQ0FBQztBQUN0RyxNQUFNLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztBQTRCNUMsU0FBUyxhQUFhLENBQUMsS0FBdUI7SUFDNUMsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQztBQUNwQyxDQUFDO0FBNkJBLENBQUM7QUF1Q0ssTUFBTSxtQkFBbUIsR0FNSCxLQUFLLEVBQ2hDLFFBQWdCLEVBQ2hCLGNBQXNCLEVBQ3RCLGNBQXNCLEVBQ3RCLElBQVksRUFDWixRQUFnQixFQUNoQixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakQsTUFBTSxlQUFlLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxPQUFPLEVBQUUsY0FBYztLQUN4QixDQUFDLENBQUM7SUFDSCxNQUFNLFlBQVksR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxRQUFRO0tBQ2xCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBR2xE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