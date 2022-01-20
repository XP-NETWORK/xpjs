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
    function setSigner(sender) {
        if ("publicKeyHash" in sender) {
            Tezos.setSignerProvider(sender);
        }
        else {
            Tezos.setWalletProvider(sender);
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
        setSigner(signer);
        if (await isApprovedForMinter(signer, nft)) {
            return;
        }
        const contract = await Tezos.contract.at(nft.native.contract);
        const response = await contract.methods
            .update_operators([
            {
                add_operator: {
                    owner: getAddress(signer),
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
            setSigner(sender);
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
            setSigner(sender);
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
            setSigner(signer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLHNEQUF3QztBQUN4QyxnRUFBcUM7QUFDckMsa0RBQTBCO0FBOENuQixLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDdkMsS0FBSyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsR0FDRTtJQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLGdCQUFnQixHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDcEMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLENBQUMsVUFBb0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7UUFDOUQsT0FBTyxJQUFJLHNCQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUMsQ0FBQztJQUVGLFNBQVMsU0FBUyxDQUFDLE1BQW1CO1FBQ3BDLElBQUksZUFBZSxJQUFJLE1BQU0sRUFBRTtZQUM3QixLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakM7YUFBTTtZQUNMLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxNQUFtQjtRQUNyQyxJQUFJLGVBQWUsSUFBSSxNQUFNLEVBQUU7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