"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const fakeERC721_json_1 = require("../fakeERC721.json");
const fakeERC1155_json_1 = require("../fakeERC1155.json");
const encoding_1 = require("validator/dist/encoding");
const js_base64_1 = require("js-base64");
/**
 * Create an object implementing cross chain utilities for a web3 chain
 *
 * @param provider  An ethers.js provider object
 * @param minter_addr  Address of the minter smart contract
 * @param minter_abi  ABI of the minter smart contract
 */
async function web3HelperFactory(provider, minter_addr, minter_abi, erc1155_addr) {
    const w3 = provider;
    const minter = new ethers_1.Contract(minter_addr, minter_abi, w3);
    const erc1155_abi = new utils_1.Interface(fakeERC1155_json_1.abi);
    const erc1155 = new ethers_1.Contract(erc1155_addr, erc1155_abi, w3);
    function signedMinter(signer) {
        return minter.connect(signer);
    }
    async function extractTxn(txr, _evName) {
        const receipt = await txr.wait();
        const log = receipt.logs.find((log) => log.address === minter.address);
        if (log === undefined) {
            throw Error("Couldn't extract action_id");
        }
        const evdat = minter_abi.parseLog(log);
        const action_id = evdat.args[0].toString();
        return [receipt, action_id];
    }
    return {
        async balance(address) {
            const bal = await w3.getBalance(address);
            // ethers BigNumber is not compatible with our bignumber
            return new bignumber_js_1.default(bal.toString());
        },
        async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce);
            return new bignumber_js_1.default(bal.toString());
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const bals = await erc1155.balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces);
            return new Map(bals.map((v, i) => [chain_nonces[i], new bignumber_js_1.default(v.toString())]));
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender)
                .freeze(chain_nonce, to, { value });
            return await extractTxn(res, 'Transfer');
        },
        async transferNftToForeign(sender, chain_nonce, to, id) {
            let txr;
            let ev;
            const calldata = Buffer.concat([
                Buffer.from((new Int32Array([0])).buffer),
                Buffer.from((new Int32Array([chain_nonce])).buffer).reverse(),
                Buffer.from(to, "utf-8")
            ]);
            if (id.contract_type == "ERC721") {
                ev = "TransferErc721";
                const erc = new ethers_1.Contract(id.contract, fakeERC721_json_1.abi, w3);
                txr = await erc.connect(sender)['safeTransferFrom(address,address,uint256,bytes)'](await sender.getAddress(), minter_addr, id.token, calldata);
            }
            else {
                ev = "TransferErc1155";
                const erc = new ethers_1.Contract(id.contract, erc1155_abi, w3);
                txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, ethers_1.BigNumber.from(1), calldata);
            }
            return await extractTxn(txr, ev);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender)
                .withdraw(chain_nonce, to, value);
            return await extractTxn(res, 'Unfreeze');
        },
        async unfreezeWrappedNft(sender, to, id) {
            const res = await signedMinter(sender)
                .withdraw_nft(to, id);
            return await extractTxn(res, 'UnfreezeNft');
        },
        async nftUri(info) {
            if (info.contract_type == "ERC721") {
                const erc = new ethers_1.Contract(info.contract, fakeERC721_json_1.abi, w3);
                return await erc.tokenURI(info.token);
            }
            else {
                const erc = new ethers_1.Contract(info.contract, erc1155_abi, w3);
                return await erc.uri(info.token);
            }
        },
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data);
            const packed = encoding_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8()
            };
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBRXJDLG1DQUE4RDtBQUU5RCw0Q0FBNkM7QUFDN0Msd0RBQXVEO0FBQ3ZELDBEQUF5RDtBQUN6RCxzREFBa0Q7QUFDbEQseUNBQW1DO0FBZ0NuQzs7Ozs7O0dBTUc7QUFDSSxLQUFLLFVBQVUsaUJBQWlCLENBQ3RDLFFBQWtCLEVBQ2YsV0FBbUIsRUFDbkIsVUFBcUIsRUFDeEIsWUFBb0I7SUFFakIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTVELE1BQU0sV0FBVyxHQUFHLElBQUksaUJBQVMsQ0FBQyxzQkFBVyxDQUFDLENBQUM7SUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekQsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVKLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBd0IsRUFBRSxPQUFlO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDdEIsTUFBTSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUMx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