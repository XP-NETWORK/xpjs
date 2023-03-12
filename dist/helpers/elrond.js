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
const sdk_core_1 = require("@multiversx/sdk-core");
const sdk_wallet_connect_provider_1 = require("@multiversx/sdk-wallet-connect-provider");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const sdk_extension_provider_1 = require("@multiversx/sdk-extension-provider");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("./chain");
const __1 = require("..");
const js_base64_1 = require("js-base64");
const out_1 = require("@multiversx/sdk-wallet/out");
const ESDT_ISSUE_ADDR = new sdk_core_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";
const NFT_TRANSFER_COST = new bignumber_js_1.default(350000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(350000000);
async function elrondHelperFactory(elrondParams) {
    const provider = new sdk_network_providers_1.ProxyNetworkProvider(elrondParams.node_uri);
    const config = await provider.getNetworkConfig();
    const mintContract = new sdk_core_1.Address(elrondParams.minter_address);
    const swapContract = new sdk_core_1.Address(elrondParams.esdt_swap_address);
    const swapCtr = new sdk_core_1.SmartContract({
        address: swapContract,
    });
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
        const account = new sdk_core_1.Account(await getAddress(signer));
        return account;
    };
    const signAndSend = async (signer, tx) => {
        const acc = await syncAccount(signer);
        tx.setNonce(acc.nonce);
        let stx;
        if (signer instanceof sdk_wallet_connect_provider_1.WalletConnectV2Provider) {
            const txs = await signer.signTransactions([tx]);
            stx = txs[0];
        }
        else if (signer instanceof sdk_extension_provider_1.ExtensionProvider) {
            stx = await signer.signTransaction(tx);
        }
        else if (signer instanceof out_1.UserSigner) {
            await signer.sign(tx);
            stx = tx;
        }
        else {
            //@ts-ignore
            stx = await signer.signTransaction(tx);
        }
        try {
            provider.sendTransaction(stx);
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
            const utx = swapCtr.call({
                chainID: config.ChainID,
                receiver: swapContract,
                gasLimit: 300000000,
                func: new sdk_core_1.ContractFunction("wrapEgld"),
                value: sdk_core_1.TokenPayment.egldFromAmount(value),
            });
            const tx = await signAndSend(sender, utx);
            await transactionResult(tx.getHash());
            return tx.getHash().toString();
        }
        return undefined;
    };
    const unsignedMintNftTxn = (owner, { identifier, quantity, name, royalties, hash, attrs, uris }) => {
        const ow = new sdk_core_1.SmartContract({ address: owner });
        const args = [
            new sdk_core_1.TokenIdentifierValue(identifier),
            new sdk_core_1.BigUIntValue(new bignumber_js_1.default(quantity ?? 1)),
            new sdk_core_1.BytesValue(Buffer.from(name, "utf-8")),
            new sdk_core_1.U64Value(new bignumber_js_1.default(royalties ?? 0)),
            new sdk_core_1.BytesValue(hash ? Buffer.from(hash, "utf-8") : Buffer.alloc(0)),
            new sdk_core_1.BytesValue(attrs ? Buffer.from(attrs, "utf-8") : Buffer.alloc(0)),
        ];
        for (const uri of uris) {
            args.push(new sdk_core_1.BytesValue(Buffer.from(uri, "utf-8")));
        }
        return ow.call({
            func: new sdk_core_1.ContractFunction("ESDTNFTCreate"),
            chainID: config.ChainID,
            gasLimit: 70000000,
            args,
            receiver: owner,
        });
    };
    function tokenIdentReal(tokenIdentifier) {
        const base = tokenIdentifier.split("-");
        base.pop();
        return base.join("-");
    }
    const unsignedTransferNftTxn = (chain_nonce, address, to, { tokenIdentifier, nonce }, tx_fees, mintWith) => {
        const ow = new sdk_core_1.SmartContract({ address });
        return ow.call({
            func: new sdk_core_1.ContractFunction("MultiESDTNFTTransfer"),
            chainID: config.ChainID,
            gasLimit: 300000000,
            args: [
                new sdk_core_1.AddressValue(mintContract),
                new sdk_core_1.BigUIntValue(new bignumber_js_1.default(2)),
                new sdk_core_1.TokenIdentifierValue(tokenIdentReal(tokenIdentifier)),
                new sdk_core_1.U64Value(new bignumber_js_1.default(nonce)),
                new sdk_core_1.BigUIntValue(new bignumber_js_1.default(1)),
                new sdk_core_1.TokenIdentifierValue(esdtSwaphex.toString("hex")),
                new sdk_core_1.U64Value(new bignumber_js_1.default(0x0)),
                new sdk_core_1.BigUIntValue(tx_fees),
                new sdk_core_1.BytesValue(Buffer.from("freezeSendNft", "ascii")),
                new sdk_core_1.U64Value(new bignumber_js_1.default(chain_nonce)),
                new sdk_core_1.BytesValue(Buffer.from(to, "ascii")),
                new sdk_core_1.BytesValue(Buffer.from(mintWith, "ascii")),
            ],
        });
    };
    const unsignedUnfreezeNftTxn = (address, to, { tokenIdentifier, nonce }, tx_fees, chain_nonce) => {
        const ow = new sdk_core_1.SmartContract({ address });
        return ow.call({
            func: new sdk_core_1.ContractFunction("MultiESDTNFTTransfer"),
            gasLimit: 300000000,
            chainID: config.ChainID,
            args: [
                new sdk_core_1.AddressValue(mintContract),
                new sdk_core_1.BigUIntValue(new bignumber_js_1.default(2)),
                new sdk_core_1.TokenIdentifierValue(tokenIdentReal(tokenIdentifier)),
                new sdk_core_1.U64Value(new bignumber_js_1.default(nonce)),
                new sdk_core_1.BigUIntValue(new bignumber_js_1.default(1)),
                new sdk_core_1.TokenIdentifierValue(esdtSwaphex.toString("hex")),
                new sdk_core_1.U64Value(new bignumber_js_1.default(0x0)),
                new sdk_core_1.BigUIntValue(tx_fees),
                new sdk_core_1.BytesValue(Buffer.from("withdrawNft", "ascii")),
                new sdk_core_1.U64Value(new bignumber_js_1.default(chain_nonce)),
                new sdk_core_1.BytesValue(Buffer.from(to, "ascii")),
            ],
        });
    };
    const listEsdt = async (owner) => {
        const raw = await providerRest(`/address/${owner}/esdt`);
        const dat = raw.data.data.esdts;
        return dat;
    };
    const unsignedIssueESDTNft = (name, ticker, canFreeze, canWipe, canTransferNFTCreateRole) => {
        const sc = new sdk_core_1.SmartContract({ address: ESDT_ISSUE_ADDR });
        return sc.call({
            func: new sdk_core_1.ContractFunction("issueNonFungible"),
            args: [
                new sdk_core_1.TokenIdentifierValue(name),
                new sdk_core_1.TokenIdentifierValue(ticker),
                new sdk_core_1.BytesValue(Buffer.from("canFreeze", "ascii")),
                new sdk_core_1.BytesValue(Buffer.from(canFreeze ? "true" : "false", "ascii")),
                new sdk_core_1.BytesValue(Buffer.from("canWipe", "ascii")),
                new sdk_core_1.BytesValue(Buffer.from(canWipe ? "true" : "false", "ascii")),
                new sdk_core_1.BytesValue(Buffer.from("canChangeOwner", "ascii")),
                new sdk_core_1.BytesValue(Buffer.from(canTransferNFTCreateRole ? "true" : "false", "ascii")),
            ],
            chainID: config.ChainID,
            gasLimit: 60000000,
            value: sdk_core_1.TokenPayment.egldFromAmount(ESDT_ISSUE_COST),
        });
    };
    const unsignedSetESDTRoles = (token, target, roles) => {
        const ow = new sdk_core_1.SmartContract({ address: ESDT_ISSUE_ADDR });
        const args = [new sdk_core_1.TokenIdentifierValue(token), new sdk_core_1.AddressValue(target)];
        for (const r of roles) {
            new sdk_core_1.BytesValue(Buffer.from(r, "utf-8"));
        }
        return ow.call({
            chainID: config.ChainID,
            func: new sdk_core_1.ContractFunction("setSpecialRole"),
            gasLimit: 70000000,
            args: args,
        });
    };
    async function extractAction(tx) {
        const tw = new sdk_core_1.TransactionWatcher(provider);
        let err;
        tw.awaitCompleted(tx).catch((e) => (err = e));
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
        return new sdk_core_1.Address(sender.getAddress().toString());
    }
    return {
        XpNft: elrondParams.esdt_nft,
        async balance(address) {
            const wallet = new sdk_core_1.Account(new sdk_core_1.Address(address));
            return new bignumber_js_1.default(wallet.balance.toString());
        },
        async isContractAddress(address) {
            return sdk_core_1.Address.fromString(address).isContractAddress();
        },
        getFeeMargin() {
            return elrondParams.feeMargin;
        },
        async extractTxnStatus(txn) {
            const status = await provider.getTransactionStatus(txn);
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
            await notifyValidator(tx, sender.getAddress().toString(), [info.uri], undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async unfreezeWrappedNft(sender, to, nft, txFees, nonce) {
            console.log(`Unfreezing`);
            const txu = unsignedUnfreezeNftTxn(await getAddress(sender), to, nft.native, new bignumber_js_1.default(txFees.toString()), nonce);
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), [nft.uri], undefined
            // await extractAction(tx)
            );
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
                const utx = swapCtr.call({
                    func: new sdk_core_1.ContractFunction("wrapEgld"),
                    chainID: config.ChainID,
                    gasLimit: 50000000,
                    value: sdk_core_1.TokenPayment.egldFromAmount(value),
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
            const ow = new sdk_core_1.SmartContract({
                address: new sdk_core_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
            });
            const txu = ow.call({
                func: new sdk_core_1.ContractFunction("transferOwnership"),
                args: [new sdk_core_1.TokenIdentifierValue(token), new sdk_core_1.AddressValue(target)],
                chainID: config.ChainID,
                gasLimit: 60000000,
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
            const sc = new sdk_core_1.SmartContract({ address: await getAddress(sender) });
            const txu = sc.call({
                func: new sdk_core_1.ContractFunction("MultiESDTNFTTransfer"),
                chainID: config.ChainID,
                gasLimit: 40000000 + 5000000 * nfts.length,
                args: [
                    new sdk_core_1.AddressValue(mintContract),
                    new sdk_core_1.BigUIntValue(new bignumber_js_1.default(nfts.length + 1)),
                    ...nfts.flatMap((nft) => [
                        new sdk_core_1.TokenIdentifierValue(esdtNftHex.toString("hex")),
                        new sdk_core_1.U64Value(new bignumber_js_1.default(nft.native.nonce)),
                        new sdk_core_1.BigUIntValue(new bignumber_js_1.default(1)),
                    ]),
                    new sdk_core_1.TokenIdentifierValue(esdtSwaphex.toString("hex")),
                    new sdk_core_1.U64Value(new bignumber_js_1.default(0x0)),
                    new sdk_core_1.BigUIntValue(txFees),
                    new sdk_core_1.BytesValue(Buffer.from("withdrawBatchNft", "ascii")),
                    new sdk_core_1.U64Value(new bignumber_js_1.default(chainNonce)),
                    new sdk_core_1.BytesValue(Buffer.from(to, "ascii")),
                ],
            });
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), nfts.map((n) => n.uri), undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async transferNftBatchToForeign(sender, chainNonce, to, nfts, mintWith, txFees) {
            const sc = new sdk_core_1.SmartContract({ address: await getAddress(sender) });
            const txu = sc.call({
                func: new sdk_core_1.ContractFunction("MultiESDTNFTTransfer"),
                args: [
                    new sdk_core_1.AddressValue(mintContract),
                    new sdk_core_1.BigUIntValue(new bignumber_js_1.default(nfts.length + 1)),
                    ...nfts.flatMap((nft) => [
                        new sdk_core_1.TokenIdentifierValue(tokenIdentReal(nft.native.tokenIdentifier)),
                        new sdk_core_1.U64Value(new bignumber_js_1.default(nft.native.nonce)),
                        new sdk_core_1.BigUIntValue(new bignumber_js_1.default(1)),
                    ]),
                    new sdk_core_1.TokenIdentifierValue(esdtSwaphex.toString("hex")),
                    new sdk_core_1.U64Value(new bignumber_js_1.default(0x0)),
                    new sdk_core_1.BigUIntValue(txFees),
                    new sdk_core_1.BytesValue(Buffer.from("freezeSendBatchNft", "ascii")),
                    new sdk_core_1.U64Value(new bignumber_js_1.default(chainNonce)),
                    new sdk_core_1.BytesValue(Buffer.from(to, "ascii")),
                    new sdk_core_1.BytesValue(Buffer.from(mintWith, "ascii")),
                ],
                chainID: config.ChainID,
                gasLimit: 50000000 + 5000000 * nfts.length,
            });
            const tx = await signAndSend(sender, txu);
            await notifyValidator(tx, sender.getAddress().toString(), nfts.map((n) => n.uri), undefined
            // await extractAction(tx)
            );
            return tx;
        },
        async wegldBalance(addr) {
            const esdtinfo = await provider.getFungibleTokensOfAccount(new sdk_core_1.Address(addr));
            for (const t of esdtinfo) {
                if (t.identifier === elrondParams.esdt_swap) {
                    new bignumber_js_1.default(t.balance);
                }
            }
            throw new Error(`No wEGLD balance`);
        },
        async unwrapWegld(sender, amount) {
            const txu = swapCtr.call({
                func: new sdk_core_1.ContractFunction("ESDTTransfer"),
                chainID: config.ChainID,
                args: [
                    new sdk_core_1.TokenIdentifierValue(esdtSwaphex.toString("hex")),
                    new sdk_core_1.U64Value(amount),
                    new sdk_core_1.BytesValue(Buffer.from("unwrapEgld")),
                ],
                gasLimit: 300500000,
                receiver: swapContract,
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
        async validateAddress(adr) {
            try {
                new sdk_core_1.Address(adr);
                return await providerRest
                    .get(`/address/${adr}/esdt`)
                    .then((_) => true)
                    .catch((_) => false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvZWxyb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7OztHQUtHO0FBQ0gsbURBYzhCO0FBQzlCLHlGQUFrRjtBQUVsRiw2RUFBMEY7QUFDMUYsK0VBQXVFO0FBQ3ZFLGtEQUEwQjtBQUMxQixnRUFBcUM7QUFDckMsbUNBY2lCO0FBQ2pCLDBCQVVZO0FBRVoseUNBQW1DO0FBQ25DLG9EQUF3RDtBQU14RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGtCQUFPLENBQ2pDLGdFQUFnRSxDQUNqRSxDQUFDO0FBQ0YsTUFBTSxlQUFlLEdBQUcsbUJBQW1CLENBQUM7QUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFtSzVDLEtBQUssVUFBVSxtQkFBbUIsQ0FDdkMsWUFBMEI7SUFFMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSw0Q0FBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxrQkFBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sT0FBTyxHQUFHLElBQUksd0JBQWEsQ0FBQztRQUNoQyxPQUFPLEVBQUUsWUFBWTtLQUN0QixDQUFDLENBQUM7SUFDSCxNQUFNLFlBQVksR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sRUFBRSxZQUFZLENBQUMsUUFBUTtLQUMvQixDQUFDLENBQUM7SUFDSCxN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