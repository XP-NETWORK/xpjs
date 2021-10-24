"use strict";
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
const validator_1 = require("validator");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const js_base64_1 = require("js-base64");
function contractTypeFromNftKind(kind) {
    return kind === validator_1.NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
}
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
async function baseWeb3HelperFactory(provider) {
    const w3 = provider;
    return {
        async balance(address) {
            const bal = await w3.getBalance(address);
            // ethers BigNumber is not compatible with our bignumber
            return new bignumber_js_1.default(bal.toString());
        },
        async deployErc721(owner) {
            const factory = new xpnet_web3_contracts_1.UserNftMinter__factory(owner);
            const contract = await factory.deploy();
            return contract.address;
        },
        async mintNft(owner, { contract, uris }) {
            const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(contract, owner);
            const txm = await erc721.mint(uris[0]);
            return await txm.wait();
        },
    };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
async function web3HelperFactory(params) {
    const w3 = params.provider;
    const { minter_addr, provider, erc1155_addr } = params;
    const minter = xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, provider);
    const erc1155 = xpnet_web3_contracts_1.XPNet__factory.connect(erc1155_addr, provider);
    async function extractTxn(txr, _evName) {
        const receipt = await txr.wait();
        const log = receipt.logs.find((log) => log.address === minter.address);
        if (log === undefined) {
            throw Error("Couldn't extract action_id");
        }
        const evdat = minter.interface.parseLog(log);
        const action_id = evdat.args[0].toString();
        return [receipt, action_id];
    }
    async function nftUri(info) {
        if (info.contract_type == "ERC721") {
            const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(info.contract, w3);
            return await erc.tokenURI(info.token);
        }
        else {
            const erc = xpnet_web3_contracts_1.XPNet__factory.connect(info.contract, w3);
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
    const base = await baseWeb3HelperFactory(params.provider);
    return Object.assign(Object.assign({}, base), { async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce);
            return new bignumber_js_1.default(bal.toString());
        },
        isWrappedNft(nft) {
            return nft.contract === params.erc1155_addr;
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const bals = await erc1155.balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces);
            return new Map(bals.map((v, i) => [chain_nonces[i], new bignumber_js_1.default(v.toString())]));
        },
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            const val = ethers_1.BigNumber.from(value.toString());
            const totalVal = val.add(ethers_1.BigNumber.from(txFees.toString()));
            const res = await minter.connect(sender).freeze(chain_nonce, to, val, {
                value: totalVal,
            });
            return await extractTxn(res, "Transfer");
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(id.contract, sender);
            const ta = await erc.approve(minter.address, id.token);
            await ta.wait();
            const txr = await minter
                .connect(sender)
                .freezeErc721(id.contract, id.token, chain_nonce, to, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(txr, "TransferErc721");
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            const res = await minter
                .connect(sender)
                .withdraw(chain_nonce, to, value, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(res, "Unfreeze");
        },
        async unfreezeWrappedNft(sender, to, id, txFees) {
            const res = await minter.connect(sender).withdrawNft(to, id.toString(), {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(res, "UnfreezeNft");
        },
        nftUri,
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data);
            const packed = validator_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8(),
            };
        },
        async decodeUrlFromRaw(data) {
            const packed = validator_1.NftEthNative.deserializeBinary(data);
            const nft_info = {
                contract_type: contractTypeFromNftKind(packed.getNftKind()),
                contract: packed.getContractAddr(),
                token: ethers_1.BigNumber.from(packed.getId()),
            };
            return await nftUri(nft_info);
        },
        async estimateValidateTransferNft(to, nft) {
            // Protobuf is not deterministic, though perhaps we can approximate this statically
            const tokdat = new validator_1.NftEthNative();
            tokdat.setId(nft.token.toString());
            tokdat.setNftKind(1);
            tokdat.setContractAddr(nft.contract);
            const encoded = new validator_1.NftPacked();
            encoded.setChainNonce(0x1351);
            encoded.setData(tokdat.serializeBinary());
            const utx = await minter.populateTransaction.validateTransferNft(randomAction(), to, Buffer.from(encoded.serializeBinary()).toString("base64"));
            return await estimateGas(params.validators, utx);
        },
        async estimateValidateUnfreezeNft(to, nft_data) {
            const nft_dat = validator_1.NftEthNative.deserializeBinary(nft_data);
            const utx = await minter.populateTransaction.validateUnfreezeNft(randomAction(), to, ethers_1.BigNumber.from(nft_dat.getId().toString()), nft_dat.getContractAddr());
            return await estimateGas(params.validators, utx);
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBZXJDLG1DQUEwRTtBQU0xRSx5Q0FBb0Q7QUFDcEQsK0RBSThCO0FBQzlCLHlDQUFtQztBQWdGbkMsU0FBUyx1QkFBdUIsQ0FBQyxJQUFXO0lBQzFDLE9BQU8sSUFBSSxLQUFLLHdCQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDckUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUscUJBQXFCLENBQ3pDLFFBQWtCO0lBRWxCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLDZDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXhDLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FDWCxLQUFhLEVBQ2IsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFlO1lBRS9CLE1BQU0sTUFBTSxHQUFHLDZDQUFzQixDQUFDLE9BQU8sQ0FBQyxRQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFaEUsTUFBTSxH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