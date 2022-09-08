import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

import { AptosAccount, AptosClient } from "aptos";

import { Chain } from "../consts";
import BigNumber from "bignumber.js";

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
}: AptosParams): Promise<AptosHelper> {
  const client = new AptosClient(rpcUrl);

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
      _sender,
      _chain_nonce,
      _to,
      _id,
      _txFees,
      _mintWith,
      _gasLimit?
    ) {
      throw new Error("Method not implemented.");
    },
    async unfreezeWrappedNft(_sender, _to, _id, _txFees, _nonce) {
      throw new Error("Method not implemented.");
    },
  };
}
