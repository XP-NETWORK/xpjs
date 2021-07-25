"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elrondHelperFactory = void 0;
const erdjs_1 = require("@elrondnetwork/erdjs");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const elrondHelperFactory = async (node_uri, minter_address, middleware_uri, esdt, esdt_nft) => {
    const provider = new erdjs_1.ProxyProvider(node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(minter_address);
    const eventMiddleware = axios_1.default.create({
        baseURL: middleware_uri,
    });
    const esdtHex = Buffer.from(esdt, "utf-8");
    const esdtNftHex = Buffer.from(esdt_nft, "utf-8");
    const handleEvent = async (tx) => {
        await new Promise(r => setTimeout(r, 5000));
        await tx.awaitNotarized(provider);
        const res = (await tx.getAsOnNetwork(provider))
            .getSmartContractResults()['items'];
        const id = filterEventId(res);
        await emitEvent(eventMiddleware, id.toString());
    };
    const syncAccount = async (signer) => {
        const account = new erdjs_1.Account(signer.getAddress());
        await account.sync(provider);
        return account;
    };
    return {
        async balance(address) {
            const wallet = new erdjs_1.Account(new erdjs_1.Address(address));
            await wallet.sync(provider);
            return wallet.balance.valueOf();
        },
        async transferNativeToForeign(sender, to, value) {
            const account = await syncAccount(sender);
            const tx = new erdjs_1.Transaction({
                receiver: mintContract,
                nonce: account.nonce,
                gasLimit: new erdjs_1.GasLimit(50000000),
                value: new erdjs_1.Balance(value.toString()),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("freezeSend"))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            await handleEvent(tx);
            return tx;
        },
        async unfreezeWrapped(sender, to, value) {
            const account = await syncAccount(sender);
            const tx = new erdjs_1.Transaction({
                receiver: mintContract,
                nonce: account.nonce,
                gasLimit: new erdjs_1.GasLimit(50000000),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("ESDTTransfer"))
                    .addArg(new erdjs_1.TokenIdentifierValue(esdtHex))
                    .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(value)))
                    .addArg(new erdjs_1.BytesValue(Buffer.from("withdraw", "ascii")))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            await handleEvent(tx);
            return tx;
        },
        async transferNftToForeign(sender, to, { token, nonce }) {
            const account = await syncAccount(sender);
            const tx = new erdjs_1.Transaction({
                receiver: account.address,
                nonce: account.nonce,
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
            sender.sign(tx);
            await tx.send(provider);
            await handleEvent(tx);
            return tx;
        },
        async unfreezeWrappedNft(sender, to, id) {
            const account = await syncAccount(sender);
            const tx = new erdjs_1.Transaction({
                receiver: account.address,
                nonce: account.nonce,
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
            sender.sign(tx);
            await tx.send(provider);
            await handleEvent(tx);
            return tx;
        },
        async issueESDTNft(sender, name, ticker, canFreeze = false, canWipe = false, canTransferNFTCreateRole = false) {
            const account = await syncAccount(sender);
            const tx = new erdjs_1.Transaction({
                receiver: ESDT_ISSUE_ADDR,
                nonce: account.nonce,
                value: new erdjs_1.Balance(ESDT_ISSUE_COST),
                gasLimit: new erdjs_1.GasLimit(60000000),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("issueNonFungible"))
                    .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(name, 'utf-8')))
                    .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(ticker, 'utf-8')))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(canFreeze ? "true" : "false", 'ascii')))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(canWipe ? "true" : "false", 'ascii')))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(canTransferNFTCreateRole ? "true" : "false", 'ascii')))
                    .build()
            });
            sender.sign(tx);
            await tx.send(provider);
        },
        async mintNft(owner, { identifier, quantity, name, royalties, hash, attrs, uris }) {
            const account = await syncAccount(owner);
            let baseArgs = erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("ESDTNFTCreate"))
                .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(identifier, 'utf-8')))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(quantity !== null && quantity !== void 0 ? quantity : 1)))
                .addArg(new erdjs_1.BytesValue(Buffer.from(name, 'utf-8')))
                .addArg(new erdjs_1.BytesValue(Buffer.from((royalties !== null && royalties !== void 0 ? royalties : 0).toString(), 'ascii')))
                .addArg(new erdjs_1.BytesValue(hash ? Buffer.from(hash, 'utf-8') : Buffer.alloc(0)))
                .addArg(new erdjs_1.BytesValue(attrs ? Buffer.from(attrs, 'utf-8') : Buffer.alloc(0)));
            for (const uri of uris) {
                baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from(uri, 'utf-8')));
            }
            const tx = new erdjs_1.Transaction({
                receiver: account.address,
                nonce: account.nonce,
                gasLimit: new erdjs_1.GasLimit(70000000),
                data: baseArgs.build()
            });
            owner.sign(tx);
            await tx.send(provider);
        },
        async listNft(owner) {
            const raw = await axios_1.default.get(`${node_uri}/address/${owner}/esdt`);
            return raw.data.data.esdts;
        }
    };
};
exports.elrondHelperFactory = elrondHelperFactory;
function filterEventId(results) {
    for (const res of results) {
        if (res.nonce === new erdjs_1.Nonce(0)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQWtCOEI7QUFDOUIsa0RBQTZDO0FBQzdDLGdFQUFxQztBQWFyQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQU8sQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO0FBQ3RHLE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0FBMENyQyxNQUFNLG1CQUFtQixHQU1ILEtBQUssRUFDaEMsUUFBZ0IsRUFDaEIsY0FBc0IsRUFDdEIsY0FBc0IsRUFDdEIsSUFBWSxFQUNaLFFBQWdCLEVBQ2hCLEVBQUU7SUFDRixNQUFNLFFBQVEsR0FBRyxJQUFJLHFCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsTUFBTSxxQkFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRCxNQUFNLGVBQWUsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ25DLE9BQU8sRUFBRSxjQUFjO0tBQ3hCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxFQUFlLEVBQUUsRUFBRTtRQUMvQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3hDLE1BQU0sRUFBRSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxN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