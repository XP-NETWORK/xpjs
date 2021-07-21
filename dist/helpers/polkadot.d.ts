import { AnyJson } from "@polkadot/types/types";
import { KeyringPair } from "@polkadot/keyring/types";
import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import { Faucet, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck } from "./chain";
declare type ConcreteJson = {
    readonly [index: string]: AnyJson;
};
declare type EasyBalance = string | number | BigNumber;
declare type EasyAddr = string | LookupSource | Address;
declare type BasePolkadot = Faucet<EasyAddr, EasyBalance, Hash> & BalanceCheck<string, BigNumber>;
export declare type PolkadotHelper = BasePolkadot & TransferForeign<KeyringPair, string, EasyBalance, Hash> & UnfreezeForeign<KeyringPair, string, EasyBalance, Hash>;
export declare type PolkadotPalletHelper = PolkadotHelper & TransferNftForeign<KeyringPair, string, H256, Hash> & UnfreezeForeignNft<KeyringPair, string, H256, Hash>;
export declare const polkadotHelperFactory: (node_uri: string, freezer_addr: string, abi: ConcreteJson) => Promise<PolkadotHelper>;
export declare const polkadotPalletHelperFactory: (node_uri: string) => Promise<PolkadotPalletHelper>;
export {};
