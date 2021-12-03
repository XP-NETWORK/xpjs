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
            abi: xpnet_web3_contracts_1.XPNet__factory.abi,
            bytecode: xpnet_web3_contracts_1.XPNet__factory.bytecode,
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
    const erc1155 = await provider.contract(xpnet_web3_contracts_1.XPNet__factory.abi, erc1155_addr);
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
    return Object.assign(Object.assign({}, base), { extractAction,
        approveForMinter, preTransfer: (s, nft, _fee) => approveForMinter(nft, s), async preTransferRawTxn(nft, address, _value) {
            await setSigner(address);
            const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, nft.native.contract);
            const isApproved = await isApprovedForMinter(nft, address);
            if (isApproved) {
                return undefined;
            }
            const txHash = await erc.approve(minter_addr, nft.native.tokenId);
            return JSON.stringify(txHash);
        },
        async mintRawTxn(args, sender) {
            const { tx, result } = provider.transactionBuilder.triggerSmartContract(args.contract, "mint(string)", {
                feeLimit: 1000000,
                callValue: 0.1,
            }, [
                {
                    type: "string",
                    value: args.uris[0],
                },
            ], sender);
            if (!result.result) {
                throw new Error(result.toString());
            }
            return JSON.stringify(tx, null, 2);
        },
        async transferNftToForeignTxn(nonce, to, id, _fee, sender) {
            const { tx, result } = provider.transactionBuilder.triggerSmartContract("freezeErc721(address,uint256,uint64,string)", {
                feeLimit: 1000000,
                callValue: 0.1,
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
            return JSON.stringify(tx, null, 2);
        },
        async unfreezeWrappedNftTxn(to, id, _fee, sender) {
            const { tx, result } = provider.transactionBuilder.triggerSmartContract("withdrawNft(string,uint256)", {
                feeLimit: 1000000,
                callValue: 0.1,
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
            return JSON.stringify(tx, null, 2);
        },
        isWrappedNft(nft) {
            return (nft.native.contract.toLowerCase() ===
                tronParams.erc721_addr.toLowerCase());
        },
        isApprovedForMinter,
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const val = bignumber_1.BigNumber.from(value.toString());
            const totalVal = val.add(bignumber_1.BigNumber.from(txFees.toString()));
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
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
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
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
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
        async estimateValidateUnfreezeNft(to, nftUri) {
            const wrappedData = await axios_1.default.get(nftUri);
            return await estimateGas(tronParams.validators, "validateUnfreezeNft(uint128,address,uint256,address)", [
                { type: "uint128", value: randomAction() },
                { type: "address", value: to },
                {
                    type: "uint256",
                    value: bignumber_1.BigNumber.from(wrappedData.data.wrapped.tokenId),
                },
                { type: "address", value: wrappedData.data.wrapped.contract },
            ]);
        },
        async validateAddress(adr) {
            return provider.isAddress(adr);
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBY3pDLGtEQUEwQjtBQUcxQixpQ0FBaUM7QUFDakMsOERBQXNDO0FBRXRDLHNFQUE0RTtBQUc1RSwrREFLOEI7QUFDOUIsMEJBYVk7QUFxRUwsS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFpQjtJQUVqQixNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQWtCLEVBQUUsRUFBRTtRQUN2QyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxRQUFvQixFQUFFLEVBQUU7UUFDcEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBCLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUM3QyxHQUFHLEVBQUUsNkNBQXNCLENBQUMsR0FBRztZQUMvQixRQUFRLEVBQUUsNkNBQXNCLENBQUMsUUFBUTtZQUN6QyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsS0FBaUIsRUFBRSxFQUFFO1FBQ2xELFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLHFDQUFjLENBQUMsR0FBRztZQUN2QixRQUFRLEVBQUUscUNBQWMsQ0FBQyxRQUFRO1lBQ2pDLFFBQVEsRUFBRSxVQUFVO1NBQ3JCLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMs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