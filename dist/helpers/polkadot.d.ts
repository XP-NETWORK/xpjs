import { Address, H256, Hash, LookupSource } from "@polkadot/types/interfaces";
import BigNumber from "bignumber.js";
import { TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, MintNft, ListNft, GetLockedNft, WrappedBalanceCheck, BatchWrappedBalanceCheck, DecodeWrappedNft, DecodeRawNft } from "./chain";
import { AddressOrPair } from "@polkadot/api/types";
import { SignerOptions } from "@polkadot/api/submittable/types";
/**
 * Type of sender expected by this module
 *
 * @param sender  Address of the sender, or a Keypair
 * @param options  Options for sigining this transaction. Mandatory if sender is an address
 */
export declare type Signer = {
    sender: AddressOrPair;
    options?: Partial<SignerOptions>;
};
declare type EasyBalance = string | number | BigNumber;
declare type EasyAddr = string | LookupSource | Address;
declare type BasePolkadot = BalanceCheck<string, BigNumber>;
/**
 * identifier for tracking an action
 */
declare type EventIdent = BigNumber;
export declare type PolkadotHelper = BasePolkadot & TransferForeign<Signer, string, EasyBalance, Hash, EventIdent> & UnfreezeForeign<Signer, string, EasyBalance, Hash, EventIdent>;
/**
 * Traits implemented by this module
 */
export declare type PolkadotPalletHelper = PolkadotHelper & WrappedBalanceCheck<EasyAddr, BigNumber> & BatchWrappedBalanceCheck<EasyAddr, BigNumber> & TransferNftForeign<Signer, string, EasyBalance, H256, Hash, EventIdent> & UnfreezeForeignNft<Signer, string, EasyBalance, H256, Hash, EventIdent> & MintNft<Signer, Uint8Array, void> & ListNft<EasyAddr, string, Uint8Array> & GetLockedNft<H256, Uint8Array> & DecodeWrappedNft<Uint8Array> & DecodeRawNft;
/**
 * @internal
 */
export declare function toHex(buffer: Uint8Array): string;
/**
 * Create an object implementing Cross Chain utilities for Polkadot
 *
 * @param node_uri URI of the polkadot node
 */
export declare const polkadotPalletHelperFactory: (node_uri: string) => Promise<PolkadotPalletHelper>;
export {};
