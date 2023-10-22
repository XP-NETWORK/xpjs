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
    return {
        ...base,
        injectSDK(hashSDK) {
            const toSolidityAddress = async (address) => {
                return hethers_1.hethers.utils.getAddressFromAccount(address);
            };
            const getEvmHash = (trx) => "0x" + String(trx.transactionHash).slice(0, 64);
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
                const forAddress = toApprove || (await getApproveFor(id));
                console.log(forAddress, "forAddress");
                const isApproved = await isApprovedForMinter(id, sender, forAddress);
                console.log(isApproved, "isApproved");
                console.log(id, "isApproved");
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
                const contract = await params.notifier.getCollectionContract(nft.native.contract, params.nonce);
                if (contract)
                    return {
                        address: contract,
                        contract: undefined,
                    };
                if (isMapped)
                    return {
                        address: params.minter_addr,
                        contract: undefined,
                    };
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
                checkAndAssociate,
                isApprovedForMinter,
                approveForMinter,
                getUserStore,
                transferNftToForeign: async function (sender, chain_nonce, to, id, txFees, mintWith, _ = undefined, gasPrice, toParams) {
                    const { address } = await getUserStore(sender, id, undefined, mintWith !== toParams.erc721_addr);
                    await approveForMinter(id, sender, txFees, { gasPrice }, address);
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
                    const hash = getEvmHash(txResponse);
                    await params.notifier.notifyWeb3(params.nonce, hash);
                    return {
                        hash,
                    };
                },
                unfreezeWrappedNft: async function (sender, to, id, txFees, nonce, _ = undefined, __) {
                    const tokenId = ethers_1.ethers.utils.solidityPack(["uint160", "int96"], [id.collectionIdent, id.native.tokenId]);
                    const contract = await getEVMContractByHtsToken(id.native.contract);
                    const transaction = await new hashSDK.ContractExecuteTransaction()
                        .setContractId(hashSDK.ContractId.fromEvmAddress(0, 0, params.minter_addr))
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
                    const hash = getEvmHash(txResponse);
                    await params.notifier.notifyWeb3(params.nonce, hash);
                    return {
                        hash,
                    };
                },
                estimateUserStoreDeploy,
            };
        },
        async approveForMinter(...args) {
            if (!args[4]) {
                const forAddress = await getApproveFor(args[0]);
                args[4] = forAddress;
            }
            return base.approveForMinter(...args);
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
            return base.unfreezeWrappedNft(...args);
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
    };
};
exports.HederaHelperFactory = HederaHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhX3JlZmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvaGVkZXJhL2hlZGVyYV9yZWZhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBNEQ7QUFDNUQsZ0RBQTZDO0FBRTdDLG1DQUFnQztBQU1oQywrQ0FBeUM7QUFFekMsK0NBQWlFO0FBQ2pFLCtEQUE4RDtBQXlDdkQsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQ3RDLE1BQWlDLEVBQ0gsRUFBRTtJQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsd0JBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0MsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFO1FBQzVDLE1BQU0sR0FBRyxHQUFHLGlCQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hELENBQUMsQ0FBQztJQUVGLE1BQU0sb0JBQW9CLEdBQUcsQ0FDM0IsSUFHRyxFQUNILEVBQUU7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsTUFBTSxXQUFXLEdBQUcsSUFBSTthQUNyQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDO2FBQzlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0lBRUYsTUFB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