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
                amount: fee.toNumber(),
                gasLimit: 800000,
                storageLimit: 60000
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
            return response.hash;
        }
    };
}
exports.tezosHelperFactory = tezosHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV6b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy90ZXpvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFvQkEsMENBQW1EO0FBQ25ELGdFQUFxQztBQVNyQyxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FDeEIsSUFBSSxzQkFBUyxDQUNYLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUNuRSxDQUFDO0FBaUNHLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxFQUN2QyxLQUFLLEVBQ0wsWUFBWSxFQUNaLGFBQWEsRUFDYixVQUFVLEdBQ0U7SUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFcEQsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFVBQW9CLEVBQUUsRUFBa0IsRUFBRSxFQUFFO1FBQ3JFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV6RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDO0lBRUYsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFtQixFQUFFLEdBQTBCO1FBQ3ZFLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztR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