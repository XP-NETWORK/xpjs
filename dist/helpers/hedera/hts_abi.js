"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEDERA_PROXY_BC = exports.HEDERA_PROXY_ABI = exports.HEDERA_TOKEN_SERVICE_ABI = void 0;
exports.HEDERA_TOKEN_SERVICE_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "uint256",
                name: "allowance",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "approved",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "serialNumber",
                type: "uint256",
            },
        ],
        name: "approveNFT",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "associateToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "address[]",
                name: "tokens",
                type: "address[]",
            },
        ],
        name: "associateTokens",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "amount",
                type: "uint64",
            },
            {
                internalType: "int64[]",
                name: "serialNumbers",
                type: "int64[]",
            },
        ],
        name: "burnToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "uint64",
                name: "newTotalSupply",
                type: "uint64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "token",
                type: "tuple",
            },
            {
                internalType: "uint64",
                name: "initialTotalSupply",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "decimals",
                type: "uint32",
            },
        ],
        name: "createFungibleToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "token",
                type: "tuple",
            },
            {
                internalType: "uint64",
                name: "initialTotalSupply",
                type: "uint64",
            },
            {
                internalType: "uint32",
                name: "decimals",
                type: "uint32",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "amount",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "tokenId",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "useHbarsForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "useCurrentTokenForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.FixedFee[]",
                name: "fixedFees",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "numerator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "denominator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "minimumAmount",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "maximumAmount",
                        type: "uint32",
                    },
                    {
                        internalType: "bool",
                        name: "netOfTransfers",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.FractionalFee[]",
                name: "fractionalFees",
                type: "tuple[]",
            },
        ],
        name: "createFungibleTokenWithCustomFees",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "token",
                type: "tuple",
            },
        ],
        name: "createNonFungibleToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "token",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "amount",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "tokenId",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "useHbarsForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "useCurrentTokenForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.FixedFee[]",
                name: "fixedFees",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "numerator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "denominator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "amount",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "tokenId",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "useHbarsForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.RoyaltyFee[]",
                name: "royaltyFees",
                type: "tuple[]",
            },
        ],
        name: "createNonFungibleTokenWithCustomFees",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "token",
                        type: "address",
                    },
                    {
                        components: [
                            {
                                internalType: "address",
                                name: "accountID",
                                type: "address",
                            },
                            {
                                internalType: "int64",
                                name: "amount",
                                type: "int64",
                            },
                        ],
                        internalType: "struct IHederaTokenService.AccountAmount[]",
                        name: "transfers",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "address",
                                name: "senderAccountID",
                                type: "address",
                            },
                            {
                                internalType: "address",
                                name: "receiverAccountID",
                                type: "address",
                            },
                            {
                                internalType: "int64",
                                name: "serialNumber",
                                type: "int64",
                            },
                        ],
                        internalType: "struct IHederaTokenService.NftTransfer[]",
                        name: "nftTransfers",
                        type: "tuple[]",
                    },
                ],
                internalType: "struct IHederaTokenService.TokenTransferList[]",
                name: "tokenTransfers",
                type: "tuple[]",
            },
        ],
        name: "cryptoTransfer",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "deleteToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "dissociateToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "address[]",
                name: "tokens",
                type: "address[]",
            },
        ],
        name: "dissociateTokens",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "freezeToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "serialNumber",
                type: "uint256",
            },
        ],
        name: "getApproved",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "address",
                name: "approved",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getFungibleTokenInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        components: [
                            {
                                components: [
                                    {
                                        internalType: "string",
                                        name: "name",
                                        type: "string",
                                    },
                                    {
                                        internalType: "string",
                                        name: "symbol",
                                        type: "string",
                                    },
                                    {
                                        internalType: "address",
                                        name: "treasury",
                                        type: "address",
                                    },
                                    {
                                        internalType: "string",
                                        name: "memo",
                                        type: "string",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "tokenSupplyType",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "int64",
                                        name: "maxSupply",
                                        type: "int64",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "freezeDefault",
                                        type: "bool",
                                    },
                                    {
                                        components: [
                                            {
                                                internalType: "uint256",
                                                name: "keyType",
                                                type: "uint256",
                                            },
                                            {
                                                components: [
                                                    {
                                                        internalType: "bool",
                                                        name: "inheritAccountKey",
                                                        type: "bool",
                                                    },
                                                    {
                                                        internalType: "address",
                                                        name: "contractId",
                                                        type: "address",
                                                    },
                                                    {
                                                        internalType: "bytes",
                                                        name: "ed25519",
                                                        type: "bytes",
                                                    },
                                                    {
                                                        internalType: "bytes",
                                                        name: "ECDSA_secp256k1",
                                                        type: "bytes",
                                                    },
                                                    {
                                                        internalType: "address",
                                                        name: "delegatableContractId",
                                                        type: "address",
                                                    },
                                                ],
                                                internalType: "struct IHederaTokenService.KeyValue",
                                                name: "key",
                                                type: "tuple",
                                            },
                                        ],
                                        internalType: "struct IHederaTokenService.TokenKey[]",
                                        name: "tokenKeys",
                                        type: "tuple[]",
                                    },
                                    {
                                        components: [
                                            {
                                                internalType: "uint32",
                                                name: "second",
                                                type: "uint32",
                                            },
                                            {
                                                internalType: "address",
                                                name: "autoRenewAccount",
                                                type: "address",
                                            },
                                            {
                                                internalType: "uint32",
                                                name: "autoRenewPeriod",
                                                type: "uint32",
                                            },
                                        ],
                                        internalType: "struct IHederaTokenService.Expiry",
                                        name: "expiry",
                                        type: "tuple",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.HederaToken",
                                name: "hedera",
                                type: "tuple",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "amount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "address",
                                        name: "tokenId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useHbarsForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useCurrentTokenForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.FixedFee[]",
                                name: "fixedFees",
                                type: "tuple[]",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "numerator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "denominator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "minimumAmount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "maximumAmount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "netOfTransfers",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.FractionalFee[]",
                                name: "fractionalFees",
                                type: "tuple[]",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "numerator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "denominator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "amount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "address",
                                        name: "tokenId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useHbarsForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.RoyaltyFee[]",
                                name: "royaltyFees",
                                type: "tuple[]",
                            },
                            {
                                internalType: "bool",
                                name: "defaultKycStatus",
                                type: "bool",
                            },
                            {
                                internalType: "bool",
                                name: "deleted",
                                type: "bool",
                            },
                            {
                                internalType: "string",
                                name: "ledgerId",
                                type: "string",
                            },
                            {
                                internalType: "bool",
                                name: "pauseStatus",
                                type: "bool",
                            },
                            {
                                internalType: "uint64",
                                name: "totalSupply",
                                type: "uint64",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenInfo",
                        name: "tokenInfo",
                        type: "tuple",
                    },
                    {
                        internalType: "uint32",
                        name: "decimals",
                        type: "uint32",
                    },
                ],
                internalType: "struct IHederaTokenService.FungibleTokenInfo",
                name: "fungibleTokenInfo",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "int64",
                name: "serialNumber",
                type: "int64",
            },
        ],
        name: "getNonFungibleTokenInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        components: [
                            {
                                components: [
                                    {
                                        internalType: "string",
                                        name: "name",
                                        type: "string",
                                    },
                                    {
                                        internalType: "string",
                                        name: "symbol",
                                        type: "string",
                                    },
                                    {
                                        internalType: "address",
                                        name: "treasury",
                                        type: "address",
                                    },
                                    {
                                        internalType: "string",
                                        name: "memo",
                                        type: "string",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "tokenSupplyType",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "int64",
                                        name: "maxSupply",
                                        type: "int64",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "freezeDefault",
                                        type: "bool",
                                    },
                                    {
                                        components: [
                                            {
                                                internalType: "uint256",
                                                name: "keyType",
                                                type: "uint256",
                                            },
                                            {
                                                components: [
                                                    {
                                                        internalType: "bool",
                                                        name: "inheritAccountKey",
                                                        type: "bool",
                                                    },
                                                    {
                                                        internalType: "address",
                                                        name: "contractId",
                                                        type: "address",
                                                    },
                                                    {
                                                        internalType: "bytes",
                                                        name: "ed25519",
                                                        type: "bytes",
                                                    },
                                                    {
                                                        internalType: "bytes",
                                                        name: "ECDSA_secp256k1",
                                                        type: "bytes",
                                                    },
                                                    {
                                                        internalType: "address",
                                                        name: "delegatableContractId",
                                                        type: "address",
                                                    },
                                                ],
                                                internalType: "struct IHederaTokenService.KeyValue",
                                                name: "key",
                                                type: "tuple",
                                            },
                                        ],
                                        internalType: "struct IHederaTokenService.TokenKey[]",
                                        name: "tokenKeys",
                                        type: "tuple[]",
                                    },
                                    {
                                        components: [
                                            {
                                                internalType: "uint32",
                                                name: "second",
                                                type: "uint32",
                                            },
                                            {
                                                internalType: "address",
                                                name: "autoRenewAccount",
                                                type: "address",
                                            },
                                            {
                                                internalType: "uint32",
                                                name: "autoRenewPeriod",
                                                type: "uint32",
                                            },
                                        ],
                                        internalType: "struct IHederaTokenService.Expiry",
                                        name: "expiry",
                                        type: "tuple",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.HederaToken",
                                name: "hedera",
                                type: "tuple",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "amount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "address",
                                        name: "tokenId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useHbarsForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useCurrentTokenForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.FixedFee[]",
                                name: "fixedFees",
                                type: "tuple[]",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "numerator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "denominator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "minimumAmount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "maximumAmount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "netOfTransfers",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.FractionalFee[]",
                                name: "fractionalFees",
                                type: "tuple[]",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "numerator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "denominator",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "amount",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "address",
                                        name: "tokenId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bool",
                                        name: "useHbarsForPayment",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "feeCollector",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.RoyaltyFee[]",
                                name: "royaltyFees",
                                type: "tuple[]",
                            },
                            {
                                internalType: "bool",
                                name: "defaultKycStatus",
                                type: "bool",
                            },
                            {
                                internalType: "bool",
                                name: "deleted",
                                type: "bool",
                            },
                            {
                                internalType: "string",
                                name: "ledgerId",
                                type: "string",
                            },
                            {
                                internalType: "bool",
                                name: "pauseStatus",
                                type: "bool",
                            },
                            {
                                internalType: "uint64",
                                name: "totalSupply",
                                type: "uint64",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenInfo",
                        name: "tokenInfo",
                        type: "tuple",
                    },
                    {
                        internalType: "int64",
                        name: "serialNumber",
                        type: "int64",
                    },
                    {
                        internalType: "address",
                        name: "ownerId",
                        type: "address",
                    },
                    {
                        internalType: "int64",
                        name: "creationTime",
                        type: "int64",
                    },
                    {
                        internalType: "bytes",
                        name: "metadata",
                        type: "bytes",
                    },
                    {
                        internalType: "address",
                        name: "spenderId",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.NonFungibleTokenInfo",
                name: "nonFungibleTokenInfo",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenCustomFees",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "amount",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "tokenId",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "useHbarsForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "useCurrentTokenForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.FixedFee[]",
                name: "fixedFees",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "numerator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "denominator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "minimumAmount",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "maximumAmount",
                        type: "uint32",
                    },
                    {
                        internalType: "bool",
                        name: "netOfTransfers",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.FractionalFee[]",
                name: "fractionalFees",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "numerator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "denominator",
                        type: "uint32",
                    },
                    {
                        internalType: "uint32",
                        name: "amount",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "tokenId",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "useHbarsForPayment",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "feeCollector",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.RoyaltyFee[]",
                name: "royaltyFees",
                type: "tuple[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenDefaultFreezeStatus",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "defaultFreezeStatus",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenDefaultKycStatus",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "defaultKycStatus",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenExpiryInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "second",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "autoRenewAccount",
                        type: "address",
                    },
                    {
                        internalType: "uint32",
                        name: "autoRenewPeriod",
                        type: "uint32",
                    },
                ],
                internalType: "struct IHederaTokenService.Expiry",
                name: "expiry",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "string",
                                name: "name",
                                type: "string",
                            },
                            {
                                internalType: "string",
                                name: "symbol",
                                type: "string",
                            },
                            {
                                internalType: "address",
                                name: "treasury",
                                type: "address",
                            },
                            {
                                internalType: "string",
                                name: "memo",
                                type: "string",
                            },
                            {
                                internalType: "bool",
                                name: "tokenSupplyType",
                                type: "bool",
                            },
                            {
                                internalType: "int64",
                                name: "maxSupply",
                                type: "int64",
                            },
                            {
                                internalType: "bool",
                                name: "freezeDefault",
                                type: "bool",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint256",
                                        name: "keyType",
                                        type: "uint256",
                                    },
                                    {
                                        components: [
                                            {
                                                internalType: "bool",
                                                name: "inheritAccountKey",
                                                type: "bool",
                                            },
                                            {
                                                internalType: "address",
                                                name: "contractId",
                                                type: "address",
                                            },
                                            {
                                                internalType: "bytes",
                                                name: "ed25519",
                                                type: "bytes",
                                            },
                                            {
                                                internalType: "bytes",
                                                name: "ECDSA_secp256k1",
                                                type: "bytes",
                                            },
                                            {
                                                internalType: "address",
                                                name: "delegatableContractId",
                                                type: "address",
                                            },
                                        ],
                                        internalType: "struct IHederaTokenService.KeyValue",
                                        name: "key",
                                        type: "tuple",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.TokenKey[]",
                                name: "tokenKeys",
                                type: "tuple[]",
                            },
                            {
                                components: [
                                    {
                                        internalType: "uint32",
                                        name: "second",
                                        type: "uint32",
                                    },
                                    {
                                        internalType: "address",
                                        name: "autoRenewAccount",
                                        type: "address",
                                    },
                                    {
                                        internalType: "uint32",
                                        name: "autoRenewPeriod",
                                        type: "uint32",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.Expiry",
                                name: "expiry",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.HederaToken",
                        name: "hedera",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "amount",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "tokenId",
                                type: "address",
                            },
                            {
                                internalType: "bool",
                                name: "useHbarsForPayment",
                                type: "bool",
                            },
                            {
                                internalType: "bool",
                                name: "useCurrentTokenForPayment",
                                type: "bool",
                            },
                            {
                                internalType: "address",
                                name: "feeCollector",
                                type: "address",
                            },
                        ],
                        internalType: "struct IHederaTokenService.FixedFee[]",
                        name: "fixedFees",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "numerator",
                                type: "uint32",
                            },
                            {
                                internalType: "uint32",
                                name: "denominator",
                                type: "uint32",
                            },
                            {
                                internalType: "uint32",
                                name: "minimumAmount",
                                type: "uint32",
                            },
                            {
                                internalType: "uint32",
                                name: "maximumAmount",
                                type: "uint32",
                            },
                            {
                                internalType: "bool",
                                name: "netOfTransfers",
                                type: "bool",
                            },
                            {
                                internalType: "address",
                                name: "feeCollector",
                                type: "address",
                            },
                        ],
                        internalType: "struct IHederaTokenService.FractionalFee[]",
                        name: "fractionalFees",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "numerator",
                                type: "uint32",
                            },
                            {
                                internalType: "uint32",
                                name: "denominator",
                                type: "uint32",
                            },
                            {
                                internalType: "uint32",
                                name: "amount",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "tokenId",
                                type: "address",
                            },
                            {
                                internalType: "bool",
                                name: "useHbarsForPayment",
                                type: "bool",
                            },
                            {
                                internalType: "address",
                                name: "feeCollector",
                                type: "address",
                            },
                        ],
                        internalType: "struct IHederaTokenService.RoyaltyFee[]",
                        name: "royaltyFees",
                        type: "tuple[]",
                    },
                    {
                        internalType: "bool",
                        name: "defaultKycStatus",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "deleted",
                        type: "bool",
                    },
                    {
                        internalType: "string",
                        name: "ledgerId",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "pauseStatus",
                        type: "bool",
                    },
                    {
                        internalType: "uint64",
                        name: "totalSupply",
                        type: "uint64",
                    },
                ],
                internalType: "struct IHederaTokenService.TokenInfo",
                name: "tokenInfo",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "keyType",
                type: "uint256",
            },
        ],
        name: "getTokenKey",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                components: [
                    {
                        internalType: "bool",
                        name: "inheritAccountKey",
                        type: "bool",
                    },
                    {
                        internalType: "address",
                        name: "contractId",
                        type: "address",
                    },
                    {
                        internalType: "bytes",
                        name: "ed25519",
                        type: "bytes",
                    },
                    {
                        internalType: "bytes",
                        name: "ECDSA_secp256k1",
                        type: "bytes",
                    },
                    {
                        internalType: "address",
                        name: "delegatableContractId",
                        type: "address",
                    },
                ],
                internalType: "struct IHederaTokenService.KeyValue",
                name: "key",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenType",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "int32",
                name: "tokenType",
                type: "int32",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "grantTokenKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "isFrozen",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "frozen",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "isKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "kycGranted",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "isToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "isToken",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "amount",
                type: "uint64",
            },
            {
                internalType: "bytes[]",
                name: "metadata",
                type: "bytes[]",
            },
        ],
        name: "mintToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "uint64",
                name: "newTotalSupply",
                type: "uint64",
            },
            {
                internalType: "int64[]",
                name: "serialNumbers",
                type: "int64[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "pauseToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "revokeTokenKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "serialNumber",
                type: "uint256",
            },
        ],
        name: "transferFromNFT",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "int64",
                name: "serialNumber",
                type: "int64",
            },
        ],
        name: "transferNFT",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address[]",
                name: "sender",
                type: "address[]",
            },
            {
                internalType: "address[]",
                name: "receiver",
                type: "address[]",
            },
            {
                internalType: "int64[]",
                name: "serialNumber",
                type: "int64[]",
            },
        ],
        name: "transferNFTs",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "int64",
                name: "amount",
                type: "int64",
            },
        ],
        name: "transferToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address[]",
                name: "accountId",
                type: "address[]",
            },
            {
                internalType: "int64[]",
                name: "amount",
                type: "int64[]",
            },
        ],
        name: "transferTokens",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "unfreezeToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "unpauseToken",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "second",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "autoRenewAccount",
                        type: "address",
                    },
                    {
                        internalType: "uint32",
                        name: "autoRenewPeriod",
                        type: "uint32",
                    },
                ],
                internalType: "struct IHederaTokenService.Expiry",
                name: "expiryInfo",
                type: "tuple",
            },
        ],
        name: "updateTokenExpiryInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "tokenInfo",
                type: "tuple",
            },
        ],
        name: "updateTokenInfo",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "keyType",
                        type: "uint256",
                    },
                    {
                        components: [
                            {
                                internalType: "bool",
                                name: "inheritAccountKey",
                                type: "bool",
                            },
                            {
                                internalType: "address",
                                name: "contractId",
                                type: "address",
                            },
                            {
                                internalType: "bytes",
                                name: "ed25519",
                                type: "bytes",
                            },
                            {
                                internalType: "bytes",
                                name: "ECDSA_secp256k1",
                                type: "bytes",
                            },
                            {
                                internalType: "address",
                                name: "delegatableContractId",
                                type: "address",
                            },
                        ],
                        internalType: "struct IHederaTokenService.KeyValue",
                        name: "key",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.TokenKey[]",
                name: "keys",
                type: "tuple[]",
            },
        ],
        name: "updateTokenKeys",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "uint32",
                name: "amount",
                type: "uint32",
            },
        ],
        name: "wipeTokenAccount",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                internalType: "int64[]",
                name: "serialNumbers",
                type: "int64[]",
            },
        ],
        name: "wipeTokenAccountNFT",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
exports.HEDERA_PROXY_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        inputs: [],
        name: "DEFAULT_EXPIRY",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "MAX_INT",
        outputs: [
            {
                internalType: "int64",
                name: "",
                type: "int64",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "baseURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "baseUri",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "serialNum",
                type: "uint256",
            },
        ],
        name: "burnFor",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int64",
                name: "serialNum",
                type: "int64",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "claimNft",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "data",
                type: "uint256",
            },
        ],
        name: "decodeHts",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "int64",
                name: "",
                type: "int64",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "claimer",
                type: "address",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getClaimableNfts",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getTokenExpiryInfo",
        outputs: [
            {
                internalType: "int256",
                name: "responseCode",
                type: "int256",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "second",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "autoRenewAccount",
                        type: "address",
                    },
                    {
                        internalType: "uint32",
                        name: "autoRenewPeriod",
                        type: "uint32",
                    },
                ],
                internalType: "struct IHederaTokenService.Expiry",
                name: "expiryInfo",
                type: "tuple",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "grantTokenKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "htsToken",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "symbol",
                type: "string",
            },
            {
                internalType: "string",
                name: "baseURI_",
                type: "string",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "isKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
            {
                internalType: "bool",
                name: "kycGranted",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "pauseToken",
        outputs: [
            {
                internalType: "int256",
                name: "responseCode",
                type: "int256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "revokeTokenKyc",
        outputs: [
            {
                internalType: "int64",
                name: "responseCode",
                type: "int64",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_serialNum",
                type: "uint256",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
        ],
        name: "tokenURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "unpauseToken",
        outputs: [
            {
                internalType: "int256",
                name: "responseCode",
                type: "int256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "second",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "autoRenewAccount",
                        type: "address",
                    },
                    {
                        internalType: "uint32",
                        name: "autoRenewPeriod",
                        type: "uint32",
                    },
                ],
                internalType: "struct IHederaTokenService.Expiry",
                name: "expiryInfo",
                type: "tuple",
            },
        ],
        name: "updateTokenExpiryInfo",
        outputs: [
            {
                internalType: "int256",
                name: "responseCode",
                type: "int256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "treasury",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "memo",
                        type: "string",
                    },
                    {
                        internalType: "bool",
                        name: "tokenSupplyType",
                        type: "bool",
                    },
                    {
                        internalType: "int64",
                        name: "maxSupply",
                        type: "int64",
                    },
                    {
                        internalType: "bool",
                        name: "freezeDefault",
                        type: "bool",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "keyType",
                                type: "uint256",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bool",
                                        name: "inheritAccountKey",
                                        type: "bool",
                                    },
                                    {
                                        internalType: "address",
                                        name: "contractId",
                                        type: "address",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ed25519",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "bytes",
                                        name: "ECDSA_secp256k1",
                                        type: "bytes",
                                    },
                                    {
                                        internalType: "address",
                                        name: "delegatableContractId",
                                        type: "address",
                                    },
                                ],
                                internalType: "struct IHederaTokenService.KeyValue",
                                name: "key",
                                type: "tuple",
                            },
                        ],
                        internalType: "struct IHederaTokenService.TokenKey[]",
                        name: "tokenKeys",
                        type: "tuple[]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint32",
                                name: "second",
                                type: "uint32",
                            },
                            {
                                internalType: "address",
                                name: "autoRenewAccount",
                                type: "address",
                            },
                            {
                                internalType: "uint32",
                                name: "autoRenewPeriod",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct IHederaTokenService.Expiry",
                        name: "expiry",
                        type: "tuple",
                    },
                ],
                internalType: "struct IHederaTokenService.HederaToken",
                name: "tokenInfo",
                type: "tuple",
            },
        ],
        name: "updateTokenInfo",
        outputs: [
            {
                internalType: "int256",
                name: "responseCode",
                type: "int256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
exports.HEDERA_PROXY_BC = "0x60806040523480156200001157600080fd5b506200001d336200012a565b6002602081815260017fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b557fe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e09190915560047f679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c5560087f88601476d11616a71c5be67555bd1dff4b1cbf21533d2669b768b61518cfe1c35560107fee60d0579bcffd98e668647d59fec1ff86a7fb340ce572e844f234ae73a6918f557fb98b78633099fa36ed8b8680c4f8092689e1e04080eb9cbb077ca38a14d7e38455600660005260407f59dd4b18488d12f51eda69757a0ed42a2010c14b564330cc74a06895e60c077b556200017a565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6139ae806200018a6000396000f3fe60806040526004361061018b5760003560e01c80637ad43629116100d6578063a6487c531161007f578063d614cdb811610059578063d614cdb814610483578063f2c31ff4146104b1578063f2fde38b146104eb57600080fd5b8063a6487c5314610430578063af99c63314610443578063c87b56dd1461046357600080fd5b80638f8d7f99116100b05780638f8d7f99146103db57806394d008ef146103fb5780639abc83201461041b57600080fd5b80637ad436291461037d5780637c41ad2c1461039d5780638da5cb5b146103bd57600080fd5b80633b3bff0f11610138578063593d6e8211610112578063593d6e82146103265780636c0360eb14610346578063715018a61461036857600080fd5b80633b3bff0f146102ba57806342842e0e146102da57806351761bcc146102fa57600080fd5b80630e44263a116101695780630e44263a1461022557806318370d341461026a5780631dd319cb1461029857600080fd5b8063098d3228146101905780630b5d6cab146101c05780630bc14a69146101ed575b600080fd5b34801561019c57600080fd5b506101a863ffffffff81565b60405160079190910b81526020015b60405180910390f35b3480156101cc57600080fd5b506101e06101db366004612151565b61050b565b6040516101b7919061218a565b3480156101f957600080fd5b5060045461020d906001600160a01b031681565b6040516001600160a01b0390911681526020016101b7565b34801561023157600080fd5b506102486102403660046121ce565b606081901c91565b604080516001600160a01b03909316835260079190910b6020830152016101b7565b34801561027657600080fd5b5061028a610285366004612581565b610545565b6040519081526020016101b7565b3480156102a457600080fd5b506102b86102b33660046126c9565b610622565b005b3480156102c657600080fd5b5061028a6102d53660046126f5565b610750565b3480156102e657600080fd5b506102b86102f5366004612712565b610843565b34801561030657600080fd5b506103116278645081565b60405163ffffffff90911681526020016101b7565b34801561033257600080fd5b5061028a610341366004612753565b6109e7565b34801561035257600080fd5b5061035b610a13565b6040516101b791906127e1565b34801561037457600080fd5b506102b8610a3b565b34801561038957600080fd5b506102b86103983660046127f4565b610a4f565b3480156103a957600080fd5b5061028a6103b83660046126f5565b610afe565b3480156103c957600080fd5b506000546001600160a01b031661020d565b3480156103e757600080fd5b506101a86103f6366004612151565b610b45565b34801561040757600080fd5b506102b8610416366004612812565b610b94565b34801561042757600080fd5b5061035b610d7c565b6102b861043e36600461289b565b610e0a565b34801561044f57600080fd5b506101a861045e366004612151565b6110c4565b34801561046f57600080fd5b5061035b61047e3660046121ce565b611113565b34801561048f57600080fd5b506104a361049e3660046126f5565b611188565b6040516101b7929190612923565b3480156104bd57600080fd5b506104d16104cc366004612151565b6112ab565b6040805160079390930b83529015156020830152016101b7565b3480156104f757600080fd5b506102b86105063660046126f5565b61138f565b6001600160a01b03808316600090815260056020908152604080832093851683529290522060609061053c9061141f565b90505b92915050565b60008060006101676001600160a01b03166318370d3460e01b8686604051602401610571929190612b21565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516105af9190612b4b565b6000604051808303816000865af19150503d80600081146105ec576040519150601f19603f3d011682016040523d82523d6000602084013e6105f1565b606091505b509150915081610602576015610616565b808060200190518101906106169190612b79565b60030b95945050505050565b61062a611433565b600454600090610645906001600160a01b031684308561148d565b9050601681146106548261158e565b6040516020016106649190612b94565b6040516020818303038152906040529061069a5760405162461bcd60e51b815260040161069191906127e1565b60405180910390fd5b506040805160018082528183019092526000916020808301908036833701905050905082816000815181106106d1576106d1612bff565b60079290920b602092830291909101909101526004546106fc906001600160a01b031660008361162e565b5091506016821461070c8361158e565b60405160200161071c9190612c15565b604051602081830303815290604052906107495760405162461bcd60e51b815260040161069191906127e1565b5050505050565b6040516001600160a01b038216602482015260009081908190610167907f3b3bff0f00000000000000000000000000000000000000000000000000000000906044015b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516107d19190612b4b565b6000604051808303816000865af19150503d806000811461080e576040519150601f19603f3d011682016040523d82523d6000602084013e610813565b606091505b509150915081610824576015610838565b808060200190518101906108389190612b79565b60030b949350505050565b61084b611433565b606081901c60008181526006602052604081205483919060ff166108ef576108733084611717565b90506016811480610884575060c281145b61088d8261158e565b60405160200161089d9190612c66565b604051602081830303815290604052906108ca5760405162461bcd60e51b815260040161069191906127e1565b506001600160a01b0383166000908152600660205260409020805460ff191660011790555b6000546001600160a01b03166001600160a01b0316856001600160a01b0316036109265761091f8387308561148d565b905061099d565b6000546001600160a01b03166001600160a01b0316866001600160a01b03160361099d576109568330878561148d565b905060b719810161099d576001600160a01b03808616600090815260056020908152604080832093871683529290522061099490600784900b611766565b50505050505050565b601681146109aa8261158e565b6040516020016109ba9190612b94565b604051602081830303815290604052906109945760405162461bcd60e51b815260040161069191906127e1565b60008060006101676001600160a01b031663593d6e8260e01b8686604051602401610571929190612cd1565b60606003604051602001610a279190612de7565b604051602081830303815290604052905090565b610a43611433565b610a4d6000611772565b565b3360009081526005602090815260408083206001600160a01b03851684529091529020610a868167ffffffffffffffff85166117cf565b610ad25760405162461bcd60e51b815260206004820152601560248201527f43616e6e6f7420636c61696d2074686973206e667400000000000000000000006044820152606401610691565b6000610adf3385856117db565b905060168114610aee8261158e565b60405160200161071c9190612b94565b6040516001600160a01b038216602482015260009081908190610167907f7c41ad2c0000000000000000000000000000000000000000000000000000000090604401610793565b6040516001600160a01b0383811660248301528216604482015260009081908190610167907f8f8d7f990000000000000000000000000000000000000000000000000000000090606401610571565b610b9c611433565b604080516001808252818301909252600091816020015b6060815260200190600190039081610bb35790505090506003610bd58561158e565b604051602001610be6929190612e20565b60405160208183030381529060405281600081518110610c0857610c08612bff565b60209081029190910101526004546000908190610c2f906001600160a01b031682856117f3565b9250509150601660030b8214610c448361158e565b604051602001610c549190612e45565b60405160208183030381529060405290610c815760405162461bcd60e51b815260040161069191906127e1565b506000610cb78883600081518110610c9b57610c9b612bff565b60209081029190910101516004546001600160a01b03166117db565b905060b7198101610d2657610d1c82600081518110610cd857610cd8612bff565b6020908102919091018101516001600160a01b03808c1660009081526005845260408082206004549093168252919093529091209067ffffffffffffffff16611766565b5050505050610d76565b60168114610d338461158e565b604051602001610d439190612b94565b60405160208183030381529060405290610d705760405162461bcd60e51b815260040161069191906127e1565b50505050505b50505050565b60038054610d8990612d14565b80601f0160208091040260200160405190810160405280929190818152602001828054610db590612d14565b8015610e025780601f10610dd757610100808354040283529160200191610e02565b820191906000526020600020905b815481529060010190602001808311610de557829003601f168201915b505050505081565b600454600160a01b900460ff1615610e645760405162461bcd60e51b815260206004820152601360248201527f416c726561647920696e697469616c697a6564000000000000000000000000006044820152606401610691565b600480547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff16600160a01b1790558051610ea5906003906020840190612036565b50604080516001808252818301909252600091816020015b610ec56120ba565b815260200190600190039081610ebd579050509050610ee760046001306118f1565b81600081518110610efa57610efa612bff565b6020026020010181905250610f6b60408051610120810182526060808252602080830182905260008385018190528284018390526080840181905260a0840181905260c0840181905260e0840183905284519283018552808352908201819052928101929092529061010082015290565b84815260208082018590523060408084018290528051808401825260008082526060808701929092526001608087015263ffffffff60a087015260c0860181905260e08601879052825191820183528152928301919091526278645090820152610100820152600080610fdd83611926565b909250905060168214610fef8361158e565b604051602001610fff9190612e89565b6040516020818303038152906040529061102c5760405162461bcd60e51b815260040161069191906127e1565b506110373082611717565b91506016821480611048575060c282145b6110518361158e565b6040516020016110619190612c66565b6040516020818303038152906040529061108e5760405162461bcd60e51b815260040161069191906127e1565b506004805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055505050505050565b6040516001600160a01b0383811660248301528216604482015260009081908190610167907faf99c6330000000000000000000000000000000000000000000000000000000090606401610571565b606081811c826000806111268484611a3c565b90925090506016821461117b5760405162461bcd60e51b815260206004820152601860248201527f4661696c656420746f2067657420746f6b656e20696e666f00000000000000006044820152606401610691565b6080015195945050505050565b604080516060810182526000808252602080830182905282840182905283516001600160a01b038616602480830191909152855180830390910181526044909101855290810180516001600160e01b03167fd614cdb8000000000000000000000000000000000000000000000000000000001790529251909283918291610167916112139190612b4b565b6000604051808303816000865af19150503d8060008114611250576040519150601f19603f3d011682016040523d82523d6000602084013e611255565b606091505b50604080516060810182526000808252602082018190529181019190915291935091508261128557601581611299565b818060200190518101906112999190612f49565b60039190910b97909650945050505050565b604080516001600160a01b038481166024830152831660448083019190915282518083039091018152606490910182526020810180516001600160e01b03167ff2c31ff40000000000000000000000000000000000000000000000000000000017905290516000918291829182916101679161132691612b4b565b6000604051808303816000865af19150503d8060008114611363576040519150601f19603f3d011682016040523d82523d6000602084013e611368565b606091505b50915091508161137b5760156000611299565b808060200190518101906112999190612f7f565b611397611433565b6001600160a01b0381166114135760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610691565b61141c81611772565b50565b6060600061142c83611cd6565b9392505050565b6000546001600160a01b03163314610a4d5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610691565b604080516001600160a01b038681166024830152858116604483015284166064820152600783900b6084808301919091528251808303909101815260a490910182526020810180516001600160e01b03167f5cfc901100000000000000000000000000000000000000000000000000000000179052905160009182918291610167916115199190612b4b565b6000604051808303816000865af19150503d8060008114611556576040519150601f19603f3d011682016040523d82523d6000602084013e61155b565b606091505b50915091508161156c576015611580565b808060200190518101906115809190612b79565b60030b979650505050505050565b6060600061159b83611d32565b600101905060008167ffffffffffffffff8111156115bb576115bb6121e7565b6040519080825280601f01601f1916602001820160405280156115e5576020820181803683370190505b5090508181016020015b600019017f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a85049450846115ef57509392505050565b6000806000806101676001600160a01b031663acb9cff960e01b88888860405160240161165d93929190612fab565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b031990941693909317909252905161169b9190612b4b565b6000604051808303816000865af19150503d80600081146116d8576040519150601f19603f3d011682016040523d82523d6000602084013e6116dd565b606091505b5091509150816116f05760156000611704565b80806020019051810190611704919061302e565b60039190910b9890975095505050505050565b6040516001600160a01b0383811660248301528216604482015260009081908190610167907f49146bde0000000000000000000000000000000000000000000000000000000090606401610571565b600061053c8383611e14565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600061053c8383611e63565b6000806117ea8330878761148d565b95945050505050565b60008060606000806101676001600160a01b031663278e0b8860e01b89898960405160240161182493929190613058565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516118629190612b4b565b6000604051808303816000865af19150503d806000811461189f576040519150601f19603f3d011682016040523d82523d6000602084013e6118a4565b606091505b5091509150816118c75760408051600080825260208201909252601591906118db565b808060200190518101906118db91906130e7565b60039290920b9a90995090975095505050505050565b6118f96120ba565b604051806040016040528061190d86611f56565b815260200161191c8585611f95565b9052949350505050565b600080828061010001516000015163ffffffff16600014801561195657506101008101516040015163ffffffff16155b1561196c576101008101516276a7006040909101525b6000806101676001600160a01b031634639c89bb3560e01b8860405160240161199591906131a4565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516119d39190612b4b565b60006040518083038185875af1925050503d8060008114611a10576040519150601f19603f3d011682016040523d82523d6000602084013e611a15565b606091505b509150915081611a285760156000611299565b8080602001905181019061129991906131b7565b604080516103008101825260606101e082018181526102008301829052600061022084018190526102408401839052610260840181905261028084018190526102a084018190526102c084018390528451808401865281815260208082018390528187018390526102e086019190915260c0850192835260e08501829052610100850182905261012085018290526101408501829052610160850184905261018085018490526101a085018490526101c08501849052918452908301819052928201839052808201839052608082015260a08101829052604080516001600160a01b0386166024820152600785900b60448083019190915282518083039091018152606490910182526020810180516001600160e01b03167f287e1da8000000000000000000000000000000000000000000000000000000001790529051600091829161016791611b8c91612b4b565b6000604051808303816000865af19150503d8060008114611bc9576040519150601f19603f3d011682016040523d82523d6000602084013e611bce565b606091505b5091509150611cb5604080516103008101825260606101e082018181526102008301829052600061022084018190526102408401839052610260840181905261028084018190526102a084018190526102c0840183905284518084018652818152602081018290529485018190526102e084019490945260c0830190815260e0830184905261010083018490526101208301849052610140830193909352610160820181905261018082018190526101a082018190526101c08201529081908152600060208201819052604082018190526060808301829052608083015260a09091015290565b82611cc257601581611704565b81806020019051810190611704919061383f565b606081600001805480602002602001604051908101604052809291908181526020018280548015611d2657602002820191906000526020600020905b815481526020019060010190808311611d12575b50505050509050919050565b6000807a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310611d7b577a184f03e93ff9f4daa797ed6e38ed64bf6a1f010000000000000000830492506040015b6d04ee2d6d415b85acef81000000008310611da7576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310611dc557662386f26fc10000830492506010015b6305f5e1008310611ddd576305f5e100830492506008015b6127108310611df157612710830492506004015b60648310611e03576064830492506002015b600a831061053f5760010192915050565b6000818152600183016020526040812054611e5b5750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561053f565b50600061053f565b60008181526001830160205260408120548015611f4c576000611e87600183613927565b8554909150600090611e9b90600190613927565b9050818114611f00576000866000018281548110611ebb57611ebb612bff565b9060005260206000200154905080876000018481548110611ede57611ede612bff565b6000918252602080832090910192909255918252600188019052604090208390555b8554869080611f1157611f1161394c565b60019003818190600052602060002001600090559055856001016000868152602001908152602001600020600090556001935050505061053f565b600091505061053f565b600060026000836006811115611f6e57611f6e613962565b6006811115611f7f57611f7f613962565b8152602001908152602001600020549050919050565b611fdb6040518060a0016040528060001515815260200160006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681525090565b6001836004811115611fef57611fef613962565b03612008576001600160a01b038216602082015261053f565b600483600481111561201c5761201c613962565b0361053f576001600160a01b038216608082015292915050565b82805461204290612d14565b90600052602060002090601f01602090048101928261206457600085556120aa565b82601f1061207d57805160ff19168380011785556120aa565b828001600101855582156120aa579182015b828111156120aa57825182559160200191906001019061208f565b506120b6929150612117565b5090565b6040518060400160405280600081526020016121126040518060a0016040528060001515815260200160006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681525090565b905290565b5b808211156120b65760008155600101612118565b6001600160a01b038116811461141c57600080fd5b803561214c8161212c565b919050565b6000806040838503121561216457600080fd5b823561216f8161212c565b9150602083013561217f8161212c565b809150509250929050565b6020808252825182820181905260009190848201906040850190845b818110156121c2578351835292840192918401916001016121a6565b50909695505050505050565b6000602082840312156121e057600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b6040805190810167ffffffffffffffff81118282101715612220576122206121e7565b60405290565b60405160a0810167ffffffffffffffff81118282101715612220576122206121e7565b6040516060810167ffffffffffffffff81118282101715612220576122206121e7565b604051610120810167ffffffffffffffff81118282101715612220576122206121e7565b60405160c0810167ffffffffffffffff81118282101715612220576122206121e7565b604051601f8201601f1916810167ffffffffffffffff811182821017156122dc576122dc6121e7565b604052919050565b600067ffffffffffffffff8211156122fe576122fe6121e7565b50601f01601f191660200190565b600082601f83011261231d57600080fd5b813561233061232b826122e4565b6122b3565b81815284602083860101111561234557600080fd5b816020850160208301376000918101602001919091529392505050565b801515811461141c57600080fd5b803561214c81612362565b8060070b811461141c57600080fd5b803561214c8161237b565b600067ffffffffffffffff8211156123af576123af6121e7565b5060051b60200190565b600082601f8301126123ca57600080fd5b813560206123da61232b83612395565b82815260059290921b840181019181810190868411156123f957600080fd5b8286015b8481101561250f57803567ffffffffffffffff8082111561241d57600080fd5b908801906040601f19838c03810182131561243757600080fd5b61243f6121fd565b888501358152828501358481111561245657600080fd5b949094019360a0858e038301121561246e5760008081fd5b612476612226565b91508885013561248581612362565b8252848301356124948161212c565b828a0152606085810135858111156124ac5760008081fd5b6124ba8f8c838a010161230c565b85850152506080935083860135858111156124d55760008081fd5b6124e38f8c838a010161230c565b8285015250506124f560a08601612141565b9282019290925281880152855250509183019183016123fd565b509695505050505050565b63ffffffff8116811461141c57600080fd5b60006060828403121561253e57600080fd5b612546612249565b905081356125538161251a565b815260208201356125638161212c565b602082015260408201356125768161251a565b604082015292915050565b6000806040838503121561259457600080fd5b823561259f8161212c565b9150602083013567ffffffffffffffff808211156125bc57600080fd5b9084019061016082870312156125d157600080fd5b6125d961226c565b8235828111156125e857600080fd5b6125f48882860161230c565b82525060208301358281111561260957600080fd5b6126158882860161230c565b60208301525061262760408401612141565b604082015260608301358281111561263e57600080fd5b61264a8882860161230c565b60608301525061265c60808401612370565b608082015261266d60a0840161238a565b60a082015261267e60c08401612370565b60c082015260e08301358281111561269557600080fd5b6126a1888286016123b9565b60e08301525061010091506126b88783850161252c565b828201528093505050509250929050565b600080604083850312156126dc57600080fd5b82356126e78161212c565b946020939093013593505050565b60006020828403121561270757600080fd5b813561142c8161212c565b60008060006060848603121561272757600080fd5b83356127328161212c565b925060208401356127428161212c565b929592945050506040919091013590565b6000806080838503121561276657600080fd5b82356127718161212c565b9150612780846020850161252c565b90509250929050565b60005b838110156127a457818101518382015260200161278c565b83811115610d765750506000910152565b600081518084526127cd816020860160208601612789565b601f01601f19169290920160200192915050565b60208152600061053c60208301846127b5565b6000806040838503121561280757600080fd5b823561216f8161237b565b6000806000806060858703121561282857600080fd5b84356128338161212c565b935060208501359250604085013567ffffffffffffffff8082111561285757600080fd5b818701915087601f83011261286b57600080fd5b81358181111561287a57600080fd5b88602082850101111561288c57600080fd5b95989497505060200194505050565b6000806000606084860312156128b057600080fd5b833567ffffffffffffffff808211156128c857600080fd5b6128d48783880161230c565b945060208601359150808211156128ea57600080fd5b6128f68783880161230c565b9350604086013591508082111561290c57600080fd5b506129198682870161230c565b9150509250925092565b8281526080810161142c6020830184805163ffffffff90811683526020808301516001600160a01b03169084015260409182015116910152565b600081518084526020808501808196508360051b8101915082860160005b85811015612a145782840389528151604081518652868201519150808787015281511515818701528682015160606001600160a01b03808316828a015283850151935060a09250608083818b01526129d660e08b01866127b5565b928601518a8403603f1901858c01529294506129f285846127b5565b9501511660c0989098019790975250509885019893509084019060010161297b565b5091979650505050505050565b60006101608251818552612a37828601826127b5565b91505060208301518482036020860152612a5182826127b5565b9150506040830151612a6e60408601826001600160a01b03169052565b5060608301518482036060860152612a8682826127b5565b9150506080830151612a9c608086018215159052565b5060a0830151612ab160a086018260070b9052565b5060c0830151612ac560c086018215159052565b5060e083015184820360e0860152612add828261295d565b61010085810151805163ffffffff9081168984015260208201516001600160a01b03166101208a015260408201511661014089015291935091505090949350505050565b6001600160a01b0383168152604060208201526000612b436040830184612a21565b949350505050565b60008251612b5d818460208701612789565b9190910192915050565b8051600381900b811461214c57600080fd5b600060208284031215612b8b57600080fd5b61053c82612b67565b7f4661696c656420746f207472616e7366657220746f6b656e2e20526561736f6e81527f20436f64653a2000000000000000000000000000000000000000000000000000602082015260008251612bf2816027850160208701612789565b9190910160270192915050565b634e487b7160e01b600052603260045260246000fd5b7f4661696c656420746f206275726e20746f6b656e2e20526561736f6e20436f648152620329d160ed1b602082015260008251612c59816023850160208701612789565b9190910160230192915050565b7f4661696c656420746f206173736f636961746520746f6b656e2e20526561736f81527f6e20436f64653a20000000000000000000000000000000000000000000000000602082015260008251612cc4816028850160208701612789565b9190910160280192915050565b6001600160a01b03831681526080810161142c6020830184805163ffffffff90811683526020808301516001600160a01b03169084015260409182015116910152565b600181811c90821680612d2857607f821691505b602082108103612d4857634e487b7160e01b600052602260045260246000fd5b50919050565b8054600090600181811c9080831680612d6857607f831692505b60208084108203612d8957634e487b7160e01b600052602260045260246000fd5b818015612d9d5760018114612dae57612ddb565b60ff19861689528489019650612ddb565b60008881526020902060005b86811015612dd35781548b820152908501908301612dba565b505084890196505b50505050505092915050565b6000612df38284612d4e565b7f7b69647d0000000000000000000000000000000000000000000000000000000081526004019392505050565b6000612e2c8285612d4e565b8351612e3c818360208801612789565b01949350505050565b7f4661696c656420746f206d696e7420746f6b656e2e20526561736f6e20436f648152620329d160ed1b602082015260008251612c59816023850160208701612789565b7f4661696c656420746f2063726561746520746f6b656e2e20526561736f6e204381527f6f64653a20000000000000000000000000000000000000000000000000000000602082015260008251612ee7816025850160208701612789565b9190910160250192915050565b805161214c8161212c565b600060608284031215612f1157600080fd5b612f19612249565b90508151612f268161251a565b81526020820151612f368161212c565b602082015260408201516125768161251a565b60008060808385031215612f5c57600080fd5b612f6583612b67565b91506127808460208501612eff565b805161214c81612362565b60008060408385031215612f9257600080fd5b612f9b83612b67565b9150602083015161217f81612362565b6000606082016001600160a01b0386168352602067ffffffffffffffff86168185015260606040850152818551808452608086019150828701935060005b8181101561300857845160070b83529383019391830191600101612fe9565b509098975050505050505050565b805167ffffffffffffffff8116811461214c57600080fd5b6000806040838503121561304157600080fd5b61304a83612b67565b915061278060208401613016565b6000606082016001600160a01b0386168352602067ffffffffffffffff8616818501526060604085015281855180845260808601915060808160051b870101935082870160005b828110156130cd57607f198887030184526130bb8683516127b5565b9550928401929084019060010161309f565b50939998505050505050505050565b805161214c8161237b565b6000806000606084860312156130fc57600080fd5b61310584612b67565b92506020613114818601613016565b9250604085015167ffffffffffffffff81111561313057600080fd5b8501601f8101871361314157600080fd5b805161314f61232b82612395565b81815260059190911b8201830190838101908983111561316e57600080fd5b928401925b828410156131955783516131868161237b565b82529284019290840190613173565b80955050505050509250925092565b60208152600061053c6020830184612a21565b600080604083850312156131ca57600080fd5b6131d383612b67565b9150602083015161217f8161212c565b600082601f8301126131f457600080fd5b815161320261232b826122e4565b81815284602083860101111561321757600080fd5b612b43826020830160208701612789565b600082601f83011261323957600080fd5b8151602061324961232b83612395565b82815260059290921b8401810191818101908684111561326857600080fd5b8286015b8481101561250f57805167ffffffffffffffff8082111561328c57600080fd5b908801906040601f19838c0381018213156132a657600080fd5b6132ae6121fd565b88850151815282850151848111156132c557600080fd5b949094019360a0858e03830112156132dd5760008081fd5b6132e5612226565b9150888501516132f481612362565b8252848301516133038161212c565b828a01526060858101518581111561331b5760008081fd5b6133298f8c838a01016131e3565b85850152506080935083860151858111156133445760008081fd5b6133528f8c838a01016131e3565b82850152505061336460a08601612ef4565b92820192909252818801528552505091830191830161326c565b6000610160828403121561339157600080fd5b61339961226c565b9050815167ffffffffffffffff808211156133b357600080fd5b6133bf858386016131e3565b835260208401519150808211156133d557600080fd5b6133e1858386016131e3565b60208401526133f260408501612ef4565b6040840152606084015191508082111561340b57600080fd5b613417858386016131e3565b606084015261342860808501612f74565b608084015261343960a085016130dc565b60a084015261344a60c08501612f74565b60c084015260e084015191508082111561346357600080fd5b5061347084828501613228565b60e08301525061010061348584828501612eff565b9082015292915050565b600082601f8301126134a057600080fd5b815160206134b061232b83612395565b82815260a092830285018201928282019190878511156134cf57600080fd5b8387015b858110156135575781818a0312156134eb5760008081fd5b6134f3612226565b81516134fe8161251a565b81528186015161350d8161212c565b8187015260408281015161352081612362565b9082015260608281015161353381612362565b908201526080828101516135468161212c565b9082015284529284019281016134d3565b5090979650505050505050565b600082601f83011261357557600080fd5b8151602061358561232b83612395565b82815260c092830285018201928282019190878511156135a457600080fd5b8387015b858110156135575781818a0312156135c05760008081fd5b6135c8612290565b81516135d38161251a565b8152818601516135e28161251a565b818701526040828101516135f58161251a565b908201526060828101516136088161251a565b9082015260808281015161361b81612362565b9082015260a08281015161362e8161212c565b9082015284529284019281016135a8565b600082601f83011261365057600080fd5b8151602061366061232b83612395565b82815260c0928302850182019282820191908785111561367f57600080fd5b8387015b858110156135575781818a03121561369b5760008081fd5b6136a3612290565b81516136ae8161251a565b8152818601516136bd8161251a565b818701526040828101516136d08161251a565b908201526060828101516136e38161212c565b908201526080828101516136f681612362565b9082015260a0828101516137098161212c565b908201528452928401928101613683565b6000610120828403121561372d57600080fd5b61373561226c565b9050815167ffffffffffffffff8082111561374f57600080fd5b61375b8583860161337e565b835261376960208501613016565b602084015261377a60408501612f74565b604084015261378b60608501612f74565b606084015261379c60808501612f74565b608084015260a08401519150808211156137b557600080fd5b6137c18583860161348f565b60a084015260c08401519150808211156137da57600080fd5b6137e685838601613564565b60c084015260e08401519150808211156137ff57600080fd5b61380b8583860161363f565b60e08401526101009150818401518181111561382657600080fd5b613832868287016131e3565b8385015250505092915050565b6000806040838503121561385257600080fd5b61385b83612b67565b9150602083015167ffffffffffffffff8082111561387857600080fd5b9084019060c0828703121561388c57600080fd5b613894612290565b8251828111156138a357600080fd5b6138af8882860161371a565b8252506138be602084016130dc565b60208201526138cf60408401612ef4565b60408201526138e0606084016130dc565b60608201526080830151828111156138f757600080fd5b613903888286016131e3565b60808301525061391560a08401612ef4565b60a08201528093505050509250929050565b60008282101561394757634e487b7160e01b600052601160045260246000fd5b500390565b634e487b7160e01b600052603160045260246000fd5b634e487b7160e01b600052602160045260246000fdfea2646970667358221220e1b02e0bf680edea825c84ca65bf0ac5d3bfe871cf62d7c156601f94d116e29764736f6c634300080d0033";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRzX2FiaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2hlZGVyYS9odHNfYWJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsd0JBQXdCLEdBQUc7SUFDdEM7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxXQUFXO1FBQ2pCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUks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