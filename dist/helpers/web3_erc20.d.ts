import { Provider } from "@ethersproject/providers";
import { BaseWeb3Helper, Web3Helper, Web3Params } from "..";
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
export declare function baseWeb3HelperFactory(
  provider: Provider
): Promise<BaseWeb3Helper>;
export declare type Web3ERC20Params = Web3Params & {
  paymentTokenAddress: string;
};
export declare function web3ERC20HelperFactory(
  params: Web3ERC20Params
): Promise<Web3Helper>;
//# sourceMappingURL=web3_erc20.d.ts.map
