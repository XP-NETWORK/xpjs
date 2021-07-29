import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { AnyJson, RegistryTypes } from "@polkadot/types/types";
import { ContractPromise } from "@polkadot/api-contract";
import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import {
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  BalanceCheck,
  MintNft,
  ListNft,
  GetLockedNft
} from "./chain";
import { AddressOrPair } from "@polkadot/api/types";
import { SignerOptions } from "@polkadot/api/submittable/types";
import {Option, Tuple} from "@polkadot/types";

type ConcreteJson = {
  readonly [index: string]: AnyJson;
};

type NftInfo = {
  readonly [index: string]: string;
}

type Signer = {
  sender: AddressOrPair,
  options?: Partial<SignerOptions>
}

type EasyBalance = string | number | BigNumber;
type EasyAddr = string | LookupSource | Address;

type BasePolkadot = BalanceCheck<string, BigNumber>;

export type PolkadotHelper = BasePolkadot &
  TransferForeign<Signer, string, EasyBalance, Hash> &
  UnfreezeForeign<Signer, string, EasyBalance, Hash>;

export type PolkadotPalletHelper = PolkadotHelper &
  TransferNftForeign<Signer, string, H256, Hash> &
  UnfreezeForeignNft<Signer, string, H256, Hash> &
  MintNft<Signer, Uint8Array, void> &
  ListNft<EasyAddr, string, string> &
  GetLockedNft<H256, Uint8Array>;


const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}
// End Pre-Init
export function toHex(buffer: Uint8Array) {
  let out = '';
  for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
    out += LUT_HEX_8b[buffer[idx]];
  }
  return `0x${out}`;
}

async function basePolkadotHelper(
  node_uri: string
  ): Promise<[BasePolkadot, ApiPromise]> {
    const provider = new WsProvider(node_uri);
    const api = await ApiPromise.create({ provider, types: runtimeTypes });
  
    const base = {
      async balance(
        address: EasyAddr
      ): Promise<BigNumber> {

        const res: any = await api.query.system.account(address);
        
        return new BigNumber(res['data']['free'].toString());
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
      sender: Signer,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await freezer.tx
        .send({ value: value.toString(), gasLimit: -1 }, to)
        .signAndSend(sender.sender, sender.options);
    },
    async unfreezeWrapped(
      sender: Signer,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await freezer.tx
        .withdrawWrapper({ value: 0, gasLimit: -1 }, to, value.toString())
        .signAndSend(sender.sender, sender.options);
    },
  };
};

function hasAddrField(ob: any): ob is { address: string } {
  return ob.hasOwnField('address') && typeof ob.address == "string";
}

export const polkadotPalletHelperFactory: (
  node_uri: string
) => Promise<PolkadotPalletHelper> = async (node_uri: string) => {
  const [base, api] = await basePolkadotHelper(node_uri);
  const keyring = new Keyring();
  const sudoSigner = keyring.createFromUri("//Alice", undefined, "sr25519");

  return {
    ...base,
    async transferNativeToForeign(
      sender: Signer,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await api.tx.freezer
        .send(to, value.toString())
        .signAndSend(sender.sender, sender.options);;
    },
    async unfreezeWrapped(
      sender: Signer,
      to: string,
      value: EasyBalance
    ): Promise<Hash> {
      return await api.tx.freezer
        .withdrawWrapped(to, value.toString())
        .signAndSend(sender.sender, sender.options);
    },
    async transferNftToForeign(
      sender: Signer,
      to: string,
      nft_id: H256
    ): Promise<Hash> {
      return await api.tx.freetoU8azer.sendNft(to, nft_id).signAndSend(sender.sender, sender.options);
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      nft_id: H256
    ): Promise<Hash> {
      return await api.tx.freezer.withdrawWrappedNft(to, nft_id).signAndSend(sender.sender, sender.options);
    },
    async mintNft(
      owner: Signer,
      info: Uint8Array
    ): Promise<void> {
        let addr;
        // "static typing :|"
        if (typeof owner.sender == "string") {
          addr = owner.sender;
        } else if (hasAddrField(owner.sender)) {
          addr = owner.sender.address;
        } else {
          addr = owner.sender.toString();
        }

        await api.tx.sudo.sudo(
          api.tx.nft.mint(addr, toHex(info))
        ).signAndSend(sudoSigner);
    },
    async listNft(
      owner: EasyAddr
    ): Promise<Map<string, string>> {
      const com = await api.query.nft.commoditiesForAccount(owner.toString());
      const c = com.toJSON() as NftInfo;
      return new Map(Object.entries(c));
    },
	async getLockedNft(
		hash: H256
	): Promise<Uint8Array | undefined> {
		const com = await api.query.nft.lockedCommodities(hash) as Option<Tuple>;
		if (com.isNone) {
			return undefined;
		}

		const [_owner, dat] = com.unwrap();
		return dat.toU8a();
	}
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
