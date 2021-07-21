import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { AnyJson, RegistryTypes } from "@polkadot/types/types";
import { ContractPromise } from "@polkadot/api-contract";
import { KeyringPair } from "@polkadot/keyring/types";
import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import {
  Faucet,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  BalanceCheck
} from "./chain";

type ConcreteJson = {
  readonly [index: string]: AnyJson;
};

type EasyBalance = string | number | BigNumber;
type EasyAddr = string | LookupSource | Address;

type BasePolkadot = Faucet<
  EasyAddr,
  EasyBalance,
  Hash
> &
  BalanceCheck<string, BigNumber>;

export type PolkadotHelper = BasePolkadot &
  TransferForeign<KeyringPair, string, EasyBalance, Hash> &
  UnfreezeForeign<KeyringPair, string, EasyBalance, Hash>;

export type PolkadotPalletHelper = PolkadotHelper &
  TransferNftForeign<KeyringPair, string, H256, Hash> &
  UnfreezeForeignNft<KeyringPair, string, H256, Hash>;

async function basePolkadotHelper(
  node_uri: string
  ): Promise<[BasePolkadot, ApiPromise]> {
    const provider = new WsProvider(node_uri);
    const api = await ApiPromise.create({ provider, types: runtimeTypes });


    const keyring = new Keyring();
    const faucet = keyring.addFromUri("//Bob", undefined, "sr25519");
  
    const base = {
      async transferFromFaucet(
        to: string | LookupSource | Address,
        value: EasyBalance
      ): Promise<Hash> {
        return await api.tx.balances
          .transfer(to, value.toString())
          .signAndSend(faucet);
      },
      async balance(
        address: EasyAddr
      ): Promise<BigNumber> {

        const res: any = await api.query.system.account(address);
        
        return new BigNumber(res['data']['balance'].toString());
      }
    }

    return [base, api]
}

export const polkadotHelperFactory: (
  node_uri: string,
  freezer_addr: string,
  abi: ConcreteJson
) => Promise<PolkadotHelper> = async (
  node_uri: string,
  freezer_addr: string,
  abi: ConcreteJson
) => {
  const [base, api] = await basePolkadotHelper(node_uri);
  const freezer = new ContractPromise(api, abi, freezer_addr);

  return {
    ...base,
    async transferNativeToForeign(
      sender: KeyringPair,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await freezer.tx
        .send({ value: value.toString(), gasLimit: -1 }, to)
        .signAndSend(sender);
    },
    async unfreezeWrapped(
      sender: KeyringPair,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await freezer.tx
        .withdrawWrapper({ value: 0, gasLimit: -1 }, to, value.toString())
        .signAndSend(sender);
    },
  };
};

export const polkadotPalletHelperFactory: (
  node_uri: string
) => Promise<PolkadotPalletHelper> = async (node_uri: string) => {
  const [base, api] = await basePolkadotHelper(node_uri);

  return {
    ...base,
    async transferNativeToForeign(
      sender: KeyringPair,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await api.tx.freezer
        .send(to, value.toString())
        .signAndSend(sender);
    },
    async unfreezeWrapped(
      sender: KeyringPair,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await api.tx.freezer
        .withdrawWrapped(to, value.toString())
        .signAndSend(sender);
    },
    async transferNftToForeign(
      sender: KeyringPair,
      to: string,
      nft_id: H256
    ): Promise<Hash> {
      return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender);
    },
    async unfreezeWrappedNft(
      sender: KeyringPair,
      to: string,
      nft_id: H256
    ): Promise<Hash> {
      return await api.tx.freezer.sendNft(to, nft_id).signAndSend(sender);
    },
  };
};

const runtimeTypes: RegistryTypes = {
  ActionId: "u128",
  TokenId: "u128",
  CommodityId: "H256",
  CommodityInfo: "Vec<u8>",
  NftId: "H256",
  NftInfo: "Vec<u8>",
  EgldBalance: "Balance",
  Commodity: "(H256, Vec<u8>)",
  LocalAction: {
    _enum: {
      //@ts-expect-error enum struct
      Unfreeze: {
        to: "AccountId",
        value: "Balance",
      },
      //@ts-expect-error enum struct
      RpcCall: {
        contract: "AccountId",
        call_data: "Vec<u8>",
      },
      //@ts-expect-error enum struct
      TransferWrapped: {
        to: "AccountId",
        value: "Balance",
      },
    },
  },
  ActionInfo: {
    action: "LocalAction",
    validators: "BTreeSet<AccountId>",
  },
};
