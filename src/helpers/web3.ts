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
  WrappedNftCheck,
} from "./chain";
import {
  Signer,
  BigNumber as EthBN,
  PopulatedTransaction,
  Wallet,
  ContractTransaction,
} from "ethers";
import {
  TransactionReceipt,
  TransactionResponse,
  Provider,
} from "@ethersproject/providers";
import { NftEthNative, NftPacked } from "validator";
import {
  Minter__factory,
  UserNftMinter,
  UserNftMinter__factory,
  XPNet__factory,
} from "xpnet-web3-contracts";
import { Base64 } from "js-base64";
import {
  BareNft,
  ChainNonceGet,
  EstimateTxFees,
  NftInfo,
  PackNft,
  PopulateDecodedNft,
} from "..";
import { NftMintArgs } from "..";
import { ApiProvider } from "@elrondnetwork/erdjs/out";
type EasyBalance = string | number | EthBN;
/**
 * Information required to perform NFT transfers in this chain
 */
export type EthNftInfo = {
  chainId: string;
  tokenId: string;
  owner: string;
  uri: string;
  contract: string;
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

export interface IsApproved {
  isApprovedForMinter(
    address: NftInfo<EthNftInfo>,
    sender: Signer
  ): Promise<boolean>;
}

export interface Approve {
  approveForMinter(
    address: NftInfo<EthNftInfo>,
    sender: Signer
  ): Promise<boolean>;
}

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
  MintNft<Signer, NftMintArgs, any> & {
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
  TransferForeign<Signer, string, BigNumber, ContractTransaction> &
  TransferNftForeign<
    Signer,
    string,
    BigNumber,
    EthNftInfo,
    ContractTransaction
  > &
  UnfreezeForeign<Signer, string, EasyBalance, ContractTransaction> &
  UnfreezeForeignNft<
    Signer,
    string,
    BigNumber,
    EthNftInfo,
    ContractTransaction
  > &
  DecodeWrappedNft<EthNftInfo> &
  DecodeRawNft<EthNftInfo> &
  EstimateTxFees<EthNftInfo, BigNumber> &
  PackNft<EthNftInfo> &
  WrappedNftCheck<MintArgs> &
  ChainNonceGet &
  PopulateDecodedNft<EthNftInfo> &
  IsApproved &
  Approve;

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
    async mintNft(
      owner: Signer,
      { contract, uris }: NftMintArgs
    ): Promise<any> {
      const erc721 = UserNftMinter__factory.connect(contract!, owner);

      const txm = await erc721.mint(uris[0]);
      return await txm.wait();
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
export interface Web3Params {
  provider: Provider;
  minter_addr: string;
  erc1155_addr: string;
  erc721_addr: string;
  validators: string[];
  nonce: number;
}

export async function web3HelperFactory(
  params: Web3Params
): Promise<Web3Helper> {
  const w3 = params.provider;
  const { minter_addr, provider, erc1155_addr } = params;
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

  async function nftUri(contract: string, tokenId: EthBN): Promise<BareNft> {
    const erc = UserNftMinter__factory.connect(contract, w3);
    return {
      uri: await erc.tokenURI(tokenId),
      chainId: params.nonce.toString(),
    };
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

  const isApprovedForMinter = async (
    id: NftInfo<EthNftInfo>,
    signer: Signer
  ) => {
    const erc = UserNftMinter__factory.connect(id.native.contract, signer)
    const approvedAddress = await erc.getApproved(id.native.tokenId);
    if (approvedAddress === minter_addr) {
      return true;
    }
    return false;
  };

  const approveForMinter = async (
    id: NftInfo<EthNftInfo>,
    sender: Signer
  ) => {
    const isApproved = await isApprovedForMinter(id, sender);
    const erc = UserNftMinter__factory.connect(id.native.contract, sender)
    if (isApproved) {
      return true;
    }

    const receipt = await erc.approve(
      minter_addr,
      id.native.tokenId
    );
    await receipt.wait();
    return true;
  };

  const base = await baseWeb3HelperFactory(params.provider);

  return {
    ...base,
    approveForMinter,
    isApprovedForMinter,
    async populateNft(nft) {
      return await nftUri(nft.native.contract, EthBN.from(nft.native.tokenId));
    },
    getNonce: () => params.nonce,
    async balanceWrapped(
      address: string,
      chain_nonce: number
    ): Promise<BigNumber> {
      const bal = await erc1155.balanceOf(address, chain_nonce);

      return new BigNumber(bal.toString());
    },
    isWrappedNft(nft) {
      return nft.native.contract === params.erc721_addr;
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
      value: BigNumber,
      txFees: BigNumber
    ): Promise<ContractTransaction> {
      const val = EthBN.from(value.toString());
      const totalVal = val.add(EthBN.from(txFees.toString()));
      const res = await minter.connect(sender).freeze(chain_nonce, to, val, {
        value: totalVal,
      });
      return res;
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<ContractTransaction> {
      const erc = UserNftMinter__factory.connect(id.native.contract, sender);
      await approveForMinter(id, sender);

      const txr = await minter
        .connect(sender)
        .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to, {
          value: EthBN.from(txFees.toString()),
        });

      return txr;
    },
    async unfreezeWrapped(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<ContractTransaction> {
      const res = await minter
        .connect(sender)
        .withdraw(chain_nonce, to, value, {
          value: EthBN.from(txFees.toString()),
        });

      return res;
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      id: NftInfo<EthNftInfo>,
      txFees: BigNumber
    ): Promise<ContractTransaction> {
      const res = await minter
        .connect(sender)
        .withdrawNft(to, id.native.tokenId, {
          value: EthBN.from(txFees.toString()),
        });

      return res;
    },
    decodeWrappedNft(nft: NftInfo<EthNftInfo>): WrappedNft {
      const u8D = Base64.toUint8Array(nft.native.uri);
      const packed = NftPacked.deserializeBinary(u8D);

      return {
        chain_nonce: packed.getChainNonce(),
        data: packed.getData_asU8(),
      };
    },
    async decodeNftFromRaw(data: Uint8Array) {
      const packed = NftEthNative.deserializeBinary(data);

      return {
        uri: "",
        native: {
          uri: "",
          contract: packed.getContractAddr(),
          tokenId: packed.getId(),
          owner: minter_addr,
          chainId: params.nonce.toString(),
        },
      };
    },
    async estimateValidateTransferNft(
      to: string,
      nft: Uint8Array
    ): Promise<BigNumber> {
      const encoded = new NftPacked();
      encoded.setChainNonce(0x1351);
      encoded.setData(nft);

      const utx = await minter.populateTransaction.validateTransferNft(
        randomAction(),
        to,
        Buffer.from(encoded.serializeBinary()).toString("base64")
      );

      return await estimateGas(params.validators, utx);
    },
    async estimateValidateUnfreezeNft(
      to: string,
      nft: NftInfo<EthNftInfo>
    ): Promise<BigNumber> {
      const utx = await minter.populateTransaction.validateUnfreezeNft(
        randomAction(),
        to,
        EthBN.from(nft.native.tokenId.toString()),
        nft.native.contract
      );

      return await estimateGas(params.validators, utx);
    },
    wrapNftForTransfer(nft) {
      // Protobuf is not deterministic, though perhaps we can approximate this statically
      const tokdat = new NftEthNative();
      tokdat.setId(nft.native.tokenId);
      tokdat.setNftKind(1);
      tokdat.setContractAddr(nft.native.contract);

      return tokdat.serializeBinary();
    },
  };
}
