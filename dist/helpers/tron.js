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
                parameters: [validators, threshold, xpnet.address]
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
        await new Promise(r => setTimeout(r, 6000));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEv = async () => {
            const res = await provider.getEventByTransactionID(hash);
            if (res.length !== 0) {
                return res;
            }
            await new Promise(r => setTimeout(r, 3000));
            return getEv();
        };
        const evs = await getEv();
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