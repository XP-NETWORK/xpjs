"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasperHelperFromKeys = exports.casperHelper = void 0;
const casper_js_sdk_1 = require("casper-js-sdk");
const src_1 = require("casper-cep78-js-client/dist/src");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const xpbridge_client_1 = require("xpbridge-client");
const consts_1 = require("../../consts");
const environment_1 = require("@pedrouid/environment");
const wait_1 = require("./wait");
const factory_1 = require("../../factory");
function getTokenIdentifier(nft) {
    if (nft.native.tokenId || nft.native.tokenHash) {
        return (nft.native.tokenId || nft.native.tokenHash);
    }
    throw new Error(`No Token Identifier found`);
}
function raise(msg) {
    throw new Error(msg);
}
async function casperHelper({ rpc, network, bridge, feeMargin, xpnft, umt, sig, nwl, notifier, }) {
    let client = new casper_js_sdk_1.CasperClient(rpc);
    let cep78Client = new src_1.CEP78Client(rpc, network);
    let bridgeClient = new xpbridge_client_1.XpBridgeClient(rpc, network);
    bridgeClient.setContractHash(bridge);
    const getBridgeOrUNS = async (collection) => {
        if (!nwl) {
            return bridge;
        }
        const cc = await notifier.getCollectionContract(collection, consts_1.Chain.CASPER);
        if (cc === "") {
            return bridge;
        }
        return cc;
    };
    async function isApprovedForMinter(_sender, nft, contract) {
        cep78Client.setContractHash(nft.native.contract_hash);
        const tid = getTokenIdentifier(nft);
        const result = (await cep78Client.contractClient
            .queryContractDictionary("approved", tid)
            .catch(() => undefined));
        if (result === undefined) {
            return false;
        }
        if (result.isNone()) {
            return false;
        }
        return (Buffer.from(result.data.unwrap().data.data)
            .toString("hex")
            .toLowerCase() === contract.split("-")[1].toLowerCase());
    }
    async function signWithCasperWallet(sender, deploy) {
        const address = await sender.getActivePublicKey();
        const signedDeployJson = await sender.sign(JSON.stringify(casper_js_sdk_1.DeployUtil.deployToJson(deploy)), address);
        const signedDeploy = casper_js_sdk_1.DeployUtil.setSignature(deploy, signedDeployJson.signature, casper_js_sdk_1.CLPublicKey.fromHex(address));
        const res = await client.putDeploy(signedDeploy).catch((e) => {
            console.log(e, "e in signWithCasperWallet");
            return "";
        });
        res && (await (0, wait_1.getDeploy)(client, res));
        return res;
    }
    //@ts-ignore
    const transferCSPR = async (signer) => {
        let deployParams = new casper_js_sdk_1.DeployUtil.DeployParams(casper_js_sdk_1.CLPublicKey.fromHex(await signer.getActivePublicKey()), network, 1, 1800000);
        const toPublicKey = casper_js_sdk_1.CLPublicKey.fromHex("020298a6a0009a97f5f1717056a77a7caf6d733c71508a4bb4fabc64469b9bee4a5b");
        const session = casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newTransfer("3000000000", toPublicKey, undefined, Math.floor(Math.random() * 10000000));
        const payment = casper_js_sdk_1.DeployUtil.standardPayment(100000000);
        const deploy = casper_js_sdk_1.DeployUtil.makeDeploy(deployParams, session, payment);
        if ((0, environment_1.isBrowser)()) {
            const hash = await signWithCasperWallet(signer, deploy);
            return hash;
        }
        const signed = await signer.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await signer.getActivePublicKey());
        const transfer = await client.deployFromJson(signed).unwrap().send(rpc);
        await (0, wait_1.getDeploy)(client, transfer);
        return transfer;
    };
    async function preTransfer(sender, nft, _, address) {
        const contract = await getBridgeOrUNS(nft.native.contract_hash);
        const wnft = await (0, factory_1.isWrappedNft)(nft, 39);
        if (!wnft.bool && !address && contract === bridge)
            return;
        let approveFor = address ?? contract;
        if (await isApprovedForMinter(sender, nft, approveFor)) {
            return undefined;
        }
        cep78Client.setContractHash(nft.native.contract_hash);
        const deploy = cep78Client.approve({
            operator: new casper_js_sdk_1.CLByteArray(Buffer.from(approveFor.split("-")[1], "hex")),
            tokenHash: nft.native.tokenHash,
            tokenId: nft.native.tokenId,
        }, "2000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
        if ((0, environment_1.isBrowser)()) {
            return signWithCasperWallet(sender, deploy);
        }
        const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
        const dep = client.deployFromJson(signed).unwrap();
        return await client.putDeploy(dep);
    }
    return {
        preTransfer,
        async validateAddress(adr) {
            try {
                casper_js_sdk_1.CLPublicKey.fromHex(adr);
                return true;
            }
            catch (e) {
                return false;
            }
        },
        convertToAccountHash(adr) {
            try {
                return Buffer.from(casper_js_sdk_1.CLPublicKey.fromHex(adr).toAccountHash()).toString("hex");
            }
            catch {
                return "";
            }
        },
        async mintNft(owner, options) {
            cep78Client.setContractHash(options.contract ?? umt);
            const address = await owner.getActivePublicKey();
            const deploy = cep78Client.mint({
                meta: {
                    token_uri: options.uri,
                },
                owner: casper_js_sdk_1.CLPublicKey.fromHex(address),
                collectionName: options.contract
                    ? options.collectionName
                    : "UserNftMinter",
            }, {
                useSessionCode: false,
            }, "15000000000", casper_js_sdk_1.CLPublicKey.fromHex(address));
            if ((0, environment_1.isBrowser)()) {
                return signWithCasperWallet(owner, deploy);
            }
            const signed = await owner.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await owner.getActivePublicKey());
            return casper_js_sdk_1.DeployUtil.deployFromJson(signed).unwrap().send(rpc);
        },
        isApprovedForMinter,
        getProvider() {
            return client;
        },
        setProxy(proxy) {
            rpc = proxy + rpc;
            client = new casper_js_sdk_1.CasperClient(rpc);
            cep78Client = new src_1.CEP78Client(rpc, network);
            bridgeClient = new xpbridge_client_1.XpBridgeClient(rpc, network);
            bridgeClient.setContractHash(bridge);
        },
        async estimateUserStoreDeploy() {
            return new bignumber_js_1.default("30000000000");
        },
        async estimateContractDeploy() {
            return new bignumber_js_1.default("30000000000");
        },
        toAccountHash(account) {
            return casper_js_sdk_1.CLPublicKey.fromHex(account).toAccountRawHashStr();
        },
        async estimateValidateTransferNft() {
            return new bignumber_js_1.default("30000000000");
        },
        XpNft: xpnft,
        async estimateValidateUnfreezeNft() {
            return new bignumber_js_1.default("30000000000");
        },
        getExtraFees() {
            return new bignumber_js_1.default("0");
        },
        async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
            const signature = await sig.casper(consts_1.Chain.CASPER, chain_nonce, to, id.collectionIdent, id.native.tokenId || id.native.tokenHash || raise("No Token Identifier"));
            let contract = await getBridgeOrUNS(id.native.contract_hash);
            if (contract === bridge) {
                try {
                    // await transferCSPR(sender);
                    const newc = await notifier.createCollectionContract(id.native.contract_hash, consts_1.Chain.CASPER, "ERC721");
                    contract = newc;
                }
                catch (e) {
                    console.log(`Failed to deploy store for casper collection: ${id.native.contract_hash}. Reason: ${e}`);
                }
            }
            let newPt = await preTransfer(sender, id, new bignumber_js_1.default(0), contract);
            newPt && (await (0, wait_1.getDeploy)(client, newPt));
            bridgeClient.setContractHash(contract);
            const deploy = bridgeClient.freezeNft({
                amt: signature.fees,
                chain_nonce,
                to,
                contract: id.native.contract_hash,
                mint_with: mintWith,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "35000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            if ((0, environment_1.isBrowser)()) {
                const hash = await signWithCasperWallet(sender, deploy);
                await notifier.notifyCasper(hash);
                return hash;
            }
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            const hash = await client.putDeploy(dep);
            await notifier.notifyCasper(hash);
            return hash;
        },
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            const signature = await sig.casper(consts_1.Chain.CASPER, nonce, to, id.collectionIdent, id.native.tokenId || id.native.tokenHash || raise("No Token Identifier"));
            const deploy = bridgeClient.withdrawNft({
                amt: signature.fees,
                chain_nonce: nonce,
                to,
                contract: id.native.contract_hash,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "35000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            if ((0, environment_1.isBrowser)()) {
                const hash = await signWithCasperWallet(sender, deploy);
                await notifier.notifyCasper(hash);
                return hash;
            }
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            const hash = await client.putDeploy(dep);
            await notifier.notifyCasper(hash);
            return hash;
        },
        getNonce() {
            return consts_1.Chain.CASPER;
        },
        async balance(address) {
            return new bignumber_js_1.default((await client.balanceOfByPublicKey(casper_js_sdk_1.CLPublicKey.fromHex(address))).toString());
        },
        getFeeMargin() {
            return feeMargin;
        },
    };
}
exports.casperHelper = casperHelper;
function CasperHelperFromKeys(keys) {
    return {
        async sign(deploy) {
            return casper_js_sdk_1.DeployUtil.deployToJson(casper_js_sdk_1.DeployUtil.deployFromJson(deploy).unwrap().sign([keys]));
        },
        disconnectFromSite() {
            throw new Error("Not implemented");
        },
        async getActivePublicKey() {
            return keys.publicKey.toHex();
        },
        getSelectedPublicKeyBase64() {
            throw new Error("Not implemented");
        },
        getVersion() {
            throw new Error("Not implemented");
        },
        isConnected() {
            throw new Error("Not implemented");
        },
        requestConnection() {
            throw new Error("Not implemented");
        },
        signMessage() {
            throw new Error("Not implemented");
        },
    };
}
exports.CasperHelperFromKeys = CasperHelperFromKeys;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvY2FzcGVyL2Nhc3Blci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFPdUI7QUFDdkIseURBQThEO0FBaUI5RCxnRUFBcUM7QUFJckMscURBQWlEO0FBQ2pELHlDQUFxQztBQUVyQyx1REFBa0Q7QUFDbEQsaUNBQW1DO0FBQ25DLDJDQUE2QztBQXNEN0MsU0FBUyxrQkFBa0IsQ0FBQyxHQUF1QjtJQUNqRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBVyxDQUFDO0tBQy9EO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxHQUFXO0lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsRUFDakMsR0FBRyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULEtBQUssRUFDTCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxRQUFRLEdBQ0s7SUFDYixJQUFJLE1BQU0sR0FBRyxJQUFJLDRCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsSUFBSSxXQUFXLEdBQUcsSUFBSSxpQkFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRCxJQUFJLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFckMsTUFBTSxj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