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
//import { tryTimes } from "../evm/web3_utils";
const utils_1 = require("../../factory/utils");
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
                gasLimit: 1000000,
                customData,
            });
        },
        approve: async (umt, forAddr, _tok, txnUp, customData) => {
            const tx = await umt.populateTransaction.setApprovalForAll(forAddr, true, {
                gasLimit: 1000000,
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
        approved: async (umt, _, minterAddr, tok, hederaApi) => {
            const data = umt.interface.encodeFunctionData("getApproved", [tok]);
            const result = await hederaApi.readContract(umt.address, data);
            const approvedContract = umt.interface.decodeFunctionResult("getApproved", result);
            return approvedContract.at(0)?.toLowerCase() == minterAddr.toLowerCase();
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
    const hashioMinter = xpnet_web3_contracts_1.Minter__factory.connect(minter_addr, params.evmProvider);
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
    /* const sanifyTrx = (trx: any) => {
          const validTrx = String(trx).replace("@", "-");
          const array = validTrx.split("");
          array[validTrx.lastIndexOf(".")] = "-";
          return array.join("");
      };*/
    const getEVMContractByHtsToken = async (htsToken) => {
        const token = toHederaAccountId(htsToken);
        const res = await params.hederaApi.getokenInfo(token);
        return await params.hederaApi.getEVMAddress(res.treasury_account_id);
    };
    const isApprovedForMinter = async (id, _, toApprove) => {
        const contract = exports.NFT_METHOD_MAP[id.native.contractType];
        const erc = contract.umt.connect(id.native.contract, params.evmProvider);
        return await contract.approved(erc, "", toApprove, id.native.tokenId, params.hederaApi);
    };
    const approveForMinter = async (id, sender, _txFees, gasPrice, isWrappedNft) => {
        if (isWrappedNft === undefined)
            isWrappedNft = (await (0, utils_1.isWrappedNft)(id, +id.native.chainId)).bool;
        let toApprove = params.erc721_addr;
        if (isWrappedNft)
            toApprove = await getEVMContractByHtsToken(id.native.contract);
        const isApproved = await isApprovedForMinter(id, sender, toApprove);
        if (isApproved) {
            return undefined;
        }
        //@ts-ignore
        sender._isSigner = true;
        const erc = exports.NFT_METHOD_MAP[id.native.contractType].umt.connect(id.native.contract, sender);
        const receipt = await exports.NFT_METHOD_MAP[id.native.contractType].approve(erc, toApprove, id.native.tokenId, txnUnderpricedPolyWorkaround, {}, gasPrice, sender);
        await receipt.wait();
        return receipt.hash;
    };
    const listHederaClaimableNFT = async (tokens, 
    // _ = params.Xpnfthtsclaims,
    //__ = params.htcToken,
    signer) => {
        const address = signer.address;
        const res = await params.hederaApi.getTokens(address);
        const htsTokens = res.map((t) => t.token_id);
        const freshTokens = res
            .filter((t) => t.balance === 0)
            .map((t) => t.token_id);
        const dublicates = [];
        const toAssociate = tokens.filter((t) => {
            const token = hashSDK.TokenId.fromSolidityAddress(t.hts_token).toString();
            if (!dublicates.includes(t.hts_token) &&
                (!htsTokens.includes(token) || freshTokens.includes(token))) {
                dublicates.push(t.hts_token);
                return true;
            }
            return false;
        });
        //.map((token) => hashSDK.TokenId.fromSolidityAddress(token.hts_token));
        if (!toAssociate.length) {
            throw new Error("No matching tokens");
        }
        return toAssociate.map((t) => {
            const token = hashSDK.TokenId.fromSolidityAddress(t.hts_token).toString();
            return {
                contract: t.contract,
                htsToken: t.hts_token,
                tokens: [t.nft_id],
                associated: freshTokens.includes(token) ? true : false,
            };
        });
    };
    const associateToken = async (token, signer) => {
        const trx = await new hashSDK.TokenAssociateTransaction()
            .setAccountId(signer.accountToSign)
            .setTokenIds(token.map((t) => hashSDK.TokenId.fromSolidityAddress(t.htsToken)))
            .freezeWithSigner(signer);
        const result = await trx.executeWithSigner(signer).catch((err) => {
            console.log(err, "assoc");
        });
        if (!result) {
            throw new Error("Failed to Associate token to an account");
        }
        return true;
    };
    const toSolidityAddress = (address) => {
        return hethers_1.hethers.utils.getAddressFromAccount(address);
    };
    const toHederaAccountId = (address) => hashSDK.AccountId.fromSolidityAddress(address).toString();
    const getEvmHash = (trx) => "0x" + String(trx.transactionHash).slice(0, 64);
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
            const isApproved = await isApprovedForMinter(id, new ethers_1.VoidSigner(address, provider), "");
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
                .setPayableAmount(fees.shiftedBy(-8).integerValue().toString())
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
            const hash = getEvmHash(txResponse);
            await notifyValidator(hash);
            return {
                hash,
            };
        },
        async unfreezeWrappedNft(sender, to, id, fees, nonce, _ = undefined, __) {
            const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
            const contract = await getEVMContractByHtsToken(id.native.contract);
            const transaction = await new hashSDK.ContractExecuteTransaction()
                .setContractId(hashSDK.ContractId.fromEvmAddress(0, 0, params.minter_addr))
                .setGas(1200000)
                .setPayableAmount(fees.shiftedBy(-8).integerValue().toString())
                .setFunction("withdrawNft", new hashSDK.ContractFunctionParameters()
                .addString(to)
                //@ts-ignore
                .addUint64(String(nonce))
                //@ts-ignore
                .addUint256(String(tokenId))
                .addAddress(contract))
                .freezeWithSigner(sender);
            const txResponse = await transaction.executeWithSigner(sender);
            const hash = getEvmHash(txResponse);
            await notifyValidator(hash);
            return {
                hash,
            };
        },
        async estimateValidateTransferNft(_to, _nftUri, _mintWith) {
            const gas = await provider.getGasPrice();
            return new bignumber_js_1.default(gas.mul(150000).toString());
        },
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
                const gas = await provider.getGasPrice();
                return new bignumber_js_1.default(gas.mul(150000).toString());
            }
        },
        validateAddress(adr) {
            return Promise.resolve(ethers_1.ethers.utils.isAddress(adr));
        },
        async isNftWhitelisted(nft) {
            const data = hashioMinter.interface.encodeFunctionData("nftWhitelist", [
                nft.native.contract,
            ]);
            const result = await params.hederaApi.readContract(hashioMinter.address, data);
            return (result ===
                "0x0000000000000000000000000000000000000000000000000000000000000001");
        },
        listHederaClaimableNFT,
        async checkAndAssociate(tokens, signer) {
            const toAssociate = await listHederaClaimableNFT(tokens, signer);
            return await associateToken(toAssociate, signer);
        },
        associateToken,
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
        toSolidityAddress,
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlckFkYXB0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9oZWRlcmEvYnJvd3NlckFkYXB0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBZ0JyQyxtQ0FTZ0I7QUFFaEIsK0RBTThCO0FBQzlCLDZCQWFlO0FBR2Ysa0RBQTBCO0FBQzFCLGdEQUE2QztBQUs3QywrQ0FBK0M7QUFDL0MsK0NBQWlFO0FBR2pFLElBQUksT0FBYSxDQUFDO0FBNENsQixpQkFBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLElBQUksRUFBRTtJQUNoRSxPQUFPLGtCQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQThGRjs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFrQixFQUNsQixLQUFhO0lBRWIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFhO1lBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksNkNBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFeEMsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQWEsRUFBRSxF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