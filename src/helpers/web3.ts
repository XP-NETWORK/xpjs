import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, BalanceCheck } from "./chain";
import { Contract, providers, Signer } from 'ethers';
import { TransactionResponse } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";

type EasyBalance = string | number | BigNumber;

export type Web3Helper = BalanceCheck<string, BigNumber> &
    TransferForeign<Signer, string, EasyBalance, TransactionResponse> &
    UnfreezeForeign<Signer, string, EasyBalance, TransactionResponse>;


export async function web3HelperFactory(
    node_uri: string,
    minter_addr: string,
    minter_abi: Interface
): Promise<Web3Helper> {
    const w3 = new providers.JsonRpcProvider(node_uri);
    await w3.ready;

    const minter = new Contract(minter_addr, minter_abi, w3);

    function signedMinter(signer: Signer): Contract {
        return minter.connect(signer);
    }

    return {
        async balance(address: string): Promise<BigNumber> {
            const bal = await w3.getBalance(address);

            // ethers BigNumber is not compatible with our bignumber
            return new BigNumber(bal.toString());
        },
        async transferNativeToForeign(sender: Signer, to: string, value: EasyBalance): Promise<TransactionResponse> {
            return await signedMinter(sender)
                .freeze(to, { value });
        },
        async unfreezeWrapped(sender: Signer, to: string, value: EasyBalance): Promise<TransactionResponse> {
            return await signedMinter(sender)
                .withdraw(to, value);
        }
    }
}