import { AnyJson } from "@polkadot/types/types";
import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import { TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, MintNft, ListNft } from "./chain";
import { AddressOrPair } from "@polkadot/api/types";
import { SignerOptions } from "@polkadot/api/submittable/types";
declare type ConcreteJson = {
    readonly [index: string]: AnyJson;
};
declare type Signer = {
    sender: AddressOrPair;
    options?: Partial<SignerOptions>;
};
declare type EasyBalance = string | number | BigNumber;
declare type EasyAddr = string | LookupSource | Address;
declare type BasePolkadot = BalanceCheck<string, BigNumber>;
export declare type PolkadotHelper = BasePolkadot & TransferForeign<Signer, string, EasyBalance, Hash> & UnfreezeForeign<Signer, string, EasyBalance, Hash>;
export declare type PolkadotPalletHelper = PolkadotHelper & TransferNftForeign<Signer, string, H256, Hash> & UnfreezeForeignNft<Signer, string, H256, Hash> & MintNft<Signer, Uint8Array, void> & ListNft<EasyAddr, BigNumber>;
export declare const polkadotHelperFactory: (node_uri: string, freezer_addr: string, abi: ConcreteJson) => Promise<PolkadotHelper>;
export declare const polkadotPalletHelperFactory: (node_uri: string) => Promise<PolkadotPalletHelper>;
export {};
