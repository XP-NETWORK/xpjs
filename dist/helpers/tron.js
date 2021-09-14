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
        async mintNft(contract_owner, options) {
            setSigner(contract_owner);
            const erc = await provider.contract(fakeERC1155_json_1.abi, options.contract);
            await erc.mint(options.owner, bignumber_1.BigNumber.from(options.token.toString()), 1).send();
            await erc.setURI(options.token, options.uri).send();
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
                paramters: [...validators, threshold]
            });
            await xpnet.transferOwnership(minter.address).send();
            return [minter.address, xpnet.address];
        }
    };
}
exports.baseTronHelperFactory = baseTronHelperFactory;
async function tronHelperFactory(provider, erc1155_addr, minter_addr, minter_abi) {
    const base = await baseTronHelperFactory(provider);
    const erc1155 = await provider.contract(fakeERC1155_json_1.abi, erc1155_addr);
    const minter = await provider.contract(minter_abi, minter_addr);
    const setSigner = (signer) => {
        return provider.setPrivateKey(signer);
    };
    async function extractTxn(hash) {
        const evs = await provider.getEventByTransactionID(hash);
        const ev = evs.find((e) => (e === null || e === void 0 ? void 0 : e.contract_address) == minter_addr);
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
            return await extractTxn(res.txID);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            setSigner(sender);
            const res = await minter.withdraw(chain_nonce, to, value).send();
            return await extractTxn(res.txID);
        },
        async unfreezeWrappedNft(sender, to, id) {
            setSigner(sender);
            const res = await minter.withdraw_nft(to, id).send();
            return await extractTxn(res.txID);
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
                    .safeTransferFrom(sender, minter_addr, id.token, call_data)
                    .send();
            }
            else {
                ev = "TransferErc1155";
                const erc = await provider.contract(fakeERC1155_json_1.abi, id.contract);
                txr = await erc
                    .safeTransferFrom(sender, minter_addr, id.token, bignumber_1.BigNumber.from(1), call_data)
                    .send();
            }
            ev.toString();
            return await extractTxn(txr.txID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF5QztBQWN6QywwREFBeUQ7QUFNekQsc0VBQTRFO0FBQzVFLHdEQUF1RDtBQUN2RCx5Q0FBbUM7QUFDbkMsc0RBQWtFO0FBQ2xFLGdFQUFrRDtBQUNsRCxnRUFBa0Q7QUFvQzNDLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBaUI7SUFFakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRTtRQUNuQyxPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsQ0FBQyxDQUFDO0lBRUYsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBRSxFQUFFO1FBQy9DLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDOUMsR0FBRyxFQUFFLHNCQUFXO1lBQ2hCLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1lBQ25DLFFBQVEsRUFBRSxVQUFVO1NBQ3BCLENBQUMsQ0FBQTtRQUVGLE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUMsQ0FBQTtJQUVELE9BQU87UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQXNCLEVBQUUsT0FBaUI7WUFDckQsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxzQkFBVyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuRSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxxQkFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEs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