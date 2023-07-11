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
async function casperHelper({ rpc, network, bridge, feeMargin, xpnft, umt, }) {
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            const deploy = bridgeClient.freezeNft({
                amt: txFees.toString(),
                chain_nonce,
                to,
                contract: id.native.contract,
                mint_with: mintWith,
                sig_data: new Uint8Array(0),
                token_id: id.native.tokenId || id.native.tokenHash || "",
            }, "15000000000", casper_js_sdk_1.CLPublicKey.fromHex(await sender.getActivePublicKey()));
            const signed = await sender.sign(casper_js_sdk_1.DeployUtil.deployToJson(deploy), await sender.getActivePublicKey());
            const dep = client.deployFromJson(signed).unwrap();
            return await client.putDeploy(dep);
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const deploy = bridgeClient.withdrawNft({
                amt: txFees.toString(),
                chain_nonce: nonce,
                to,
                contract: id.native.contract,
                sig_data: new Uint8Array(0),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2FzcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGlEQU91QjtBQUN2Qix5REFBOEQ7QUFnQjlELGdFQUFxQztBQUlyQyxxREFBaUQ7QUFDakQsc0NBQWtDO0FBMENsQyxTQUFTLGtCQUFrQixDQUFDLEdBQXVCO0lBQ2pELElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFXLENBQUM7S0FDL0Q7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsRUFDakMsR0FBRyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULEtBQUssRUFDTCxHQUFHLEdBRU87SUFDVixNQUFNLE1BQU0sR0FBRyxJQUFJLDRCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQkFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxNQUFNLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELFlBQVksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFckMsT0FBTztRQUNMLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixJQUFJO2dCQUNGLDJCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtR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