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
const primitives_1 = require("@multiversx/sdk-network-providers/out/primitives");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("../chain");
const js_base64_1 = require("js-base64");
const v3Bridge_abi_json_1 = __importDefault(require("./v3Bridge_abi.json"));
const multiversex_1 = require("../../services/multiversex");
const ESDT_ISSUE_ADDR = new erdjs_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const NFT_TRANSFER_COST = new bignumber_js_1.default(350000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(350000000);
const DEFAULT_V3_ROYALTY_RECEIVER = "2130d2c16f919f634de847801cdccefbbc1f89bdd2524d5b6b94edbf821b2b00";
async function elrondHelperFactory(elrondParams) {
    const provider = new erdjs_1.ProxyProvider(elrondParams.node_uri);
    const proxyNetworkProvider = new sdk_network_providers_1.ProxyNetworkProvider(elrondParams.node_uri);
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
    const multiversexApiService = (0, multiversex_1.multiversexService)(elrondParams.elrondApi, elrondParams.elrondIndex);
    let cachedV3ContractMapping = await queryMappedV3Contracts().catch(() => undefined);
    async function queryMappedV3Contracts() {
        setTimeout(() => {
            cachedV3ContractMapping = undefined;
        }, 60000);
        const queryResponse = await proxyNetworkProvider.queryContract(bridgeContract.createQuery({
            func: "originalToDuplicateMapping",
            args: [],
        }));
        const def = bridgeContract.getEndpoint("originalToDuplicateMapping");
        const { firstValue } = new sdk_core_1.ResultsParser().parseQueryResponse(queryResponse, def);
        return firstValue?.valueOf();
    }
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
            console.log(depTrxData, "depTrxData");
            const nftData = await multiversexApiService.getTokenInfo(depTrxData.sourceNftContractAddress, Number(depTrxData.tokenId).toString(16));
            const collectionData = await multiversexApiService.getCollectionInfo(depTrxData.sourceNftContractAddress);
            console.log(collectionData, "collectionData");
            return {
                metadata: js_base64_1.Base64.decode(nftData?.uris?.at(1) || ""),
                name: collectionData.name,
                symbol: depTrxData.sourceNftContractAddress,
                //image: Base64.decode(nftData?.uris?.at(0) || ""),
                royalty: String((nftData.royalties || 0) * 100),
            };
        },
        async getClaimData(hash, helpers) {
            try {
                const decoded = await multiversexApiService.getLockDecodedArgs(hash);
                const sourceNonce = Array.from(__1.CHAIN_INFO.values()).find((c) => c.v3_chainId === decoded.sourceChain)?.nonce;
                if (!sourceNonce) {
                    throw new Error("Source chain is undefined");
                }
                console.log(sourceNonce, "sourceNonce in elrond");
                const sourceChainHelper = helpers.get(sourceNonce);
                const tokenInfo = await sourceChainHelper.getTokenInfo(decoded);
                return {
                    ...tokenInfo,
                    ...decoded,
                };
            }
            catch (e) {
                console.log(e, "e");
                throw e;
            }
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
            /*const structSigInfo = new StructType("SignatureInfo", [
                      new FieldDefinition("public_key", "attributes of the nft", new AddressType()),
                      new FieldDefinition("sig", "attributes of the nft", new BytesType()),
                  ]);*/
            const claimDataArgs = new sdk_core_1.Struct(structClaimData, [
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(new primitives_1.Nonce(Number(claimData.tokenId)).hex(), "hex")), "token_id"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.sourceChain)), "source_chain"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.destinationChain)), "destination_chain"),
                new sdk_core_1.Field(new sdk_core_1.AddressValue(new erdjs_1.Address(claimData.destinationUserAddress)), "destination_user_address"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.sourceNftContractAddress)), "source_nft_contract_address"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.name)), "name"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from("N" + claimData.sourceChain.toUpperCase())), "symbol"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(Number(claimData.royalty)), "royalty"),
                new sdk_core_1.Field(new sdk_core_1.AddressValue(new erdjs_1.Address(initialClaimData.royaltyReceiver)), "royalty_receiver"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.metadata)), "attrs"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(transactionHash)), "transaction_hash"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(claimData.tokenAmount), "token_amount"),
                new sdk_core_1.Field(new sdk_core_1.BytesValue(Buffer.from(claimData.nftType)), "nft_type"),
                new sdk_core_1.Field(new sdk_core_1.BigUIntValue(initialClaimData.fee), "fee"),
            ]);
            const address = new sdk_core_1.Address((await signer.getAddress()));
            const signatures = await storageContract.getLockNftSignatures(transactionHash, __1.CHAIN_INFO.get(from.getNonce())?.v3_chainId);
            console.log(signatures, "signatures");
            const image = (await (0, axios_1.default)(claimData.metadata).catch(() => undefined))?.data?.image ||
                "";
            console.log(image);
            const sigArgs = signatures.map((item) => {
                return {
                    sig: new sdk_core_1.BytesValue(Buffer.from(item.signature.replace("0x", ""), "hex")),
                    public_key: new sdk_core_1.AddressValue(new sdk_core_1.Address(Buffer.from(item.signerAddress, "hex"))),
                };
            });
            const data = [
                claimDataArgs,
                sigArgs,
                sdk_core_1.VariadicValue.fromItems(new sdk_core_1.BytesValue(Buffer.from(image, "utf-8")), new sdk_core_1.BytesValue(Buffer.from(claimData.metadata, "utf-8"))),
            ];
            const trx = bridgeContract.methods
                .claimNft721(data)
                .withSender(address)
                .withChainID(signer.chainId)
                .withGasLimit(600000000)
                .withValue(new bignumber_js_1.default("50000000000000000"))
                .buildTransaction();
            const account = new sdk_core_1.Account(address);
            account.update(await provider.getAccount(erdjs_1.Address.fromHex(address.hex())));
            trx.setNonce(account.nonce);
            const txs = await signer.signTransaction(trx);
            await provider.sendTransaction(txs);
            return txs;
        },
        async getNftOrigin(address) {
            const native = { origin: String(elrondParams.nonce) };
            const v3ContractMapping = cachedV3ContractMapping || (await queryMappedV3Contracts());
            if (!v3ContractMapping)
                return native;
            const decodedMapping = v3ContractMapping.map((pair) => {
                return pair.flatMap((item) => {
                    return Object.keys(item).map((key) => ({
                        [key]: Buffer.from(item[key]).toString(),
                    }));
                });
            });
            const pair = decodedMapping.find((item) => item.find((obj) => Object.values(obj)?.find((val) => val === address)));
            if (!pair)
                return native;
            return {
                origin: (0, __1.v3BridgeIdToNonce)(pair[1].field1),
                contract: pair[0].field0,
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kL2Vscm9uZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7R0FLRztBQUNILGdEQXNCOEI7QUFFOUIsNkJBQXNEO0FBRXRELG1EQW1COEI7QUFJOUIsaUZBQW1GO0FBQ25GLDZFQUF5RTtBQUN6RSxrREFBMEI7QUFDMUIsZ0VBQXFDO0FBQ3JDLG9DQWtCa0I7QUFlbEIseUNBQW1DO0FBQ25DLDRFQUFzQztBQUV0Qyw0REFBZ0U7QUFhaEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFPLENBQ2pDLGdFQUFnRSxDQUNqRSxDQUFDO0FBQ0YsTUFBTSxlQUFlLEdBQUcsbUJBQW1CLENBQUM7QUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkQsTUFBTSwyQkFBMkIsR0FDL0Isa0VBQWtFLENBQUM7QUEwSzlELEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsWUFBMEI7SUFFMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQkFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRCxNQUFNLG9CQUFvQixHQUFHLElBQUksNENBQW9CLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdFLE1BQU0scUJBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFPLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlELE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sWUFBWSxHQUFHLGVBQUssQ0FBQyxN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