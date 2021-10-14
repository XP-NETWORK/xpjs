import { BigNumber } from "bignumber.js";
import {
  BalanceCheck,
  BatchWrappedBalanceCheck,
  DecodeRawNft,
  DecodeWrappedNft,
  EstimateTxFees,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  WrappedBalanceCheck,
  WrappedNft,
} from "./chain";

import axios from "axios";
// @ts-expect-error no types cope
import { TronWeb } from "tronweb";
// @ts-expect-error no types cope
import TronStation from 'tronstation';
import { EthNftInfo, MintArgs } from "./web3";
import { BigNumber as EthBN } from "@ethersproject/bignumber/lib/bignumber";
import { Base64 } from "js-base64";
import { NftEthNative, NftPacked } from "validator";
import { Minter__factory, UserNftMinter__factory, XPNet__factory, XPNft__factory } from "xpnet-web3-contracts";

export type MinterRes = {
  // Minter smart contract
  minter: string,
  // XPNFT (Wrapper for foreign NFTs) contracte
  xpnft: string,
  // XPNET (Wrapper for foregin fungible tokens) contract
  xpnet: string,
  // Whitelisted Native NFT contracts
  whitelist: string[]
}

export type BaseTronHelper = BalanceCheck<string, BigNumber> &
  MintNft<string, MintArgs, void> & {
    /**
     *
     * Deploy an ERC721 user minter smart contract
     *
     * @argument deployer  deployer of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(deployer: string): Promise<string>;
    /**
     * Deploy Minter Smart Contract
     *
     * @argument deployer  deployer of the smart contract
     * @argument validators  address of validators of the smart contract
     * @argument threshold  threshold for executing an action
     * @argument whitelist  optional whitelisted nfts contract (deploys one if empty/undefined)
     */
    deployMinter(
      deployer: string,
      validators: string[],
      threshold: number,
      whitelist: string[] | undefined,
    ): Promise<MinterRes>;
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
  DecodeRawNft & EstimateTxFees<string, EthNftInfo, Uint8Array, BigNumber> & {
    nftUri(info: EthNftInfo): Promise<string>;
  };

export async function baseTronHelperFactory(
  provider: TronWeb
): Promise<BaseTronHelper> {
  const setSigner = (signer: string) => {
    return provider.setPrivateKey(signer);
  };

  const deployErc721_i = async (deployer: string) => {
    setSigner(deployer);

    const contract = await provider.contract().new({
      abi: UserNftMinter__factory.abi,
      bytecode: UserNftMinter__factory.bytecode,
      feeLimit: 3000000000,
    });

    return contract;
  };

  const deployErc1155_i = async (owner: string) => {
    setSigner(owner);

    const contract = await provider.contract().new({
      abi: XPNet__factory.abi,
      bytecode: XPNet__factory.bytecode,
      feeLimit: 3000000000
    });

    return contract;
  }

  const deployXpNft = async (deployer: string) => {
    setSigner(deployer);

    const contract = await provider.contract().new({
      abi: XPNft__factory.abi,
      bytecode: XPNft__factory.bytecode,
      feeLimit: 3000000000
    });

    return contract;
  }

  return {
    async mintNft(owner: string, options: MintArgs): Promise<void> {
      setSigner(owner);
      const erc = await provider.contract(UserNftMinter__factory.abi, options.contract);
      await erc.mint(options.uri).send();
    },
    async balance(address: string): Promise<BigNumber> {
      const balance = await provider.trx.getBalance(address);
      return new BigNumber(balance);
    },
    deployErc721: async (owner) =>
      await deployErc721_i(owner).then((c) => c.address),
    async deployMinter(
      deployer: string,
      validators: string[],
      threshold: number,
      whitelist: string[] = []
    ): Promise<MinterRes> {
      if (whitelist.length == 0) {
        const unft = await deployErc721_i(deployer);
        whitelist.push(unft.address);
      }

      const nft_token = await deployXpNft(deployer);
      const token = await deployErc1155_i(deployer);
      const minter = await provider.contract().new({
        abi: Minter__factory.abi,
        bytecode: Minter__factory.bytecode,
        feeLimit: 3000000000,
        parameters: [validators, whitelist, threshold, nft_token.address, token.address]
      });

      await nft_token.transferOwnership(minter.address).send();
      await token.transferOwnership(minter.address).send();

      return {
        minter: minter.address,
        xpnft: nft_token.address,
        xpnet: token.address,
        whitelist
      }
    }
  };
}

export async function tronHelperFactory(
  provider: TronWeb,
  middleware_uri: string,
  erc1155_addr: string,
  minter_addr: string,
): Promise<TronHelper> {
  const station = new TronStation(provider)
  const base = await baseTronHelperFactory(provider);
  const erc1155 = await provider.contract(XPNet__factory.abi, erc1155_addr);
  const minter = await provider.contract(Minter__factory.abi, minter_addr);
  const event_middleware = axios.create({
    baseURL: middleware_uri,
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
    const ev = evs.find((e: any) => e?.contract == minter_addr);
    const action_id: string = ev.result["action_id"].toString();
    return [hash, action_id];
  }

  const nftUri = async (info: EthNftInfo): Promise<string> => {
    if (info.contract_type == "ERC721") {
      const erc = await provider.contract(UserNftMinter__factory.abi, info.contract);
      return await erc.tokenURI(info.token).call();
    } else {
      const erc = await provider.contract(XPNet__factory.abi, info.contract);
      return await erc.uri(info.token).call();
    }
  };

  function contractTypeFromNftKind(kind: 0 | 1): "ERC721" | "ERC1155" {
    return kind === NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
  }

  const randomAction = () =>
    (Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)))
      .toString();

  async function estimateGas(addrs: string[], func_sig: string, params: { type: string, value: any }[]): Promise<BigNumber> {
    let energy = 0;
    let bandwidth = 0;
    const nrgSun = await station.energy.burnedEnergy2Trx(1, { unit: 'sun' });
    const bandSun = 10;

    for (const [i, addr] of addrs.entries()) {
      const res = await provider.transactionBuilder.triggerConstantContract(
        minter.address,
        func_sig,
        {},
        params,
        provider.address.toHex(addr)
      );
      let nrg: number = res["energy_used"]
      if (i == addrs.length - 1 && addrs.length != 1) nrg *= 2;
      energy += nrg;
      const tx_raw: string = res["transaction"]["raw_data_hex"];
      bandwidth += tx_raw.length;
    }
    // Fee = energy * (sun per energy) + bandwidth * (sun per bandwidth)
    // bandwidth = raw tx byte length
    const fee = new BigNumber(energy).times(nrgSun).plus(bandwidth*bandSun);

    return fee;
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

      const val = EthBN.from(value.toString())
      const totalVal = val.add(
        EthBN.from(txFees.toString())
      );
      let res = await minter
        .freeze(chain_nonce, to, val)
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
        .withdrawNft(to, id.toString())
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
      const erc = await provider.contract(UserNftMinter__factory.abi, id.contract);
      await erc.approve(minter.address, id.token).send();

      const txr = await minter
        .freezeErc721(id.contract, id.token, chain_nonce, to)
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

      return await estimateGas(
        validators,
        "validateTransferNft(uint128,address,string)",
        [
          { type: "uint128", value: randomAction() },
          { type: "address", value: to },
          { type: "string", value: Buffer.from(encoded.serializeBinary()).toString("base64") }
        ]
      );
    },
    async estimateValidateUnfreezeNft(
      validators: string[],
      to: string,
      nft_data: Uint8Array
    ): Promise<BigNumber> {
      const nft_dat = NftEthNative.deserializeBinary(nft_data);

      return await estimateGas(
        validators,
        "validateUnfreezeNft(uint128,address,uint256,address)",
        [
          { type: "uint128", value: randomAction() },
          { type: "address", value: to },
          { type: "uint256", value: nft_dat.getId().toString() },
          { type: "address", value: nft_dat.getContractAddr() }
        ]
      );
    },
  };
}
