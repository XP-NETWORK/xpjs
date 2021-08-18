/**
 * Web3 Implementation for cross chain traits
 * @module
 */
import BigNumber from "bignumber.js";
import { TransferForeign, UnfreezeForeign, UnfreezeForeignNft, BalanceCheck, TransferNftForeign } from "./chain";
import { Contract, Signer, BigNumber as EthBN } from 'ethers';
import { TransactionReceipt, TransactionResponse, Provider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
import { abi as ERC721_abi } from "../fakeERC721.json";
import { abi as ERC1155_abi } from "../fakeERC1155.json";

type EasyBalance = string | number | EthBN;
/**
 * Information required to perform NFT transfers in this chain
 */
export type EthNftInfo = {
	contract_type: "ERC721" | "ERC1155"
	contract: string,
	token: EthBN
}

// TODO: Get action id properly
/**
 * Traits implemented by this module
 * 
 * WARN: Action identifier is broken for web3
 */
export type Web3Helper = BalanceCheck<string, BigNumber> &
    TransferForeign<Signer, string, EasyBalance, TransactionReceipt, string> &
	TransferNftForeign<Signer, string, EthNftInfo, TransactionReceipt, string> &
    UnfreezeForeign<Signer, string, EasyBalance, TransactionReceipt, string> &
	UnfreezeForeignNft<Signer, string, BigNumber, TransactionReceipt, string>; 


/**
 * Create an object implementing cross chain utilities for a web3 chain
 * 
 * @param provider  An ethers.js provider object
 * @param minter_addr  Address of the minter smart contract
 * @param minter_abi  ABI of the minter smart contract
 */
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

	async function extractTxn(txr: TransactionResponse, _evName: string): Promise<[TransactionReceipt, string]> {
		const receipt = await txr.wait();
		const log = receipt.logs.find((log) => log.address === minter.address);
		if (log === undefined) {
			throw Error("Couldn't extract action_id");
		}

		const evdat = minter_abi.parseLog(log);
		return evdat.args[0].toString();
	}

    return {
        async balance(address: string): Promise<BigNumber> {
            const bal = await w3.getBalance(address);

            // ethers BigNumber is not compatible with our bignumber
            return new BigNumber(bal.toString());
        },
        async transferNativeToForeign(sender: Signer, chain_nonce: number, to: string, value: EasyBalance): Promise<[TransactionReceipt, string]> {
			const res = await signedMinter(sender)
				.freeze(chain_nonce, to, { value });
			return await extractTxn(res, 'Transfer');
        },
		async transferNftToForeign(sender: Signer, chain_nonce: number, to: string, id: EthNftInfo): Promise<[TransactionReceipt, string]> {
			let txr;
			let ev;
			const calldata = Buffer.concat([
				Buffer.from((new Int32Array([0])).buffer), // 4 bytes padidng
				Buffer.from((new Int32Array([chain_nonce])).buffer).reverse(), // BE, gotta reverse
				Buffer.from(to, "utf-8")
			]);

			if (id.contract_type == "ERC721") {
				ev = "TransferErc721";
				const erc = new Contract(id.contract, ERC721_abi, w3);
				txr = await erc.connect(sender)['safeTransferFrom(address,address,uint256,bytes)'](await sender.getAddress(), minter_addr, id.token, calldata);
			} else {
				ev = "TransferErc1155";
				const erc = new Contract(id.contract, ERC1155_abi, w3);
				txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, EthBN.from(1), calldata);
			}
			
			return await extractTxn(txr, ev);
		},
        async unfreezeWrapped(sender: Signer, chain_nonce: number, to: string, value: EasyBalance): Promise<[TransactionReceipt, string]> {
            const res = await signedMinter(sender)
                .withdraw(chain_nonce, to, value);

			return await extractTxn(res, 'Unfreeze');
        },
		async unfreezeWrappedNft(sender: Signer, to: string, id: BigNumber): Promise<[TransactionReceipt, string]> {
			const res = await signedMinter(sender)
				.withdraw_nft(to, id);

			return await extractTxn(res, 'UnfreezeNft');
		}
    }
}
