/**
 * Polkadot Implementation for cross chain traits
 * @module
 */
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { Callback, ISubmittableResult, RegistryTypes } from "@polkadot/types/types";
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
  GetLockedNft,
  WrappedBalanceCheck,
  BatchWrappedBalanceCheck,
  ConcurrentSendError,
  DecodeWrappedNft,
  WrappedNft,
  DecodeRawNft
} from "./chain";
import { AddressOrPair } from "@polkadot/api/types";
import { SignerOptions, SubmittableExtrinsic } from "@polkadot/api/submittable/types";
import {BTreeMap, Bytes, Option, Tuple} from "@polkadot/types";
import { NftPacked } from "validator/dist/encoding"

/**
 * Type of sender expected by this module
 * 
 * @param sender  Address of the sender, or a Keypair
 * @param options  Options for sigining this transaction. Mandatory if sender is an address
 */
export type Signer = {
  sender: AddressOrPair,
  options?: Partial<SignerOptions>
}

type EasyBalance = string | number | BigNumber;
type EasyAddr = string | LookupSource | Address;

type BasePolkadot = BalanceCheck<string, BigNumber>;

/**
 * identifier for tracking an action 
 */
type EventIdent = BigNumber;

export type PolkadotHelper = BasePolkadot &
  TransferForeign<Signer, string, EasyBalance, Hash, EventIdent> &
  UnfreezeForeign<Signer, string, EasyBalance, Hash, EventIdent>;

/**
 * Traits implemented by this module
 */
export type PolkadotPalletHelper = PolkadotHelper &
  WrappedBalanceCheck<EasyAddr, BigNumber> &
  BatchWrappedBalanceCheck<EasyAddr, BigNumber> &
  TransferNftForeign<Signer, string, H256, Hash, EventIdent> &
  UnfreezeForeignNft<Signer, string, H256, Hash, EventIdent> &
  MintNft<Signer, Uint8Array, void> &
  ListNft<EasyAddr, string, Uint8Array> &
  GetLockedNft<H256, Uint8Array> &
  DecodeWrappedNft<Uint8Array> &
  DecodeRawNft;


const LUT_HEX_4b = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
const LUT_HEX_8b = new Array(0x100);
for (let n = 0; n < 0x100; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xF]}${LUT_HEX_4b[n & 0xF]}`;
}
/**
 * @internal
 */
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

function hasAddrField(ob: any): ob is { address: string } {
  return ob.hasOwnField('address') && typeof ob.address == "string";
}

async function resolve_event_id<R extends ISubmittableResult>(ext: SubmittableExtrinsic<'promise', R>, filter: string, signer: AddressOrPair, options?: Partial<SignerOptions>): Promise<[Hash, EventIdent]> {
  let call: (cb: Callback<R>) => Promise<() => void>;
  if (options) {
	options.nonce = -1;
    call = async (cb: Callback<R>) => await ext.signAndSend(signer, options, cb);
  } else {
    call = async (cb: Callback<R>) => await ext.signAndSend(signer, { nonce: -1 }, cb);
  }

  const evP: Promise<[Hash, EventIdent]> = new Promise((res, rej) => {
    call(({ events, status }) => {
      if (!status.isInBlock) {
        return;
      }

      const ev = events.find(e => e.event.method == filter);
      if (ev === undefined) {
        rej();
        return;
      }

      const action_id = new BigNumber(ev.event.data[0].toString());
      const hash = status.asInBlock;

      res([hash, action_id]);
    })
  });

  try {
  	return await evP;
  } catch (e) {
	  if (e.message.contains("Priority is too low")) {
		  throw ConcurrentSendError();
	  }
	  throw e;
  }
}

/**
 * Create an object implementing Cross Chain utilities for Polkadot
 * 
 * @param node_uri URI of the polkadot node
 */
export const polkadotPalletHelperFactory: (
  node_uri: string
) => Promise<PolkadotPalletHelper> = async (node_uri: string) => {
  const [base, api] = await basePolkadotHelper(node_uri);
  const keyring = new Keyring();
  const sudoSigner = keyring.createFromUri("//Alice", undefined, "sr25519");
  const decoder = new TextDecoder();

  function nftListMapper([nft_id, data]: [H256, Bytes]): [string, Uint8Array] {
	  return [nft_id.toString(), data];
  }

  async function getLockedNft(
	hash: H256
  ): Promise<Uint8Array | undefined> {
	const com = await api.query.nft.lockedCommodities(hash) as Option<Tuple>;
	if (com.isNone) {
		return undefined;
	}

	const [_owner, dat] = com.unwrap();
	return dat as Bytes;
  }

  return {
    ...base,
	async balanceWrapped(
		address: EasyAddr,
		chain_nonce: number
	): Promise<BigNumber> {
		const res = await api.query.erc1155.balances(address, chain_nonce);
		return new BigNumber(res.toString())
	},
	async balanceWrappedBatch(
		address: EasyAddr,
		chain_nonces: number[]
	): Promise<Map<number, BigNumber>> {
		// Multi query with address, chain_nonce
		const res: Option<any>[] = await api.query.erc1155.balances.multi(chain_nonces.map(c => [address, c]));

		// Convert list of balances to [chain_nonce, balance]
		return new Map(res.map((b: Option<any>, i) => [chain_nonces[i], b.isSome ? new BigNumber(b.unwrap().toString()) : new BigNumber(0)]))
	},
    async transferNativeToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance
    ): Promise<[Hash, EventIdent]> {
      return await resolve_event_id(
        api.tx.freezer.send(chain_nonce, to, value.toString()),
        "TransferFrozen",
        sender.sender, sender.options
      );
    },
    async unfreezeWrapped(
      sender: Signer,
      chain_nonce: number,
      to: string,
      value: EasyBalance
    ): Promise<[Hash, EventIdent]> {
      return await resolve_event_id(
          api.tx.freezer.withdrawWrapped(chain_nonce, to, value.toString()),
          "UnfreezeWrapped",
          sender.sender, sender.options
      );
    },
    async transferNftToForeign(
      sender: Signer,
      chain_nonce: number,
      to: string,
      nft_id: H256
    ): Promise<[Hash, EventIdent]> {
      return await resolve_event_id(
        api.tx.freezer.sendNft(chain_nonce, to, nft_id),
        "TransferUniqueFrozen",
        sender.sender, sender.options
      );
    },
    async unfreezeWrappedNft(
      sender: Signer,
      to: string,
      nft_id: H256
    ): Promise<[Hash, EventIdent]> {
      return await resolve_event_id(
        api.tx.freezer.withdrawWrappedNft(to, nft_id),
        "UnfreezeUniqueWrapped",
        sender.sender, sender.options
      );
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
        ).signAndSend(sudoSigner, { nonce: -1 });
    },
    async listNft(
      owner: EasyAddr
    ): Promise<Map<string, Uint8Array>> {
      const com = await api.query.nft.commoditiesForAccount(owner.toString()) as Option<BTreeMap<H256, Bytes>>;
	  if (com.isNone) {
		  return new Map();
	  }
      const c = Array.from(com.unwrap()).map(nftListMapper);
      return new Map(c);
    },
	getLockedNft,
	decodeWrappedNft(
		raw_data: Uint8Array
	): WrappedNft {
		const packed = NftPacked.deserializeBinary(Uint8Array.from(raw_data));

		return {
			chain_nonce: packed.getChainNonce(),
			data: packed.getData_asU8()
		}
	},
	async decodeUrlFromRaw(
		data: Uint8Array
	): Promise<string> {
		const locked = await getLockedNft(data as H256);
		if (locked === undefined) {
			throw Error("not a locked nft");
		}

		return decoder.decode(locked.slice(-24));
	}
  };
};

const runtimeTypes: RegistryTypes = {
  ActionId: "u128",
  TokenId: "u64",
  CommodityId: "H256",
  CommodityInfo: "Bytes",
  NftId: "H256",
  NftInfo: "Bytes",
  Erc1155Balance: "Balance",
  Commodity: "(H256, Bytes)",
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
        call_data: "Bytes",
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
