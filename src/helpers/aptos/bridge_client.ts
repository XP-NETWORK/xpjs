import {
  AptosAccount,
  AptosClient,
  HexString,
  MaybeHexString,
  TransactionBuilderABI,
} from "aptos";
import { BRIDGE_ABIS, TESTNET_BRIDGE_ABIS } from "./bridge_client_abis";

interface BridgeData {
  action_cnt: string;
  burning_nfts: {
    handle: string;
  };
  consumed_actions: {
    handle: string;
  };
  group_key: string;
  paused: boolean;
  frozen_nfts: {
    handle: string;
  };
  whitelist: {
    handle: string;
  };
}

export class BridgeClient {
  private aptosClient: AptosClient;
  private transactionBuilder: TransactionBuilderABI;
  private address: string;

  constructor(
    aptosClient: AptosClient,
    address: string,
    network: "mainnet" | "testnet"
  ) {
    this.aptosClient = aptosClient;
    this.transactionBuilder = new TransactionBuilderABI(
      (network === "mainnet" ? BRIDGE_ABIS : TESTNET_BRIDGE_ABIS).map((abi) =>
        new HexString(abi).toUint8Array()
      )
    );
    this.address = address;
  }

  async initialize(
    account: AptosAccount,
    groupKey: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::initialize`,
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
      `${this.getAddress()}::bridge::pause`,
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
      `${this.getAddress()}::bridge::unpause`,
      [],
      [actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateWhitelist(
    account: AptosAccount,
    collectionCreator: HexString,
    collectionName: string,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_whitelist`,
      [],
      [collectionCreator.toString(), collectionName, actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateBlacklist(
    account: AptosAccount,
    collectionCreator: HexString,
    collectionName: string,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_blacklist`,
      [],
      [collectionCreator.toString(), collectionName, actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateWithdrawFees(
    account: AptosAccount,
    to: HexString,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_withdraw_fees`,
      [],
      [to.toString(), actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateTransferNft(
    account: AptosAccount,
    collection: string,
    name: string,
    description: string,
    maximum: number | bigint,
    uri: string,
    royaltyPayeeAddress: HexString,
    royaltyPointsDenominator: number | bigint,
    royaltyPointsNumerator: number | bigint,
    mutateSetting: boolean[],
    to: HexString,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_transfer_nft`,
      [],
      [
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
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async withdrawNft(
    account: AptosAccount,
    _bridgeAdmin: HexString,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    price: number | bigint,
    chainNonce: number | bigint,
    to: string,
    mintWith: string
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::withdraw_nft`,
      [],
      [
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
        price,
        chainNonce,
        to,
        mintWith,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateBurnNft(
    account: AptosAccount,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_burn_nft`,
      [],
      [
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
        actionId,
        signature,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async freezeNft(
    account: AptosAccount,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: number | bigint,
    price: number | bigint,
    chainNonce: number | bigint,
    to: string,
    mintWith: string
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::freeze_nft`,
      [],
      [
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
        price,
        chainNonce,
        to,
        mintWith,
      ]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async validateUnfreezeNft(
    account: AptosAccount,
    collectionCreator: HexString,
    collectionName: string,
    tokenName: string,
    propertyVersion: string,
    to: HexString,
    actionId: number | bigint,
    signature: Uint8Array
  ): Promise<string> {
    const payload = this.transactionBuilder.buildTransactionPayload(
      `${this.getAddress()}::bridge::validate_unfreeze_nft`,
      [],
      [
        collectionCreator.toString(),
        collectionName,
        tokenName,
        propertyVersion,
        to.toString(),
        actionId,
        signature,
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
      `${this.getAddress()}::bridge::update_group_key`,
      [],
      [groupKey, actionId, signature]
    );

    return this.aptosClient.generateSignSubmitTransaction(account, payload);
  }

  async getBridgeData() {
    const resources = await this.aptosClient.getAccountResources(
      this.getAddress()
    );
    const accountResource = resources.find(
      (r) => r.type == `${this.getAddress()}::bridge::Bridge`
    );
    return accountResource?.data as BridgeData;
  }

  getAddress() {
    return this.address;
  }

  async isWhitelist(collectionCreator: MaybeHexString, collectionName: string) {
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
    } catch (e: any) {
      return false;
    }
  }
}
