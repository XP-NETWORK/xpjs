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
            await erc.mint(options.uris[0]).send();
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
    async function extractTxn(hash) {
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
        return [hash, action_id];
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
            from: tronParams.provider.defaultAddress.base58
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
            return true;
        }
        await erc.approve(minter_addr, id.native.tokenId).send();
        return true;
    };
    return Object.assign(Object.assign({}, base), { approveForMinter,
        isWrappedNft(nft) {
            return nft.native.contract.toLowerCase() === tronParams.erc721_addr.toLowerCase();
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
                { type: "uint256", value: bignumber_1.BigNumber.from(wrappedData.data.wrapped.tokenId) },
                { type: "address", value: wrappedData.data.wrapped.contract },
            ]);
        },
        async validateAddress(adr) {
            return provider.isAddress(adr);
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBY3pDLGtEQUEwQjtBQUcxQixpQ0FBaUM7QUFDakMsOERBQXNDO0FBRXRDLHNFQUE0RTtBQUc1RSwrREFLOEI7QUFnRXZCLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBaUI7SUFFakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFrQixFQUFFLEVBQUU7UUFDdkMsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxFQUFFO1FBQ3BELFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLDZDQUFzQixDQUFDLEdBQUc7WUFDL0IsUUFBUSxFQUFFLDZDQUFzQixDQUFDLFFBQVE7WUFDekMsUUFBUSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLEtBQWlCLEVBQUUsRUFBRTtRQUNsRCxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSxxQ0FBYyxDQUFDLEdBQUc7WUFDdkIsUUFBUSxFQUFFLHFDQUFjLENBQUMsUUFBUTtZQUNqQyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixN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