import { AptosAccount, AptosClient, HexString, MaybeHexString, TransactionBuilderABI } from "aptos";
interface BridgeData {
    group_key: string;
    paused: boolean;
    consumed_actions: any;
    frozen_nfts: any;
}
export declare class BridgeClient {
    aptosClient: AptosClient;
    transactionBuilder: TransactionBuilderABI;
    constructor(aptosClient: AptosClient);
    initialize(account: AptosAccount, groupKey: Uint8Array): Promise<string>;
    pause(account: AptosAccount, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    unpause(account: AptosAccount, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    validateWhitelist(account: AptosAccount, collectionCreator: HexString, collectionName: string, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    validateBlacklist(account: AptosAccount, collectionCreator: HexString, collectionName: string, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    validateWithdrawFees(account: AptosAccount, to: HexString, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    validateTransferNft(account: AptosAccount, collection: string, name: string, description: string, maximum: number | bigint, uri: string, royaltyPayeeAddress: HexString, royaltyPointsDenominator: number | bigint, royaltyPointsNumerator: number | bigint, mutateSetting: boolean[], propertyKeys: string[], propertyValues: number[][], propertyTypes: string[], to: HexString, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    withdrawNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string, price: number | bigint, chainNonce: number | bigint, to: string, mintWith: string): Promise<string>;
    validateBurnNft(account: AptosAccount, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    freezeNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string, price: number | bigint, chainNonce: number | bigint, to: string, mintWith: string): Promise<string>;
    validateUnfreezeNft(account: AptosAccount, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string, to: HexString, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    updateGroupKey(account: AptosAccount, groupKey: Uint8Array, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    getBridgeData(creator: MaybeHexString): Promise<BridgeData>;
}
export {};
//# sourceMappingURL=bridge_client.d.ts.map