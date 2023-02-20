"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEDERA_PROXY_BC =
  exports.HEDERA_PROXY_ABI =
  exports.HEDERA_TOKEN_SERVICE_ABI =
    void 0;
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
exports.HEDERA_PROXY_BC =
  "0x60806040523480156200001157600080fd5b5062000032620000266200040960201b60201c565b6200041160201b60201c565b60016002600080600681111562000072577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620000ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550600280600060016006811115620000fd577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600681111562000136577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020819055506004600260006002600681111562000189577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620001c2577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020819055506008600260006003600681111562000215577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60068111156200024e577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b81526020019081526020016000208190555060106002600060046006811115620002a1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620002da577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550602060026000600560068111156200032d577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600681111562000366577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550604060026000600680811115620003b8577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115620003f1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b815260200190815260200160002081905550620004d5565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b615bb180620004e56000396000f3fe60806040526004361061014b5760003560e01c80637ad43629116100b6578063a6487c531161006f578063a6487c53146104b9578063af99c633146104d5578063c87b56dd14610512578063d614cdb81461054f578063f2c31ff41461058d578063f2fde38b146105cb5761014b565b80637ad43629146103975780637c41ad2c146103c05780638da5cb5b146103fd5780638f8d7f991461042857806394d008ef146104655780639abc83201461048e5761014b565b80633b3bff0f116101085780633b3bff0f1461028757806342842e0e146102c457806351761bcc146102ed578063593d6e82146103185780636c0360eb14610355578063715018a6146103805761014b565b8063098d3228146101505780630b5d6cab1461017b5780630bc14a69146101b85780630e44263a146101e357806318370d34146102215780631dd319cb1461025e575b600080fd5b34801561015c57600080fd5b506101656105f4565b60405161017291906150d5565b60405180910390f35b34801561018757600080fd5b506101a2600480360381019061019d9190614186565b6105fc565b6040516101af919061506f565b60405180910390f35b3480156101c457600080fd5b506101cd61068a565b6040516101da9190614ee8565b60405180910390f35b3480156101ef57600080fd5b5061020a600480360381019061020591906145f0565b6106b0565b604051610218929190614f71565b60405180910390f35b34801561022d57600080fd5b506102486004803603810190610243919061424d565b6106d9565b6040516102559190615091565b60405180910390f35b34801561026a57600080fd5b50610285600480360381019061028091906142a1565b6107f1565b005b34801561029357600080fd5b506102ae60048036038101906102a9919061415d565b610a09565b6040516102bb9190615091565b60405180910390f35b3480156102d057600080fd5b506102eb60048036038101906102e691906141c2565b610b1e565b005b3480156102f957600080fd5b50610302610d8f565b60405161030f91906151fd565b60405180910390f35b34801561032457600080fd5b5061033f600480360381019061033a9190614211565b610d96565b60405161034c9190615091565b60405180910390f35b34801561036157600080fd5b5061036a610eae565b6040516103779190615119565b60405180910390f35b34801561038c57600080fd5b50610395610ed6565b005b3480156103a357600080fd5b506103be60048036038101906103b9919061451d565b610eea565b005b3480156103cc57600080fd5b506103e760048036038101906103e2919061415d565b61104c565b6040516103f49190615091565b60405180910390f35b34801561040957600080fd5b50610412611161565b60405161041f9190614ee8565b60405180910390f35b34801561043457600080fd5b5061044f600480360381019061044a9190614186565b61118a565b60405161045c91906150d5565b60405180910390f35b34801561047157600080fd5b5061048c600480360381019061048791906142dd565b6112a2565b005b34801561049a57600080fd5b506104a3611639565b6040516104b09190615119565b60405180910390f35b6104d360048036038101906104ce9190614559565b6116c7565b005b3480156104e157600080fd5b506104fc60048036038101906104f79190614186565b611a31565b60405161050991906150d5565b60405180910390f35b34801561051e57600080fd5b50610539600480360381019061053491906145f0565b611b49565b6040516105469190615119565b60405180910390f35b34801561055b57600080fd5b506105766004803603810190610571919061415d565b611bc2565b6040516105849291906150ac565b60405180910390f35b34801561059957600080fd5b506105b460048036038101906105af9190614186565b611cf2565b6040516105c29291906150f0565b60405180910390f35b3480156105d757600080fd5b506105f260048036038101906105ed919061415d565b611e17565b005b63ffffffff81565b6060610682600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611e9b565b905092915050565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060008360001b905060008160601c905060008260001c9050818194509450505050915091565b600080600061016773ffffffffffffffffffffffffffffffffffffffff166318370d3460e01b8686604051602401610712929190614fc3565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161077c9190614de1565b6000604051808303816000865af19150503d80600081146107b9576040519150601f19603f3d011682016040523d82523d6000602084013e6107be565b606091505b5091509150816107cf5760156107e4565b808060200190518101906107e39190614349565b5b60030b9250505092915050565b6107f9611ebc565b6000610829600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16843085611f3a565b9050601660030b811461083b82612058565b60405160200161084b9190614ec6565b6040516020818303038152906040529061089b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108929190615119565b60405180910390fd5b506000600167ffffffffffffffff8111156108df577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405190808252806020026020018201604052801561090d5781602001602082028036833780820191505090505b509050828160008151811061094b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001019060070b908160070b8152505061098d600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600083612205565b5080925050601660030b82146109a283612058565b6040516020016109b29190614e3e565b60405160208183030381529060405290610a02576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109f99190615119565b60405180910390fd5b5050505050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16633b3bff0f60e01b85604051602401610a409190614ee8565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610aaa9190614de1565b6000604051808303816000865af19150503d8060008114610ae7576040519150601f19603f3d011682016040523d82523d6000602084013e610aec565b606091505b509150915081610afd576015610b12565b80806020019051810190610b119190614349565b5b60030b92505050919050565b610b26611ebc565b600080610b32836106b0565b915091506000600660008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16610c1557610b93308461232d565b9050601660030b811480610baa575060c260030b81145b610bb382612058565b604051602001610bc39190614ea4565b60405160208183030381529060405290610c13576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0a9190615119565b60405180910390fd5b505b610c1d611161565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161415610c6357610c5c83873085611f3a565b9050610d15565b610c6f83878785611f3a565b905060b860030b811415610d1457610d0b84600560008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061244590919063ffffffff16565b50505050610d8a565b5b601660030b8114610d2582612058565b604051602001610d359190614ec6565b60405160208183030381529060405290610d85576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7c9190615119565b60405180910390fd5b505050505b505050565b6278645081565b600080600061016773ffffffffffffffffffffffffffffffffffffffff1663593d6e8260e01b8686604051602401610dcf929190614f9a565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610e399190614de1565b6000604051808303816000865af19150503d8060008114610e76576040519150601f19603f3d011682016040523d82523d6000602084013e610e7b565b606091505b509150915081610e8c576015610ea1565b80806020019051810190610ea09190614349565b5b60030b9250505092915050565b60606003604051602001610ec29190614e1c565b604051602081830303815290604052905090565b610ede611ebc565b610ee8600061245f565b565b6000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050610f878367ffffffffffffffff168261252390919063ffffffff16565b610fc6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fbd9061513b565b60405180910390fd5b6000610fd333858561253d565b9050601660030b8114610fe582612058565b604051602001610ff59190614ec6565b60405160208183030381529060405290611045576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161103c9190615119565b60405180910390fd5b5050505050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16637c41ad2c60e01b856040516024016110839190614ee8565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516110ed9190614de1565b6000604051808303816000865af19150503d806000811461112a576040519150601f19603f3d011682016040523d82523d6000602084013e61112f565b606091505b509150915081611140576015611155565b808060200190518101906111549190614349565b5b60030b92505050919050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16638f8d7f9960e01b86866040516024016111c3929190614f03565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161122d9190614de1565b6000604051808303816000865af19150503d806000811461126a576040519150601f19603f3d011682016040523d82523d6000602084013e61126f565b606091505b509150915081611280576015611295565b808060200190518101906112949190614349565b5b60030b9250505092915050565b6112aa611ebc565b6000600167ffffffffffffffff8111156112ed577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60405190808252806020026020018201604052801561132057816020015b606081526020019060019003908161130b5790505b509050600361132e85612058565b60405160200161133f929190614df8565b60405160208183030381529060405281600081518110611388577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200260200101819052506000806113c4600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600085612559565b9250509150601660030b82146113d983612058565b6040516020016113e99190614e60565b60405160208183030381529060405290611439576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114309190615119565b60405180910390fd5b5060006114aa888360008151811061147a577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010151600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1661253d565b905060b860030b8114156115bd576115b3826000815181106114f5577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002602001015167ffffffffffffffff16600560008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002061244590919063ffffffff16565b5050505050611633565b601660030b81146115cd84612058565b6040516020016115dd9190614ec6565b6040516020818303038152906040529061162d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116249190615119565b60405180910390fd5b50505050505b50505050565b6003805461164690615672565b80601f016020809104026020016040519081016040528092919081815260200182805461167290615672565b80156116bf5780601f10611694576101008083540402835291602001916116bf565b820191906000526020600020905b8154815290600101906020018083116116a257829003601f168201915b505050505081565b600460149054906101000a900460ff1615611717576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161170e906151bb565b60405180910390fd5b6001600460146101000a81548160ff0219169083151502179055508060039080519060200190611748929190612eb8565b506000600167ffffffffffffffff81111561178c577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156117c557816020015b6117b2612f3e565b8152602001906001900390816117aa5790505b5090506117d560046001306126f7565b8160008151811061180f577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250611822612f5e565b84816000018190525083816020018190525030816040019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050604051806020016040528060008152508160600181905250600181608001901515908115158152505063ffffffff8160a0019060070b908160070b8152505060008160c0019015159081151581525050818160e001819052506118d2306278645061272e565b8161010001819052506000806118e78361278c565b91509150601660030b82146118fb83612058565b60405160200161190b9190614e82565b6040516020818303038152906040529061195b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119529190615119565b60405180910390fd5b50611966308261232d565b9150601660030b82148061197d575060c260030b82145b61198683612058565b6040516020016119969190614ea4565b604051602081830303815290604052906119e6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119dd9190615119565b60405180910390fd5b5080600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050505050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff1663af99c63360e01b8686604051602401611a6a929190614f03565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611ad49190614de1565b6000604051808303816000865af19150503d8060008114611b11576040519150601f19603f3d011682016040523d82523d6000602084013e611b16565b606091505b509150915081611b27576015611b3c565b80806020019051810190611b3b9190614349565b5b60030b9250505092915050565b6060600080611b57846106b0565b91509150600080611b688484612904565b91509150601660030b8214611bb2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611ba99061517b565b60405180910390fd5b8060800151945050505050919050565b6000611bcc612fcd565b60008061016773ffffffffffffffffffffffffffffffffffffffff1663d614cdb860e01b86604051602401611c019190614ee8565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611c6b9190614de1565b6000604051808303816000865af19150503d8060008114611ca8576040519150601f19603f3d011682016040523d82523d6000602084013e611cad565b606091505b5091509150611cba612fcd565b82611cc757601581611cdc565b81806020019051810190611cdb91906143ea565b5b8160030b91508095508196505050505050915091565b60008060008061016773ffffffffffffffffffffffffffffffffffffffff1663f2c31ff460e01b8787604051602401611d2c929190614f03565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611d969190614de1565b6000604051808303816000865af19150503d8060008114611dd3576040519150601f19603f3d011682016040523d82523d6000602084013e611dd8565b606091505b509150915081611deb5760156000611e00565b80806020019051810190611dff91906143ae565b5b8160030b9150809450819550505050509250929050565b611e1f611ebc565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611e8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e869061515b565b60405180910390fd5b611e988161245f565b50565b60606000611eab83600001612a38565b905060608190508092505050919050565b611ec4612a94565b73ffffffffffffffffffffffffffffffffffffffff16611ee2611161565b73ffffffffffffffffffffffffffffffffffffffff1614611f38576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611f2f9061519b565b60405180910390fd5b565b600080600061016773ffffffffffffffffffffffffffffffffffffffff16635cfc901160e01b88888888604051602401611f779493929190614f2c565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051611fe19190614de1565b6000604051808303816000865af19150503d806000811461201e576040519150601f19603f3d011682016040523d82523d6000602084013e612023565b606091505b509150915081612034576015612049565b808060200190518101906120489190614349565b5b60030b92505050949350505050565b606060008214156120a0576040518060400160405280600181526020017f30000000000000000000000000000000000000000000000000000000000000008152509050612200565b600082905060005b600082146120d25780806120bb906156d5565b915050600a826120cb9190615529565b91506120a8565b60008167ffffffffffffffff811115612114577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f1916602001820160405280156121465781602001600182028036833780820191505090505b5090505b600085146121f95760018261215f919061555a565b9150600a8561216e919061571e565b603061217a91906154d3565b60f81b8183815181106121b6577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a856121f29190615529565b945061214a565b8093505050505b919050565b60008060008061016773ffffffffffffffffffffffffffffffffffffffff1663acb9cff960e01b88888860405160240161224193929190615031565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516122ab9190614de1565b6000604051808303816000865af19150503d80600081146122e8576040519150601f19603f3d011682016040523d82523d6000602084013e6122ed565b606091505b5091509150816123005760156000612315565b80806020019051810190612314919061447a565b5b8160030b915080945081955050505050935093915050565b600080600061016773ffffffffffffffffffffffffffffffffffffffff166349146bde60e01b8686604051602401612366929190614f03565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516123d09190614de1565b6000604051808303816000865af19150503d806000811461240d576040519150601f19603f3d011682016040523d82523d6000602084013e612412565b606091505b509150915081612423576015612438565b808060200190518101906124379190614349565b5b60030b9250505092915050565b6000612457836000018360001b612a9c565b905092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000612535836000018360001b612b0c565b905092915050565b60008061254c83308787611f3a565b9050809150509392505050565b600080606060008061016773ffffffffffffffffffffffffffffffffffffffff1663278e0b8860e01b89898960405160240161259793929190614ff3565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516126019190614de1565b6000604051808303816000865af19150503d806000811461263e576040519150601f19603f3d011682016040523d82523d6000602084013e612643565b606091505b5091509150816126c557601560008067ffffffffffffffff811115612691577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156126bf5781602001602082028036833780820191505090505b506126da565b808060200190518101906126d991906144b6565b5b8260030b9250809550819650829750505050505093509350939050565b6126ff612f3e565b604051806040016040528061271386612c92565b81526020016127228585612d1f565b81525090509392505050565b612736612fcd565b82816020019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505081816040019063ffffffff16908163ffffffff168152505092915050565b6000808260008161010001516000015163ffffffff161480156127be575060008161010001516040015163ffffffff16145b156127e4576276a7008161010001516040019063ffffffff16908163ffffffff16815250505b60008061016773ffffffffffffffffffffffffffffffffffffffff1634639c89bb3560e01b8860405160240161281a91906151db565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516128849190614de1565b60006040518083038185875af1925050503d80600081146128c1576040519150601f19603f3d011682016040523d82523d6000602084013e6128c6565b606091505b5091509150816128d957601560006128ee565b808060200190518101906128ed9190614372565b5b8160030b91508095508196505050505050915091565b600061290e613010565b60008061016773ffffffffffffffffffffffffffffffffffffffff1663287e1da860e01b8787604051602401612945929190614f71565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516129af9190614de1565b6000604051808303816000865af19150503d80600081146129ec576040519150601f19603f3d011682016040523d82523d6000602084013e6129f1565b606091505b50915091506129fe613010565b82612a0b57601581612a20565b81806020019051810190612a1f9190614426565b5b8160030b915080955081965050505050509250929050565b606081600001805480602002602001604051908101604052809291908181526020018280548015612a8857602002820191906000526020600020905b815481526020019060010190808311612a74575b50505050509050919050565b600033905090565b6000612aa88383612e95565b612b01578260000182908060018154018082558091505060019003906000526020600020016000909190919091505582600001805490508360010160008481526020019081526020016000208190555060019050612b06565b600090505b92915050565b60008083600101600084815260200190815260200160002054905060008114612c86576000600182612b3e919061555a565b9050600060018660000180549050612b56919061555a565b9050818114612c11576000866000018281548110612b9d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000200154905080876000018481548110612be7577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b90600052602060002001819055508387600101600083815260200190815260200160002081905550505b85600001805480612c4b577f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050612c8c565b60009150505b92915050565b600060026000836006811115612cd1577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6006811115612d09577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8152602001908152602001600020549050919050565b612d2761307e565b60016004811115612d61577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b836004811115612d9a577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b1415612ddd5781816020019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050612e8f565b600480811115612e16577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b836004811115612e4f577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b1415612e8e5781816080019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250505b5b92915050565b600080836001016000848152602001908152602001600020541415905092915050565b828054612ec490615672565b90600052602060002090601f016020900481019282612ee65760008555612f2d565b82601f10612eff57805160ff1916838001178555612f2d565b82800160010185558215612f2d579182015b82811115612f2c578251825591602001919060010190612f11565b5b509050612f3a91906130db565b5090565b604051806040016040528060008152602001612f5861307e565b81525090565b6040518061012001604052806060815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160608152602001600015158152602001600060070b815260200160001515815260200160608152602001612fc7612fcd565b81525090565b6040518060600160405280600063ffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600063ffffffff1681525090565b6040518060c001604052806130236130f8565b8152602001600060070b8152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600060070b815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff1681525090565b6040518060a00160405280600015158152602001600073ffffffffffffffffffffffffffffffffffffffff1681526020016060815260200160608152602001600073ffffffffffffffffffffffffffffffffffffffff1681525090565b5b808211156130f45760008160009055506001016130dc565b5090565b60405180610120016040528061310c612f5e565b8152602001600067ffffffffffffffff168152602001600015158152602001600015158152602001600015158152602001606081526020016060815260200160608152602001606081525090565b600061316d6131688461523d565b615218565b9050808382526020820190508285602086028201111561318c57600080fd5b60005b858110156131bc57816131a2888261373b565b84526020840193506020830192505060018101905061318f565b5050509392505050565b60006131d96131d484615269565b615218565b905080838252602082019050828560a08602820111156131f857600080fd5b60005b85811015613228578161320e8882613864565b845260208401935060a083019250506001810190506131fb565b5050509392505050565b600061324561324084615295565b615218565b905080838252602082019050828560c086028201111561326457600080fd5b60005b85811015613294578161327a88826138ec565b845260208401935060c08301925050600181019050613267565b5050509392505050565b60006132b16132ac846152c1565b615218565b905080838252602082019050828560c08602820111156132d057600080fd5b60005b8581101561330057816132e68882613e3c565b845260208401935060c083019250506001810190506132d3565b5050509392505050565b600061331d613318846152ed565b615218565b9050808382526020820190508285602086028201111561333c57600080fd5b60005b8581101561338657813567ffffffffffffffff81111561335e57600080fd5b80860161336b898261402c565b8552602085019450602084019350505060018101905061333f565b5050509392505050565b60006133a361339e846152ed565b615218565b905080838252602082019050828560208602820111156133c257600080fd5b60005b8581101561340c57815167ffffffffffffffff8111156133e457600080fd5b8086016133f18982614090565b855260208501945060208401935050506001810190506133c5565b5050509392505050565b600061342961342484615319565b615218565b90508281526020810184848401111561344157600080fd5b61344c848285615630565b509392505050565b600061346761346284615319565b615218565b90508281526020810184848401111561347f57600080fd5b61348a84828561563f565b509392505050565b60006134a56134a08461534a565b615218565b9050828152602081018484840111156134bd57600080fd5b6134c8848285615630565b509392505050565b60006134e36134de8461534a565b615218565b9050828152602081018484840111156134fb57600080fd5b61350684828561563f565b509392505050565b60008135905061351d81615ac3565b92915050565b60008151905061353281615ac3565b92915050565b60008151905061354781615ada565b92915050565b600082601f83011261355e57600080fd5b815161356e84826020860161315a565b91505092915050565b600082601f83011261358857600080fd5b81516135988482602086016131c6565b91505092915050565b600082601f8301126135b257600080fd5b81516135c2848260208601613232565b91505092915050565b600082601f8301126135dc57600080fd5b81516135ec84826020860161329e565b91505092915050565b600082601f83011261360657600080fd5b813561361684826020860161330a565b91505092915050565b600082601f83011261363057600080fd5b8151613640848260208601613390565b91505092915050565b60008135905061365881615af1565b92915050565b60008151905061366d81615af1565b92915050565b60008083601f84011261368557600080fd5b8235905067ffffffffffffffff81111561369e57600080fd5b6020830191508360018202830111156136b657600080fd5b9250929050565b600082601f8301126136ce57600080fd5b81356136de848260208601613416565b91505092915050565b600082601f8301126136f857600080fd5b8151613708848260208601613454565b91505092915050565b60008151905061372081615b08565b92915050565b60008135905061373581615b1f565b92915050565b60008151905061374a81615b1f565b92915050565b600082601f83011261376157600080fd5b8135613771848260208601613492565b91505092915050565b600082601f83011261378b57600080fd5b815161379b8482602086016134d0565b91505092915050565b6000606082840312156137b657600080fd5b6137c06060615218565b905060006137d08482850161411e565b60008301525060206137e48482850161350e565b60208301525060406137f88482850161411e565b60408301525092915050565b60006060828403121561381657600080fd5b6138206060615218565b9050600061383084828501614133565b600083015250602061384484828501613523565b602083015250604061385884828501614133565b60408301525092915050565b600060a0828403121561387657600080fd5b61388060a0615218565b9050600061389084828501614133565b60008301525060206138a484828501613523565b60208301525060406138b88482850161365e565b60408301525060606138cc8482850161365e565b60608301525060806138e084828501613523565b60808301525092915050565b600060c082840312156138fe57600080fd5b61390860c0615218565b9050600061391884828501614133565b600083015250602061392c84828501614133565b602083015250604061394084828501614133565b604083015250606061395484828501614133565b60608301525060806139688482850161365e565b60808301525060a061397c84828501613523565b60a08301525092915050565b6000610160828403121561399b57600080fd5b6139a6610120615218565b9050600082013567ffffffffffffffff8111156139c257600080fd5b6139ce84828501613750565b600083015250602082013567ffffffffffffffff8111156139ee57600080fd5b6139fa84828501613750565b6020830152506040613a0e8482850161350e565b604083015250606082013567ffffffffffffffff811115613a2e57600080fd5b613a3a84828501613750565b6060830152506080613a4e84828501613649565b60808301525060a0613a6284828501613726565b60a08301525060c0613a7684828501613649565b60c08301525060e082013567ffffffffffffffff811115613a9657600080fd5b613aa2848285016135f5565b60e083015250610100613ab7848285016137a4565b6101008301525092915050565b60006101608284031215613ad757600080fd5b613ae2610120615218565b9050600082015167ffffffffffffffff811115613afe57600080fd5b613b0a8482850161377a565b600083015250602082015167ffffffffffffffff811115613b2a57600080fd5b613b368482850161377a565b6020830152506040613b4a84828501613523565b604083015250606082015167ffffffffffffffff811115613b6a57600080fd5b613b768482850161377a565b6060830152506080613b8a8482850161365e565b60808301525060a0613b9e8482850161373b565b60a08301525060c0613bb28482850161365e565b60c08301525060e082015167ffffffffffffffff811115613bd257600080fd5b613bde8482850161361f565b60e083015250610100613bf384828501613804565b6101008301525092915050565b600060a08284031215613c1257600080fd5b613c1c60a0615218565b90506000613c2c84828501613649565b6000830152506020613c408482850161350e565b602083015250604082013567ffffffffffffffff811115613c6057600080fd5b613c6c848285016136bd565b604083015250606082013567ffffffffffffffff811115613c8c57600080fd5b613c98848285016136bd565b6060830152506080613cac8482850161350e565b60808301525092915050565b600060a08284031215613cca57600080fd5b613cd460a0615218565b90506000613ce48482850161365e565b6000830152506020613cf884828501613523565b602083015250604082015167ffffffffffffffff811115613d1857600080fd5b613d24848285016136e7565b604083015250606082015167ffffffffffffffff811115613d4457600080fd5b613d50848285016136e7565b6060830152506080613d6484828501613523565b60808301525092915050565b600060c08284031215613d8257600080fd5b613d8c60c0615218565b9050600082015167ffffffffffffffff811115613da857600080fd5b613db484828501613ed8565b6000830152506020613dc88482850161373b565b6020830152506040613ddc84828501613523565b6040830152506060613df08482850161373b565b606083015250608082015167ffffffffffffffff811115613e1057600080fd5b613e1c848285016136e7565b60808301525060a0613e3084828501613523565b60a08301525092915050565b600060c08284031215613e4e57600080fd5b613e5860c0615218565b90506000613e6884828501614133565b6000830152506020613e7c84828501614133565b6020830152506040613e9084828501614133565b6040830152506060613ea484828501613523565b6060830152506080613eb88482850161365e565b60808301525060a0613ecc84828501613523565b60a08301525092915050565b60006101208284031215613eeb57600080fd5b613ef6610120615218565b9050600082015167ffffffffffffffff811115613f1257600080fd5b613f1e84828501613ac4565b6000830152506020613f3284828501614148565b6020830152506040613f468482850161365e565b6040830152506060613f5a8482850161365e565b6060830152506080613f6e8482850161365e565b60808301525060a082015167ffffffffffffffff811115613f8e57600080fd5b613f9a84828501613577565b60a08301525060c082015167ffffffffffffffff811115613fba57600080fd5b613fc6848285016135a1565b60c08301525060e082015167ffffffffffffffff811115613fe657600080fd5b613ff2848285016135cb565b60e08301525061010082015167ffffffffffffffff81111561401357600080fd5b61401f8482850161377a565b6101008301525092915050565b60006040828403121561403e57600080fd5b6140486040615218565b90506000614058848285016140f4565b600083015250602082013567ffffffffffffffff81111561407857600080fd5b61408484828501613c00565b60208301525092915050565b6000604082840312156140a257600080fd5b6140ac6040615218565b905060006140bc84828501614109565b600083015250602082015167ffffffffffffffff8111156140dc57600080fd5b6140e884828501613cb8565b60208301525092915050565b60008135905061410381615b36565b92915050565b60008151905061411881615b36565b92915050565b60008135905061412d81615b4d565b92915050565b60008151905061414281615b4d565b92915050565b60008151905061415781615b64565b92915050565b60006020828403121561416f57600080fd5b600061417d8482850161350e565b91505092915050565b6000806040838503121561419957600080fd5b60006141a78582860161350e565b92505060206141b88582860161350e565b9150509250929050565b6000806000606084860312156141d757600080fd5b60006141e58682870161350e565b93505060206141f68682870161350e565b9250506040614207868287016140f4565b9150509250925092565b6000806080838503121561422457600080fd5b60006142328582860161350e565b9250506020614243858286016137a4565b9150509250929050565b6000806040838503121561426057600080fd5b600061426e8582860161350e565b925050602083013567ffffffffffffffff81111561428b57600080fd5b61429785828601613988565b9150509250929050565b600080604083850312156142b457600080fd5b60006142c28582860161350e565b92505060206142d3858286016140f4565b9150509250929050565b600080600080606085870312156142f357600080fd5b60006143018782880161350e565b9450506020614312878288016140f4565b935050604085013567ffffffffffffffff81111561432f57600080fd5b61433b87828801613673565b925092505092959194509250565b60006020828403121561435b57600080fd5b600061436984828501613711565b91505092915050565b6000806040838503121561438557600080fd5b600061439385828601613711565b92505060206143a485828601613538565b9150509250929050565b600080604083850312156143c157600080fd5b60006143cf85828601613711565b92505060206143e08582860161365e565b9150509250929050565b600080608083850312156143fd57600080fd5b600061440b85828601613711565b925050602061441c85828601613804565b9150509250929050565b6000806040838503121561443957600080fd5b600061444785828601613711565b925050602083015167ffffffffffffffff81111561446457600080fd5b61447085828601613d70565b9150509250929050565b6000806040838503121561448d57600080fd5b600061449b85828601613711565b92505060206144ac85828601614148565b9150509250929050565b6000806000606084860312156144cb57600080fd5b60006144d986828701613711565b93505060206144ea86828701614148565b925050604084015167ffffffffffffffff81111561450757600080fd5b6145138682870161354d565b9150509250925092565b6000806040838503121561453057600080fd5b600061453e85828601613726565b925050602061454f8582860161350e565b9150509250929050565b60008060006060848603121561456e57600080fd5b600084013567ffffffffffffffff81111561458857600080fd5b61459486828701613750565b935050602084013567ffffffffffffffff8111156145b157600080fd5b6145bd86828701613750565b925050604084013567ffffffffffffffff8111156145da57600080fd5b6145e686828701613750565b9150509250925092565b60006020828403121561460257600080fd5b6000614610848285016140f4565b91505092915050565b60006146258383614853565b905092915050565b600061463983836148cc565b60208301905092915050565b60006146518383614d68565b905092915050565b60006146658383614da5565b60208301905092915050565b61467a8161558e565b82525050565b6146898161558e565b82525050565b600061469a826153d0565b6146a48185615446565b9350836020820285016146b68561537b565b8060005b858110156146f257848403895281516146d38582614619565b94506146de83615412565b925060208a019950506001810190506146ba565b50829750879550505050505092915050565b600061470f826153db565b6147198185615457565b93506147248361538b565b8060005b8381101561475557815161473c888261462d565b97506147478361541f565b925050600181019050614728565b5085935050505092915050565b600061476d826153e6565b6147778185615468565b9350836020820285016147898561539b565b8060005b858110156147c557848403895281516147a68582614645565b94506147b18361542c565b925060208a0199505060018101905061478d565b50829750879550505050505092915050565b60006147e2826153f1565b6147ec8185615479565b93506147f7836153ab565b8060005b8381101561482857815161480f8882614659565b975061481a83615439565b9250506001810190506147fb565b5085935050505092915050565b61483e816155b2565b82525050565b61484d816155b2565b82525050565b600061485e826153fc565b614868818561548a565b935061487881856020860161563f565b6148818161580b565b840191505092915050565b6000614897826153fc565b6148a1818561549b565b93506148b181856020860161563f565b80840191505092915050565b6148c6816155be565b82525050565b6148d5816155d5565b82525050565b6148e4816155d5565b82525050565b60006148f582615407565b6148ff81856154a6565b935061490f81856020860161563f565b6149188161580b565b840191505092915050565b600061492e82615407565b61493881856154b7565b935061494881856020860161563f565b6149518161580b565b840191505092915050565b600061496782615407565b61497181856154c8565b935061498181856020860161563f565b80840191505092915050565b6000815461499a81615672565b6149a481866154c8565b945060018216600081146149bf57600181146149d057614a03565b60ff19831686528186019350614a03565b6149d9856153bb565b60005b838110156149fb578154818901526001820191506020810190506149dc565b838801955050505b50505092915050565b6000614a196015836154b7565b9150614a248261581c565b602082019050919050565b6000614a3c6026836154b7565b9150614a4782615845565b604082019050919050565b6000614a5f6023836154c8565b9150614a6a82615894565b602382019050919050565b6000614a826018836154b7565b9150614a8d826158e3565b602082019050919050565b6000614aa56023836154c8565b9150614ab08261590c565b602382019050919050565b6000614ac86025836154c8565b9150614ad38261595b565b602582019050919050565b6000614aeb6020836154b7565b9150614af6826159aa565b602082019050919050565b6000614b0e6028836154c8565b9150614b19826159d3565b602882019050919050565b6000614b316013836154b7565b9150614b3c82615a22565b602082019050919050565b6000614b546004836154c8565b9150614b5f82615a4b565b600482019050919050565b6000614b776027836154c8565b9150614b8282615a74565b602782019050919050565b606082016000820151614ba36000850182614db4565b506020820151614bb66020850182614671565b506040820151614bc96040850182614db4565b50505050565b606082016000820151614be56000850182614db4565b506020820151614bf86020850182614671565b506040820151614c0b6040850182614db4565b50505050565b6000610160830160008301518482036000860152614c2f82826148ea565b91505060208301518482036020860152614c4982826148ea565b9150506040830151614c5e6040860182614671565b5060608301518482036060860152614c7682826148ea565b9150506080830151614c8b6080860182614835565b5060a0830151614c9e60a08601826148cc565b5060c0830151614cb160c0860182614835565b5060e083015184820360e0860152614cc98282614762565b915050610100830151614ce0610100860182614b8d565b508091505092915050565b600060a083016000830151614d036000860182614835565b506020830151614d166020860182614671565b5060408301518482036040860152614d2e8282614853565b91505060608301518482036060860152614d488282614853565b9150506080830151614d5d6080860182614671565b508091505092915050565b6000604083016000830151614d806000860182614da5565b5060208301518482036020860152614d988282614ceb565b9150508091505092915050565b614dae81615602565b82525050565b614dbd8161560c565b82525050565b614dcc8161560c565b82525050565b614ddb8161561c565b82525050565b6000614ded828461488c565b915081905092915050565b6000614e04828561498d565b9150614e10828461495c565b91508190509392505050565b6000614e28828461498d565b9150614e3382614b47565b915081905092915050565b6000614e4982614a52565b9150614e55828461495c565b915081905092915050565b6000614e6b82614a98565b9150614e77828461495c565b915081905092915050565b6000614e8d82614abb565b9150614e99828461495c565b915081905092915050565b6000614eaf82614b01565b9150614ebb828461495c565b915081905092915050565b6000614ed182614b6a565b9150614edd828461495c565b915081905092915050565b6000602082019050614efd6000830184614680565b92915050565b6000604082019050614f186000830185614680565b614f256020830184614680565b9392505050565b6000608082019050614f416000830187614680565b614f4e6020830186614680565b614f5b6040830185614680565b614f6860608301846148db565b95945050505050565b6000604082019050614f866000830185614680565b614f9360208301846148db565b9392505050565b6000608082019050614faf6000830185614680565b614fbc6020830184614bcf565b9392505050565b6000604082019050614fd86000830185614680565b8181036020830152614fea8184614c11565b90509392505050565b60006060820190506150086000830186614680565b6150156020830185614dd2565b8181036040830152615027818461468f565b9050949350505050565b60006060820190506150466000830186614680565b6150536020830185614dd2565b81810360408301526150658184614704565b9050949350505050565b6000602082019050818103600083015261508981846147d7565b905092915050565b60006020820190506150a660008301846148bd565b92915050565b60006080820190506150c160008301856148bd565b6150ce6020830184614bcf565b9392505050565b60006020820190506150ea60008301846148db565b92915050565b600060408201905061510560008301856148db565b6151126020830184614844565b9392505050565b600060208201905081810360008301526151338184614923565b905092915050565b6000602082019050818103600083015261515481614a0c565b9050919050565b6000602082019050818103600083015261517481614a2f565b9050919050565b6000602082019050818103600083015261519481614a75565b9050919050565b600060208201905081810360008301526151b481614ade565b9050919050565b600060208201905081810360008301526151d481614b24565b9050919050565b600060208201905081810360008301526151f58184614c11565b905092915050565b60006020820190506152126000830184614dc3565b92915050565b6000615222615233565b905061522e82826156a4565b919050565b6000604051905090565b600067ffffffffffffffff821115615258576152576157dc565b5b602082029050602081019050919050565b600067ffffffffffffffff821115615284576152836157dc565b5b602082029050602081019050919050565b600067ffffffffffffffff8211156152b0576152af6157dc565b5b602082029050602081019050919050565b600067ffffffffffffffff8211156152dc576152db6157dc565b5b602082029050602081019050919050565b600067ffffffffffffffff821115615308576153076157dc565b5b602082029050602081019050919050565b600067ffffffffffffffff821115615334576153336157dc565b5b61533d8261580b565b9050602081019050919050565b600067ffffffffffffffff821115615365576153646157dc565b5b61536e8261580b565b9050602081019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b6000819050602082019050919050565b60008190508160005260206000209050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b60006154de82615602565b91506154e983615602565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561551e5761551d61574f565b5b828201905092915050565b600061553482615602565b915061553f83615602565b92508261554f5761554e61577e565b5b828204905092915050565b600061556582615602565b915061557083615602565b9250828210156155835761558261574f565b5b828203905092915050565b6000615599826155e2565b9050919050565b60006155ab826155e2565b9050919050565b60008115159050919050565b6000819050919050565b60008160030b9050919050565b60008160070b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600063ffffffff82169050919050565b600067ffffffffffffffff82169050919050565b82818337600083830152505050565b60005b8381101561565d578082015181840152602081019050615642565b8381111561566c576000848401525b50505050565b6000600282049050600182168061568a57607f821691505b6020821081141561569e5761569d6157ad565b5b50919050565b6156ad8261580b565b810181811067ffffffffffffffff821117156156cc576156cb6157dc565b5b80604052505050565b60006156e082615602565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156157135761571261574f565b5b600182019050919050565b600061572982615602565b915061573483615602565b9250826157445761574361577e565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f43616e6e6f7420636c61696d2074686973206e66740000000000000000000000600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f206275726e20746f6b656e2e20526561736f6e20436f6460008201527f653a200000000000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f2067657420746f6b656e20696e666f0000000000000000600082015250565b7f4661696c656420746f206d696e7420746f6b656e2e20526561736f6e20436f6460008201527f653a200000000000000000000000000000000000000000000000000000000000602082015250565b7f4661696c656420746f2063726561746520746f6b656e2e20526561736f6e204360008201527f6f64653a20000000000000000000000000000000000000000000000000000000602082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f4661696c656420746f206173736f636961746520746f6b656e2e20526561736f60008201527f6e20436f64653a20000000000000000000000000000000000000000000000000602082015250565b7f416c726561647920696e697469616c697a656400000000000000000000000000600082015250565b7f7b69647d00000000000000000000000000000000000000000000000000000000600082015250565b7f4661696c656420746f207472616e7366657220746f6b656e2e20526561736f6e60008201527f20436f64653a2000000000000000000000000000000000000000000000000000602082015250565b615acc8161558e565b8114615ad757600080fd5b50565b615ae3816155a0565b8114615aee57600080fd5b50565b615afa816155b2565b8114615b0557600080fd5b50565b615b11816155c8565b8114615b1c57600080fd5b50565b615b28816155d5565b8114615b3357600080fd5b50565b615b3f81615602565b8114615b4a57600080fd5b50565b615b568161560c565b8114615b6157600080fd5b50565b615b6d8161561c565b8114615b7857600080fd5b5056fea26469706673582212206938c32011e6648854a699eaf44e3b65056deb1073dc7c522673739a6d41e8b564736f6c63430008040033";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRzX2FiaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2hlZGVyYS9odHNfYWJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsd0JBQXdCLEdBQUc7SUFDdEM7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxXQUFXO1FBQ2pCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsV0FBVztnQkFDekIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFdBQVc7YUFDbEI7U0FDRjtRQUNELElBQUksRUFBRSxpQkFBaUI7UUFDdkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxRQUFRO2FBQ2Y7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxZQUFZLEVBQUUsUUFBUTtnQkFDdEIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLFFBQVE7YUFDZjtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsTUFBTTt3QkFDWixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGlCQUFpQjt3QkFDdkIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE9BQU87d0JBQ3JCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsT0FBTztxQkFDZDtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGVBQWU7d0JBQ3JCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFVBQVUsRUFBRTtvQ0FDVjt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLG1CQUFtQjt3Q0FDekIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxZQUFZO3dDQUNsQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE9BQU87d0NBQ3JCLElBQUksRUFBRSxTQUFTO3dDQUNmLElBQUksRUFBRSxPQUFPO3FDQUNkO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLHVCQUF1Qjt3Q0FDN0IsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSxxQ0FBcUM7Z0NBQ25ELElBQUksRUFBRSxLQUFLO2dDQUNYLElBQUksRUFBRSxPQUFPOzZCQUNkO3lCQUNGO3dCQUNELFlBQVksRUFBRSx1Q0FBdUM7d0JBQ3JELElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLGtCQUFrQjtnQ0FDeEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsaUJBQWlCO2dDQUN2QixJQUFJLEVBQUUsUUFBUTs2QkFDZjt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsbUNBQW1DO3dCQUNqRCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsT0FBTztxQkFDZDtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsd0NBQXdDO2dCQUN0RCxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLElBQUksRUFBRSxRQUFRO2FBQ2Y7WUFDRDtnQkFDRSxZQUFZLEVBQUUsUUFBUTtnQkFDdEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELElBQUksRUFBRSxxQkFBcUI7UUFDM0IsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsZUFBZSxFQUFFLFNBQVM7UUFDMUIsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsTUFBTTt3QkFDWixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGlCQUFpQjt3QkFDdkIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE9BQU87d0JBQ3JCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsT0FBTztxQkFDZDtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGVBQWU7d0JBQ3JCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFVBQVUsRUFBRTtvQ0FDVjt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLG1CQUFtQjt3Q0FDekIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxZQUFZO3dDQUNsQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE9BQU87d0NBQ3JCLElBQUksRUFBRSxTQUFTO3dDQUNmLElBQUksRUFBRSxPQUFPO3FDQUNkO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLHVCQUF1Qjt3Q0FDN0IsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSxxQ0FBcUM7Z0NBQ25ELElBQUksRUFBRSxLQUFLO2dDQUNYLElBQUksRUFBRSxPQUFPOzZCQUNkO3lCQUNGO3dCQUNELFlBQVksRUFBRSx1Q0FBdUM7d0JBQ3JELElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLGtCQUFrQjtnQ0FDeEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsaUJBQWlCO2dDQUN2QixJQUFJLEVBQUUsUUFBUTs2QkFDZjt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsbUNBQW1DO3dCQUNqRCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsT0FBTztxQkFDZDtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsd0NBQXdDO2dCQUN0RCxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxvQkFBb0I7Z0JBQzFCLElBQUksRUFBRSxRQUFRO2FBQ2Y7WUFDRDtnQkFDRSxZQUFZLEVBQUUsUUFBUTtnQkFDdEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxRQUFRO2FBQ2Y7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsU0FBUzt3QkFDZixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxvQkFBb0I7d0JBQzFCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxNQUFNO3dCQUNwQixJQUFJLEVBQUUsMkJBQTJCO3dCQUNqQyxJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsdUNBQXVDO2dCQUNyRCxJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLGFBQWE7d0JBQ25CLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsZUFBZTt3QkFDckIsSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxlQUFlO3dCQUNyQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGdCQUFnQjt3QkFDdEIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxjQUFjO3dCQUNwQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLDRDQUE0QztnQkFDMUQsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxtQ0FBbUM7UUFDekMsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsZUFBZSxFQUFFLFNBQVM7UUFDMUIsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsTUFBTTt3QkFDWixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGlCQUFpQjt3QkFDdkIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE9BQU87d0JBQ3JCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsT0FBTztxQkFDZDtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGVBQWU7d0JBQ3JCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFVBQVUsRUFBRTtvQ0FDVjt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLG1CQUFtQjt3Q0FDekIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxZQUFZO3dDQUNsQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE9BQU87d0NBQ3JCLElBQUksRUFBRSxTQUFTO3dDQUNmLElBQUksRUFBRSxPQUFPO3FDQUNkO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLHVCQUF1Qjt3Q0FDN0IsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSxxQ0FBcUM7Z0NBQ25ELElBQUksRUFBRSxLQUFLO2dDQUNYLElBQUksRUFBRSxPQUFPOzZCQUNkO3lCQUNGO3dCQUNELFlBQVksRUFBRSx1Q0FBdUM7d0JBQ3JELElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLGtCQUFrQjtnQ0FDeEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsaUJBQWlCO2dDQUN2QixJQUFJLEVBQUUsUUFBUTs2QkFDZjt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsbUNBQW1DO3dCQUNqRCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsT0FBTztxQkFDZDtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsd0NBQXdDO2dCQUN0RCxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsd0JBQXdCO1FBQzlCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxTQUFTO1FBQzFCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxNQUFNO3dCQUNaLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLFVBQVU7d0JBQ2hCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxlQUFlO3dCQUNyQixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxVQUFVLEVBQUU7NEJBQ1Y7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxTQUFTO2dDQUNmLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxtQkFBbUI7d0NBQ3pCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsWUFBWTt3Q0FDbEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsU0FBUzt3Q0FDZixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsT0FBTzt3Q0FDckIsSUFBSSxFQUFFLGlCQUFpQjt3Q0FDdkIsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSx1QkFBdUI7d0NBQzdCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtpQ0FDRjtnQ0FDRCxZQUFZLEVBQUUscUNBQXFDO2dDQUNuRCxJQUFJLEVBQUUsS0FBSztnQ0FDWCxJQUFJLEVBQUUsT0FBTzs2QkFDZDt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsdUNBQXVDO3dCQUNyRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxrQkFBa0I7Z0NBQ3hCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLGlCQUFpQjtnQ0FDdkIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7eUJBQ0Y7d0JBQ0QsWUFBWSxFQUFFLG1DQUFtQzt3QkFDakQsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLHdDQUF3QztnQkFDdEQsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxTQUFTO3dCQUNmLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLG9CQUFvQjt3QkFDMUIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSwyQkFBMkI7d0JBQ2pDLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO2lCQUNGO2dCQUNELFlBQVksRUFBRSx1Q0FBdUM7Z0JBQ3JELElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLFdBQVc7d0JBQ2pCLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsYUFBYTt3QkFDbkIsSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsU0FBUzt3QkFDZixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxvQkFBb0I7d0JBQzFCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO2lCQUNGO2dCQUNELFlBQVksRUFBRSx5Q0FBeUM7Z0JBQ3ZELElBQUksRUFBRSxhQUFhO2dCQUNuQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLHNDQUFzQztRQUM1QyxPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsU0FBUztRQUMxQixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsT0FBTzt3QkFDYixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxTQUFTO2dDQUN2QixJQUFJLEVBQUUsV0FBVztnQ0FDakIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxPQUFPO2dDQUNyQixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsT0FBTzs2QkFDZDt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsNENBQTRDO3dCQUMxRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLGlCQUFpQjtnQ0FDdkIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxTQUFTO2dDQUN2QixJQUFJLEVBQUUsbUJBQW1CO2dDQUN6QixJQUFJLEVBQUUsU0FBUzs2QkFDaEI7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLE9BQU87Z0NBQ3JCLElBQUksRUFBRSxjQUFjO2dDQUNwQixJQUFJLEVBQUUsT0FBTzs2QkFDZDt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsMENBQTBDO3dCQUN4RCxJQUFJLEVBQUUsY0FBYzt3QkFDcEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO2lCQUNGO2dCQUNELFlBQVksRUFBRSxnREFBZ0Q7Z0JBQzlELElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxXQUFXO2dCQUN6QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsV0FBVzthQUNsQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxzQkFBc0I7UUFDNUIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxNQUFNO3dDQUNaLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsUUFBUTt3Q0FDZCxJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLFVBQVU7d0NBQ2hCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLE1BQU07d0NBQ1osSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxpQkFBaUI7d0NBQ3ZCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsV0FBVzt3Q0FDakIsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxlQUFlO3dDQUNyQixJQUFJLEVBQUUsTUFBTTtxQ0FDYjtvQ0FDRDt3Q0FDRSxVQUFVLEVBQUU7NENBQ1Y7Z0RBQ0UsWUFBWSxFQUFFLFNBQVM7Z0RBQ3ZCLElBQUksRUFBRSxTQUFTO2dEQUNmLElBQUksRUFBRSxTQUFTOzZDQUNoQjs0Q0FDRDtnREFDRSxVQUFVLEVBQUU7b0RBQ1Y7d0RBQ0UsWUFBWSxFQUFFLE1BQU07d0RBQ3BCLElBQUksRUFBRSxtQkFBbUI7d0RBQ3pCLElBQUksRUFBRSxNQUFNO3FEQUNiO29EQUNEO3dEQUNFLFlBQVksRUFBRSxTQUFTO3dEQUN2QixJQUFJLEVBQUUsWUFBWTt3REFDbEIsSUFBSSxFQUFFLFNBQVM7cURBQ2hCO29EQUNEO3dEQUNFLFlBQVksRUFBRSxPQUFPO3dEQUNyQixJQUFJLEVBQUUsU0FBUzt3REFDZixJQUFJLEVBQUUsT0FBTztxREFDZDtvREFDRDt3REFDRSxZQUFZLEVBQUUsT0FBTzt3REFDckIsSUFBSSxFQUFFLGlCQUFpQjt3REFDdkIsSUFBSSxFQUFFLE9BQU87cURBQ2Q7b0RBQ0Q7d0RBQ0UsWUFBWSxFQUFFLFNBQVM7d0RBQ3ZCLElBQUksRUFBRSx1QkFBdUI7d0RBQzdCLElBQUksRUFBRSxTQUFTO3FEQUNoQjtpREFDRjtnREFDRCxZQUFZLEVBQUUscUNBQXFDO2dEQUNuRCxJQUFJLEVBQUUsS0FBSztnREFDWCxJQUFJLEVBQUUsT0FBTzs2Q0FDZDt5Q0FDRjt3Q0FDRCxZQUFZLEVBQUUsdUNBQXVDO3dDQUNyRCxJQUFJLEVBQUUsV0FBVzt3Q0FDakIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFVBQVUsRUFBRTs0Q0FDVjtnREFDRSxZQUFZLEVBQUUsUUFBUTtnREFDdEIsSUFBSSxFQUFFLFFBQVE7Z0RBQ2QsSUFBSSxFQUFFLFFBQVE7NkNBQ2Y7NENBQ0Q7Z0RBQ0UsWUFBWSxFQUFFLFNBQVM7Z0RBQ3ZCLElBQUksRUFBRSxrQkFBa0I7Z0RBQ3hCLElBQUksRUFBRSxTQUFTOzZDQUNoQjs0Q0FDRDtnREFDRSxZQUFZLEVBQUUsUUFBUTtnREFDdEIsSUFBSSxFQUFFLGlCQUFpQjtnREFDdkIsSUFBSSxFQUFFLFFBQVE7NkNBQ2Y7eUNBQ0Y7d0NBQ0QsWUFBWSxFQUFFLG1DQUFtQzt3Q0FDakQsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7aUNBQ0Y7Z0NBQ0QsWUFBWSxFQUFFLHdDQUF3QztnQ0FDdEQsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLE9BQU87NkJBQ2Q7NEJBQ0Q7Z0NBQ0UsVUFBVSxFQUFFO29DQUNWO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsUUFBUTt3Q0FDZCxJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLFNBQVM7d0NBQ2YsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFlBQVksRUFBRSxNQUFNO3dDQUNwQixJQUFJLEVBQUUsb0JBQW9CO3dDQUMxQixJQUFJLEVBQUUsTUFBTTtxQ0FDYjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLDJCQUEyQjt3Q0FDakMsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxjQUFjO3dDQUNwQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7aUNBQ0Y7Z0NBQ0QsWUFBWSxFQUFFLHVDQUF1QztnQ0FDckQsSUFBSSxFQUFFLFdBQVc7Z0NBQ2pCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxXQUFXO3dDQUNqQixJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLGFBQWE7d0NBQ25CLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsZUFBZTt3Q0FDckIsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxlQUFlO3dDQUNyQixJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLGdCQUFnQjt3Q0FDdEIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxjQUFjO3dDQUNwQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7aUNBQ0Y7Z0NBQ0QsWUFBWSxFQUFFLDRDQUE0QztnQ0FDMUQsSUFBSSxFQUFFLGdCQUFnQjtnQ0FDdEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFVBQVUsRUFBRTtvQ0FDVjt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLFdBQVc7d0NBQ2pCLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsYUFBYTt3Q0FDbkIsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxRQUFRO3dDQUNkLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsU0FBUzt3Q0FDZixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxvQkFBb0I7d0NBQzFCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsY0FBYzt3Q0FDcEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSx5Q0FBeUM7Z0NBQ3ZELElBQUksRUFBRSxhQUFhO2dDQUNuQixJQUFJLEVBQUUsU0FBUzs2QkFDaEI7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLE1BQU07Z0NBQ3BCLElBQUksRUFBRSxrQkFBa0I7Z0NBQ3hCLElBQUksRUFBRSxNQUFNOzZCQUNiOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsU0FBUztnQ0FDZixJQUFJLEVBQUUsTUFBTTs2QkFDYjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFVBQVU7Z0NBQ2hCLElBQUksRUFBRSxRQUFROzZCQUNmOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsYUFBYTtnQ0FDbkIsSUFBSSxFQUFFLE1BQU07NkJBQ2I7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFFBQVE7Z0NBQ3RCLElBQUksRUFBRSxhQUFhO2dDQUNuQixJQUFJLEVBQUUsUUFBUTs2QkFDZjt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsc0NBQXNDO3dCQUNwRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxVQUFVO3dCQUNoQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsOENBQThDO2dCQUM1RCxJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxJQUFJLEVBQUUseUJBQXlCO1FBQy9CLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxVQUFVLEVBQUU7NEJBQ1Y7Z0NBQ0UsVUFBVSxFQUFFO29DQUNWO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsTUFBTTt3Q0FDWixJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxVQUFVO3dDQUNoQixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxNQUFNO3dDQUNaLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxNQUFNO3dDQUNwQixJQUFJLEVBQUUsaUJBQWlCO3dDQUN2QixJQUFJLEVBQUUsTUFBTTtxQ0FDYjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsT0FBTzt3Q0FDckIsSUFBSSxFQUFFLFdBQVc7d0NBQ2pCLElBQUksRUFBRSxPQUFPO3FDQUNkO29DQUNEO3dDQUNFLFlBQVksRUFBRSxNQUFNO3dDQUNwQixJQUFJLEVBQUUsZUFBZTt3Q0FDckIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsVUFBVSxFQUFFOzRDQUNWO2dEQUNFLFlBQVksRUFBRSxTQUFTO2dEQUN2QixJQUFJLEVBQUUsU0FBUztnREFDZixJQUFJLEVBQUUsU0FBUzs2Q0FDaEI7NENBQ0Q7Z0RBQ0UsVUFBVSxFQUFFO29EQUNWO3dEQUNFLFlBQVksRUFBRSxNQUFNO3dEQUNwQixJQUFJLEVBQUUsbUJBQW1CO3dEQUN6QixJQUFJLEVBQUUsTUFBTTtxREFDYjtvREFDRDt3REFDRSxZQUFZLEVBQUUsU0FBUzt3REFDdkIsSUFBSSxFQUFFLFlBQVk7d0RBQ2xCLElBQUksRUFBRSxTQUFTO3FEQUNoQjtvREFDRDt3REFDRSxZQUFZLEVBQUUsT0FBTzt3REFDckIsSUFBSSxFQUFFLFNBQVM7d0RBQ2YsSUFBSSxFQUFFLE9BQU87cURBQ2Q7b0RBQ0Q7d0RBQ0UsWUFBWSxFQUFFLE9BQU87d0RBQ3JCLElBQUksRUFBRSxpQkFBaUI7d0RBQ3ZCLElBQUksRUFBRSxPQUFPO3FEQUNkO29EQUNEO3dEQUNFLFlBQVksRUFBRSxTQUFTO3dEQUN2QixJQUFJLEVBQUUsdUJBQXVCO3dEQUM3QixJQUFJLEVBQUUsU0FBUztxREFDaEI7aURBQ0Y7Z0RBQ0QsWUFBWSxFQUFFLHFDQUFxQztnREFDbkQsSUFBSSxFQUFFLEtBQUs7Z0RBQ1gsSUFBSSxFQUFFLE9BQU87NkNBQ2Q7eUNBQ0Y7d0NBQ0QsWUFBWSxFQUFFLHVDQUF1Qzt3Q0FDckQsSUFBSSxFQUFFLFdBQVc7d0NBQ2pCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtvQ0FDRDt3Q0FDRSxVQUFVLEVBQUU7NENBQ1Y7Z0RBQ0UsWUFBWSxFQUFFLFFBQVE7Z0RBQ3RCLElBQUksRUFBRSxRQUFRO2dEQUNkLElBQUksRUFBRSxRQUFROzZDQUNmOzRDQUNEO2dEQUNFLFlBQVksRUFBRSxTQUFTO2dEQUN2QixJQUFJLEVBQUUsa0JBQWtCO2dEQUN4QixJQUFJLEVBQUUsU0FBUzs2Q0FDaEI7NENBQ0Q7Z0RBQ0UsWUFBWSxFQUFFLFFBQVE7Z0RBQ3RCLElBQUksRUFBRSxpQkFBaUI7Z0RBQ3ZCLElBQUksRUFBRSxRQUFROzZDQUNmO3lDQUNGO3dDQUNELFlBQVksRUFBRSxtQ0FBbUM7d0NBQ2pELElBQUksRUFBRSxRQUFRO3dDQUNkLElBQUksRUFBRSxPQUFPO3FDQUNkO2lDQUNGO2dDQUNELFlBQVksRUFBRSx3Q0FBd0M7Z0NBQ3RELElBQUksRUFBRSxRQUFRO2dDQUNkLElBQUksRUFBRSxPQUFPOzZCQUNkOzRCQUNEO2dDQUNFLFVBQVUsRUFBRTtvQ0FDVjt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSxTQUFTO3dDQUNmLElBQUksRUFBRSxTQUFTO3FDQUNoQjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsTUFBTTt3Q0FDcEIsSUFBSSxFQUFFLG9CQUFvQjt3Q0FDMUIsSUFBSSxFQUFFLE1BQU07cUNBQ2I7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSwyQkFBMkI7d0NBQ2pDLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsY0FBYzt3Q0FDcEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSx1Q0FBdUM7Z0NBQ3JELElBQUksRUFBRSxXQUFXO2dDQUNqQixJQUFJLEVBQUUsU0FBUzs2QkFDaEI7NEJBQ0Q7Z0NBQ0UsVUFBVSxFQUFFO29DQUNWO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsV0FBVzt3Q0FDakIsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxhQUFhO3dDQUNuQixJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLGVBQWU7d0NBQ3JCLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsZUFBZTt3Q0FDckIsSUFBSSxFQUFFLFFBQVE7cUNBQ2Y7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxnQkFBZ0I7d0NBQ3RCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsY0FBYzt3Q0FDcEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO2lDQUNGO2dDQUNELFlBQVksRUFBRSw0Q0FBNEM7Z0NBQzFELElBQUksRUFBRSxnQkFBZ0I7Z0NBQ3RCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxXQUFXO3dDQUNqQixJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsUUFBUTt3Q0FDdEIsSUFBSSxFQUFFLGFBQWE7d0NBQ25CLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxRQUFRO3dDQUN0QixJQUFJLEVBQUUsUUFBUTt3Q0FDZCxJQUFJLEVBQUUsUUFBUTtxQ0FDZjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLFNBQVM7d0NBQ2YsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFlBQVksRUFBRSxNQUFNO3dDQUNwQixJQUFJLEVBQUUsb0JBQW9CO3dDQUMxQixJQUFJLEVBQUUsTUFBTTtxQ0FDYjtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsU0FBUzt3Q0FDdkIsSUFBSSxFQUFFLGNBQWM7d0NBQ3BCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtpQ0FDRjtnQ0FDRCxZQUFZLEVBQUUseUNBQXlDO2dDQUN2RCxJQUFJLEVBQUUsYUFBYTtnQ0FDbkIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsa0JBQWtCO2dDQUN4QixJQUFJLEVBQUUsTUFBTTs2QkFDYjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsTUFBTTtnQ0FDcEIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLE1BQU07NkJBQ2I7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFFBQVE7Z0NBQ3RCLElBQUksRUFBRSxVQUFVO2dDQUNoQixJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsTUFBTTtnQ0FDcEIsSUFBSSxFQUFFLGFBQWE7Z0NBQ25CLElBQUksRUFBRSxNQUFNOzZCQUNiOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsYUFBYTtnQ0FDbkIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7eUJBQ0Y7d0JBQ0QsWUFBWSxFQUFFLHNDQUFzQzt3QkFDcEQsSUFBSSxFQUFFLFdBQVc7d0JBQ2pCLElBQUksRUFBRSxPQUFPO3FCQUNkO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxTQUFTO3dCQUNmLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsT0FBTzt3QkFDckIsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLElBQUksRUFBRSxPQUFPO3FCQUNkO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLGlEQUFpRDtnQkFDL0QsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsU0FBUzt3QkFDZixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxvQkFBb0I7d0JBQzFCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxNQUFNO3dCQUNwQixJQUFJLEVBQUUsMkJBQTJCO3dCQUNqQyxJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsdUNBQXVDO2dCQUNyRCxJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLGFBQWE7d0JBQ25CLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsZUFBZTt3QkFDckIsSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxlQUFlO3dCQUNyQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGdCQUFnQjt3QkFDdEIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxjQUFjO3dCQUNwQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLDRDQUE0QztnQkFDMUQsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLGFBQWE7d0JBQ25CLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxNQUFNO3dCQUNwQixJQUFJLEVBQUUsb0JBQW9CO3dCQUMxQixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUseUNBQXlDO2dCQUN2RCxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSw2QkFBNkI7UUFDbkMsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLElBQUksRUFBRSxNQUFNO2FBQ2I7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSwwQkFBMEI7UUFDaEMsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLElBQUksRUFBRSxNQUFNO2FBQ2I7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxvQkFBb0I7UUFDMUIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixJQUFJLEVBQUUsUUFBUTtxQkFDZjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsbUNBQW1DO2dCQUNqRCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsY0FBYztRQUNwQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsTUFBTTtnQ0FDWixJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxVQUFVO2dDQUNoQixJQUFJLEVBQUUsU0FBUzs2QkFDaEI7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFFBQVE7Z0NBQ3RCLElBQUksRUFBRSxNQUFNO2dDQUNaLElBQUksRUFBRSxRQUFROzZCQUNmOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsaUJBQWlCO2dDQUN2QixJQUFJLEVBQUUsTUFBTTs2QkFDYjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsT0FBTztnQ0FDckIsSUFBSSxFQUFFLFdBQVc7Z0NBQ2pCLElBQUksRUFBRSxPQUFPOzZCQUNkOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsZUFBZTtnQ0FDckIsSUFBSSxFQUFFLE1BQU07NkJBQ2I7NEJBQ0Q7Z0NBQ0UsVUFBVSxFQUFFO29DQUNWO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsU0FBUzt3Q0FDZixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsVUFBVSxFQUFFOzRDQUNWO2dEQUNFLFlBQVksRUFBRSxNQUFNO2dEQUNwQixJQUFJLEVBQUUsbUJBQW1CO2dEQUN6QixJQUFJLEVBQUUsTUFBTTs2Q0FDYjs0Q0FDRDtnREFDRSxZQUFZLEVBQUUsU0FBUztnREFDdkIsSUFBSSxFQUFFLFlBQVk7Z0RBQ2xCLElBQUksRUFBRSxTQUFTOzZDQUNoQjs0Q0FDRDtnREFDRSxZQUFZLEVBQUUsT0FBTztnREFDckIsSUFBSSxFQUFFLFNBQVM7Z0RBQ2YsSUFBSSxFQUFFLE9BQU87NkNBQ2Q7NENBQ0Q7Z0RBQ0UsWUFBWSxFQUFFLE9BQU87Z0RBQ3JCLElBQUksRUFBRSxpQkFBaUI7Z0RBQ3ZCLElBQUksRUFBRSxPQUFPOzZDQUNkOzRDQUNEO2dEQUNFLFlBQVksRUFBRSxTQUFTO2dEQUN2QixJQUFJLEVBQUUsdUJBQXVCO2dEQUM3QixJQUFJLEVBQUUsU0FBUzs2Q0FDaEI7eUNBQ0Y7d0NBQ0QsWUFBWSxFQUFFLHFDQUFxQzt3Q0FDbkQsSUFBSSxFQUFFLEtBQUs7d0NBQ1gsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7aUNBQ0Y7Z0NBQ0QsWUFBWSxFQUFFLHVDQUF1QztnQ0FDckQsSUFBSSxFQUFFLFdBQVc7Z0NBQ2pCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxRQUFRO3dDQUNkLElBQUksRUFBRSxRQUFRO3FDQUNmO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsa0JBQWtCO3dDQUN4QixJQUFJLEVBQUUsU0FBUztxQ0FDaEI7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFFBQVE7d0NBQ3RCLElBQUksRUFBRSxpQkFBaUI7d0NBQ3ZCLElBQUksRUFBRSxRQUFRO3FDQUNmO2lDQUNGO2dDQUNELFlBQVksRUFBRSxtQ0FBbUM7Z0NBQ2pELElBQUksRUFBRSxRQUFRO2dDQUNkLElBQUksRUFBRSxPQUFPOzZCQUNkO3lCQUNGO3dCQUNELFlBQVksRUFBRSx3Q0FBd0M7d0JBQ3RELElBQUksRUFBRSxRQUFRO3dCQUNkLElBQUksRUFBRSxPQUFPO3FCQUNkO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxTQUFTO2dDQUNmLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsTUFBTTtnQ0FDcEIsSUFBSSxFQUFFLG9CQUFvQjtnQ0FDMUIsSUFBSSxFQUFFLE1BQU07NkJBQ2I7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLE1BQU07Z0NBQ3BCLElBQUksRUFBRSwyQkFBMkI7Z0NBQ2pDLElBQUksRUFBRSxNQUFNOzZCQUNiOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxTQUFTO2dDQUN2QixJQUFJLEVBQUUsY0FBYztnQ0FDcEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCO3lCQUNGO3dCQUNELFlBQVksRUFBRSx1Q0FBdUM7d0JBQ3JELElBQUksRUFBRSxXQUFXO3dCQUNqQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsV0FBVztnQ0FDakIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFFBQVE7Z0NBQ3RCLElBQUksRUFBRSxhQUFhO2dDQUNuQixJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLGVBQWU7Z0NBQ3JCLElBQUksRUFBRSxRQUFROzZCQUNmOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsZUFBZTtnQ0FDckIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLE1BQU07Z0NBQ3BCLElBQUksRUFBRSxnQkFBZ0I7Z0NBQ3RCLElBQUksRUFBRSxNQUFNOzZCQUNiOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxTQUFTO2dDQUN2QixJQUFJLEVBQUUsY0FBYztnQ0FDcEIsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCO3lCQUNGO3dCQUNELFlBQVksRUFBRSw0Q0FBNEM7d0JBQzFELElBQUksRUFBRSxnQkFBZ0I7d0JBQ3RCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxVQUFVLEVBQUU7NEJBQ1Y7Z0NBQ0UsWUFBWSxFQUFFLFFBQVE7Z0NBQ3RCLElBQUksRUFBRSxXQUFXO2dDQUNqQixJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLGFBQWE7Z0NBQ25CLElBQUksRUFBRSxRQUFROzZCQUNmOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxRQUFRO2dDQUN0QixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxJQUFJLEVBQUUsUUFBUTs2QkFDZjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLFNBQVM7NkJBQ2hCOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsb0JBQW9CO2dDQUMxQixJQUFJLEVBQUUsTUFBTTs2QkFDYjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLGNBQWM7Z0NBQ3BCLElBQUksRUFBRSxTQUFTOzZCQUNoQjt5QkFDRjt3QkFDRCxZQUFZLEVBQUUseUNBQXlDO3dCQUN2RCxJQUFJLEVBQUUsYUFBYTt3QkFDbkIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxNQUFNO3dCQUNwQixJQUFJLEVBQUUsa0JBQWtCO3dCQUN4QixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxVQUFVO3dCQUNoQixJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLGFBQWE7d0JBQ25CLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsYUFBYTt3QkFDbkIsSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLHNDQUFzQztnQkFDcEQsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFVBQVUsRUFBRTtvQkFDVjt3QkFDRSxZQUFZLEVBQUUsTUFBTTt3QkFDcEIsSUFBSSxFQUFFLG1CQUFtQjt3QkFDekIsSUFBSSxFQUFFLE1BQU07cUJBQ2I7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxZQUFZO3dCQUNsQixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE9BQU87d0JBQ3JCLElBQUksRUFBRSxTQUFTO3dCQUNmLElBQUksRUFBRSxPQUFPO3FCQUNkO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixJQUFJLEVBQUUsT0FBTztxQkFDZDtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLHVCQUF1Qjt3QkFDN0IsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO2lCQUNGO2dCQUNELFlBQVksRUFBRSxxQ0FBcUM7Z0JBQ25ELElBQUksRUFBRSxLQUFLO2dCQUNYLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxjQUFjO1FBQ3BCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGVBQWU7UUFDckIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxZQUFZLEVBQUUsTUFBTTtnQkFDcEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxNQUFNO2FBQ2I7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxNQUFNO2dCQUNwQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsTUFBTTthQUNiO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxNQUFNO2dCQUNwQixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLE1BQU07YUFDYjtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7WUFDRDtnQkFDRSxZQUFZLEVBQUUsTUFBTTtnQkFDcEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLE1BQU07YUFDYjtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxRQUFRO2dCQUN0QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsUUFBUTthQUNmO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLFdBQVc7UUFDakIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSxRQUFRO2FBQ2Y7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsWUFBWTtRQUNsQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxNQUFNO2dCQUNwQixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsSUFBSSxFQUFFLE1BQU07YUFDYjtTQUNGO1FBQ0QsSUFBSSxFQUFFLG1CQUFtQjtRQUN6QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxjQUFjO1FBQ3BCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsSUFBSTtnQkFDVixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxpQkFBaUI7UUFDdkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxXQUFXO2FBQ2xCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsV0FBVzthQUNsQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxjQUFjO1FBQ3BCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsSUFBSSxFQUFFLGVBQWU7UUFDckIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxXQUFXO2dCQUNqQixJQUFJLEVBQUUsV0FBVzthQUNsQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxlQUFlO1FBQ3JCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGNBQWM7UUFDcEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixJQUFJLEVBQUUsUUFBUTtxQkFDZjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsbUNBQW1DO2dCQUNqRCxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsSUFBSSxFQUFFLHVCQUF1QjtRQUM3QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxNQUFNO3dCQUNaLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLFVBQVU7d0JBQ2hCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxlQUFlO3dCQUNyQixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxVQUFVLEVBQUU7NEJBQ1Y7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxTQUFTO2dDQUNmLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxtQkFBbUI7d0NBQ3pCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsWUFBWTt3Q0FDbEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsU0FBUzt3Q0FDZixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsT0FBTzt3Q0FDckIsSUFBSSxFQUFFLGlCQUFpQjt3Q0FDdkIsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSx1QkFBdUI7d0NBQzdCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtpQ0FDRjtnQ0FDRCxZQUFZLEVBQUUscUNBQXFDO2dDQUNuRCxJQUFJLEVBQUUsS0FBSztnQ0FDWCxJQUFJLEVBQUUsT0FBTzs2QkFDZDt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsdUNBQXVDO3dCQUNyRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxrQkFBa0I7Z0NBQ3hCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLGlCQUFpQjtnQ0FDdkIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7eUJBQ0Y7d0JBQ0QsWUFBWSxFQUFFLG1DQUFtQzt3QkFDakQsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLHdDQUF3QztnQkFDdEQsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELElBQUksRUFBRSxpQkFBaUI7UUFDdkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxTQUFTO3dCQUN2QixJQUFJLEVBQUUsU0FBUzt3QkFDZixJQUFJLEVBQUUsU0FBUztxQkFDaEI7b0JBQ0Q7d0JBQ0UsVUFBVSxFQUFFOzRCQUNWO2dDQUNFLFlBQVksRUFBRSxNQUFNO2dDQUNwQixJQUFJLEVBQUUsbUJBQW1CO2dDQUN6QixJQUFJLEVBQUUsTUFBTTs2QkFDYjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsU0FBUztnQ0FDdkIsSUFBSSxFQUFFLFlBQVk7Z0NBQ2xCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsT0FBTztnQ0FDckIsSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLE9BQU87NkJBQ2Q7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLE9BQU87Z0NBQ3JCLElBQUksRUFBRSxpQkFBaUI7Z0NBQ3ZCLElBQUksRUFBRSxPQUFPOzZCQUNkOzRCQUNEO2dDQUNFLFlBQVksRUFBRSxTQUFTO2dDQUN2QixJQUFJLEVBQUUsdUJBQXVCO2dDQUM3QixJQUFJLEVBQUUsU0FBUzs2QkFDaEI7eUJBQ0Y7d0JBQ0QsWUFBWSxFQUFFLHFDQUFxQzt3QkFDbkQsSUFBSSxFQUFFLEtBQUs7d0JBQ1gsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLHVDQUF1QztnQkFDckQsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxpQkFBaUI7UUFDdkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELElBQUksRUFBRSxrQkFBa0I7UUFDeEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxlQUFlO2dCQUNyQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLHFCQUFxQjtRQUMzQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0NBQ0YsQ0FBQztBQUVXLFFBQUEsZ0JBQWdCLEdBQUc7SUFDOUI7UUFDRSxTQUFTLEVBQUUsS0FBSztRQUNoQixNQUFNLEVBQUU7WUFDTjtnQkFDRSxPQUFPLEVBQUUsSUFBSTtnQkFDYixZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLHNCQUFzQjtRQUM1QixJQUFJLEVBQUUsT0FBTztLQUNkO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsRUFBRTtRQUNWLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsRUFBRTtRQUNWLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsRUFBRTtRQUNWLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUUsRUFBRTtRQUNWLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxPQUFPO2dCQUNyQixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLE9BQU87YUFDZDtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEVBQUU7UUFDWCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLE1BQU07UUFDdkIsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsV0FBVztnQkFDekIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFdBQVc7YUFDbEI7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxvQkFBb0I7UUFDMUIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsUUFBUTthQUNmO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixJQUFJLEVBQUUsUUFBUTtxQkFDZjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsbUNBQW1DO2dCQUNqRCxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGVBQWU7UUFDckIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFLEVBQUU7UUFDVixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsUUFBUTtnQkFDdEIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFLFFBQVE7YUFDZjtZQUNEO2dCQUNFLFlBQVksRUFBRSxRQUFRO2dCQUN0QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsUUFBUTthQUNmO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxVQUFVO2dCQUNoQixJQUFJLEVBQUUsUUFBUTthQUNmO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsWUFBWTtRQUNsQixPQUFPLEVBQUUsRUFBRTtRQUNYLGVBQWUsRUFBRSxTQUFTO1FBQzFCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLFNBQVM7YUFDaEI7U0FDRjtRQUNELElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsT0FBTzthQUNkO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLE1BQU07Z0JBQ3BCLElBQUksRUFBRSxZQUFZO2dCQUNsQixJQUFJLEVBQUUsTUFBTTthQUNiO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsWUFBWSxFQUFFLE9BQU87Z0JBQ3JCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLEVBQUU7UUFDWCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsRUFBRTtnQkFDUixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsZUFBZSxFQUFFLE1BQU07UUFDdkIsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLFlBQVk7UUFDbEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsUUFBUTthQUNmO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFLEVBQUU7UUFDVixJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtZQUNEO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsT0FBTztnQkFDckIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsZUFBZSxFQUFFLFlBQVk7UUFDN0IsSUFBSSxFQUFFLFVBQVU7S0FDakI7SUFDRDtRQUNFLE1BQU0sRUFBRTtZQUNOO2dCQUNFLFlBQVksRUFBRSxTQUFTO2dCQUN2QixJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsU0FBUzthQUNoQjtTQUNGO1FBQ0QsSUFBSSxFQUFFLGNBQWM7UUFDcEIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsUUFBUTthQUNmO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtJQUNEO1FBQ0UsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxTQUFTO2FBQ2hCO1lBQ0Q7Z0JBQ0UsVUFBVSxFQUFFO29CQUNWO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixJQUFJLEVBQUUsUUFBUTtxQkFDZjtpQkFDRjtnQkFDRCxZQUFZLEVBQUUsbUNBQW1DO2dCQUNqRCxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsSUFBSSxFQUFFLE9BQU87YUFDZDtTQUNGO1FBQ0QsSUFBSSxFQUFFLHVCQUF1QjtRQUM3QixPQUFPLEVBQUU7WUFDUDtnQkFDRSxZQUFZLEVBQUUsUUFBUTtnQkFDdEIsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxRQUFRO2FBQ2Y7U0FDRjtRQUNELGVBQWUsRUFBRSxZQUFZO1FBQzdCLElBQUksRUFBRSxVQUFVO0tBQ2pCO0lBQ0Q7UUFDRSxNQUFNLEVBQUU7WUFDTjtnQkFDRSxZQUFZLEVBQUUsU0FBUztnQkFDdkIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7YUFDaEI7WUFDRDtnQkFDRSxVQUFVLEVBQUU7b0JBQ1Y7d0JBQ0UsWUFBWSxFQUFFLFFBQVE7d0JBQ3RCLElBQUksRUFBRSxNQUFNO3dCQUNaLElBQUksRUFBRSxRQUFRO3FCQUNmO29CQUNEO3dCQUNFLFlBQVksRUFBRSxRQUFRO3dCQUN0QixJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsUUFBUTtxQkFDZjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsU0FBUzt3QkFDdkIsSUFBSSxFQUFFLFVBQVU7d0JBQ2hCLElBQUksRUFBRSxTQUFTO3FCQUNoQjtvQkFDRDt3QkFDRSxZQUFZLEVBQUUsUUFBUTt3QkFDdEIsSUFBSSxFQUFFLE1BQU07d0JBQ1osSUFBSSxFQUFFLFFBQVE7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLElBQUksRUFBRSxNQUFNO3FCQUNiO29CQUNEO3dCQUNFLFlBQVksRUFBRSxPQUFPO3dCQUNyQixJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7b0JBQ0Q7d0JBQ0UsWUFBWSxFQUFFLE1BQU07d0JBQ3BCLElBQUksRUFBRSxlQUFlO3dCQUNyQixJQUFJLEVBQUUsTUFBTTtxQkFDYjtvQkFDRDt3QkFDRSxVQUFVLEVBQUU7NEJBQ1Y7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxTQUFTO2dDQUNmLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxVQUFVLEVBQUU7b0NBQ1Y7d0NBQ0UsWUFBWSxFQUFFLE1BQU07d0NBQ3BCLElBQUksRUFBRSxtQkFBbUI7d0NBQ3pCLElBQUksRUFBRSxNQUFNO3FDQUNiO29DQUNEO3dDQUNFLFlBQVksRUFBRSxTQUFTO3dDQUN2QixJQUFJLEVBQUUsWUFBWTt3Q0FDbEIsSUFBSSxFQUFFLFNBQVM7cUNBQ2hCO29DQUNEO3dDQUNFLFlBQVksRUFBRSxPQUFPO3dDQUNyQixJQUFJLEVBQUUsU0FBUzt3Q0FDZixJQUFJLEVBQUUsT0FBTztxQ0FDZDtvQ0FDRDt3Q0FDRSxZQUFZLEVBQUUsT0FBTzt3Q0FDckIsSUFBSSxFQUFFLGlCQUFpQjt3Q0FDdkIsSUFBSSxFQUFFLE9BQU87cUNBQ2Q7b0NBQ0Q7d0NBQ0UsWUFBWSxFQUFFLFNBQVM7d0NBQ3ZCLElBQUksRUFBRSx1QkFBdUI7d0NBQzdCLElBQUksRUFBRSxTQUFTO3FDQUNoQjtpQ0FDRjtnQ0FDRCxZQUFZLEVBQUUscUNBQXFDO2dDQUNuRCxJQUFJLEVBQUUsS0FBSztnQ0FDWCxJQUFJLEVBQUUsT0FBTzs2QkFDZDt5QkFDRjt3QkFDRCxZQUFZLEVBQUUsdUNBQXVDO3dCQUNyRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsSUFBSSxFQUFFLFNBQVM7cUJBQ2hCO29CQUNEO3dCQUNFLFVBQVUsRUFBRTs0QkFDVjtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7NEJBQ0Q7Z0NBQ0UsWUFBWSxFQUFFLFNBQVM7Z0NBQ3ZCLElBQUksRUFBRSxrQkFBa0I7Z0NBQ3hCLElBQUksRUFBRSxTQUFTOzZCQUNoQjs0QkFDRDtnQ0FDRSxZQUFZLEVBQUUsUUFBUTtnQ0FDdEIsSUFBSSxFQUFFLGlCQUFpQjtnQ0FDdkIsSUFBSSxFQUFFLFFBQVE7NkJBQ2Y7eUJBQ0Y7d0JBQ0QsWUFBWSxFQUFFLG1DQUFtQzt3QkFDakQsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsSUFBSSxFQUFFLE9BQU87cUJBQ2Q7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFLHdDQUF3QztnQkFDdEQsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxPQUFPO2FBQ2Q7U0FDRjtRQUNELElBQUksRUFBRSxpQkFBaUI7UUFDdkIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLElBQUksRUFBRSxjQUFjO2dCQUNwQixJQUFJLEVBQUUsUUFBUTthQUNmO1NBQ0Y7UUFDRCxlQUFlLEVBQUUsWUFBWTtRQUM3QixJQUFJLEVBQUUsVUFBVTtLQUNqQjtDQUNGLENBQUM7QUFDVyxRQUFBLGVBQWUsR0FDMUIsZ3pnREFBZ3pnRCxDQUFDIn0=
