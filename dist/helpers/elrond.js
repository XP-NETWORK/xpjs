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
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const NFT_TRANSFER_COST = new bignumber_js_1.default(45000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(45000000);
function isEsdtNftInfo(maybe) {
    return maybe.creator != undefined && maybe.balance == "1";
}
const elrondHelperFactory = async (elrondParams) => {
    const provider = new erdjs_1.ProxyProvider(elrondParams.node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(elrondParams.minter_address);
    const swapContract = new erdjs_1.Address(elrondParams.esdt_swap_address);
    const providerRest = axios_1.default.create({
        baseURL: elrondParams.node_uri,
    });
    const esdtHex = Buffer.from(elrondParams.esdt, "utf-8");
    const esdtNftHex = Buffer.from(elrondParams.esdt_nft, "utf-8");
    const esdtSwaphex = Buffer.from(elrondParams.esdt_swap, "utf-8");
    const decoder = new TextDecoder();
    const networkConfig = await provider.getNetworkConfig();
    const gasPriceModif = networkConfig.MinGasPrice.valueOf() *
        networkConfig.GasPriceModifier.valueOf();
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
            stx = await signer.signTransaction(tx);
        }
        if (signer instanceof erdjs_1.ExtensionProvider) {
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
    const doEgldSwap = async (sender, value) => {
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
        return tx;
    };
    const unsignedTransferTxn = (chain_nonce, to, value) => {
        return new erdjs_1.Transaction({
            receiver: mintContract,
            gasLimit: new erdjs_1.GasLimit(50000000),
            value: new erdjs_1.Balance(erdjs_1.Egld.getToken(), erdjs_1.Egld.getNonce(), new bignumber_js_1.default(value.toString())),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("freezeSend"))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(chain_nonce)))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
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
    const unsignedTransferNftTxn = (chain_nonce, address, to, { tokenIdentifier, nonce }, tx_fees) => {
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
                .build(),
        });
    };
    const unsignedUnfreezeNftTxn = (address, to, id, tx_fees) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(70000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("MultiESDTNFTTransfer"))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(2)))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtNftHex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(id)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(1)))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtSwaphex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(0x0)))
                .addArg(new erdjs_1.BigUIntValue(tx_fees))
                .addArg(new erdjs_1.BytesValue(Buffer.from("withdrawNft", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const unsignedUnfreezeTxn = (chain_nonce, address, to, value) => {
        return new erdjs_1.Transaction({
            receiver: address,
            gasLimit: new erdjs_1.GasLimit(50000000),
            data: erdjs_1.TransactionPayload.contractCall()
                .setFunction(new erdjs_1.ContractFunction("ESDTNFTTransfer"))
                .addArg(new erdjs_1.TokenIdentifierValue(esdtHex))
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(chain_nonce)))
                .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(value)))
                .addArg(new erdjs_1.AddressValue(mintContract))
                .addArg(new erdjs_1.BytesValue(Buffer.from("withdraw", "ascii")))
                .addArg(new erdjs_1.BytesValue(Buffer.from(to, "ascii")))
                .build(),
        });
    };
    const listEsdt = async (owner) => {
        const raw = await providerRest(`/address/${owner}/esdt`);
        const dat = raw.data.data.esdts;
        return dat;
    };
    async function listNft(owner) {
        const ents = Object.entries(await listEsdt(owner));
        const fmapCb = ([tok, info]) => {
            var _a;
            if (!isEsdtNftInfo(info)) {
                return [];
            }
            let sp = tok.split("-");
            let nonce = (_a = sp.pop()) !== null && _a !== void 0 ? _a : "";
            return [[`${sp.join("-")}-${parseInt(nonce, 16).toString()}`, info]];
        };
        return new Map(ents.flatMap(fmapCb));
    }
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
                .addArg(new erdjs_1.BytesValue(Buffer.from("canTransferNFTCreateRole", "ascii")))
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
    async function extractId(tx) {
        let err;
        await tx.awaitExecuted(provider).catch((e) => (err = e));
        if (err) {
            await new Promise((r) => setTimeout(r, 3000));
            return extractId(tx);
        }
        const txr = await transactionResult(tx.getHash());
        const id = filterEventId(txr["smartContractResults"]);
        return [tx, id.toString()];
    }
    function estimateGas(base_fees, cnt) {
        return base_fees.times((cnt + 1) * gasPriceModif); // assume execution takes about twice as much gas fees
    }
    async function getAddress(sender) {
        return new erdjs_1.Address(await sender.getAddress());
    }
    return {
        async balance(address) {
            const wallet = new erdjs_1.Account(new erdjs_1.Address(address));
            await wallet.sync(provider);
            return wallet.balance.valueOf();
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const esdts = Object.values(await listEsdt(address.toString()));
            const res = new Map(chain_nonces.map((v) => [v, new bignumber_js_1.default(0)]));
            for (const esdt of esdts) {
                esdt.nonce &&
                    esdt.tokenIdentifier.startsWith(esdt.tokenIdentifier) &&
                    res.set(esdt.nonce, new bignumber_js_1.default(esdt.balance));
            }
            return res;
        },
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            const txu = unsignedTransferTxn(chain_nonce, to, new bignumber_js_1.default(value.toString()).plus(txFees.toString()));
            const tx = await signAndSend(sender, txu);
            return tx.getHash().toString();
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            await doEgldSwap(sender, txFees);
            const txu = unsignedUnfreezeTxn(chain_nonce, await getAddress(sender), to, value);
            const tx = await signAndSend(sender, txu);
            return tx.getHash().toString();
        },
        doEgldSwap,
        async transferNftToForeign(sender, chain_nonce, to, info, txFees) {
            const txu = unsignedTransferNftTxn(chain_nonce, await getAddress(sender), to, info.native, new bignumber_js_1.default(txFees.toString()));
            const tx = await signAndSend(sender, txu);
            return tx.getHash().toString();
        },
        async unfreezeWrappedNft(sender, to, nft, txFees) {
            const txu = unsignedUnfreezeNftTxn(await getAddress(sender), to, nft.native.nonce, new bignumber_js_1.default(txFees.toString()));
            const tx = await signAndSend(sender, txu);
            return tx.getHash().toString();
        },
        unsignedIssueESDTNft,
        async issueESDTNft(sender, name, ticker, canFreeze = false, canWipe = false, canTransferNFTCreateRole = false) {
            const txu = unsignedIssueESDTNft(name, ticker, canFreeze, canWipe, canTransferNFTCreateRole);
            const tx = await signAndSend(sender, txu);
            const res = await transactionResult(tx.getHash());
            const tickerh = res["smartContractResults"][0].data.split("@")[2];
            return Buffer.from(tickerh, "hex").toString("utf-8");
        },
        async mintNft(owner, args) {
            const txu = unsignedMintNftTxn(await getAddress(owner), args);
            return await signAndSend(owner, txu);
        },
        async mintableEsdts(address) {
            const res = await providerRest.get(`/address/${address.toString()}/esdts-with-role/ESDTRoleNFTCreate`);
            return res.data["data"]["tokens"];
        },
        isWrappedNft(nft) {
            return (tokenIdentReal(nft.native.tokenIdentifier) === elrondParams.esdt_nft);
        },
        listNft,
        async setESDTRole(manager, token, target, roles) {
            const txu = unsignedSetESDTRoles(token, target, roles);
            await signAndSend(manager, txu);
        },
        getNonce() {
            return elrondParams.nonce;
        },
        async estimateValidateTransferNft(_toAddress, _nftUri) {
            return estimateGas(NFT_TRANSFER_COST, elrondParams.validators.length); // TODO: properly estimate NFT_TRANSFER_COST
        },
        async estimateValidateUnfreezeNft(_to, _nftUri) {
            return estimateGas(NFT_UNFREEZE_COST, elrondParams.validators.length); // TODO: properly estimate NFT_UNFREEZE_COST
        },
        wrapNftForTransfer(nft) {
            // Approximation for wrapping this nft
            const dataLen = 4 + tokenIdentReal(nft.native.tokenIdentifier).length + 4;
            return new Uint8Array(dataLen);
        },
        async validateAddress(adr) {
            try {
                new erdjs_1.Address(adr);
                return await providerRest.get(`/address/${adr}/esdt`)
                    .then(_ => true)
                    .catch(_ => false);
            }
            catch (_) {
                return false;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsZ0RBb0I4QjtBQUM5QixrREFBMEI7QUFDMUIsZ0VBQXFDO0FBQ3JDLG1DQVVpQjtBQWNqQixNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQU8sQ0FDakMsZ0VBQWdFLENBQ2pFLENBQUM7QUFDRixNQUFNLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztBQUU1QyxNQUFNLGlCQUFpQixHQUFHLElBQUksc0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRCxNQUFNLGlCQUFpQixHQUFHLElBQUksc0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQThCbEQsU0FBUyxhQUFhLENBQUMsS0FBdUI7SUFDNUMsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUM1RCxDQUFDO0FBMklNLE1BQU0sbUJBQW1CLEdBRUgsS0FBSyxFQUFFLFlBQTBCLEVBQUUsRUFBRTtJQUNoRSxNQUFNLFFBQVEsR0FBRyxJQUFJLHFCQUFhLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFELE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlELE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sWUFBWSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDaEMsT0FBTyxFQUFFLFlBQVksQ0FBQyxRQUFRO0tBQy9CLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0s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