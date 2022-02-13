"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tronHelperFactory = exports.baseTronHelperFactory = void 0;
const bignumber_js_1 = require("bignumber.js");
const axios_1 = __importDefault(require("axios"));
// @ts-expect-error no types cope
const tronstation_1 = __importDefault(require("tronstation"));
const bignumber_1 = require("@ethersproject/bignumber/lib/bignumber");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
async function baseTronHelperFactory(provider) {
    const setSigner = (signer) => {
        return signer && provider.setPrivateKey(signer);
    };
    const deployErc721_i = async (deployer) => {
        setSigner(deployer);
        const contract = await provider.contract().new({
            abi: xpnet_web3_contracts_1.UserNftMinter__factory.abi,
            bytecode: xpnet_web3_contracts_1.UserNftMinter__factory.bytecode,
            feeLimit: 3000000000,
        });
        return contract;
    };
    const deployErc1155_i = async (owner) => {
        setSigner(owner);
        const contract = await provider.contract().new({
            abi: xpnet_web3_contracts_1.Erc1155Minter__factory.abi,
            bytecode: xpnet_web3_contracts_1.Erc1155Minter__factory.bytecode,
            feeLimit: 3000000000,
        });
        return contract;
    };
    const deployXpNft = async (deployer) => {
        setSigner(deployer);
        const contract = await provider.contract().new({
            abi: xpnet_web3_contracts_1.XPNft__factory.abi,
            bytecode: xpnet_web3_contracts_1.XPNft__factory.bytecode,
            feeLimit: 3000000000,
        });
        return contract;
    };
    return {
        async mintNft(owner, options) {
            setSigner(owner);
            const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, options.contract);
            const res = await erc.mint(options.uris[0]).send();
            return res;
        },
        async balance(address) {
            const balance = await provider.trx.getBalance(address);
            return new bignumber_js_1.BigNumber(balance);
        },
        deployErc721: async (owner) => await deployErc721_i(owner).then((c) => c.address),
        async deployMinter(deployer, validators, threshold, whitelist = []) {
            if (whitelist.length == 0) {
                const unft = await deployErc721_i(deployer);
                whitelist.push(unft.address);
            }
            const nft_token = await deployXpNft(deployer);
            const token = await deployErc1155_i(deployer);
            const minter = await provider.contract().new({
                abi: xpnet_web3_contracts_1.Minter__factory.abi,
                bytecode: xpnet_web3_contracts_1.Minter__factory.bytecode,
                feeLimit: 3000000000,
                parameters: [
                    validators,
                    whitelist,
                    threshold,
                    nft_token.address,
                    token.address,
                ],
            });
            await nft_token.transferOwnership(minter.address).send();
            await token.transferOwnership(minter.address).send();
            return {
                minter: minter.address,
                xpnft: nft_token.address,
                xpnet: token.address,
                whitelist,
            };
        },
    };
}
exports.baseTronHelperFactory = baseTronHelperFactory;
async function tronHelperFactory(tronParams) {
    const { provider, erc1155_addr, minter_addr } = tronParams;
    const station = new tronstation_1.default(provider);
    const base = await baseTronHelperFactory(provider);
    const erc1155 = await provider.contract(xpnet_web3_contracts_1.Erc1155Minter__factory.abi, erc1155_addr);
    const minter = await provider.contract(xpnet_web3_contracts_1.Minter__factory.abi, minter_addr);
    const event_middleware = axios_1.default.create({
        baseURL: tronParams.middleware_uri,
        headers: {
            "Content-Type": "application/json",
        },
    });
    const setSigner = (signer) => {
        return signer && provider.setPrivateKey(signer);
    };
    async function notifyValidator(hash) {
        await event_middleware.post("/tx/tron", { tx_hash: hash });
    }
    async function extractAction(hash) {
        await new Promise((r) => setTimeout(r, 6000));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEv = async (retries = 0) => {
            const res = await provider.getEventByTransactionID(hash);
            if (res.length !== 0) {
                return res;
            }
            if (retries > 15) {
                throw Error("Couldn't fetch transaction after more than 15 retries!");
            }
            await new Promise((r) => setTimeout(r, 3000));
            return getEv(retries + 1);
        };
        const evs = await getEv();
        const ev = evs.find((e) => (e === null || e === void 0 ? void 0 : e.contract) == minter_addr);
        const action_id = ev.result["actionId"].toString();
        return action_id;
    }
    const randomAction = () => Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)).toString();
    async function estimateGas(addrs, func_sig, params) {
        let energy = 0;
        let bandwidth = 0;
        const nrgSun = await station.energy.burnedEnergy2Trx(1, { unit: "sun" });
        const bandSun = 10;
        for (const [i, addr] of addrs.entries()) {
            const res = await provider.transactionBuilder.triggerConstantContract(minter.address, func_sig, {}, params, provider.address.toHex(addr));
            let nrg = res["energy_used"];
            if (i == addrs.length - 1 && addrs.length != 1)
                nrg *= 2;
            energy += nrg;
            const tx_raw = res["transaction"]["raw_data_hex"];
            bandwidth += tx_raw.length;
        }
        // Fee = energy * (sun per energy) + bandwidth * (sun per bandwidth)
        // bandwidth = raw tx byte length
        const fee = new bignumber_js_1.BigNumber(energy).times(nrgSun).plus(bandwidth * bandSun);
        return fee;
    }
    const isApprovedForMinter = async (id, _sender) => {
        const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, id.native.contract);
        const approvedAddress = await erc.getApproved(id.native.tokenId).call({
            from: tronParams.provider.defaultAddress.base58,
        });
        if (approvedAddress === minter_addr) {
            return true;
        }
        return false;
    };
    const approveForMinter = async (id, sender) => {
        await setSigner(sender);
        const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, id.native.contract);
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        const txHash = await erc
            .approve(minter_addr, id.native.tokenId)
            .send();
        return txHash;
    };
    const addMinToExpirationTime = (txn, minutes) => {
        const expiration = txn.raw_data.expiration;
        const newExpiration = new Date(expiration).getTime() + minutes * 60000;
        txn.raw_data.expiration = newExpiration;
        return txn;
    };
    return Object.assign(Object.assign({}, base), { extractAction,
        approveForMinter, preTransfer: (s, nft, _fee) => approveForMinter(nft, s), async preTransferRawTxn(nft, address, _value) {
            await setSigner(address);
            const isApproved = await isApprovedForMinter(nft, address);
            if (isApproved) {
                return undefined;
            }
            const { transaction, result } = await provider.transactionBuilder.triggerSmartContract(nft.native.contract, "approve(address,uint256)", {
                feeLimit: 1000000,
                callValue: 0,
            }, [
                {
                    type: "address",
                    value: minter_addr,
                },
                {
                    type: "uint256",
                    value: nft.native.tokenId,
                },
            ], address);
            if (!result.result) {
                throw new Error(result.toString());
            }
            return addMinToExpirationTime(transaction, 15);
        },
        async mintRawTxn(args, sender) {
            const { transaction, result } = await provider.transactionBuilder.triggerSmartContract(args.contract, "mint(string)", {
                feeLimit: 1000000,
                callValue: 0,
            }, [
                {
                    type: "string",
                    value: args.uris[0],
                },
            ], sender);
            if (!result.result) {
                throw new Error(result.toString());
            }
            return addMinToExpirationTime(transaction, 15);
        },
        async transferNftToForeignTxn(nonce, to, id, _fee, sender) {
            const { transaction, result } = await provider.transactionBuilder.triggerSmartContract("freezeErc721(address,uint256,uint64,string)", {
                feeLimit: 1000000,
                callValue: 0,
            }, [
                {
                    type: "address",
                    value: id.native.contract,
                },
                {
                    type: "uint256",
                    value: id.native.tokenId,
                },
                {
                    type: "uint64",
                    value: nonce,
                },
                {
                    type: "string",
                    value: to,
                },
            ], sender);
            if (!result.result) {
                throw new Error(result.toString());
            }
            return addMinToExpirationTime(transaction, 15);
        },
        async unfreezeWrappedNftTxn(to, id, _fee, sender) {
            const { transaction, result } = await provider.transactionBuilder.triggerSmartContract("withdrawNft(string,uint256)", {
                feeLimit: 1000000,
                callValue: 0,
            }, [
                {
                    type: "string",
                    value: to,
                },
                {
                    type: "uint256",
                    value: id,
                },
            ], sender);
            if (!result.result) {
                throw new Error(result.toString());
            }
            return addMinToExpirationTime(transaction, 15);
        },
        isWrappedNft(nft) {
            return (nft.native.contract.toLowerCase() ===
                tronParams.erc721_addr.toLowerCase());
        },
        isApprovedForMinter,
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const val = bignumber_1.BigNumber.from(value.toString(10));
            const totalVal = val.add(bignumber_1.BigNumber.from(txFees.toString(10)));
            let res = await minter
                .freeze(chain_nonce, to, val)
                .send({ callValue: totalVal });
            await notifyValidator(res);
            return res;
        },
        async extractTxnStatus(txnHash) {
            const txn = await provider.trx.getConfirmedTransaction(txnHash);
            const status = txn["ret"][0]["contractRet"];
            if (status === "SUCCESS") {
                return __1.TransactionStatus.SUCCESS;
            }
            else if (status === "FAIL") {
                return __1.TransactionStatus.FAILURE;
            }
            return __1.TransactionStatus.PENDING;
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const res = await minter
                .withdraw(chain_nonce, to, value)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
            await notifyValidator(res);
            return res;
        },
        async unfreezeWrappedNft(sender, to, id, txFees) {
            setSigner(sender);
            const res = await minter
                .withdrawNft(to, id.native.tokenId)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
            await notifyValidator(res);
            return res;
        },
        getNonce() {
            return tronParams.nonce;
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            setSigner(sender);
            await approveForMinter(id, sender);
            const txr = await minter
                .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
            await notifyValidator(txr);
            return txr;
        },
        async balanceWrappedBatch(address, chain_nonces) {
            const res = new Map();
            const balance = await erc1155
                .balanceOfBatch(Array(chain_nonces.length).fill(address), chain_nonces)
                .call();
            balance.map((e, i) => {
                res.set(chain_nonces[i], new bignumber_js_1.BigNumber(e.toString()));
            });
            return res;
        },
        async balanceWrapped(address, chain_nonce) {
            const bal = await erc1155.balanceOf(address, chain_nonce).call();
            return new bignumber_js_1.BigNumber(bal.toString());
        },
        async estimateValidateTransferNft(to, nftUri) {
            return await estimateGas(tronParams.validators, "validateTransferNft(uint128,address,string)", [
                { type: "uint128", value: randomAction() },
                { type: "address", value: to },
                {
                    type: "string",
                    value: nftUri,
                },
            ]);
        },
        async estimateValidateUnfreezeNft(to, nft) {
            const wrappedData = await __1.extractWrappedMetadata(nft);
            return await estimateGas(tronParams.validators, "validateUnfreezeNft(uint128,address,uint256,address)", [
                { type: "uint128", value: randomAction() },
                { type: "address", value: to },
                {
                    type: "uint256",
                    value: bignumber_1.BigNumber.from(wrappedData.wrapped.tokenId),
                },
                { type: "address", value: wrappedData.wrapped.contract },
            ]);
        },
        async validateAddress(adr) {
            return provider.isAddress(adr);
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBY3pDLGtEQUEwQjtBQUcxQixpQ0FBaUM7QUFDakMsOERBQXNDO0FBRXRDLHNFQUE0RTtBQUc1RSwrREFLOEI7QUFDOUIsMEJBY1k7QUFxRUwsS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFpQjtJQUVqQixNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQWtCLEVBQUUsRUFBRTtRQUN2QyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxRQUFvQixFQUFFLEVBQUU7UUFDcEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBCLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUM3QyxHQUFHLEVBQUUsNkNBQXNCLENBQUMsR0FBRztZQUMvQixRQUFRLEVBQUUsNkNBQXNCLENBQUMsUUFBUTtZQUN6QyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsS0FBaUIsRUFBRSxFQUFFO1FBQ2xELFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLDZDQUFzQixDQUFDLEdBQUc7WUFDL0IsUUFBUSxFQUFFLDZDQUFzQixDQUFDLFFBQVE7WUFDekMsUUFBUSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsRUFBRTtRQUNqRCxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSxxQ0FBYyxDQUFDLEdBQUc7WUFDdkIsUUFBUSxFQUFFLHFDQUFjLENBQUMsUUFBUTtZQUNqQyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFpQixFQUFFLE9BQW9CO1lBQ25ELFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLENBQ2pDLDZDQUFzQixDQUFDLEdBQUcsRUFDMUIsT0FBTyxDQUFDLFFBQVEsQ0FDakIsQ0FBQztZQUNGLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkQsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkQsT0FBTyxJQUFJLHdCQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FDNUIsTUFBTSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3BELEtBQUssQ0FBQyxZQUFZLENBQ2hCLFFBQW9CLEVBQ3BCLFVBQW9CLEVBQ3BCLFNBQWlCLEVBQ2pCLFlBQXNCLEVBQUU7WUFFeEIsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzVDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzlCO1lBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUMzQyxHQUFHLEVBQUUsc0NBQWUsQ0FBQyxHQUFHO2dCQUN4QixRQUFRLEVBQUUsc0NBQWUsQ0FBQyxRQUFRO2dCQUNsQyxRQUFRLEVBQUUsVUFBVTtnQkFDcEIsVUFBVSxFQUFFO29CQUNWLFVBQVU7b0JBQ1YsU0FBUztvQkFDVCxTQUFTO29CQUNULFNBQVMsQ0FBQyxPQUFPO29CQUNqQixLQUFLLENBQUMsT0FBTztpQkFDZDthQUNGLENBQUMsQ0FBQztZQUVILE1BQU0sU0FBUyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6RCxNQUFNLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckQsT0FBTztnQkFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU87Z0JBQ3RCLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTztnQkFDeEIsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUNwQixTQUFTO2FBQ1YsQ0FBQztRQUNKLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQWhHRCxzREFnR0M7QUFvQ00sS0FBSyxVQUFVLGlCQUFpQixDQUNyQyxVQUFzQjtJQUV0QixNQUFNLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsR0FBRyxVQUFVLENBQUM7SUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0scUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUNyQyw2Q0FBc0IsQ0FBQyxHQUFHLEVBQzFCLFlBQVksQ0FDYixDQUFDO0lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLHNDQUFlLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sZ0JBQWdCLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztRQUNwQyxPQUFPLEVBQUUsVUFBVSxDQUFDLGNBQWM7UUFDbEMsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBa0IsRUFBRSxFQUFFO1FBQ3ZDLE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLGVBQWUsQ0FBQyxJQUFZO1FBQ3pDLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLElBQVk7UUFDdkMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTlDLDhEQUE4RDtRQUM5RCxNQUFNLEtBQUssR0FBdUMsS0FBSyxFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsRUFBRTtZQUN0RSxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixPQUFPLEdBQUcsQ0FBQzthQUNaO1lBQ0QsSUFBSSxPQUFPLEdBQUcsRUFBRSxFQUFFO2dCQUNoQixNQUFNLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssRUFBRSxDQUFDO1FBQzFCLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUEsQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLFFBQVEsS0FBSSxXQUFXLENBQUMsQ0FBQztRQUM1RCxNQUFNLFNBQVMsR0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FDeEIsSUFBSSxDQUFDLEtBQUssQ0FDUixJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUN2RCxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWYsS0FBSyxVQUFVLFdBQVcsQ0FDeEIsS0FBZSxFQUNmLFFBQWdCLEVBQ2hCLE1BQXNDO1FBRXRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDekUsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRW5CLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDdkMsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLENBQ25FLE1BQU0sQ0FBQyxPQUFPLEVBQ2QsUUFBUSxFQUNSLEVBQUUsRUFDRixNQUFNLEVBQ04sUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQzdCLENBQUM7WUFDRixJQUFJLEdBQUcsR0FBVyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDekQsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUNkLE1BQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxRCxTQUFTLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUM1QjtRQUNELG9FQUFvRTtRQUNwRSxpQ0FBaUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSx3QkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBRTFFLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUMvQixFQUF1QixFQUN2QixPQUFtQixFQUNuQixFQUFFO1FBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUNqQyw2Q0FBc0IsQ0FBQyxHQUFHLEVBQzFCLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUNuQixDQUFDO1FBQ0YsTUFBTSxlQUFlLEdBQUcsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3BFLElBQUksRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNO1NBQ2hELENBQUMsQ0FBQztRQUNILElBQUksZUFBZSxLQUFLLFdBQVcsRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFDNUIsRUFBdUIsRUFDdkIsTUFBOEIsRUFDOUIsRUFBRTtRQUNGLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FDakMsNkNBQXNCLENBQUMsR0FBRyxFQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDbkIsQ0FBQztRQUNGLE1BQU0sVUFBVSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksVUFBVSxFQUFFO1lBQ2QsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxNQUFNLE1BQU0sR0FBVyxNQUFNLEdBQUc7YUFDN0IsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQzthQUN2QyxJQUFJLEVBQUUsQ0FBQztRQUNWLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUVGLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxHQUFlLEVBQUUsT0FBZSxFQUFFLEVBQUU7UUFDbEUsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN2RSxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7UUFDeEMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLENBQUM7SUFFRix1Q0FDSyxJQUFJLEtBQ1AsYUFBYTtRQUNiLGdCQUFnQixFQUNoQixXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUN2RCxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNO1lBQzFDLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNELElBQUksVUFBVSxFQUFFO2dCQUNkLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FDM0IsTUFBTSxRQUFRLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUNuQiwwQkFBMEIsRUFDMUI7Z0JBQ0UsUUFBUSxFQUFFLE9BQVM7Z0JBQ25CLFNBQVMsRUFBRSxDQUFDO2FBQ2IsRUFDRDtnQkFDRTtvQkFDRSxJQUFJLEVBQUUsU0FBUztvQkFDZixLQUFLLEVBQUUsV0FBVztpQkFDbkI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTztpQkFDMUI7YUFDRixFQUNELE9BQU8sQ0FDUixDQUFDO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTTtZQUMzQixNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUMzQixNQUFNLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FDcEQsSUFBSSxDQUFDLFFBQVEsRUFDYixjQUFjLEVBQ2Q7Z0JBQ0UsUUFBUSxFQUFFLE9BQVM7Z0JBQ25CLFNBQVMsRUFBRSxDQUFDO2FBQ2IsRUFDRDtnQkFDRTtvQkFDRSxJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3BCO2FBQ0YsRUFDRCxNQUFNLENBQ1AsQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTTtZQUN2RCxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUMzQixNQUFNLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FDcEQsNkNBQTZDLEVBQzdDO2dCQUNFLFFBQVEsRUFBRSxPQUFTO2dCQUNuQixTQUFTLEVBQUUsQ0FBQzthQUNiLEVBQ0Q7Z0JBQ0U7b0JBQ0UsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUTtpQkFDMUI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztpQkFDekI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLEtBQUs7aUJBQ2I7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLEVBQUU7aUJBQ1Y7YUFDRixFQUNELE1BQU0sQ0FDUCxDQUFDO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU07WUFDOUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FDM0IsTUFBTSxRQUFRLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQ3BELDZCQUE2QixFQUM3QjtnQkFDRSxRQUFRLEVBQUUsT0FBUztnQkFDbkIsU0FBUyxFQUFFLENBQUM7YUFDYixFQUNEO2dCQUNFO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxFQUFFO2lCQUNWO2dCQUNEO29CQUNFLElBQUksRUFBRSxTQUFTO29CQUNmLEtBQUssRUFBRSxFQUFFO2lCQUNWO2FBQ0YsRUFDRCxNQUFNLENBQ1AsQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUNELFlBQVksQ0FBQyxHQUFHO1lBQ2QsT0FBTyxDQUNMLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtnQkFDakMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FDckMsQ0FBQztRQUNKLENBQUM7UUFDRCxtQkFBbUI7UUFDbkIsS0FBSyxDQUFDLHVCQUF1QixDQUMzQixNQUFrQixFQUNsQixXQUFtQixFQUNuQixFQUFVLEVBQ1YsS0FBZ0IsRUFDaEIsTUFBaUI7WUFFakIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxCLE1BQU0sR0FBRyxHQUFHLHFCQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksR0FBRyxHQUFHLE1BQU0sTUFBTTtpQkFDbkIsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2lCQUM1QixJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUVqQyxNQUFNLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTztZQUM1QixNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsT0FBTyxxQkFBaUIsQ0FBQyxPQUFPLENBQUM7YUFDbEM7aUJBQU0sSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUM1QixPQUFPLHFCQUFpQixDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUNELE9BQU8scUJBQWlCLENBQUMsT0FBTyxDQUFDO1FBQ25DLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUNuQixNQUFrQixFQUNsQixXQUFtQixFQUNuQixFQUFVLEVBQ1YsS0FBYSxFQUNiLE1BQWM7WUFFZCxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNO2lCQUNyQixRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUM7aUJBQ2hDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxxQkFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFdEQsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsS0FBSyxDQUFDLGtCQUFrQixDQUN0QixNQUFrQixFQUNsQixFQUFVLEVBQ1YsRUFBdUIsRUFDdkIsTUFBaUI7WUFFakIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTTtpQkFDckIsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDbEMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLHFCQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFeEQsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsUUFBUTtZQUNOLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMxQixDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFrQixFQUNsQixXQUFtQixFQUNuQixFQUFVLEVBQ1YsRUFBdUIsRUFDdkIsTUFBaUI7WUFFakIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRW5DLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTTtpQkFDckIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUM7aUJBQ3BFLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxxQkFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXhELE1BQU0sZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUNELEtBQUssQ0FBQyxtQkFBbUIsQ0FDdkIsT0FBZSxFQUNmLFlBQXNCO1lBRXRCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTztpQkFDMUIsY0FBYyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksQ0FBQztpQkFDdEUsSUFBSSxFQUFFLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFO2dCQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLHdCQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUNELEtBQUssQ0FBQyxjQUFjLENBQ2xCLE9BQWUsRUFDZixXQUFtQjtZQUVuQixNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pFLE9BQU8sSUFBSSx3QkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCLENBQy9CLEVBQVUsRUFDVixNQUF1QjtZQUV2QixPQUFPLE1BQU0sV0FBVyxDQUN0QixVQUFVLENBQUMsVUFBVSxFQUNyQiw2Q0FBNkMsRUFDN0M7Z0JBQ0UsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRTtnQkFDMUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQzlCO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxNQUFNO2lCQUNkO2FBQ0YsQ0FDRixDQUFDO1FBQ0osQ0FBQztRQUNELEtBQUssQ0FBQywyQkFBMkIsQ0FDL0IsRUFBVSxFQUNWLEdBQWlCO1lBRWpCLE1BQU0sV0FBVyxHQUFHLE1BQU0sMEJBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEQsT0FBTyxNQUFNLFdBQVcsQ0FDdEIsVUFBVSxDQUFDLFVBQVUsRUFDckIsc0RBQXNELEVBQ3REO2dCQUNFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUU7Z0JBQzFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO2dCQUM5QjtvQkFDRSxJQUFJLEVBQUUsU0FBUztvQkFDZixLQUFLLEVBQUUscUJBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7aUJBQy9DO2dCQUNELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7YUFDekQsQ0FDRixDQUFDO1FBQ0osQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBVztZQUMvQixPQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsQ0FBQyxJQUNEO0FBQ0osQ0FBQztBQXJZRCw4Q0FxWUMifQ==