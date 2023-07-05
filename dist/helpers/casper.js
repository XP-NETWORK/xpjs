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
function getTokenIdentifier(nft) {
    if (nft.native.tokenId || nft.native.tokenHash) {
        return (nft.native.tokenId || nft.native.tokenHash);
    }
    throw new Error(`No Token Identifier found`);
}
function raise(msg) {
    throw new Error(msg);
}
async function casperHelper({ rpc, network, bridge, feeMargin, xpnft, umt, sig, }) {
    const client = new casper_js_sdk_1.CasperClient(rpc);
    const cep78Client = new src_1.CEP78Client(rpc, network);
    const bridgeClient = new xpbridge_client_1.XpBridgeClient(rpc, network);
    bridgeClient.setContractHash(bridge);
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
            const deploy = cep78Client.mint({
                meta: {
                    token_uri: options.uri,
                },
                owner: casper_js_sdk_1.CLPublicKey.fromHex(await owner.getActivePublicKey()),
                collectionName: options.contract
                    ? options.collectionName
                    : "UserNftMinter",
            }, {
                useSessionCode: false,
            }, "15000000000", casper_js_sdk_1.CLPublicKey.fromHex(await owner.getActivePublicKey()));
            const signed = await owner.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await owner.getActivePublicKey());
            return casper_js_sdk_1.DeployUtil.deployFromJson(signed).unwrap().send(rpc);
        },
        async isApprovedForMinter(_sender, nft) {
            cep78Client.setContractHash(nft.native.contract);
            const tid = getTokenIdentifier(nft);
            const result = (await cep78Client.contractClient.queryContractDictionary("approved", tid));
            if (result.isNone()) {
                return false;
            }
            return (Buffer.from(result.data.unwrap().data.data)
                .toString("hex")
                .toLowerCase() === bridge.split("-")[1].toLowerCase());
        },
        getProvider() {
            return client;
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
                amt: signature.fees,
                chain_nonce,
                to,
                contract: id.native.contract,
                mint_with: mintWith,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "15000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            return await client.putDeploy(dep);
        },
        async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
            const signature = await sig.casper(consts_1.Chain.CASPER, nonce, to, id.collectionIdent, id.native.tokenId || id.native.tokenHash || raise("No Token Identifier"));
            const deploy = bridgeClient.withdrawNft({
                amt: signature.fees,
                chain_nonce: nonce,
                to,
                contract: id.native.contract,
                sig_data: Buffer.from(signature.sig, "hex"),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "15000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            return await client.putDeploy(dep);
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
            cep78Client.setContractHash(nft.native.contract);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2FzcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGlEQU91QjtBQUN2Qix5REFBOEQ7QUFnQjlELGdFQUFxQztBQUlyQyxxREFBaUQ7QUFDakQsc0NBQWtDO0FBNENsQyxTQUFTLGtCQUFrQixDQUFDLEdBQXVCO0lBQ2pELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFXLENBQUM7S0FDL0Q7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQVc7SUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxFQUNqQyxHQUFHLEVBQ0gsT0FBTyxFQUNQLE1BQU0sRUFDTixTQUFTLEVBQ1QsS0FBSyxFQUNMLEdBQUcsRUFDSCxHQUFHLEdBQ1U7SUFDYixNQUFNLE1BQU0sR0FBRyxJQUFJLDRCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQkFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxNQUFNLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFckMsT0FBTztRQUNMLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLDJCQUFXLENBQUMsT0FBTyxDQUFDLEdB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