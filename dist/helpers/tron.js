"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const ERC1155_contract = __importStar(require("../XPNet.json"));
const Minter_contract = __importStar(require("../Minter.json"));
const axios_1 = __importDefault(require("axios"));
async function baseTronHelperFactory(provider) {
    const setSigner = (signer) => {
        return provider.setPrivateKey(signer);
    };
    const deployErc1155_i = async (owner) => {
        setSigner(owner);
        const contract = await provider.contract().new({
            abi: fakeERC1155_json_1.abi,
            bytecode: ERC1155_contract.bytecode,
            feeLimit: 3000000000
        });
        return contract;
    };
    return {
        async mintNft(owner, options) {
            setSigner(owner);
            const erc = await provider.contract(fakeERC721_json_1.abi, options.contract);
            await erc.mint(bignumber_1.BigNumber.from(options.token.toString()), options.uri).send();
        },
        async balance(address) {
            const balance = await provider.trx.getBalance(address);
            return new bignumber_js_1.BigNumber(balance);
        },
        deployErc1155: async (owner) => await deployErc1155_i(owner).then((c) => c.address),
        async deployMinter(deployer, validators, threshold) {
            setSigner(deployer); // deployErc1155 sets this anyways but we don't wanna depend on side effects
            const xpnet = await deployErc1155_i(deployer);
            const minter = await provider.contract().new({
                abi: Minter_contract.abi,
                bytecode: Minter_contract.bytecode,
                feeLimit: 3000000000,
                parameters: [validators, threshold, xpnet.address]
            });
            await xpnet.transferOwnership(minter.address).send();
            return [minter.address, xpnet.address];
        }
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
            "Content-Type": "application/json"
        }
    });
    const setSigner = (signer) => {
        return provider.setPrivateKey(signer);
    };
    async function extractTxn(hash) {
        await event_middleware.post("/tx/tron", { tx_hash: hash });
        await new Promise(r => setTimeout(r, 6000));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEv = async (retries = 0) => {
            const res = await provider.getEventByTransactionID(hash);
            if (res.length !== 0) {
                return res;
            }
            if (retries > 15) {
                throw Error("Couldn't fetch transaction after more than 15 retries!");
            }
            await new Promise(r => setTimeout(r, 3000));
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
        }, nftUri: nftUri, async transferNativeToForeign(sender, chain_nonce, to, value) {
            setSigner(sender);
            let res = await minter.freeze(chain_nonce, to).send({ callValue: value });
            return await extractTxn(res);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            setSigner(sender);
            const res = await minter.withdraw(chain_nonce, to, value).send();
            return await extractTxn(res);
        },
        async unfreezeWrappedNft(sender, to, id) {
            setSigner(sender);
            const res = await minter.withdraw_nft(to, id).send();
            return await extractTxn(res);
        },
        async transferNftToForeign(sender, chain_nonce, to, id) {
            let txr;
            let ev;
            const call_data = Buffer.concat([
                Buffer.from(new Int32Array([0]).buffer),
                Buffer.from(new Int32Array([chain_nonce]).buffer).reverse(),
                Buffer.from(to, "utf-8"),
            ]);
            setSigner(sender);
            if (id.contract_type == "ERC721") {
                ev = "TransferErc721";
                const erc = await provider.contract(fakeERC721_json_1.abi, id.contract);
                await erc
                    .safeTransferFrom(provider.defaultAddress.base58, minter_addr, id.token, call_data)
                    .send();
            }
            else {
                ev = "TransferErc1155";
                const erc = await provider.contract(fakeERC1155_json_1.abi, id.contract);
                txr = await erc
                    .safeTransferFrom(provider.defaultAddress.base58, minter_addr, id.token, bignumber_1.BigNumber.from(1), call_data)
                    .send();
            }
            ev.toString();
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
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF5QztBQWN6QywwREFBeUQ7QUFNekQsc0VBQTRFO0FBQzVFLHdEQUF1RDtBQUN2RCx5Q0FBbUM7QUFDbkMsc0RBQWtFO0FBQ2xFLGdFQUFrRDtBQUNsRCxnRUFBa0Q7QUFDbEQsa0RBQTBCO0FBc0NuQixLQUFLLFVBQVUscUJBQXFCLENBQ3pDLFFBQWlCO0lBRWpCLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDbkMsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FBQztJQUVGLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsRUFBRTtRQUMvQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQzlDLEdBQUcsRUFBRSxzQkFBVztZQUNoQixRQUFRLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtZQUNuQyxRQUFRLEVBQUUsVUFBVTtTQUNwQixDQUFDLENBQUE7UUFFRixPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDLENBQUE7SUFFRCxPQUFPO1FBQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBaUI7WUFDNUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxxQkFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUs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