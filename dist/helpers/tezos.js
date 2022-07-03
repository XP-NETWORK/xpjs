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
            const estim = await Tezos.estimate.transfer(res.toTransferParams(params));
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
    async function isApprovedForMinter(sender, nft) {
        var _a;
        const owner = await getAddress(sender);
        const contract = await Tezos.contract.at(nft.native.contract);
        const storage = await contract.storage();
        let op = await ((_a = storage === null || storage === void 0 ? void 0 : storage.operators) === null || _a === void 0 ? void 0 : _a.get({
            owner,
            operator: bridgeAddress,
            token_id: nft.native.token_id,
        }));
        return op != undefined;
    }
    async function notifyValidator(hash) {
        await notifier.notifyTezos(hash);
    }
    async function preTransfer(signer, nft) {
        if (await isApprovedForMinter(signer, nft)) {
            return;
        }
        const owner = await getAddress(signer);
        return await withContract(signer, nft.native.contract, (contract) => contract.methods.update_operators([
            {
                add_operator: {
                    owner,
                    operator: bridgeAddress,
                    token_id: nft.native.token_id,
                },
            },
        ]));
    }
    return {
        XpNft: xpnftAddress,
        async transferNftToForeign(sender, chain, to, nft, fee, mw) {
            //       await preTransfer(sender, nft);
            const hash = await withBridge(sender, (bridge) => bridge.methods.freeze_fa2(chain, nft.collectionIdent, mw, to, parseInt(nft.native.token_id)), { amount: fee.toNumber() / 1e6 });
            notifyValidator(hash);
            return hash;
        },
        async balance(address) {
            return new bignumber_js_1.default((await Tezos.tz.getBalance(address)).toString(10));
        },
        async unfreezeWrappedNft(sender, to, nft, fee, nonce) {
            const hash = await withBridge(sender, (bridge) => {
                return bridge.methods.withdraw_nft(nft.native.contract, nonce, to, parseInt(nft.native.token_id));
            }, { amount: fee.toNumber() / 1e6 });
            notifyValidator(hash);
            return hash;
        },
        async mintNft(signer, { identifier, attrs, contract, uris }) {
            return await withContract(signer, xpnftAddress, (xpnft) => xpnft.methods.mint({
                token_id: identifier,
                address: contract,
                metadata: {
                    uri: uris[0],
                    attrs,
                },
                amount: 1,
            }));
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
        preTransfer,
        isApprovedForMinter,
        approveForMinter: (nft, sender) => preTransfer(sender, nft),
        async isNftWhitelisted(nft) {
            const bridge = await Tezos.contract.at(bridgeAddress);
            const storage = await bridge.storage();
            const whitelisted = await storage.nft_whitelist.get(nft.native.contract);
            return whitelisted == 2;
        },
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQVlZO0FBZVosc0RBQXdDO0FBQ3hDLGdFQUFxQztBQThDOUIsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQ3ZDLEtBQUssRUFDTCxRQUFRLEVBQ1IsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEVBQ1YsU0FBUyxHQUNHO0lBQ1osTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFvQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUM5RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFlBQVksQ0FDekIsTUFBbUIsRUFDbkIsUUFBZ0IsRUFDaEIsRUFFOEMsRUFDOUMsTUFBNEI7UUFFNUIsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoQyxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQixNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsT0FBUSxFQUEyQixDQUFDLElBQUksQ0FBQztTQUMxQzthQUFNO1lBQ0wsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLE1B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