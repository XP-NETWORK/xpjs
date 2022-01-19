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
    async function isApprovedForMinter(sender, nft) {
        const contract = await Tezos.contract.at(nft.native.contract);
        const ownerAddr = await sender.publicKeyHash();
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
        Tezos.setSignerProvider(signer);
        if (await isApprovedForMinter(signer, nft)) {
            return;
        }
        const contract = await Tezos.contract.at(nft.native.contract);
        const response = await contract.methods
            .update_operators([
            {
                add_operator: {
                    owner: await signer.publicKeyHash(),
                    operator: bridge.address,
                    token_id: nft.native.token_id,
                },
            },
        ])
            .send();
        await response.confirmation();
        return response.hash;
    }
    return {
        async transferNftToForeign(sender, chain, to, nft, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.token_id))
                .send({
                amount: fee.toNumber() / 1e6,
            });
            await response.confirmation();
            notifyValidator(response.hash);
            return response;
        },
        async balance(address) {
            return Tezos.tz.getBalance(address);
        },
        async unfreezeWrappedNft(sender, to, nft, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .withdraw_nft(to, parseInt(nft.native.token_id))
                .send({
                amount: fee.toNumber() / 1e6,
            });
            await response.confirmation();
            notifyValidator(response.hash);
            return response;
        },
        async mintNft(signer, { identifier, attrs, contract, uris }) {
            Tezos.setSignerProvider(signer);
            const response = xpnft.methods
                .mint({
                token_id: identifier,
                address: contract,
                metadata: {
                    uri: uris[0],
                    attrs,
                },
                amount: 1,
            })
                .send();
            return response;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLHNEQUF3QztBQUN4QyxnRUFBcUM7QUFDckMsa0RBQTBCO0FBK0NuQixLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDdkMsS0FBSyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsR0FDRTtJQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLGdCQUFnQixHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDcEMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLENBQUMsVUFBb0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7UUFDOUQsT0FBTyxJQUFJLHNCQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUMsQ0FBQztJQUVGLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxNQUFtQixFQUFFLEdBQTBCO1FBQ2hGLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMvQyxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFP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