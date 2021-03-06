import { HttpAgent, Identity, polling, RequestId } from "@dfinity/agent";
import {
  decode,
  encode,
  Nat,
  Nat32,
  Nat64,
  Nat8,
  Opt,
  PrincipalClass,
  Record,
  Text,
  Tuple,
  Vec,
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
  FeeMargins,
  GetFeeMargins,
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

const ApproveRequest = Record({
  token: Text,
  subaccount: Opt(Vec(Nat8)),
  allowance: Nat,
  spender: new PrincipalClass(),
});

export type DfinityHelper = ChainNonceGet &
  TransferNftForeign<DfinitySigner, DfinityNft, string> &
  UnfreezeForeignNft<DfinitySigner, DfinityNft, string> &
  EstimateTxFees<DfinityNft> &
  ValidateAddress & { XpNft: string } & Pick<
    PreTransfer<DfinitySigner, DfinityNft, string>,
    "preTransfer"
  > &
  BalanceCheck &
  GetFeeMargins;

export type DfinityParams = {
  agent: HttpAgent;
  bridgeContract: Principal;
  xpnftId: Principal;
  notifier: EvNotifier;
  feeMargin: FeeMargins;
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
  const to32bits = (num: number) => {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    1 << 5;
    return Array.from(new Uint8Array(b));
  };

  const tokenIdentifier = (principal: string, index: number) => {
    const padding = Buffer.from("\x0Atid");
    const array = new Uint8Array([
      ...padding,
      ...Principal.fromText(principal).toUint8Array(),
      ...to32bits(index),
    ]);
    return Principal.fromUint8Array(array).toText();
  };

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

      const tid = tokenIdentifier(
        nft.collectionIdent,
        Number(nft.native.tokenId)
      );

      const nftContract = Principal.fromText(nft.native.canisterId);
      const approvedQuery = await args.agent.query(nftContract, {
        methodName: "getAllowances",
        arg: encode([Text], [tid]),
      });

      if ("reply" in approvedQuery) {
        let decoded: Array<[number, Principal]> = decode(
          [Vec(Tuple(Nat32, new PrincipalClass()))],
          approvedQuery.reply.arg
        )[0] as any;
        for (const item of decoded) {
          if (item[0] === Number(nft.native.tokenId)) {
            if (item[1].toText() === args.bridgeContract.toText()) {
              return undefined;
            }
          }
        }
      }

      const approveCall = await args.agent.call(nftContract, {
        methodName: "approve",
        arg: encode(
          [ApproveRequest],
          [
            {
              token: tid,
              allowance: BigInt(1),
              spender: args.bridgeContract,
              subaccount: [],
            },
          ]
        ),
      });

      return Buffer.from(approveCall.requestId).toString("hex");
    },
    getFeeMargin() {
      return args.feeMargin;
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
