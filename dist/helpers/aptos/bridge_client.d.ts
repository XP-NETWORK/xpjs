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
    validateTransferNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string | undefined, _actionId: number | bigint, _signature: Uint8Array): Promise<string>;
    withdrawNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion?: string): Promise<string>;
    validateBurnNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string | undefined, _actionId: number | bigint, _signature: Uint8Array): Promise<string>;
    freezeNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion?: string): Promise<string>;
    validateUnfreezeNft(account: AptosAccount, bridgeAdmin: HexString, collectionCreator: HexString, collectionName: string, tokenName: string, propertyVersion: string | undefined, _actionId: number | bigint, _signature: Uint8Array): Promise<string>;
    updateGroupKey(account: AptosAccount, groupKey: Uint8Array, actionId: number | bigint, signature: Uint8Array): Promise<string>;
    getBridgeData(creator: MaybeHexString): Promise<BridgeData>;
}
export {};
//# sourceMappingURL=bridge_client.d.ts.map