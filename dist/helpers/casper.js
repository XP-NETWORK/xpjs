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
const consts_1 = require("../consts");
const environment_1 = require("@pedrouid/environment");
function getTokenIdentifier(nft) {
    if (nft.native.tokenId || nft.native.tokenHash) {
        return (nft.native.tokenId || nft.native.tokenHash);
    }
    throw new Error(`No Token Identifier found`);
}
function raise(msg) {
    throw new Error(msg);
}
async function casperHelper({ rpc, network, bridge, feeMargin, xpnft, umt, sig, notifier, }) {
    let client = new casper_js_sdk_1.CasperClient(rpc);
    let cep78Client = new src_1.CEP78Client(rpc, network);
    let bridgeClient = new xpbridge_client_1.XpBridgeClient(rpc, network);
    bridgeClient.setContractHash(bridge);
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
        console.log(Buffer.from(result.data.unwrap().data.data).toString("hex"));
        return (Buffer.from(result.data.unwrap().data.data)
            .toString("hex")
            .toLowerCase() === bridge.split("-")[1].toLowerCase());
    }
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
                owner
                    .sign(JSON.stringify(casper_js_sdk_1.DeployUtil.deployToJson(deploy)), address)
                    .then(async (signedDeployJson) => {
                    const signedDeploy = casper_js_sdk_1.DeployUtil.setSignature(deploy, signedDeployJson.signature, casper_js_sdk_1.CLPublicKey.fromHex(address));
                    return await client.putDeploy(signedDeploy);
                });
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
            const deploy = bridgeClient.freezeNft({
                amt: signature.fee,
                chain_nonce,
                to,
                contract: id.native.contract_hash,
                mint_with: mintWith,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "35000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            const hash = await client.putDeploy(dep);
            await notifier.notifyCasper(hash);
            return hash;
        },
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            const signature = await sig.casper(consts_1.Chain.CASPER, nonce, to, id.collectionIdent, id.native.tokenId || id.native.tokenHash || raise("No Token Identifier"));
            const deploy = bridgeClient.withdrawNft({
                amt: signature.fee,
                chain_nonce: nonce,
                to,
                contract: id.native.contract_hash,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "35000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2FzcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGlEQU91QjtBQUN2Qix5REFBOEQ7QUFnQjlELGdFQUFxQztBQUlyQyxxREFBaUQ7QUFDakQsc0NBQWtDO0FBRWxDLHVEQUFrRDtBQWlEbEQsU0FBUyxrQkFBa0IsQ0FBQyxHQUF1QjtJQUNqRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBVyxDQUFDO0tBQy9EO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxHQUFXO0lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsRUFDakMsR0FBRyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULEtBQUssRUFDTCxHQUFHLEVBQ0gsR0FBRyxFQUNILFFBQVEsR0FDSztJQUNiLElBQUksTUFBTSxHQUFHLElBQUksNEJBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxJQUFJLFdBQVcsR0FBRyxJQUFJLGlCQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELElBQUksWUFBWSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQyxLQUFLLFVBQVUsbUJBQW1CLENBQ2hDLE9BQXlCLEVBQ3pCLEdBQXVCO1FBRXZCLFdBQVcs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