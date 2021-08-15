import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign } from "./chain";
import { Signer } from 'ethers';
import { TransactionResponse, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
declare type EasyBalance = string | number | BigNumber;
export declare type EthNftInfo = {
    contract_type: "ERC721" | "ERC1155";
    contract: string;
    token: BigNumber;
};
export declare type Web3Helper = BalanceCheck<string, BigNumber> & TransferForeign<Signer, string, EasyBalance, TransactionResponse, undefined> & TransferNftForeign<Signer, string, EthNftInfo, TransactionResponse, undefined> & UnfreezeForeign<Signer, string, EasyBalance, TransactionResponse, undefined> & UnfreezeForeignNft<Signer, string, BigNumber, TransactionResponse, undefined>;
export declare function web3HelperFactory(provider: Provider, minter_addr: string, minter_abi: Interface): Promise<Web3Helper>;
export {};
