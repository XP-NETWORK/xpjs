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
        async mintNft(owner, { contract, token, uri }) {
            const tok = ethers_1.BigNumber.from(token.toString());
            const erc721 = new ethers_1.Contract(contract, erc721_abi, owner);
            const txm = await erc721.mint(tok, uri);
            await txm.wait();
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
    const randomAction = () => ethers_1.BigNumber.from(Math.floor(Math.random() * (999) + (Number.MAX_SAFE_INTEGER - 1000)));
    async function estimateGas(addrs, utx) {
        let fee = ethers_1.BigNumber.from(0);
        for (const [i, addr] of addrs.entries()) {
            utx.from = addr;
            let tf = await w3.estimateGas(utx);
            if (i == addrs.length - 1)
                tf = tf.mul(1.1);
            fee = fee.add(tf);
        }
        return new bignumber_js_1.default(fee.toString());
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
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            const totalVal = ethers_1.BigNumber.from(value.toString()).add(ethers_1.BigNumber.from(txFees.toString()));
            const res = await signedMinter(sender).freeze(chain_nonce, to, { value: totalVal });
            return await extractTxn(res, "Transfer");
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            const erc = new ethers_1.Contract(id.contract, fakeERC721_json_1.abi, w3);
            const ta = await erc
                .connect(sender)
                .approve(await sender.getAddress(), id.token);
            await ta.wait();
            const txr = await minter.connect(sender)
                .freeze_erc721(id.contract, id.token, chain_nonce, to, { value: ethers_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(txr, "TransferErc721");
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            const res = await signedMinter(sender).withdraw(chain_nonce, to, value, { value: ethers_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(res, "Unfreeze");
        },
        async unfreezeWrappedNft(sender, to, id, txFees) {
            const res = await signedMinter(sender).withdraw_nft(to, id, { value: ethers_1.BigNumber.from(txFees.toString()) });
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
        },
        async estimateValidateTransferNft(validators, to, nft) {
            // Protobuf is not deterministic, though perhaps we can approximate this statically
            const tokdat = new encoding_1.NftEthNative();
            tokdat.setId(nft.token.toString());
            tokdat.setNftKind(1);
            tokdat.setContractAddr(nft.contract);
            const encoded = new encoding_1.NftPacked();
            encoded.setChainNonce(0x1351);
            encoded.setData(tokdat.serializeBinary());
            const utx = await minter.populateTransaction.validate_transfer_nft(randomAction(), to, Buffer.from(encoded.serializeBinary()).toString("base64"));
            return await estimateGas(validators, utx);
        },
        async estimateValidateUnfreezeNft(validators, to, nft_data) {
            const nft_dat = encoding_1.NftEthNative.deserializeBinary(nft_data);
            const utx = await minter.populateTransaction.validate_unfreeze_nft(randomAction(), to, ethers_1.BigNumber.from(nft_dat.getId().toString()), nft_dat.getContractAddr());
            return await estimateGas(validators, utx);
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWNyQyxtQ0FBcUc7QUFNckcsNENBQTZDO0FBQzdDLHdEQUF1RDtBQUN2RCwwREFBeUQ7QUFDekQsK0RBQWlEO0FBQ2pELHNEQUFrRTtBQUNsRSx5Q0FBbUM7QUFrRW5DLFNBQVMsdUJBQXVCLENBQUMsSUFBVztJQUMxQyxPQUFPLElBQUksS0FBSyx1QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQjtJQUVsQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBUyxDQUFDLHFCQUFVLENBQUMsQ0FBQztJQUU3QyxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyx3QkFBZSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMs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