"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elrondHelperFactory = void 0;
const out_1 = require("@elrondnetwork/erdjs/out");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const elrondHelperFactory = async (node_uri, faucet_key, minter_address, middleware_uri, esdt, esdt_nft) => {
    const provider = new out_1.ProxyProvider(node_uri);
    await out_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new out_1.Address(minter_address);
    const faucet = new out_1.UserSigner(out_1.parseUserKey(faucet_key));
    const faucetAcc = new out_1.Account(faucet.getAddress());
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
        const account = new out_1.Account(signer.getAddress());
        account.sync(provider);
        return account;
    };
    return {
        async transferFromFaucet(to, value) {
            faucetAcc.sync(provider);
            const tx = new out_1.Transaction({
                receiver: new out_1.Address(to),
                nonce: faucetAcc.nonce,
                gasLimit: new out_1.GasLimit(70000),
                value: out_1.Balance.egld(value),
            });
            faucet.sign(tx);
            await tx.send(provider);
            return tx;
        },
        async transferNativeToForeign(sender, to, value) {
            const account = await syncAccount(sender);
            const tx = new out_1.Transaction({
                receiver: mintContract,
                nonce: account.nonce,
                gasLimit: new out_1.GasLimit(50000000),
                value: out_1.Balance.egld(value),
                data: out_1.TransactionPayload.contractCall()
                    .setFunction(new out_1.ContractFunction("freezeSend"))
                    .addArg(new out_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            handleEvent(tx);
            return tx;
        },
        async unfreezeWrapped(sender, to, value) {
            const account = await syncAccount(sender);
            const tx = new out_1.Transaction({
                receiver: mintContract,
                nonce: account.nonce,
                gasLimit: new out_1.GasLimit(50000000),
                data: out_1.TransactionPayload.contractCall()
                    .setFunction(new out_1.ContractFunction("ESDTTransfer"))
                    .addArg(new out_1.TokenIdentifierValue(esdtHex))
                    .addArg(new out_1.BigUIntValue(new bignumber_js_1.default(value)))
                    .addArg(new out_1.BytesValue(Buffer.from("withdraw", "ascii")))
                    .addArg(new out_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            handleEvent(tx);
            return tx;
        },
        async transferNftToForeign(sender, to, { token, nonce }) {
            const account = await syncAccount(sender);
            const tx = new out_1.Transaction({
                receiver: account.address,
                nonce: account.nonce,
                gasLimit: new out_1.GasLimit(70000000),
                data: out_1.TransactionPayload.contractCall()
                    .setFunction(new out_1.ContractFunction("ESDTNFTTransfer"))
                    .addArg(new out_1.TokenIdentifierValue(Buffer.from(token, "utf-8")))
                    .addArg(new out_1.U64Value(new bignumber_js_1.default(nonce)))
                    .addArg(new out_1.BigUIntValue(new bignumber_js_1.default(1)))
                    .addArg(new out_1.AddressValue(mintContract))
                    .addArg(new out_1.BytesValue(Buffer.from("freezeSendNft", "ascii")))
                    .addArg(new out_1.BytesValue(Buffer.from(to, "ascii")))
                    .build(),
            });
            sender.sign(tx);
            await tx.send(provider);
            handleEvent(tx);
            return tx;
        },
        async unfreezeWrappedNft(sender, to, id) {
            const account = await syncAccount(sender);
            const tx = new out_1.Transaction({
                receiver: account.address,
                nonce: account.nonce,
                gasLimit: new out_1.GasLimit(70000000),
                data: out_1.TransactionPayload.contractCall()
                    .setFunction(new out_1.ContractFunction("ESDTNFTTransfer"))
                    .addArg(new out_1.TokenIdentifierValue(esdtNftHex))
                    .addArg(new out_1.U64Value(new bignumber_js_1.default(id)))
                    .addArg(new out_1.BigUIntValue(new bignumber_js_1.default(1)))
                    .addArg(new out_1.AddressValue(mintContract))
                    .addArg(new out_1.BytesValue(Buffer.from("withdrawNft", "ascii")))
                    .addArg(new out_1.BytesValue(Buffer.from(to, "ascii")))
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
        if (res.nonce === new out_1.Nonce(0)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQW9Ca0M7QUFDbEMsa0RBQTZDO0FBQzdDLGdFQUFxQztBQXNCOUIsTUFBTSxtQkFBbUIsR0FPSCxLQUFLLEVBQ2hDLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLGNBQXNCLEVBQ3RCLGNBQXNCLEVBQ3RCLElBQVksRUFDWixRQUFnQixFQUNoQixFQUFFO0lBQ0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sbUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxhQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBVSxDQUFDLGtCQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFJLGFBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNuRCxNQUFNLGVBQWUsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ25DLE9BQU8sRUFBRSxjQUFjO0tBQ3hCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxELE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxFQUFlLEVBQUUsRUFBRTtRQUM1QyxNQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVB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