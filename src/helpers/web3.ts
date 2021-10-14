/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import {
  TransferForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  BalanceCheck,
  TransferNftForeign,
  WrappedBalanceCheck,
  BatchWrappedBalanceCheck,
  DecodeWrappedNft,
  WrappedNft,
  DecodeRawNft,
  MintNft,
} from "./chain";
import {
  Signer,
  BigNumber as EthBN,
  PopulatedTransaction,
} from "ethers";
import {
  TransactionReceipt,
  TransactionResponse,
  Provider,
} from "@ethersproject/providers";
import { NftEthNative, NftPacked } from "validator";
import { Minter__factory, UserNftMinter__factory, XPNet__factory } from "xpnet-web3-contracts";
import { Base64 } from "js-base64";
import { EstimateTxFees } from "..";
type EasyBalance = string | number | EthBN;
/**
 * Information required to perform NFT transfers in this chain
 */
export type EthNftInfo = {
  contract_type: "ERC721" | "ERC1155";
  contract: string;
  token: EthBN;
};

/**
 * Arguments required for minting a new nft
 *
 * contract: address of the sc
 * token: token ID of the newly minted nft
 * owner: Owner of the newly minted nft
 * uri: uri of the nft
 */
export type MintArgs = {
  contract: string;
  uri: string;
};

/**
 * Base util traits
 */
export type BaseWeb3Helper = BalanceCheck<string, BigNumber> &
  /**
   * Mint an nft in the given ERC1155 smart contract
   *
   * @argument signer  owner of the smart contract
   * @argument args  See [[MintArgs]]
   */
  MintNft<Signer, MintArgs, void> & {
    /**
     *
     * Deploy an ERC721 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: Signer): Promise<string>;
  };

/**
 * Traits implemented by this module
 */
export type Web3Helper = BaseWeb3Helper &
  WrappedBalanceCheck<string, BigNumber> &
  BatchWrappedBalanceCheck<string, BigNumber> &
  TransferForeign<Signer, string, EasyBalance, TransactionReceipt, string> &
  TransferNftForeign<
    Signer,
    string,
    EasyBalance,
    EthNftInfo,
    TransactionReceipt,
    string
  > &
  UnfreezeForeign<Signer, string, EasyBalance, TransactionReceipt, string> &
  UnfreezeForeignNft<
    Signer,
    string,
    EasyBalance,
    BigNumber,
    TransactionReceipt,
    string
  > &
  DecodeWrappedNft<string> &
  DecodeRawNft & EstimateTxFees<string, EthNftInfo, Uint8Array, BigNumber> & {
    /**
     * Get the uri of an nft given nft info
     */
    nftUri(info: EthNftInfo): Promise<string>;
  };

function contractTypeFromNftKind(kind: 0 | 1): "ERC721" | "ERC1155" {
  return kind === NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
}

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
    async mintNft(owner: Signer, { contract, uri }: MintArgs): Promise<void> {
      const erc721 = UserNftMinter__factory.connect(contract, owner);

      const txm = await erc721.mint(uri);
      await txm.wait();
    },
  };
}

/**
 * Create an object implementing cross chain utilities for a web3 chain
 *
 * @param provider  An ethers.js provider object
 * @param minter_addr  Address of the minter smart contract
 * @param minter_abi  ABI of the minter smart contract
 */
export async function web3HelperFactory(
  provider: Provider,
  minter_addr: string,
  erc1155_addr: string
): Promise<Web3Helper> {
  const w3 = provider;

  const minter = Minter__factory.connect(minter_addr, provider);
  const erc1155 = XPNet__factory.connect(erc1155_addr, provider);

  async function extractTxn(
    txr: TransactionResponse,
    _evName: string
  ): Promise<[TransactionReceipt, string]> {
    const receipt = await txr.wait();
    const log = receipt.logs.find((log) => log.address === minter.address);
    if (log === undefined) {
      throw Error("Couldn't extract action_id");
    }

    const evdat = minter.interface.parseLog(log);
    const action_id: string = evdat.args[0].toString();
    return [receipt, action_id];
  }

  async function nftUri(info: EthNftInfo): Promise<string> {
    if (info.contract_type == "ERC721") {
      const erc = UserNftMinter__factory.connect(info.contract, w3);
      return await erc.tokenURI(info.token);
    } else {
      const erc = XPNet__factory.connect(info.contract, w3);
      return await erc.uri(info.token);
    }
  }

  const randomAction = () =>
    EthBN.from(
      Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
    );

  async function estimateGas(
    addrs: string[],
    utx: PopulatedTransaction
  ): Promise<BigNumber> {
    let fee = EthBN.from(0);

    for (const [i, addr] of addrs.entries()) {
      utx.from = addr;
      let tf = await w3.estimateGas(utx);
      if (i == addrs.length - 1 && addrs.length != 1) tf = tf.mul(2);
      fee = fee.add(tf);
    }
    fee = fee.mul(await w3.getGasPrice());

    return new BigNumber(fee.toString());
  }

  const base = await baseWeb3HelperFactory(provider);

  return {
    ...base,
    async balanceWrapped(
      address: string,
      chain_nonce: number
    ): Promise<BigNumber> {
      const bal = await erc1155.balanceOf(address, chain_nonce);

      return new BigNumber(bal.toString());
    },
    async balanceWrappedBatch(
      address: string,
      chain_nonces: number[]
    ): Promise<Map<number, BigNumber>> {
      const bals: EthBN[] = await erc1155.balanceOfBatch(
        Array(chain_nonces.length).fill(address),
        chain_nonces
      );

      return new Map(
        bals.map((v, i) => [chain_nonces[i], new BigNumber(v.toString())])
      );
    },
    async transferNativeToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<[TransactionReceipt, string]> {
      const val = EthBN.from(value.toString());
      const totalVal = val.add(
        EthBN.from(txFees.toString())
      );
      const res = await minter.connect(sender).freeze(chain_nonce, to, val, {
        value: totalVal,
      });
      return await extractTxn(res, "Transfer");
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      id: EthNftInfo,
      txFees: EasyBalance
    ): Promise<[TransactionReceipt, string]> {
      const erc = UserNftMinter__factory.connect(id.contract, sender);
      const ta = await erc.approve(minter.address, id.token);

      await ta.wait();

      const txr = await minter
        .connect(sender)
        .freezeErc721(id.contract, id.token, chain_nonce, to, {
          value: EthBN.from(txFees.toString()),
        });

      return await extractTxn(txr, "TransferErc721");
    },
    async unfreezeWrapped(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<[TransactionReceipt, string]> {
      const res = await minter.connect(sender).withdraw(chain_nonce, to, value, {
        value: EthBN.from(txFees.toString()),
      });

      return await extractTxn(res, "Unfreeze");
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      id: BigNumber,
      txFees: EasyBalance
    ): Promise<[TransactionReceipt, string]> {
      const res = await minter.connect(sender).withdrawNft(to, id.toString(), {
        value: EthBN.from(txFees.toString()),
      });

      return await extractTxn(res, "UnfreezeNft");
    },
    nftUri,
    decodeWrappedNft(raw_data: string): WrappedNft {
      const u8D = Base64.toUint8Array(raw_data);
      const packed = NftPacked.deserializeBinary(u8D);

      return {
        chain_nonce: packed.getChainNonce(),
        data: packed.getData_asU8(),
      };
    },
    async decodeUrlFromRaw(data: Uint8Array): Promise<string> {
      const packed = NftEthNative.deserializeBinary(data);
      const nft_info = {
        contract_type: contractTypeFromNftKind(packed.getNftKind()),
        contract: packed.getContractAddr(),
        token: EthBN.from(packed.getId()),
      };

      return await nftUri(nft_info);
    },
    async estimateValidateTransferNft(
      validators: string[],
      to: string,
      nft: EthNftInfo
    ): Promise<BigNumber> {
      // Protobuf is not deterministic, though perhaps we can approximate this statically
      const tokdat = new NftEthNative();
      tokdat.setId(nft.token.toString());
      tokdat.setNftKind(1);
      tokdat.setContractAddr(nft.contract);

      const encoded = new NftPacked();
      encoded.setChainNonce(0x1351);
      encoded.setData(tokdat.serializeBinary());

      const utx = await minter.populateTransaction.validateTransferNft(
        randomAction(),
        to,
        Buffer.from(encoded.serializeBinary()).toString("base64")
      );

      return await estimateGas(validators, utx);
    },
    async estimateValidateUnfreezeNft(
      validators: string[],
      to: string,
      nft_data: Uint8Array
    ): Promise<BigNumber> {
      const nft_dat = NftEthNative.deserializeBinary(nft_data);
      const utx = await minter.populateTransaction.validateUnfreezeNft(
        randomAction(),
        to,
        EthBN.from(nft_dat.getId().toString()),
        nft_dat.getContractAddr()
      );

      return await estimateGas(validators, utx);
    },
  };
}
