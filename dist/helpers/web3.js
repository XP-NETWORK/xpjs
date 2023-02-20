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
hethers_1.hethers.providers.BaseProvider.prototype.getGasPrice = async () => {
    return ethers_1.BigNumber.from("1");
};
/**
 * Create an object implementing minimal utilities for a web3 chain
 *
 * @param provider An ethers.js provider object
 */
async function baseWeb3HelperFactory(provider, nonce) {
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
            const txm = await erc721
                .mint(uri, { gasLimit: 1000000 })
                .catch(async (e) => {
                if (nonce === 33) {
                    let tx;
                    while (!tx) {
                        tx = await provider.getTransaction(e["returnedHash"]);
                    }
                    return tx;
                }
                throw e;
            });
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
                gasLimit: "85000",
                customData,
            });
        },
        approve: async (umt, forAddr, _tok, txnUp, customData) => {
            const tx = await umt.populateTransaction.setApprovalForAll(forAddr, true, {
                gasLimit: "85000",
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
                gasLimit: "85000",
                customData,
                //@ts-ignore
            })).toLowerCase() == minterAddr.toLowerCase());
        },
        approve: async (umt, forAddr, tok, txnUp) => {
            const tryApprove = async (gasLimit = "85000") => {
                const tx = await umt.populateTransaction.approve(forAddr, tok, {
                    gasLimit,
                });
                await txnUp(tx);
                return await umt.signer.sendTransaction(tx);
            };
            try {
                return await tryApprove();
            }
            catch (e) {
                const msg = e.data?.message || e.message;
                if (msg.includes("code=CALL_EXCEPTION")) {
                    return await tryApprove("140000");
                }
                throw e;
            }
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
            const trackerGas = result?.rapidgaspricegwei || fast?.maxFee;
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
    //@ts-ignore
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
        const toApprove = params.nonce !== 0x1d
            ? minter_addr
            : id.native.uri.includes("herokuapp.com")
                ? params.minter_addr
                : params.erc721_addr;
        return await exports.NFT_METHOD_MAP[id.native.contractType].approved(erc, await signer.getAddress(), toApprove, id.native.tokenId, params.nonce === 0x1d ? {} : undefined);
    };
    const approveForMinter = async (id, sender, _txFees, gasPrice) => {
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const toApprove = params.nonce !== 0x1d
            ? minter_addr
            : id.native.uri.includes("herokuapp.com")
                ? params.minter_addr
                : params.erc721_addr;
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, toApprove, id.native.tokenId, txnUnderpricedPolyWorkaround, params.nonce === 0x1d ? {} : undefined, gasPrice);
        await receipt.wait();
        return receipt.hash;
    };
    const base = await baseWeb3HelperFactory(params.provider, params.nonce);
    return {
        ...base,
        XpNft: params.erc721_addr,
        XpNft1155: params.erc1155_addr,
        approveForMinter,
        getProvider: () => provider,
        async estimateValidateUnfreezeNft(_to, _id, _mW) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        getFeeMargin() {
            return params.feeMargin;
        },
        isApprovedForMinter,
        preTransfer: (s, id, fee, args) => approveForMinter(id, s, fee, args?.gasPrice),
        extractAction,
        async isContractAddress(address) {
            const code = await provider.getCode(address);
            return code !== "0x";
        },
        getNonce: () => params.nonce,
        async preTransferRawTxn(id, address, _value) {
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
                //const erc1155 = Erc1155Minter__factory.connect(contract!, provider)
                //erc1155.uri()
                return await erc721.tokenURI(tokenId).catch(() => "");
            }
            return "";
        },
        async unfreezeWrappedNftBatch(signer, chainNonce, to, nfts, txFees) {
            const tx = await minter
                .connect(signer)
                .populateTransaction.withdrawNftBatch(to, chainNonce, nfts.map((nft) => nft.native.tokenId), new Array(nfts.length).fill(1), nfts[0].native.contract, {
                value: ethers_1.BigNumber.from(txFees.toFixed(0)),
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
                value: ethers_1.BigNumber.from(txFees.toFixed(0)),
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith, gasLimit = undefined, gasPrice) {
            await approveForMinter(id, sender, txFees, gasPrice);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            // Chain is Hedera
            if (params.nonce === 0x1d) {
                id.native.tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                id.native.contract = params.erc721_addr;
            }
            const tx = await minter
                .connect(sender)
                .populateTransaction[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: ethers_1.BigNumber.from(txFees.toFixed(0)),
                gasLimit,
                gasPrice,
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
            else if (params.nonce === 33) {
                //@ts-ignore checked abeychain
                txHash = txr["returnedHash"] || txr.hash;
            }
            else {
                //@ts-ignore checked normal evm
                txHash = txr.hash;
            }
            await notifyValidator(
            //@ts-ignore
            txHash);
            if (params.nonce === 33) {
                return await provider.getTransaction(txHash);
            }
            return txr;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce, gasLimit = undefined, gasPrice) {
            await approveForMinter(id, sender, txFees, gasPrice);
            // Chain is Hedera
            if (params.nonce === 0x1d) {
                id.native.tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [ethers_1.BigNumber.from(id.collectionIdent), id.native.tokenId]);
                id.native.contract = params.erc721_addr;
            }
            const txn = await minter
                .connect(sender)
                .populateTransaction.withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: ethers_1.BigNumber.from(txFees.toFixed(0)),
                gasLimit,
                gasPrice,
            });
            await txnUnderpricedPolyWorkaround(txn);
            const res = await sender.sendTransaction(txn);
            console.log(res, "res");
            let txHash;
            if (params.nonce === 0x1d) {
                //@ts-ignore checked hedera
                txHash = res["transactionId"];
            }
            else if (params.nonce === 33) {
                //@ts-ignore checked abeychain
                txHash = res["returnedHash"] || res.hash;
            }
            else {
                //@ts-ignore checked normal evm
                txHash = res.hash;
            }
            await notifyValidator(txHash);
            if (params.nonce === 33) {
                return await provider.getTransaction(txHash);
            }
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
        },
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBY3JDLG1DQVNnQjtBQUVoQiwrREFNOEI7QUFDOUIsMEJBWVk7QUFHWixrREFBMEI7QUFDMUIsZ0RBQTZDO0FBNEM3QyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQXlERjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxD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