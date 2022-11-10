import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  MintNft,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "../chain";

import { AptosAccount, AptosClient, HexString, TokenClient } from "aptos";

import { Chain } from "../../consts";
import BigNumber from "bignumber.js";
import { BridgeClient } from "./bridge_client";
import { EvNotifier } from "../../notifier";

export type AptosNFT = {
  collection_creator: string;
  collection_name: string;
  token_name: string;
  property_version: number;
};

/**
 * @param collection name of the collection u already own. if u dont own any token, then set this as undefined
 * @param name name of the NFT
 * @param description description of the NFT
 * @param uri The URI which the NFT points to
 * @param createCollection set this as true if u set collection as undefined. it will create a new collection.
 */
export type AptosMintArgs = {
  collection: string | undefined;
  name: string;
  description: string;
  uri: string;
  createCollection: boolean;
};

export type AptosHelper = ChainNonceGet &
  TransferNftForeign<AptosAccount, AptosNFT, string> &
  UnfreezeForeignNft<AptosAccount, AptosNFT, string> &
  EstimateTxFees<AptosNFT> &
  ValidateAddress & {
    XpNft: string;
  } & GetFeeMargins &
  MintNft<AptosAccount, AptosMintArgs, string> &
  GetProvider<AptosClient>;

export type AptosParams = {
  feeMargin: FeeMargins;
  rpcUrl: string;
  xpnft: string;
  bridge: string;
  notifier: EvNotifier;
  network: "mainnet" | "devnet";
};

export async function aptosHelper({
  feeMargin,
  rpcUrl,
  xpnft,
  bridge,
  notifier,
  network,
}: AptosParams): Promise<AptosHelper> {
  const client = new AptosClient(rpcUrl);

  const bridgeClient = new BridgeClient(client, bridge, network);

  return {
    getNonce() {
      return Chain.APTOS;
    },
    getFeeMargin() {
      return feeMargin;
    },
    async validateAddress(adr) {
      try {
        await client.getAccount(adr);
        return true;
      } catch (e) {
        return false;
      }
    },
    XpNft: xpnft,
    async estimateValidateTransferNft(_to, _metadata, _mintWith) {
      return new BigNumber(0);
    },
    async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
      return new BigNumber(0);
    },
    async transferNftToForeign(
      sender,
      chain_nonce,
      to,
      id,
      txFees,
      mintWith,
      _gasLimit?
    ) {
      const receipt = await bridgeClient.freezeNft(
        sender,
        HexString.ensure(id.native.collection_creator),
        id.native.collection_name,
        id.native.token_name,
        id.native.property_version,
        BigInt(txFees.toString()),
        chain_nonce,
        to,
        mintWith
      );
      await new Promise((r) => setTimeout(r, 10000));
      await notifier.notifyAptos(receipt);
      return receipt;
    },
    getProvider() {
      return client;
    },
    async mintNft(owner, options) {
      const tc = new TokenClient(client);
      if (options.createCollection) {
        await tc.createCollection(
          owner,
          "UMT",
          "UserNftMinter - Mint your NFTs Here To Test",
          "https://example.com",
          BigInt(2 ** 64) - BigInt(1)
        );
        const response = await tc.createToken(
          owner,
          "UMT",
          options.name,
          options.description,
          1,
          options.uri,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        return response;
      } else {
        const response = await tc.createToken(
          owner,
          options.collection!,
          options.name,
          options.description,
          1,
          options.uri,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        return response;
      }
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const receipt = await bridgeClient.withdrawNft(
        sender,
        HexString.ensure(bridge),
        HexString.ensure(id.native.collection_creator),
        id.native.collection_name,
        id.native.token_name,
        id.native.property_version.toString(),
        BigInt(txFees.toString()),
        parseInt(nonce),
        to,
        id.native.collection_creator
      );
      await new Promise((r) => setTimeout(r, 10000));
      await notifier.notifyAptos(receipt);
      return receipt;
    },
  };
}
