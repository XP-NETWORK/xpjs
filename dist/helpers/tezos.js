"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
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
const taquito_1 = require("@taquito/taquito");
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
  let transferNft = async (sender, chain, to, nft, fee, mw, amt) => {
    //       await preTransfer(sender, nft);
    const hash = await withBridge(
      sender,
      (bridge) =>
        bridge.methodsObject.freeze_fa2({
          fa2_address: nft.collectionIdent,
          token_id: parseInt(nft.native.token_id),
          chain_nonce: chain,
          to,
          mint_with: mw,
          amt,
        }),
      { amount: fee.toNumber() / 1e6 }
    );
    notifyValidator(hash);
    return hash;
  };
  let unfreezeWrappedNft = async (sender, to, nft, fee, nonce, amt) => {
    const hash = await withBridge(
      sender,
      (bridge) => {
        return bridge.methodsObject.withdraw_nft({
          amt,
          burner: nft.native.contract,
          chain_nonce: nonce,
          to,
          token_id: parseInt(nft.native.token_id),
        });
      },
      { amount: fee.toNumber() / 1e6 }
    );
    notifyValidator(hash);
    return hash;
  };
  return {
    XpNft: xpnftAddress,
    XpNft1155: xpnftAddress,
    transferNftToForeign: (sender, chain, to, nft, fee, mw) =>
      transferNft(sender, chain, to, nft, fee, mw, 1),
    transferNftBatchToForeign: (
      sender,
      chain_nonce,
      to,
      id,
      mintWith,
      txFees
    ) =>
      transferNft(sender, chain_nonce, to, id[0], txFees, mintWith, id.length),
    async balance(address) {
      return new bignumber_js_1.default(
        (await Tezos.tz.getBalance(address)).toString(10)
      );
    },
    unfreezeWrappedNftBatch: (sender, chainNonce, to, nfts, txFees) =>
      unfreezeWrappedNft(sender, to, nfts[0], txFees, chainNonce, nfts.length),
    unfreezeWrappedNft: (sender, to, nft, txFees, chainNonce) =>
      unfreezeWrappedNft(sender, to, nft, txFees, parseInt(chainNonce), 1),
    async mintNft(signer, { identifier, contract, uri, to, amt }) {
      const metadata = new taquito_1.MichelsonMap();
      metadata.set("", utils.char2Bytes(uri));
      return await withContract(signer, contract, (umt) =>
        umt.methods.mint(to, amt, metadata, identifier)
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
    async estimateValidateTransferNftBatch(_, ids) {
      return estimateGas(validators, 1.2e5 * ids.length);
    },
    async estimateValidateUnfreezeNftBatch(_, ids) {
      return estimateGas(validators, 1.2e4 * ids.length);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEJBV1k7QUFDWiw4Q0FhMEI7QUFFMUIsc0RBQXdDO0FBQ3hDLGdFQUFxQztBQW9FOUIsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQ3ZDLEtBQUssRUFDTCxRQUFRLEVBQ1IsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEVBQ1YsU0FBUyxHQUNHO0lBQ1osTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFvQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUM5RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFlBQVksQ0FDekIsTUFBbUIsRUFDbkIsUUFBZ0IsRUFDaEIsRUFFOEMsRUFDOUMsTUFBNEI7UUFFNUIsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoQyxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQixNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsT0FBUSxFQUEyQixDQUFDLElBQUksQ0FBQztTQUMxQzthQUFNO1lBQ0wsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FB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
