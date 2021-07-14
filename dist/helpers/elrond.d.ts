import { Address, ISigner, Transaction } from "@elrondnetwork/erdjs";
import BigNumber from "bignumber.js";
import { Faucet, TransferForeign, TransferNftForeign, UnfreezeForeign, UnfreezeForeignNft } from "./chain";
declare type EasyBalance = string | number | BigNumber;
export declare type NftInfo = {
    token: string;
    nonce: number;
};
export declare type ElrondHelper = Faucet<string | Address, EasyBalance, Transaction> & TransferForeign<ISigner, string, EasyBalance, Transaction> & UnfreezeForeign<ISigner, string, EasyBalance, Transaction> & TransferNftForeign<ISigner, string, NftInfo, Transaction> & UnfreezeForeignNft<ISigner, string, number, Transaction>;
export declare const elrondHelperFactory: (node_uri: string, faucet_key: string, minter_address: string, middleware_uri: string, esdt: string, esdt_nft: string) => Promise<ElrondHelper>;
export {};
