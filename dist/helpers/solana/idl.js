"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
exports.IDL = {
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
                    name: "groupKey",
                    type: {
                        array: ["u8", 32],
                    },
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
                {
                    name: "bridgeBump",
                    type: "u8",
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
                {
                    name: "bridgeBump",
                    type: "u8",
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
            name: "bridge",
            type: {
                kind: "struct",
                fields: [
                    {
                        name: "paused",
                        type: "bool",
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
            name: "consumedAction",
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
                    {
                        name: "bridgeBump",
                        type: "u8",
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
                    {
                        name: "bridgeBump",
                        type: "u8",
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
                        name: "bridgeBump",
                        type: "u8",
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
                        name: "bridgeBump",
                        type: "u8",
                    },
                    {
                        name: "authBump",
                        type: "u8",
                    },
                    {
                        name: "chainNonce",
                        type: "u64",
                    },
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
                        name: "owner",
                        type: "publicKey",
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
                        name: "sellerFeeBasisPoints",
                        type: {
                            option: "u16",
                        },
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
                        docs: ["The name of the asset"],
                        type: "string",
                    },
                    {
                        name: "symbol",
                        docs: ["The symbol for the asset"],
                        type: "string",
                    },
                    {
                        name: "uri",
                        docs: ["URI pointing to JSON representing the asset"],
                        type: "string",
                    },
                    {
                        name: "sellerFeeBasisPoints",
                        docs: [
                            "Royalty basis points that goes to creators in secondary sales (0-10000)",
                        ],
                        type: "u16",
                    },
                    {
                        name: "creators",
                        docs: ["Array of creators, optional"],
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
                        docs: ["Collection"],
                        type: {
                            option: {
                                defined: "AnchorCollection",
                            },
                        },
                    },
                    {
                        name: "uses",
                        docs: ["Uses"],
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
                    {
                        name: "bridgeBump",
                        type: "u8",
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
                        name: "bridgeBump",
                        type: "u8",
                    },
                    {
                        name: "receiver",
                        type: "publicKey",
                    },
                    {
                        name: "mint",
                        type: "publicKey",
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvc29sYW5hL2lkbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFpNEJhLFFBQUEsR0FBRyxHQUFhO0lBQzNCLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLElBQUksRUFBRSxXQUFXO0lBQ2pCLFlBQVksRUFBRTtRQUNaO1lBQ0UsSUFBSSxFQUFFLFlBQVk7WUFDbEIsUUFBUSxFQUFFO2dCQUNSO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxLQUFLO2lCQUNoQjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsTUFBTTtvQkFDWixLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUUsSUFBSTtpQkFDZjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsZUFBZTtvQkFDckIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osUUFBUSxFQUFFLEtBQUs7aUJBQ2hCO2FBQ0Y7WUFDRCxJQUFJLEVBQUU7Z0JBQ0o7b0JBQ0UsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRTt3QkFDSixLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO3FCQUNsQjtpQkFDRjthQUNGO1NBQ0Y7UUFDRDtZQUNFLElBQUksRUFBRSxlQUFlO1lBQ3JCLFFBQVEsRUFBRTtnQkFDUjtvQkFDRSxJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUUsS0FBSztpQkFDaEI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsS0FBSyxFQUFFLElBQUk7b0JBQ1gsUUFBUSxFQUFFLEtBQUs7aUJBQ2hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxNQUFNO29CQUNaLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNy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