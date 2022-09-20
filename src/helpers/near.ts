import BigNumber from "bignumber.js";
import BN from "bn.js";

import { Account, connect, DEFAULT_FUNCTION_CALL_GAS, Near } from "near-api-js";
import {
  FinalExecutionOutcome,
  getTransactionLastResult,
} from "near-api-js/lib/providers";
import { Chain } from "../consts";
import { EvNotifier } from "../notifier";
import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

type NearTxResult = [FinalExecutionOutcome, any];

export type NearParams = {
  readonly networkId: string;
  readonly nonce: number;
  readonly rpcUrl: string;
  readonly bridge: string;
  readonly xpnft: string;
  readonly feeMargin: FeeMargins;
  readonly notifier: EvNotifier;
};
export type NearNFT = {
  tokenId: string;
};

export type NearHelper = ChainNonceGet &
  TransferNftForeign<Account, NearNFT, NearTxResult> &
  UnfreezeForeignNft<Account, NearNFT, NearTxResult> &
  EstimateTxFees<NearNFT> &
  ValidateAddress & {
    XpNft: string;
  } & GetFeeMargins &
  GetProvider<Near>;
export async function nearHelperFactory({
  networkId,
  bridge,
  rpcUrl,
  xpnft,
  feeMargin,
  notifier,
}: NearParams): Promise<NearHelper> {
  const near = await connect({
    nodeUrl: rpcUrl,
    networkId,
    headers: {},
  });

  return {
    async estimateValidateTransferNft(_to, _metadata, _mintWith) {
      return new BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
      return new BigNumber(0); // TODO
    },
    getNonce() {
      return Chain.NEAR;
    },
    XpNft: xpnft,
    async transferNftToForeign(
      sender,
      chain_nonce,
      to,
      id,
      txFees,
      mint_with,
      gasLimit
    ) {
      const result = await sender.functionCall({
        contractId: bridge,
        args: {
          token_id: id.native.tokenId,
          chain_nonce,
          to,
          amt: new BigNumber(txFees),
          mint_with,
        },
        methodName: "freeze_nft",
        attachedDeposit: new BN(txFees.toString()),
        gas: new BN(gasLimit?.toString() ?? DEFAULT_FUNCTION_CALL_GAS),
      });
      await notifier.notifyNear(result.transaction.hash);
      return [result, getTransactionLastResult(result)];
    },
    getFeeMargin() {
      return feeMargin;
    },
    getProvider() {
      return near;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const result = await sender.functionCall({
        contractId: bridge,
        args: {
          token_id: id.native.tokenId,
          chain_nonce: parseInt(nonce),
          to,
          amt: parseInt(txFees.toString()),
        },
        methodName: "withdraw_nft",
        attachedDeposit: new BN(txFees.toString()),
        gas: DEFAULT_FUNCTION_CALL_GAS,
      });
      await notifier.notifyNear(result.transaction.hash);
      return [result, getTransactionLastResult(result)];
    },
    async validateAddress(adr) {
      try {
        await new Account(near.connection, adr).getAccountBalance();
        return true;
      } catch (e) {
        return false;
      }
    },
  };
}
