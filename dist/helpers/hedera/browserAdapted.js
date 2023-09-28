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
        async listHederaClaimableNFT(_ = params.Xpnfthtsclaims, __ = params.htcToken, signer) {
            const address = signer.address;
            const htsTokens = (await params.hederaApi.getTokens(address))
                .filter((token) => token.balance === 0)
                .map((token) => token.token_id);
            const fetchToken = async (htsToken) => new Promise(async (resolve) => {
                try {
                    const tokenInfo = await params.hederaApi.getokenInfo(htsToken);
                    const treasuryAccount = toSolidityAddress(tokenInfo.treasury_account_id);
                    const isContract = await params.hederaApi.isContract(treasuryAccount);
                    console.log(isContract, treasuryAccount);
                    if (isContract) {
                        const nftContract = new ethers_1.ethers.Contract(treasuryAccount, ["function claimContract() public view returns (address)"], params.evmProvider);
                        const result = await params.hederaApi.readContract(treasuryAccount, nftContract.interface.encodeFunctionData("claimContract", []));
                        const nftClaimsContract = nftContract.interface.decodeFunctionResult("claimContract", result);
                        console.log(nftClaimsContract, "nftClaimsContract");
                        if (nftClaimsContract) {
                            const _nftClaimsContract = new ethers_1.ethers.Contract(nftClaimsContract[0], hts_abi_1.HEDERA_PROXY_CLAIMS_ABI, params.evmProvider);
                            const result = await params.hederaApi.readContract(nftClaimsContract[0], _nftClaimsContract.interface.encodeFunctionData("getClaimableNfts", [address, toSolidityAddress(htsToken)]));
                            const toClaim = _nftClaimsContract.interface.decodeFunctionResult("getClaimableNfts", result);
                            console.log(toClaim, "toClaim");
                            resolve({
                                contract: treasuryAccount,
                                htsToken: toSolidityAddress(htsToken),
                                tokens: toClaim.at(0),
                            });
                            return;
                        }
                    }
                    resolve(null);
                }
                catch {
                    resolve(null);
                }
            });
            const results = (await Promise.all(htsTokens.map(fetchToken)));
            return results.filter((i) => i);
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
        toSolidityAddress,
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlckFkYXB0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9oZWRlcmEvYnJvd3NlckFkYXB0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsZ0VBQXFDO0FBZ0JyQyxtQ0FTZ0I7QUFFaEIsK0RBTThCO0FBQzlCLDZCQWFlO0FBR2Ysa0RBQTBCO0FBQzFCLGdEQUE2QztBQUU3Qyx1Q0FBb0Q7QUFHcEQsK0NBQStDO0FBQy9DLCtDQUFpRTtBQUdqRSxJQUFJLE9BQWEsQ0FBQztBQTRDbEIsaUJBQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDaEUsT0FBTyxrQkFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7QUFrRkY7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBa0IsRUFDbEIsS0FBYTtJQUViLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBYTtZQUM5QixNQUFNLE9BQU8sR0FBRyxJQUFJLDZDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXhDLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGNBQWMsQ0FB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