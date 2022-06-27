"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
};
exports.default = val;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBfYnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvaWRsL3hwX2JyaWRnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLE1BQU0sR0FBRyxHQUFHO0lBQ1YsT0FBTyxFQUFFLE9BQU87SUFDaEIsSUFBSSxFQUFFLFdBQVc7SUFDakIsWUFBWSxFQUFFO1FBQ1o7WUFDRSxJQUFJLEVBQUUsWUFBWTtZQUNsQixRQUFRLEVBQUU7Z0JBQ1I7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLElBQUk7b0JBQ1gsUUFBUSxFQUFFLEtBQUs7aUJBQ2hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxNQUFNO29CQUNaLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNyQixLQUFLLEVBQUUsS0FBSztvQkFDWixRQUFRLEVBQUUsS0FBSztpQkFDaEI7YUFDRjtZQUNELElBQUksRUFBRTtnQkFDSjtvQkFDRSxJQUFJLEVBQUUsZ0JBQWdCO29CQUN0QixJQUFJLEVBQUUsS0FBSztpQkFDWjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsSUFBSSxFQUFFO3dCQUNKLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7cUJBQ2xCO2lCQUNGO2FBQ0Y7U0FDRjtRQUNEO1lBQ0UsSUFBSSxFQUFFLGNBQWM7WUFDcEIsUUFBUSxFQUFFO2dCQUNSO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxNQUFNO29CQUNaLEtBQUssRUFBRSxJQUFJO29CQUNYLFFBQVEsRUFBRSxJQUFJO2lCQUNmO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNyQixLQUFLLEVBQUUsS0FBSztv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