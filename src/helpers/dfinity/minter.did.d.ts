import type { Principal } from "@dfinity/principal";
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
  fee_public_key: Array<number>;
  chain_nonce: bigint;
  group_key: Array<number>;
  paused: boolean;
}
export interface TransferNft {
  dip721_contract: Principal;
  token_id: bigint;
  mint_with: string;
  token_data: string;
}
export interface TransferNftBatch {
  dip721_contract: Principal;
  token_datas: Array<string>;
  mint_with: string;
  token_ids: Array<bigint>;
}
export interface UnfreezeNft {
  uri: string;
  token_id: bigint;
  burner: Principal;
}
export interface UnfreezeNftBatch {
  uris: Array<string>;
  token_ids: Array<bigint>;
  burner: Principal;
}
export interface ValidateCleanLogs {
  action_id: bigint;
}
export interface ValidateSetGroupKey {
  group_key: Array<number>;
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
export interface _SERVICE {
  add_whitelist: ActorMethod<
    [bigint, ValidateWhitelistDip721, Array<number>],
    undefined
  >;
  clean_logs: ActorMethod<
    [bigint, ValidateCleanLogs, Array<number>],
    undefined
  >;
  encode_transfer_tx: ActorMethod<
    [number, number, string, bigint],
    Array<number>
  >;
  encode_validate_transfer_nft: ActorMethod<
    [bigint, ValidateTransferNft],
    Array<number>
  >;
  encode_validate_transfer_nft_batch: ActorMethod<
    [bigint, ValidateTransferNftBatch],
    Array<number>
  >;
  encode_validate_unfreeze_nft: ActorMethod<
    [bigint, ValidateUnfreezeNft],
    Array<number>
  >;
  encode_validate_unfreeze_nft_batch: ActorMethod<
    [bigint, ValidateUnfreezeNftBatch],
    Array<number>
  >;
  freeze_nft: ActorMethod<
    [bigint, Principal, bigint, bigint, string, string, Array<number>],
    bigint
  >;
  freeze_nft_batch: ActorMethod<
    [bigint, Principal, Array<bigint>, bigint, string, string],
    bigint
  >;
  get_config: ActorMethod<[], Config>;
  get_event: ActorMethod<[bigint], [] | [[BridgeEventCtx, BridgeEvent]]>;
  is_whitelisted: ActorMethod<[Principal], boolean>;
  set_fee_group_key: ActorMethod<
    [bigint, ValidateSetGroupKey, Array<number>],
    undefined
  >;
  set_group_key: ActorMethod<
    [bigint, ValidateSetGroupKey, Array<number>],
    undefined
  >;
  set_pause: ActorMethod<[bigint, ValidateSetPause, Array<number>], undefined>;
  validate_transfer_nft: ActorMethod<
    [bigint, ValidateTransferNft, Array<number>],
    number
  >;
  validate_transfer_nft_batch: ActorMethod<
    [bigint, ValidateTransferNftBatch, Array<number>],
    undefined
  >;
  validate_unfreeze_nft: ActorMethod<
    [bigint, ValidateUnfreezeNft, Array<number>],
    undefined
  >;
  validate_unfreeze_nft_batch: ActorMethod<
    [bigint, ValidateUnfreezeNftBatch, Array<number>],
    undefined
  >;
  withdraw_fees: ActorMethod<
    [bigint, ValidateWithdrawFees, Array<number>],
    bigint
  >;
  withdraw_nft: ActorMethod<
    [bigint, Principal, bigint, bigint, string, Array<number>],
    bigint
  >;
  withdraw_nft_batch: ActorMethod<
    [bigint, Principal, Array<bigint>, bigint, string],
    bigint
  >;
}
