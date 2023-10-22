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
    /*const hashioMinter = Minter__factory.connect(
          minter_addr,
          params.evmProvider
      );*/
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
                .setPayableAmount(fees.shiftedBy(-18).integerValue().toString())
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
                .setPayableAmount(fees.shiftedBy(-18).integerValue().toString())
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
            const data = minter.interface.encodeFunctionData("nftWhitelist", [
                nft.native.contract,
            ]);
            const result = await params.hederaApi.readContract(minter.address, data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcmljYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2hlZGVyYS9kZXByaWNhdGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGdFQUFxQztBQWdCckMsbUNBU2dCO0FBRWhCLCtEQU04QjtBQUM5Qiw2QkFhZTtBQUdmLGtEQUEwQjtBQUMxQixnREFBNkM7QUFLN0MsK0NBQStDO0FBQy9DLCtDQUFpRTtBQUdqRSxJQUFJLE9BQWEsQ0FBQztBQTRDbEIsaUJBQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDaEUsT0FBTyxrQkFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7QUE4RkY7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0IsRUFDbEIsS0FBYTtJQUViLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLDZDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXhDLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxRQUFR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