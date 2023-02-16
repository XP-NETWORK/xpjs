"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptosHelper = void 0;
const aptos_1 = require("aptos");
const consts_1 = require("../../consts");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bridge_client_1 = require("./bridge_client");
async function aptosHelper({
  feeMargin,
  rpcUrl,
  xpnft,
  bridge,
  notifier,
  network,
}) {
  const client = new aptos_1.AptosClient(rpcUrl);
  const bridgeClient = new bridge_client_1.BridgeClient(
    client,
    bridge,
    network
  );
  return {
    getNonce() {
      return consts_1.Chain.APTOS;
    },
    getFeeMargin() {
      return feeMargin;
    },
    async validateAddress(adr) {
      try {
        await client.getAccount(adr);
        return true;
      } catch (e) {
        return false;
      }
    },
    XpNft: xpnft,
    async estimateValidateTransferNft(_to, _metadata, _mintWith) {
      return new bignumber_js_1.default(0);
    },
    async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
      return new bignumber_js_1.default(0);
    },
    async transferNftToForeign(
      sender,
      chain_nonce,
      to,
      id,
      txFees,
      mintWith,
      _gasLimit
    ) {
      const receipt = await bridgeClient.freezeNft(
        sender,
        aptos_1.HexString.ensure(id.native.collection_creator),
        id.native.collection_name,
        id.native.token_name,
        id.native.property_version,
        BigInt(txFees.toString()),
        chain_nonce,
        to,
        mintWith
      );
      await new Promise((r) => setTimeout(r, 10000));
      await notifier.notifyAptos(receipt);
      return receipt;
    },
    getProvider() {
      return client;
    },
    async mintNft(owner, options) {
      const tc = new aptos_1.TokenClient(client);
      if (options.createCollection) {
        await tc.createCollection(
          owner,
          "UMT",
          "UserNftMinter - Mint your NFTs Here To Test",
          "https://example.com",
          BigInt(2 ** 64) - BigInt(1)
        );
        const response = await tc.createToken(
          owner,
          "XPNFT",
          options.name,
          options.description,
          1,
          options.uri,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        return response;
      } else {
        const response = await tc.createToken(
          owner,
          options.collection,
          options.name,
          options.description,
          1,
          options.uri,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        return response;
      }
    },
    async claimNFT(signer, params) {
      const tokenClient = new aptos_1.TokenClient(client);
      const claim = await tokenClient.claimToken(
        signer,
        params.sender,
        params.creator,
        params.collectionName,
        params.name,
        params.propertyVersion
      );
      return claim;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const receipt = await bridgeClient.withdrawNft(
        sender,
        aptos_1.HexString.ensure(bridge),
        aptos_1.HexString.ensure(id.native.collection_creator),
        id.native.collection_name,
        id.native.token_name,
        id.native.property_version.toString(),
        BigInt(txFees.toString()),
        parseInt(nonce),
        to,
        id.native.collection_creator
      );
      await new Promise((r) => setTimeout(r, 10000));
      await notifier.notifyAptos(receipt);
      return receipt;
    },
  };
}
exports.aptosHelper = aptosHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9hcHRvcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFhQSxpQ0FBMEU7QUFFMUUseUNBQXFDO0FBQ3JDLGdFQUFxQztBQUNyQyxtREFBK0M7QUFxRHhDLEtBQUssVUFBVSxXQUFXLENBQUMsRUFDaEMsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEdBQ0s7SUFDWixNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFL0QsT0FBTztRQUNMLFFBQVE7WUFDTixPQUFPLGNBQUssQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUNELFlBQVk7WUFDVixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHO1lBQ3ZCLElBQUk7Z0JBQ0YsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDtRQUNILENBQUM7UUFDRCxLQUFLLEVBQUUsS0FBSztRQUNaLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVM7WUFDekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNE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
