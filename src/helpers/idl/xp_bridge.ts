import { Idl } from "@project-serum/anchor";
import { Mutable } from "../../type-utils";

const val = {
  version: "0.1.0",
  name: "xp_bridge",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "costInLamports",
          type: "u64",
        },
        {
          name: "groupKey",
          type: {
            array: ["u8", 32],
          },
        },
      ],
    },
    {
      name: "createAction",
      accounts: [
        {
          name: "action",
          isMut: true,
          isSigner: true,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "action",
          type: "u64",
        },
      ],
    },
    {
      name: "validatePause",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "PauseData",
          },
        },
      ],
    },
    {
      name: "validateUnpause",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "UnpauseData",
          },
        },
      ],
    },
    {
      name: "validateWithdrawFees",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "WithdrawFeesData",
          },
        },
      ],
    },
    {
      name: "validateUpdateGroupkey",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "UpdateGroupkeyData",
          },
        },
      ],
    },
    {
      name: "validateTransferNft",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "editionAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "TransferNftData",
          },
        },
      ],
    },
    {
      name: "withdrawNft",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "chainNonce",
          type: "u8",
        },
        {
          name: "to",
          type: "string",
        },
        {
          name: "lamports",
          type: "u64",
        },
      ],
    },
    {
      name: "freezeNft",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "from",
          isMut: true,
          isSigner: false,
        },
        {
          name: "to",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "chainNonce",
          type: "u8",
        },
        {
          name: "to",
          type: "string",
        },
        {
          name: "lamports",
          type: "u64",
        },
        {
          name: "mintWith",
          type: "string",
        },
      ],
    },
    {
      name: "validateUnfreezeNft",
      accounts: [
        {
          name: "bridge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "from",
          isMut: true,
          isSigner: false,
        },
        {
          name: "to",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "action",
          isMut: false,
          isSigner: false,
        },
        {
          name: "consumedAction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "instructionAcc",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "UnfreezeNftData",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "Bridge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "paused",
            type: "bool",
          },
          {
            name: "txFees",
            type: "u64",
          },
          {
            name: "costInLamports",
            type: "u64",
          },
          {
            name: "groupKey",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "actionId",
            type: "u128",
          },
        ],
      },
    },
    {
      name: "Action",
      type: {
        kind: "struct",
        fields: [
          {
            name: "action",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ConsumedAction",
      type: {
        kind: "struct",
        fields: [
          {
            name: "consumed",
            type: "bool",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "PauseData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UnpauseData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateGroupkeyData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
          {
            name: "newKey",
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "TransferNftData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
          {
            name: "chainNonce",
            type: "u64",
          },
          {
            name: "tokenName",
            type: "string",
          },
          {
            name: "tokenSymbol",
            type: "string",
          },
          {
            name: "tokenUri",
            type: "string",
          },
          {
            name: "owner",
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "AnchorDataV2",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "sellerFeeBasisPoints",
            type: "u16",
          },
          {
            name: "creators",
            type: {
              option: {
                vec: {
                  defined: "AnchorCreator",
                },
              },
            },
          },
          {
            name: "collection",
            type: {
              option: {
                defined: "AnchorCollection",
              },
            },
          },
          {
            name: "uses",
            type: {
              option: {
                defined: "AnchorUses",
              },
            },
          },
        ],
      },
    },
    {
      name: "AnchorCreator",
      type: {
        kind: "struct",
        fields: [
          {
            name: "address",
            type: "publicKey",
          },
          {
            name: "verified",
            type: "bool",
          },
          {
            name: "share",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "AnchorCollection",
      type: {
        kind: "struct",
        fields: [
          {
            name: "verified",
            type: "bool",
          },
          {
            name: "key",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "AnchorUses",
      type: {
        kind: "struct",
        fields: [
          {
            name: "useMethod",
            type: {
              defined: "AnchorUseMethod",
            },
          },
          {
            name: "remaining",
            type: "u64",
          },
          {
            name: "total",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "WithdrawFeesData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UnfreezeNftData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "actionId",
            type: "u64",
          },
          {
            name: "receiver",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "mint",
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "AnchorUseMethod",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Burn",
          },
          {
            name: "Multiple",
          },
          {
            name: "Single",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "TransferNft",
      fields: [
        {
          name: "chainNonce",
          type: "u8",
          index: false,
        },
        {
          name: "to",
          type: "string",
          index: true,
        },
        {
          name: "mint",
          type: "publicKey",
          index: false,
        },
        {
          name: "actionId",
          type: "u128",
          index: false,
        },
        {
          name: "mintWith",
          type: "string",
          index: false,
        },
        {
          name: "lamports",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "UnfreezeNft",
      fields: [
        {
          name: "chainNonce",
          type: "u8",
          index: false,
        },
        {
          name: "to",
          type: "string",
          index: true,
        },
        {
          name: "actionId",
          type: "u128",
          index: false,
        },
        {
          name: "mint",
          type: "publicKey",
          index: false,
        },
        {
          name: "lamports",
          type: "u64",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "Paused",
      msg: "Pausable: paused",
    },
    {
      code: 6001,
      name: "Unpaused",
      msg: "Pausable: unpaused",
    },
    {
      code: 6002,
      name: "AlreadyMinted",
      msg: "Already minted",
    },
    {
      code: 6003,
      name: "AlreadyBurned",
      msg: "Already burned",
    },
    {
      code: 6004,
      name: "InstructionAtWrongIndex",
      msg: "instruction at wrong index",
    },
    {
      code: 6005,
      name: "InvalidEd25519Instruction",
      msg: "invalid ed25519 instruction",
    },
    {
      code: 6006,
      name: "InvalidGroupKey",
      msg: "invalid group key",
    },
    {
      code: 6007,
      name: "InvalidProgramId",
      msg: "invalid program id",
    },
    {
      code: 6008,
      name: "InvalidArgs",
      msg: "invalid args",
    },
    {
      code: 6009,
      name: "InvalidActionId",
      msg: "invalid action id",
    },
    {
      code: 6010,
      name: "DuplicatedAction",
      msg: "duplicated action",
    },
    {
      code: 6011,
      name: "IncorrectOwner",
      msg: "incorrect owner",
    },
    {
      code: 6012,
      name: "InvalidMint",
      msg: "invalid mint",
    },
    {
      code: 6013,
      name: "InsufficientFundsForTransaction",
      msg: "insufficient funds for transaction",
    },
  ],
} as const;

export default val as Mutable<typeof val> & Idl;
