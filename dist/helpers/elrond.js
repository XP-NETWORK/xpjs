"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elrondHelperFactory = void 0;
/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
const erdjs_1 = require("@elrondnetwork/erdjs");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("./chain");
const __1 = require("..");
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const NFT_TRANSFER_COST = new bignumber_js_1.default(350000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(350000000);
async function elrondHelperFactory(elrondParams) {
    const provider = new erdjs_1.ProxyProvider(elrondParams.node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(elrondParams.minter_address);
    const swapContract = new erdjs_1.Address(elrondParams.esdt_swap_address);
    const providerRest = axios_1.default.create({
        baseURL: elrondParams.node_uri,
    });
    const esdtNftHex = Buffer.from(elrondParams.esdt_nft, "utf-8");
    const esdtSwaphex = Buffer.from(elrondParams.esdt_swap, "utf-8");
    const networkConfig = await provider.getNetworkConfig();
    const gasPriceModif = networkConfig.MinGasPrice.valueOf() *
        networkConfig.GasPriceModifier.valueOf();
    async function notifyValidator(txn, sender, uri, action_id) {
        await elrondParams.notifier.notifyElrond(txn.getHash().toString(), sender, uri, action_id);
    }
    const syncAccount = async (signer) => {
        const account = new erdjs_1.Account(await getAddress(signer));
        await account.sync(provider);
        return account;
    };
    const signAndSend = async (signer, tx) => {
        const acc = await syncAccount(signer);
        tx.setNonce(acc.nonce);
        let stx;
        if (signer instanceof erdjs_1.WalletConnectProvider) {
            const txs = await signer.signTransactions([tx]);
            stx = txs[0];
        }
        else if (signer instanceof erdjs_1.ExtensionProvider) {
            stx = await signer.signTransaction(tx);
        }
        else {
            await signer.sign(tx);
            stx = tx;
        }
        try {
            await stx.send(provider);
        }
        catch (e) {
            if (e.message.includes("lowerNonceInTx")) {
                throw chain_1.ConcurrentSendError();
            }
            else {
                throw e;
            }
        }
        return stx;
    };
    const transactionResult = async (tx_hash) => {
        const uri = `/transaction/${tx_hash.toString()}?withResults=true`;
        let tries = 0;
        while (tries < 10) {
            tries += 1;
            let err;
            // TODO: type safety
            const res = await providerRest.get(uri).catch((e) => (err = e));
            if (err) {
                await new Promise((r) => setTimeout(r, 3000));
                continue;
            }
            const data = res.data;
            if (data["code"] != "successful") {
                throw Error("failed to execute txn");
            }
            const tx_info = data["data"]["transaction"];
            if (tx_info["status"] == "pending") {
                await new Promise((r) => setTimeout(r, 5000));
                continue;
            }
            if (tx_info["status"] != "success") {
                throw Error("failed to execute txn");
            }
            return tx_info;
        }
        throw Error(`failed to query transaction exceeded 10 retries ${tx_hash}`);
    };
    const doEgldSwap = async (sender, nft, value) => {
        const esdts = await listEsdt((await sender.getAddress()).toString());
        const res = esdts[nft.native.nonce];
        if (res === undefined || new bignumber_js_1.default(res.balance).lt(value)) {
            const utx = new erdjs_1.Transaction({
                receiver: swapContract,
                gasLimit: new erdjs_1.GasLimit(50000000),
                value: new erdjs_1.Balance(erdjs_1.Egld.getToken(), erdjs_1.Egld.getNonce(), new bignumber_js_1.default(value.toString())),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("wrapEgld"))
                    .build(),
            });
            const tx = await signAndSend(sender, utx);
            await transactionResult(tx.getHash());
            return tx.getHash().toString();
        }
        return undefined;
    };
    const unsignedMintNftTxn = (owner, { identifier, quantity, name, royalties, hash, attrs, uris }) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("ESDTNFTCreate"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(identifier, "utf-8")))
            .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(quantity !== null && quantity !== void 0 ? quantity : 1)))
            .addArg(new erdjs_1.BytesValue(Buffer.from(name, "utf-8")))
            .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(royalties !== null && royalties !== void 0 ? royalties : 0)))
            .addArg(new erdjs_1.BytesValue(hash ? Buffer.from(hash, "utf-8") : Buffer.alloc(0)))
            .addArg(new erdjs_1.BytesValue(attrs ? Buffer.from(attrs, "utf-8") : Buffer.alloc(0)));
        for (const uri of uris) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from(uri, "utf-8")));
        }
        return new erdjs_1.Transaction({
            receiver: owner,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: baseArgs.build(),
        });
    };
    function tokenIdentReal(tokenIdentifier) {
        const base = tokenIdentifier.split("-");
        base.pop();
        return base.join("-");
    }
    const unsignedTransferNftTxn = (chain_nonce, address, to, { tokenIdentifier, nonce }, tx_fees, mintWith) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("MultiESDTNFTTransfer"))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(2)))
                .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(tokenIdentReal(tokenIdentifier), "utf-8")))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(nonce)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtSwaphex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(0x0)))
                .addArg(new erdjs_1.BigUIntValue(tx_fees))
                .addArg(new erdjs_1.BytesValue(Buffer.from("freezeSendNft", "ascii")))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(chain_nonce)))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(mintWith, "ascii")))
                .build(),
        });
    };
    const unsignedUnfreezeNftTxn = (address, to, { tokenIdentifier, nonce }, tx_fees, chain_nonce) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("MultiESDTNFTTransfer"))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(2)))
                .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(tokenIdentReal(tokenIdentifier), "utf-8")))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(nonce)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtSwaphex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(0x0)))
                .addArg(new erdjs_1.BigUIntValue(tx_fees))
                .addArg(new erdjs_1.BytesValue(Buffer.from("withdrawNft", "ascii")))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(chain_nonce)))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const listEsdt = async (owner) => {
        const raw = await providerRest(`/address/${owner}/esdt`);
        const dat = raw.data.data.esdts;
        return dat;
    };
    const unsignedIssueESDTNft = (name, ticker, canFreeze, canWipe, canTransferNFTCreateRole) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("issueNonFungible"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(name, "utf-8")))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(ticker, "utf-8")));
        if (canFreeze !== undefined) {
            baseArgs = baseArgs
                .addArg(new erdjs_1.BytesValue(Buffer.from("canFreeze", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canFreeze ? "true" : "false", "ascii")));
        }
        if (canWipe !== undefined) {
            baseArgs = baseArgs
                .addArg(new erdjs_1.BytesValue(Buffer.from("canWipe", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canWipe ? "true" : "false", "ascii")));
        }
        if (canTransferNFTCreateRole !== undefined) {
            baseArgs = baseArgs
                .addArg(new erdjs_1.BytesValue(Buffer.from("canChangeOwner", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(canTransferNFTCreateRole ? "true" : "false", "ascii")));
        }
        return new erdjs_1.Transaction({
            receiver: ESDT_ISSUE_ADDR,
            value: new erdjs_1.Balance(erdjs_1.Egld.getToken(), erdjs_1.Egld.getNonce(), new bignumber_js_1.default(ESDT_ISSUE_COST.toString())),
            gasLimit: new erdjs_1.GasLimit(60000000),
            data: baseArgs.build(),
        });
    };
    const unsignedSetESDTRoles = (token, target, roles) => {
        let baseArgs = erdjs_1.TransactionPayload.contractCall()
            .setFunction(new erdjs_1.ContractFunction("setSpecialRole"))
            .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(token)))
            .addArg(new erdjs_1.AddressValue(target));
        for (const role of roles) {
            baseArgs = baseArgs.addArg(new erdjs_1.BytesValue(Buffer.from(role, "utf-8")));
        }
        return new erdjs_1.Transaction({
            receiver: ESDT_ISSUE_ADDR,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: baseArgs.build(),
        });
    };
    async function extractAction(tx) {
        let err;
        await tx.awaitExecuted(provider).catch((e) => (err = e));
        if (err) {
            await new Promise((r) => setTimeout(r, 3000));
            return await extractAction(tx);
        }
        const txr = await transactionResult(tx.getHash());
        const id = filterEventId(txr["smartContractResults"]);
        return id.toString();
    }
    function estimateGas(base_fees) {
        return base_fees.multipliedBy(gasPriceModif); // assume execution takes about twice as much gas fees
    }
    async function getAddress(sender) {
        return new erdjs_1.Address(await sender.getAddress());
    }
    return {
        XpNft: elrondParams.esdt_nft,
        async balance(address) {
            const wallet = new erdjs_1.Account(new erdjs_1.Address(address));
            await wallet.sync(provider);
            return wallet.balance.valueOf();
        },
        async extractTxnStatus(txn) {
            const status = await provider.getTransactionStatus(new erdjs_1.TransactionHash(txn));
            if (status.isPending()) {
                return chain_1.TransactionStatus.PENDING;
            }
            if (status.isSuccessful()) {
                return chain_1.TransactionStatus.SUCCESS;
            }
            if (status.isFailed()) {
                return chain_1.TransactionStatus.FAILURE;
            }
            return chain_1.TransactionStatus.UNKNOWN;
        },
        preTransfer: doEgldSwap,
        preUnfreeze: doEgldSwap,
        extractAction,
        async transferNftToForeign(sender, chain_nonce, to, info, txFees, mintWith) {
            const txu = unsignedTransferNftTxn(chain_nonce, await getAddress(sender), to, info.native, new bignumber_js_1.default(txFees.toString()), mintWith);
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), [info.uri], await extractAction(tx));
            return tx;
        },
        async unfreezeWrappedNft(sender, to, nft, txFees, nonce) {
            const txu = unsignedUnfreezeNftTxn(await getAddress(sender), to, nft.native, new bignumber_js_1.default(txFees.toString()), nonce);
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), [nft.uri], await extractAction(tx));
            return tx;
        },
        async issueESDTNft(sender, name, ticker, canFreeze = false, canWipe = false, canTransferNFTCreateRole = false) {
            const txu = unsignedIssueESDTNft(name, ticker, canFreeze, canWipe, canTransferNFTCreateRole);
            const tx = await signAndSend(sender, txu);
            const res = await transactionResult(tx.getHash());
            const tickerh = res["smartContractResults"][0].data.split("@")[2];
            return Buffer.from(tickerh, "hex").toString("utf-8");
        },
        async mintNft(owner, args) {
            const txu = unsignedMintNftTxn(await getAddress(owner), args);
            const tx = await signAndSend(owner, txu);
            return tx.getHash().toString();
        },
        async mintableEsdts(address) {
            const res = await providerRest.get(`/address/${address.toString()}/esdts-with-role/ESDTRoleNFTCreate`);
            return res.data["data"]["tokens"];
        },
        async preTransferRawTxn(id, address, value) {
            if (!address || !value) {
                throw new Error("address and value is required for elrond egld swap");
            }
            const esdts = await listEsdt(address);
            const res = esdts[id.native.nonce];
            if (res === undefined || new bignumber_js_1.default(res.balance).lt(value)) {
                const utx = new erdjs_1.Transaction({
                    receiver: swapContract,
                    gasLimit: new erdjs_1.GasLimit(50000000),
                    value: new erdjs_1.Balance(erdjs_1.Egld.getToken(), erdjs_1.Egld.getNonce(), new bignumber_js_1.default(value.toString())),
                    data: erdjs_1.TransactionPayload.contractCall()
                        .setFunction(new erdjs_1.ContractFunction("wrapEgld"))
                        .build(),
                });
                return utx.toPlainObject();
            }
            return undefined;
        },
        async setESDTRole(manager, token, target, roles) {
            const txu = unsignedSetESDTRoles(token, target, roles);
            const tx = await signAndSend(manager, txu);
            await transactionResult(tx.getHash());
            return tx;
        },
        async transferESDTOwnership(sender, token, target) {
            const txu = new erdjs_1.Transaction({
                receiver: new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
                gasLimit: new erdjs_1.GasLimit(60000000),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("transferOwnership"))
                    .addArg(new erdjs_1.TokenIdentifierValue(Buffer.from(token, "utf-8")))
                    .addArg(new erdjs_1.AddressValue(target))
                    .build(),
            });
            return await signAndSend(sender, txu);
        },
        getNonce() {
            return __1.Chain.ELROND;
        },
        async estimateValidateTransferNft(_toAddress, _nftUri) {
            return estimateGas(NFT_TRANSFER_COST); // TODO: properly estimate NFT_TRANSFER_COST
        },
        async estimateValidateUnfreezeNft(_to, _nftUri) {
            return estimateGas(NFT_UNFREEZE_COST); // TODO: properly estimate NFT_UNFREEZE_COST
        },
        async unfreezeWrappedNftBatch(sender, chainNonce, to, nfts, txFees) {
            const txu = new erdjs_1.Transaction({
                receiver: await getAddress(sender),
                gasLimit: new erdjs_1.GasLimit(40000000 + 5000000 * nfts.length),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("MultiESDTNFTTransfer"))
                    .setArgs([
                    new erdjs_1.AddressValue(mintContract),
                    new erdjs_1.BigUIntValue(new bignumber_js_1.default(nfts.length + 1)),
                    ...nfts.flatMap((nft) => [
                        new erdjs_1.TokenIdentifierValue(esdtNftHex),
                        new erdjs_1.U64Value(new bignumber_js_1.default(nft.native.nonce)),
                        new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)),
                    ]),
                    new erdjs_1.TokenIdentifierValue(esdtSwaphex),
                    new erdjs_1.U64Value(new bignumber_js_1.default(0x0)),
                    new erdjs_1.BigUIntValue(txFees),
                    new erdjs_1.BytesValue(Buffer.from("withdrawBatchNft", "ascii")),
                    new erdjs_1.U64Value(new bignumber_js_1.default(chainNonce)),
                    new erdjs_1.BytesValue(Buffer.from(to, "ascii")),
                ])
                    .build(),
            });
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), nfts.map((n) => n.uri), await extractAction(tx));
            return tx;
        },
        async transferNftBatchToForeign(sender, chainNonce, to, nfts, mintWith, txFees) {
            const txu = new erdjs_1.Transaction({
                receiver: await getAddress(sender),
                gasLimit: new erdjs_1.GasLimit(50000000 + 5000000 * nfts.length),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("MultiESDTNFTTransfer"))
                    .setArgs([
                    new erdjs_1.AddressValue(mintContract),
                    new erdjs_1.BigUIntValue(new bignumber_js_1.default(nfts.length + 1)),
                    ...nfts.flatMap((nft) => [
                        new erdjs_1.TokenIdentifierValue(Buffer.from(tokenIdentReal(nft.native.tokenIdentifier), "utf-8")),
                        new erdjs_1.U64Value(new bignumber_js_1.default(nft.native.nonce)),
                        new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)),
                    ]),
                    new erdjs_1.TokenIdentifierValue(esdtSwaphex),
                    new erdjs_1.U64Value(new bignumber_js_1.default(0x0)),
                    new erdjs_1.BigUIntValue(txFees),
                    new erdjs_1.BytesValue(Buffer.from("freezeSendBatchNft", "ascii")),
                    new erdjs_1.U64Value(new bignumber_js_1.default(chainNonce)),
                    new erdjs_1.BytesValue(Buffer.from(to, "ascii")),
                    new erdjs_1.BytesValue(Buffer.from(mintWith, "ascii")),
                ])
                    .build(),
            });
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), nfts.map((n) => n.uri), await extractAction(tx));
            return tx;
        },
        async estimateValidateTransferNftBatch(_, nfts) {
            return estimateGas(new bignumber_js_1.default(360000000 + 5000000 * nfts.length));
        },
        async estimateValidateUnfreezeNftBatch(_, nfts) {
            return estimateGas(new bignumber_js_1.default(340000000 + 5000000 * nfts.length));
        },
        async validateAddress(adr) {
            try {
                new erdjs_1.Address(adr);
                return await providerRest
                    .get(`/address/${adr}/esdt`)
                    .then((_) => true)
                    .catch((_) => false);
            }
            catch (_) {
                return false;
            }
        },
    };
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsZ0RBb0I4QjtBQUM5QixrREFBMEI7QUFDMUIsZ0VBQXFDO0FBQ3JDLG1DQVVpQjtBQUNqQiwwQkFVWTtBQVFaLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBTyxDQUNqQyxnRUFBZ0UsQ0FDakUsQ0FBQztBQUNGLE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0FBRTVDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBOEo1QyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLFlBQTBCO0lBRTFCLE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUQsTUFBTSxxQkFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDakUsTUFBTSxZQUFZLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUNoQyxPQUFPLEVBQUUsWUFBWSxDQUFDLFFBQVE7S0FDL0IsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxP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