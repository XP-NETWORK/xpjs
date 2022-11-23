"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeClient = void 0;
const aptos_1 = require("aptos");
const bridge_client_abis_1 = require("./bridge_client_abis");
class BridgeClient {
    constructor(aptosClient, address, network) {
        this.aptosClient = aptosClient;
        let abi;
        switch (network) {
            case "mainnet":
                abi = bridge_client_abis_1.MAINNET_BRIDGE_ABIS;
                break;
            case "staging":
                abi = bridge_client_abis_1.STAGING_BRIDGE_ABIS;
                break;
            case "testnet":
                abi = bridge_client_abis_1.TESTNET_BRIDGE_ABIS;
                break;
            default:
                throw new Error("Invalid network");
        }
        this.transactionBuilder = new aptos_1.TransactionBuilderABI(abi.map((abi) => new aptos_1.HexString(abi).toUint8Array()));
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
    async validateTransferNft(account, collection, name, description, maximum, uri, royaltyPayeeAddress, royaltyPointsDenominator, royaltyPointsNumerator, mutateSetting, to, actionId, signature) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::validate_transfer_nft`, [], [
            collection,
            name,
            description,
            maximum,
            uri,
            royaltyPayeeAddress.toString(),
            royaltyPointsDenominator.toString(),
            royaltyPointsNumerator.toString(),
            mutateSetting,
            to.toString(),
            actionId,
            signature,
        ]);
        return this.aptosClient.generateSignSubmitTransaction(account, payload);
    }
    async withdrawNft(account, _bridgeAdmin, collectionCreator, collectionName, tokenName, propertyVersion, price, chainNonce, to, mintWith) {
        const payload = this.transactionBuilder.buildTransactionPayload(`${this.getAddress()}::bridge::withdraw_nft`, [], [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlX2NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2FwdG9zL2JyaWRnZV9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBTWU7QUFDZiw2REFJOEI7QUFvQjlCLE1BQWEsWUFBWTtJQUt2QixZQUNFLFdBQXdCLEVBQ3hCLE9BQWUsRUFDZixPQUEwQztRQUUxQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLEdBQUcsQ0FBQztRQUNSLFFBQVEsT0FBTyxFQUFFO1lBQ2YsS0FBSyxTQUFTO2dCQUNaLEdBQUcsR0FBRyx3Q0FBbUIsQ0FBQztnQkFDMUIsTUFBTTtZQUNSLEtBQUssU0FBUztnQkFDWixHQUFHLEdBQUcsd0NBQW1CLENBQUM7Z0JBQzFCLE1BQU07WUFDUixLQUFLLFNBQVM7Z0JBQ1osR0FBRyxHQUFHLHdDQUFtQixDQUFDO2dCQUMxQixNQUFNO1lBQ1I7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksNkJBQXFCLENBQ2pELEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksaUJBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUNwRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQ2QsT0FBcUIsRUFDckIsUUFBb0I7UUFFcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixDQUM3RCxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLEVBQzFDLEVBQUUsRUFDRixDQUFDLFFBQVEsQ0FBQyxDQUNYLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxX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