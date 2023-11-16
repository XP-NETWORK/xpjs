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
const __1 = require("../..");
const sdk_core_1 = require("@multiversx/sdk-core");
//import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("../chain");
const js_base64_1 = require("js-base64");
const v3Bridge_abi_json_1 = __importDefault(require("./v3Bridge_abi.json"));
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const NFT_TRANSFER_COST = new bignumber_js_1.default(350000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(350000000);
const DEFAULT_V3_ROYALTY_RECEIVER = "2130d2c16f919f634de847801cdccefbbc1f89bdd2524d5b6b94edbf821b2b00";
const DEFAULT_V3_ROYALTY = "1000";
async function elrondHelperFactory(elrondParams) {
    const provider = new erdjs_1.ProxyProvider(elrondParams.node_uri);
    //const proxyNetworkProvider = new ProxyNetworkProvider(elrondParams.node_uri);
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
    const bridgeAddress = new erdjs_1.Address(elrondParams.v3_bridge);
    const abiRegistry = sdk_core_1.AbiRegistry.create(v3Bridge_abi_json_1.default);
    const bridgeContract = new sdk_core_1.SmartContract({
        address: bridgeAddress,
        abi: abiRegistry,
    });
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
        if (signer.signTransactions) {
            const wcSigenr = signer;
            const address = (await signer.getAddress());
            const res = await (await (0, axios_1.default)(`https://gateway.multiversx.com/address/${address}/nonce`)).data;
            const payload = new sdk_core_1.Transaction({
                chainID: wcSigenr.chainId,
                sender: new sdk_core_1.Address(address),
                data: tx.getData(),
                gasLimit: tx.getGasLimit(),
                receiver: tx.getReceiver(),
                value: tx.getValue(),
                nonce: new erdjs_1.Nonce(res.data.nonce),
            });
            const txs = await wcSigenr.signTransactions([payload]);
            stx = txs[0];
            await provider.sendTransaction(stx);
            return stx;
        }
        else if (signer instanceof erdjs_1.ExtensionProvider) {
            stx = await signer.signTransaction(tx);
        }
        else if (signer instanceof erdjs_1.UserSigner) {
            await signer.sign(tx);
            stx = tx;
        }
        else {
            //@ts-ignore
            stx = await signer.signTransaction(tx);
        }
        try {
            await stx.send(provider);
        }
        catch (e) {
            if (e.message.includes("lowerNonceInTx")) {
                throw (0, chain_1.ConcurrentSendError)();
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
                gasLimit: new erdjs_1.GasLimit(300000000),
                value: new erdjs_1.Balance(erdjs_1.Egld.getToken(), erdjs_1.Egld.getNonce(), new bignumber_js_1.default(value.toString()) //.div(3)
                ),
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
            .addArg(new erdjs_1.BigUIntValue(new bignumber_js_1.default(quantity ?? 1)))
            .addArg(new erdjs_1.BytesValue(Buffer.from(name, "utf-8")))
            .addArg(new erdjs_1.U64Value(new bignumber_js_1.default(royalties ?? 0)))
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
            gasLimit: new erdjs_1.GasLimit(300000000),
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
            gasLimit: new erdjs_1.GasLimit(300000000),
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
        getNonce: () => elrondParams.nonce,
        async balance(address) {
            const wallet = new erdjs_1.Account(new erdjs_1.Address(address));
            await wallet.sync(provider);
            return wallet.balance.valueOf();
        },
        async isContractAddress(address) {
            return erdjs_1.Address.fromString(address).isContractAddress();
        },
        getFeeMargin() {
            return elrondParams.feeMargin;
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
            await notifyValidator(tx, (await sender.getAddress()).toString(), [info.uri], undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async unfreezeWrappedNft(sender, to, nft, txFees, nonce) {
            console.log(`Unfreezing`);
            const txu = unsignedUnfreezeNftTxn(await getAddress(sender), to, nft.native, new bignumber_js_1.default(txFees.toString()), nonce);
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, (await sender.getAddress()).toString(), [nft.uri], undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async issueESDTNft(sender, name, ticker, canFreeze = false, canWipe = false, canTransferNFTCreateRole = false) {
            const txu = unsignedIssueESDTNft(name, ticker, canFreeze, canWipe, canTransferNFTCreateRole);
            const tx = await signAndSend(sender, txu);
            const res = await transactionResult(tx.getHash());
            const result = res["smartContractResults"].find((e) => e.data.startsWith("@"));
            const tickerh = result.data.split("@")[2];
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
            await notifyValidator(tx, (await sender.getAddress()).toString(), nfts.map((n) => n.uri), undefined
            // await extractAction(tx)
            );
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
            await notifyValidator(tx, (await sender.getAddress()).toString(), nfts.map((n) => n.uri), undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async wegldBalance(addr) {
            const esdtInfo = await provider.getAddressEsdt(new erdjs_1.Address(addr), elrondParams.esdt_swap);
            return new bignumber_js_1.default(esdtInfo.balance);
        },
        async unwrapWegld(sender, amount) {
            const txu = new erdjs_1.Transaction({
                receiver: swapContract,
                gasLimit: new erdjs_1.GasLimit(300500000),
                data: erdjs_1.TransactionPayload.contractCall()
                    .setFunction(new erdjs_1.ContractFunction("ESDTTransfer"))
                    .addArg(new erdjs_1.TokenIdentifierValue(esdtSwaphex))
                    .addArg(new erdjs_1.U64Value(amount))
                    .addArg(new erdjs_1.BytesValue(Buffer.from("unwrapEgld")))
                    .build(),
            });
            const tx = await signAndSend(sender, txu);
            return tx.getHash().toString();
        },
        async estimateValidateTransferNftBatch(_, nfts) {
            return estimateGas(new bignumber_js_1.default(360000000 + 5000000 * nfts.length));
        },
        async estimateValidateUnfreezeNftBatch(_, nfts) {
            return estimateGas(new bignumber_js_1.default(340000000 + 5000000 * nfts.length));
        },
        validateAddress(adr, options) {
            try {
                new erdjs_1.Address(adr);
                if (options?.apiValidation) {
                    return providerRest
                        .get(`/address/${adr}/esdt`)
                        .then((_) => true)
                        .catch((_) => false);
                }
                return true;
            }
            catch (_) {
                return false;
            }
        },
        async getTokenURI(_, tokenId) {
            if (tokenId) {
                const url = `https://api.elrond.com/nfts/${tokenId}`;
                const res = await (0, axios_1.default)(url).catch(() => ({ data: null }));
                if (res.data?.metadata) {
                    return url;
                }
                const uri = res.data?.uris[1] || res.data?.uris[0];
                if (uri) {
                    return js_base64_1.Base64.decode(uri);
                }
            }
            return "";
        },
        async getTokenInfo(depTrxData) {
            const nftData = (await (0, axios_1.default)(`${elrondParams.elrondApi}/nfts/${depTrxData.tokenId}`).catch(() => undefined))?.data;
            return {
                metadata: js_base64_1.Base64.decode(nftData?.uris?.at(1) || ""),
                name: depTrxData.sourceNftContractAddress,
                symbol: depTrxData.sourceNftContractAddress,
                image: js_base64_1.Base64.decode(nftData?.uris?.at(0) || ""),
                royalty: "",
            };
        },
        async getClaimData(hash, helpers) {
            const sourceNonce = Array.from(__1.CHAIN_INFO.values()).find((c) => c.v3_chainId === "MULTIVERSX")?.nonce;
            if (!sourceNonce) {
                throw new Error("Source chain is undefined");
            }
            console.log(sourceNonce, "sourceNonce in elrond");
            const sourceChain = helpers.get(sourceNonce);
            const data = (await (0, axios_1.default)(`${elrondParams.elrondApi}/transaction/${hash}`).catch(() => undefined))?.data?.data?.transaction?.data;
            if (!data) {
                throw new Error("Failed to get Multiversex trx data");
            }
            const decodedData = js_base64_1.Base64.decode(data).split("@");
            const decoded = {
                destinationChain: Buffer.from(decodedData.at(7), "hex").toString(),
                destinationUserAddress: Buffer.from(decodedData.at(8) || "", "hex").toString(),
                nftType: Buffer.from(decodedData.at(5) || "lock721", "hex").toString() ===
                    "lock721"
                    ? "singular"
                    : "multiple",
                sourceChain: "MULTIVERSX",
                sourceNftContractAddress: Buffer.from(decodedData.at(9) || "", "hex").toString(),
                tokenAmount: decodedData.at(3) || "",
                tokenId: Buffer.from(decodedData.at(6) || "", "hex").toString(),
            };
            const tokenInfo = await sourceChain.getTokenInfo(decoded);
            return {
                ...tokenInfo,
                destinationChain: "BSC",
                destinationUserAddress: "0xFe6bcdF43396A774836D98332d9eD5dA945f687e",
                nftType: "singular",
                sourceChain: "MULTIVERSX",
                sourceNftContractAddress: "ALX-afef0b",
                symbol: "ALX-afef0b",
                tokenAmount: "1",
                tokenId: "ALX-afef0b-09",
            };
        },
        async lockNFT(signer, toChain, id, receiver) {
            let collectionIdentifiers = "@" + Buffer.from(id.collectionIdent).toString("hex");
            let noncec = "@" + id.native.tokenIdentifier.split("-").at(2);
            let quantity = "@" + "01";
            let destination_address = "@" + bridgeAddress.hex();
            let method = "@" + Buffer.from("lock721").toString("hex");
            let token_id = "@" + Buffer.from(id.native.tokenIdentifier).toString("hex");
            let destination_chain = "@" + Buffer.from(toChain).toString("hex");
            let destination_user_address = "@" + Buffer.from(receiver).toString("hex");
            let source_nft_contract_address = collectionIdentifiers;
            const senderAddress = (await signer.getAddress());
            const sender = new sdk_core_1.Address(senderAddress);
            const trx = new sdk_core_1.Transaction({
                data: new sdk_core_1.TransactionPayload("ESDTNFTTransfer" +
                    collectionIdentifiers +
                    noncec +
                    quantity +
                    destination_address +
                    method +
                    token_id +
                    destination_chain +
                    destination_user_address +
                    source_nft_contract_address +
                    noncec),
                gasLimit: 600000000,
                sender,
                receiver: sender,
                chainID: signer.chainId || "1",
            });
            const account = new sdk_core_1.Account(sender);
            account.update(await provider.getAccount(new erdjs_1.Address(senderAddress)));
            trx.setNonce(account.nonce);
            const txs = await signer.signTransaction(trx);
            await provider.sendTransaction(txs);
            return txs;
        },
        async claimV3NFT(signer, helpers, from, transactionHash, storageContract, initialClaimData) {
            const [claimDataRes] = await Promise.allSettled([
                // bridge.validatorsCount(),
                from.getClaimData(transactionHash, helpers),
            ]);
            if (claimDataRes.status === "rejected") {
                throw new Error("Failed to get claimData from dep chain");
            }
            const claimData = claimDataRes.value;
            initialClaimData.royaltyReceiver =
                initialClaimData.royaltyReceiver || DEFAULT_V3_ROYALTY_RECEIVER;
            console.log({ ...claimData, ...initialClaimData, transactionHash }, "claim data");
            const structClaimData = new sdk_core_1.StructType("ClaimData", [
                new sdk_core_1.FieldDefinition("token_id", "name of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("source_chain", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("destination_chain", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("destination_user_address", "attributes of the nft", new sdk_core_1.AddressType()),
                new sdk_core_1.FieldDefinition("source_nft_contract_address", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("name", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("symbol", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("royalty", "attributes of the nft", new sdk_core_1.BigUIntType()),
                new sdk_core_1.FieldDefinition("royalty_receiver", "attributes of the nft", new sdk_core_1.AddressType()),
                new sdk_core_1.FieldDefinition("attrs", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("transaction_hash", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("token_amount", "attributes of the nft", new sdk_core_1.BigUIntType()),
                new sdk_core_1.FieldDefinition("nft_type", "attributes of the nft", new sdk_core_1.BytesType()),
                new sdk_core_1.FieldDefinition("fee", "attributes of the nft", new sdk_core_1.BigUIntType()),
            ]);
            const structSigInfo = new sdk_core_1.StructType("SignatureInfo", [
                new sdk_core_1.FieldDefinition("public_key", "attributes of the nft", new sdk_core_1.AddressType()),
                new sdk_core_1.FieldDefinition("sig", "attributes of the nft", new sdk_core_1.BytesType()),
            ]);
            let claimDataArgs = new sdk_core_1.Struct(structClaimData, [
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(Number(claimData.tokenId).toString(16), "hex")), "token_id"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.sourceChain)), "source_chain"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.destinationChain)), "destination_chain"),
                new sdk_core_1.Field(new sdk_core_1.AddressValue(new erdjs_1.Address(claimData.destinationUserAddress)), "destination_user_address"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.sourceNftContractAddress)), "source_nft_contract_address"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.name)), "name"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.symbol)), "symbol"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(DEFAULT_V3_ROYALTY), "royalty"),
                new sdk_core_1.Field(new sdk_core_1.AddressValue(new erdjs_1.Address(initialClaimData.royaltyReceiver)), "royalty_receiver"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from("v4t/1")), "attrs"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(transactionHash)), "transaction_hash"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(claimData.tokenAmount), "token_amount"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.nftType)), "nft_type"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(new bignumber_js_1.default(initialClaimData.fee)), "fee"),
            ]);
            //let binaryCodec = new BinaryCodec();
            /*let signedMsg = await (
                  let hassh = Buffer.from(
                      keccak256(binaryCodec.encodeNested(claimDataArgs))
                  );
      
                  /*let signedMsg = await (
                      signer as XExtensionProvider
                  ).signMessage(
                      new SignableMessage({
                          message: hassh,
                      })
                  );
                 */
            const address = new erdjs_1.Address(await signer.getAddress());
            /*let query = bridgeContract.createQuery({
              func: "validators",
              caller: address,
              args: [new XAddressValue(bridgeAddress)],
            });
      
                  const queryResponse = await provider.queryContract({
                      caller: address,
                      args: [new AddressValue(bridgeAddress)],
                      func: new ContractFunction("validators"),
                      address: bridgeAddress,
                      value: Balance.Zero(),
                      toHttpRequest: () => {},
                  });
                  console.log(queryResponse);
                  //const tokensDefinition = bridgeContract.getEndpoint("validators");
      
                  /*const { firstValue } = new ResultsParser().parseQueryResponse(
              queryResponse,
              tokensDefinition
            );
            console.log(firstValue?.valueOf(), "fis");*/
            const signatures = await storageContract.getLockNftSignatures(transactionHash, __1.CHAIN_INFO.get(from.getNonce())?.v3_chainId);
            console.log(signatures, "signatures");
            const signatureArgs = signatures.map((s) => {
                return new sdk_core_1.Struct(structSigInfo, [
                    new sdk_core_1.Field(new sdk_core_1.AddressValue(address), "public_key"),
                    new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(s.signature || "", "hex")), "sig"),
                ]);
            });
            const image = (await (0, axios_1.default)(claimData.metadata).catch(() => undefined))?.data?.image ||
                "";
            console.log(image, "image");
            const data = [
                claimDataArgs,
                signatureArgs,
                sdk_core_1.VariadicValue.fromItems(new sdk_core_1.BytesValue(Buffer.from(claimData.image || "", "utf-8")), new sdk_core_1.BytesValue(Buffer.from(claimData.metadata, "utf-8"))),
            ];
            const trx = bridgeContract.methods
                .claimNft721(data)
                .withSender(address)
                .withChainID(signer.chainId)
                .withGasLimit(600000000)
                .withValue(new bignumber_js_1.default("50000000000000000"))
                .buildTransaction();
            const account = new sdk_core_1.Account(address);
            account.update(await provider.getAccount(address));
            trx.setNonce(account.nonce);
            const txs = await signer.signTransaction(trx);
            await provider.sendTransaction(txs);
            return txs;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kL2Vscm9uZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7R0FLRztBQUNILGdEQXNCOEI7QUFFOUIsNkJBQW1DO0FBRW5DLG1EQXFCOEI7QUFNOUIsMkVBQTJFO0FBRTNFLGtEQUEwQjtBQUMxQixnRUFBcUM7QUFDckMsb0NBbUJrQjtBQWNsQix5Q0FBbUM7QUFDbkMsNEVBQXNDO0FBY3RDLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBTyxDQUNqQyxnRUFBZ0UsQ0FDakUsQ0FBQztBQUNGLE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDO0FBRTVDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sMkJBQTJCLEdBQy9CLGtFQUFrRSxDQUFDO0FBQ3JFLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDO0FBdUszQixLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLFlBQTBCO0lBRTFCLE1BQU0sUUFBUSxHQUFHLElBQUkscUJBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUQsK0VBQStFO0lBQy9FLE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlELE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sWUFBWSxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDaEMsT0FBTyxFQUFFLFlBQVksQ0FBQyxRQUFRO0tBQy9C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