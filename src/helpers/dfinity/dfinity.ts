import {
  Actor,
  ActorSubclass,
  HttpAgent,
  Identity,
  SubmitResponse,
} from "@dfinity/agent";

import IDLTYPE from "@dfinity/candid";
import LIBTYPE from "@dfinity/candid/lib/cjs/idl";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";

import { Principal } from "@dfinity/principal";
import BigNumber from "bignumber.js";
import { Chain } from "../../consts";
import { SignatureService } from "../../services/estimator";
import { EvNotifier } from "../../services/notifier";
import { ChainNonce } from "../../type-utils";

import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  MintNft,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WhitelistCheck,
  ParamsGetter,
} from "../chain";
import { idlFactory } from "./idl";
import { _SERVICE } from "./minter.did";

export type DfinitySigner = Identity;

export type DfinityNft = {
  canisterId: string;
  tokenId: string;
};

export type DfinityMintArgs = {
  canisterId?: string;
  uri: string;
};

const isBrowser = global.window?.constructor.name === "Window";

const { IDL } = (
  isBrowser
    ? require("@dfinity/candid/lib/esm/index")
    : require("@dfinity/candid")
) as typeof IDLTYPE;

const {
  decode,
  encode,
  Nat,
  Nat32,
  Nat8,
  Opt,
  PrincipalClass,
  Record,
  Text,
  Tuple,
  Vec,
} = (
  isBrowser
    ? require("@dfinity/candid/lib/esm/idl")
    : require("@dfinity/candid/lib/cjs/idl")
) as typeof LIBTYPE;

const Metadata = IDL.Variant({
  fungible: IDL.Record({
    decimals: IDL.Nat8,
    metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
    name: IDL.Text,
    symbol: IDL.Text,
  }),
  nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
});
const CommonError = IDL.Variant({
  InvalidToken: IDL.Text,
  Other: IDL.Text,
});

const Result_Bearer = IDL.Variant({
  ok: IDL.Text,
  err: CommonError,
});

const User = IDL.Variant({
  principal: IDL.Principal,
  address: IDL.Text,
});
export type User = { principal: Principal } | { address: AccountIdentifier };
export interface MintRequest {
  to: User;
  metadata: [] | [Array<number>];
}

const MintRequest = IDL.Record({
  to: User,
  metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
});

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
    PreTransfer<DfinitySigner, DfinityNft, string, undefined>,
    "preTransfer"
  > &
  BalanceCheck &
  GetFeeMargins &
  MintNft<DfinitySigner, DfinityMintArgs, SubmitResponse> & {
    nftList(owner: string, contract: string): Promise<NftInfo<DfinityNft>[]>;
  } & {
    getAccountIdentifier(principal: string): string;
  } & WhitelistCheck<DfinityNft> &
  ParamsGetter<DfinityParams> & {
    withdraw_fees(to: string, actionId: string, sig: Buffer): Promise<boolean>;
    encode_withdraw_fees(to: string, actionId: string): Promise<Buffer>;
  };

export type DfinityParams = {
  agent: HttpAgent;
  bridgeContract: Principal;
  xpnftId: Principal;
  notifier: EvNotifier;
  feeMargin: FeeMargins;
  umt: Principal;
  readonly signatureSvc: SignatureService;
};

export async function dfinityHelper(
  args: DfinityParams
): Promise<DfinityHelper> {
  //@ts-ignore
  let ledger = LedgerCanister.create({ agent: args.agent });
  let minter: ActorSubclass<_SERVICE> = Actor.createActor(idlFactory, {
    agent: args.agent,
    canisterId: args.bridgeContract,
  });

  const encode_withdraw_fees = async (to: string, actionId: string) => {
    /*const numbers = await minter.encode_withdraw_fees(BigInt(actionId), {
            to: Principal.fromText(to),
        });*/

    const x = encode(
      [IDL.Nat, IDL.Record({ to: IDL.Principal })],
      [
        BigInt(actionId),
        {
          to: Principal.fromText(to),
        },
      ]
    );
    return Buffer.from(x);
  };

  const withdraw_fees = async (to: string, actionId: string, sig: Buffer) => {
    await minter.withdraw_fees(
      BigInt(actionId),
      { to: Principal.fromText(to) },
      Array.from(sig)
    );
    return true;
  };

  async function transferTxFee(amt: BigNumber, sender?: any): Promise<bigint> {
    if (sender.requestTransfer) {
      const res = await sender.requestTransfer({
        to: args.bridgeContract.toText(),
        amount: amt.integerValue().toNumber(),
      });
      console.log(res, "res");
      return BigInt(res.height);
    }

    return await ledger.transfer({
      to: AccountIdentifier.fromPrincipal({
        principal: args.bridgeContract,
      }),
      amount: BigInt(amt.toString()),
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

  // async function waitActionId(requestId: RequestId) {
  //   const pollStrat = polling.defaultStrategy();
  //   const resp = await polling.pollForResponse(
  //     args.agent,
  //     args.bridgeContract,
  //     requestId,
  //     pollStrat
  //   );

  //   return decode([Nat], resp)[0].toString() as string;
  // }

  const adaptPlug = (agent: HttpAgent) => {
    minter = Actor.createActor(idlFactory, {
      agent,
      canisterId: args.bridgeContract,
    });
    /* ledger = LedgerCanister.create({
            agent,
        });*/
  };

  return {
    XpNft: args.xpnftId.toString(),
    getParams: () => args,
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
    async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
      isBrowser
        ? //@ts-ignore
          adaptPlug(sender.agent)
        : args.agent.replaceIdentity(sender);

      const sig = await args.signatureSvc.getSignatureDfinity(
        Chain.DFINITY,
        chain_nonce as ChainNonce,
        to,
        1
      );

      const txFeeBlock = await transferTxFee(new BigNumber(sig.fee), sender);

      const actionId = await minter.freeze_nft(
        txFeeBlock,
        Principal.fromText(id.native.canisterId),
        BigInt(id.native.tokenId),
        BigInt(chain_nonce),
        to,
        mintWith,
        [...Buffer.from(sig.signature, "hex")]
      );

      await args.notifier.notifyDfinity(actionId.toString());

      return actionId.toString();
    },
    async mintNft(owner, options) {
      const canister = Principal.fromText(
        options.canisterId ? options.canisterId : args.umt.toText()
      );
      if (isBrowser) {
        //@ts-ignore
        args.agent = owner.agent;
      }
      const principal = isBrowser
        ? await args.agent.getPrincipal()
        : owner.getPrincipal();

      let mint = await args.agent.call(canister, {
        methodName: "mintNFT",
        arg: encode(
          [MintRequest],
          [
            {
              metadata: [[...Buffer.from(options.uri)]],
              to: {
                principal,
              },
            } as MintRequest,
          ]
        ),
      });
      return mint;
    },
    async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
      isBrowser
        ? //@ts-ignore
          adaptPlug(sender.agent)
        : args.agent.replaceIdentity(sender);

      const sig = await args.signatureSvc.getSignatureDfinity(
        Chain.DFINITY,
        parseInt(nonce) as ChainNonce,
        to,
        1
      );

      const txFeeBlock = await transferTxFee(new BigNumber(sig.fee), sender);

      const actionId = await minter.withdraw_nft(
        txFeeBlock,
        Principal.fromText(id.native.canisterId),
        BigInt(id.native.tokenId),
        BigInt(nonce),
        to,
        [...Buffer.from(sig.signature, "hex")]
      );

      await args.notifier.notifyDfinity(actionId.toString());

      return actionId.toString();
    },

    /// owner = principal of owner
    async nftList(owner, contract = args.xpnftId.toText()) {
      let aid = AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(owner),
      });
      let tokens: NftInfo<DfinityNft>[] = [];
      const response = await args.agent.query(contract, {
        methodName: "getTokens",
        arg: encode([], []),
      });
      if ("reply" in response) {
        let decoded = decode(
          [IDL.Vec(IDL.Tuple(Nat32, Metadata))],
          response.reply.arg
        )[0] as any[];
        await Promise.all(
          decoded.map(async (e) => {
            let [tokenId, metadata]: [number, any] = e;
            let tid = tokenIdentifier(contract, tokenId);
            const ownerQuery = await args.agent.query(contract, {
              methodName: "bearer",
              arg: encode([Text], [tid]),
            });
            if ("reply" in ownerQuery) {
              const response = decode(
                [Result_Bearer],
                ownerQuery.reply.arg
              )[0] as Record<string, string>;
              if ("ok" in response) {
                if (response.ok === aid.toHex()) {
                  tokens.push({
                    collectionIdent: contract,
                    native: {
                      canisterId: contract,
                      tokenId: tokenId.toString(),
                    },
                    uri: Buffer.from(
                      metadata["nonfungible"]["metadata"][0] ?? []
                    ).toString("utf-8"),
                  });
                }
              }
            }
          })
        );
      }
      return tokens;
    },
    async preTransfer(sender, nft) {
      if (isBrowser) {
        //@ts-ignore
        args.agent = sender.agent;
      } else {
        args.agent.replaceIdentity(sender);
      }

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

      const e8s = bal.toString();

      return new BigNumber(e8s);
    },
    getAccountIdentifier(principal: string) {
      const x = AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(principal),
      });
      return x.toHex();
    },

    async isNftWhitelisted(nft) {
      return await minter.is_whitelisted(
        Principal.fromText(nft.native.canisterId)
      );
    },
    withdraw_fees,
    encode_withdraw_fees,
  };
}
