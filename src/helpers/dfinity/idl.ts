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
    token_ids: IDL.Vec(IDL.Nat),
    burner: IDL.Principal,
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
  const UnfreezeNft = IDL.Record({
    uri: IDL.Text,
    token_id: IDL.Nat,
    burner: IDL.Principal,
  });
  const TransferNft = IDL.Record({
    dip721_contract: IDL.Principal,
    token_id: IDL.Nat,
    mint_with: IDL.Text,
    token_data: IDL.Text,
  });
  const TransferNftBatch = IDL.Record({
    dip721_contract: IDL.Principal,
    token_datas: IDL.Vec(IDL.Text),
    mint_with: IDL.Text,
    token_ids: IDL.Vec(IDL.Nat),
  });
  const BridgeEvent = IDL.Variant({
    UnfreezeNftBatch: UnfreezeNftBatch,
    UnfreezeNft: UnfreezeNft,
    TransferNft: TransferNft,
    TransferNftBatch: TransferNftBatch,
  });
  const ValidateSetGroupKey = IDL.Record({ group_key: IDL.Vec(IDL.Nat8) });
  const ValidateSetPause = IDL.Record({ pause: IDL.Bool });
  const ValidateWithdrawFees = IDL.Record({ to: IDL.Principal });
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
      [IDL.Nat8, IDL.Nat8, IDL.Text, IDL.Nat],
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
      [],
      []
    ),
    set_group_key: IDL.Func(
      [IDL.Nat, ValidateSetGroupKey, IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    set_pause: IDL.Func([IDL.Nat, ValidateSetPause, IDL.Vec(IDL.Nat8)], [], []),
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
      [],
      []
    ),
    validate_unfreeze_nft_batch: IDL.Func(
      [IDL.Nat, ValidateUnfreezeNftBatch, IDL.Vec(IDL.Nat8)],
      [],
      []
    ),
    withdraw_fees: IDL.Func(
      [IDL.Nat, ValidateWithdrawFees, IDL.Vec(IDL.Nat8)],
      [IDL.Nat64],
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
      [IDL.Nat64, IDL.Principal, IDL.Vec(IDL.Nat), IDL.Nat64, IDL.Text],
      [IDL.Nat],
      []
    ),
  });
};
