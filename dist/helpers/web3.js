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
        async mintNft(owner, { contract, uri }) {
            const erc721 = new ethers_1.Contract(contract, erc721_abi, owner);
            const txm = await erc721.mint(uri);
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
    const randomAction = () => ethers_1.BigNumber.from(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
    async function estimateGas(addrs, utx) {
        let fee = ethers_1.BigNumber.from(0);
        for (const [i, addr] of addrs.entries()) {
            utx.from = addr;
            let tf = await w3.estimateGas(utx);
            if (i == addrs.length - 1 && addrs.length != 1)
                tf = tf.mul(2);
            fee = fee.add(tf);
        }
        fee = fee.mul(await w3.getGasPrice());
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
            const res = await signedMinter(sender).freeze(chain_nonce, to, {
                value: totalVal,
            });
            return await extractTxn(res, "Transfer");
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            const erc = new ethers_1.Contract(id.contract, fakeERC721_json_1.abi, w3);
            const ta = await erc.connect(sender).approve(minter.address, id.token);
            await ta.wait();
            const txr = await minter
                .connect(sender)
                .freeze_erc721(id.contract, id.token, chain_nonce, to, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(txr, "TransferErc721");
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            const res = await signedMinter(sender).withdraw(chain_nonce, to, value, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(res, "Unfreeze");
        },
        async unfreezeWrappedNft(sender, to, id, txFees) {
            const res = await signedMinter(sender).withdraw_nft(to, id, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWNyQyxtQ0FNZ0I7QUFNaEIsNENBQTZDO0FBQzdDLHdEQUF1RDtBQUN2RCwwREFBeUQ7QUFDekQsK0RBQWlEO0FBQ2pELHNEQUFrRTtBQUNsRSx5Q0FBbUM7QUF1Rm5DLFNBQVMsdUJBQXVCLENBQUMsSUFBVztJQUMxQyxPQUFPLElBQUksS0FBSyx1QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQjtJQUVsQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBUyxDQUFDLHFCQUFVLENBQUMsQ0FBQztJQUU3QyxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyx3QkFBZSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckUsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQVk7WUFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFekQsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQTFCRCxzREEwQkM7QUFFRDs7Ozs7O0dBTUc7QUFDSSxLQUFLLFVBQVUsaUJBQWlCLENBQ3JDLFFBQWtCLEVBQ2xCLFdBQW1CLEVBQ25CLFVBQXFCLEVBQ3JCLFlBQW9CO0lBRXBCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV6RCxNQUFNLFdBQVcsR0FBRyxJQUFJLGlCQUFTLENBQUMsc0JBQVcsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQVEsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTVELFNBQVMsWUFBWSxDQUFDLE1BQWM7UUFDbEMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxLQUFLLFVBQVUsVUFBVSxDQUN2QixHQUF3QixFQUN4QixPQUFlO1FBRWYsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNyQixNQUFNLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELEtBQUssVUFBVSxNQUFNLENBQUMsSUFBZ0I7UUFDcEMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLFFBQVEsRUFBRTtZQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxxQkFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QzthQUFNO1lBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztJQUNILENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FDeEIsa0JBQUssQ0FBQyxJQUFJLENBQ1IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLENBQ25FLENBQUM7SUFFSixLQUFLLFVBQVUsV0FBVyxDQUN4QixLQUFlLEVBQ2YsR0FBeUI7UUFFekIsSUFBSSxHQUFHLEdBQUcsa0JBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFeEIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2QyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO1FBQ0QsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV0QyxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVuRCx1Q0FDSyxJQUFJLEtBQ1AsS0FBSyxDQUFDLGNBQWMsQ0FDbEIsT0FBZSxFQUNmLFdBQW1CO1lBRW5CLE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFMUQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxtQkFBbUIsQ0FDdkIsT0FBZSxFQUNmLFlBQXNCO1lBRXRCLE1BQU0sSUFBSSxHQUFZLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FDaEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQ3hDLFlBQVksQ0FDYixDQUFDO1lBRUYsT0FBTyxJQUFJLEdBQUcsQ0FDWixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDbkUsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsdUJBQXVCLENBQzNCLE1BQWMsRUFDZCxXQUFtQixFQUNuQixFQUFVLEVBQ1YsS0FBa0IsRUFDbEIsTUFBbUI7WUFFbkIsTUFBTSxRQUFRLEdBQUcsa0JBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUMvQyxrQkFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDOUIsQ0FBQztZQUNGLE1BQU0sR0FBRyxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFO2dCQUM3RCxLQUFLLEVBQUUsUUFBUTthQUNoQixDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFjLEVBQ2QsV0FBbUIsRUFDbkIsRUFBVSxFQUNWLEVBQWMsRUFDZCxNQUFtQjtZQUVuQixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxxQkFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdkUsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNO2lCQUNyQixPQUFPLENBQUMsTUFBTSxDQUFDO2lCQUNmLGFBQWEsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRTtnQkFDckQsS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNyQyxDQUFDLENBQUM7WUFFTCxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUNuQixNQUFjLEVBQ2QsV0FBbUIsRUFDbkIsRUFBVSxFQUNWLEtBQWtCLEVBQ2xCLE1BQW1CO1lBRW5CLE1BQU0sR0FBRyxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRTtnQkFDdEUsS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNyQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUN0QixNQUFjLEVBQ2QsRUFBVSxFQUNWLEVBQWEsRUFDYixNQUFtQjtZQUVuQixNQUFNLEdBQUcsR0FBRyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDMUQsS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNyQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sVUFBVSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsTUFBTTtRQUNOLGdCQUFnQixDQUFDLFFBQWdCO1lBQy9CLE1BQU0sR0FBRyxHQUFHLGtCQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sTUFBTSxHQUFHLG9CQUFTLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFaEQsT0FBTztnQkFDTCxXQUFXLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRTtnQkFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUU7YUFDNUIsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBZ0I7WUFDckMsTUFBTSxNQUFNLEdBQUcsdUJBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxNQUFNLFFBQVEsR0FBRztnQkFDZixhQUFhLEVBQUUsdUJBQXVCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUMzRCxRQUFRLEVBQUUsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQkFDbEMsS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNsQyxDQUFDO1lBRUYsT0FBTyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQixDQUMvQixVQUFvQixFQUNwQixFQUFVLEVBQ1YsR0FBZTtZQUVmLG1GQUFtRjtZQUNuRixNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFZLEVBQUUsQ0FBQztZQUNsQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sT0FBTyxHQUFHLElBQUksb0JBQVMsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUUxQyxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsQ0FDaEUsWUFBWSxFQUFFLEVBQ2QsRUFBRSxFQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUMxRCxDQUFDO1lBRUYsT0FBTyxNQUFNLFdBQVcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FDL0IsVUFBb0IsRUFDcEIsRUFBVSxFQUNWLFFBQW9CO1lBRXBCLE1BQU0sT0FBTyxHQUFHLHVCQUFZLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUMscUJBQXFCLENBQ2hFLFlBQVksRUFBRSxFQUNkLEVBQUUsRUFDRixrQkFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFDdEMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUMxQixDQUFDO1lBRUYsT0FBTyxNQUFNLFdBQVcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxJQUNEO0FBQ0osQ0FBQztBQWhORCw4Q0FnTkMifQ==