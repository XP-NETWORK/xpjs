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
        ],
        name: "claimNft",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "claimer",
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
exports.HEDERA_PROXY_BC = "0x60806040523480156200001157600080fd5b5062000032620000266200040960201b60201c565b6200041160201b60201c565b60016002600080600681111562000072577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620000ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550600280600060016006811115620000fd577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600681111562000136577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020819055506004600260006002600681111562000189577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620001c2577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020819055506008600260006003600681111562000215577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60068111156200024e577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b81526020019081526020016000208190555060106002600060046006811115620002a1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620002da577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550602060026000600560068111156200032d577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600681111562000366577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550604060026000600680811115620003b8577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620003f1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550620004d5565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b61473980620004e56000396000f3fe60806040526004361061012a5760003560e01c80637c41ad2c116100ab578063a6487c531161006f578063a6487c53146103f4578063af99c63314610410578063d614cdb81461044d578063f2c31ff41461048b578063f2fde38b146104c9578063fa59a780146104f25761012a565b80637c41ad2c146102fb5780638da5cb5b146103385780638f8d7f991461036357806394d008ef146103a05780639abc8320146103c95761012a565b806351761bcc116100f257806351761bcc14610228578063593d6e82146102535780635de4c002146102905780636c0360eb146102b9578063715018a6146102e45761012a565b8063098d32281461012f5780630bc14a691461015a57806318370d34146101855780631dd319cb146101c25780633b3bff0f146101eb575b600080fd5b34801561013b57600080fd5b5061014461052f565b6040516101519190613d79565b60405180910390f35b34801561016657600080fd5b5061016f610537565b60405161017c9190613bb5565b60405180910390f35b34801561019157600080fd5b506101ac60048036038101906101a79190613012565b61055d565b6040516101b99190613d35565b60405180910390f35b3480156101ce57600080fd5b506101e960048036038101906101e49190613066565b610675565b005b3480156101f757600080fd5b50610212600480360381019061020d9190612f71565b61088d565b60405161021f9190613d35565b60405180910390f35b34801561023457600080fd5b5061023d6109a2565b60405161024a9190613e81565b60405180910390f35b34801561025f57600080fd5b5061027a60048036038101906102759190612fd6565b6109a9565b6040516102879190613d35565b60405180910390f35b34801561029c57600080fd5b506102b760048036038101906102b2919061328e565b610ac1565b005b3480156102c557600080fd5b506102ce610be4565b6040516102db9190613dbd565b60405180910390f35b3480156102f057600080fd5b506102f9610c0c565b005b34801561030757600080fd5b50610322600480360381019061031d9190612f71565b610c20565b60405161032f9190613d35565b60405180910390f35b34801561034457600080fd5b5061034d610d35565b60405161035a9190613bb5565b60405180910390f35b34801561036f57600080fd5b5061038a60048036038101906103859190612f9a565b610d5e565b6040516103979190613d79565b60405180910390f35b3480156103ac57600080fd5b506103c760048036038101906103c291906130a2565b610e76565b005b3480156103d557600080fd5b506103de61118b565b6040516103eb9190613dbd565b60405180910390f35b61040e600480360381019061040991906132b7565b611219565b005b34801561041c57600080fd5b5061043760048036038101906104329190612f9a565b6114f8565b6040516104449190613d79565b60405180910390f35b34801561045957600080fd5b50610474600480360381019061046f9190612f71565b611610565b604051610482929190613d50565b60405180910390f35b34801561049757600080fd5b506104b260048036038101906104ad9190612f9a565b611740565b6040516104c0929190613d94565b60405180910390f35b3480156104d557600080fd5b506104f060048036038101906104eb9190612f71565b611865565b005b3480156104fe57600080fd5b5061051960048036038101906105149190612f71565b6118e9565b6040516105269190613d13565b60405180910390f35b63ffffffff81565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600061016773ffffffffffffffffffffffffffffffffffffffff166318370d3460e01b8686604051602401610596929190613c67565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516106009190613ad0565b6000604051808303816000865af19150503d806000811461063d576040519150601f19603f3d011682016040523d82523d6000602084013e610642565b606091505b509150915081610653576015610668565b80806020019051810190610667919061310e565b5b60030b9250505092915050565b61067d611939565b60006106ad600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff168430856119b7565b9050601660030b81146106bf82611ad5565b6040516020016106cf9190613b93565b6040516020818303038152906040529061071f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107169190613dbd565b60405180910390fd5b506000600167ffffffffffffffff811115610763577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156107915781602001602082028036833780820191505090505b50905082816000815181106107cf577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001019060070b908160070b81525050610811600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600083611c82565b5080925050601660030b821461082683611ad5565b6040516020016108369190613b2d565b60405160208183030381529060405290610886576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161087d9190613dbd565b60405180910390fd5b5050505050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16633b3bff0f60e01b856040516024016108c49190613bb5565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161092e9190613ad0565b6000604051808303816000865af19150503d806000811461096b576040519150601f19603f3d011682016040523d82523d6000602084013e610970565b606091505b509150915081610981576015610996565b80806020019051810190610995919061310e565b5b60030b92505050919050565b6278645081565b600080600061016773ffffffffffffffffffffffffffffffffffffffff1663593d6e8260e01b86866040516024016109e2929190613c3e565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610a4c9190613ad0565b6000604051808303816000865af19150503d8060008114610a89576040519150601f19603f3d011682016040523d82523d6000602084013e610a8e565b606091505b509150915081610a9f576015610ab4565b80806020019051810190610ab3919061310e565b5b60030b9250505092915050565b6000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050610b218267ffffffffffffffff1682611daa90919063ffffffff16565b610b60576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b5790613ddf565b60405180910390fd5b6000610b6c3384611dc4565b9050601660030b8114610b7e82611ad5565b604051602001610b8e9190613b93565b60405160208183030381529060405290610bde576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bd59190613dbd565b60405180910390fd5b50505050565b60606003604051602001610bf89190613b0b565b604051602081830303815290604052905090565b610c14611939565b610c1e6000611e01565b565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16637c41ad2c60e01b85604051602401610c579190613bb5565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610cc19190613ad0565b6000604051808303816000865af19150503d8060008114610cfe576040519150601f19603f3d011682016040523d82523d6000602084013e610d03565b606091505b509150915081610d14576015610d29565b80806020019051810190610d28919061310e565b5b60030b92505050919050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16638f8d7f9960e01b8686604051602401610d97929190613bd0565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610e019190613ad0565b6000604051808303816000865af19150503d8060008114610e3e576040519150601f19603f3d011682016040523d82523d6000602084013e610e43565b606091505b509150915081610e54576015610e69565b80806020019051810190610e68919061310e565b5b60030b9250505092915050565b610e7e611939565b6000600167ffffffffffffffff811115610ec1577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051908082528060200260200182016040528015610ef457816020015b6060815260200190600190039081610edf5790505b5090506003610f0285611ad5565b604051602001610f13929190613ae7565b60405160208183030381529060405281600081518110610f5c577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250600080610f98600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600085611ec5565b9250509150601660030b8214610fad83611ad5565b604051602001610fbd9190613b4f565b6040516020818303038152906040529061100d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110049190613dbd565b60405180910390fd5b50600061105b888360008151811061104e577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151611dc4565b905060b860030b81141561110f57611105826000815181106110a6577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015167ffffffffffffffff16600560008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061206390919063ffffffff16565b5050505050611185565b601660030b811461111f84611ad5565b60405160200161112f9190613b93565b6040516020818303038152906040529061117f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111769190613dbd565b60405180910390fd5b50505050505b50505050565b6003805461119890614272565b80601f01602080910402602001604051908101604052809291908181526020018280546111c490614272565b80156112115780601f106111e657610100808354040283529160200191611211565b820191906000526020600020905b8154815290600101906020018083116111f457829003601f168201915b505050505081565b600460149054906101000a900460ff1615611269576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161126090613e3f565b60405180910390fd5b6001600460146101000a81548160ff021916908315150217905550806003908051906020019061129a92919061272b565b506000600167ffffffffffffffff8111156112de577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405190808252806020026020018201604052801561131757816020015b6113046127b1565b8152602001906001900390816112fc5790505b509050611327600460013061207d565b81600081518110611361577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101819052506113746127d1565b84816000018190525083816020018190525030816040019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050604051806020016040528060008152508160600181905250600181608001901515908115158152505063ffffffff8160a0019060070b908160070b8152505060008160c0019015159081151581525050818160e0018190525061142430627864506120b4565b81610100018190525060008061143983612112565b91509150601660030b821461144d83611ad5565b60405160200161145d9190613b71565b604051602081830303815290604052906114ad576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114a49190613dbd565b60405180910390fd5b5080600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050505050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff1663af99c63360e01b8686604051602401611531929190613bd0565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161159b9190613ad0565b6000604051808303816000865af19150503d80600081146115d8576040519150601f19603f3d011682016040523d82523d6000602084013e6115dd565b606091505b5091509150816115ee576015611603565b80806020019051810190611602919061310e565b5b60030b9250505092915050565b600061161a612840565b60008061016773ffffffffffffffffffffffffffffffffffffffff1663d614cdb860e01b8660405160240161164f9190613bb5565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516116b99190613ad0565b6000604051808303816000865af19150503d80600081146116f6576040519150601f19603f3d011682016040523d82523d6000602084013e6116fb565b606091505b5091509150611708612840565b826117155760158161172a565b8180602001905181019061172991906131af565b5b8160030b91508095508196505050505050915091565b60008060008061016773ffffffffffffffffffffffffffffffffffffffff1663f2c31ff460e01b878760405160240161177a929190613bd0565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516117e49190613ad0565b6000604051808303816000865af19150503d8060008114611821576040519150601f19603f3d011682016040523d82523d6000602084013e611826565b606091505b509150915081611839576015600061184e565b8080602001905181019061184d9190613173565b5b8160030b9150809450819550505050509250929050565b61186d611939565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156118dd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118d490613dff565b60405180910390fd5b6118e681611e01565b50565b6060611932600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061228a565b9050919050565b6119416122ab565b73ffffffffffffffffffffffffffffffffffffffff1661195f610d35565b73ffffffffffffffffffffffffffffffffffffffff16146119b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119ac90613e1f565b60405180910390fd5b565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16635cfc901160e01b888888886040516024016119f49493929190613bf9565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611a5e9190613ad0565b6000604051808303816000865af19150503d8060008114611a9b576040519150601f19603f3d011682016040523d82523d6000602084013e611aa0565b606091505b509150915081611ab1576015611ac6565b80806020019051810190611ac5919061310e565b5b60030b92505050949350505050565b60606000821415611b1d576040518060400160405280600181526020017f30000000000000000000000000000000000000000000000000000000000000008152509050611c7d565b600082905060005b60008214611b4f578080611b38906142d5565b915050600a82611b489190614129565b9150611b25565b60008167ffffffffffffffff811115611b91577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611bc35781602001600182028036833780820191505090505b5090505b60008514611c7657600182611bdc919061415a565b9150600a85611beb919061431e565b6030611bf791906140d3565b60f81b818381518110611c33577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a85611c6f9190614129565b9450611bc7565b8093505050505b919050565b60008060008061016773ffffffffffffffffffffffffffffffffffffffff1663acb9cff960e01b888888604051602401611cbe93929190613cd5565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611d289190613ad0565b6000604051808303816000865af19150503d8060008114611d65576040519150601f19603f3d011682016040523d82523d6000602084013e611d6a565b606091505b509150915081611d7d5760156000611d92565b80806020019051810190611d9191906131eb565b5b8160030b915080945081955050505050935093915050565b6000611dbc836000018360001b6122b3565b905092915050565b600080611df5600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff163086866119b7565b90508091505092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080606060008061016773ffffffffffffffffffffffffffffffffffffffff1663278e0b8860e01b898989604051602401611f0393929190613c97565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611f6d9190613ad0565b6000604051808303816000865af19150503d8060008114611faa576040519150601f19603f3d011682016040523d82523d6000602084013e611faf565b606091505b50915091508161203157601560008067ffffffffffffffff811115611ffd577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405190808252806020026020018201604052801561202b5781602001602082028036833780820191505090505b50612046565b808060200190518101906120459190613227565b5b8260030b9250809550819650829750505050505093509350939050565b6000612075836000018360001b612439565b905092915050565b6120856127b1565b6040518060400160405280612099866124a9565b81526020016120a88585612536565b81525090509392505050565b6120bc612840565b82816020019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505081816040019063ffffffff16908163ffffffff168152505092915050565b6000808260008161010001516000015163ffffffff16148015612144575060008161010001516040015163ffffffff16145b1561216a576276a7008161010001516040019063ffffffff16908163ffffffff16815250505b60008061016773ffffffffffffffffffffffffffffffffffffffff1634639c89bb3560e01b886040516024016121a09190613e5f565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161220a9190613ad0565b60006040518083038185875af1925050503d8060008114612247576040519150601f19603f3d011682016040523d82523d6000602084013e61224c565b606091505b50915091508161225f5760156000612274565b808060200190518101906122739190613137565b5b8160030b91508095508196505050505050915091565b6060600061229a836000016126ac565b905060608190508092505050919050565b600033905090565b6000808360010160008481526020019081526020016000205490506000811461242d5760006001826122e5919061415a565b90506000600186600001805490506122fd919061415a565b90508181146123b8576000866000018281548110612344577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b906000526020600020015490508087600001848154811061238e577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b90600052602060002001819055508387600101600083815260200190815260200160002081905550505b856000018054806123f2577f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050612433565b60009150505b92915050565b60006124458383612708565b61249e5782600001829080600181540180825580915050600190039060005260206000200160009091909190915055826000018054905083600101600084815260200190815260200160002081905550600190506124a3565b600090505b92915050565b6000600260008360068111156124e8577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115612520577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020549050919050565b61253e612883565b60016004811115612578577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8360048111156125b1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b14156125f45781816020019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250506126a6565b60048081111561262d577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b836004811115612666577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b14156126a55781816080019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250505b5b92915050565b6060816000018054806020026020016040519081016040528092919081815260200182805480156126fc57602002820191906000526020600020905b8154815260200190600101908083116126e8575b50505050509050919050565b600080836001016000848152602001908152602001600020541415905092915050565b82805461273790614272565b90600052602060002090601f01602090048101928261275957600085556127a0565b82601f1061277257805160ff19168380011785556127a0565b828001600101855582156127a0579182015b8281111561279f578251825591602001919060010190612784565b5b5090506127ad91906128e0565b5090565b6040518060400160405280600081526020016127cb612883565b81525090565b6040518061012001604052806060815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160608152602001600015158152602001600060070b81526020016000151581526020016060815260200161283a612840565b81525090565b6040518060600160405280600063ffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600063ffffffff1681525090565b6040518060a00160405280600015158152602001600073ffffffffffffffffffffffffffffffffffffffff1681526020016060815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff1681525090565b5b808211156128f95760008160009055506001016128e1565b5090565b600061291061290b84613ec1565b613e9c565b9050808382526020820190508285602086028201111561292f57600080fd5b60005b8581101561295f57816129458882612bc6565b845260208401935060208301925050600181019050612932565b5050509392505050565b600061297c61297784613eed565b613e9c565b9050808382526020820190508285602086028201111561299b57600080fd5b60005b858110156129e557813567ffffffffffffffff8111156129bd57600080fd5b8086016129ca8982612eb9565b8552602085019450602084019350505060018101905061299e565b5050509392505050565b6000612a026129fd84613f19565b613e9c565b905082815260208101848484011115612a1a57600080fd5b612a25848285614230565b509392505050565b6000612a40612a3b84613f4a565b613e9c565b905082815260208101848484011115612a5857600080fd5b612a63848285614230565b509392505050565b600081359050612a7a8161464b565b92915050565b600081519050612a8f8161464b565b92915050565b600081519050612aa481614662565b92915050565b600082601f830112612abb57600080fd5b8151612acb8482602086016128fd565b91505092915050565b600082601f830112612ae557600080fd5b8135612af5848260208601612969565b91505092915050565b600081359050612b0d81614679565b92915050565b600081519050612b2281614679565b92915050565b60008083601f840112612b3a57600080fd5b8235905067ffffffffffffffff811115612b5357600080fd5b602083019150836001820283011115612b6b57600080fd5b9250929050565b600082601f830112612b8357600080fd5b8135612b938482602086016129ef565b91505092915050565b600081519050612bab81614690565b92915050565b600081359050612bc0816146a7565b92915050565b600081519050612bd5816146a7565b92915050565b600082601f830112612bec57600080fd5b8135612bfc848260208601612a2d565b91505092915050565b600060608284031215612c1757600080fd5b612c216060613e9c565b90506000612c3184828501612f32565b6000830152506020612c4584828501612a6b565b6020830152506040612c5984828501612f32565b60408301525092915050565b600060608284031215612c7757600080fd5b612c816060613e9c565b90506000612c9184828501612f47565b6000830152506020612ca584828501612a80565b6020830152506040612cb984828501612f47565b60408301525092915050565b60006101608284031215612cd857600080fd5b612ce3610120613e9c565b9050600082013567ffffffffffffffff811115612cff57600080fd5b612d0b84828501612bdb565b600083015250602082013567ffffffffffffffff811115612d2b57600080fd5b612d3784828501612bdb565b6020830152506040612d4b84828501612a6b565b604083015250606082013567ffffffffffffffff811115612d6b57600080fd5b612d7784828501612bdb565b6060830152506080612d8b84828501612afe565b60808301525060a0612d9f84828501612bb1565b60a08301525060c0612db384828501612afe565b60c08301525060e082013567ffffffffffffffff811115612dd357600080fd5b612ddf84828501612ad4565b60e083015250610100612df484828501612c05565b6101008301525092915050565b600060a08284031215612e1357600080fd5b612e1d60a0613e9c565b90506000612e2d84828501612afe565b6000830152506020612e4184828501612a6b565b602083015250604082013567ffffffffffffffff811115612e6157600080fd5b612e6d84828501612b72565b604083015250606082013567ffffffffffffffff811115612e8d57600080fd5b612e9984828501612b72565b6060830152506080612ead84828501612a6b565b60808301525092915050565b600060408284031215612ecb57600080fd5b612ed56040613e9c565b90506000612ee584828501612f1d565b600083015250602082013567ffffffffffffffff811115612f0557600080fd5b612f1184828501612e01565b60208301525092915050565b600081359050612f2c816146be565b92915050565b600081359050612f41816146d5565b92915050565b600081519050612f56816146d5565b92915050565b600081519050612f6b816146ec565b92915050565b600060208284031215612f8357600080fd5b6000612f9184828501612a6b565b91505092915050565b60008060408385031215612fad57600080fd5b6000612fbb85828601612a6b565b9250506020612fcc85828601612a6b565b9150509250929050565b60008060808385031215612fe957600080fd5b6000612ff785828601612a6b565b925050602061300885828601612c05565b9150509250929050565b6000806040838503121561302557600080fd5b600061303385828601612a6b565b925050602083013567ffffffffffffffff81111561305057600080fd5b61305c85828601612cc5565b9150509250929050565b6000806040838503121561307957600080fd5b600061308785828601612a6b565b925050602061309885828601612f1d565b9150509250929050565b600080600080606085870312156130b857600080fd5b60006130c687828801612a6b565b94505060206130d787828801612f1d565b935050604085013567ffffffffffffffff8111156130f457600080fd5b61310087828801612b28565b925092505092959194509250565b60006020828403121561312057600080fd5b600061312e84828501612b9c565b91505092915050565b6000806040838503121561314a57600080fd5b600061315885828601612b9c565b925050602061316985828601612a95565b9150509250929050565b6000806040838503121561318657600080fd5b600061319485828601612b9c565b92505060206131a585828601612b13565b9150509250929050565b600080608083850312156131c257600080fd5b60006131d085828601612b9c565b92505060206131e185828601612c65565b9150509250929050565b600080604083850312156131fe57600080fd5b600061320c85828601612b9c565b925050602061321d85828601612f5c565b9150509250929050565b60008060006060848603121561323c57600080fd5b600061324a86828701612b9c565b935050602061325b86828701612f5c565b925050604084015167ffffffffffffffff81111561327857600080fd5b61328486828701612aaa565b9150509250925092565b6000602082840312156132a057600080fd5b60006132ae84828501612bb1565b91505092915050565b6000806000606084860312156132cc57600080fd5b600084013567ffffffffffffffff8111156132e657600080fd5b6132f286828701612bdb565b935050602084013567ffffffffffffffff81111561330f57600080fd5b61331b86828701612bdb565b925050604084013567ffffffffffffffff81111561333857600080fd5b61334486828701612bdb565b9150509250925092565b600061335a8383613588565b905092915050565b600061336e8383613601565b60208301905092915050565b60006133868383613a57565b905092915050565b600061339a8383613a94565b60208301905092915050565b6133af8161418e565b82525050565b6133be8161418e565b82525050565b60006133cf82613fd0565b6133d98185614046565b9350836020820285016133eb85613f7b565b8060005b858110156134275784840389528151613408858261334e565b945061341383614012565b925060208a019950506001810190506133ef565b50829750879550505050505092915050565b600061344482613fdb565b61344e8185614057565b935061345983613f8b565b8060005b8381101561348a5781516134718882613362565b975061347c8361401f565b92505060018101905061345d565b5085935050505092915050565b60006134a282613fe6565b6134ac8185614068565b9350836020820285016134be85613f9b565b8060005b858110156134fa57848403895281516134db858261337a565b94506134e68361402c565b925060208a019950506001810190506134c2565b50829750879550505050505092915050565b600061351782613ff1565b6135218185614079565b935061352c83613fab565b8060005b8381101561355d578151613544888261338e565b975061354f83614039565b925050600181019050613530565b5085935050505092915050565b613573816141b2565b82525050565b613582816141b2565b82525050565b600061359382613ffc565b61359d818561408a565b93506135ad81856020860161423f565b6135b68161440b565b840191505092915050565b60006135cc82613ffc565b6135d6818561409b565b93506135e681856020860161423f565b80840191505092915050565b6135fb816141be565b82525050565b61360a816141d5565b82525050565b613619816141d5565b82525050565b600061362a82614007565b61363481856140a6565b935061364481856020860161423f565b61364d8161440b565b840191505092915050565b600061366382614007565b61366d81856140b7565b935061367d81856020860161423f565b6136868161440b565b840191505092915050565b600061369c82614007565b6136a681856140c8565b93506136b681856020860161423f565b80840191505092915050565b600081546136cf81614272565b6136d981866140c8565b945060018216600081146136f4576001811461370557613738565b60ff19831686528186019350613738565b61370e85613fbb565b60005b8381101561373057815481890152600182019150602081019050613711565b838801955050505b50505092915050565b600061374e6015836140b7565b91506137598261441c565b602082019050919050565b60006137716026836140b7565b915061377c82614445565b604082019050919050565b60006137946023836140c8565b915061379f82614494565b602382019050919050565b60006137b76023836140c8565b91506137c2826144e3565b602382019050919050565b60006137da6025836140c8565b91506137e582614532565b602582019050919050565b60006137fd6020836140b7565b915061380882614581565b602082019050919050565b60006138206013836140b7565b915061382b826145aa565b602082019050919050565b60006138436004836140c8565b915061384e826145d3565b600482019050919050565b60006138666027836140c8565b9150613871826145fc565b602782019050919050565b6060820160008201516138926000850182613aa3565b5060208201516138a560208501826133a6565b5060408201516138b86040850182613aa3565b50505050565b6060820160008201516138d46000850182613aa3565b5060208201516138e760208501826133a6565b5060408201516138fa6040850182613aa3565b50505050565b600061016083016000830151848203600086015261391e828261361f565b91505060208301518482036020860152613938828261361f565b915050604083015161394d60408601826133a6565b5060608301518482036060860152613965828261361f565b915050608083015161397a608086018261356a565b5060a083015161398d60a0860182613601565b5060c08301516139a060c086018261356a565b5060e083015184820360e08601526139b88282613497565b9150506101008301516139cf61010086018261387c565b508091505092915050565b600060a0830160008301516139f2600086018261356a565b506020830151613a0560208601826133a6565b5060408301518482036040860152613a1d8282613588565b91505060608301518482036060860152613a378282613588565b9150506080830151613a4c60808601826133a6565b508091505092915050565b6000604083016000830151613a6f6000860182613a94565b5060208301518482036020860152613a8782826139da565b9150508091505092915050565b613a9d81614202565b82525050565b613aac8161420c565b82525050565b613abb8161420c565b82525050565b613aca8161421c565b82525050565b6000613adc82846135c1565b915081905092915050565b6000613af382856136c2565b9150613aff8284613691565b91508190509392505050565b6000613b1782846136c2565b9150613b2282613836565b915081905092915050565b6000613b3882613787565b9150613b448284613691565b915081905092915050565b6000613b5a826137aa565b9150613b668284613691565b915081905092915050565b6000613b7c826137cd565b9150613b888284613691565b915081905092915050565b6000613b9e82613859565b9150613baa8284613691565b915081905092915050565b6000602082019050613bca60008301846133b5565b92915050565b6000604082019050613be560008301856133b5565b613bf260208301846133b5565b9392505050565b6000608082019050613c0e60008301876133b5565b613c1b60208301866133b5565b613c2860408301856133b5565b613c356060830184613610565b95945050505050565b6000608082019050613c5360008301856133b5565b613c6060208301846138be565b9392505050565b6000604082019050613c7c60008301856133b5565b8181036020830152613c8e8184613900565b90509392505050565b6000606082019050613cac60008301866133b5565b613cb96020830185613ac1565b8181036040830152613ccb81846133c4565b9050949350505050565b6000606082019050613cea60008301866133b5565b613cf76020830185613ac1565b8181036040830152613d098184613439565b9050949350505050565b60006020820190508181036000830152613d2d818461350c565b905092915050565b6000602082019050613d4a60008301846135f2565b92915050565b6000608082019050613d6560008301856135f2565b613d7260208301846138be565b9392505050565b6000602082019050613d8e6000830184613610565b92915050565b6000604082019050613da96000830185613610565b613db66020830184613579565b9392505050565b60006020820190508181036000830152613dd78184613658565b905092915050565b60006020820190508181036000830152613df881613741565b9050919050565b60006020820190508181036000830152613e1881613764565b9050919050565b60006020820190508181036000830152613e38816137f0565b9050919050565b60006020820190508181036000830152613e5881613813565b9050919050565b60006020820190508181036000830152613e798184613900565b905092915050565b6000602082019050613e966000830184613ab2565b92915050565b6000613ea6613eb7565b9050613eb282826142a4565b919050565b6000604051905090565b600067ffffffffffffffff821115613edc57613edb6143dc565b5b602082029050602081019050919050565b600067ffffffffffffffff821115613f0857613f076143dc565b5b602082029050602081019050919050565b600067ffffffffffffffff821115613f3457613f336143dc565b5b613f3d8261440b565b9050602081019050919050565b600067ffffffffffffffff821115613f6557613f646143dc565b5b613f6e8261440b565b9050602081019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b60008190508160005260206000209050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b60006140de82614202565b91506140e983614202565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561411e5761411d61434f565b5b828201905092915050565b600061413482614202565b915061413f83614202565b92508261414f5761414e61437e565b5b828204905092915050565b600061416582614202565b915061417083614202565b9250828210156141835761418261434f565b5b828203905092915050565b6000614199826141e2565b9050919050565b60006141ab826141e2565b9050919050565b60008115159050919050565b6000819050919050565b60008160030b9050919050565b60008160070b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600063ffffffff82169050919050565b600067ffffffffffffffff82169050919050565b82818337600083830152505050565b60005b8381101561425d578082015181840152602081019050614242565b8381111561426c576000848401525b50505050565b6000600282049050600182168061428a57607f821691505b6020821081141561429e5761429d6143ad565b5b50919050565b6142ad8261440b565b810181811067ffffffffffffffff821117156142cc576142cb6143dc565b5b80604052505050565b60006142e082614202565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156143135761431261434f565b5b600182019050919050565b600061432982614202565b915061433483614202565b9250826143445761434361437e565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f43616e6e6f7420636c61696d2074686973206e66740000000000000000000000600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f206275726e20746f6b656e2e20526561736f6e20436f6460008201527f653a200000000000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f206d696e7420746f6b656e2e20526561736f6e20436f6460008201527f653a200000000000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f2063726561746520746f6b656e2e20526561736f6e204360008201527f6f64653a20000000000000000000000000000000000000000000000000000000602082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f416c726561647920696e697469616c697a656400000000000000000000000000600082015250565b7f7b69647d00000000000000000000000000000000000000000000000000000000600082015250565b7f4661696c656420746f207472616e7366657220746f6b656e2e20526561736f6e60008201527f20436f64653a2000000000000000000000000000000000000000000000000000602082015250565b6146548161418e565b811461465f57600080fd5b50565b61466b816141a0565b811461467657600080fd5b50565b614682816141b2565b811461468d57600080fd5b50565b614699816141c8565b81146146a457600080fd5b50565b6146b0816141d5565b81146146bb57600080fd5b50565b6146c781614202565b81146146d257600080fd5b50565b6146de8161420c565b81146146e957600080fd5b50565b6146f58161421c565b811461470057600080fd5b5056fea26469706673582212201facf4bc0632b69447b95b238968dc2293cab79b1aba6e400d06a4f168a4be9764736f6c63430008040033";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRzX2FiaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2hlZGVyYS9odHNfYWJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsd0JBQXdCLEdBQUc7SUFDdEM7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxXQUFXO1FBQ2pCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUks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