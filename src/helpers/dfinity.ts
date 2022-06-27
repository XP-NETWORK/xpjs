import { HttpAgent, Identity, polling, RequestId } from "@dfinity/agent";
import {
  decode,
  encode,
  Nat,
  Nat64,
  PrincipalClass,
  Text,
} from "@dfinity/candid/lib/cjs/idl";
import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import BigNumber from "bignumber.js";
import { Chain } from "../consts";
import { EvNotifier } from "../notifier";
import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

export type DfinitySigner = Identity;

export type DfinityNft = {
  canisterId: string;
  tokenId: string;
};

export type DfinityHelper = ChainNonceGet &
  TransferNftForeign<DfinitySigner, DfinityNft, string> &
  UnfreezeForeignNft<DfinitySigner, DfinityNft, string> &
  EstimateTxFees<DfinityNft> &
  ValidateAddress & { XpNft: string } & Pick<
    PreTransfer<DfinitySigner, DfinityNft, string>,
    "preTransfer"
  > &
  BalanceCheck;

export type DfinityParams = {
  agent: HttpAgent;
  bridgeContract: Principal;
  xpnftId: Principal;
  notifier: EvNotifier;
};

export async function dfinityHelper(
  args: DfinityParams
): Promise<DfinityHelper> {
  const ledger = LedgerCanister.create({ agent: args.agent });

  async function transferTxFee(amt: BigNumber): Promise<bigint> {
    return await ledger.transfer({
      to: AccountIdentifier.fromPrincipal({ principal: args.bridgeContract }),
      amount: ICP.fromString(amt.toFixed()) as ICP,
    });
  }

  async function waitActionId(requestId: RequestId) {
    const pollStrat = polling.defaultStrategy();
    const resp = await polling.pollForResponse(
      args.agent,
      args.bridgeContract,
      requestId,
      pollStrat
    );

    return decode([Nat], resp)[0].toString() as string;
  }

  return {
    XpNft: args.xpnftId.toString(),
    getNonce: () => Chain.DFINITY,
    estimateValidateTransferNft: async () => new BigNumber(0), // TODO
    estimateValidateUnfreezeNft: async () => new BigNumber(0), // TODO
    async validateAddress(adr) {
      try {
        Principal.fromText(adr);
        return true;
      } catch {
        return false;
      }
    },
    async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
      args.agent.replaceIdentity(sender);

      const txFeeBlock = await transferTxFee(txFees);

      const freezeCall = await args.agent.call(args.bridgeContract, {
        methodName: "freeze_nft",
        arg: encode(
          [Nat64, new PrincipalClass(), Nat, Nat64, Text, Text],
          [
            txFeeBlock,
            Principal.fromText(id.native.canisterId),
            BigInt(id.native.tokenId),
            chain_nonce,
            to,
            mintWith,
          ]
        ),
      });

      const actionId = await waitActionId(freezeCall.requestId);
      await args.notifier.notifyDfinity(actionId);

      return Buffer.from(freezeCall.requestId).toString("hex");
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      args.agent.replaceIdentity(sender);

      const txFeeBlock = await transferTxFee(txFees);

      const withdrawCall = await args.agent.call(args.bridgeContract, {
        methodName: "withdraw_nft",
        arg: encode(
          [Nat64, new PrincipalClass(), Nat, Nat64, Text],
          [
            txFeeBlock,
            Principal.fromText(id.native.canisterId),
            BigInt(id.native.tokenId),
            nonce,
            to,
          ]
        ),
      });

      const actionId = await waitActionId(withdrawCall.requestId);
      await args.notifier.notifyDfinity(actionId);

      return Buffer.from(withdrawCall.requestId).toString("hex");
    },
    async preTransfer(sender, nft) {
      args.agent.replaceIdentity(sender);

      const nftContract = Principal.fromText(nft.native.canisterId);
      const approvedQuery = await args.agent.query(nftContract, {
        methodName: "getApproved",
        arg: encode([Nat], [BigInt(nft.native.tokenId)]),
      });

      if (
        "reply" in approvedQuery &&
        decode([new PrincipalClass()], approvedQuery.reply.arg)[0].toString() ==
          args.bridgeContract.toString()
      ) {
        // already approved
        return;
      }

      const approveCall = await args.agent.call(nftContract, {
        methodName: "approve",
        arg: encode(
          [new PrincipalClass(), Nat],
          [args.bridgeContract, BigInt(nft.native.tokenId)]
        ),
      });

      return Buffer.from(approveCall.requestId).toString("hex");
    },
    async balance(address) {
      const bal = await ledger.accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(address),
        }),
      });

      const e8s = bal.toE8s().toString();

      return new BigNumber(e8s);
    },
  };
}
