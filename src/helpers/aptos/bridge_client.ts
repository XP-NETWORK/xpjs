import {
  AptosAccount,
  AptosClient,
  HexString,
  MaybeHexString,
  TransactionBuilderABI,
} from "aptos";
import { BRIDGE_ABIS } from "./bridge_client_abis";

interface BridgeData {
  group_key: string;
  paused: boolean;
  consumed_actions: any;
  frozen_nfts: any;
}

export class BridgeClient {
  aptosClient: AptosClient;
  transactionBuilder: TransactionBuilderABI;

  constructor(aptosClient: AptosClient) {
    this.aptosClient = aptosClient;
    this.transactionBuilder = new TransactionBuilderABI(
      BRIDGE_ABIS.map((abi) => new HexString(abi).toUint8Array())
    );
  }

  async initialize(
    account: AptosAccount,
    groupKey: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::initialize",
      [],
      [groupKey]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async pause(
    account: AptosAccount,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::pause",
      [],
      [actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async unpause(
    account: AptosAccount,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::unpause",
      [],
      [actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateTransferNft(
    account: AptosAccount,
    bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string = "0",
    _actionId: number | bigint,
    _signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_transfer_nft",
      [],
      [
        bridgeAdmin.toString(),
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async withdrawNft(
    account: AptosAccount,
    bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string = "0"
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::withdraw_nft",
      [],
      [
        bridgeAdmin.toString(),
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateBurnNft(
    account: AptosAccount,
    bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string = "0",
    _actionId: number | bigint,
    _signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_burn_nft",
      [],
      [
        bridgeAdmin.toString(),
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async freezeNft(
    account: AptosAccount,
    bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string = "0"
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::freeze_nft",
      [],
      [
        bridgeAdmin.toString(),
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateUnfreezeNft(
    account: AptosAccount,
    bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string = "0",
    _actionId: number | bigint,
    _signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::validate_unfreeze_nft",
      [],
      [
        bridgeAdmin.toString(),
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async updateGroupKey(
    account: AptosAccount,
    groupKey: Uint8Array,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::update_group_key",
      [],
      [groupKey, actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async getBridgeData(creator: MaybeHexString) {
    const resources = await this.aptosClient.getAccountResources(creator);
    const accountResource = resources.find(
      (r) =>
        r.type ==
        "0x8ee4020133974b38ff869ba398faf8679a111a7e20bc9ff8d8c666a7d28f97a0::bridge::Bridge"
    );
    return accountResource?.data as BridgeData;
  }
}
