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
const hts_abi_1 = require("./hts_abi");
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
        async listHederaClaimableNFT(proxyContract = params.Xpnfthtsclaims, htsToken = params.htcToken, signer) {
            const constract = new ethers_1.ethers.Contract(proxyContract, hts_abi_1.HEDERA_PROXY_CLAIMS_ABI, params.evmProvider);
            return await constract.getClaimableNfts(signer.address, htsToken, {
                gasLimit: 1000000,
            });
            /*const query = new hashSDK.ContractCallQuery()
                      .setContractId(
                          hashSDK.ContractId.fromSolidityAddress(proxyContract)
                      )
                      .setGas(300_000)
                      .setFunction(
                          "getClaimableNfts",
                          new hashSDK.ContractFunctionParameters()
                              .addAddress(signer.address)
                              .addAddress(htsToken)
                      );
      
                  await query.executeWithSigner(signer);
      
                  return "";*/
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlckFkYXB0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9oZWRlcmEvYnJvd3NlckFkYXB0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBZ0JyQyxtQ0FTZ0I7QUFFaEIsK0RBTThCO0FBQzlCLDZCQVllO0FBR2Ysa0RBQTBCO0FBQzFCLGdEQUE2QztBQUU3Qyx1Q0FBb0Q7QUFHcEQsSUFBSSxPQUFhLENBQUM7QUE2Q2xCLGlCQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ2hFLE9BQU8sa0JBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDO0FBMkVGOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUscUJBQXFCLENBQ3pDLFFBQWtCLEVBQ2xCLEtBQWE7SUFFYixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFFcEIsT0FBTztRQUNMLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtZQUMzQixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekMsd0RBQXdEO1lBQ3hELE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQWE7WUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSw2Q0FBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUV4QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDMUIsQ0FBQztRQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBYSxFQUFFLEVBQUUsUUFBUSxFQUFF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