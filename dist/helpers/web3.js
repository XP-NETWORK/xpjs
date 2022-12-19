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
        gasLimit: "1000000",
        customData,
      });
    },
    approve: async (umt, forAddr, _tok, txnUp, customData) => {
      const tx = await umt.populateTransaction.setApprovalForAll(
        forAddr,
        true,
        {
          gasLimit: "1000000",
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
            gasLimit: "1000000",
            customData,
            //@ts-ignore
          })
        ).toLowerCase() == minterAddr.toLowerCase()
      );
    },
    approve: async (umt, forAddr, tok, txnUp) => {
      const tx = await umt.populateTransaction.approve(forAddr, tok, {
        gasLimit: "1000000",
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
  const approveForMinter = async (id, sender) => {
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
      params.nonce === 0x1d ? {} : undefined
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
    preTransfer: (s, id, _fee) => approveForMinter(id, s),
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
            value: ethers_1.BigNumber.from(txFees.toString()),
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
            value: ethers_1.BigNumber.from(txFees.toString()),
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
      gasLimit = undefined
    ) {
      await approveForMinter(id, sender);
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
            value: ethers_1.BigNumber.from(txFees.toString()),
            gasLimit,
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
      gasLimit = undefined
    ) {
      await approveForMinter(id, sender);
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
            value: ethers_1.BigNumber.from(txFees.toString(10)),
            gasLimit,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBY3JDLG1DQVNnQjtBQUVoQiwrREFNOEI7QUFDOUIsMEJBWVk7QUFHWixrREFBMEI7QUFDMUIsZ0RBQTZDO0FBMEM3QyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQXVERjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxD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
