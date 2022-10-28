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
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
const hethers_1 = require("@hashgraph/hethers");
const hts_abi_1 = require("./hedera/hts_abi");
hethers_1.hethers.providers.BaseProvider.prototype.getGasPrice = async () => {
    return ethers_1.BigNumber.from("1");
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
        async mintNftErc1155(owner, { contract }) {
            const erc1155 = xpnet_web3_contracts_1.Erc1155Minter__factory.connect(contract, owner);
            const tx = await erc1155.mintNft(await owner.getAddress());
            return tx;
        },
        async mintNft(owner, { contract, uri }) {
            const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(contract, owner);
            const txm = await erc721.mint(uri, { gasLimit: 1000000 });
            return txm;
        },
    };
}
exports.baseWeb3HelperFactory = baseWeb3HelperFactory;
exports.NFT_METHOD_MAP = {
    ERC1155: {
        freeze: "freezeErc1155",
        validateUnfreeze: "validateUnfreezeErc1155",
        umt: xpnet_web3_contracts_1.Erc1155Minter__factory,
        approved: (umt, sender, minterAddr, _tok, customData) => {
            return umt.isApprovedForAll(sender, minterAddr, {
                gasLimit: "1000000",
                customData,
            });
        },
        approve: async (umt, forAddr, _tok, txnUp, customData) => {
            const tx = await umt.populateTransaction.setApprovalForAll(forAddr, true, {
                gasLimit: "1000000",
                customData,
            });
            await txnUp(tx);
            return await umt.signer.sendTransaction(tx);
        },
    },
    ERC721: {
        freeze: "freezeErc721",
        validateUnfreeze: "validateUnfreezeErc721",
        umt: xpnet_web3_contracts_1.UserNftMinter__factory,
        approved: async (umt, _, minterAddr, tok, customData) => {
            return ((await umt.getApproved(tok, {
                gasLimit: "1000000",
                customData,
                //@ts-ignore
            })).toLowerCase() == minterAddr.toLowerCase());
        },
        approve: async (umt, forAddr, tok, txnUp) => {
            const tx = await umt.populateTransaction.approve(forAddr, tok, {
                gasLimit: "100000",
            });
            await txnUp(tx);
            return await umt.signer.sendTransaction(tx);
        },
    },
};
async function web3HelperFactory(params) {
    const txnUnderpricedPolyWorkaround = params.nonce == 7
        ? async (utx) => {
            const res = await axios_1.default
                .get("https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata")
                .catch(async () => {
                return await axios_1.default.get("https://gasstation-mainnet.matic.network/v2");
            });
            const { result, fast } = res.data;
            const trackerGas = (result === null || result === void 0 ? void 0 : result.rapidgaspricegwei) || (fast === null || fast === void 0 ? void 0 : fast.maxFee);
            if (trackerGas) {
                const sixtyGwei = ethers_1.ethers.utils.parseUnits(Math.ceil(trackerGas).toString(), "gwei");
                utx.maxFeePerGas = sixtyGwei;
                utx.maxPriorityFeePerGas = sixtyGwei;
            }
        }
        : () => Promise.resolve();
    const w3 = params.provider;
    const { minter_addr, provider } = params;
    const minter = xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, provider);
    async function notifyValidator(fromHash, actionId, type, toChain, txFees, senderAddress, targetAddress, nftUri, tokenId, contract) {
        await params.notifier.notifyWeb3(params.nonce, fromHash, actionId, type, toChain, txFees, senderAddress, targetAddress, nftUri, tokenId, contract);
    }
    async function getTransaction(hash) {
        let trx;
        let fails = 0;
        while (!trx && fails < 7) {
            trx = await provider.getTransaction(hash);
            await new Promise((resolve) => setTimeout(() => resolve("wait"), 5000 + fails * 2));
            fails++;
        }
        return trx;
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
    const isApprovedForMinter = async (id, signer) => {
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, signer);
        return await exports.NFT_METHOD_MAP[id.native.contractType].approved(erc, await signer.getAddress(), minter_addr, id.native.tokenId, params.nonce === 0x1d ? {} : undefined);
    };
    const approveForMinter = async (id, sender) => {
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, minter_addr, id.native.tokenId, txnUnderpricedPolyWorkaround, params.nonce === 0x1d ? {} : undefined);
        await receipt.wait();
        return receipt.hash;
    };
    const isApprovedForHedera = async (id, signer) => {
        const htsFactory = new hethers_1.ContractFactory(hts_abi_1.HEDERA_TOKEN_SERVICE_ABI, "0x", signer);
        const hts = htsFactory.attach("0x0000000000000000000000000000000000000167");
        const [, approvedAddress] = await hts.getApproved(id.native.contract, id.native.tokenId);
        const toApprove = id.uri.includes("xp.network")
            ? params.erc721_addr
            : params.minter_addr;
        return approvedAddress === toApprove;
    };
    const approveForHedera = async (id, sender) => {
        if (params.nonce !== __1.Chain.HEDERA)
            throw new Error(`Used Hedera Specific Function for Non Hedera Chain`);
        if (await isApprovedForHedera(id, sender))
            return undefined;
        const htsFactory = new hethers_1.ContractFactory(hts_abi_1.HEDERA_TOKEN_SERVICE_ABI, "0x", sender);
        const hts = htsFactory.attach("0x0000000000000000000000000000000000000167");
        const toApprove = id.uri.includes("xp.network")
            ? params.erc721_addr
            : params.minter_addr;
        const receipt = await hts.functions.approveNFT(id.native.contract, toApprove, id.native.tokenId);
        return receipt;
    };
    const base = await baseWeb3HelperFactory(params.provider);
    return Object.assign(Object.assign({}, base), { XpNft: params.erc721_addr, XpNft1155: params.erc1155_addr, approveForMinter, getProvider: () => provider, async estimateValidateUnfreezeNft(_to, _id, _mW) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        getFeeMargin() {
            return params.feeMargin;
        }, isApprovedForMinter: params.nonce === __1.Chain.HEDERA ? isApprovedForHedera : isApprovedForMinter, preTransfer: (s, id, _fee) => params.nonce === __1.Chain.HEDERA
            ? approveForHedera(id, s)
            : approveForMinter(id, s), extractAction,
        async isContractAddress(address) {
            const code = await provider.getCode(address);
            return code !== "0x";
        }, getNonce: () => params.nonce, async preTransferRawTxn(id, address, _value) {
            const isApproved = await isApprovedForMinter(id, new ethers_1.VoidSigner(address, provider));
            if (isApproved) {
                return undefined;
            }
            const erc = xpnet_web3_contracts_1.UserNftMinter__factory.connect(id.native.contract, new ethers_1.VoidSigner(address, provider));
            const approvetxn = await erc.populateTransaction.approve(minter_addr, id.native.tokenId);
            return approvetxn;
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
        async getTokenURI(contract, tokenId) {
            if (ethers_1.ethers.utils.isAddress(contract) && tokenId) {
                const erc721 = xpnet_web3_contracts_1.UserNftMinter__factory.connect(contract, provider);
                return await erc721.tokenURI(tokenId).catch(() => "");
            }
            return "";
        },
        async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
            const tx = await minter
                .connect(signer)
                .populateTransaction.withdrawNftBatch(to, chainNonce, nfts.map((nft) => nft.native.tokenId), new Array(nfts.length).fill(1), nfts[0].native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await txnUnderpricedPolyWorkaround(tx);
            const res = await signer.sendTransaction(tx);
            // await notifyValidator(
            //   res.hash,
            //   await extractAction(res),
            //   "Unfreeze",
            //   chainNonce.toString(),
            //   txFees.toString(),
            //   await signer.getAddress(),
            //   to,
            //   res.data
            // );
            await notifyValidator(res.hash);
            return res;
        },
        async transferNftBatchToForeign(signer, chainNonce, to, nfts, mintWith, txFees) {
            const tx = await minter
                .connect(signer)
                .populateTransaction.freezeErc1155Batch(nfts[0].native.contract, nfts.map((nft) => nft.native.tokenId), new Array(nfts.length).fill(1), chainNonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString()),
            });
            await txnUnderpricedPolyWorkaround(tx);
            const res = await signer.sendTransaction(tx);
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith, gasLimit = undefined) {
            await approveForMinter(id, sender);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const tx = await minter
                .connect(sender)
                .populateTransaction[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
                gasLimit,
            });
            await txnUnderpricedPolyWorkaround(tx);
            const txr = await sender
                .sendTransaction(tx)
                .catch((e) => {
                if (params.nonce === 33) {
                    return e;
                }
                else
                    throw e;
            });
            let txHash;
            if (params.nonce === 0x1d) {
                //@ts-ignore checked hedera
                txHash = txr["transactionId"];
            }
            if (params.nonce === 33) {
                //@ts-ignore checked abeychain
                txHash = txr["returnedHash"] || txr.hash;
            }
            else {
                //@ts-ignore checked normal evm
                txHash = txr.hash;
            }
            await notifyValidator(
            //@ts-ignore
            txHash, await extractAction(await getTransaction(txHash)), "Transfer", chain_nonce, txFees.toString(), await sender.getAddress(), to, id.uri, id.native.tokenId, id.native.contract);
            return params.nonce === 33
                ? await provider.getTransaction(txHash)
                : txr;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            const txn = await minter
                .connect(sender)
                .populateTransaction.withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toString(10)),
            });
            await txnUnderpricedPolyWorkaround(txn);
            const res = await sender.sendTransaction(txn);
            await notifyValidator(res.hash, await extractAction(res), "Unfreeze", Number(nonce), txFees.toString(), await sender.getAddress(), to, id.uri, id.native.tokenId, id.native.contract);
            return res;
        },
        async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        validateAddress(adr) {
            return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
        },
        isNftWhitelisted(nft) {
            return minter.nftWhitelist(nft.native.contract);
        } });
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBY3JDLG1DQVNnQjtBQUVoQiwrREFNOEI7QUFDOUIsMEJBYVk7QUFHWixrREFBMEI7QUFDMUIsZ0RBQThEO0FBQzlELDhDQUE0RDtBQXdDNUQsaUJBQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDaEUsT0FBTyxrQkFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7QUF5REY7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0I7SUFFbEIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FB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