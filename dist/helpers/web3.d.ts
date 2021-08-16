import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign } from "./chain";
import { Signer, BigNumber as EthBN } from 'ethers';
import { TransactionReceipt, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
declare type EasyBalance = string | number | EthBN;
export declare type EthNftInfo = {
    contract_type: "ERC721" | "ERC1155";
    contract: string;
    token: EthBN;
};
export declare type Web3Helper = BalanceCheck<string, BigNumber> & TransferForeign<Signer, string, EasyBalance, TransactionReceipt, string> & TransferNftForeign<Signer, string, EthNftInfo, TransactionReceipt, string> & UnfreezeForeign<Signer, string, EasyBalance, TransactionReceipt, string> & UnfreezeForeignNft<Signer, string, BigNumber, TransactionReceipt, string>;
export declare function web3HelperFactory(provider: Provider, minter_addr: string, minter_abi: Interface): Promise<Web3Helper>;
export {};
