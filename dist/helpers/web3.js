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
    async function nftUri(contract, tokenId) {
        const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(contract, w3);
        return {
            uri: await erc.tokenURI(tokenId),
            chainId: params.nonce.toString(),
        };
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
    const isApprovedForMinter = async (id, erc) => {
        const approvedAddress = await erc.getApproved(id.native.tokenId);
        if (approvedAddress === id.native.contract) {
            return true;
        }
        return false;
    };
    const approveForMinter = async (id, sender, erc) => {
        const isApproved = await isApprovedForMinter(id, erc);
        if (isApproved) {
            return true;
        }
        const receipt = await erc.approve(await sender.getAddress(), id.native.tokenId);
        await receipt.wait();
        return true;
    };
    const base = await baseWeb3HelperFactory(params.provider);
    return Object.assign(Object.assign({}, base), { approveForMinter,
        isApprovedForMinter,
        async populateNft(nft) {
            return await nftUri(nft.native.contract, ethers_1.BigNumber.from(nft.native.tokenId));
        }, getNonce: () => params.nonce, async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce);
            return new bignumber_js_1.default(bal.toString());
        },
        isWrappedNft(nft) {
            return nft.native.contract === params.erc721_addr;
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
            const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(id.native.contract, sender);
            await approveForMinter(id, sender, erc);
            const txr = await minter
                .connect(sender)
                .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to, {
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
            const res = await minter
                .connect(sender)
                .withdrawNft(to, id.native.tokenId, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return await extractTxn(res, "UnfreezeNft");
        },
        decodeWrappedNft(nft) {
            const u8D = js_base64_1.Base64.toUint8Array(nft.native.uri);
            const packed = validator_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8(),
            };
        },
        async decodeNftFromRaw(data) {
            const packed = validator_1.NftEthNative.deserializeBinary(data);
            return {
                uri: "",
                native: {
                    uri: "",
                    contract: packed.getContractAddr(),
                    tokenId: packed.getId(),
                    owner: minter_addr,
                    chainId: params.nonce.toString(),
                },
            };
        },
        async estimateValidateTransferNft(to, nft) {
            const encoded = new validator_1.NftPacked();
            encoded.setChainNonce(0x1351);
            encoded.setData(nft);
            const utx = await minter.populateTransaction.validateTransferNft(randomAction(), to, Buffer.from(encoded.serializeBinary()).toString("base64"));
            return await estimateGas(params.validators, utx);
        },
        async estimateValidateUnfreezeNft(to, nft) {
            const utx = await minter.populateTransaction.validateUnfreezeNft(randomAction(), to, ethers_1.BigNumber.from(nft.native.tokenId.toString), nft.native.contract);
            return await estimateGas(params.validators, utx);
        },
        wrapNftForTransfer(nft) {
            // Protobuf is not deterministic, though perhaps we can approximate this statically
            const tokdat = new validator_1.NftEthNative();
            tokdat.setId(nft.native.tokenId);
            tokdat.setNftKind(1);
            tokdat.setContractAddr(nft.native.contract);
            return tokdat.serializeBinary();
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBZXJDLG1DQUtnQjtBQU1oQix5Q0FBb0Q7QUFDcEQsK0RBSzhCO0FBQzlCLHlDQUFtQztBQTBHbkM7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0I7SUFFbEIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUNYLEtBQWEsRUFDYixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWU7WUFFL0IsTUFBTSxNQUFNLEdBQUcsNkNBQXNCLENBQUMsT0FBTyxDQUFDLFFBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVoRSxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQ0YsQ0FBQztBQUNK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