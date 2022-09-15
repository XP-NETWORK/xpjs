import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "../chain";

import { AptosAccount, AptosClient, HexString } from "aptos";

import { Chain } from "../../consts";
import BigNumber from "bignumber.js";
import { BridgeClient } from "./bridge_client";

export type AptosNFT = {
  collection_creator: string;
  collection_name: string;
  token_name: string;
  property_version: number;
};

export type AptosHelper = ChainNonceGet &
  TransferNftForeign<AptosAccount, AptosNFT, string> &
  UnfreezeForeignNft<AptosAccount, AptosNFT, string> &
  EstimateTxFees<AptosNFT> &
  ValidateAddress & {
    XpNft: string;
  } & GetFeeMargins;

export type AptosParams = {
  feeMargin: FeeMargins;
  rpcUrl: string;
  xpnft: string;
  bridge: string;
};

export async function aptosHelper({
  feeMargin,
  rpcUrl,
  xpnft,
  bridge,
}: AptosParams): Promise<AptosHelper> {
  const client = new AptosClient(rpcUrl);

  const bridgeClient = new BridgeClient(client);

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
        HexString.ensure(bridge),
        HexString.ensure(id.native.collection_creator),
        id.native.collection_name,
        id.native.token_name,
        id.native.property_version.toString(),
        BigInt(txFees.toString()),
        chain_nonce,
        to,
        mintWith
      );
      return receipt;
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
      return receipt;
    },
  };
}
