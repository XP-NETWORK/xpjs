"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tezosHelperFactory = void 0;
const taquito_1 = require("@taquito/taquito");
const utils_1 = require("@taquito/utils");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const axios_1 = __importDefault(require("axios"));
const randomAction = () => new bignumber_js_1.default(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
async function tezosHelperFactory({ Tezos, middlewareUri, xpnftAddress, bridgeAddress, validators, }) {
    const bridge = await Tezos.contract.at(bridgeAddress);
    const xpnft = await Tezos.contract.at(xpnftAddress);
    const event_middleware = axios_1.default.create({
        baseURL: middlewareUri,
        headers: {
            "Content-Type": "application/json",
        },
    });
    const estimateGas = async (validators, op) => {
        const tf = (await Tezos.estimate.transfer(op)).totalCost;
        return new bignumber_js_1.default(tf * (validators.length + 1));
    };
    async function isApproved(sender, nft) {
        const contract = await Tezos.contract.at(nft.native.contract);
        const ownerAddr = await sender.publicKeyHash();
        const storage = await contract.storage();
        return (typeof (await storage.operators.get({
            owner: ownerAddr,
            operator: bridge.address,
            token_id: nft.native.id,
        })) == "symbol");
    }
    async function notifyValidator(hash) {
        await event_middleware.post("/tx/web3", {
            tx_hash: hash,
        });
    }
    return {
        async transferNftToForeign(sender, chain, to, nft, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.id))
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
                .withdraw_nft(to, parseInt(nft.native.id))
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
            return Promise.resolve(utils_1.validatePublicKey(adr) === 3);
        },
        isWrappedNft(nft) {
            return nft.native.contract.toLowerCase() === xpnftAddress.toLowerCase();
        },
        getNonce() {
            return 0x12;
        },
        async estimateValidateTransferNft(to, meta) {
            const metadata = new taquito_1.MichelsonMap();
            metadata.set("", utils_1.char2Bytes(meta.uri));
            const utx = bridge.methods
                .validate_transfer_nft(randomAction().toString(), metadata, meta.native.contract, to)
                .toTransferParams();
            return estimateGas(validators, utx);
        },
        async estimateValidateUnfreezeNft(to, meta) {
            const utx = bridge.methods
                .validate_unfreeze_nft(randomAction().toString(), meta.native.contract, to, parseInt(meta.native.id))
                .toTransferParams();
            return estimateGas(validators, utx);
        },
        isApproved,
        async preTransfer(signer, nft) {
            Tezos.setSignerProvider(signer);
            if (await isApproved(signer, nft)) {
                return;
            }
            const contract = await Tezos.contract.at(nft.native.contract);
            const response = await contract.methods
                .update_operators([
                {
                    add_operator: {
                        owner: await signer.publicKeyHash(),
                        operator: bridge.address,
                        token_id: nft.native.id,
                    },
                },
            ])
                .send();
            await response.confirmation();
            return response.hash;
        },
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFhQSw4Q0FPMEI7QUFFMUIsMENBQStEO0FBQy9ELGdFQUFxQztBQUNyQyxrREFBMEI7QUFTMUIsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQ3hCLElBQUksc0JBQVMsQ0FDWCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FDbkUsQ0FBQztBQWtDRyxLQUFLLFVBQVUsa0JBQWtCLENBQUMsRUFDdkMsS0FBSyxFQUNMLGFBQWEsRUFDYixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsR0FDRTtJQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLGdCQUFnQixHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDcEMsT0FBTyxFQUFFLGFBQWE7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztLQUNGLENBQUMsQ0FBQztJQUVILE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxVQUFvQixFQUFFLEVBQWtCLEVBQUUsRUFBRTtRQUNyRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFekQsT0FBTyxJQUFJLHNCQUFTLENBQUMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FB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