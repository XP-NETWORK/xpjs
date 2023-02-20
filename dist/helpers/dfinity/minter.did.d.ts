import type { Principal } from "@dfinity/principal";
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
  from_action: bigint;
  to_action: bigint;
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
  add_whitelist: (
    arg_0: bigint,
    arg_1: ValidateWhitelistDip721,
    arg_2: Array<number>
  ) => Promise<undefined>;
  clean_logs: (
    arg_0: bigint,
    arg_1: ValidateCleanLogs,
    arg_2: Array<number>
  ) => Promise<undefined>;
  encode_validate_transfer_nft: (
    arg_0: bigint,
    arg_1: ValidateTransferNft
  ) => Promise<Array<number>>;
  encode_validate_transfer_nft_batch: (
    arg_0: bigint,
    arg_1: ValidateTransferNftBatch
  ) => Promise<Array<number>>;
  encode_validate_unfreeze_nft: (
    arg_0: bigint,
    arg_1: ValidateUnfreezeNft
  ) => Promise<Array<number>>;
  encode_validate_unfreeze_nft_batch: (
    arg_0: bigint,
    arg_1: ValidateUnfreezeNftBatch
  ) => Promise<Array<number>>;
  freeze_nft: (
    arg_0: bigint,
    arg_1: Principal,
    arg_2: bigint,
    arg_3: bigint,
    arg_4: string,
    arg_5: string
  ) => Promise<bigint>;
  freeze_nft_batch: (
    arg_0: bigint,
    arg_1: Principal,
    arg_2: Array<bigint>,
    arg_3: bigint,
    arg_4: string,
    arg_5: string
  ) => Promise<bigint>;
  get_config: () => Promise<Config>;
  get_event: (arg_0: bigint) => Promise<[] | [[BridgeEventCtx, BridgeEvent]]>;
  is_whitelisted: (arg_0: Principal) => Promise<boolean>;
  set_group_key: (
    arg_0: bigint,
    arg_1: ValidateSetGroupKey,
    arg_2: Array<number>
  ) => Promise<undefined>;
  set_pause: (
    arg_0: bigint,
    arg_1: ValidateSetPause,
    arg_2: Array<number>
  ) => Promise<undefined>;
  validate_transfer_nft: (
    arg_0: bigint,
    arg_1: ValidateTransferNft,
    arg_2: Array<number>
  ) => Promise<number>;
  validate_transfer_nft_batch: (
    arg_0: bigint,
    arg_1: ValidateTransferNftBatch,
    arg_2: Array<number>
  ) => Promise<undefined>;
  validate_unfreeze_nft: (
    arg_0: bigint,
    arg_1: ValidateUnfreezeNft,
    arg_2: Array<number>
  ) => Promise<undefined>;
  validate_unfreeze_nft_batch: (
    arg_0: bigint,
    arg_1: ValidateUnfreezeNftBatch,
    arg_2: Array<number>
  ) => Promise<undefined>;
  withdraw_fees: (
    arg_0: bigint,
    arg_1: ValidateWithdrawFees,
    arg_2: Array<number>
  ) => Promise<bigint>;
  withdraw_nft: (
    arg_0: bigint,
    arg_1: Principal,
    arg_2: bigint,
    arg_3: bigint,
    arg_4: string
  ) => Promise<bigint>;
  withdraw_nft_batch: (
    arg_0: bigint,
    arg_1: Principal,
    arg_2: Array<bigint>,
    arg_3: bigint,
    arg_4: string
  ) => Promise<bigint>;
}
