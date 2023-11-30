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
    const getExtraFees = () => {
        const extra = params.extraFees || "0";
        return new bignumber_js_1.BigNumber(extra).multipliedBy(1e18);
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
                getExtraFees,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVkZXJhX3JlZmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvaGVkZXJhL2hlZGVyYV9yZWZhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBNEQ7QUFDNUQsZ0RBQTZDO0FBRTdDLG1DQUFnQztBQU1oQywrQ0FBeUM7QUFFekMsK0NBQWlFO0FBQ2pFLCtEQUErRTtBQTZDeEUsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLEVBQ3RDLE1BQWlDLEVBQ0gsRUFBRTtJQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsd0JBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFN0MsTUFBTSxNQUFNLEdBQUcsc0NBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUUsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsR0FBd0IsRUFBRSxFQUFFO1FBQzFELHdFQUF3RTtRQUN4RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRTtZQUMvRCxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVE7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpFLE9BQU8sQ0FDTCxNQUFNO1lBQ04sb0VBQW9FLENBQ3JFLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7UUFDNUMsTUFBTSxHQUFHLEdBQUcsaUJBQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUss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