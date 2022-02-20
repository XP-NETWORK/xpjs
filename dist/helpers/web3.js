"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = exports.NFT_METHOD_MAP = exports.baseWeb3HelperFactory = void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const chain_1 = require("./chain");
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
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
            const receipt = await txm.wait();
            return receipt.transactionHash;
        },
    };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
exports.NFT_METHOD_MAP = {
    ERC1155: {
        freeze: "freezeErc1155",
        validateUnfreeze: "validateUnfreezeErc1155",
        umt: xpnet_web3_contracts_1.Erc1155Minter__factory,
        approved: (umt, sender, minterAddr) => {
            return umt.isApprovedForAll(sender, minterAddr);
        },
        approve: (umt, forAddr) => {
            return umt.setApprovalForAll(forAddr, true);
        },
    },
    ERC721: {
        freeze: "freezeErc721",
        validateUnfreeze: "validateUnfreezeErc721",
        umt: xpnet_web3_contracts_1.UserNftMinter__factory,
        approved: async (umt, _, minterAddr, tok) => {
            return (await umt.getApproved(tok)) == minterAddr;
        },
        approve: (umt, forAddr, tok) => {
            return umt.approve(forAddr, tok);
        },
    },
};
async function web3HelperFactory(params) {
    const w3 = params.provider;
    const { minter_addr, provider, erc1155_addr } = params;
    const minter = xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, provider);
    const erc1155 = xpnet_web3_contracts_1.Erc1155Minter__factory.connect(erc1155_addr, provider);
    const event_middleware = axios_1.default.create({
        baseURL: params.middleware_uri,
        headers: {
            "Content-Type": "application/json",
        },
    });
    async function notifyValidator(hash) {
        await event_middleware.post("/tx/web3", {
            chain_nonce: params.nonce,
            tx_hash: hash,
        });
    }
    async function extractAction(txr) {
        const receipt = await txr.wait();
        const log = receipt.logs.find((log) => log.address === minter.address);
        if (log === undefined) {
            throw Error("Couldn't extract action_id");
        }
        const evdat = minter.interface.parseLog(log);
        const action_id = evdat.args[0].toString();
        return action_id;
    }
    const randomAction = () => ethers_1.BigNumber.from(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
    async function estimateGas(addrs, utx) {
        utx.from = addrs[0];
        let td = await w3.estimateGas(utx);
        const fee = td.mul(addrs.length + 1).mul(await w3.getGasPrice());
        return new bignumber_js_1.default(fee.toString());
    }
    const isApprovedForMinter = async (id, signer) => {
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, signer);
        return await exports.NFT_METHOD_MAP[id.native.contractType].approved(erc, await signer.getAddress(), minter_addr, id.native.tokenId);
    };
    const approveForMinter = async (id, sender) => {
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, minter_addr, id.native.tokenId);
        await receipt.wait();
        return receipt.hash;
    };
    const base = await baseWeb3HelperFactory(params.provider);
    return Object.assign(Object.assign({}, base), { XpNft: params.erc721_addr, approveForMinter, getProvider: () => provider, async estimateValidateUnfreezeNft(_to, _id, _mW) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        isApprovedForMinter, preTransfer: (s, id, _fee) => approveForMinter(id, s), extractAction, getNonce: () => params.nonce, async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce);
            return new bignumber_js_1.default(bal.toString());
        },
        async preTransferRawTxn(id, address, _value) {
            const isApproved = await isApprovedForMinter(id, new ethers_1.VoidSigner(address, provider));
            if (isApproved) {
                return undefined;
            }
            const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(id.native.contract, new ethers_1.VoidSigner(address, provider));
            const approvetxn = await erc.populateTransaction.approve(minter_addr, id.native.tokenId);
            return approvetxn;
        }, isWrappedNft: chain_1.isWrappedNft, async extractTxnStatus(txn) {
            const status = (await (await provider.getTransaction(txn)).wait()).status;
            if (status === undefined) {
                return __1.TransactionStatus.PENDING;
            }
            if (status === 1) {
                return __1.TransactionStatus.SUCCESS;
            }
            else if (status === 0) {
                return __1.TransactionStatus.FAILURE;
            }
            return __1.TransactionStatus.UNKNOWN;
        },
        async unfreezeWrappedNftTxn(to, id, txFees, _sender, nonce) {
            const res = await minter.populateTransaction.withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
            });
            return res;
        },
        async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
            const res = await minter.connect(signer).withdrawNftBatch(to, chainNonce, nfts.map((nft) => nft.native.tokenId), new Array(nfts.length).fill(1), nfts[0].native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async transferNftBatchToForeign(signer, chainNonce, to, nfts, mintWith, txFees) {
            const res = await minter.connect(signer).freezeErc1155Batch(nfts[0].native.contract, nfts.map((nft) => nft.native.tokenId), new Array(nfts.length).fill(1), chainNonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async estimateValidateTransferNftBatch(_to, nfts, _mintWith) {
            const gasPrice = await w3.getGasPrice();
            const gas = 40000 + 60000 * nfts.length;
            return new bignumber_js_1.default(gasPrice.mul(gas).toString());
        },
        async estimateValidateUnfreezeNftBatch(_to, nfts) {
            const gasPrice = await w3.getGasPrice();
            const gas = 40000 + 60000 * nfts.length;
            return new bignumber_js_1.default(gasPrice.mul(gas).toString());
        },
        createWallet(privateKey) {
            return new ethers_1.Wallet(privateKey, provider);
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const bals = await erc1155.balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces);
            return new Map(bals.map((v, i) => [chain_nonces[i], new bignumber_js_1.default(v.toString())]));
        },
        async mintRawTxn(nft, sender) {
            const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(nft.contract, new ethers_1.VoidSigner(sender));
            const txm = await erc721.populateTransaction.mint(nft.uris[0]);
            return txm;
        },
        async transferNftToForeignTxn(chain_nonce, to, id, txFees, _sender, mintWith) {
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const txr = await minter.populateTransaction[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
            });
            return txr;
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            await approveForMinter(id, sender);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const txr = await minter
                .connect(sender)[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
            });
            await notifyValidator(txr.hash);
            return txr;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const res = await minter
                .connect(sender)
                .withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        validateAddress(adr) {
            return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBQ3JDLG1DQWFpQjtBQUNqQixtQ0FTZ0I7QUFFaEIsK0RBTThCO0FBQzlCLDBCQWNZO0FBRVosa0RBQTBCO0FBNEgxQjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQjtJQUVsQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFFcEIsT0FBTztRQUNMLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtZQUMzQixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekMsd0RBQXdEO1lBQ3hELE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQWE7WUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSw2Q0FBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUV4QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQ1gsS0FBYSxFQUNiLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBZTtZQUUvQixNQUFNLE1BQU0sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWhFLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNq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