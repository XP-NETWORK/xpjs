"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tezosHelperFactory = void 0;
const utils_1 = require("@taquito/utils");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const randomAction = () => new bignumber_js_1.default(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
async function tezosHelperFactory({ Tezos, xpnftAddress, bridgeAddress, validators, }) {
    const bridge = await Tezos.contract.at(bridgeAddress);
    const xpnft = await Tezos.contract.at(xpnftAddress);
    const estimateGas = async (validators, op) => {
        const tf = (await Tezos.estimate.transfer(op)).totalCost;
        return new bignumber_js_1.default(tf * (validators.length + 1));
    };
    async function isApproved(sender, nft) {
        const contract = await Tezos.contract.at(nft.native.contract);
        const ownerAddr = await sender.publicKeyHash();
        const storage = await contract.storage();
        return typeof (await storage.operators.get({ owner: ownerAddr, operator: bridge.address, token_id: nft.native.id })) == "symbol";
    }
    return {
        async transferNftToForeign(sender, chain, to, nft, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.id))
                .send({
                amount: (fee.toNumber() / 1e6)
            });
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
                amount: (fee.toNumber() / 1e6),
            });
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
            return 0x11;
        },
        async estimateValidateTransferNft(to, meta) {
            const utx = bridge.methods
                .validate_transfer_nft(randomAction(), to, {}, meta.native.contract)
                .toTransferParams();
            return estimateGas(validators, utx);
        },
        async estimateValidateUnfreezeNft(to, meta) {
            const utx = bridge.methods
                .validate_unfreeze_nft(randomAction(), to, meta.native.id, meta.native.contract)
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
                .update_operators([{
                    add_operator: {
                        owner: await signer.publicKeyHash(),
                        operator: bridge.address,
                        token_id: nft.native.id
                    }
                }]).send();
            await response.confirmation();
            return response.hash;
        }
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFvQkEsMENBQW1EO0FBQ25ELGdFQUFxQztBQVNyQyxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FDeEIsSUFBSSxzQkFBUyxDQUNYLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUNuRSxDQUFDO0FBaUNHLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxFQUN2QyxLQUFLLEVBQ0wsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEdBQ0U7SUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFcEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFVBQW9CLEVBQUUsRUFBa0IsRUFBRSxFQUFFO1FBQ3JFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFtQixFQUFFLEdBQTBCO1FBQ3ZFLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztR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