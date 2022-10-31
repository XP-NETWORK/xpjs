"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeClient = void 0;
const aptos_1 = require("aptos");
const bridge_client_abis_1 = require("./bridge_client_abis");
class BridgeClient {
    constructor(aptosClient, address) {
        this.aptosClient = aptosClient;
        this.transactionBuilder = new aptos_1.TransactionBuilderABI(bridge_client_abis_1.BRIDGE_ABIS.map((abi) => new aptos_1.HexString(abi).toUint8Array()));
        this.address = address;
    }
    async initialize(account, groupKey) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::initialize`, [], [groupKey]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async pause(account, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::pause`, [], [actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async unpause(account, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::unpause`, [], [actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateWhitelist(account, collectionCreator, collectionName, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_whitelist`, [], [collectionCreator.toString(), collectionName, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateBlacklist(account, collectionCreator, collectionName, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_blacklist`, [], [collectionCreator.toString(), collectionName, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateWithdrawFees(account, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_withdraw_fees`, [], [to.toString(), actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async validateTransferNft(account, collection, name, description, maximum, uri, royaltyPayeeAddress, royaltyPointsDenominator, royaltyPointsNumerator, mutateSetting, propertyKeys, propertyValues, propertyTypes, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_transfer_nft`, [], [
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
            propertyTypes,
            to.toString(),
            actionId,
            signature,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async withdrawNft(account, bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion, price, chainNonce, to, mintWith) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::withdraw_nft`, [], [
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
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_burn_nft`, [], [
            collectionCreator.toString(),
            collectionName,
            tokenName,
            propertyVersion,
            actionId,
            signature,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async freezeNft(account, collectionCreator, collectionName, tokenName, propertyVersion, price, chainNonce, to, mintWith) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::freeze_nft`, [], [
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
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_unfreeze_nft`, [], [
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
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::update_group_key`, [], [groupKey, actionId, signature]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async getBridgeData() {
        const resources = await this.aptosClient.getAccountResources(this.getAddress());
        const accountResource = resources.find((r) => r.type == `${this.getAddress()}::bridge::Bridge`);
        return accountResource === null || accountResource === void 0 ? void 0 : accountResource.data;
    }
    getAddress() {
        return this.address;
    }
    async isWhitelist(collectionCreator, collectionName) {
        const data = await this.getBridgeData();
        const { handle } = data.whitelist;
        try {
            const res = await this.aptosClient.getTableItem(handle, {
                key_type: `${this.getAddress()}::bridge::CollectionId`,
                value_type: "bool",
                key: {
                    creator: collectionCreator.toString(),
                    name: collectionName,
                },
            });
            return res;
        }
        catch (e) {
            return false;
        }
    }
}
exports.BridgeClient = BridgeClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlX2NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2FwdG9zL2JyaWRnZV9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBTWU7QUFDZiw2REFBbUQ7QUFvQm5ELE1BQWEsWUFBWTtJQUt2QixZQUFZLFdBQXdCLEVBQUUsT0FBZTtRQUNuRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSw2QkFBcUIsQ0FDakQsZ0NBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksaUJBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUM1RCxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQ2QsT0FBcUIsRUFDckIsUUFBb0I7UUFFcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUM3RCxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLEVBQzFDLEVBQUUsRUFDRixDQUFDLFFBQVEsQ0FBQyxDQUNYLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUNULE9BQXFCLEVBQ3JCLFFBQXlCLEVBQ3pCLFNBQXFCO1FBRXJCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FDN0QsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUNyQyxFQUFFLEVBQ0YsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQ3RCLENBQUM7UUFFRixPQUFPLElBQUksQ0FB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