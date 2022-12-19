"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3ERC20HelperFactory = exports.baseWeb3HelperFactory = void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
async function baseWeb3HelperFactory(provider) {
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
      const txm = await erc721.mint(uri, { gasLimit: 1000000 });
      return txm;
    },
  };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
async function web3ERC20HelperFactory(params) {
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
  const minter = xpnet_web3_contracts_1.MinterERC20__factory.connect(
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
  const isApprovedForMinter = async (id, signer, _txFees) => {
    const erc = __1.NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      signer
    );
    return await __1.NFT_METHOD_MAP[id.native.contractType].approved(
      erc,
      await signer.getAddress(),
      minter_addr,
      id.native.tokenId,
      params.nonce === 0x1d ? {} : undefined
    );
  };
  const approveForMinter = async (id, sender, txFees) => {
    const isApproved = await isApprovedForMinter(id, sender, txFees);
    if (isApproved) {
      return undefined;
    }
    const erc = __1.NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      sender
    );
    const receipt = await __1.NFT_METHOD_MAP[id.native.contractType].approve(
      erc,
      minter_addr,
      id.native.tokenId,
      txnUnderpricedPolyWorkaround,
      params.nonce === 0x1d ? {} : undefined
    );
    await receipt.wait();
    const erc20 = xpnet_web3_contracts_1.PaymentToken__factory.connect(
      params.paymentTokenAddress,
      sender
    );
    const approval = await erc20.approve(
      minter_addr,
      ethers_1.BigNumber.from(txFees.toString())
    );
    return approval.hash;
  };
  const base = await baseWeb3HelperFactory(params.provider);
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
    preTransfer: (s, id, _fee) => approveForMinter(id, s, _fee),
    extractAction,
    async isContractAddress(address) {
      const code = await provider.getCode(address);
      return code !== "0x";
    },
    getNonce: () => params.nonce,
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new ethers_1.VoidSigner(address, provider),
        _value
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
          ethers_1.BigNumber.from(txFees.toString())
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
          ethers_1.BigNumber.from(txFees.toString())
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
      await approveForMinter(id, sender, txFees);
      const method = __1.NFT_METHOD_MAP[id.native.contractType].freeze;
      const tx = await minter
        .connect(sender)
        .populateTransaction[method](
          id.native.contract,
          id.native.tokenId,
          chain_nonce,
          to,
          mintWith,
          ethers_1.BigNumber.from(txFees.toString()),
          {
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
      }
      if (params.nonce === 33) {
        //@ts-ignore checked abeychain
        txHash = txr["returnedHash"] || txr.hash;
      } else {
        //@ts-ignore checked normal evm
        txHash = txr.hash;
      }
      await notifyValidator(
        //@ts-ignore
        txHash,
        await extractAction(await getTransaction(txHash)),
        "Transfer",
        chain_nonce,
        txFees.toString(),
        await sender.getAddress(),
        to,
        id.uri,
        id.native.tokenId,
        id.native.contract
      );
      return params.nonce === 33 ? await provider.getTransaction(txHash) : txr;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const txn = await minter
        .connect(sender)
        .populateTransaction.withdrawNft(
          to,
          nonce,
          id.native.tokenId,
          id.native.contract,
          ethers_1.BigNumber.from(txFees.toString())
        );
      await txnUnderpricedPolyWorkaround(txn);
      const res = await sender.sendTransaction(txn);
      await notifyValidator(
        res.hash,
        await extractAction(res),
        "Unfreeze",
        Number(nonce),
        txFees.toString(),
        await sender.getAddress(),
        to,
        id.uri,
        id.native.tokenId,
        id.native.contract
      );
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
exports.web3ERC20HelperFactory = web3ERC20HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViM19lcmMyMC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjNfZXJjMjAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBQ3JDLG1DQVFnQjtBQUVoQiwrREFLOEI7QUFDOUIsMEJBU1k7QUFDWixrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0I7SUFFbEIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRTNELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQ1gsS0FBYSxF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
