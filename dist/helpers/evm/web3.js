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
                .mint(uri, {
                gasLimit: 1000000,
                gasPrice: await provider.getGasPrice(),
            })
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
        approve: async (umt, forAddr, _tok, txnUp, customData, overrides) => {
            const tx = await umt.populateTransaction.setApprovalForAll(forAddr, true, {
                gasLimit: overrides?.gasLimit || "500000",
                gasPrice: overrides?.gasPrice,
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
        approve: async (umt, forAddr, tok, txnUp, _customData, overrides) => {
            const tx = await umt.populateTransaction.approve(forAddr, tok, {
                gasLimit: overrides?.gasLimit || "1000000",
                gasPrice: overrides?.gasPrice,
            });
            await txnUp(tx);
            return await umt.signer.sendTransaction(tx);
        },
    },
};
async function web3HelperFactory(params) {
    const txnUnderpricedPolyWorkaround = params.nonce == 7 ? web3_utils_1.txnUnderpricedPolyWorkaround : () => Promise.resolve();
    const customData = () => {
        if (params.nonce === 0x1d) {
            return { usingContractAlias: true };
        }
        else {
            return undefined;
        }
    };
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
                            if (params.nonce === 0x1d) {
                                fees = new bignumber_js_1.default("500000000000").toNumber();
                                console.log(fees);
                            }
                            else {
                                fees = (await estimateUserStoreDeploy(signer))
                                    .div(1e18)
                                    .integerValue()
                                    .toNumber();
                            }
                        }
                        const tx = await payForDeployUserStore(signer, String(fees));
                        if (tx.status !== 1)
                            throw new Error("Faied to pay for deployment. Please come back later");
                        console.log(collection);
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
    const approveForMinter = async (id, sender, _txFees, overrides, toApprove) => {
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
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, toApprove, id.native.tokenId, txnUnderpricedPolyWorkaround, params.nonce === 0x1d ? {} : undefined, overrides);
        await receipt.wait();
        return receipt.hash;
    };
    const base = await baseWeb3HelperFactory(params.provider, params.nonce);
    const payForDeployUserStore = async (signer, amount, address = "0x837B2eB764860B442C971F98f505E7c5f419edd7") => {
        const from = await signer.getAddress();
        //const ethereum = params.nonce === Chain.ETHEREUM;
        const tx = await signer.sendTransaction({
            from,
            to: /*ethereum ? "0xd84268df6915bFDdd1b639556101992EF0c97C9D" :*/ address,
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
        //const ethereum = params.nonce === Chain.ETHEREUM;
        const gasPrice = /* ethereum
      ? ethers.utils.parseUnits("20", "gwei")
      : */ await provider.getGasPrice();
        const contract = new ethers_1.ethers.ContractFactory(index_2.UserNFTStore__factory.abi, index_2.UserNFTStore__factory.bytecode, signer);
        const gas = await provider.estimateGas(contract.getDeployTransaction(123, 42, "0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE", Buffer.from("0x47Bf0dae6e92e49a3c95e5b0c71422891D5cd4FE".slice(2), "hex").toString("hex")));
        const contractFee = gas.mul(gasPrice);
        return fees
            .plus(new bignumber_js_1.default(contractFee.toString()))
            .multipliedBy(1.1)
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
        preTransfer: (s, id, fee, args) => approveForMinter(id, s, fee, args?.overrides),
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
            const status = (await (await provider.getTransaction(txn)).wait())
                .status;
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
            await approveForMinter(id, sender, txFees, { gasPrice }, address);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            // Chain is Hedera
            if (params.nonce === 0x1d) {
                id.native.tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                id.native.contract = params.erc721_addr;
            }
            const tx = await minter
                .connect(sender)
                .populateTransaction[method](id.native.contract, id.native.tokenId, chain_nonce, to, mintWith, {
                value: params.nonce === 0x1d
                    ? ethers_1.BigNumber.from("50")
                    : txFees.toFixed(0),
                gasLimit,
                gasPrice,
                customData: customData(),
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
                const waited = await txr.wait();
                //@ts-ignore checked hedera
                txHash = waited["transactionHash"];
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
            await approveForMinter(id, sender, txFees, { gasPrice });
            // Chain is Hedera
            if (params.nonce === 0x1d) {
                id.native.tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [ethers_1.BigNumber.from(id.collectionIdent), id.native.tokenId]);
                id.native.contract = params.erc721_addr;
            }
            const txn = await minter
                .connect(sender)
                .populateTransaction.withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: params.nonce === 0x1d
                    ? ethers_1.BigNumber.from("50")
                    : txFees.toFixed(0),
                gasLimit,
                gasPrice,
                customData: customData(),
            });
            await txnUnderpricedPolyWorkaround(txn);
            const res = await sender.sendTransaction(txn);
            console.log(res, "res");
            let txHash;
            if (params.nonce === 0x1d) {
                //@ts-ignore checked hedera
                const waited = await txr.wait();
                //@ts-ignore checked hedera
                txHash = waited["transactionHash"];
            }
            else if (params.nonce === 33) {
                //@ts-ignore checked abeychain
                txHash = txr["returnedHash"] || txr.hash;
            }
            else {
                //@ts-ignore checked normal evm
                txHash = txr.hash;
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
        async estimateContractDeploy() {
            try {
                const gasPrice = await provider.getGasPrice();
                const factory = new ethers_1.ethers.ContractFactory(xpnet_web3_contracts_1.UserNftMinter__factory.abi, xpnet_web3_contracts_1.UserNftMinter__factory.bytecode);
                const gas = await provider.estimateGas(factory.getDeployTransaction());
                const contractFee = gasPrice.mul(gas);
                return new bignumber_js_1.default(contractFee.toString());
            }
            catch (error) {
                console.log(error.message);
                const gasPrice = await provider.getGasPrice();
                return new bignumber_js_1.default(gasPrice.mul(150000).toString());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2V2bS93ZWIzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWlCckMsbUNBU2dCO0FBRWhCLCtEQU84QjtBQUU5QixtRkFBZ0c7QUFHaEcseUZBQWtJO0FBQ2xJLG9GQUFvRjtBQUVwRiw2QkFZZTtBQUdmLGdEQUE2QztBQUM3Qyw2Q0FBcUY7QUE2Q3JGLGlCQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQzlELE9BQU8sa0JBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBSUYsSUFBSyxXQUdKO0FBSEQsV0FBSyxXQUFXO0lBQ1osaURBQU0sQ0FBQTtJQUNOLDJEQUFXLENBQUE7QUFDZixDQUFDLEVBSEksV0FBVyxLQUFYLFdBQVcsUUFHZjtBQThFRDs7OztHQUlHO0FBRUksS0FBSyxVQUFVLHFCQUFxQixDQUN2QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM1QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRTNELE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssQ0FBQyxPQUFPLENBQ1QsS0FBYSxFQUNiLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBWTtZQUUzQixNQUFNLE1BQU0sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQUMsUUFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTTtpQkFDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUCxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDLFdBQVcsRUFBRTthQUN6QyxDQUFDO2lCQUNELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2YsSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFO29CQUNkLElBQUksRUFBRSxDQUFDO29CQUNQLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ1IsRUFBRSxHQUFHLE1BQU0sUUFBUSxDQUFDLGNBQWMsQ0FDOUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUNwQixDQUFDO3FCQUNMO29CQUNELE9BQU8sRUFBRSxDQUFDO2lCQUNiO2dCQUNELE1BQU0sQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUM7WUFDUCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQztBQWxERCxzREFrREM7QUFrRFksUUFBQSxjQUFjLEdBQWlCO0lBQ3hDLE9BQU8sRUFBRTtRQUNMLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLGdCQUFnQixFQUFFLHlCQUF5QjtRQUMzQyxHQUFHLEVBQUUsNkNBQXNCO1FBQzNCLFFBQVEsRUFBRSxDQUNOLEdBQWtCLEVBQ2xCLE1BQWMsRUFDZCxVQUFrQixFQUNsQixJQUFZLEVBQ1osVUFBOEIsRUFDaEMsRUFBRTtZQUNBLE9BQU8sR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUU7Z0JBQzVDLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixVQUFVO2FBQ2IsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELE9BQU8sRUFBRSxLQUFLLEVBQ1YsR0FBa0IsRUFDbEIsT0FBZSxFQUNmLElBQVksRUFDWixLQUFrRCxFQUNsRCxVQUE4QixFQUM5QixTQUF1QyxFQUN6QyxFQUFFO1lBQ0EsTUFBTSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQ3RELE9BQU8sRUFDUCxJQUFJLEVBQ0o7Z0JBQ0ksUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRLElBQUksUUFBUTtnQkFDekMsUUFBUSxFQUFFLFNBQVMsRUFBRSxRQUFRO2dCQUM3QixVQUFVO2FBQ2IsQ0FDSixDQUFDO1lBQ0YsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FDSjtJQUNELE1BQU0sRUFBRTtRQUNKLE1BQU0sRUFBRSxjQUFjO1FBQ3RCLGdCQUFnQixFQUFFLHdCQUF3QjtRQUMxQyxHQUFHLEVBQUUsNkNBQXNCO1FBQzNCLFFBQVEsRUFBRSxLQUFLLEVBQ1gsR0FBa0IsRUFDbEIsQ0FBUyxFQUNULFVBQWtCLEVBQ2xCLEdBQVcsRUFDWCxVQUE4QixFQUNoQyxFQUFFO1lBQ0EsT0FBTyxDQUNILENBQ0ksTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLFVBQVU7Z0JBQ1YsWUFBWTthQUNmLENBQUMsQ0FDTCxDQUFDLFdBQVcsRUFBRSxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FDOUMsQ0FBQztRQUNOLENBQUM7UUFDRCxPQUFPLEVBQUUsS0FBSyxFQUNWLEdBQWtCLEVBQ2xCLE9BQWUsRUFDZixHQUFXLEVBQ1gsS0FBa0QsRUFDbEQsV0FBK0IsRUFDL0IsU0FBdUMsRUFDekMsRUFBRTtZQUNBLE1BQU0sRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUMzRCxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsSUFBSSxTQUFTO2dCQUMxQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVE7YUFDaEMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FDSjtDQUNKLENBQUM7QUFFSyxLQUFLLFVBQVUsaUJBQWlCLENBQ25DLE1BQWtCO0lBRWxCLE1BQU0sNEJBQTRCLEdBQzlCLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyx5Q0FBcUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3hFLE1BQU0sVUFBVSxHQUFHLEdBQUcsRUFBRTtRQUNwQixJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUN2QzthQUFNO1lBQ0gsT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDLENBQUM7SUFDRixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQzNCLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBQ3pDLFNBQVMsTUFBTSxDQUFJLElBQWlCO1FBQ2hDLE1BQU0sYUFBYSxHQUFHO1lBQ2xCLE9BQU8sRUFBRSxFQUFFO1lBQ1gsUUFBUSxFQUFFLHNDQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7U0FDM0QsQ0FBQztRQUNGLE1BQU0sR0FBRyxHQUFHO1lBQ1IsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYTtZQUNuQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDdkIsc0JBQXNCLEVBQ2xCLENBQUMsUUFBaUIsRUFBRSxFQUFFLENBQ3RCLEtBQUssRUFDRCxNQUFjLEVBQ2QsVUFBa0IsRUFDbEIsSUFBWSxFQUNaLElBQWEsRUFDZixFQUFFO29CQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVzt3QkFBRSxPQUFPLGFBQWEsQ0FBQztvQkFFOUMsSUFBSTt3QkFDQSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVTs0QkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FDWCw2QkFBNkIsSUFBSSxJQUFJLFVBQVUsRUFBRSxDQUNwRCxDQUFDO3dCQUVOLE1BQU0sUUFBUSxHQUNWLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FDdkMsVUFBVSxFQUNWLE1BQU0sQ0FBQyxLQUFLLENBQ2YsQ0FBQzt3QkFFTixJQUFJLFFBQVE7NEJBQ1IsT0FBTztnQ0FDSCxPQUFPLEVBQUUsUUFBUTtnQ0FDakIsUUFBUSxFQUFFLDZCQUFxQixDQUFDLE9BQU8sQ0FDbkMsUUFBUSxFQUNSLFFBQVEsQ0FDWDs2QkFDSixDQUFDO3dCQUVOLElBQUksUUFBUTs0QkFBRSxPQUFPLGFBQWEsQ0FBQzt3QkFFbkMsSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBQ2hDLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0NBQ3ZCLElBQUksR0FBRyxJQUFJLHNCQUFTLENBQ2hCLGNBQWMsQ0FDakIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQ0FDYixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOzZCQUNyQjtpQ0FBTTtnQ0FDSCxJQUFJLEdBQUcsQ0FDSCxNQUFNLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUN4QztxQ0FDSSxHQUFHLENBQUMsSUFBSSxDQUFDO3FDQUNULFlBQVksRUFBRTtxQ0FDZCxRQUFRLEVBQUUsQ0FBQzs2QkFDbkI7eUJBQ0o7d0JBRUQsTUFBTSxFQUFFLEdBQUcsTUFBTSxxQkFBcUIsQ0FDbEMsTUFBTSxFQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDZixDQUFDO3dCQUVGLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDOzRCQUNmLE1BQU0sSUFBSSxLQUFLLENBQ1gscURBQXFELENBQ3hELENBQUM7d0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDeEIsTUFBTSxPQUFPLEdBQ1QsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUMxQyxVQUFVLEVBQ1YsTUFBTSxDQUFDLEtBQUssRUFDWixJQUFJLENBQ1AsQ0FBQzt3QkFFTixPQUFPOzRCQUNILE9BQU87NEJBQ1AsUUFBUSxFQUFFLDZCQUFxQixDQUFDLE9BQU8sQ0FDbkMsT0FBTyxFQUNQLFFBQVEsQ0FDWDt5QkFDSixDQUFDO3FCQUNMO29CQUFDLE9BQU8sQ0FBTSxFQUFFO3dCQUNiLE1BQU0sQ0FBQyxDQUFDO3dCQUNSLHVCQUF1QjtxQkFDMUI7Z0JBQ0wsQ0FBQzthQUNSO1NBQ0osQ0FBQztRQUNGLFlBQVk7UUFDWixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFlLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDakUsS0FBSyxVQUFVLGVBQWUsQ0FDMUIsUUFBZ0IsRUFDaEIsUUFBaUIsRUFDakIsSUFBYSxFQUNiLE9BQWdCLEVBQ2hCLE1BQWUsRUFDZixhQUFzQixFQUN0QixhQUFzQixFQUN0QixNQUFlLEVBQ2YsT0FBZ0IsRUFDaEIsUUFBaUI7UUFFakIsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FDNUIsTUFBTSxDQUFDLEtBQUssRUFDWixRQUFRLEVBQ1IsUUFBUSxFQUNSLElBQUksRUFDSixPQUFPLEVBQ1AsTUFBTSxFQUNOLGFBQWEsRUFDYixhQUFhLEVBQ2IsTUFBTSxFQUNOLE9BQU8sRUFDUCxRQUFRLENBQ1gsQ0FBQztJQUNOLENBQUM7SUFDRCxZQUFZO0lBQ1osS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUFZO1FBQ3RDLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsT0FBTyxDQUFDLEdBQUcsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQzFCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FDdEQsQ0FBQztZQUNGLEtBQUssRUFBRSxDQUFDO1NBQ1g7UUFFRCxPQUFPLEdBQTBCLENBQUM7SUFDdEMsQ0FBQztJQUNELEtBQUssVUFBVSxhQUFhLENBQUMsR0FBd0I7UUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNuQixNQUFNLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxTQUFTLEdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQ0QsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQzdCLEVBQXVCLEVBQ3ZCLE1BQWMsRUFDZCxTQUFpQixFQUNuQixFQUFFO1FBQ0EsTUFBTSxHQUFHLEdBQUcsc0JBQWMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQzFELEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNsQixNQUFNLENBQ1QsQ0FBQztRQUVGLE9BQU8sTUFBTSxzQkFBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUN4RCxHQUFVLEVBQ1YsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQ3pCLFNBQVMsRUFDVCxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDakIsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUN6QyxDQUFDO0lBQ04sQ0FBQyxDQUFDO0lBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQzFCLEVBQXVCLEVBQ3ZCLE1BQWMsRUFDZCxPQUFrQixFQUNsQixTQUF1QyxFQUN2QyxTQUFrQixFQUNwQixFQUFFO1FBQ0EsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLFNBQVM7Z0JBQ0wsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJO29CQUNqQixDQUFDLENBQUMsV0FBVztvQkFDYixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQzt3QkFDekMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXO3dCQUNwQixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztTQUNoQztRQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVwRSxJQUFJLFVBQVUsRUFBRTtZQUNaLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsTUFBTSxHQUFHLEdBQUcsc0JBQWMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQzFELEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNsQixNQUFNLENBQ1QsQ0FBQztRQUVGLE1BQU0sT0FBTyxHQUFHLE1BQU0sc0JBQWMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FDaEUsR0FBVSxFQUNWLFNBQVMsRUFDVCxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDakIsNEJBQTRCLEVBQzVCLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDdEMsU0FBUyxDQUNaLENBQUM7UUFDRixNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDeEIsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxJQUFJLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV4RSxNQUFNLHFCQUFxQixHQUFHLEtBQUssRUFDL0IsTUFBYyxFQUNkLE1BQWMsRUFDZCxVQUFrQiw0Q0FBNEMsRUFDaEUsRUFBRTtRQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLG1EQUFtRDtRQUNuRCxNQUFNLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUM7WUFDcEMsSUFBSTtZQUNKLEVBQUUsRUFBRSw2REFBNkQsQ0FBQyxPQUFPO1lBQ3pFLEtBQUssRUFBRSxlQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDdEMsS0FBSyxFQUFFLE1BQU0sUUFBUSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7WUFDekQsUUFBUSxFQUFFLGVBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUN0QyxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFO1NBQ3pDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQyxDQUFDO0lBRUYsTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUN0QixNQUFjLEVBQ2QsR0FBd0IsRUFDeEIsSUFBYSxFQUNiLFdBQW9CLEtBQUssRUFDM0IsRUFBRTtRQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRztZQUNSLE1BQU0sSUFBSSxLQUFLLENBQ1gsb0RBQW9ELENBQ3ZELENBQUM7UUFDTixPQUFPLE1BQU0sTUFBTSxDQUNmLFdBQVcsQ0FBQyxXQUFXLENBQzFCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQzlCLE1BQU0sRUFDTixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQ3ZCLElBQUksQ0FDUCxDQUFDO0lBQ04sQ0FBQyxDQUFDO0lBRUYsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLEVBQUUsTUFBcUIsRUFBRSxFQUFFO1FBQzVELE1BQU0sSUFBSSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixtREFBbUQ7UUFDbkQsTUFBTSxRQUFRLEdBQUc7O1VBRWYsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQU0sQ0FBQyxlQUFlLENBQ3ZDLDZCQUF3QixDQUFDLEdBQUcsRUFDNUIsNkJBQXdCLENBQUMsUUFBUSxFQUNqQyxNQUFNLENBQ1QsQ0FBQztRQUVGLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FDbEMsUUFBUSxDQUFDLG9CQUFvQixDQUN6QixHQUFHLEVBQ0gsRUFBRSxFQUNGLDRDQUE0QyxFQUM1QyxNQUFNLENBQUMsSUFBSSxDQUNQLDRDQUE0QyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDckQsS0FBSyxDQUNSLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUNwQixDQUNKLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRDLE9BQU8sSUFBSTthQUNOLElBQUksQ0FBQyxJQUFJLHNCQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDM0MsWUFBWSxDQUFDLEdBQUcsQ0FBQzthQUNqQixZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0gsR0FBRyxJQUFJO1FBQ1AsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1FBQ3pCLFNBQVMsRUFBRSxNQUFNLENBQUMsWUFBWTtRQUM5QixTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTTtRQUN2QixnQkFBZ0I7UUFDaEIsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVE7UUFDM0IsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUF3QjtZQUN6QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQ3hDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNuQixNQUFNLENBQUMsS0FBSyxDQUNmLENBQUM7UUFDTixDQUFDO1FBQ0QsWUFBWTtRQUNaLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDM0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxZQUFZO1lBQ1IsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFDRCxtQkFBbUI7UUFDbkIsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FDOUIsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztRQUNqRCxhQUFhO1FBQ2IsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE9BQU87WUFDM0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLE9BQU8sSUFBSSxLQUFLLElBQUksQ0FBQztRQUN6QixDQUFDO1FBQ0QsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1FBQzVCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU07WUFDdkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxtQkFBbUIsQ0FDeEMsRUFBRSxFQUNGLElBQUksbUJBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQ2pDLFdBQVcsQ0FDZCxDQUFDO1lBRUYsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osT0FBTyxTQUFTLENBQUM7YUFDcEI7WUFFRCxNQUFNLEdBQUcsR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQ3RDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNsQixJQUFJLG1CQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUNwQyxDQUFDO1lBRUYsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUNwRCxXQUFXLEVBQ1gsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ3BCLENBQUM7WUFFRixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO1FBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUc7WUFDdEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQzdELE1BQU0sQ0FBQztZQUNaLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsT0FBTyxxQkFBaUIsQ0FBQyxPQUFPLENBQUM7YUFDcEM7WUFDRCxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2QsT0FBTyxxQkFBaUIsQ0FBQyxPQUFPLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixPQUFPLHFCQUFpQixDQUFDLE9BQU8sQ0FBQzthQUNwQztZQUNELE9BQU8scUJBQWlCLENBQUMsT0FBTyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPO1lBQy9CLElBQUksZUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksT0FBTyxFQUFFO2dCQUM3QyxNQUFNLE1BQU0sR0FBRyw2Q0FBc0IsQ0FBQyxPQUFPLENBQ3pDLFFBQVMsRUFDVCxRQUFRLENBQ1gsQ0FBQztnQkFDRixxRUFBcUU7Z0JBQ3JFLGVBQWU7Z0JBQ2YsT0FBTyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0QsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNO1lBQzlELE1BQU0sRUFBRSxHQUFHLE1BQU0sTUFBTTtpQkFDbEIsT0FBTyxDQUFDLE1BQU0sQ0FBQztpQkFDZixtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FDakMsRUFBRSxFQUNGLFVBQVUsRUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUNyQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdkI7Z0JBQ0ksS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkMsQ0FDSixDQUFDO1lBQ04sTUFBTSw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QyxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFN0MsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhDLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssQ0FBQyx5QkFBeUIsQ0FDM0IsTUFBTSxFQUNOLFVBQVUsRUFDVixFQUFFLEVBQ0YsSUFBSSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBb0I7WUFFcEIsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxZQUFZLENBQ3BELE1BQU0sRUFDTixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1AsU0FBUyxFQUNULFFBQVEsS0FBSyxRQUFRLENBQUMsWUFBWSxDQUNyQyxDQUFDO1lBRUYsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFcEUsTUFBTSxFQUFFLEdBQUcsTUFBTSxNQUFNO2lCQUNsQixPQUFPLENBQUMsTUFBTSxDQUFDO2lCQUNmLG1CQUFtQixDQUFDLGtCQUFrQixDQUNuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDckMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDOUIsVUFBVSxFQUNWLEVBQUUsRUFDRixRQUFRLEVBQ1I7Z0JBQ0ksS0FBSyxFQUFFLGtCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkMsQ0FDSixDQUFDO1lBQ04sTUFBTSw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV2QyxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFN0MsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhDLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUNELEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVM7WUFDdkQsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDeEMsTUFBTSxHQUFHLEdBQUcsS0FBTSxHQUFHLEtBQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFDLE9BQU8sSUFBSSxzQkFBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsRUFBRSxJQUFJO1lBQzVDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sR0FBRyxHQUFHLEtBQU0sR0FBRyxLQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxPQUFPLElBQUksc0JBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNELFlBQVksQ0FBQyxVQUFrQjtZQUMzQixPQUFPLElBQUksZUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUN0QixNQUFjLEVBQ2QsV0FBbUIsRUFDbkIsRUFBVSxFQUNWLEVBQXVCLEVBQ3ZCLE1BQWlCLEVBQ2pCLFFBQWdCLEVBQ2hCLFdBQTRDLFNBQVMsRUFDckQsUUFBUSxFQUNSLFFBQW9CO1lBRXBCLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sWUFBWSxDQUNwRCxNQUFNLEVBQ04sRUFBRSxFQUNGLFNBQVMsRUFDVCxRQUFRLEtBQUssUUFBUSxDQUFDLFdBQVcsQ0FDcEMsQ0FBQztZQUVGLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVsRSxNQUFNLE1BQU0sR0FBRyxzQkFBYyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRTdELGtCQUFrQjtZQUNsQixJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUN2QixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDekMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQ3BCLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUMxQyxDQUFDO2dCQUNGLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7YUFDM0M7WUFDRCxNQUFNLEVBQUUsR0FBRyxNQUFNLE1BQU07aUJBQ2xCLE9BQU8sQ0FBQyxNQUFNLENBQUM7aUJBQ2YsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQ3hCLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNsQixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDakIsV0FBVyxFQUNYLEVBQUUsRUFDRixRQUFRLEVBQ1I7Z0JBQ0ksS0FBSyxFQUNELE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSTtvQkFDakIsQ0FBQyxDQUFDLGtCQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDbEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsVUFBVSxFQUFFLFVBQVUsRUFBRTthQUMzQixDQUNKLENBQUM7WUFDTixNQUFNLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXZDLE1BQU0sR0FBRyxHQUFrQyxNQUFNLE1BQU07aUJBQ2xELGVBQWUsQ0FBQyxFQUFFLENBQUM7aUJBQ25CLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNULElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7b0JBQ3JCLE9BQU8sQ0FBQyxDQUFDO2lCQUNaOztvQkFBTSxNQUFNLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksTUFBYyxDQUFDO1lBQ25CLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZCLDJCQUEyQjtnQkFDM0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hDLDJCQUEyQjtnQkFDM0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3RDO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7Z0JBQzVCLDhCQUE4QjtnQkFDOUIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILCtCQUErQjtnQkFDL0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDckI7WUFFRCxNQUFNLGVBQWU7WUFDakIsWUFBWTtZQUNaLE1BQU0sQ0FDVCxDQUFDO1lBQ0YsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtnQkFDckIsT0FBTyxNQUFNLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEQ7WUFDRCxPQUFPLEdBQVUsQ0FBQztRQUN0QixDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUNwQixNQUFjLEVBQ2QsRUFBVSxFQUNWLEVBQXVCLEVBQ3ZCLE1BQWlCLEVBQ2pCLEtBQUssRUFDTCxRQUFRLEdBQUcsU0FBUyxFQUNwQixRQUFRO1lBRVIsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFekQsa0JBQWtCO1lBQ2xCLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZCLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUN6QyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFDcEIsQ0FBQyxrQkFBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FDdEQsQ0FBQztnQkFDRixFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2FBQzNDO1lBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNO2lCQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDO2lCQUNmLG1CQUFtQixDQUFDLFdBQVcsQ0FDNUIsRUFBRSxFQUNGLEtBQUssRUFDTCxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDakIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ2xCO2dCQUNJLEtBQUssRUFDRCxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUk7b0JBQ2pCLENBQUMsQ0FBQyxrQkFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ2xCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsUUFBUTtnQkFDUixRQUFRO2dCQUNSLFVBQVUsRUFBRSxVQUFVLEVBQUU7YUFDM0IsQ0FDSixDQUFDO1lBRU4sTUFBTSw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEIsSUFBSSxNQUFjLENBQUM7WUFDbkIsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDdkIsMkJBQTJCO2dCQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEMsMkJBQTJCO2dCQUMzQixNQUFNLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDdEM7aUJBQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtnQkFDNUIsOEJBQThCO2dCQUM5QixNQUFNLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsK0JBQStCO2dCQUMvQixNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQzthQUNyQjtZQUVELE1BQU0sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7Z0JBQ3JCLE9BQU8sTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsT0FBTyxHQUFVLENBQUM7UUFDdEIsQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FDN0IsR0FBVyxFQUNYLE9BQTRCLEVBQzVCLFNBQVM7WUFFVCxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV6QyxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUNELHVCQUF1QjtRQUN2QixLQUFLLENBQUMsc0JBQXNCO1lBQ3hCLElBQUk7Z0JBQ0EsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBTSxDQUFDLGVBQWUsQ0FDdEMsNkNBQXNCLENBQUMsR0FBRyxFQUMxQiw2Q0FBc0IsQ0FBQyxRQUFRLENBQ2xDLENBQUM7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUNsQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FDakMsQ0FBQztnQkFFRixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV0QyxPQUFPLElBQUksc0JBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNoRDtZQUFDLE9BQU8sS0FBVSxFQUFFO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlDLE9BQU8sSUFBSSxzQkFBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUMxRDtRQUNMLENBQUM7UUFFRCxlQUFlLENBQUMsR0FBRztZQUNmLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ2hCLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQztBQXptQkQsOENBeW1CQyJ9