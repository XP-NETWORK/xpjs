import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";

import IDLTYPE from "@dfinity/candid";
import LIBTYPE from "@dfinity/candid/lib/cjs/idl";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";

import { Principal } from "@dfinity/principal";
import BigNumber from "bignumber.js";
import { Chain } from "../../consts";
import { SignatureService } from "../../services/estimator";
import { EvNotifier } from "../../services/notifier";
import { ChainNonce } from "../../type-utils";
import { randomBigInt } from "../..";

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
  IsApprovedForMinter,
  GetExtraFees,
  EstimateDeployFees,
} from "../chain";
import { idlFactory } from "./idl";
import { _SERVICE } from "./minter.did";
import ledgerIDL, { LEDGER_CANISTER } from "./ledger.did";
import * as utils from "@dfinity/utils";
import { XPNFTSERVICE, xpnftIdl } from "./xpnft.idl";

export type DfinitySigner = Identity & { agent?: HttpAgent };

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

const { decode, encode, Nat32, Text } = (
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

export type DfinityHelper = ChainNonceGet &
  TransferNftForeign<DfinitySigner, DfinityNft, string> &
  UnfreezeForeignNft<DfinitySigner, DfinityNft, string> &
  EstimateTxFees<DfinityNft> &
  EstimateDeployFees &
  ValidateAddress & { XpNft: string } & Pick<
    PreTransfer<DfinitySigner, DfinityNft, string, undefined>,
    "preTransfer"
  > &
  BalanceCheck &
  GetFeeMargins &
  MintNft<DfinitySigner, DfinityMintArgs, number> & {
    nftList(owner: string, contract: string): Promise<NftInfo<DfinityNft>[]>;
  } & {
    getAccountIdentifier(principal: string): string;
  } & WhitelistCheck<DfinityNft> &
  ParamsGetter<DfinityParams> & {
    withdraw_fees(to: string, actionId: string, sig: Buffer): Promise<boolean>;
    encode_withdraw_fees(to: string, actionId: string): Promise<Uint8Array>;
    getMinter(): ActorSubclass<_SERVICE>;
    validatedMint(actionId: string): Promise<string>;
  } & IsApprovedForMinter<DfinitySigner, DfinityNft> &
  GetExtraFees & {
    setActorCreator(provider: any): void;
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
  const createMinter = async (
    agent: HttpAgent
  ): Promise<ActorSubclass<_SERVICE>> =>
    Actor.createActor(idlFactory, {
      agent,
      canisterId: args.bridgeContract,
    });

  //adapt agent for different wallets
  const prepareAgent = (sender: Identity & { agent?: HttpAgent }) => {
    //plug wallet
    if (sender.agent?.rootKey) {
      return sender.agent;
    }
    //bitfinity wallet
    if (sender.agent) {
      return args.agent;
    }
    //default
    args.agent.replaceIdentity(sender);
    return args.agent;
  };

  //@ts-ignore
  let ledger = LedgerCanister.create({ agent: args.agent });
  const minter = await createMinter(args.agent);

  const encode_withdraw_fees = async (to: string, actionId: string) => {
    /*const numbers = await minter.encode_withdraw_fees(BigInt(actionId), {
            to: Principal.fromText(to),
        });*/

    const ValidateWithdrawFees = IDL.Record({ to: IDL.Principal });

    const x = encode(
      [IDL.Nat, ValidateWithdrawFees],
      [
        BigInt(actionId),
        {
          to: Principal.fromText(to),
        },
      ]
    );

    return utils.arrayBufferToUint8Array(x);
  };

  const withdraw_fees = async (to: string, actionId: string, sig: Buffer) => {
    await minter.withdraw_fees(
      BigInt(actionId),
      { to: Principal.fromText(to) },
      Array.from(sig)
    );
    return true;
  };

  const getAccountIdentifier = (principal: string) =>
    AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(principal),
    }).toHex();

  async function transferTxFee(amt: BigNumber, sender?: any): Promise<bigint> {
    //plug wallet
    if (sender.requestTransfer) {
      const res = await sender.requestTransfer({
        to: args.bridgeContract.toText(),
        amount: amt.integerValue().toNumber(),
      });
      return BigInt(res.height);
    }
    //bitfinity wallt
    if (sender.batchTransactions) {
      const res = (await new Promise(async (resolve, reject) => {
        await sender.batchTransactions(
          [
            {
              idl: ledgerIDL,
              canisterId: LEDGER_CANISTER,
              methodName: "send_dfx",
              args: [
                {
                  to: getAccountIdentifier(args.bridgeContract.toText()),
                  fee: { e8s: BigInt(10000) },
                  amount: {
                    e8s: BigInt(amt.integerValue().toString()),
                  },
                  memo: randomBigInt(),
                  from_subaccount: [],
                  created_at_time: [],
                },
              ],
              onSuccess: async (res: any) => {
                resolve({ height: res });
              },
              onFail: (err: any) => {
                console.log("transfer icp error", err);
                reject(err);
              },
            },
          ],
          { host: undefined }
        );
      })) as { height: number };

      return BigInt(res.height);
    }

    //default
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

  async function isApprovedForMinter(
    sender: DfinitySigner,
    nft: NftInfo<DfinityNft>
  ) {
    const agent = prepareAgent(sender);
    // const tid = tokenIdentifier(
    //   nft.collectionIdent,
    //   Number(nft.native.tokenId)
    // );
    // const nftContract = Principal.fromText(nft.native.canisterId);
    const nftCan = await Actor.createActor<XPNFTSERVICE>(xpnftIdl, {
      agent,
      canisterId: nft.native.canisterId,
    });
    const allowances = await nftCan.getAllowances();

    for (const [idx, principal] of allowances) {
      if (
        idx.toString() === nft.native.tokenId &&
        principal.toString() === args.bridgeContract.toString()
      ) {
        return true;
      }
    }
    return false;
  }

  return {
    getMinter: () => minter,
    XpNft: args.xpnftId.toString(),
    getParams: () => args,
    getNonce: () => Chain.DFINITY,
    estimateValidateTransferNft: async () => new BigNumber(0), // TODO
    estimateValidateUnfreezeNft: async () => new BigNumber(0), // TODO
    estimateContractDeploy: async () => {
      return new BigNumber("500000");
    },
    validateAddress(adr) {
      try {
        Principal.fromText(adr);
        return true;
      } catch {
        return false;
      }
    },
    getExtraFees() {
      return new BigNumber(0);
    },
    async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
      const agent = prepareAgent(sender);

      if (!(await isApprovedForMinter(sender, id))) {
        throw new Error(`Nft not approved for minter`);
      }

      const sig = await args.signatureSvc.getSignatureDfinity(
        Chain.DFINITY,
        chain_nonce as ChainNonce,
        to,
        1
      );

      const txFeeBlock = await transferTxFee(new BigNumber(sig.fee), sender);

      const minter: ActorSubclass<_SERVICE> = await createMinter(agent);

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
      const agent = prepareAgent(owner);

      const canister = Principal.fromText(
        options.canisterId ? options.canisterId : args.umt.toText()
      );

      const principal = owner.agent
        ? await args.agent.getPrincipal()
        : owner.getPrincipal();

      const nftCan = await Actor.createActor<XPNFTSERVICE>(xpnftIdl, {
        agent,
        canisterId: canister,
      });

      let mint = await nftCan.mintNFT({
        metadata: [[...Buffer.from(options.uri)]],
        to: {
          principal,
        },
      });

      return mint;
    },
    async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
      const agent = prepareAgent(sender);

      if (!(await isApprovedForMinter(sender, id))) {
        throw new Error(`Nft not approved for minter`);
      }
      const sig = await args.signatureSvc.getSignatureDfinity(
        Chain.DFINITY,
        nonce as ChainNonce,
        to,
        1
      );

      const txFeeBlock = await transferTxFee(new BigNumber(sig.fee), sender);

      const minter: ActorSubclass<_SERVICE> = await createMinter(agent);

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
    isApprovedForMinter,
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
      const agent = prepareAgent(sender);

      if (await isApprovedForMinter(sender, nft)) {
        return undefined;
      }

      const tid = tokenIdentifier(
        nft.collectionIdent,
        Number(nft.native.tokenId)
      );
      const actor = await Actor.createActor<XPNFTSERVICE>(xpnftIdl, {
        canisterId: nft.collectionIdent,
        agent,
      });

      await actor.approve({
        allowance: 1n,
        spender: args.bridgeContract,
        subaccount: [],
        token: tid,
      });
      return "no hash";
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
    getAccountIdentifier,

    async isNftWhitelisted(nft) {
      return await minter.is_whitelisted(
        Principal.fromText(nft.native.canisterId)
      );
    },
    //replace default createActor (of Actor class) with custom of Bitfinity Wallet signer (it has different interface than Actor.createActor)
    setActorCreator(provider: any) {
      Actor.createActor = (iface, args) => {
        //@ts-ignore
        const cid = args.canisterId.toText
          ? //@ts-ignore
            args.canisterId.toText()
          : args.canisterId;

        return provider.createActor({
          canisterId: cid,
          interfaceFactory: iface,
          host: undefined,
        });
      };
    },
    withdraw_fees,
    encode_withdraw_fees,
    async validatedMint(actionId: string) {
      const data = await minter
        .get_validated_event(BigInt(actionId))
        .catch((e) => {
          console.log(e, "in validatedMint");
        });

      if (data?.at(0)?.ValidatedMint?.mint_with) {
        return data.at(0)!.ValidatedMint!.mint_with.toString();
      }

      return "";
    },
  };
}
