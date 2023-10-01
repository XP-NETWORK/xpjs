export const idlFactory = ({ IDL }: any) => {
  const ValidateWhitelistDip721 = IDL.Record({
    dip_contract: IDL.Principal,
  });
  const ValidateCleanLogs = IDL.Record({ action_id: IDL.Nat });
  const ValidateTransferNft = IDL.Record({
    to: IDL.Principal,
    mint_with: IDL.Principal,
    token_url: IDL.Text,
  });
  const ValidateTransferNftBatch = IDL.Record({
    to: IDL.Principal,
    mint_with: IDL.Vec(IDL.Principal),
    token_urls: IDL.Vec(IDL.Text),
  });
  const ValidateUnfreezeNft = IDL.Record({
    to: IDL.Principal,
    dip_contract: IDL.Principal,
    token_id: IDL.Nat,
  });
  const ValidateUnfreezeNftBatch = IDL.Record({
    to: IDL.Principal,
    dip_contracts: IDL.Vec(IDL.Principal),
    token_ids: IDL.Vec(IDL.Nat),
  });
  const ValidateWithdrawFees = IDL.Record({ to: IDL.Principal });
  const Config = IDL.Record({
    event_cnt: IDL.Nat,
    fee_public_key: IDL.Vec(IDL.Nat8),
    chain_nonce: IDL.Nat64,
    group_key: IDL.Vec(IDL.Nat8),
    paused: IDL.Bool,
  });
  const BridgeEventCtx = IDL.Record({
    to: IDL.Text,
    action_id: IDL.Nat,
    tx_fee: IDL.Nat64,
    chain_nonce: IDL.Nat64,
  });
  const UnfreezeNftBatch = IDL.Record({
    uris: IDL.Vec(IDL.Text),
    caller: IDL.Principal,
    token_ids: IDL.Vec(IDL.Nat),
    burner: IDL.Principal,
  });
  const UnfreezeNft = IDL.Record({
    uri: IDL.Text,
    token_id: IDL.Nat,
    caller: IDL.Principal,
    burner: IDL.Principal,
  });
  const TransferNft = IDL.Record({
    dip721_contract: IDL.Principal,
    token_id: IDL.Nat,
    mint_with: IDL.Text,
    caller: IDL.Principal,
    token_data: IDL.Text,
  });
  const TransferNftBatch = IDL.Record({
    dip721_contract: IDL.Principal,
    token_datas: IDL.Vec(IDL.Text),
    mint_with: IDL.Text,
    caller: IDL.Principal,
    token_ids: IDL.Vec(IDL.Nat),
  });
  const BridgeEvent = IDL.Variant({
    UnfreezeNftBatch: UnfreezeNftBatch,
    UnfreezeNft: UnfreezeNft,
    TransferNft: TransferNft,
    TransferNftBatch: TransferNftBatch,
  });
  const KeyType = IDL.Variant({
    FeeKey: IDL.Null,
    BridgeGroupKey: IDL.Null,
  });
  const ValidatedEvent = IDL.Variant({
    ValidatedPause: IDL.Record({ paused: IDL.Bool }),
    ValidatedUpdateKey: IDL.Record({
      key: IDL.Vec(IDL.Nat8),
      key_type: KeyType,
    }),
    ValidatedUnfreeze: IDL.Record({
      to: IDL.Principal,
      token_id: IDL.Nat,
      contract: IDL.Principal,
    }),
    ValidatedUnfreezeBatch: IDL.Record({
      to: IDL.Principal,
      contracts: IDL.Vec(IDL.Principal),
      token_ids: IDL.Vec(IDL.Nat),
    }),
    ValidatedMintBatch: IDL.Record({
      mint_with: IDL.Vec(IDL.Principal),
      token_ids: IDL.Vec(IDL.Nat32),
    }),
    ValidatedMint: IDL.Record({
      token_id: IDL.Nat32,
      mint_with: IDL.Principal,
    }),
    ValidatedFeeWithdraw: IDL.Record({
      to: IDL.Principal,
      block_index: IDL.Nat64,
    }),
  });
  const ValidateSetGroupKey = IDL.Record({ group_key: IDL.Vec(IDL.Nat8) });
  const ValidateSetPause = IDL.Record({ pause: IDL.Bool });
  return IDL.Service({
    add_whitelist: IDL.Func(
      [IDL.Nat, ValidateWhitelistDip721, IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    clean_logs: IDL.Func(
      [IDL.Nat, ValidateCleanLogs, IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    encode_transfer_tx: IDL.Func(
      [IDL.Nat8, IDL.Nat8, IDL.Text, IDL.Nat, IDL.Nat],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    encode_validate_transfer_nft: IDL.Func(
      [IDL.Nat, ValidateTransferNft],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    encode_validate_transfer_nft_batch: IDL.Func(
      [IDL.Nat, ValidateTransferNftBatch],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    encode_validate_unfreeze_nft: IDL.Func(
      [IDL.Nat, ValidateUnfreezeNft],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    encode_validate_unfreeze_nft_batch: IDL.Func(
      [IDL.Nat, ValidateUnfreezeNftBatch],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    encode_withdraw_fees: IDL.Func(
      [IDL.Nat, ValidateWithdrawFees],
      [IDL.Vec(IDL.Nat8)],
      ["query"]
    ),
    freeze_nft: IDL.Func(
      [
        IDL.Nat64,
        IDL.Principal,
        IDL.Nat,
        IDL.Nat64,
        IDL.Text,
        IDL.Text,
        IDL.Vec(IDL.Nat8),
      ],
      [IDL.Nat],
      []
    ),
    freeze_nft_batch: IDL.Func(
      [
        IDL.Nat64,
        IDL.Principal,
        IDL.Vec(IDL.Nat),
        IDL.Nat64,
        IDL.Text,
        IDL.Text,
        IDL.Vec(IDL.Nat8),
      ],
      [IDL.Nat],
      []
    ),
    get_config: IDL.Func([], [Config], ["query"]),
    get_event: IDL.Func(
      [IDL.Nat],
      [IDL.Opt(IDL.Tuple(BridgeEventCtx, BridgeEvent))],
      ["query"]
    ),
    get_validated_event: IDL.Func(
      [IDL.Nat],
      [IDL.Opt(ValidatedEvent)],
      ["query"]
    ),
    is_whitelisted: IDL.Func([IDL.Principal], [IDL.Bool], ["query"]),
    set_fee_group_key: IDL.Func(
      [IDL.Nat, ValidateSetGroupKey, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    set_group_key: IDL.Func(
      [IDL.Nat, ValidateSetGroupKey, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    set_pause: IDL.Func(
      [IDL.Nat, ValidateSetPause, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    validate_transfer_nft: IDL.Func(
      [IDL.Nat, ValidateTransferNft, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    validate_transfer_nft_batch: IDL.Func(
      [IDL.Nat, ValidateTransferNftBatch, IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    validate_unfreeze_nft: IDL.Func(
      [IDL.Nat, ValidateUnfreezeNft, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    validate_unfreeze_nft_batch: IDL.Func(
      [IDL.Nat, ValidateUnfreezeNftBatch, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    withdraw_fees: IDL.Func(
      [IDL.Nat, ValidateWithdrawFees, IDL.Vec(IDL.Nat8)],
      [IDL.Nat32],
      []
    ),
    withdraw_nft: IDL.Func(
      [
        IDL.Nat64,
        IDL.Principal,
        IDL.Nat,
        IDL.Nat64,
        IDL.Text,
        IDL.Vec(IDL.Nat8),
      ],
      [IDL.Nat],
      []
    ),
    withdraw_nft_batch: IDL.Func(
      [
        IDL.Nat64,
        IDL.Principal,
        IDL.Vec(IDL.Nat),
        IDL.Nat64,
        IDL.Text,
        IDL.Vec(IDL.Nat8),
      ],
      [IDL.Nat],
      []
    ),
  });
};
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export function createActor(canisterId: string | Principal, agent: HttpAgent) {
  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
}
import type { ActorMethod } from "@dfinity/agent";

export type BridgeEvent =
  | { UnfreezeNftBatch: UnfreezeNftBatch }
  | { UnfreezeNft: UnfreezeNft }
  | { TransferNft: TransferNft }
  | { TransferNftBatch: TransferNftBatch };
export interface BridgeEventCtx {
  to: string;
  action_id: bigint;
  tx_fee: bigint;
  chain_nonce: bigint;
}
export interface Config {
  event_cnt: bigint;
  fee_public_key: Uint8Array | number[];
  chain_nonce: bigint;
  group_key: Uint8Array | number[];
  paused: boolean;
}
export type KeyType = { FeeKey: null } | { BridgeGroupKey: null };
export interface TransferNft {
  dip721_contract: Principal;
  token_id: bigint;
  mint_with: string;
  caller: Principal;
  token_data: string;
}
export interface TransferNftBatch {
  dip721_contract: Principal;
  token_datas: Array<string>;
  mint_with: string;
  caller: Principal;
  token_ids: Array<bigint>;
}
export interface UnfreezeNft {
  uri: string;
  token_id: bigint;
  caller: Principal;
  burner: Principal;
}
export interface UnfreezeNftBatch {
  uris: Array<string>;
  caller: Principal;
  token_ids: Array<bigint>;
  burner: Principal;
}
export interface ValidateCleanLogs {
  action_id: bigint;
}
export interface ValidateSetGroupKey {
  group_key: Uint8Array | number[];
}
export interface ValidateSetPause {
  pause: boolean;
}
export interface ValidateTransferNft {
  to: Principal;
  mint_with: Principal;
  token_url: string;
}
export interface ValidateTransferNftBatch {
  to: Principal;
  mint_with: Array<Principal>;
  token_urls: Array<string>;
}
export interface ValidateUnfreezeNft {
  to: Principal;
  dip_contract: Principal;
  token_id: bigint;
}
export interface ValidateUnfreezeNftBatch {
  to: Principal;
  dip_contracts: Array<Principal>;
  token_ids: Array<bigint>;
}
export interface ValidateWhitelistDip721 {
  dip_contract: Principal;
}
export interface ValidateWithdrawFees {
  to: Principal;
}
export type ValidatedEvent = {
  ValidatedPause?: { paused: boolean };
  ValidatedUpdateKey?: {
    key: Uint8Array | number[];
    key_type: KeyType;
  };
  ValidatedUnfreeze?: {
    to: Principal;
    token_id: bigint;
    contract: Principal;
  };
  ValidatedUnfreezeBatch?: {
    to: Principal;
    contracts: Array<Principal>;
    token_ids: Array<bigint>;
  };
  ValidatedMintBatch?: {
    mint_with: Array<Principal>;
    token_ids: Uint32Array | number[];
  };
  ValidatedMint?: { token_id: number; mint_with: Principal };
  ValidatedFeeWithdraw?: { to: Principal; block_index: bigint };
};

export interface _SERVICE {
  add_whitelist: ActorMethod<
    [bigint, ValidateWhitelistDip721, Uint8Array | number[]],
    undefined
  >;
  clean_logs: ActorMethod<
    [bigint, ValidateCleanLogs, Uint8Array | number[]],
    undefined
  >;
  encode_transfer_tx: ActorMethod<
    [number, number, string, bigint, bigint],
    Uint8Array | number[]
  >;
  encode_validate_transfer_nft: ActorMethod<
    [bigint, ValidateTransferNft],
    Uint8Array | number[]
  >;
  encode_validate_transfer_nft_batch: ActorMethod<
    [bigint, ValidateTransferNftBatch],
    Uint8Array | number[]
  >;
  encode_validate_unfreeze_nft: ActorMethod<
    [bigint, ValidateUnfreezeNft],
    Uint8Array | number[]
  >;
  encode_validate_unfreeze_nft_batch: ActorMethod<
    [bigint, ValidateUnfreezeNftBatch],
    Uint8Array | number[]
  >;
  encode_withdraw_fees: ActorMethod<
    [bigint, ValidateWithdrawFees],
    Uint8Array | number[]
  >;
  freeze_nft: ActorMethod<
    [bigint, Principal, bigint, bigint, string, string, Uint8Array | number[]],
    bigint
  >;
  freeze_nft_batch: ActorMethod<
    [
      bigint,
      Principal,
      Array<bigint>,
      bigint,
      string,
      string,
      Uint8Array | number[]
    ],
    bigint
  >;
  get_config: ActorMethod<[], Config>;
  get_event: ActorMethod<[bigint], [] | [[BridgeEventCtx, BridgeEvent]]>;
  get_validated_event: ActorMethod<[bigint], [] | ValidatedEvent[]>;
  is_whitelisted: ActorMethod<[Principal], boolean>;
  set_fee_group_key: ActorMethod<
    [bigint, ValidateSetGroupKey, Uint8Array | number[]],
    number
  >;
  set_group_key: ActorMethod<
    [bigint, ValidateSetGroupKey, Uint8Array | number[]],
    number
  >;
  set_pause: ActorMethod<
    [bigint, ValidateSetPause, Uint8Array | number[]],
    number
  >;
  validate_transfer_nft: ActorMethod<
    [bigint, ValidateTransferNft, Uint8Array | number[]],
    number
  >;
  validate_transfer_nft_batch: ActorMethod<
    [bigint, ValidateTransferNftBatch, Uint8Array | number[]],
    undefined
  >;
  validate_unfreeze_nft: ActorMethod<
    [bigint, ValidateUnfreezeNft, Uint8Array | number[]],
    number
  >;
  validate_unfreeze_nft_batch: ActorMethod<
    [bigint, ValidateUnfreezeNftBatch, Uint8Array | number[]],
    number
  >;
  withdraw_fees: ActorMethod<
    [bigint, ValidateWithdrawFees, Uint8Array | number[]],
    number
  >;
  withdraw_nft: ActorMethod<
    [bigint, Principal, bigint, bigint, string, Uint8Array | number[]],
    bigint
  >;
  withdraw_nft_batch: ActorMethod<
    [bigint, Principal, Array<bigint>, bigint, string, Uint8Array | number[]],
    bigint
  >;
}
