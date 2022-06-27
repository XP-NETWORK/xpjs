import { Idl } from "@project-serum/anchor";
import { Mutable } from "../../type-utils";
declare const _default: Mutable<{
    readonly version: "0.1.0";
    readonly name: "xp_bridge";
    readonly instructions: readonly [{
        readonly name: "initialize";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "costInLamports";
            readonly type: "u64";
        }, {
            readonly name: "groupKey";
            readonly type: {
                readonly array: readonly ["u8", 32];
            };
        }];
    }, {
        readonly name: "createAction";
        readonly accounts: readonly [{
            readonly name: "action";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "action";
            readonly type: "u64";
        }];
    }, {
        readonly name: "validatePause";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "PauseData";
            };
        }];
    }, {
        readonly name: "validateUnpause";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "UnpauseData";
            };
        }];
    }, {
        readonly name: "validateWithdrawFees";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "WithdrawFeesData";
            };
        }];
    }, {
        readonly name: "validateUpdateGroupkey";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "user";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "UpdateGroupkeyData";
            };
        }];
    }, {
        readonly name: "validateTransferNft";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "payer";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "authority";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "mint";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "tokenAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "metadataAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "editionAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "metadataProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "tokenProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "rent";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "TransferNftData";
            };
        }];
    }, {
        readonly name: "withdrawNft";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "authority";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "mint";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "tokenAccount";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "tokenProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "chainNonce";
            readonly type: "u8";
        }, {
            readonly name: "to";
            readonly type: "string";
        }, {
            readonly name: "lamports";
            readonly type: "u64";
        }];
    }, {
        readonly name: "freezeNft";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "authority";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "from";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "to";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "tokenProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "chainNonce";
            readonly type: "u8";
        }, {
            readonly name: "to";
            readonly type: "string";
        }, {
            readonly name: "lamports";
            readonly type: "u64";
        }, {
            readonly name: "mintWith";
            readonly type: "string";
        }];
    }, {
        readonly name: "validateUnfreezeNft";
        readonly accounts: readonly [{
            readonly name: "bridge";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "from";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "to";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "tokenProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "action";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "consumedAction";
            readonly isMut: true;
            readonly isSigner: false;
        }, {
            readonly name: "payer";
            readonly isMut: true;
            readonly isSigner: true;
        }, {
            readonly name: "systemProgram";
            readonly isMut: false;
            readonly isSigner: false;
        }, {
            readonly name: "instructionAcc";
            readonly isMut: false;
            readonly isSigner: false;
        }];
        readonly args: readonly [{
            readonly name: "data";
            readonly type: {
                readonly defined: "UnfreezeNftData";
            };
        }];
    }];
    readonly accounts: readonly [{
        readonly name: "Bridge";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "paused";
                readonly type: "bool";
            }, {
                readonly name: "txFees";
                readonly type: "u64";
            }, {
                readonly name: "costInLamports";
                readonly type: "u64";
            }, {
                readonly name: "groupKey";
                readonly type: {
                    readonly array: readonly ["u8", 32];
                };
            }, {
                readonly name: "actionId";
                readonly type: "u128";
            }];
        };
    }, {
        readonly name: "Action";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "action";
                readonly type: "u64";
            }];
        };
    }, {
        readonly name: "ConsumedAction";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "consumed";
                readonly type: "bool";
            }];
        };
    }];
    readonly types: readonly [{
        readonly name: "PauseData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }];
        };
    }, {
        readonly name: "UnpauseData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }];
        };
    }, {
        readonly name: "UpdateGroupkeyData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }, {
                readonly name: "newKey";
                readonly type: {
                    readonly array: readonly ["u8", 32];
                };
            }];
        };
    }, {
        readonly name: "TransferNftData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }, {
                readonly name: "chainNonce";
                readonly type: "u64";
            }, {
                readonly name: "tokenName";
                readonly type: "string";
            }, {
                readonly name: "tokenSymbol";
                readonly type: "string";
            }, {
                readonly name: "tokenUri";
                readonly type: "string";
            }, {
                readonly name: "owner";
                readonly type: {
                    readonly array: readonly ["u8", 32];
                };
            }];
        };
    }, {
        readonly name: "AnchorDataV2";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "name";
                readonly type: "string";
            }, {
                readonly name: "symbol";
                readonly type: "string";
            }, {
                readonly name: "uri";
                readonly type: "string";
            }, {
                readonly name: "sellerFeeBasisPoints";
                readonly type: "u16";
            }, {
                readonly name: "creators";
                readonly type: {
                    readonly option: {
                        readonly vec: {
                            readonly defined: "AnchorCreator";
                        };
                    };
                };
            }, {
                readonly name: "collection";
                readonly type: {
                    readonly option: {
                        readonly defined: "AnchorCollection";
                    };
                };
            }, {
                readonly name: "uses";
                readonly type: {
                    readonly option: {
                        readonly defined: "AnchorUses";
                    };
                };
            }];
        };
    }, {
        readonly name: "AnchorCreator";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "address";
                readonly type: "publicKey";
            }, {
                readonly name: "verified";
                readonly type: "bool";
            }, {
                readonly name: "share";
                readonly type: "u8";
            }];
        };
    }, {
        readonly name: "AnchorCollection";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "verified";
                readonly type: "bool";
            }, {
                readonly name: "key";
                readonly type: "publicKey";
            }];
        };
    }, {
        readonly name: "AnchorUses";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "useMethod";
                readonly type: {
                    readonly defined: "AnchorUseMethod";
                };
            }, {
                readonly name: "remaining";
                readonly type: "u64";
            }, {
                readonly name: "total";
                readonly type: "u64";
            }];
        };
    }, {
        readonly name: "WithdrawFeesData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }];
        };
    }, {
        readonly name: "UnfreezeNftData";
        readonly type: {
            readonly kind: "struct";
            readonly fields: readonly [{
                readonly name: "actionId";
                readonly type: "u64";
            }, {
                readonly name: "receiver";
                readonly type: {
                    readonly array: readonly ["u8", 32];
                };
            }, {
                readonly name: "mint";
                readonly type: {
                    readonly array: readonly ["u8", 32];
                };
            }];
        };
    }, {
        readonly name: "AnchorUseMethod";
        readonly type: {
            readonly kind: "enum";
            readonly variants: readonly [{
                readonly name: "Burn";
            }, {
                readonly name: "Multiple";
            }, {
                readonly name: "Single";
            }];
        };
    }];
    readonly events: readonly [{
        readonly name: "TransferNft";
        readonly fields: readonly [{
            readonly name: "chainNonce";
            readonly type: "u8";
            readonly index: false;
        }, {
            readonly name: "to";
            readonly type: "string";
            readonly index: true;
        }, {
            readonly name: "mint";
            readonly type: "publicKey";
            readonly index: false;
        }, {
            readonly name: "actionId";
            readonly type: "u128";
            readonly index: false;
        }, {
            readonly name: "mintWith";
            readonly type: "string";
            readonly index: false;
        }, {
            readonly name: "lamports";
            readonly type: "u64";
            readonly index: false;
        }];
    }, {
        readonly name: "UnfreezeNft";
        readonly fields: readonly [{
            readonly name: "chainNonce";
            readonly type: "u8";
            readonly index: false;
        }, {
            readonly name: "to";
            readonly type: "string";
            readonly index: true;
        }, {
            readonly name: "actionId";
            readonly type: "u128";
            readonly index: false;
        }, {
            readonly name: "mint";
            readonly type: "publicKey";
            readonly index: false;
        }, {
            readonly name: "lamports";
            readonly type: "u64";
            readonly index: false;
        }];
    }];
    readonly errors: readonly [{
        readonly code: 6000;
        readonly name: "Paused";
        readonly msg: "Pausable: paused";
    }, {
        readonly code: 6001;
        readonly name: "Unpaused";
        readonly msg: "Pausable: unpaused";
    }, {
        readonly code: 6002;
        readonly name: "AlreadyMinted";
        readonly msg: "Already minted";
    }, {
        readonly code: 6003;
        readonly name: "AlreadyBurned";
        readonly msg: "Already burned";
    }, {
        readonly code: 6004;
        readonly name: "InstructionAtWrongIndex";
        readonly msg: "instruction at wrong index";
    }, {
        readonly code: 6005;
        readonly name: "InvalidEd25519Instruction";
        readonly msg: "invalid ed25519 instruction";
    }, {
        readonly code: 6006;
        readonly name: "InvalidGroupKey";
        readonly msg: "invalid group key";
    }, {
        readonly code: 6007;
        readonly name: "InvalidProgramId";
        readonly msg: "invalid program id";
    }, {
        readonly code: 6008;
        readonly name: "InvalidArgs";
        readonly msg: "invalid args";
    }, {
        readonly code: 6009;
        readonly name: "InvalidActionId";
        readonly msg: "invalid action id";
    }, {
        readonly code: 6010;
        readonly name: "DuplicatedAction";
        readonly msg: "duplicated action";
    }, {
        readonly code: 6011;
        readonly name: "IncorrectOwner";
        readonly msg: "incorrect owner";
    }, {
        readonly code: 6012;
        readonly name: "InvalidMint";
        readonly msg: "invalid mint";
    }, {
        readonly code: 6013;
        readonly name: "InsufficientFundsForTransaction";
        readonly msg: "insufficient funds for transaction";
    }];
}> & Idl;
export default _default;
