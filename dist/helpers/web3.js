"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = exports.baseWeb3HelperFactory = exports.NFT_METHOD_MAP = void 0;
/**
 * Web3 Implementation for cross chain traits
 * @module
 */
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
exports.NFT_METHOD_MAP = {
    "ERC1155": {
        "freeze": "freezeErc1155",
        "validateUnfreeze": "validateUnfreezeErc1155",
        umt: xpnet_web3_contracts_1.Erc1155Minter__factory,
        approved: (umt, sender, minterAddr) => {
            return umt.isApprovedForAll(sender, minterAddr);
        },
        approve: (umt, forAddr) => {
            return umt.setApprovalForAll(forAddr, true);
        }
    },
    "ERC721": {
        "freeze": "freezeErc721",
        "validateUnfreeze": "validateUnfreezeErc721",
        umt: xpnet_web3_contracts_1.UserNftMinter__factory,
        approved: async (umt, _, minterAddr, tok) => {
            return await umt.getApproved(tok) == minterAddr;
        },
        approve: (umt, forAddr, tok) => {
            return umt.approve(forAddr, tok);
        }
    }
};
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
async function web3HelperFactory(params) {
    const w3 = params.provider;
    const { minter_addr, provider, erc1155_addr } = params;
    const minter = xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, provider);
    const erc1155 = xpnet_web3_contracts_1.XPNet__factory.connect(erc1155_addr, provider);
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
        let fee = ethers_1.BigNumber.from(0);
        utx.from = addrs[addrs.length - 1];
        let tf = await w3.estimateGas(utx);
        for (let i = 0; i <= addrs.length; i += 1) {
            fee = fee.add(tf);
        }
        fee = fee.mul(await w3.getGasPrice());
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
    return Object.assign(Object.assign({}, base), { approveForMinter,
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
        },
        isWrappedNft(nft) {
            return (nft.native.contract.toLowerCase() === params.erc721_addr.toLowerCase());
        },
        async extractTxnStatus(txn) {
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
        async unfreezeWrappedNftTxn(chainNonce, to, id, txFees, _sender) {
            const res = await minter.populateTransaction.withdrawNft(to, chainNonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return res;
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
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            const val = ethers_1.BigNumber.from(value.toString());
            const totalVal = val.add(ethers_1.BigNumber.from(txFees.toString()));
            const res = await minter.connect(sender).freeze(chain_nonce, to, val, {
                value: totalVal,
            });
            return res;
        },
        async transferNftToForeignTxn(chain_nonce, to, id, mintWith, txFees, _sender) {
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const txr = await minter.populateTransaction[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return txr;
        },
        async transferNftToForeign(sender, chain_nonce, to, id, mintWith, txFees) {
            await approveForMinter(id, sender);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const txr = await minter
                .connect(sender)[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(txr.hash);
            return txr;
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            const res = await minter
                .connect(sender)
                .withdraw(chain_nonce, to, value, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            return res.hash;
        },
        async unfreezeWrappedNft(sender, chainNonce, to, id, txFees) {
            const res = await minter
                .connect(sender)
                .withdrawNft(to, chainNonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async estimateValidateTransferNft(to, nft, mintWIth) {
            const utx = await minter.populateTransaction.validateTransferNft(randomAction(), to, nft.native.tokenId, mintWIth, []);
            return await estimateGas(params.validators, utx);
        },
        async estimateValidateUnfreezeNft(to, nft) {
            const wrappedData = await axios_1.default.get(nft.uri);
            const unfreeze = exports.NFT_METHOD_MAP[nft.native.contractType].validateUnfreeze;
            const utx = await minter.populateTransaction[unfreeze](randomAction(), to, ethers_1.BigNumber.from(wrappedData.data.wrapped.tokenId), wrappedData.data.wrapped.contract);
            return await estimateGas(params.validators, utx);
        },
        validateAddress(adr) {
            return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
        },
        async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
            const res = await minter
                .connect(signer)
                .withdrawNftBatch(to, chainNonce, nfts.map(nft => nft.native.tokenId), new Array(nfts.length).fill(1), nfts[0].native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async transferNftBatchToForeign(signer, chainNonce, to, nfts, mintWith, txFees) {
            const res = await minter
                .connect(signer)
                .freezeErc1155Batch(nfts[0].native.contract, nfts.map(nft => nft.native.tokenId), new Array(nfts.length).fill(1), chainNonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await notifyValidator(res.hash);
            return res;
        },
        async estimateValidateTransferNftBatch(to, nfts, mintWith) {
            const utx = await minter.populateTransaction.validateTransferNftBatch(randomAction(), to, nfts.map(nft => nft.native.tokenId), mintWith, []);
            return await estimateGas(params.validators, utx);
        },
        async estimateValidateUnfreezeNftBatch(to, nfts) {
            const metadatas = await Promise.all(nfts.map(nft => {
                return axios_1.default.get(nft.uri);
            }));
            const ids = [];
            const contracts = [];
            for (const metadata of metadatas) {
                ids.push(metadata.data.wrapped.tokenId);
                contracts.push(metadata.data.wrapped.contract);
            }
            const utx = await minter.populateTransaction.validateUnfreezeErc1155Batch(randomAction(), to, ids, contracts);
            return await estimateGas(params.validators, utx);
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBWXJDLG1DQU9nQjtBQUVoQiwrREFPOEI7QUFDOUIsMEJBZ0JZO0FBRVosa0RBQTBCO0FBa0JiLFFBQUEsY0FBYyxHQUFpQjtJQUMxQyxTQUFTLEVBQUU7UUFDVCxRQUFRLEVBQUUsZUFBZTtRQUN6QixrQkFBa0IsRUFBRSx5QkFBeUI7UUFDN0MsR0FBRyxFQUFFLDZDQUFzQjtRQUMzQixRQUFRLEVBQUUsQ0FBQyxHQUFrQixFQUFFLE1BQWMsRUFBRSxVQUFrQixFQUFFLEVBQUU7WUFDbkUsT0FBTyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ2pELENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQyxHQUFrQixFQUFFLE9BQWUsRUFBRSxFQUFFO1lBQy9DLE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUM3QyxDQUFDO0tBQ0Y7SUFDRCxRQUFRLEVBQUU7UUFDUixRQUFRLEVBQUUsY0FBYztRQUN4QixrQkFBa0IsRUFBRSx3QkFBd0I7UUFDNUMsR0FBRyxFQUFFLDZDQUFzQjtRQUMzQixRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQWtCLEVBQUUsQ0FBUyxFQUFFLFVBQWtCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDakYsT0FBTyxNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDO1FBQ2xELENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQyxHQUFrQixFQUFFLE9BQWUsRUFBRSxHQUFXLEVBQUUsRUFBRTtZQUM1RCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7S0FDRjtD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