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
        account.sync(provider);
        return account;
    };
    return {
        async transferFromFaucet(to, value) {
            faucetAcc.sync(provider);
            const tx = new erdjs_1.Transaction({
                receiver: new erdjs_1.Address(to),
                nonce: faucetAcc.nonce,
                gasLimit: new erdjs_1.GasLimit(70000),
                value: erdjs_1.Balance.egld(value),
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
                value: erdjs_1.Balance.egld(value),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("freezeSend"))
                    .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            handleEvent(tx);
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
            handleEvent(tx);
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
            handleEvent(tx);
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
            handleEvent(tx);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQW9COEI7QUFDOUIsa0RBQTZDO0FBQzdDLGdFQUFxQztBQXNCOUIsTUFBTSxtQkFBbUIsR0FPSCxLQUFLLEVBQ2hDLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLGNBQXNCLEVBQ3RCLGNBQXNCLEVBQ3RCLElBQVksRUFDWixRQUFnQixFQUNoQixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBVSxDQUFDLG9CQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLGVBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNuRCxNQUFNLGVBQWUsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ25DLE9BQU8sRUFBRSxjQUFjO0tBQ3hCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxFQUFlLEVBQUUsRUFBRTtRQUM1QyxNQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVB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