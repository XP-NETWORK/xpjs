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
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEJBWVk7QUFlWixzREFBd0M7QUFDeEMsZ0VBQXFDO0FBNkM5QixLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDdkMsS0FBSyxFQUNMLFFBQVEsRUFDUixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsRUFDVixTQUFTLEdBQ0c7SUFDWixNQUFNLFdBQVcsR0FBRyxDQUFDLFVBQW9CLEVBQUUsU0FBaUIsRUFBRSxFQUFFO1FBQzlELE9BQU8sSUFBSSxzQkFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDLENBQUM7SUFFRixLQUFLLFVBQVUsWUFBWSxDQUN6QixNQUFtQixFQUNuQixRQUFnQixFQUNoQixFQUU4QyxFQUM5QyxNQUE0QjtRQUU1QixJQUFJLGVBQWUsSUFBSSxNQUFNLEVBQUU7WUFDN0IsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN4QixPQUFRLEVBQTJCLENBQUMsSUFBSSxDQUFDO1NBQzFDO2FBQU07WUFDTCxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsTUFBTSxD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