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
const __1 = require("../..");
const axios_1 = __importDefault(require("axios"));
const hethers_1 = require("@hashgraph/hethers");
let hashSDK;
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
        approved: async (umt, _, minterAddr, tok, __) => {
            const res = await umt.getApproved(tok, {
                gasLimit: "85000",
            });
            return res?.toLowerCase() == minterAddr.toLowerCase();
        },
        approve: async (umt, forAddr, tok, ___, _, __, signer) => {
            const transaction = await new hashSDK.ContractExecuteTransaction()
                .setContractId(hashSDK.ContractId.fromSolidityAddress(umt.address))
                .setGas(1000000)
                .setMaxTransactionFee(new hashSDK.Hbar(10))
                //.setPayableAmount(new hashSDK.Hbar(5))
                .setFunction("approve", new hashSDK.ContractFunctionParameters()
                .addAddress(forAddr)
                .addUint256(Number(tok)))
                .freezeWithSigner(signer);
            //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
            const txResponse = await transaction.executeWithSigner(signer);
            return {
                wait: () => new Promise((r) => r(true)),
                hash: txResponse.transactionId,
            };
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
    const sanifyTrx = (trx) => {
        const validTrx = String(trx).replace("@", "-");
        const array = validTrx.split("");
        array[validTrx.lastIndexOf(".")] = "-";
        return array.join("");
    };
    const isApprovedForMinter = async (id, _) => {
        const contract = exports.NFT_METHOD_MAP[id.native.contractType];
        const erc = contract.umt.connect(id.native.contract, params.evmProvider);
        return await contract.approved(erc, "", params.erc721_addr, id.native.tokenId, {});
    };
    const approveForMinter = async (id, sender, _txFees, gasPrice) => {
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        //@ts-ignore
        sender._isSigner = true;
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, params.erc721_addr, id.native.tokenId, txnUnderpricedPolyWorkaround, {}, gasPrice, sender);
        await receipt.wait();
        return receipt.hash;
    };
    const base = await baseWeb3HelperFactory(params.provider, params.nonce);
    return {
        ...base,
        XpNft: params.erc721_addr,
        XpNft1155: params.erc1155_addr,
        getParams: () => params,
        injectSDK(sdk) {
            hashSDK = sdk;
        },
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
        async transferNftToForeign(sender, chain_nonce, to, id, fees, mintWith, __ = undefined, ___) {
            const method = exports.NFT_METHOD_MAP[id.native.contractType].freeze;
            const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
            const contract = params.erc721_addr;
            const transaction = await new hashSDK.ContractExecuteTransaction()
                .setContractId(hashSDK.ContractId.fromSolidityAddress(params.minter_addr))
                .setGas(1200000)
                .setPayableAmount(fees.shiftedBy(-8).toNumber())
                .setFunction(method, new hashSDK.ContractFunctionParameters()
                .addAddress(contract)
                //@ts-ignore
                .addUint256(String(tokenId))
                //@ts-ignore
                .addUint64(String(chain_nonce))
                .addString(to)
                .addString(mintWith))
                .freezeWithSigner(sender);
            const txResponse = await transaction.executeWithSigner(sender);
            const hash = sanifyTrx(txResponse.transactionId);
            await notifyValidator(hash);
            return {
                hash,
            };
        },
        async unfreezeWrappedNft(sender, to, id, fees, nonce, _ = undefined, __) {
            const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [ethers_1.BigNumber.from(id.collectionIdent), id.native.tokenId]);
            const contract = params.erc721_addr;
            const transaction = await new hashSDK.ContractExecuteTransaction()
                .setContractId(hashSDK.ContractId.fromSolidityAddress(params.minter_addr))
                .setGas(1200000)
                .setPayableAmount(fees.shiftedBy(-8).toNumber())
                .setFunction("withdrawNft", new hashSDK.ContractFunctionParameters()
                .addString(to)
                //@ts-ignore
                .addUint64(String(nonce))
                //@ts-ignore
                .addUint256(String(tokenId))
                .addAddress(contract))
                .freezeWithSigner(sender);
            const txResponse = await transaction.executeWithSigner(sender);
            const hash = sanifyTrx(txResponse.transactionId);
            await notifyValidator(hash);
            return {
                hash,
            };
        },
        async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
        async estimateContractDep(toChain) {
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
        async listHederaClaimableNFT(proxyContract = params.erc721_addr, htsToken = params.htcToken, signer) {
            const query = new hashSDK.ContractCallQuery()
                .setContractId(hashSDK.ContractId.fromSolidityAddress(proxyContract))
                .setGas(300000)
                .setFunction("getClaimableNfts", new hashSDK.ContractFunctionParameters()
                .addAddress(signer.address)
                .addAddress(htsToken));
            await query.executeWithSigner(signer);
            return "";
        },
        async assosiateToken(token = params.htcToken, signer) {
            const trx = await new hashSDK.TokenAssociateTransaction()
                .setAccountId(signer.accountToSign)
                .setTokenIds([hashSDK.TokenId.fromSolidityAddress(token)])
                .freezeWithSigner(signer);
            const result = await trx.executeWithSigner(signer).catch((err) => {
                console.log(err, "assoc");
            });
            if (!result) {
                throw new Error("Failed to Associate token to an account");
            }
            return true;
        },
        async claimNFT(proxyContract = params.erc721_addr, htsToken = params.htcToken, tokenId, signer) {
            const trx = await new hashSDK.ContractExecuteTransaction()
                .setContractId(hashSDK.ContractId.fromSolidityAddress(proxyContract))
                .setGas(500000)
                .setMaxTransactionFee(new hashSDK.Hbar(12))
                .setFunction("claimNft", new hashSDK.ContractFunctionParameters()
                //@ts-ignore
                .addInt64(tokenId)
                .addAddress(htsToken))
                .freezeWithSigner(signer);
            const res = await trx.executeWithSigner(signer);
            return Boolean(res.transactionId);
        },
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvaGVkZXJhL2hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxnRUFBcUM7QUFnQnJDLG1DQVNnQjtBQUVoQiwrREFNOEI7QUFDOUIsNkJBWWU7QUFHZixrREFBMEI7QUFDMUIsZ0RBQTZDO0FBRzdDLElBQUksT0FBYSxDQUFDO0FBNkNsQixpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQTJFRjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRTtZQUM5QyxNQUFNLE9BQU8sR0FBRyw2Q0FBc0Is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