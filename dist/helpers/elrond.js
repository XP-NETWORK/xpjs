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
function isEsdtNftInfo(maybe) {
    return maybe.creator != undefined && maybe.balance == "1";
}
;
/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt  Identifier of the ESDT Wrapper
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
const elrondHelperFactory = async (node_uri, minter_address, esdt, esdt_nft) => {
    const provider = new erdjs_1.ProxyProvider(node_uri);
    await erdjs_1.NetworkConfig.getDefault().sync(provider);
    const mintContract = new erdjs_1.Address(minter_address);
    const providerRest = axios_1.default.create({
        baseURL: node_uri
    });
    const esdtHex = Buffer.from(esdt, "utf-8");
    const esdtNftHex = Buffer.from(esdt_nft, "utf-8");
    const decoder = new TextDecoder();
    const syncAccount = async (signer) => {
        const account = new erdjs_1.Account(signer.getAddress());
        await account.sync(provider);
        return account;
    };
    const signAndSend = async (signer, tx) => {
        const acc = await syncAccount(signer);
        tx.setNonce(acc.nonce);
        await signer.sign(tx);
        try {
            await tx.send(provider);
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
            const res = await providerRest.get(uri).catch(e => err = e);
            if (err) {
                await new Promise(r => setTimeout(r, 3000));
                continue;
            }
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
        throw Error(`failed to query transaction exceeded 10 retries ${tx_hash}`);
    };
    const unsignedTransferTxn = (chain_nonce, to, value) => {
        return new erdjs_1.Transaction({
            receiver: mintContract,
            gasLimit: new erdjs_1.GasLimit(50000000),
            value: new erdjs_1.Balance(value.toString()),
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
    const unsignedTransferNftTxn = (chain_nonce, address, to, { token, nonce }) => {
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
                .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(chain_nonce)))
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
    async function getLockedNft({ token, nonce }) {
        const nfts = await listNft(minter_address);
        return nfts.get(`${token}-${nonce.toString()}`);
    }
    const rawNftDecoder = (nftDat) => {
        /// TokenLen(4 by), TokenIdent(TokenLen by), Nonce(8 by)
        /// BinaryCodec is broken for browsers. Decode manually :|
        if (nftDat.length < 12) {
            throw Error("not a wrapped nft");
        }
        const tokenLen = (new Uint32Array(nftDat.slice(0, 4).reverse()))[0];
        if (nftDat.length !== 12 + tokenLen) {
            throw Error("not a wrapped nft");
        }
        const token = decoder.decode(nftDat.slice(4, 4 + tokenLen));
        // TODO: Consider LO
        // tfw js can't convert be bytes to u64
        const nonce = (new Uint32Array(nftDat.slice(4 + tokenLen, 12 + tokenLen).reverse()))[0];
        return { token, nonce };
    };
    async function extractId(tx) {
        let err;
        await tx.awaitExecuted(provider).catch(e => err = e);
        if (err) {
            await new Promise(r => setTimeout(r, 3000));
            return extractId(tx);
        }
        const txr = await transactionResult(tx.getHash());
        const id = filterEventId(txr["smartContractResults"]);
        return [tx, id];
    }
    return {
        rawTxnResult: transactionResult,
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
        async balanceWrappedBatch(address, chain_nonces) {
            const esdts = Object.values(await listEsdt(address.toString()));
            const res = new Map(chain_nonces.map(v => [v, new bignumber_js_1.default(0)]));
            for (const esdt of esdts) {
                esdt.nonce && esdt.tokenIdentifier.startsWith(esdt.tokenIdentifier) && res.set(esdt.nonce, new bignumber_js_1.default(esdt.balance));
            }
            return res;
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            const txu = unsignedTransferTxn(chain_nonce, to, value);
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            const txu = unsignedUnfreezeTxn(chain_nonce, sender.getAddress(), to, value);
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
        },
        async transferNftToForeign(sender, chain_nonce, to, info) {
            const txu = unsignedTransferNftTxn(chain_nonce, sender.getAddress(), to, info);
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
        },
        async unfreezeWrappedNft(sender, to, nonce) {
            const txu = unsignedUnfreezeNftTxn(sender.getAddress(), to, nonce);
            const tx = await signAndSend(sender, txu);
            return await extractId(tx);
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
        getLockedNft,
        async setESDTRole(manager, token, target, roles) {
            const txu = unsignedSetESDTRoles(token, target, roles);
            await signAndSend(manager, txu);
        },
        decodeWrappedNft(raw_data) {
            if (!raw_data.attributes) {
                throw Error("can't decode chain nonce");
            }
            return {
                // TODO: CONSIDER ALL BE BYTES
                chain_nonce: js_base64_1.Base64.toUint8Array(raw_data.attributes)[0],
                data: js_base64_1.Base64.toUint8Array(raw_data.uris[0])
            };
        },
        async decodeUrlFromRaw(data) {
            const nft_info = rawNftDecoder(data);
            const locked = await getLockedNft(nft_info);
            if (locked === undefined) {
                throw Error("Not a wrapped nft");
            }
            return js_base64_1.Base64.atob(locked.uris[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsZ0RBaUI4QjtBQUM5QixrREFBMEI7QUFDMUIsZ0VBQXFDO0FBQ3JDLG1DQWNpQjtBQUNqQix5Q0FBbUM7QUFJbkMsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFPLENBQUMsZ0VBQWdFLENBQUMsQ0FBQztBQUN0RyxNQUFNLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztBQXNDNUMsU0FBUyxhQUFhLENBQUMsS0FBdUI7SUFDNUMsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQztBQUM1RCxDQUFDO0FBZ0RBLENBQUM7QUF1RkY7Ozs7Ozs7O0dBUUc7QUFDSSxNQUFNLG1CQUFtQixHQUtILEtBQUssRUFDaEMsUUFBZ0IsRUFDaEIsY0FBc0IsRUFDdEIsSUFBWSxFQUNaLFFBQWdCLEVBQ2hCLEVBQUU7SUFDRixNQUFNLFFBQVEsR0FBRyxJQUFJLHFCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsTUFBTSxxQkFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRCxNQUFNLFlBQVksR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxRQUFRO0tBQ2xCLENBQUMsQ0FBQztJQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELE1BQU0sT0FBTyxHQUFH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