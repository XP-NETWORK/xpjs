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
        async transferNftToForeign(sender, chain, to, nft, fee) {
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
        async unfreezeWrappedNft(sender, to, nft, fee) {
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