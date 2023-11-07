/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import {
  BigNumber as EthBN,
  ContractTransaction,
  ethers,
  Signer,
  VoidSigner,
  Wallet,
} from "ethers";
import { Provider, TransactionResponse } from "@ethersproject/providers";
import {
  Erc1155Minter__factory,
  MinterERC20__factory,
  UserNftMinter__factory,
  PaymentToken__factory,
} from "xpnet-web3-contracts";
import {
  BaseWeb3Helper,
  EthNftInfo,
  MintArgs,
  NFT_METHOD_MAP,
  NftInfo,
  TransactionStatus,
  Web3Helper,
  Web3Params,
} from "../..";
import { txnUnderpricedPolyWorkaround as UnderpricedWorkaround } from "./web3_utils";

/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
export async function baseWeb3HelperFactory(
  provider: Provider
): Promise<BaseWeb3Helper> {
  const w3 = provider;

  return {
    async balance(address: string): Promise<BigNumber> {
      const bal = await w3.getBalance(address);

      // ethers BigNumber is not compatible with our bignumber
      return new BigNumber(bal.toString());
    },
    async deployErc721(owner: Signer): Promise<string> {
      const factory = new UserNftMinter__factory(owner);
      const contract = await factory.deploy();

      return contract.address;
    },
    async mintNftErc1155(owner: Signer, { contract }) {
      const erc1155 = Erc1155Minter__factory.connect(contract!, owner);
      const tx = await erc1155.mintNft(await owner.getAddress());

      return tx;
    },
    async mintNft(
      owner: Signer,
      { contract, uri }: MintArgs
    ): Promise<ContractTransaction> {
      const erc721 = UserNftMinter__factory.connect(contract!, owner);

      const txm = await erc721.mint(uri, { gasLimit: 1000000 });
      return txm;
    },
  };
}

export type Web3ERC20Params = Web3Params & {
  paymentTokenAddress: string;
};

export async function web3ERC20HelperFactory(
  params: Web3ERC20Params
): Promise<Web3Helper> {
  const txnUnderpricedPolyWorkaround =
    params.nonce == 7 ? UnderpricedWorkaround : () => Promise.resolve();
  const w3 = params.provider;
  const { minter_addr, provider } = params;
  const minter = MinterERC20__factory.connect(minter_addr, provider);

  async function notifyValidator(
    fromHash: string,
    actionId?: string,
    type?: string,
    toChain?: number,
    txFees?: string,
    senderAddress?: string,
    targetAddress?: string,
    nftUri?: string,
    tokenId?: string,
    contract?: string
  ): Promise<void> {
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

  async function getTransaction(hash: string) {
    let trx;
    let fails = 0;
    while (!trx && fails < 7) {
      trx = await provider.getTransaction(hash);
      await new Promise((resolve) =>
        setTimeout(() => resolve("wait"), 5000 + fails * 2)
      );
      fails++;
    }

    return trx as TransactionResponse;
  }

  async function extractAction(txr: TransactionResponse): Promise<string> {
    const receipt = await txr.wait();
    const log = receipt.logs.find((log) => log.address === minter.address);
    if (log === undefined) {
      throw Error("Couldn't extract action_id");
    }

    const evdat = minter.interface.parseLog(log);
    const action_id: string = evdat.args[0].toString();
    return action_id;
  }

  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    signer: Signer,
    _: string
  ) => {
    const erc = NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      signer
    );
    return await NFT_METHOD_MAP[id.native.contractType].approved(
      erc as any,
      await signer.getAddress(),
      minter_addr,
      id.native.tokenId,
      params.nonce === 0x1d ? {} : undefined
    );
  };

  const approveForMinter = async (
    id: NftInfo<EthNftInfo>,
    sender: Signer,
    txFees: BigNumber,
    overrides: ethers.Overrides | undefined
  ) => {
    const isApproved = await isApprovedForMinter(id, sender, minter_addr);
    if (isApproved) {
      return undefined;
    }
    const erc = NFT_METHOD_MAP[id.native.contractType].umt.connect(
      id.native.contract,
      sender
    );

    const receipt = await NFT_METHOD_MAP[id.native.contractType].approve(
      erc as any,
      minter_addr,
      id.native.tokenId,
      txnUnderpricedPolyWorkaround,
      params.nonce === 0x1d ? {} : undefined,
      overrides
    );
    await receipt.wait();

    const erc20 = PaymentToken__factory.connect(
      params.paymentTokenAddress,
      sender
    );
    const approval = await erc20.approve(
      minter_addr,
      EthBN.from(txFees.toString())
    );

    return approval.hash;
  };

  const base = await baseWeb3HelperFactory(params.provider);

  return {
    ...base,
    XpNft: params.erc721_addr,
    XpNft1155: params.erc1155_addr,
    getParams: () => params,
    approveForMinter,
    getProvider: () => provider,
    async estimateValidateUnfreezeNft(_to, _id, _mW) {
      const gas = await provider.getGasPrice();
      return new BigNumber(gas.mul(150_000).toString());
    },
    getFeeMargin() {
      return params.feeMargin;
    },
    isApprovedForMinter,
    preTransfer: (s, id, _fee, args) =>
      approveForMinter(id, s, _fee, args?.overrides),
    extractAction,
    async isContractAddress(address) {
      const code = await provider.getCode(address);
      return code !== "0x";
    },
    estimateContractDeploy: async () => new BigNumber(0),
    estimateUserStoreDeploy: async () => new BigNumber(0),
    getNonce: () => params.nonce,
    async preTransferRawTxn(id, address, _value) {
      const isApproved = await isApprovedForMinter(
        id,
        new VoidSigner(address, provider),
        minter_addr
      );

      if (isApproved) {
        return undefined;
      }

      const erc = UserNftMinter__factory.connect(
        id.native.contract,
        new VoidSigner(address, provider)
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
        return TransactionStatus.PENDING;
      }
      if (status === 1) {
        return TransactionStatus.SUCCESS;
      } else if (status === 0) {
        return TransactionStatus.FAILURE;
      }
      return TransactionStatus.UNKNOWN;
    },
    async getTokenURI(contract, tokenId) {
      if (ethers.utils.isAddress(contract) && tokenId) {
        const erc721 = UserNftMinter__factory.connect(contract!, provider);
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
          EthBN.from(txFees.toString())
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
          EthBN.from(txFees.toString())
        );
      await txnUnderpricedPolyWorkaround(tx);

      const res = await signer.sendTransaction(tx);

      await notifyValidator(res.hash);

      return res;
    },
    async estimateValidateTransferNftBatch(_to, nfts, _mintWith) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40_000 + 60_000 * nfts.length;
      return new BigNumber(gasPrice.mul(gas).toString());
    },
    async estimateValidateUnfreezeNftBatch(_to, nfts) {
      const gasPrice = await w3.getGasPrice();
      const gas = 40_000 + 60_000 * nfts.length;
      return new BigNumber(gasPrice.mul(gas).toString());
    },
    createWallet(privateKey: string): Wallet {
      return new Wallet(privateKey, provider);
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber,
      mintWith: string,
      gasLimit: ethers.BigNumberish | undefined = undefined,
      gasPrice
    ): Promise<TransactionResponse> {
      await approveForMinter(id, sender, txFees, { gasPrice });
      const method = NFT_METHOD_MAP[id.native.contractType].freeze;

      const tx = await minter
        .connect(sender)
        .populateTransaction[method](
          id.native.contract,
          id.native.tokenId,
          chain_nonce,
          to,
          mintWith,
          EthBN.from(txFees.toString()),
          {
            gasLimit,
          }
        );
      await txnUnderpricedPolyWorkaround(tx);

      const txr: TransactionResponse | unknown = await sender
        .sendTransaction(tx)
        .catch((e) => {
          if (params.nonce === 33) {
            return e;
          } else throw e;
        });
      let txHash: string;
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
      return params.nonce === 33
        ? await provider.getTransaction(txHash)
        : (txr as TransactionResponse);
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber,
      nonce
    ): Promise<TransactionResponse> {
      const txn = await minter
        .connect(sender)
        .populateTransaction.withdrawNft(
          to,
          nonce,
          id.native.tokenId,
          id.native.contract,
          EthBN.from(txFees.toString())
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
    async estimateValidateTransferNft(
      _to: string,
      _nftUri: NftInfo<EthNftInfo>,
      _mintWith
    ): Promise<BigNumber> {
      const gas = await provider.getGasPrice();

      return new BigNumber(gas.mul(150_000).toString());
    },
    validateAddress(adr) {
      return Promise.resolve(ethers.utils.isAddress(adr));
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract);
    },
    async lockNFT() {
      return undefined;
    },
    async claimV3NFT() {
      return undefined;
    },
  };
}
