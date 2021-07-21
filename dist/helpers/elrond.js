"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elrondHelperFactory = void 0;
const erdjs_1 = require("@elrondnetwork/erdjs");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const elrondHelperFactory = async (node_uri, faucet_key, minter_address, middleware_uri, esdt, esdt_nft) => {
    const provider = new erdjs_1.ProxyProvider(node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(minter_address);
    const faucet = new erdjs_1.UserSigner(erdjs_1.parseUserKey(faucet_key));
    const faucetAcc = new erdjs_1.Account(faucet.getAddress());
    const eventMiddleware = axios_1.default.create({
        baseURL: middleware_uri,
    });
    const esdtHex = Buffer.from(esdt, "utf-8");
    const esdtNftHex = Buffer.from(esdt_nft, "utf-8");
    const handleEvent = async (tx) => {
        await tx.awaitNotarized(provider);
        const res = (await tx.getAsOnNetwork(provider))
            .getSmartContractResults()
            .getResultingCalls();
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
        async transferFromFaucet(to, value) {
            await faucetAcc.sync(provider);
            const tx = new erdjs_1.Transaction({
                receiver: new erdjs_1.Address(to),
                nonce: faucetAcc.nonce,
                gasLimit: new erdjs_1.GasLimit(70000),
                value: new erdjs_1.Balance(value.toString()),
            });
            faucet.sign(tx);
            await tx.send(provider);
            return tx;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQW9COEI7QUFDOUIsa0RBQTZDO0FBQzdDLGdFQUFxQztBQXlCOUIsTUFBTSxtQkFBbUIsR0FPSCxLQUFLLEVBQ2hDLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLGNBQXNCLEVBQ3RCLGNBQXNCLEVBQ3RCLElBQVksRUFDWixRQUFnQixFQUNoQixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBVSxDQUFDLG9CQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLGVBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNuRCxNQUFNLGVBQWUsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ25DLE9BQU8sRUFBRSxjQUFjO0tBQ3hCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxFQUFlLEVBQUUsRUFBRTtRQUM1QyxNQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVB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