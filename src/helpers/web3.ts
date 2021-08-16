// TODO: Catch Event IDs

import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign } from "./chain";
import { Contract, Signer, BigNumber as EthBN } from 'ethers';
import { TransactionResponse, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
import * as ERC721_abi from "../fakeERC721.json";
import { abi as ERC1155_abi } from "../fakeERC1155.json";

type EasyBalance = string | number | BigNumber;
export type EthNftInfo = {
	contract_type: "ERC721" | "ERC1155"
	contract: string,
	token: BigNumber
}

// TODO: Get action id properly
export type Web3Helper = BalanceCheck<string, BigNumber> &
    TransferForeign<Signer, string, EasyBalance, TransactionResponse, undefined> &
	TransferNftForeign<Signer, string, EthNftInfo, TransactionResponse, undefined> &
    UnfreezeForeign<Signer, string, EasyBalance, TransactionResponse, undefined> &
	UnfreezeForeignNft<Signer, string, BigNumber, TransactionResponse, undefined>; 


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
		async transferNftToForeign(sender: Signer, chain_nonce: number, to: string, id: EthNftInfo): Promise<[TransactionResponse, undefined]> {
			let txr;
			const calldata = Buffer.concat([
				Buffer.from((new Int32Array([0])).buffer), // 4 bytes padidng
				Buffer.from((new Int32Array([chain_nonce])).buffer).reverse(), // BE, gotta reverse
				Buffer.from(to, "utf-8")
			]);

			if (id.contract_type == "ERC721") {
				const erc = new Contract(id.contract, ERC721_abi, w3);
				txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, calldata);
			} else {
				const erc = new Contract(id.contract, ERC1155_abi, w3);
				txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, EthBN.from(1), calldata);
			}
			
			return [txr, undefined]
		},
        async unfreezeWrapped(sender: Signer, chain_nonce: number, to: string, value: EasyBalance): Promise<[TransactionResponse, undefined]> {
            return [await signedMinter(sender)
                .withdraw(chain_nonce, to, value), undefined];
        },
		async unfreezeWrappedNft(sender: Signer, to: string, id: BigNumber): Promise<[TransactionResponse, undefined]> {
			return [await signedMinter(sender)
				.withdraw_nft(to, id), undefined];
		}
    }
}
