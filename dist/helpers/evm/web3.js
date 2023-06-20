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
const index_1 = require("xpnet-web3-contracts/dist/factories/UserStore.sol/index");
const index_2 = require("xpnet-web3-contracts/dist/factories/UserNFTStore721.sol/index");
//import { UserNFTStore as b } from "xpnet-web3-contracts/dist/UserNFTStore721.sol";
console.log(index_2.UserNFTStore__factory, "Minter__factory");
const __1 = require("../..");
const hethers_1 = require("@hashgraph/hethers");
const web3_utils_1 = require("./web3_utils");
hethers_1.hethers.providers.BaseProvider.prototype.getGasPrice = async () => {
    return ethers_1.BigNumber.from("1");
};
var BridgeTypes;
(function (BridgeTypes) {
    BridgeTypes[BridgeTypes["Minter"] = 0] = "Minter";
    BridgeTypes[BridgeTypes["UserStorage"] = 1] = "UserStorage";
})(BridgeTypes || (BridgeTypes = {}));
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
            const tx = await umt.populateTransaction.approve(forAddr, tok, {
                gasLimit: "85000",
            });
            await txnUp(tx);
            return await umt.signer.sendTransaction(tx);
        },
    },
};
async function web3HelperFactory(params) {
    const txnUnderpricedPolyWorkaround = params.nonce == 7 ? web3_utils_1.txnUnderpricedPolyWorkaround : () => Promise.resolve();
    const w3 = params.provider;
    const { minter_addr, provider } = params;
    function Bridge(type) {
        const defaultMinter = {
            address: "",
            contract: xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, provider),
        };
        const res = {
            [BridgeTypes.Minter]: defaultMinter,
            [BridgeTypes.UserStorage]: {
                getMinterForCollection: (isMapped) => async (signer, collection, type, fees) => {
                    if (!params.noWhitelist)
                        return defaultMinter;
                    try {
                        if (!type || !collection)
                            throw new Error(`That NFT has wrong format:${type}:${collection}`);
                        const contract = await params.notifier.getCollectionContract(collection, params.nonce);
                        if (contract)
                            return {
                                address: contract,
                                contract: index_1.UserNFTStore__factory.connect(contract, provider),
                            };
                        if (isMapped)
                            return defaultMinter;
                        if (!fees) {
                            console.log("calc deploy fees");
                            fees = (await estimateUserStoreDeploy(signer))
                                .div(1e18)
                                .integerValue()
                                .toNumber();
                        }
                        const tx = await payForDeployUserStore(signer, String(fees));
                        if (tx.status !== 1)
                            throw new Error("Faied to pay for deployment. Please come back later");
                        const address = await params.notifier.createCollectionContract(collection, params.nonce, type);
                        return {
                            address,
                            contract: index_1.UserNFTStore__factory.connect(address, provider),
                        };
                    }
                    catch (e) {
                        throw e;
                        //return defaultMinter;
                    }
                },
            },
        };
        //@ts-ignore
        return res[type];
    }
    const minter = Bridge(BridgeTypes.Minter).contract;
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
    const isApprovedForMinter = async (id, signer, toApprove) => {
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, signer);
        return await exports.NFT_METHOD_MAP[id.native.contractType].approved(erc, await signer.getAddress(), toApprove, id.native.tokenId, params.nonce === 0x1d ? {} : undefined);
    };
    const approveForMinter = async (id, sender, _txFees, gasPrice, toApprove) => {
        if (!toApprove) {
            toApprove =
                params.nonce !== 0x1d
                    ? minter_addr
                    : id.native.uri.includes("herokuapp.com")
                        ? params.minter_addr
                        : params.erc721_addr;
        }
        const isApproved = await isApprovedForMinter(id, sender, toApprove);
        if (isApproved) {
            return undefined;
        }
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, toApprove, id.native.tokenId, txnUnderpricedPolyWorkaround, params.nonce === 0x1d ? {} : undefined, gasPrice);
        await receipt.wait();
        return receipt.hash;
    };
    const base = await baseWeb3HelperFactory(params.provider, params.nonce);
    const payForDeployUserStore = async (signer, amount, address = "0x837B2eB764860B442C971F98f505E7c5f419edd7") => {
        const from = await signer.getAddress();
        const ethereum = params.nonce === __1.Chain.ETHEREUM;
        const tx = await signer.sendTransaction({
            from,
            to: ethereum ? "0xd84268df6915bFDdd1b639556101992EF0c97C9D" : address,
            value: ethers_1.ethers.utils.parseEther(amount),
            nonce: await provider.getTransactionCount(from, "latest"),
            gasLimit: ethers_1.ethers.utils.hexlify(100000),
            gasPrice: await provider.getGasPrice(),
        });
        return await tx.wait();
    };
    const getUserStore = async (signer, nft, fees, isMapped = false) => {
        if (!nft.uri)
            throw new Error("NFTs with no uri cannot be transferd by the Bridge");
        return await Bridge(BridgeTypes.UserStorage).getMinterForCollection(isMapped)(signer, nft.native.contract, nft.native.contractType, fees);
    };
    const estimateUserStoreDeploy = async (signer) => {
        const fees = new bignumber_js_1.default(0);
        const ethereum = params.nonce === __1.Chain.ETHEREUM;
        const gasPrice = ethereum
            ? ethers_1.ethers.utils.parseUnits("20", "gwei")
            : await provider.getGasPrice();
        const contract = new ethers_1.ethers.ContractFactory(index_2.UserNFTStore__factory.abi, index_2.UserNFTStore__factory.bytecode, signer);
        const gas = await provider.estimateGas(contract.getDeployTransaction(123, 42, "0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE", Buffer.from("0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE".slice(2), "hex").toString("hex")));
        const contractFee = gas.mul(gasPrice);
        return fees
            .plus(new bignumber_js_1.default(contractFee.toString()))
            .multipliedBy(1.5)
            .integerValue();
    };
    return {
        ...base,
        XpNft: params.erc721_addr,
        XpNft1155: params.erc1155_addr,
        getParams: () => params,
        approveForMinter,
        getProvider: () => provider,
        async checkUserStore(nft) {
            return params.notifier.getCollectionContract(nft.native.contract, params.nonce);
        },
        getUserStore,
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
            const isApproved = await isApprovedForMinter(id, new ethers_1.VoidSigner(address, provider), minter_addr);
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
            await notifyValidator(res.hash);
            return res;
        },
        async transferNftBatchToForeign(signer, chainNonce, to, nfts, mintWith, txFees, toParams) {
            const { contract: minter, address } = await getUserStore(signer, nfts[0], undefined, mintWith !== toParams.erc1155_addr);
            await approveForMinter(nfts[0], signer, txFees, undefined, address);
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
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith, gasLimit = undefined, gasPrice, toParams) {
            const { contract: minter, address } = await getUserStore(sender, id, undefined, mintWith !== toParams.erc721_addr);
            await approveForMinter(id, sender, txFees, gasPrice, address);
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
        estimateUserStoreDeploy,
        async estimateContractDeploy(toChain) {
            try {
                const gas = await provider.getGasPrice();
                const pro = toChain.getProvider();
                const wl = ["0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE"];
                const gk = 123;
                const gkx = 42;
                const factory = new ethers_1.ethers.ContractFactory(xpnet_web3_contracts_1.Minter__factory.abi, xpnet_web3_contracts_1.Minter__factory.bytecode);
                const estimateGas = await pro.estimateGas(factory.getDeployTransaction(gk, gkx, wl));
                const contractFee = gas.mul(estimateGas);
                const sum = new bignumber_js_1.default(contractFee.toString());
                return sum;
            }
            catch (error) {
                console.log(error.message);
                const gas = await provider.getGasPrice();
                return new bignumber_js_1.default(gas.mul(150000).toString());
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2V2bS93ZWIzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWlCckMsbUNBU2dCO0FBRWhCLCtEQU84QjtBQUU5QixtRkFBZ0c7QUFHaEcseUZBQWtJO0FBQ2xJLG9GQUFvRjtBQUVwRixPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUF3QixFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFFekQsNkJBYWU7QUFHZixnREFBNkM7QUFDN0MsNkNBQXFGO0FBNkNyRixpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQUlGLElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNkLGlEQUFNLENBQUE7SUFDTiwyREFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUEyRUQ7Ozs7R0FJRztBQUVJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0IsRUFDbEIsS0FBYTtJQUViLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLDZDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1B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