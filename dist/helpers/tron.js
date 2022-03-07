"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tronHelperFactory = exports.baseTronHelperFactory = void 0;
const bignumber_js_1 = require("bignumber.js");
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
    const deployXpNft = async (deployer, nftPrefix) => {
        setSigner(deployer);
        const contract = await provider.contract().new({
            abi: xpnet_web3_contracts_1.XPNft__factory.abi,
            bytecode: xpnet_web3_contracts_1.XPNft__factory.bytecode,
            feeLimit: 3000000000,
            parameters: ["XPNFT", "XPNFT", nftPrefix],
        });
        return contract;
    };
    const deployXpNft1155 = async (deployer, nftPrefix) => {
        setSigner(deployer);
        const contract = await provider.contract().new({
            abi: xpnet_web3_contracts_1.XPNft1155__factory.abi,
            bytecode: xpnet_web3_contracts_1.XPNft1155__factory.bytecode,
            feeLimit: 3000000000,
            parameters: [nftPrefix],
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
        async deployMinter(deployer, frostGroupKey, xpnftPrefix, xpnftPrefix1155, whitelist = []) {
            if (whitelist.length == 0) {
                const unft = await deployErc721_i(deployer);
                whitelist.push(unft.address);
            }
            const gk = Buffer.from(frostGroupKey, "hex");
            const gkx = bignumber_1.BigNumber.from(`0x${gk.slice(1).toString("hex")}`);
            // gkyp is either 0 or 1
            const gkyp = bignumber_1.BigNumber.from(`0x${gk[0] & 1}`);
            const erc721 = await deployXpNft(deployer, xpnftPrefix);
            const erc1155 = await deployXpNft1155(deployer, xpnftPrefix1155);
            const minter = await provider.contract().new({
                abi: xpnet_web3_contracts_1.Minter__factory.abi,
                bytecode: xpnet_web3_contracts_1.Minter__factory.bytecode,
                feeLimit: 6000000000,
                parameters: [gkx, gkyp, whitelist],
            });
            await erc721.transferOwnership(minter.address).send();
            await erc1155.transferOwnership(minter.address).send();
            const minterAddress = provider.address.fromHex(minter.address);
            const erc721Address = provider.address.fromHex(erc721.address);
            const erc1155Address = provider.address.fromHex(erc1155.address);
            return {
                minter: minterAddress,
                xpnft: erc721Address,
                xpnft1155: erc1155Address,
                whitelist,
            };
        },
    };
}
exports.baseTronHelperFactory = baseTronHelperFactory;
async function tronHelperFactory(tronParams) {
    const { provider, minter_addr } = tronParams;
    const station = new tronstation_1.default(provider);
    const base = await baseTronHelperFactory(provider);
    const minter = await provider.contract(xpnet_web3_contracts_1.Minter__factory.abi, minter_addr);
    const setSigner = (signer) => {
        return signer && provider.setPrivateKey(signer);
    };
    async function notifyValidator(hash) {
        await tronParams.notifier.notifyTron(hash);
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
        isApprovedForMinter,
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
        async unfreezeWrappedNft(sender, to, id, txFees) {
            setSigner(sender);
            const res = await minter
                .withdrawNft(to, id.native.tokenId)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
            await notifyValidator(res);
            return res;
        },
        getNonce() {
            return __1.Chain.TRON;
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
            setSigner(sender);
            await approveForMinter(id, sender);
            const txr = await minter
                .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to, mintWith)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
            await notifyValidator(txr);
            return txr;
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
        async estimateValidateUnfreezeNft(_to, _nft) {
            return new bignumber_js_1.BigNumber(0); // TODO
        },
        async validateAddress(adr) {
            return provider.isAddress(adr);
        },
        isNftWhitelisted(nft) {
            return minter.nftWhitelist(nft.native.contract).call({
                from: tronParams.provider.defaultAddress.base58,
            });
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBV3pDLGlDQUFpQztBQUNqQyw4REFBc0M7QUFFdEMsc0VBQTRFO0FBRTVFLCtEQUs4QjtBQUM5QiwwQkFZWTtBQTZETCxLQUFLLFVBQVUscUJBQXFCLENBQ3pDLFFBQWlCO0lBRWpCLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBa0IsRUFBRSxFQUFFO1FBQ3ZDLE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsRUFBRTtRQUNwRCxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSw2Q0FBc0IsQ0FBQyxHQUFHO1lBQy9CLFFBQVEsRUFBRSw2Q0FBc0IsQ0FBQyxRQUFRO1lBQ3pDLFFBQVEsRUFBRSxVQUFVO1NBQ3JCLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztJQUVGLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxRQUFvQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUNwRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSxxQ0FBYyxDQUFDLEdBQUc7WUFDdkIsUUFBUSxFQUFFLHFDQUFjLENBQUMsUUFBUTtZQUNqQyxRQUFRLEVBQUUsVUFBVTtZQUNwQixVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FB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