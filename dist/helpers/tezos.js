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
                    params.storageLimit = 60000;
            }
            else {
                params = { storageLimit: 60000 };
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
        let op = await storage.operators.get({
            owner,
            operator: bridgeAddress,
            token_id: nft.native.token_id,
        });
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