"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tronHelperFactory = exports.baseTronHelperFactory = void 0;
const bignumber_js_1 = require("bignumber.js");
const fakeERC1155_json_1 = require("../fakeERC1155.json");
const bignumber_1 = require("@ethersproject/bignumber/lib/bignumber");
const fakeERC721_json_1 = require("../fakeERC721.json");
const js_base64_1 = require("js-base64");
const encoding_1 = require("validator/dist/encoding");
const axios_1 = __importDefault(require("axios"));
async function baseTronHelperFactory(provider) {
    const setSigner = (signer) => {
        return provider.setPrivateKey(signer);
    };
    const deployErc721_i = async (owner) => {
        setSigner(owner);
        const contract = await provider.contract().new({
            abi: fakeERC721_json_1.abi,
            bytecode: fakeERC721_json_1.bytecode,
            feeLimit: 3000000000,
        });
        return contract;
    };
    return {
        async mintNft(owner, options) {
            setSigner(owner);
            const erc = await provider.contract(fakeERC721_json_1.abi, options.contract);
            await erc.mint(options.uri).send();
        },
        async balance(address) {
            const balance = await provider.trx.getBalance(address);
            return new bignumber_js_1.BigNumber(balance);
        },
        deployErc721: async (owner) => await deployErc721_i(owner).then((c) => c.address),
    };
}
exports.baseTronHelperFactory = baseTronHelperFactory;
async function tronHelperFactory(provider, middleware_uri, erc1155_addr, minter_addr, minter_abi) {
    const base = await baseTronHelperFactory(provider);
    const erc1155 = await provider.contract(fakeERC1155_json_1.abi, erc1155_addr);
    const minter = await provider.contract(minter_abi, minter_addr);
    const event_middleware = axios_1.default.create({
        baseURL: middleware_uri,
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
        const action_id = ev.result["action_id"].toString();
        return [hash, action_id];
    }
    const nftUri = async (info) => {
        if (info.contract_type == "ERC721") {
            const erc = await provider.contract(fakeERC721_json_1.abi, info.contract);
            return await erc.tokenURI(info.token).call();
        }
        else {
            const erc = await provider.contract(fakeERC1155_json_1.abi, info.contract);
            return await erc.uri(info.token).call();
        }
    };
    function contractTypeFromNftKind(kind) {
        return kind === encoding_1.NftEthNative.NftKind.ERC721 ? "ERC721" : "ERC1155";
    }
    const randomAction = () => bignumber_1.BigNumber.from(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
    async function estimateGas(addrs, utx) {
        let fee = bignumber_1.BigNumber.from(0);
        for (const [i, addr] of addrs.entries()) {
            utx.from = addr;
            let tf = bignumber_1.BigNumber.from(400000); // TODO: Proper estimate
            if (i == addrs.length - 1 && addrs.length != 1)
                tf = tf.mul(2);
            fee = fee.add(tf);
        }
        fee = fee.mul(1.41e14); // TODO: proper gas price estimate
        return new bignumber_js_1.BigNumber(fee.toString());
    }
    return Object.assign(Object.assign({}, base), { async decodeUrlFromRaw(data) {
            const packed = encoding_1.NftEthNative.deserializeBinary(data);
            const nft_info = {
                contract_type: contractTypeFromNftKind(packed.getNftKind()),
                contract: packed.getContractAddr(),
                token: bignumber_1.BigNumber.from(packed.getId()),
            };
            return await nftUri(nft_info);
        },
        decodeWrappedNft(raw_data) {
            const u8D = js_base64_1.Base64.toUint8Array(raw_data);
            const packed = encoding_1.NftPacked.deserializeBinary(u8D);
            return {
                chain_nonce: packed.getChainNonce(),
                data: packed.getData_asU8(),
            };
        }, nftUri: nftUri, async transferNativeToForeign(sender, chain_nonce, to, value, txFees) {
            setSigner(sender);
            const totalVal = bignumber_1.BigNumber.from(value.toString()).add(bignumber_1.BigNumber.from(txFees.toString()));
            let res = await minter
                .freeze(chain_nonce, to)
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
                .withdraw_nft(to, id)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString()) });
            return await extractTxn(res);
        },
        async transferNftToForeign(sender, chain_nonce, to, id, txFees) {
            setSigner(sender);
            const erc = await provider.contract(fakeERC721_json_1.abi, id.contract);
            await erc.approve(minter.address, id.token).send();
            const txr = await minter
                .freeze_erc721(id.contract, id.token, chain_nonce, to)
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
        async estimateValidateTransferNft(validators, to, nft) {
            // Protobuf is not deterministic, though perhaps we can approximate this statically
            const tokdat = new encoding_1.NftEthNative();
            tokdat.setId(nft.token.toString());
            tokdat.setNftKind(1);
            tokdat.setContractAddr(nft.contract);
            const encoded = new encoding_1.NftPacked();
            encoded.setChainNonce(0x1351);
            encoded.setData(tokdat.serializeBinary());
            const utx = minter.validate_transfer_nft(randomAction(), to, Buffer.from(encoded.serializeBinary()).toString("base64"));
            return await estimateGas(validators, utx);
        },
        async estimateValidateUnfreezeNft(validators, to, nft_data) {
            const nft_dat = encoding_1.NftEthNative.deserializeBinary(nft_data);
            const utx = minter.validate_unfreeze_nft(randomAction(), to, bignumber_1.BigNumber.from(nft_dat.getId().toString()), nft_dat.getContractAddr());
            return await estimateGas(validators, utx);
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0NBQXlDO0FBY3pDLDBEQUF5RDtBQU16RCxzRUFBNEU7QUFDNUUsd0RBRzRCO0FBQzVCLHlDQUFtQztBQUNuQyxzREFBa0U7QUFDbEUsa0RBQTBCO0FBNkJuQixLQUFLLFVBQVUscUJBQXFCLENBQ3pDLFFBQWlCO0lBRWpCLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDbkMsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsRUFBRTtRQUM3QyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzdDLEdBQUcsRUFBRSxxQkFBVTtZQUNmLFFBQVEsRUFBRSwwQkFBZTtZQUN6QixRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBaUI7WUFDNUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDM0IsTUFBTSxPQUFPLEdBQUcsTUFBTSxR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