"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeClient = void 0;
const aptos_1 = require("aptos");
const bridge_client_abis_1 = require("./bridge_client_abis");
class BridgeClient {
    constructor(aptosClient) {
        this.aptosClient = aptosClient;
        this.transactionBuilder = new aptos_1.TransactionBuilderABI(bridge_client_abis_1.BRIDGE_ABIS.map((abi) => new aptos_1.HexString(abi).toUint8Array()));
    }
    async initialize(account, groupKey) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::initialize", [], [groupKey]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async pause(account, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::pause", [], [actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async unpause(account, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::unpause", [], [actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateTransferNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion = "0", _actionId, _signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_transfer_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async withdrawNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion = "0") {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::withdraw_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateBurnNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion = "0", _actionId, _signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_burn_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async freezeNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion = "0") {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::freeze_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateUnfreezeNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion = "0", _actionId, _signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_unfreeze_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async updateGroupKey(account, groupKey, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::update_group_key", [], [groupKey, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async getBridgeData(creator) {
        const resources = await this.aptosClient.getAccountResources(creator);
        const accountResource = resources.find((r) => r.type ==
            "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::Bridge");
        return accountResource === null || accountResource === void 0 ? void 0 : accountResource.data;
    }
}
exports.BridgeClient = BridgeClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlX2NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2FwdG9zL2JyaWRnZV9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBTWU7QUFDZiw2REFBbUQ7QUFTbkQsTUFBYSxZQUFZO0lBSXZCLFlBQVksV0FBd0I7UUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksNkJBQXFCLENBQ2pELGdDQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGlCQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FDNUQsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUNkLE9BQXFCLEVBQ3JCLFFBQW9CO1FBRXBCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FDN0Qsd0ZBQXdGLEVBQ3hGLEVBQUUsRUFDRixDQUFDLFFBQVEsQ0FBQyxDQUNYLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUNULE9BQXFCLEVBQ3JCLFFBQXlCLEVBQ3pCLFNBQXFCO1FBRXJCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FDN0QsbUZBQW1GLEVBQ25GLEVBQUUsRUFDRixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FDdEIsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyw2QkFBNkIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQ1gsT0FBcUIsRUFDckIs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