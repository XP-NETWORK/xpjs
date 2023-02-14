"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory =
  exports.NFT_METHOD_MAP =
  exports.baseWeb3HelperFactory =
    void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
const hethers_1 = require("@hashgraph/hethers");
hethers_1.hethers.providers.BaseProvider.prototype.getGasPrice = async () => {
  return ethers_1.BigNumber.from("1");
};
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
async function baseWeb3HelperFactory(provider, nonce) {
  const w3 = provider;
  return {
    async balance(address) {
      const bal = await w3.getBalance(address);
      // ethers BigNumber is not compatible with our bignumber
      return new bignumber_js_1.default(bal.toString());
    },
    async deployErc721(owner) {
      const factory = new xpnet_web3_contracts_1.UserNftMinter__factory(owner);
      const contract = await factory.deploy();
      return contract.address;
    },
    async mintNftErc1155(owner, { contract }) {
      const erc1155 = xpnet_web3_contracts_1.Erc1155Minter__factory.connect(
        contract,
        owner
      );
      const tx = await erc1155.mintNft(await owner.getAddress());
      return tx;
    },
    async mintNft(owner, { contract, uri }) {
      const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(
        contract,
        owner
      );
      const txm = await erc721
        .mint(uri, { gasLimit: 1000000 })
        .catch(async (e) => {
          if (nonce === 33) {
            let tx;
            while (!tx) {
              tx = await provider.getTransaction(e["returnedHash"]);
            }
            return tx;
          }
          throw e;
        });
      return txm;
    },
  };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
exports.NFT_METHOD_MAP = {
  ERC1155: {
    freeze: "freezeErc1155",
    validateUnfreeze: "validateUnfreezeErc1155",
    umt: xpnet_web3_contracts_1.Erc1155Minter__factory,
    approved: (umt, sender, minterAddr, _tok, customData) => {
      return umt.isApprovedForAll(sender, minterAddr, {
        gasLimit: "85000",
        customData,
      });
    },
    approve: async (umt, forAddr, _tok, txnUp, customData) => {
      const tx = await umt.populateTransaction.setApprovalForAll(
        forAddr,
        true,
        {
          gasLimit: "85000",
          customData,
        }
      );
      await txnUp(tx);
      return await umt.signer.sendTransaction(tx);
    },
  },
  ERC721: {
    freeze: "freezeErc721",
    validateUnfreeze: "validateUnfreezeErc721",
    umt: xpnet_web3_contracts_1.UserNftMinter__factory,
    approved: async (umt, _, minterAddr, tok, customData) => {
      return (
        (
          await umt.getApproved(tok, {
            gasLimit: "85000",
            customData,
            //@ts-ignore
          })
        ).toLowerCase() == minterAddr.toLowerCase()
      );
    },
    approve: async (umt, forAddr, tok, txnUp) => {
      const tx = await umt.populateTransaction.approve(forAddr, tok, {
        gasLimit: "85000",
      });
      await txnUp(tx);
      return await umt.signer.sendTransaction(tx);
    },
  },
};
async function web3HelperFactory(params) {
  const txnUnderpricedPolyWorkaround =
    params.nonce == 7
      ? async (utx) => {
          const res = await axios_1.default
            .get(
              "https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata"
            )
            .catch(async () => {
              return await axios_1.default.get(
                "https://gasstation-mainnet.matic.network/v2"
              );
            });
          const { result, fast } = res.data;
          const trackerGas = result?.rapidgaspricegwei || fast?.maxFee;
          if (trackerGas) {
            const sixtyGwei = ethers_1.ethers.utils.parseUnits(
              Math.ceil(trackerGas).toString(),
              "gwei"
            );
            utx.maxFeePerGas = sixtyGwei;
            utx.maxPriorityFeePerGas = sixtyGwei;
          }
        }
      : () => Promise.resolve();
  const w3 = params.provider;
  const { minter_addr, provider } = params;
  const minter = xpnet_web3_contracts_1.Minter__factory.connect(
    minter_addr,
    provider
  );
  async function notifyValidator(
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
    await params.notifier.notifyWeb3(
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
    );
  }
  //@ts-ignore
  async function getTransaction(hash) {
    let trx;
    let fails = 0;
    while (!trx && fails < 7) {
      trx = await provider.getTransaction(hash);
      await new Promise((resolve) =>
        setTimeout(() => resolve("wait"), 5000 + fails * 2)
      );
      fails++;
    }
    return trx;
  }
  async function extractAction(txr) {
    const receipt = await txr.wait();
    const log = receipt.logs.find((log) => log.address === minter.address);
    if (log === undefined) {
      throw Error("Couldn't extract action_id");
    }
    const evdat = minter.interface.parseLog(log);
    const action_id = evdat.args[0].toString();
    return action_id;
  }
  const isApprovedForMinter = async (id, signer) => {
    const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      signer
    );
    const toApprove =
      params.nonce !== 0x1d
        ? minter_addr
        : id.native.uri.includes("herokuapp.com")
        ? params.minter_addr
        : params.erc721_addr;
    return await exports.NFT_METHOD_MAP[id.native.contractType].approved(
      erc,
      await signer.getAddress(),
      toApprove,
      id.native.tokenId,
      params.nonce === 0x1d ? {} : undefined
    );
  };
  const approveForMinter = async (id, sender, _txFees, gasPrice) => {
    const isApproved = await isApprovedForMinter(id, sender);
    if (isApproved) {
      return undefined;
    }
    const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      sender
    );
    const toApprove =
      params.nonce !== 0x1d
        ? minter_addr
        : id.native.uri.includes("herokuapp.com")
        ? params.minter_addr
        : params.erc721_addr;
    const receipt = await exports.NFT_METHOD_MAP[
      id.native.contractType
    ].approve(
      erc,
      toApprove,
      id.native.tokenId,
      txnUnderpricedPolyWorkaround,
      params.nonce === 0x1d ? {} : undefined,
      gasPrice
    );
    await receipt.wait();
    return receipt.hash;
  };
  const base = await baseWeb3HelperFactory(params.provider, params.nonce);
  return {
    ...base,
    XpNft: params.erc721_addr,
    XpNft1155: params.erc1155_addr,
    approveForMinter,
    getProvider: () => provider,
    async estimateValidateUnfreezeNft(_to, _id, _mW) {
      const gas = await provider.getGasPrice();
      return new bignumber_js_1.default(gas.mul(150000).toString());
    },
    getFeeMargin() {
      return params.feeMargin;
    },
    isApprovedForMinter,
    preTransfer: (s, id, fee, args) =>
      approveForMinter(id, s, fee, args?.gasPrice),
    extractAction,
    async isContractAddress(address) {
      const code = await provider.getCode(address);
      return code !== "0x";
    },
    getNonce: () => params.nonce,
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new ethers_1.VoidSigner(address, provider)
      );
      if (isApproved) {
        return undefined;
      }
      const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(
        id.native.contract,
        new ethers_1.VoidSigner(address, provider)
      );
      const approvetxn = await erc.populateTransaction.approve(
        minter_addr,
        id.native.tokenId
      );
      return approvetxn;
    },
    async extractTxnStatus(txn) {
      const status = (await (await provider.getTransaction(txn)).wait()).status;
      if (status === undefined) {
        return __1.TransactionStatus.PENDING;
      }
      if (status === 1) {
        return __1.TransactionStatus.SUCCESS;
      } else if (status === 0) {
        return __1.TransactionStatus.FAILURE;
      }
      return __1.TransactionStatus.UNKNOWN;
    },
    async getTokenURI(contract, tokenId) {
      if (ethers_1.ethers.utils.isAddress(contract) && tokenId) {
        const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(
          contract,
          provider
        );
        //const erc1155 = Erc1155Minter__factory.connect(contract!, provider)
        //erc1155.uri()
        return await erc721.tokenURI(tokenId).catch(() => "");
      }
      return "";
    },
    async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
      const tx = await minter
        .connect(signer)
        .populateTransaction.withdrawNftBatch(
          to,
          chainNonce,
          nfts.map((nft) => nft.native.tokenId),
          new Array(nfts.length).fill(1),
          nfts[0].native.contract,
          {
            value: ethers_1.BigNumber.from(txFees.toFixed(0)),
          }
        );
      await txnUnderpricedPolyWorkaround(tx);
      const res = await signer.sendTransaction(tx);
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
      await notifyValidator(res.hash);
      return res;
    },
    async transferNftBatchToForeign(
      signer,
      chainNonce,
      to,
      nfts,
      mintWith,
      txFees
    ) {
      const tx = await minter
        .connect(signer)
        .populateTransaction.freezeErc1155Batch(
          nfts[0].native.contract,
          nfts.map((nft) => nft.native.tokenId),
          new Array(nfts.length).fill(1),
          chainNonce,
          to,
          mintWith,
          {
            value: ethers_1.BigNumber.from(txFees.toFixed(0)),
          }
        );
      await txnUnderpricedPolyWorkaround(tx);
      const res = await signer.sendTransaction(tx);
      await notifyValidator(res.hash);
      return res;
    },
    async estimateValidateTransferNftBatch(_to, nfts, _mintWith) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40000 + 60000 * nfts.length;
      return new bignumber_js_1.default(gasPrice.mul(gas).toString());
    },
    async estimateValidateUnfreezeNftBatch(_to, nfts) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40000 + 60000 * nfts.length;
      return new bignumber_js_1.default(gasPrice.mul(gas).toString());
    },
    createWallet(privateKey) {
      return new ethers_1.Wallet(privateKey, provider);
    },
    async transferNftToForeign(
      sender,
      chain_nonce,
      to,
      id,
      txFees,
      mintWith,
      gasLimit = undefined,
      gasPrice
    ) {
      await approveForMinter(id, sender, txFees, gasPrice);
      const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
      // Chain is Hedera
      if (params.nonce === 0x1d) {
        id.native.tokenId = ethers_1.ethers.utils.solidityPack(
          ["uint160", "int96"],
          [id.collectionIdent, id.native.tokenId]
        );
        id.native.contract = params.erc721_addr;
      }
      const tx = await minter
        .connect(sender)
        .populateTransaction[method](
          id.native.contract,
          id.native.tokenId,
          chain_nonce,
          to,
          mintWith,
          {
            value: ethers_1.BigNumber.from(txFees.toFixed(0)),
            gasLimit,
            gasPrice,
          }
        );
      await txnUnderpricedPolyWorkaround(tx);
      const txr = await sender.sendTransaction(tx).catch((e) => {
        if (params.nonce === 33) {
          return e;
        } else throw e;
      });
      let txHash;
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
      await notifyValidator(
        //@ts-ignore
        txHash
      );
      if (params.nonce === 33) {
        return await provider.getTransaction(txHash);
      }
      return txr;
    },
    async unfreezeWrappedNft(
      sender,
      to,
      id,
      txFees,
      nonce,
      gasLimit = undefined,
      gasPrice
    ) {
      await approveForMinter(id, sender, txFees, gasPrice);
      // Chain is Hedera
      if (params.nonce === 0x1d) {
        id.native.tokenId = ethers_1.ethers.utils.solidityPack(
          ["uint160", "int96"],
          [ethers_1.BigNumber.from(id.collectionIdent), id.native.tokenId]
        );
        id.native.contract = params.erc721_addr;
      }
      const txn = await minter
        .connect(sender)
        .populateTransaction.withdrawNft(
          to,
          nonce,
          id.native.tokenId,
          id.native.contract,
          {
            value: ethers_1.BigNumber.from(txFees.toFixed(0)),
            gasLimit,
            gasPrice,
          }
        );
      await txnUnderpricedPolyWorkaround(txn);
      const res = await sender.sendTransaction(txn);
      console.log(res, "res");
      let txHash;
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
      await notifyValidator(txHash);
      if (params.nonce === 33) {
        return await provider.getTransaction(txHash);
      }
      return res;
    },
    async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
      const gas = await provider.getGasPrice();
      return new bignumber_js_1.default(gas.mul(150000).toString());
    },
    validateAddress(adr) {
      return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract);
    },
  };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBY3JDLG1DQVNnQjtBQUVoQiwrREFNOEI7QUFDOUIsMEJBWVk7QUFHWixrREFBMEI7QUFDMUIsZ0RBQTZDO0FBNEM3QyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQXlERjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxD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
