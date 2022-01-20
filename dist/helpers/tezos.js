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
const utils = __importStar(require("@taquito/utils"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const axios_1 = __importDefault(require("axios"));
async function tezosHelperFactory({ Tezos, middlewareUri, xpnftAddress, bridgeAddress, validators, }) {
    const bridge = await Tezos.contract.at(bridgeAddress);
    const xpnft = await Tezos.contract.at(xpnftAddress);
    const event_middleware = axios_1.default.create({
        baseURL: middlewareUri,
        headers: {
            "Content-Type": "application/json",
        },
    });
    const estimateGas = (validators, baseprice) => {
        return new bignumber_js_1.default(baseprice * (validators.length + 1));
    };
    async function sendTx(sender, tx) {
        if ("publicKeyHash" in sender) {
            Tezos.setSignerProvider(sender);
            const res = await Tezos.contract.transfer(tx);
            await res.confirmation();
            return res.hash;
        }
        else {
            Tezos.setWalletProvider(sender);
            const res = await Tezos.wallet.transfer(tx).send();
            await res.confirmation();
            return res.opHash;
        }
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
        const contract = await Tezos.contract.at(nft.native.contract);
        const ownerAddr = await getAddress(sender);
        const storage = await contract.storage();
        return (typeof (await storage.operators.get({
            owner: ownerAddr,
            operator: bridge.address,
            token_id: nft.native.token_id,
        })) == "symbol");
    }
    async function notifyValidator(hash) {
        await event_middleware.post("/tx/web3", {
            tx_hash: hash,
        });
    }
    async function preTransfer(signer, nft) {
        if (await isApprovedForMinter(signer, nft)) {
            return;
        }
        const contract = await Tezos.contract.at(nft.native.contract);
        const tx = contract.methods
            .update_operators([
            {
                add_operator: {
                    owner: await getAddress(signer),
                    operator: bridge.address,
                    token_id: nft.native.token_id,
                },
            },
        ])
            .toTransferParams();
        return await sendTx(signer, tx);
    }
    return {
        async transferNftToForeign(sender, chain, to, nft, fee) {
            const tx = bridge.methods
                .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.token_id))
                .toTransferParams();
            tx.amount = fee.toNumber() / 1e6;
            const hash = await sendTx(sender, tx);
            notifyValidator(hash);
            return hash;
        },
        async balance(address) {
            return Tezos.tz.getBalance(address);
        },
        async unfreezeWrappedNft(sender, to, nft, fee) {
            const tx = bridge.methods
                .withdraw_nft(to, parseInt(nft.native.token_id))
                .toTransferParams();
            tx.amount = fee.toNumber() / 1e6;
            const hash = await sendTx(sender, tx);
            notifyValidator(hash);
            return hash;
        },
        async mintNft(signer, { identifier, attrs, contract, uris }) {
            const tx = xpnft.methods
                .mint({
                token_id: identifier,
                address: contract,
                metadata: {
                    uri: uris[0],
                    attrs,
                },
                amount: 1,
            })
                .toTransferParams();
            return await sendTx(signer, tx);
        },
        async validateAddress(adr) {
            return Promise.resolve(utils.validateAddress(adr) === utils.ValidationResult.VALID);
        },
        isWrappedNft(nft) {
            return nft.native.contract.toLowerCase() === xpnftAddress.toLowerCase();
        },
        getNonce() {
            return 0x12;
        },
        async estimateValidateTransferNft() {
            return estimateGas(validators, 1.2e5);
        },
        async estimateValidateUnfreezeNft() {
            return estimateGas(validators, 1.2e4);
        },
        preTransfer,
        isApprovedForMinter,
        approveForMinter: (nft, sender) => preTransfer(sender, nft)
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBLHNEQUF3QztBQUN4QyxnRUFBcUM7QUFDckMsa0RBQTBCO0FBOENuQixLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDdkMsS0FBSyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsR0FDRTtJQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLGdCQUFnQixHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDcEMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLENBQUMsVUFBb0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7UUFDOUQsT0FBTyxJQUFJLHNCQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUMsQ0FBQztJQUVGLEtBQUssVUFBVSxNQUFNLENBQUMsTUFBbUIsRUFBRSxFQUFrQjtRQUMzRCxJQUFJLGVBQWUsSUFBSSxNQUFNLEVBQUU7WUFDN0IsS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUMsTUFBTSxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUM7WUFD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