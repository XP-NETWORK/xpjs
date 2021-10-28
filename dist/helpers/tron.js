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
const js_base64_1 = require("js-base64");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const validator_1 = require("validator");
async function baseTronHelperFactory(provider) {
    const setSigner = (signer) => {
        return provider.setPrivateKey(signer);
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
        return provider.setPrivateKey(signer);
    };
    async function extractTxn(hash) {
        await event_middleware.post("/tx/tron", { tx_hash: hash });
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
    const nftUri = async (contract, tokenId) => {
        const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, contract);
        return {
            uri: await erc.tokenURI(tokenId).call(),
            chainId: tronParams.nonce.toString(),
        };
    };
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
    return Object.assign(Object.assign({}, base), { async populateNft(nft) {
            return await nftUri(nft.native.contract, nft.native.tokenId);
        },
        async decodeNftFromRaw(data) {
            const packed = validator_1.NftEthNative.deserializeBinary(data);
            return {
                uri: "",
                native: {
                    uri: "",
                    contract: packed.getContractAddr(),
                    tokenId: packed.getId(),
                    owner: minter_addr,
                    chainId: tronParams.nonce.toString(),
                },
            };
        },
        isWrappedNft(nft) {
            return nft.native.contract === tronParams.erc721_addr;
        },
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data.native.uri);
            const packed = validator_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8(),
            };
        },
        async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const val = bignumber_1.BigNumber.from(value.toString());
            const totalVal = val.add(bignumber_1.BigNumber.from(txFees.toString()));
            let res = await minter
                .freeze(chain_nonce, to, val)
                .send({ callValue: totalVal });
            return await extractTxn(res);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const res = await minter
                .withdraw(chain_nonce, to, value)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(res);
        },
        async unfreezeWrappedNft(sender, to, id, txFees) {
            setSigner(sender);
            const res = await minter
                .withdrawNft(to, id.native.tokenId)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(res);
        },
        getNonce() {
            return tronParams.nonce;
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            setSigner(sender);
            const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, id.native.contract);
            await erc.approve(minter.address, id.native.tokenId).send();
            const txr = await minter
                .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(txr);
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
        async estimateValidateTransferNft(to, nft) {
            const encoded = new validator_1.NftPacked();
            encoded.setChainNonce(0x1351);
            encoded.setData(nft);
            return await estimateGas(tronParams.validators, "validateTransferNft(uint128,address,string)", [
                { type: "uint128", value: randomAction() },
                { type: "address", value: to },
                {
                    type: "string",
                    value: Buffer.from(nft).toString("base64"),
                },
            ]);
        },
        async estimateValidateUnfreezeNft(to, nft) {
            const data = js_base64_1.Base64.toUint8Array(nft.native.uri);
            const nft_dat = validator_1.NftEthNative.deserializeBinary(data);
            return await estimateGas(tronParams.validators, "validateUnfreezeNft(uint128,address,uint256,address)", [
                { type: "uint128", value: randomAction() },
                { type: "address", value: to },
                { type: "uint256", value: nft_dat.getId().toString() },
                { type: "address", value: nft_dat.getContractAddr() },
            ]);
        },
        wrapNftForTransfer(nft) {
            // Protobuf is not deterministic, though perhaps we can approximate this statically
            const tokdat = new validator_1.NftEthNative();
            tokdat.setId(nft.native.tokenId);
            tokdat.setNftKind(1);
            tokdat.setContractAddr(nft.native.contract);
            return tokdat.serializeBinary();
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBaUJ6QyxrREFBMEI7QUFHMUIsaUNBQWlDO0FBQ2pDLDhEQUFzQztBQUV0QyxzRUFBNEU7QUFDNUUseUNBQW1DO0FBRW5DLCtEQUs4QjtBQUU5Qix5Q0FBb0Q7QUErRDdDLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBaUI7SUFFakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRTtRQUNuQyxPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsQ0FBQyxDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLFFBQWdCLEVBQUUsRUFBRTtRQUNoRCxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSw2Q0FBc0IsQ0FBQyxHQUFHO1lBQy9CLFFBQVEsRUFBRSw2Q0FBc0IsQ0FBQyxRQUFRO1lBQ3pDLFFBQVEsRUFBRSxVQUFVO1NBQ3JCLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztJQUVGLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsRUFBRTtRQUM5QyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSxxQ0FBYyxDQUFDLEdBQUc7WUFDdkIsUUFBUSxFQUFFLHFDQUFjLENBQUMsUUFBUTtZQUNqQyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixD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