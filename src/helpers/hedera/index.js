var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
/* tslint:disable:no-unused-variable */
import BigNumber from "bignumber.js";
import { BigNumber as EthBN, ethers, Wallet } from "ethers";
import {
  Erc1155Minter__factory,
  Minter__factory,
  UserNftMinter__factory,
} from "xpnet-web3-contracts";
import { TransactionStatus } from "../../";
import axios from "axios";
//import { hethers } from "@hashgraph/hethers";
import {
  ContractCallQuery,
  ContractId,
  ContractFunctionParameters,
  Hbar,
  ContractExecuteTransaction,
} from "@hashgraph/sdk";
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
export function baseWeb3HelperFactory(provider, nonce) {
  return __awaiter(this, void 0, void 0, function () {
    var w3;
    return __generator(this, function (_a) {
      w3 = provider;
      return [
        2 /*return*/,
        {
          balance: function (address) {
            return __awaiter(this, void 0, void 0, function () {
              var bal;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, w3.getBalance(address)];
                  case 1:
                    bal = _a.sent();
                    // ethers BigNumber is not compatible with our bignumber
                    return [2 /*return*/, new BigNumber(bal.toString())];
                }
              });
            });
          },
          deployErc721: function (owner) {
            return __awaiter(this, void 0, void 0, function () {
              var factory, contract;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    factory = new UserNftMinter__factory(owner);
                    return [4 /*yield*/, factory.deploy()];
                  case 1:
                    contract = _a.sent();
                    return [2 /*return*/, contract.address];
                }
              });
            });
          },
          mintNftErc1155: function (owner, _a) {
            var contract = _a.contract;
            return __awaiter(this, void 0, void 0, function () {
              var erc1155, tx, _b, _c;
              return __generator(this, function (_d) {
                switch (_d.label) {
                  case 0:
                    erc1155 = Erc1155Minter__factory.connect(contract, owner);
                    _c = (_b = erc1155).mintNft;
                    return [4 /*yield*/, owner.getAddress()];
                  case 1:
                    return [4 /*yield*/, _c.apply(_b, [_d.sent()])];
                  case 2:
                    tx = _d.sent();
                    return [2 /*return*/, tx];
                }
              });
            });
          },
          mintNft: function (owner, _a) {
            var contract = _a.contract,
              uri = _a.uri,
              walletNonce = _a.walletNonce;
            return __awaiter(this, void 0, void 0, function () {
              var erc721, txm;
              var _this = this;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    erc721 = UserNftMinter__factory.connect(contract, owner);
                    return [
                      4 /*yield*/,
                      erc721
                        .mint(
                          uri,
                          __assign(
                            { gasLimit: 1000000 },
                            walletNonce ? { nonce: walletNonce } : {}
                          )
                        )
                        ["catch"](function (e) {
                          return __awaiter(_this, void 0, void 0, function () {
                            var tx;
                            return __generator(this, function (_a) {
                              switch (_a.label) {
                                case 0:
                                  if (!(nonce === 33)) return [3 /*break*/, 4];
                                  tx = void 0;
                                  _a.label = 1;
                                case 1:
                                  if (!!tx) return [3 /*break*/, 3];
                                  return [
                                    4 /*yield*/,
                                    provider.getTransaction(e["returnedHash"]),
                                  ];
                                case 2:
                                  tx = _a.sent();
                                  return [3 /*break*/, 1];
                                case 3:
                                  return [2 /*return*/, tx];
                                case 4:
                                  throw e;
                              }
                            });
                          });
                        }),
                    ];
                  case 1:
                    txm = _b.sent();
                    return [2 /*return*/, txm];
                }
              });
            });
          },
        },
      ];
    });
  });
}
export var NFT_METHOD_MAP = {
  ERC1155: {
    freeze: "freezeErc1155",
    validateUnfreeze: "validateUnfreezeErc1155",
    umt: Erc1155Minter__factory,
    approved: function (_tok) {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          /*return umt.isApprovedForAll(sender, minterAddr, {
                  gasLimit: "85000",
                  customData,
                });*/
          return [2 /*return*/, true];
        });
      });
    },
    approve: function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          /*const tx = await umt.populateTransaction.setApprovalForAll(
                  forAddr,
                  true,
                  {
                    gasLimit: "85000",
                    customData,
                  }
                );
                await txnUp(tx);
                return await umt.signer.sendTransaction(tx);*/
          return [2 /*return*/, null];
        });
      });
    },
  },
  ERC721: {
    freeze: "freezeErc721",
    validateUnfreeze: "validateUnfreezeErc721",
    umt: UserNftMinter__factory,
    approved: function (contract, signer, minterAddr, tok) {
      return __awaiter(void 0, void 0, void 0, function () {
        var x, txResponse;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              console.log(ContractCallQuery);
              return [
                4 /*yield*/,
                new ContractCallQuery()
                  .setContractId(ContractId.fromSolidityAddress(contract))
                  .setGas(2000000)
                  .setQueryPayment(new Hbar(5))
                  .setFunction(
                    "getApproved",
                    new ContractFunctionParameters().addUint256(Number(tok))
                  ),
              ];
            case 1:
              x = _b.sent();
              return [4 /*yield*/, x.executeWithSigner(signer)];
            case 2:
              txResponse = _b.sent();
              return [
                2 /*return*/,
                ((_a = txResponse.getString(0)) === null || _a === void 0
                  ? void 0
                  : _a.toLowerCase()) == minterAddr.toLowerCase(),
              ];
          }
        });
      });
    },
    approve: function (contract, forAddr, tok, signer) {
      return __awaiter(void 0, void 0, void 0, function () {
        var transaction, txResponse, receipt;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                new ContractExecuteTransaction()
                  .setContractId(ContractId.fromSolidityAddress(contract))
                  .setGas(2000000)
                  .setPayableAmount(5)
                  .setFunction(
                    "approve",
                    new ContractFunctionParameters()
                      .addAddress(forAddr)
                      .addUint256(Number(tok))
                  )
                  .freezeWithSigner(signer),
              ];
            case 1:
              transaction = _a.sent();
              return [4 /*yield*/, transaction];
            case 2:
              return [4 /*yield*/, _a.sent().executeWithSigner(signer)];
            case 3:
              txResponse = _a.sent();
              console.log("x");
              return [4 /*yield*/, txResponse.getReceiptWithSigner(signer)];
            case 4:
              receipt = _a.sent();
              console.log(receipt, txResponse.transactionId);
              return [2 /*return*/, null];
          }
        });
      });
    },
  },
};
export function web3HelperFactory(params) {
  return __awaiter(this, void 0, void 0, function () {
    function notifyValidator(
      fromHash,
      actionId,
      type,
      toChain,
      txFees,
      senderAddress,
      targetAddress,
      nftUri,
      tokenId,
      contract
    ) {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                params.notifier.notifyWeb3(
                  params.nonce,
                  fromHash,
                  actionId,
                  type,
                  toChain,
                  txFees,
                  senderAddress,
                  targetAddress,
                  nftUri,
                  tokenId,
                  contract
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    }
    //@ts-ignore
    function getTransaction(hash) {
      return __awaiter(this, void 0, void 0, function () {
        var trx, fails;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fails = 0;
              _a.label = 1;
            case 1:
              if (!(!trx && fails < 7)) return [3 /*break*/, 4];
              return [4 /*yield*/, provider.getTransaction(hash)];
            case 2:
              trx = _a.sent();
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(function () {
                    return resolve("wait");
                  }, 5000 + fails * 2);
                }),
              ];
            case 3:
              _a.sent();
              fails++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/, trx];
          }
        });
      });
    }
    function extractAction(txr) {
      return __awaiter(this, void 0, void 0, function () {
        var receipt, log, evdat, action_id;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, txr.wait()];
            case 1:
              receipt = _a.sent();
              log = receipt.logs.find(function (log) {
                return log.address === minter.address;
              });
              if (log === undefined) {
                throw Error("Couldn't extract action_id");
              }
              evdat = minter.interface.parseLog(log);
              action_id = evdat.args[0].toString();
              return [2 /*return*/, action_id];
          }
        });
      });
    }
    var txnUnderpricedPolyWorkaround,
      w3,
      minter_addr,
      provider,
      minter,
      isApprovedForMinter,
      approveForMinter,
      base;
    var _this = this;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          txnUnderpricedPolyWorkaround =
            params.nonce == 7
              ? function (utx) {
                  return __awaiter(_this, void 0, void 0, function () {
                    var res, _a, result, fast, trackerGas, sixtyGwei;
                    var _this = this;
                    return __generator(this, function (_b) {
                      switch (_b.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            axios
                              .get(
                                "https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata"
                              )
                              ["catch"](function () {
                                return __awaiter(
                                  _this,
                                  void 0,
                                  void 0,
                                  function () {
                                    return __generator(this, function (_a) {
                                      switch (_a.label) {
                                        case 0:
                                          return [
                                            4 /*yield*/,
                                            axios.get(
                                              "https://gasstation-mainnet.matic.network/v2"
                                            ),
                                          ];
                                        case 1:
                                          return [2 /*return*/, _a.sent()];
                                      }
                                    });
                                  }
                                );
                              }),
                          ];
                        case 1:
                          res = _b.sent();
                          (_a = res.data),
                            (result = _a.result),
                            (fast = _a.fast);
                          trackerGas =
                            (result === null || result === void 0
                              ? void 0
                              : result.rapidgaspricegwei) ||
                            (fast === null || fast === void 0
                              ? void 0
                              : fast.maxFee);
                          if (trackerGas) {
                            sixtyGwei = ethers.utils.parseUnits(
                              Math.ceil(trackerGas).toString(),
                              "gwei"
                            );
                            utx.maxFeePerGas = sixtyGwei;
                            utx.maxPriorityFeePerGas = sixtyGwei;
                          }
                          return [2 /*return*/];
                      }
                    });
                  });
                }
              : function () {
                  return Promise.resolve();
                };
          w3 = params.provider;
          (minter_addr = params.minter_addr), (provider = params.provider);
          minter = Minter__factory.connect(minter_addr, provider);
          isApprovedForMinter = function (id, signer) {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      NFT_METHOD_MAP[id.native.contractType].approved(
                        id.native.contract,
                        signer,
                        params.erc721_addr,
                        id.native.tokenId
                      ),
                    ];
                  case 1:
                    return [2 /*return*/, _a.sent()];
                }
              });
            });
          };
          approveForMinter = function (id, sender, _txFees) {
            return __awaiter(_this, void 0, void 0, function () {
              var isApproved, toApprove;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, isApprovedForMinter(id, sender)];
                  case 1:
                    isApproved = _a.sent();
                    if (isApproved) {
                      return [2 /*return*/, undefined];
                    }
                    toApprove = params.erc721_addr;
                    return [
                      4 /*yield*/,
                      NFT_METHOD_MAP[id.native.contractType].approve(
                        id.native.contract,
                        toApprove,
                        id.native.tokenId,
                        sender
                      ),
                    ];
                  case 2:
                    _a.sent();
                    return [2 /*return*/, ""];
                }
              });
            });
          };
          return [
            4 /*yield*/,
            baseWeb3HelperFactory(params.provider, params.nonce),
          ];
        case 1:
          base = _a.sent();
          return [
            2 /*return*/,
            __assign(__assign({}, base), {
              XpNft: params.erc721_addr,
              XpNft1155: params.erc1155_addr,
              getParams: function () {
                return params;
              },
              approveForMinter: approveForMinter,
              getProvider: function () {
                return provider;
              },
              estimateValidateUnfreezeNft: function (_to, _id, _mW) {
                return __awaiter(this, void 0, void 0, function () {
                  var gas;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, provider.getGasPrice()];
                      case 1:
                        gas = _a.sent();
                        return [
                          2 /*return*/,
                          new BigNumber(gas.mul(150000).toString()),
                        ];
                    }
                  });
                });
              },
              getFeeMargin: function () {
                return params.feeMargin;
              },
              isApprovedForMinter: isApprovedForMinter,
              preTransfer: function (s, id, fee) {
                return approveForMinter(id, s, fee);
              },
              extractAction: extractAction,
              isContractAddress: function (address) {
                return __awaiter(this, void 0, void 0, function () {
                  var code;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, provider.getCode(address)];
                      case 1:
                        code = _a.sent();
                        return [2 /*return*/, code !== "0x"];
                    }
                  });
                });
              },
              getNonce: function () {
                return params.nonce;
              },
              extractTxnStatus: function (txn) {
                return __awaiter(this, void 0, void 0, function () {
                  var status;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, provider.getTransaction(txn)];
                      case 1:
                        return [4 /*yield*/, _a.sent().wait()];
                      case 2:
                        status = _a.sent().status;
                        if (status === undefined) {
                          return [2 /*return*/, TransactionStatus.PENDING];
                        }
                        if (status === 1) {
                          return [2 /*return*/, TransactionStatus.SUCCESS];
                        } else if (status === 0) {
                          return [2 /*return*/, TransactionStatus.FAILURE];
                        }
                        return [2 /*return*/, TransactionStatus.UNKNOWN];
                    }
                  });
                });
              },
              getTokenURI: function (contract, tokenId) {
                return __awaiter(this, void 0, void 0, function () {
                  var erc721;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        if (!(ethers.utils.isAddress(contract) && tokenId))
                          return [3 /*break*/, 2];
                        erc721 = UserNftMinter__factory.connect(
                          contract,
                          provider
                        );
                        return [
                          4 /*yield*/,
                          erc721.tokenURI(tokenId)["catch"](function () {
                            return "";
                          }),
                        ];
                      case 1:
                        //const erc1155 = Erc1155Minter__factory.connect(contract!, provider)
                        //erc1155.uri()
                        return [2 /*return*/, _a.sent()];
                      case 2:
                        return [2 /*return*/, ""];
                    }
                  });
                });
              },
              unfreezeWrappedNftBatch: function (
                signer,
                chainNonce,
                to,
                nfts,
                txFees
              ) {
                return __awaiter(this, void 0, void 0, function () {
                  var tx, res;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          minter
                            .connect(signer)
                            .populateTransaction.withdrawNftBatch(
                              to,
                              chainNonce,
                              nfts.map(function (nft) {
                                return nft.native.tokenId;
                              }),
                              new Array(nfts.length).fill(1),
                              nfts[0].native.contract,
                              {
                                value: EthBN.from(txFees.toFixed(0)),
                              }
                            ),
                        ];
                      case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, txnUnderpricedPolyWorkaround(tx)];
                      case 2:
                        _a.sent();
                        return [4 /*yield*/, signer.sendTransaction(tx)];
                      case 3:
                        res = _a.sent();
                        // await notifyValidator(
                        //   res.hash,
                        //   await extractAction(res),
                        //   "Unfreeze",
                        //   chainNonce.toString(),
                        //   txFees.toString(),
                        //   await signer.getAddress(),
                        //   to,
                        //   res.data
                        // );
                        return [4 /*yield*/, notifyValidator(res.hash)];
                      case 4:
                        // await notifyValidator(
                        //   res.hash,
                        //   await extractAction(res),
                        //   "Unfreeze",
                        //   chainNonce.toString(),
                        //   txFees.toString(),
                        //   await signer.getAddress(),
                        //   to,
                        //   res.data
                        // );
                        _a.sent();
                        return [2 /*return*/, res];
                    }
                  });
                });
              },
              transferNftBatchToForeign: function (
                signer,
                chainNonce,
                to,
                nfts,
                mintWith,
                txFees
              ) {
                return __awaiter(this, void 0, void 0, function () {
                  var tx, res;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          minter
                            .connect(signer)
                            .populateTransaction.freezeErc1155Batch(
                              nfts[0].native.contract,
                              nfts.map(function (nft) {
                                return nft.native.tokenId;
                              }),
                              new Array(nfts.length).fill(1),
                              chainNonce,
                              to,
                              mintWith,
                              {
                                value: EthBN.from(txFees.toFixed(0)),
                              }
                            ),
                        ];
                      case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, txnUnderpricedPolyWorkaround(tx)];
                      case 2:
                        _a.sent();
                        return [4 /*yield*/, signer.sendTransaction(tx)];
                      case 3:
                        res = _a.sent();
                        return [4 /*yield*/, notifyValidator(res.hash)];
                      case 4:
                        _a.sent();
                        return [2 /*return*/, res];
                    }
                  });
                });
              },
              estimateValidateTransferNftBatch: function (
                _to,
                nfts,
                _mintWith
              ) {
                return __awaiter(this, void 0, void 0, function () {
                  var gasPrice, gas;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, w3.getGasPrice()];
                      case 1:
                        gasPrice = _a.sent();
                        gas = 40000 + 60000 * nfts.length;
                        return [
                          2 /*return*/,
                          new BigNumber(gasPrice.mul(gas).toString()),
                        ];
                    }
                  });
                });
              },
              estimateValidateUnfreezeNftBatch: function (_to, nfts) {
                return __awaiter(this, void 0, void 0, function () {
                  var gasPrice, gas;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, w3.getGasPrice()];
                      case 1:
                        gasPrice = _a.sent();
                        gas = 40000 + 60000 * nfts.length;
                        return [
                          2 /*return*/,
                          new BigNumber(gasPrice.mul(gas).toString()),
                        ];
                    }
                  });
                });
              },
              createWallet: function (privateKey) {
                return new Wallet(privateKey, provider);
              },
              transferNftToForeign: function (
                sender,
                chain_nonce,
                to,
                id,
                txFees,
                mintWith,
                gasLimit,
                gasPrice
              ) {
                if (gasLimit === void 0) {
                  gasLimit = undefined;
                }
                return __awaiter(this, void 0, void 0, function () {
                  var method, tx, txr, txHash;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          approveForMinter(id, sender, txFees),
                        ];
                      case 1:
                        _a.sent();
                        method = NFT_METHOD_MAP[id.native.contractType].freeze;
                        // Chain is Hedera
                        if (params.nonce === 0x1d) {
                          id.native.tokenId = ethers.utils.solidityPack(
                            ["uint160", "int96"],
                            [id.collectionIdent, id.native.tokenId]
                          );
                          id.native.contract = params.erc721_addr;
                        }
                        console.log(txFees.toString());
                        console.log(txFees.toFixed(0), "x");
                        return [
                          4 /*yield*/,
                          minter
                            .connect(sender)
                            .populateTransaction[method](
                              id.native.contract,
                              id.native.tokenId,
                              chain_nonce,
                              to,
                              mintWith,
                              {
                                value: EthBN.from(txFees.toFixed(0)).div(100),
                                gasLimit: gasLimit || 300000,
                                gasPrice: gasPrice,
                              }
                            ),
                        ];
                      case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, txnUnderpricedPolyWorkaround(tx)];
                      case 3:
                        _a.sent();
                        return [
                          4 /*yield*/,
                          sender.sendTransaction(tx)["catch"](function (e) {
                            if (params.nonce === 33) {
                              return e;
                            } else throw e;
                          }),
                        ];
                      case 4:
                        txr = _a.sent();
                        if (params.nonce === 0x1d) {
                          //@ts-ignore checked hedera
                          txHash = txr["transactionId"];
                        } else if (params.nonce === 33) {
                          //@ts-ignore checked abeychain
                          txHash = txr["returnedHash"] || txr.hash;
                        } else {
                          //@ts-ignore checked normal evm
                          txHash = txr.hash;
                        }
                        return [
                          4 /*yield*/,
                          notifyValidator(
                            //@ts-ignore
                            txHash
                          ),
                        ];
                      case 5:
                        _a.sent();
                        if (!(params.nonce === 33)) return [3 /*break*/, 7];
                        return [4 /*yield*/, provider.getTransaction(txHash)];
                      case 6:
                        return [2 /*return*/, _a.sent()];
                      case 7:
                        return [2 /*return*/, txr];
                    }
                  });
                });
              },
              unfreezeWrappedNft: function (
                sender,
                to,
                id,
                txFees,
                nonce,
                gasLimit,
                gasPrice
              ) {
                if (gasLimit === void 0) {
                  gasLimit = undefined;
                }
                return __awaiter(this, void 0, void 0, function () {
                  var txn, res, txHash;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          approveForMinter(id, sender, txFees),
                        ];
                      case 1:
                        _a.sent();
                        // Chain is Hedera
                        if (params.nonce === 0x1d) {
                          id.native.tokenId = ethers.utils.solidityPack(
                            ["uint160", "int96"],
                            [EthBN.from(id.collectionIdent), id.native.tokenId]
                          );
                          id.native.contract = params.erc721_addr;
                        }
                        return [
                          4 /*yield*/,
                          minter
                            .connect(sender)
                            .populateTransaction.withdrawNft(
                              to,
                              nonce,
                              id.native.tokenId,
                              id.native.contract,
                              {
                                value: EthBN.from(txFees.toFixed(0)).div(100),
                                gasLimit: gasLimit || 30000,
                                gasPrice: gasPrice,
                              }
                            ),
                        ];
                      case 2:
                        txn = _a.sent();
                        return [4 /*yield*/, txnUnderpricedPolyWorkaround(txn)];
                      case 3:
                        _a.sent();
                        return [4 /*yield*/, sender.sendTransaction(txn)];
                      case 4:
                        res = _a.sent();
                        console.log(res, "res");
                        if (params.nonce === 0x1d) {
                          //@ts-ignore checked hedera
                          txHash = res["transactionId"];
                        } else if (params.nonce === 33) {
                          //@ts-ignore checked abeychain
                          txHash = res["returnedHash"] || res.hash;
                        } else {
                          //@ts-ignore checked normal evm
                          txHash = res.hash;
                        }
                        return [4 /*yield*/, notifyValidator(txHash)];
                      case 5:
                        _a.sent();
                        if (!(params.nonce === 33)) return [3 /*break*/, 7];
                        return [4 /*yield*/, provider.getTransaction(txHash)];
                      case 6:
                        return [2 /*return*/, _a.sent()];
                      case 7:
                        return [2 /*return*/, res];
                    }
                  });
                });
              },
              estimateValidateTransferNft: function (_to, _nftUri, _mintWith) {
                return __awaiter(this, void 0, void 0, function () {
                  var gas;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, provider.getGasPrice()];
                      case 1:
                        gas = _a.sent();
                        return [
                          2 /*return*/,
                          new BigNumber(gas.mul(150000).toString()),
                        ];
                    }
                  });
                });
              },
              estimateContractDep: function (toChain) {
                return __awaiter(this, void 0, void 0, function () {
                  var gas,
                    pro,
                    wl,
                    gk,
                    gkx,
                    factory,
                    estimateGas,
                    contractFee,
                    sum,
                    error_1,
                    gas;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 3, , 5]);
                        console.log("NEED TO DEPLOY CONTRACT");
                        return [4 /*yield*/, provider.getGasPrice()];
                      case 1:
                        gas = _a.sent();
                        pro = toChain.getProvider();
                        wl = ["0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE"];
                        gk = 123;
                        gkx = 42;
                        factory = new ethers.ContractFactory(
                          Minter__factory.abi,
                          Minter__factory.bytecode
                        );
                        return [
                          4 /*yield*/,
                          pro.estimateGas(
                            factory.getDeployTransaction(gk, gkx, wl)
                          ),
                        ];
                      case 2:
                        estimateGas = _a.sent();
                        contractFee = gas.mul(estimateGas);
                        sum = new BigNumber(contractFee.toString());
                        return [2 /*return*/, sum];
                      case 3:
                        error_1 = _a.sent();
                        console.log(error_1.message);
                        return [4 /*yield*/, provider.getGasPrice()];
                      case 4:
                        gas = _a.sent();
                        return [
                          2 /*return*/,
                          new BigNumber(gas.mul(150000).toString()),
                        ];
                      case 5:
                        return [2 /*return*/];
                    }
                  });
                });
              },
              validateAddress: function (adr) {
                return Promise.resolve(ethers.utils.isAddress(adr));
              },
              isNftWhitelisted: function (nft) {
                return minter.nftWhitelist(nft.native.contract);
              },
            }),
          ];
      }
    });
  });
}
