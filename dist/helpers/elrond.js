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
const js_base64_1 = require("js-base64");
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
        const account = new erdjs_1.Account(new erdjs_1.Address(await signer.getAddress()));
        await account.sync(provider);
        return account;
    };
    const signAndSend = async (signer, tx) => {
        const acc = await syncAccount(signer);
        tx.setNonce(acc.nonce);
        let stx;
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
        return tx;
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
    async function getLockedNft(ident) {
        const nfts = await listNft(elrondParams.minter_address);
        const res = nfts.get(ident);
        return (res && {
            uri: js_base64_1.Base64.atob(res.uris[0]),
            chainId: elrondParams.nonce.toString(),
        });
    }
    const rawNftDecoder = (nftDat) => {
        /// TokenLen(4 by), TokenIdent(TokenLen by), Nonce(8 by)
        /// BinaryCodec is broken for browsers. Decode manually :|
        if (nftDat.length < 12) {
            throw Error("not a wrapped nft");
        }
        const tokenLen = new Uint32Array(nftDat.slice(0, 4).reverse())[0];
        if (nftDat.length !== 12 + tokenLen) {
            throw Error("not a wrapped nft");
        }
        const token = decoder.decode(nftDat.slice(4, 4 + tokenLen));
        // TODO: Consider LO
        // tfw js can't convert be bytes to u64
        const nonce = new Uint32Array(nftDat.slice(4 + tokenLen, 12 + tokenLen).reverse())[0];
        return { token, nonce };
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
            return await extractId(tx);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            await doEgldSwap(sender, txFees);
            const txu = unsignedUnfreezeTxn(chain_nonce, sender.getAddress(), to, value);
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
        },
        async transferNftToForeign(sender, chain_nonce, to, info, txFees) {
            await doEgldSwap(sender, txFees);
            const txu = unsignedTransferNftTxn(chain_nonce, sender.getAddress(), to, info.native, new bignumber_js_1.default(txFees.toString()));
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
        },
        async unfreezeWrappedNft(sender, to, nft, txFees) {
            await doEgldSwap(sender, txFees);
            const txu = unsignedUnfreezeNftTxn(sender.getAddress(), to, nft.native.nonce, new bignumber_js_1.default(txFees.toString()));
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
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
            const txu = unsignedMintNftTxn(owner.getAddress(), args);
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
        decodeWrappedNft(nft) {
            if (!nft.native.attributes) {
                throw Error("can't decode chain nonce");
            }
            return {
                // TODO: CONSIDER ALL BE BYTES
                chain_nonce: js_base64_1.Base64.toUint8Array(nft.native.attributes[0])[0],
                data: js_base64_1.Base64.toUint8Array(nft.native.uris[0]),
            };
        },
        async decodeNftFromRaw(data) {
            const nft_info = rawNftDecoder(data);
            return {
                uri: "",
                native: {
                    balance: 1,
                    tokenIdentifier: `${nft_info.token}-${nft_info.nonce.toString(16)}`,
                    creator: "",
                    name: "",
                    nonce: nft_info.nonce,
                    royalties: "",
                    uris: [],
                },
            };
        },
        async populateNft(nft) {
            const locked = await getLockedNft(nft.native.tokenIdentifier);
            if (locked === undefined) {
                throw Error("Not a wrapped nft");
            }
            return locked;
        },
        async estimateValidateTransferNft(_toAddress, _nftInfo) {
            return estimateGas(NFT_TRANSFER_COST, elrondParams.validators.length); // TODO: properly estimate NFT_TRANSFER_COST
        },
        async estimateValidateUnfreezeNft(_to, _nft) {
            return estimateGas(NFT_UNFREEZE_COST, elrondParams.validators.length); // TODO: properly estimate NFT_UNFREEZE_COST
        },
        wrapNftForTransfer(nft) {
            // Approximation for wrapping this nft
            const dataLen = 4 + tokenIdentReal(nft.native.tokenIdentifier).length + 4;
            return new Uint8Array(dataLen);
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsZ0RBbUI4QjtBQUM5QixrREFBMEI7QUFDMUIsZ0VBQXFDO0FBQ3JDLG1DQWFpQjtBQUNqQix5Q0FBbUM7QUFhbkMsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFPLENBQ2pDLGdFQUFnRSxDQUNqRSxDQUFDO0FBQ0YsTUFBTSxlQUFlLEdBQUcsbUJBQW1CLENBQUM7QUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUE4QmxELFNBQVMsYUFBYSxDQUFDLEtBQXVCO0lBQzVDLE9BQU8sS0FBSyxDQUFDLE9BQU8sSUFBSSxTQUFTLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUM7QUFDNUQsQ0FBQztBQW1KTSxNQUFNLG1CQUFtQixHQUVILEtBQUssRUFBRSxZQUEwQixFQUFFLEVBQUU7SUFDaEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRCxNQUFNLHFCQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5RCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU8sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRSxNQUFNLFlBQVksR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxZQUFZLENBQUMsUUFBUTtLQUMvQixDQUFDLENBQUM7SUFDSCxNQUFNLE9B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