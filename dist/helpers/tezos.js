"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.tezosHelperFactory = void 0;
const __1 = require("..");
const utils = __importStar(require("@taquito/utils"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
async function tezosHelperFactory({
  Tezos,
  notifier,
  xpnftAddress,
  bridgeAddress,
  validators,
  feeMargin,
}) {
  const estimateGas = (validators, baseprice) => {
    return new bignumber_js_1.default(baseprice * (validators.length + 1));
  };
  async function withContract(sender, contract, cb, params) {
    if ("publicKeyHash" in sender) {
      Tezos.setSignerProvider(sender);
      const contractI = await Tezos.contract.at(contract);
      const res = cb(contractI);
      const tx = await res.send(params);
      await tx.confirmation();
      return tx.hash;
    } else {
      Tezos.setWalletProvider(sender);
      const contractI = await Tezos.wallet.at(contract);
      const res = cb(contractI);
      const estim = await Tezos.estimate
        .transfer(res.toTransferParams(params))
        .catch(() => ({ storageLimit: 0 }));
      if (params) {
        if (!params.storageLimit) params.storageLimit = estim.storageLimit;
      } else {
        params = { storageLimit: estim.storageLimit };
      }
      const tx = await res.send(params);
      await tx.confirmation();
      return tx.opHash;
    }
  }
  function withBridge(sender, cb, params) {
    return withContract(sender, bridgeAddress, cb, params);
  }
  function getAddress(sender) {
    if ("publicKeyHash" in sender) {
      return sender.publicKeyHash();
    } else {
      return sender.getPKH();
    }
  }
  async function isApprovedForMinter(nft, sender) {
    const owner = await getAddress(sender);
    const contract = await Tezos.contract.at(nft.native.contract);
    const storage = await contract.storage();
    const storageOperator = storage.operator || storage.operators;
    const args = storage.operator
      ? [bridgeAddress, nft.native.token_id, owner]
      : {
          owner,
          operator: bridgeAddress,
          token_id: nft.native.token_id,
        };
    const op = await storageOperator?.get(args);
    return op != undefined;
  }
  async function notifyValidator(hash) {
    await notifier.notifyTezos(hash);
  }
  async function preTransfer(signer, nft) {
    if (await isApprovedForMinter(nft, signer)) {
      return;
    }
    const owner = await getAddress(signer);
    return await withContract(signer, nft.native.contract, (contract) =>
      contract.methods.update_operators([
        {
          add_operator: {
            owner,
            operator: bridgeAddress,
            token_id: nft.native.token_id,
          },
        },
      ])
    );
  }
  return {
    XpNft: xpnftAddress,
    async transferNftToForeign(sender, chain, to, nft, fee, mw) {
      //       await preTransfer(sender, nft);
      const hash = await withBridge(
        sender,
        (bridge) =>
          bridge.methods.freeze_fa2(
            chain,
            nft.collectionIdent,
            mw,
            to,
            parseInt(nft.native.token_id)
          ),
        { amount: fee.toNumber() / 1e6 }
      );
      notifyValidator(hash);
      return hash;
    },
    async balance(address) {
      return new bignumber_js_1.default(
        (await Tezos.tz.getBalance(address)).toString(10)
      );
    },
    async unfreezeWrappedNft(sender, to, nft, fee, nonce) {
      const hash = await withBridge(
        sender,
        (bridge) => {
          return bridge.methods.withdraw_nft(
            nft.native.contract,
            nonce,
            to,
            parseInt(nft.native.token_id)
          );
        },
        { amount: fee.toNumber() / 1e6 }
      );
      notifyValidator(hash);
      return hash;
    },
    async mintNft(signer, { identifier, attrs, contract, uri }) {
      return await withContract(signer, xpnftAddress, (xpnft) =>
        xpnft.methods.mint({
          token_id: identifier,
          address: contract,
          metadata: {
            uri: uri,
            attrs,
          },
          amount: 1,
        })
      );
    },
    async validateAddress(adr) {
      return Promise.resolve(
        utils.validateAddress(adr) === utils.ValidationResult.VALID
      );
    },
    getNonce() {
      return __1.Chain.TEZOS;
    },
    getFeeMargin() {
      return feeMargin;
    },
    async estimateValidateTransferNft() {
      return estimateGas(validators, 1.2e5);
    },
    async estimateValidateUnfreezeNft() {
      return estimateGas(validators, 1.2e4);
    },
    preTransfer,
    isApprovedForMinter,
    approveForMinter: (nft, sender) => preTransfer(sender, nft),
    async isNftWhitelisted(nft) {
      const bridge = await Tezos.contract.at(bridgeAddress);
      const storage = await bridge.storage();
      const whitelisted = await storage.nft_whitelist.get(nft.native.contract);
      return whitelisted == 2;
    },
    async getTokenURI(contract, tokenId) {
      if (utils.validateAddress(contract) && tokenId) {
        const _contract = await Tezos.contract.at(contract);
        const storage = await _contract.storage();
        const tokenStorage = await storage.token_metadata.get(tokenId);
        if (tokenStorage) {
          return utils.bytes2Char(tokenStorage.token_info?.get(""));
        }
      }
      return "";
    },
  };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQVdZO0FBZVosc0RBQXdDO0FBQ3hDLGdFQUFxQztBQTJEOUIsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQ3ZDLEtBQUssRUFDTCxRQUFRLEVBQ1IsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEVBQ1YsU0FBUyxHQUNHO0lBQ1osTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFvQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUM5RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFlBQVksQ0FDekIsTUFBbUIsRUFDbkIsUUFBZ0IsRUFDaEIsRUFFOEMsRUFDOUMsTUFBNEI7UUFFNUIsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoQyxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQixNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsT0FBUSxFQUEyQixDQUFDLElBQUksQ0FBQztTQUMxQzthQUFNO1lBQ0wsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFbEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTFCLE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVE7aUJBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3RDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0QyxJQUFJLE1BQU0sRUFBRTtnQkFDVixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7b0JBQUUsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO2FBQ3BFO2lCQUFNO2dCQUNMLE1BQU0sR0FBRyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDL0M7WUFDRCxNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsT0FBUSxFQUFpQyxDQUFDLE1BQU0sQ0FBQztTQUNsRDtJQUNILENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FDakIsTUFBbUIsRUFDbkIsRUFFOEMsRUFDOUMsTUFBNEI7UUFFNUIsT0FBTyxZQUFZLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLE1BQW1CO1FBQ3JDLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRTtZQUM3QixPQUFPLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMvQjthQUFNO1lBQ0wsT0FBTyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxHQUEwQixFQUMxQixNQUFtQjtRQUVuQixNQUFNLEtBQUssR0FBRyxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUdsQyxDQUFDO1FBRUwsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQzlELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRO1lBQzNCLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7WUFDN0MsQ0FBQyxDQUFDO2dCQUNFLEtBQUs7Z0JBQ0wsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVE7YUFDOUIsQ0FBQztRQUVOLE1BQU0sRUFBRSxHQUFHLE1BQU0sZUFBZSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QyxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUM7SUFDekIsQ0FBQztJQUVELEtBQUssVUFBVSxlQUFlLENBQUMsSUFBWTtRQUN6QyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELEtBQUssVUFBVSxXQUFXLENBQUMsTUFBbUIsRUFBRSxHQUEwQjtRQUN4RSxJQUFJLE1BQU0sbUJBQW1CLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQzFDLE9BQU87U0FDUjtRQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDbEUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNoQztnQkFDRSxZQUFZLEVBQUU7b0JBQ1osS0FBSztvQkFDTCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUTtpQkFDOUI7YUFDRjtTQUNGLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU87UUFDTCxLQUFLLEVBQUUsWUFBWTtRQUNuQixLQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3hELHdDQUF3QztZQUN4QyxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FDM0IsTUFBTSxFQUNOLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDVCxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FDdkIsS0FBSyxFQUNMLEdBQUcsQ0FBQyxlQUFlLEVBQ25CLEVBQUUsRUFDRixFQUFFLEVBQ0YsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQzlCLEVBQ0gsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUNqQyxDQUFDO1lBRUYsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTztZQUNuQixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLO1lBQ2xELE1BQU0sSUFBSSxHQUFHLE1BQU0sVUFBVSxDQUMzQixNQUFNLEVBQ04sQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDVCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUNoQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDbkIsS0FBSyxFQUNMLEVBQUUsRUFDRixRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FDOUIsQ0FBQztZQUNKLENBQUMsRUFDRCxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQ2pDLENBQUM7WUFFRixlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDeEQsT0FBTyxNQUFNLFlBQVksQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixPQUFPLEVBQUUsUUFBUTtnQkFDakIsUUFBUSxFQUFFO29CQUNSLEdBQUcsRUFBRSxHQUFHO29CQUNSLEtBQUs7aUJBQ047Z0JBQ0QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUc7WUFDdkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUNwQixLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQzVELENBQUM7UUFDSixDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sU0FBSyxDQUFDLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sV0FBVyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQjtZQUMvQixPQUFPLFdBQVcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELFdBQVc7UUFDWCxtQkFBbUI7UUFDbkIsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUMzRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRztZQUN4QixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFFaEMsQ0FBQztZQUNMLE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV6RSxPQUFPLFdBQVcsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU87WUFDakMsSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sRUFBRTtnQkFDOUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFcEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBUSxDQUFDO2dCQUNuRCxNQUFNLFlBQVksR0FBRyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLFlBQVksRUFBRTtvQkFDaEIsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzNEO2FBQ0Y7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQWxORCxnREFrTkMifQ==
