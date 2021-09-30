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
exports.web3HelperFactory = exports.baseWeb3HelperFactory = void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const fakeERC721_json_1 = require("../fakeERC721.json");
const fakeERC1155_json_1 = require("../fakeERC1155.json");
const ERC721_contract = __importStar(require("../XPNft.json"));
const encoding_1 = require("validator/dist/encoding");
const js_base64_1 = require("js-base64");
function contractTypeFromNftKind(kind) {
    return kind === encoding_1.NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
}
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
async function baseWeb3HelperFactory(provider) {
    const w3 = provider;
    const erc721_abi = new utils_1.Interface(fakeERC721_json_1.abi);
    return {
        async balance(address) {
            const bal = await w3.getBalance(address);
            // ethers BigNumber is not compatible with our bignumber
            return new bignumber_js_1.default(bal.toString());
        },
        async deployErc721(owner) {
            const factory = ethers_1.ContractFactory.fromSolidity(ERC721_contract, owner);
            const contract = await factory.deploy();
            return contract.address;
        },
        async mintNft(contract_owner, { contract, token, owner, uri }) {
            const tok = ethers_1.BigNumber.from(token.toString());
            const erc721 = new ethers_1.Contract(contract, erc721_abi, contract_owner);
            const txm = await erc721.mint(owner, tok);
            await txm.wait();
            const txt = await erc721.setURI(tok, uri);
            await txt.wait();
        },
    };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
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
    const base = await baseWeb3HelperFactory(provider);
    return Object.assign(Object.assign({}, base), { async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce);
            return new bignumber_js_1.default(bal.toString());
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const bals = await erc1155.balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces);
            return new Map(bals.map((v, i) => [chain_nonces[i], new bignumber_js_1.default(v.toString())]));
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender).freeze(chain_nonce, to, { value });
            return await extractTxn(res, "Transfer");
        },
        async transferNftToForeign(sender, chain_nonce, to, id) {
            let txr;
            let ev;
            const calldata = Buffer.concat([
                Buffer.from(new Int32Array([0]).buffer),
                Buffer.from(new Int32Array([chain_nonce]).buffer).reverse(),
                Buffer.from(to, "utf-8"),
            ]);
            if (id.contract_type == "ERC721") {
                ev = "TransferErc721";
                const erc = new ethers_1.Contract(id.contract, fakeERC721_json_1.abi, w3);
                txr = await erc
                    .connect(sender)["safeTransferFrom(address,address,uint256,bytes)"](await sender.getAddress(), minter_addr, id.token, calldata);
            }
            else {
                ev = "TransferErc1155";
                const erc = new ethers_1.Contract(id.contract, erc1155_abi, w3);
                txr = await erc
                    .connect(sender)
                    .safeTransferFrom(await sender.getAddress(), minter_addr, id.token, ethers_1.BigNumber.from(1), calldata);
            }
            return await extractTxn(txr, ev);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender).withdraw(chain_nonce, to, value);
            return await extractTxn(res, "Unfreeze");
        },
        async unfreezeWrappedNft(sender, to, id) {
            const res = await signedMinter(sender).withdraw_nft(to, id);
            return await extractTxn(res, "UnfreezeNft");
        },
        nftUri,
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data);
            const packed = encoding_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8(),
            };
        },
        async decodeUrlFromRaw(data) {
            const packed = encoding_1.NftEthNative.deserializeBinary(data);
            const nft_info = {
                contract_type: contractTypeFromNftKind(packed.getNftKind()),
                contract: packed.getContractAddr(),
                token: ethers_1.BigNumber.from(packed.getId()),
            };
            return await nftUri(nft_info);
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWNyQyxtQ0FBK0U7QUFNL0UsNENBQTZDO0FBQzdDLHdEQUF1RDtBQUN2RCwwREFBeUQ7QUFDekQsK0RBQWlEO0FBQ2pELHNEQUFrRTtBQUNsRSx5Q0FBbUM7QUFpRW5DLFNBQVMsdUJBQXVCLENBQUMsSUFBVztJQUMxQyxPQUFPLElBQUksS0FBSyx1QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQjtJQUVsQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBUyxDQUFDLHFCQUFVLENBQUMsQ0FBQztJQUU3QyxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyx3QkFBZSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMs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