import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export interface AllowanceRequest {
  token: TokenIdentifier;
  owner: User;
  spender: Principal;
}
export interface ApproveRequest {
  token: TokenIdentifier;
  subaccount: [] | [SubAccount];
  allowance: Balance;
  spender: Principal;
}
export type Balance = bigint;
export interface BalanceRequest {
  token: TokenIdentifier;
  user: User;
}
export type BalanceResponse = { ok: Balance } | { err: CommonError__1 };
export type Balance__1 = bigint;
export type CommonError = { InvalidToken: TokenIdentifier } | { Other: string };
export type CommonError__1 =
  | { InvalidToken: TokenIdentifier }
  | { Other: string };
export type Extension = string;
export type Memo = Uint8Array | number[];
export type Metadata =
  | {
      fungible: {
        decimals: number;
        metadata: [] | [Uint8Array | number[]];
        name: string;
        symbol: string;
      };
    }
  | { nonfungible: { metadata: [] | [Uint8Array | number[]] } };
export interface MintRequest {
  to: User;
  metadata: [] | [Uint8Array | number[]];
}
export type Result = { ok: Balance__1 } | { err: CommonError };
export type Result_1 = { ok: Metadata } | { err: CommonError };
export type Result_2 = { ok: AccountIdentifier__1 } | { err: CommonError };
export type SubAccount = Uint8Array | number[];
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface TransferRequest {
  to: User;
  token: TokenIdentifier;
  notify: boolean;
  from: User;
  memo: Memo;
  subaccount: [] | [SubAccount];
  amount: Balance;
}
export type TransferResponse =
  | { ok: Balance }
  | {
      err:
        | { CannotNotify: AccountIdentifier }
        | { InsufficientBalance: null }
        | { InvalidToken: TokenIdentifier }
        | { Rejected: null }
        | { Unauthorized: AccountIdentifier }
        | { Other: string };
    };
export type User = { principal: Principal } | { address: AccountIdentifier };
export interface XPNFT {
  acceptCycles: ActorMethod<[], undefined>;
  allowance: ActorMethod<[AllowanceRequest], Result>;
  approve: ActorMethod<[ApproveRequest], undefined>;
  availableCycles: ActorMethod<[], bigint>;
  balance: ActorMethod<[BalanceRequest], BalanceResponse>;
  bearer: ActorMethod<[TokenIdentifier__1], Result_2>;
  burnNFT: ActorMethod<[number], TokenIndex>;
  extensions: ActorMethod<[], Array<Extension>>;
  getAllowances: ActorMethod<[], Array<[TokenIndex, Principal]>>;
  getMinter: ActorMethod<[], Principal>;
  getRegistry: ActorMethod<[], Array<[TokenIndex, AccountIdentifier__1]>>;
  getTokens: ActorMethod<[], Array<[TokenIndex, Metadata]>>;
  metadata: ActorMethod<[TokenIdentifier__1], Result_1>;
  mintNFT: ActorMethod<[MintRequest], TokenIndex>;
  setMinter: ActorMethod<[Principal], undefined>;
  supply: ActorMethod<[TokenIdentifier__1], Result>;
  transfer: ActorMethod<[TransferRequest], TransferResponse>;
}
export interface XPNFTSERVICE extends XPNFT {}

export const xpnftIdl = ({ IDL }: any) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    principal: IDL.Principal,
    address: AccountIdentifier,
  });
  const AllowanceRequest = IDL.Record({
    token: TokenIdentifier,
    owner: User,
    spender: IDL.Principal,
  });
  const Balance__1 = IDL.Nat;
  const CommonError = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  });
  const Result = IDL.Variant({ ok: Balance__1, err: CommonError });
  const SubAccount = IDL.Vec(IDL.Nat8);
  const Balance = IDL.Nat;
  const ApproveRequest = IDL.Record({
    token: TokenIdentifier,
    subaccount: IDL.Opt(SubAccount),
    allowance: Balance,
    spender: IDL.Principal,
  });
  const BalanceRequest = IDL.Record({
    token: TokenIdentifier,
    user: User,
  });
  const CommonError__1 = IDL.Variant({
    InvalidToken: TokenIdentifier,
    Other: IDL.Text,
  });
  const BalanceResponse = IDL.Variant({
    ok: Balance,
    err: CommonError__1,
  });
  const TokenIdentifier__1 = IDL.Text;
  const AccountIdentifier__1 = IDL.Text;
  const Result_2 = IDL.Variant({
    ok: AccountIdentifier__1,
    err: CommonError,
  });
  const TokenIndex = IDL.Nat32;
  const Extension = IDL.Text;
  const Metadata = IDL.Variant({
    fungible: IDL.Record({
      decimals: IDL.Nat8,
      metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
      name: IDL.Text,
      symbol: IDL.Text,
    }),
    nonfungible: IDL.Record({ metadata: IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const Result_1 = IDL.Variant({ ok: Metadata, err: CommonError });
  const MintRequest = IDL.Record({
    to: User,
    metadata: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    to: User,
    token: TokenIdentifier,
    notify: IDL.Bool,
    from: User,
    memo: Memo,
    subaccount: IDL.Opt(SubAccount),
    amount: Balance,
  });
  const TransferResponse = IDL.Variant({
    ok: Balance,
    err: IDL.Variant({
      CannotNotify: AccountIdentifier,
      InsufficientBalance: IDL.Null,
      InvalidToken: TokenIdentifier,
      Rejected: IDL.Null,
      Unauthorized: AccountIdentifier,
      Other: IDL.Text,
    }),
  });
  const XPNFT = IDL.Service({
    acceptCycles: IDL.Func([], [], []),
    allowance: IDL.Func([AllowanceRequest], [Result], ["query"]),
    approve: IDL.Func([ApproveRequest], [], []),
    availableCycles: IDL.Func([], [IDL.Nat], ["query"]),
    balance: IDL.Func([BalanceRequest], [BalanceResponse], ["query"]),
    bearer: IDL.Func([TokenIdentifier__1], [Result_2], ["query"]),
    burnNFT: IDL.Func([IDL.Nat32], [TokenIndex], []),
    extensions: IDL.Func([], [IDL.Vec(Extension)], ["query"]),
    getAllowances: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(TokenIndex, IDL.Principal))],
      ["query"]
    ),
    getMinter: IDL.Func([], [IDL.Principal], ["query"]),
    getRegistry: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier__1))],
      ["query"]
    ),
    getTokens: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(TokenIndex, Metadata))],
      ["query"]
    ),
    metadata: IDL.Func([TokenIdentifier__1], [Result_1], ["query"]),
    mintNFT: IDL.Func([MintRequest], [TokenIndex], []),
    setMinter: IDL.Func([IDL.Principal], [], []),
    supply: IDL.Func([TokenIdentifier__1], [Result], ["query"]),
    transfer: IDL.Func([TransferRequest], [TransferResponse], []),
  });
  return XPNFT;
};
