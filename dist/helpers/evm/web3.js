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
const __1 = require("../..");
const hethers_1 = require("@hashgraph/hethers");
const web3_utils_1 = require("./web3_utils");
const v3_1 = require("xpnet-web3-contracts/dist/v3");
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
    /* const customData = () => {
          if (params.nonce === 0x1d) {
              return { usingContractAlias: true };
          } else {
              return undefined;
          }
      };*/
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
                            // }
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
            return new bignumber_js_1.default(gas.mul(180000).toString());
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
            await approveForMinter(id, sender, txFees, { gasPrice }, address);
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            let tokenId = id.native.tokenId;
            let contract = id.native.contract;
            // Chain is Hedera
            if (params.nonce === 0x1d) {
                tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                contract = params.erc721_addr;
            }
            const tx = await minter
                .connect(sender)
                .populateTransaction[method](contract, tokenId, chain_nonce, to, mintWith, {
                value: txFees.toFixed(0),
                gasLimit,
                gasPrice,
                customData: undefined,
            });
            await txnUnderpricedPolyWorkaround(tx);
            const txr = await sender
                .sendTransaction(tx)
                .catch((e) => {
                if (params.nonce === 33 || params.nonce === 0x1d) {
                    return e;
                }
                else
                    throw e;
            });
            let txHash;
            if (params.nonce === 0x1d) {
                const hederaTx = txr;
                typeof hederaTx.wait === "function" && (await hederaTx.wait());
                return hederaTx;
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
            params.nonce !== 0x1d &&
                (await approveForMinter(id, sender, txFees, { gasPrice }));
            const txn = await minter
                .connect(sender)
                .populateTransaction.withdrawNft(to, nonce, id.native.tokenId, id.native.contract, {
                value: txFees.toFixed(0),
                gasLimit,
                gasPrice,
                customData: undefined,
            });
            await txnUnderpricedPolyWorkaround(txn);
            const txr = await sender.sendTransaction(txn).catch((e) => {
                if (params.nonce === 0x1d) {
                    return e;
                }
                else
                    throw e;
            });
            let txHash;
            if (params.nonce === 0x1d) {
                const hederaTx = txr;
                typeof hederaTx.wait === "function" && (await hederaTx.wait());
                return hederaTx;
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
            return txr;
        },
        async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
            const gas = await provider.getGasPrice();
            /* const factory = new ethers.ContractFactory(
                      Minter__factory.abi,
                      Minter__factory.bytecode
                  ).connect(provider)*/
            /* const last_Trx = (
                      await minter.queryFilter(minter.filters.UnfreezeNft())
                  ).at(-1);
                  console.log(await last_Trx?.getTransaction());
                  console.log(await last_Trx?.getTransactionReceipt());
      
                  /* const x = await provider.estimateGas({
                      to: "0xaB0dBe37d86bc566Dc027D9C65E40851F3CcB097",
                      gasLimit: "250000",
                      data: "",
                  })*/
            // console.log(x.toString(), "x");
            return new bignumber_js_1.default(gas.mul(180000).toString());
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
                return new bignumber_js_1.default(gasPrice.mul(180000).toString());
            }
        },
        validateAddress(adr) {
            return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
        },
        isNftWhitelisted(nft) {
            return minter.nftWhitelist(nft.native.contract);
        },
        async lockNFT(signer, to, id, receiver) {
            const bridge = v3_1.Bridge__factory.connect(params.v3_bridge, params.provider);
            const tx = await bridge.populateTransaction.lock721(BigInt(id.native.tokenId), to, receiver, id.native.contract);
            const lockTx = await signer.sendTransaction(tx);
            await lockTx.wait();
            return lockTx;
        },
        async getTokenInfo(depTrxData) {
            const singular = depTrxData.nftType === "singular";
            const salePriceToGetTotalRoyalityPercentage = 10000;
            let royalty = String(BigInt("0")); // set default royalty 0
            let metadata = ""; // set default matadata empty
            let name = ""; // set empty default name
            let symbol = ""; // set empty default symbol
            if (singular) {
                const _contract = v3_1.ERC721Royalty__factory.connect(depTrxData.sourceNftContractAddress, provider);
                const results = await Promise.allSettled([
                    _contract.name(),
                    _contract.symbol(),
                    _contract.royaltyInfo(ethers_1.ethers.BigNumber.from(depTrxData.tokenId), ethers_1.ethers.BigNumber.from(salePriceToGetTotalRoyalityPercentage)),
                    _contract.tokenURI(ethers_1.ethers.BigNumber.from(depTrxData.tokenId)),
                ]);
                name = results[0].status === "fulfilled" ? results[0].value : name;
                symbol = results[1].status === "fulfilled" ? results[1].value : symbol;
                royalty =
                    results[2].status === "fulfilled"
                        ? results[2].value[1].toString()
                        : royalty;
                metadata =
                    results[3].status === "fulfilled" ? results[3].value : metadata;
            }
            if (!singular) {
                const _contract = v3_1.ERC1155Royalty__factory.connect(depTrxData.sourceNftContractAddress, provider);
                const results = await Promise.allSettled([
                    _contract.royaltyInfo(ethers_1.ethers.BigNumber.from(depTrxData.tokenId), ethers_1.ethers.BigNumber.from(salePriceToGetTotalRoyalityPercentage)),
                    _contract.uri(ethers_1.ethers.BigNumber.from(depTrxData.tokenId)),
                ]);
                royalty =
                    results[0].status === "fulfilled"
                        ? results[0].value[1].toString()
                        : royalty;
                metadata =
                    results[1].status === "fulfilled" ? results[1].value : metadata;
            }
            return {
                name,
                symbol,
                metadata,
                royalty,
            };
        },
        async getClaimData(hash, helpers) {
            const bridgeAddress = params.v3_bridge;
            const depBridge = v3_1.Bridge__factory.connect(bridgeAddress, provider);
            const getTx = (hash) => new Promise(async (resolve, reject) => {
                let tx;
                const tm = setTimeout(() => reject("Time out on getTx "), 120 * 1000);
                while (!tx) {
                    await new Promise((r) => setTimeout(r, 5000));
                    tx = await provider
                        .getTransactionReceipt(hash)
                        .catch(() => undefined);
                }
                clearTimeout(tm);
                resolve(tx);
            });
            const destTrx = (await getTx(hash));
            const log = destTrx.logs.find((log) => log.address.toLowerCase() === bridgeAddress.toLowerCase());
            if (!log) {
                throw new Error("Failed to decode destTrx logs at " + hash);
            }
            const parsed = depBridge.interface.parseLog(log);
            const decoded = {
                tokenId: String(parsed.args[0]),
                destinationChain: parsed.args[1],
                destinationUserAddress: parsed.args[2],
                sourceNftContractAddress: parsed.args[3].toLowerCase(),
                tokenAmount: String(parsed.args[4]),
                nftType: parsed.args[5],
                sourceChain: parsed.args[6],
            };
            const sourceNonce = Array.from(__1.CHAIN_INFO.values()).find((c) => c.v3_chainId === decoded.sourceChain)?.nonce;
            if (!sourceNonce) {
                throw new Error("Source chain is undefined");
            }
            const sourceChain = helpers.get(sourceNonce);
            const tokenInfo = await sourceChain.getTokenInfo(decoded);
            return {
                ...decoded,
                ...tokenInfo,
            };
        },
        async claimV3NFT(signer, helpers, from, transactionHash, storageContract, initialClaimData) {
            const bridge = v3_1.Bridge__factory.connect(params.v3_bridge, signer);
            const [validatorsCount, claimDataRes] = await Promise.allSettled([
                bridge.validatorsCount(),
                from.getClaimData(transactionHash, helpers),
            ]);
            if (claimDataRes.status === "rejected") {
                throw new Error("Failed to get claimData from dep chain");
            }
            const claimData = claimDataRes.value;
            const sigNumber = validatorsCount.status === "fulfilled"
                ? validatorsCount.value.toNumber()
                : 0;
            console.log({ ...claimData, ...initialClaimData, transactionHash }, "claimData");
            const getSignatures = async (tryNumber = 0) => {
                if (tryNumber === 100)
                    return undefined;
                await new Promise((r) => setTimeout(r, 5000));
                const signatures = await storageContract
                    .getLockNftSignatures(transactionHash, __1.CHAIN_INFO.get(from.getNonce())?.v3_chainId)
                    .catch((e) => {
                    console.log(e.message);
                    return [];
                });
                if (signatures.length < sigNumber)
                    return getSignatures(tryNumber + 1);
                return signatures;
            };
            console.log(sigNumber, "sigNumber");
            //const chainId = CHAIN_INFO.get(params.nonce)?.v3_chainId!;
            const signatures = await getSignatures();
            if (!signatures) {
                throw new Error("Error on getting signatures from contract");
            }
            console.log(signatures, "signatures");
            const signatureArray = [];
            signatures.forEach((item) => {
                signatureArray.push(item.signature);
            });
            console.log(signatureArray, "signatureArray");
            console.log({ ...claimData, ...initialClaimData, transactionHash });
            const trx = await bridge.populateTransaction.claimNFT721({ ...claimData, ...initialClaimData, transactionHash }, signatureArray, {
                value: initialClaimData.fee,
                gasLimit: "2000000",
            });
            const tx = await signer.sendTransaction(trx);
            await tx.wait();
            return tx;
        },
        async getNftOrigin(address) {
            const nonce = String(params.nonce);
            try {
                const bridge = v3_1.Bridge__factory.connect(params.v3_bridge, params.provider);
                const chain = await bridge.functions.selfChain();
                const res = await bridge.duplicateToOriginalMapping(address, chain[0]);
                return {
                    origin: res.chain
                        ? (0, __1.v3BridgeIdToNonce)(res.chain)
                        : nonce,
                    contract: res.contractAddress,
                };
            }
            catch {
                return { origin: nonce };
            }
        },
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2V2bS93ZWIzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQW1CckMsbUNBU2dCO0FBRWhCLCtEQU84QjtBQUU5QixtRkFBZ0c7QUFHaEcseUZBQWtJO0FBRWxJLDZCQWtCZTtBQUdmLGdEQUE2QztBQUM3Qyw2Q0FBcUY7QUFFckYscURBS3NDO0FBK0N0QyxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQUlGLElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNkLGlEQUFNLENBQUE7SUFDTiwyREFBVyxDQUFBO0FBQ2IsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFnRkQ7Ozs7R0FJRztBQUVJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0IsRUFDbEIsS0FBYTtJQUViLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLDZDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXhDLE9BQU8s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