import { BigNumber } from "bignumber.js";
import {
  BalanceCheck,
  BatchWrappedBalanceCheck,
  DecodeRawNft,
  DecodeWrappedNft,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  WrappedBalanceCheck,
  WrappedNft,
} from "./chain";
import { abi as ERC1155_abi } from "../fakeERC1155.json";

// @ts-ignore
import { TronWeb } from "tronweb";
import { EthNftInfo, MintArgs } from "./web3";

import { BigNumber as EthBN } from "@ethersproject/bignumber/lib/bignumber";
import {
  abi as ERC721_abi,
  bytecode as ERC721_bytecode,
} from "../fakeERC721.json";
import { Base64 } from "js-base64";
import { NftEthNative, NftPacked } from "validator/dist/encoding";
import axios from "axios";
import { EstimateTxFees, WrappedNftCheck } from "..";

export type BaseTronHelper = BalanceCheck<string, BigNumber> &
  MintNft<string, MintArgs, void> & {
    /**
     *
     * Deploy an ERC1155 smart contract
     *
     * @argument owner  Owner of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(owner: string): Promise<string>;
  };

export type TronHelper = BaseTronHelper &
  WrappedBalanceCheck<string, BigNumber> &
  BatchWrappedBalanceCheck<string, BigNumber> &
  TransferForeign<string, string, string, string, string> &
  // TODO: Use TX Fees
  TransferNftForeign<string, string, string, EthNftInfo, string, string> &
  // TODO: Use TX Fees
  UnfreezeForeign<string, string, string, string, string> &
  UnfreezeForeignNft<string, string, string, BigNumber, string, string> &
  DecodeWrappedNft<string> &
  DecodeRawNft &
  EstimateTxFees<string, EthNftInfo, Uint8Array, BigNumber> & {
    nftUri(info: EthNftInfo): Promise<string>;
  } & WrappedNftCheck<MintArgs>;

export async function baseTronHelperFactory(
  provider: TronWeb
): Promise<BaseTronHelper> {
  const setSigner = (signer: string) => {
    return provider.setPrivateKey(signer);
  };

  const deployErc721_i = async (owner: string) => {
    setSigner(owner);

    const contract = await provider.contract().new({
      abi: ERC721_abi,
      bytecode: ERC721_bytecode,
      feeLimit: 3000000000,
    });

    return contract;
  };

  return {
    async mintNft(owner: string, options: MintArgs): Promise<void> {
      setSigner(owner);
      const erc = await provider.contract(ERC721_abi, options.contract);
      await erc.mint(options.uri).send();
    },
    async balance(address: string): Promise<BigNumber> {
      const balance = await provider.trx.getBalance(address);
      return new BigNumber(balance);
    },
    deployErc721: async (owner) =>
      await deployErc721_i(owner).then((c) => c.address),
  };
}

export interface TronParams {
  provider: TronWeb;
  middleware_uri: string;
  erc1155_addr: string;
  minter_addr: string;
  minter_abi: JSON;
}

export async function tronHelperFactory(
  tronParams: TronParams
): Promise<TronHelper> {
  const { provider } = tronParams;
  const base = await baseTronHelperFactory(tronParams.provider);
  const erc1155 = await provider.contract(ERC1155_abi, tronParams.erc1155_addr);
  const minter = await provider.contract(
    tronParams.minter_abi,
    tronParams.minter_addr
  );
  const event_middleware = axios.create({
    baseURL: tronParams.middleware_uri,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setSigner = (signer: string) => {
    return provider.setPrivateKey(signer);
  };

  async function extractTxn(hash: string): Promise<[string, string]> {
    await event_middleware.post("/tx/tron", { tx_hash: hash });
    await new Promise((r) => setTimeout(r, 6000));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getEv: (retries?: number) => Promise<any> = async (retries = 0) => {
      const res = await provider.getEventByTransactionID(hash);
      if (res.length !== 0) {
        return res;
      }
      if (retries > 15) {
        throw Error("Couldn't fetch transaction after more than 15 retries!");
      }
      await new Promise((r) => setTimeout(r, 3000));
      return getEv(retries + 1);
    };

    const evs = await getEv();
    const ev = evs.find((e: any) => e?.contract == tronParams.minter_addr);
    const action_id: string = ev.result["action_id"].toString();
    return [hash, action_id];
  }

  const nftUri = async (info: EthNftInfo): Promise<string> => {
    if (info.contract_type == "ERC721") {
      const erc = await provider.contract(ERC721_abi, info.contract);
      return await erc.tokenURI(info.token).call();
    } else {
      const erc = await provider.contract(ERC1155_abi, info.contract);
      return await erc.uri(info.token).call();
    }
  };

  function contractTypeFromNftKind(kind: 0 | 1): "ERC721" | "ERC1155" {
    return kind === NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
  }

  const randomAction = () =>
    EthBN.from(
      Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
    );

  async function estimateGas(addrs: string[], utx: any): Promise<BigNumber> {
    let fee = EthBN.from(0);

    for (const [i, addr] of addrs.entries()) {
      utx.from = addr;
      let tf = EthBN.from(400000); // TODO: Proper estimate
      if (i == addrs.length - 1 && addrs.length != 1) tf = tf.mul(2);
      fee = fee.add(tf);
    }
    fee = fee.mul(1.41e14); // TODO: proper gas price estimate

    return new BigNumber(fee.toString());
  }

  return {
    ...base,
    async decodeUrlFromRaw(data: Uint8Array): Promise<string> {
      const packed = NftEthNative.deserializeBinary(data);
      const nft_info = {
        contract_type: contractTypeFromNftKind(packed.getNftKind()),
        contract: packed.getContractAddr(),
        token: EthBN.from(packed.getId()),
      };

      return await nftUri(nft_info);
    },
    isWrappedNft(nft) {
      return nft.contract === tronParams.erc1155_addr;
    },
    decodeWrappedNft(raw_data: string): WrappedNft {
      const u8D = Base64.toUint8Array(raw_data);
      const packed = NftPacked.deserializeBinary(u8D);
      return {
        chain_nonce: packed.getChainNonce(),
        data: packed.getData_asU8(),
      };
    },
    nftUri: nftUri,
    async transferNativeToForeign(
      sender: string,
      chain_nonce: number,
      to: string,
      value: string,
      txFees: string
    ): Promise<[string, string]> {
      setSigner(sender);

      const totalVal = EthBN.from(value.toString()).add(
        EthBN.from(txFees.toString())
      );
      let res = await minter
        .freeze(chain_nonce, to)
        .send({ callValue: totalVal });
      return await extractTxn(res);
    },
    async unfreezeWrapped(
      sender: string,
      chain_nonce: number,
      to: string,
      value: string,
      txFees: string
    ): Promise<[string, string]> {
      setSigner(sender);
      const res = await minter
        .withdraw(chain_nonce, to, value)
        .send({ callValue: EthBN.from(txFees.toString()) });
      return await extractTxn(res);
    },
    async unfreezeWrappedNft(
      sender: string,
      to: string,
      id: BigNumber,
      txFees: string
    ): Promise<[string, string]> {
      setSigner(sender);
      const res = await minter
        .withdraw_nft(to, id)
        .send({ callValue: EthBN.from(txFees.toString()) });
      return await extractTxn(res);
    },
    async transferNftToForeign(
      sender: string,
      chain_nonce: number,
      to: string,
      id: EthNftInfo,
      txFees: string
    ): Promise<[string, string]> {
      setSigner(sender);
      const erc = await provider.contract(ERC721_abi, id.contract);
      await erc.approve(minter.address, id.token).send();

      const txr = await minter
        .freeze_erc721(id.contract, id.token, chain_nonce, to)
        .send({ callValue: EthBN.from(txFees.toString()) });

      return await extractTxn(txr);
    },
    async balanceWrappedBatch(
      address: string,
      chain_nonces: number[]
    ): Promise<Map<number, BigNumber>> {
      const res = new Map<number, BigNumber>();
      const balance = await erc1155
        .balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces)
        .call();
      balance.map((e: any, i: any) => {
        res.set(chain_nonces[i], new BigNumber(e.toString()));
      });
      return res;
    },
    async balanceWrapped(
      address: string,
      chain_nonce: number
    ): Promise<BigNumber> {
      const bal = await erc1155.balanceOf(address, chain_nonce).call();
      return new BigNumber(bal.toString());
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

      const utx = minter.validate_transfer_nft(
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
      const utx = minter.validate_unfreeze_nft(
        randomAction(),
        to,
        EthBN.from(nft_dat.getId().toString()),
        nft_dat.getContractAddr()
      );

      return await estimateGas(validators, utx);
    },
  };
}
