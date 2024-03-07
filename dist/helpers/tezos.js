"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.tezosHelperFactory = void 0;
const taquito_1 = require("@taquito/taquito");
const __1 = require("..");
const utils = __importStar(require("@taquito/utils"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
async function tezosHelperFactory({ Tezos, notifier, xpnftAddress, bridgeAddress, validators, feeMargin, }) {
    const estimateGas = (validators, baseprice) => {
        return new bignumber_js_1.default(baseprice * (validators.length + 1));
    };
    async function withContract(sender, contract, cb, params) {
        if ("publicKeyHash" in sender) {
            Tezos.setSignerProvider(sender);
            const contractI = await Tezos.contract.at(contract);
            const res = cb(contractI);
            const tx = await res.send(params);
            await tx.confirmation();
            return tx.hash;
        }
        else {
            Tezos.setWalletProvider(sender);
            const contractI = await Tezos.wallet.at(contract);
            const res = cb(contractI);
            const estim = await Tezos.estimate
                .transfer(res.toTransferParams(params))
                .catch(() => ({ storageLimit: 0 }));
            if (params) {
                if (!params.storageLimit)
                    params.storageLimit = estim.storageLimit;
            }
            else {
                params = { storageLimit: estim.storageLimit };
            }
            const tx = await res.send(params);
            await tx.confirmation();
            return tx.opHash;
        }
    }
    function withBridge(sender, cb, params) {
        return withContract(sender, bridgeAddress, cb, params);
    }
    function getAddress(sender) {
        if ("publicKeyHash" in sender) {
            return sender.publicKeyHash();
        }
        else {
            return sender.getPKH();
        }
    }
    async function isApprovedForMinter(nft, sender) {
        const owner = await getAddress(sender);
        const contract = await Tezos.contract.at(nft.native.contract);
        const storage = await contract.storage();
        const storageOperator = storage.operator || storage.operators;
        const args = storage.operator
            ? [bridgeAddress, nft.native.tokenId, owner]
            : {
                owner,
                operator: bridgeAddress,
                token_id: nft.native.tokenId,
            };
        const op = await storageOperator?.get(args);
        return op != undefined;
    }
    async function notifyValidator(hash) {
        await notifier.notifyTezos(hash);
    }
    async function preTransfer(signer, nft) {
        if (await isApprovedForMinter(nft, signer)) {
            return;
        }
        const owner = await getAddress(signer);
        return await withContract(signer, nft.native.contract, (contract) => contract.methods.update_operators([
            {
                add_operator: {
                    owner,
                    operator: bridgeAddress,
                    token_id: nft.native.tokenId,
                },
            },
        ]));
    }
    let transferNft = async (sender, chain, to, nft, fee, mw, amt) => {
        console.log(`bruh`);
        //       await preTransfer(sender, nft);
        const hash = await withBridge(sender, (bridge) => bridge.methodsObject.freeze_fa2({
            fa2_address: nft.collectionIdent,
            token_id: nft.native.tokenId,
            chain_nonce: chain,
            to,
            mint_with: mw,
            amt,
        }), { amount: fee.toNumber() / 1e6 });
        notifyValidator(hash);
        return hash;
    };
    let unfreezeWrappedNft = async (sender, to, nft, fee, nonce, amt) => {
        const hash = await withBridge(sender, (bridge) => {
            return bridge.methodsObject.withdraw_nft({
                amt,
                burner: nft.native.contract,
                chain_nonce: nonce,
                to,
                token_id: nft.native.tokenId,
            });
        }, { amount: fee.toNumber() / 1e6 });
        notifyValidator(hash);
        return hash;
    };
    return {
        XpNft: xpnftAddress,
        XpNft1155: xpnftAddress,
        transferNftToForeign: (sender, chain, to, nft, fee, mw) => transferNft(sender, chain, to, nft, fee, mw, 1),
        transferNftBatchToForeign: (sender, chain_nonce, to, id, mintWith, txFees) => transferNft(sender, chain_nonce, to, id[0], txFees, mintWith, id.length),
        async balance(address) {
            return new bignumber_js_1.default((await Tezos.tz.getBalance(address)).toString(10));
        },
        unfreezeWrappedNftBatch: (sender, chainNonce, to, nfts, txFees) => unfreezeWrappedNft(sender, to, nfts[0], txFees, chainNonce, nfts.length),
        unfreezeWrappedNft: (sender, to, nft, txFees, chainNonce) => unfreezeWrappedNft(sender, to, nft, txFees, chainNonce, 1),
        async mintNft(signer, { identifier, contract, uri, to, amt }) {
            const metadata = new taquito_1.MichelsonMap();
            metadata.set("", utils.char2Bytes(uri));
            return await withContract(signer, contract, (umt) => umt.methods.mint(to, amt, metadata, identifier));
        },
        async validateAddress(adr) {
            return Promise.resolve(utils.validateAddress(adr) === utils.ValidationResult.VALID);
        },
        getNonce() {
            return __1.Chain.TEZOS;
        },
        getFeeMargin() {
            return feeMargin;
        },
        async estimateValidateTransferNft() {
            return estimateGas(validators, 1.2e5);
        },
        async estimateValidateUnfreezeNft() {
            return estimateGas(validators, 1.2e4);
        },
        async estimateValidateTransferNftBatch(_, ids) {
            return estimateGas(validators, 1.2e5 * ids.length);
        },
        async estimateValidateUnfreezeNftBatch(_, ids) {
            return estimateGas(validators, 1.2e4 * ids.length);
        },
        preTransfer,
        isApprovedForMinter,
        approveForMinter: (nft, sender) => preTransfer(sender, nft),
        async isNftWhitelisted(nft) {
            const bridge = await Tezos.contract.at(bridgeAddress);
            const storage = await bridge.storage();
            const whitelisted = await storage.nft_whitelist.get(nft.native.contract);
            return whitelisted == 2;
        },
        async getTokenURI(contract, tokenId) {
            if (utils.validateAddress(contract) && tokenId) {
                const _contract = await Tezos.contract.at(contract);
                const storage = (await _contract.storage());
                const tokenStorage = await storage.token_metadata.get(tokenId);
                if (tokenStorage) {
                    return utils.bytes2Char(tokenStorage.token_info?.get(""));
                }
            }
            return "";
        },
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQWEwQjtBQUMxQiwwQkFXWTtBQUVaLHNEQUF3QztBQUN4QyxnRUFBcUM7QUFxRTlCLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxFQUN2QyxLQUFLLEVBQ0wsUUFBUSxFQUNSLFlBQVksRUFDWixhQUFhLEVBQ2IsVUFBVSxFQUNWLFNBQVMsR0FDRztJQUNaLE1BQU0sV0FBVyxHQUFHLENBQUMsVUFBb0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7UUFDOUQsT0FBTyxJQUFJLHNCQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUMsQ0FBQztJQUVGLEtBQUssVUFBVSxZQUFZLENBQ3pCLE1BQW1CLEVBQ25CLFFBQWdCLEVBQ2hCLEVBRThDLEVBQzlDLE1BQTRCO1FBRTVCLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRTtZQUM3QixLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFaEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVwRCxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hCLE9BQVEsRUFBMkIsQ0FBQyxJQUFJLENBQUM7U0FDMUM7YUFBTTtZQUNMLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxNQUFNLFNBQVMsR0FBRyxNQUFN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