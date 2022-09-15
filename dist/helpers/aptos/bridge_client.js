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
    async validateWhitelist(account, collectionCreator, collectionName, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_whitelist", [], [collectionCreator.toString(), collectionName, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateBlacklist(account, collectionCreator, collectionName, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_blacklist", [], [collectionCreator.toString(), collectionName, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateWithdrawFees(account, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_withdraw_fees", [], [to.toString(), actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateTransferNft(account, collection, name, description, maximum, uri, royaltyPayeeAddress, royaltyPointsDenominator, royaltyPointsNumerator, mutateSetting, propertyKeys, propertyValues, propertyTypes, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_transfer_nft", [], [
            collection,
            name,
            description,
            maximum,
            uri,
            royaltyPayeeAddress.toString(),
            royaltyPointsDenominator,
            royaltyPointsNumerator,
            mutateSetting,
            propertyKeys,
            propertyValues,
            propertyValues,
            propertyTypes,
            to.toString(),
            actionId,
            signature,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async withdrawNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion, price, chainNonce, to, mintWith) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::withdraw_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
            price,
            chainNonce,
            to,
            mintWith,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateBurnNft(account, collectionCreator, collectionName, tokenName, propertyVersion, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_burn_nft", [], [
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
            actionId,
            signature,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async freezeNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion, price, chainNonce, to, mintWith) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::freeze_nft", [], [
            bridgeAdmin.toString(),
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
            price,
            chainNonce,
            to,
            mintWith,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateUnfreezeNft(account, collectionCreator, collectionName, tokenName, propertyVersion, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload("0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_unfreeze_nft", [], [
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
            to.toString(),
            actionId,
            signature,
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