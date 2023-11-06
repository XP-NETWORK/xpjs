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
    async function isApprovedForMinter(_sender, nft) {
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
            .toLowerCase() === bridge.split("-")[1].toLowerCase());
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
    const transferCSPR = async (signer) => {
        let deployParams = new casper_js_sdk_1.DeployUtil.DeployParams(casper_js_sdk_1.CLPublicKey.fromHex(await signer.getActivePublicKey()), network, 1, 1800000);
        const toPublicKey = casper_js_sdk_1.CLPublicKey.fromHex("020298a6a0009a97f5f1717056a77a7caf6d733c71508a4bb4fabc64469b9bee4a5b");
        const session = casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newTransfer("3000000000", toPublicKey, null, Math.floor(Math.random() * 10000000));
        const payment = casper_js_sdk_1.DeployUtil.standardPayment(100000000);
        const deploy = casper_js_sdk_1.DeployUtil.makeDeploy(deployParams, session, payment);
        if ((0, environment_1.isBrowser)()) {
            const hash = await signWithCasperWallet(signer, deploy);
            await notifier.notifyCasper(hash);
            return hash;
        }
        const signed = await signer.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await signer.getActivePublicKey());
        const transfer = await client.deployFromJson(signed).unwrap().send(rpc);
        await (0, wait_1.getDeploy)(client, transfer);
        return transfer;
    };
    return {
        async validateAddress(adr) {
            try {
                casper_js_sdk_1.CLPublicKey.fromHex(adr);
                return true;
            }
            catch (e) {
                return false;
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
                    transferCSPR(sender);
                    const newc = await notifier.createCollectionContract(id.native.contract_hash, chain_nonce, "ERC721");
                    contract = newc;
                }
                catch (e) {
                    console.log(`Failed to deploy store for casper collection: ${id.native.contract_hash}. Reason: ${e}`);
                }
            }
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
        async preTransfer(sender, nft) {
            if (await isApprovedForMinter(sender, nft)) {
                return undefined;
            }
            cep78Client.setContractHash(nft.native.contract_hash);
            const deploy = cep78Client.approve({
                operator: new casper_js_sdk_1.CLByteArray(Buffer.from(bridge.split("-")[1], "hex")),
                tokenHash: nft.native.tokenHash,
                tokenId: nft.native.tokenId,
            }, "2000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            if ((0, environment_1.isBrowser)()) {
                return signWithCasperWallet(sender, deploy);
            }
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            return await client.putDeploy(dep);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvY2FzcGVyL2Nhc3Blci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpREFPdUI7QUFDdkIseURBQThEO0FBaUI5RCxnRUFBcUM7QUFJckMscURBQWlEO0FBQ2pELHlDQUFxQztBQUVyQyx1REFBa0Q7QUFDbEQsaUNBQW1DO0FBbURuQyxTQUFTLGtCQUFrQixDQUFDLEdBQXVCO0lBQ2pELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFXLENBQUM7S0FDL0Q7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQVc7SUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxFQUNqQyxHQUFHLEVBQ0gsT0FBTyxFQUNQLE1BQU0sRUFDTixTQUFTLEVBQ1QsS0FBSyxFQUNMLEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILFFBQVEsR0FDSztJQUNiLElBQUksTUFBTSxHQUFHLElBQUksNEJBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxJQUFJLFdBQVcsR0FBRyxJQUFJLGlCQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELElBQUksWUFBWSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQyxNQUFNLGNBQWMsR0FBRyxLQUFL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