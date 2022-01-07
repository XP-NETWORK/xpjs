"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tezosHelperFactory = void 0;
const utils_1 = require("@taquito/utils");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const randomAction = () => new bignumber_js_1.default(Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)));
const NFT_TRANSFER_COST = new bignumber_js_1.default(45000000);
const NFT_UNFREEZE_COST = new bignumber_js_1.default(45000000);
async function tezosHelperFactory({ Tezos, xpnftAddress, bridgeAddress, validators, }) {
    const bridge = await Tezos.contract.at(bridgeAddress);
    const xpnft = await Tezos.contract.at(xpnftAddress);
    const estimateGas = async (validators, op) => {
        let fee = 0;
        for (const [i, addr] of validators.entries()) {
            op.source = addr;
            let tf = (await Tezos.estimate.transfer(op)).totalCost;
            if (i == validators.length - 1 && validators.length != 1)
                tf = tf * 2;
            fee = fee + tf;
        }
        return new bignumber_js_1.default(fee.toString());
    };
    return {
        async transferNftToForeign(sender, chain, to, nft, _, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .freeze_fa2(nft.native.contract, nft.native.id, chain, to)
                .send({
                amount: fee.toNumber(),
            });
            return response;
        },
        async balance(address) {
            return Tezos.tz.getBalance(address);
        },
        async unfreezeWrappedNft(sender, _, to, nft, fee) {
            Tezos.setSignerProvider(sender);
            const response = await bridge.methods
                .withdraw_nft(to, nft.native.id)
                .send({
                amount: fee.toNumber(),
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
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFpQkEsMENBQW1EO0FBQ25ELGdFQUFxQztBQVVyQyxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FDeEIsSUFBSSxzQkFBUyxDQUNYLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUNuRSxDQUFDO0FBRUosTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHNCQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUE4QjNDLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxFQUN2QyxLQUFLLEVBQ0wsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEdBQ0U7SUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFcEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFVBQW9CLEVBQUUsRUFBa0IsRUFBRSxFQUFFO1FBQ3JFLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUVaLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDNUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENB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