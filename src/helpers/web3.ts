// TODO: Catch Event IDs

import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, BalanceCheck } from "./chain";
import { Contract, Signer } from 'ethers';
import { TransactionResponse, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";

type EasyBalance = string | number | BigNumber;

export type Web3Helper = BalanceCheck<string, BigNumber> &
    TransferForeign<Signer, string, EasyBalance, TransactionResponse, undefined> &
    UnfreezeForeign<Signer, string, EasyBalance, TransactionResponse, undefined>;


export async function web3HelperFactory(
	provider: Provider,
    minter_addr: string,
    minter_abi: Interface
): Promise<Web3Helper> {
    const w3 = provider;

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
        async transferNativeToForeign(sender: Signer, chain_nonce: number, to: string, value: EasyBalance): Promise<[TransactionResponse, undefined]> {
            return [await signedMinter(sender)
                .freeze(chain_nonce, to, { value }), undefined];
        },
        async unfreezeWrapped(sender: Signer, chain_nonce: number, to: string, value: EasyBalance): Promise<[TransactionResponse, undefined]> {
            return [await signedMinter(sender)
                .withdraw(chain_nonce, to, value), undefined];
        }
    }
}
