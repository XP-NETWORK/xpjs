import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import { TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, MintNft, ListNft, GetLockedNft } from "./chain";
import { AddressOrPair } from "@polkadot/api/types";
import { SignerOptions } from "@polkadot/api/submittable/types";
declare type Signer = {
    sender: AddressOrPair;
    options?: Partial<SignerOptions>;
};
declare type EasyBalance = string | number | BigNumber;
declare type EasyAddr = string | LookupSource | Address;
declare type BasePolkadot = BalanceCheck<string, BigNumber>;
declare type EventIdent = BigNumber;
export declare type PolkadotHelper = BasePolkadot & TransferForeign<Signer, string, EasyBalance, Hash, EventIdent> & UnfreezeForeign<Signer, string, EasyBalance, Hash, EventIdent>;
export declare type PolkadotPalletHelper = PolkadotHelper & TransferNftForeign<Signer, string, H256, Hash, EventIdent> & UnfreezeForeignNft<Signer, string, H256, Hash, EventIdent> & MintNft<Signer, Uint8Array, void> & ListNft<EasyAddr, string, string> & GetLockedNft<H256, Uint8Array>;
export declare function toHex(buffer: Uint8Array): string;
export declare const polkadotPalletHelperFactory: (node_uri: string) => Promise<PolkadotPalletHelper>;
export {};
