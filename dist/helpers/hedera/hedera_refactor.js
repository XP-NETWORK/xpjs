"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaHelperFactory = void 0;
const web3_1 = require("../evm/web3");
const hethers_1 = require("@hashgraph/hethers");
const ethers_1 = require("ethers");
const bignumber_js_1 = require("bignumber.js");
const utils_1 = require("../../factory/utils");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const HederaHelperFactory = async (params) => {
    const base = await (0, web3_1.web3HelperFactory)(params);
    const minter = xpnet_web3_contracts_1.Minter__factory.connect(params.minter_addr, params.provider);
    const isNftWhitelisted = async (nft) => {
        //const _contract = await getEVMContractByHtsToken(nft.native.contract);
        const data = minter.interface.encodeFunctionData("nftWhitelist", [
            nft.native.contract,
        ]);
        const result = await params.hederaApi.readContract(minter.address, data);
        return (result ===
            "0x0000000000000000000000000000000000000000000000000000000000000001");
    };
    const toHederaAccountId = (address) => {
        const acc = hethers_1.hethers.utils.getAccountFromAddress(address);
        return `${acc.shard}.${acc.realm}.${acc.num}`;
    };
    const getHTSandFreshTokens = (data) => {
        const htsTokens = data.map((t) => t.token_id);
        const freshTokens = data
            .filter((t) => t.balance === 0)
            .map((t) => t.token_id);
        return { htsTokens, freshTokens };
    };
    const mapTokensToAssociate = (toAssociate, freshTokens, transformAddress) => toAssociate.map((t) => {
        const token = transformAddress(t.hts_token);
        return {
            contract: t.contract,
            htsToken: t.hts_token,
            tokens: [t.nft_id],
            associated: freshTokens.includes(token) ? true : false,
        };
    });
    const filterTokens = (tokens, htsTokens, freshTokens, transformAddress) => {
        const dublicates = [];
        const toAssociate = tokens.filter((t) => {
            const token = transformAddress(t.hts_token);
            if (!dublicates.includes(t.hts_token) &&
                (!htsTokens.includes(token) || freshTokens.includes(token))) {
                dublicates.push(t.hts_token);
                return true;
            }
            return false;
        });
        if (!toAssociate.length) {
            throw new Error("No matching tokens");
        }
        return toAssociate;
    };
    const getEVMContractByHtsToken = async (htsToken) => {
        const token = toHederaAccountId(htsToken);
        const res = await params.hederaApi.getokenInfo(token);
        return await params.hederaApi.getEVMAddress(res.treasury_account_id);
    };
    const getApproveFor = async (id) => {
        const isWrappedNft = (await (0, utils_1.isWrappedNft)(id, +id.native.chainId)).bool;
        let forAddress = params.erc721_addr;
        if (isWrappedNft)
            forAddress = await getEVMContractByHtsToken(id.native.contract);
        return forAddress;
    };
    const listHederaClaimableNFT = async (tokens, signer) => {
        const address = await signer.getAddress();
        const _tokens = await params.hederaApi.getTokens(address);
        const { htsTokens, freshTokens } = getHTSandFreshTokens(_tokens);
        const transfromFunction = (address) => toHederaAccountId(address);
        const toAssociate = filterTokens(tokens, htsTokens, freshTokens, transfromFunction);
        return mapTokensToAssociate(toAssociate, freshTokens, transfromFunction);
    };
    const associateToken = async (token, signer) => {
        const abi = ["function associate()"];
        const contracts = token.map((t) => new ethers_1.ethers.Contract(t.htsToken, abi, signer));
        await Promise.all(contracts.map((contract) => contract.associate({
            gasLimit: 1000000,
        })));
        return true;
    };
    const checkAndAssociate = async (tokens, signer) => {
        const toAssociate = await listHederaClaimableNFT(tokens, signer);
        return await associateToken(toAssociate, signer);
    };
    const sanifyTrx = (trx) => {
        const validTrx = String(trx).replace("@", "-");
        const array = validTrx.split("");
        array[validTrx.lastIndexOf(".")] = "-";
        return array.join("");
    };
    return {
        ...base,
        injectSDK(hashSDK) {
            const toSolidityAddress = async (address) => {
                return hethers_1.hethers.utils.getAddressFromAccount(address);
            };
            /*const getEvmHash = (trx: any) =>
                      "0x" + String(trx.transactionHash).slice(0, 64);*/
            const listHederaClaimableNFT = async (tokens, signer) => {
                const address = signer.address;
                const res = await params.hederaApi.getTokens(address);
                const { htsTokens, freshTokens } = getHTSandFreshTokens(res);
                const transfromFunction = (address) => hashSDK.TokenId.fromSolidityAddress(address).toString();
                const toAssociate = filterTokens(tokens, htsTokens, freshTokens, transfromFunction);
                return mapTokensToAssociate(toAssociate, freshTokens, transfromFunction);
            };
            const claimNFT = async (proxyContract = params.erc721_addr, htsToken = params.htcToken, tokenId, signer) => {
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
            const checkAndAssociate = async (tokens, signer) => {
                const toAssociate = await listHederaClaimableNFT(tokens, signer);
                return await associateToken(toAssociate, signer);
            };
            const isApprovedForMinter = async (id, _, toApprove) => {
                const contract = xpnet_web3_contracts_1.UserNftMinter__factory.connect(id.native.contract, params.provider);
                const data = contract.interface.encodeFunctionData("getApproved", [
                    id.native.tokenId,
                ]);
                const result = await params.hederaApi.readContract(contract.address, data);
                const approvedContract = contract.interface.decodeFunctionResult("getApproved", result);
                return approvedContract.at(0)?.toLowerCase() == toApprove.toLowerCase();
            };
            const approveForMinter = async function (id, sender, _txFees, _, toApprove) {
                console.log(toApprove);
                const forAddress = toApprove || (await getApproveFor(id));
                console.log(forAddress, "forAddress");
                const isApproved = await isApprovedForMinter(id, sender, forAddress);
                if (isApproved)
                    return undefined;
                const transaction = await new hashSDK.ContractExecuteTransaction()
                    .setContractId(hashSDK.ContractId.fromSolidityAddress(id.native.contract))
                    .setGas(1000000)
                    .setMaxTransactionFee(new hashSDK.Hbar(10))
                    //.setPayableAmount(new hashSDK.Hbar(5))
                    .setFunction("approve", new hashSDK.ContractFunctionParameters()
                    .addAddress(forAddress)
                    .addUint256(Number(id.native.tokenId)))
                    .freezeWithSigner(sender);
                //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
                const txResponse = await transaction.executeWithSigner(sender);
                return txResponse.transactionId.toString();
            };
            const estimateUserStoreDeploy = async function (_) {
                const gas = "10000000000000000000";
                return new bignumber_js_1.BigNumber(gas).multipliedBy(1.1).integerValue();
            };
            const getUserStore = async (signer, nft, fees, isMapped = false) => {
                const defaultMinter = {
                    address: params.minter_addr,
                    contract: undefined,
                };
                if (!params.noWhitelist)
                    return defaultMinter;
                const contract = await params.notifier.getCollectionContract(nft.native.contract, params.nonce);
                if (contract)
                    return {
                        address: contract,
                        contract: undefined,
                    };
                if (isMapped)
                    return defaultMinter;
                const amount = fees ||
                    (await estimateUserStoreDeploy(signer)).shiftedBy(-18).toNumber();
                const transaction = await new hashSDK.TransferTransaction()
                    .addHbarTransfer(signer.accountToSign, new hashSDK.Hbar(-amount))
                    .addHbarTransfer("0.0.2003784", new hashSDK.Hbar(amount))
                    .freezeWithSigner(signer);
                //Submit the transaction to a Hedera network
                await transaction.executeWithSigner(signer);
                const address = await params.notifier.createCollectionContract(nft.native.contract, params.nonce, nft.native.contractType);
                return {
                    address,
                    contract: undefined,
                };
            };
            return {
                ...base,
                isInjected: true,
                toSolidityAddress,
                listHederaClaimableNFT,
                claimNFT,
                associateToken,
                isNftWhitelisted,
                checkAndAssociate,
                isApprovedForMinter,
                approveForMinter,
                getUserStore,
                transferNftToForeign: async function (sender, chain_nonce, to, id, txFees, mintWith, _ = undefined, gasPrice, toParams) {
                    const { address } = await getUserStore(sender, id, undefined, mintWith !== toParams.erc721_addr);
                    await approveForMinter(id, sender, txFees, { gasPrice }, params.erc721_addr);
                    const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                    const contract = params.erc721_addr;
                    const transaction = await new hashSDK.ContractExecuteTransaction()
                        .setContractId(hashSDK.ContractId.fromSolidityAddress(address))
                        .setGas(1200000)
                        .setPayableAmount(txFees.shiftedBy(-18).integerValue().toString())
                        .setFunction(id.native.contractType === "ERC1155"
                        ? "freezeErc1155"
                        : "freezeErc721", new hashSDK.ContractFunctionParameters()
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
                    await params.notifier.notifyWeb3(params.nonce, hash);
                    return {
                        hash,
                    };
                },
                unfreezeWrappedNft: async function (sender, to, id, txFees, nonce, _ = undefined, __) {
                    const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                    const contract = await getEVMContractByHtsToken(id.native.contract);
                    const transaction = await new hashSDK.ContractExecuteTransaction()
                        .setContractId(hashSDK.ContractId.fromSolidityAddress(params.minter_addr))
                        .setGas(1200000)
                        .setPayableAmount(txFees.shiftedBy(-18).integerValue().toString())
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
                    await params.notifier.notifyWeb3(params.nonce, hash);
                    return {
                        hash,
                    };
                },
                estimateUserStoreDeploy,
            };
        },
        async approveForMinter(...args) {
            try {
                if (!args[4]) {
                    const forAddress = await getApproveFor(args[0]);
                    args[4] = forAddress;
                }
                return await base.approveForMinter(...args);
            }
            catch (e) {
                if (typeof e?.message === "string" &&
                    e.message.match(/No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi)) {
                    return e.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || "";
                }
                throw e;
            }
        },
        async transferNftToForeign(...args) {
            const res = (await base.transferNftToForeign(...args));
            if (typeof res?.message === "string" &&
                res.message.match(/No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi)) {
                const transactionId = sanifyTrx(res.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || "");
                if (!transactionId) {
                    throw new Error("Invalid trx id");
                }
                await params.notifier.notifyWeb3(params.nonce, transactionId);
                return {
                    hash: transactionId,
                };
            }
            if (!res?.hash) {
                throw new Error(res?.message || "Unknow error");
            }
            const transactionId = await params.hederaApi.getTranactionIdByHash(res.hash);
            await params.notifier.notifyWeb3(params.nonce, transactionId);
            return res;
        },
        async unfreezeWrappedNft(...args) {
            const id = args[2];
            const signer = args[0];
            const fees = args[3];
            const gasPrice = args[6];
            const forAddress = await getApproveFor(id);
            await base.approveForMinter(id, signer, fees, { gasPrice }, forAddress);
            const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
            const contract = await getEVMContractByHtsToken(id.native.contract);
            args[2] = {
                ...args[2],
                native: {
                    ...args[2].native,
                    tokenId,
                    contract,
                },
            };
            const res = (await base.unfreezeWrappedNft(...args));
            if (typeof res?.message === "string" &&
                res?.message?.match(/No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi)) {
                const transactionId = sanifyTrx(res.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || "");
                if (!transactionId) {
                    throw new Error("Invalid trx id");
                }
                await params.notifier.notifyWeb3(params.nonce, transactionId);
                return {
                    hash: transactionId,
                };
            }
            if (!res?.hash) {
                throw new Error(res?.message || "Unknow error");
            }
            const transactionId = await params.hederaApi.getTranactionIdByHash(res.hash);
            await params.notifier.notifyWeb3(params.nonce, transactionId);
            return res;
        },
        estimateUserStoreDeploy: async (signer) => {
            if (typeof base.estimateUserStoreDeploy === "function") {
                const amount = await base.estimateUserStoreDeploy(signer);
                return amount.multipliedBy(10).integerValue();
            }
            return new bignumber_js_1.BigNumber(0);
        },
        toSolidityAddress: async (address) => {
            if (!ethers_1.ethers.utils.isAddress(address)) {
                return await params.hederaApi.getEVMAccount(address);
            }
            return address;
        },
        listHederaClaimableNFT,
        claimNFT: async function (proxyContract = params.erc721_addr, htsToken = params.htcToken, tokenId, signer) {
            proxyContract;
            htsToken;
            tokenId;
            signer;
            const abi = [
                {
                    inputs: [
                        {
                            internalType: "int64",
                            name: "serialNum",
                            type: "int64",
                        },
                        {
                            internalType: "address",
                            name: "token",
                            type: "address",
                        },
                    ],
                    name: "claimNft",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
            ];
            const contract = new ethers_1.ethers.Contract(proxyContract, abi, signer);
            const res = await contract.claimNft(ethers_1.ethers.BigNumber.from(tokenId), htsToken, {
                gasLimit: 1000000,
            });
            console.log(res);
            return true;
        },
        associateToken,
        checkAndAssociate,
        isNftWhitelisted,
    };
};
exports.HederaHelperFactory = HederaHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhX3JlZmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvaGVkZXJhL2hlZGVyYV9yZWZhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBNEQ7QUFDNUQsZ0RBQTZDO0FBRTdDLG1DQUFnQztBQU1oQywrQ0FBeUM7QUFFekMsK0NBQWlFO0FBQ2pFLCtEQUErRTtBQTBDeEUsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQ3RDLE1BQWlDLEVBQ0gsRUFBRTtJQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsd0JBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0MsTUFBTSxNQUFNLEdBQUcsc0NBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUUsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsR0FBd0IsRUFBRSxFQUFFO1FBQzFELHdFQUF3RTtRQUN4RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRTtZQUMvRCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVE7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpFLE9BQU8sQ0FDTCxNQUFNO1lBQ04sb0VBQW9FLENBQ3JFLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7UUFDNUMsTUFBTSxHQUFHLEdBQUcsaUJBQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUss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