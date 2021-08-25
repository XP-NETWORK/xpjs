"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const ERC1155_contract = __importStar(require("../XPNet.json"));
const encoding_1 = require("validator/dist/encoding");
const js_base64_1 = require("js-base64");
function contractTypeFromNftKind(kind) {
    return kind === encoding_1.NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
}
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
    async function nftUri(info) {
        if (info.contract_type == "ERC721") {
            const erc = new ethers_1.Contract(info.contract, fakeERC721_json_1.abi, w3);
            return await erc.tokenURI(info.token);
        }
        else {
            const erc = new ethers_1.Contract(info.contract, erc1155_abi, w3);
            return await erc.uri(info.token);
        }
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
        nftUri,
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data);
            const packed = encoding_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8()
            };
        },
        async decodeUrlFromRaw(data) {
            const packed = encoding_1.NftEthNative.deserializeBinary(data);
            const nft_info = {
                contract_type: contractTypeFromNftKind(packed.getNftKind()),
                contract: packed.getContractAddr(),
                token: ethers_1.BigNumber.from(packed.getId())
            };
            return await nftUri(nft_info);
        },
        async deployErc1155(owner) {
            const factory = ethers_1.ContractFactory.fromSolidity(ERC1155_contract, owner);
            const contract = await factory.deploy();
            return contract.address;
        },
        async mintNft(contract_owner, { contract, token, owner, uri }) {
            const erc1155 = new ethers_1.Contract(contract, erc1155_abi, contract_owner);
            await erc1155.mint(owner, ethers_1.BigNumber.from(token.toString()), 1);
            await erc1155.setURI(token, uri);
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQUVyQyxtQ0FBK0U7QUFFL0UsNENBQTZDO0FBQzdDLHdEQUF1RDtBQUN2RCwwREFBeUQ7QUFDekQsZ0VBQWtEO0FBQ2xELHNEQUFnRTtBQUNoRSx5Q0FBbUM7QUE0RG5DLFNBQVMsdUJBQXVCLENBQUMsSUFBVztJQUMzQyxPQUFPLElBQUksS0FBSyx1QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0FBQ25FLENBQUM7QUFHRDs7Ozs7O0dBTUc7QUFDSSxLQUFLLFVBQVUsaUJBQWlCLENBQ3RDLFFBQWtCLEVBQ2YsV0FBbUIsRUFDbkIsVUFBcUIsRUFDeEIsWUFBb0I7SUFFakIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTVELE1BQU0sV0FBVyxHQUFHLElBQUksaUJBQVMsQ0FBQyxzQkFBVyxDQUFDLENBQUM7SUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekQsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVKLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBd0IsRUFBRSxPQUFlO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxJ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