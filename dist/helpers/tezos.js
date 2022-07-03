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
            if (params) {
                if (!params.storageLimit)
                    params.storageLimit = 5000;
            }
            else {
                params = { storageLimit: 5000 };
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
        const owner = await getAddress(sender);
        const contract = await Tezos.contract.at(nft.native.contract);
        const storage = await contract.storage();
        let op = storage.operators
            ? await storage.operators.get({
                owner,
                operator: bridgeAddress,
                token_id: nft.native.token_id,
            })
            : storage.operator;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQVlZO0FBZVosc0RBQXdDO0FBQ3hDLGdFQUFxQztBQThDOUIsS0FBSyxVQUFVLGtCQUFrQixDQUFDLEVBQ3ZDLEtBQUssRUFDTCxRQUFRLEVBQ1IsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEVBQ1YsU0FBUyxHQUNHO0lBQ1osTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFvQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtRQUM5RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFlBQVksQ0FDekIsTUFBbUIsRUFDbkIsUUFBZ0IsRUFDaEIsRUFFOEMsRUFDOUMsTUFBNEI7UUFFNUIsSUFBSSxlQUFlLElBQUksTUFBTSxFQUFFO1lBQzdCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQixNQUFNLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDeEIsT0FBUSxFQUEyQixDQUFDLElBQUksQ0FBQztTQUMxQzthQUFNO1lBQ0wsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLE1B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