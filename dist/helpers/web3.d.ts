import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, BalanceCheck } from "./chain";
import { Signer } from 'ethers';
import { TransactionResponse, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
declare type EasyBalance = string | number | BigNumber;
export declare type Web3Helper = BalanceCheck<string, BigNumber> & TransferForeign<Signer, string, EasyBalance, TransactionResponse> & UnfreezeForeign<Signer, string, EasyBalance, TransactionResponse>;
export declare function web3HelperFactory(provider: Provider, minter_addr: string, minter_abi: Interface): Promise<Web3Helper>;
export {};
