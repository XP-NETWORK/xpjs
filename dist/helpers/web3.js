"use strict";
// TODO: Catch Event IDs
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const fakeERC721_json_1 = require("../fakeERC721.json");
const fakeERC1155_json_1 = require("../fakeERC1155.json");
async function web3HelperFactory(provider, minter_addr, minter_abi) {
    const w3 = provider;
    const minter = new ethers_1.Contract(minter_addr, minter_abi, w3);
    function signedMinter(signer) {
        return minter.connect(signer);
    }
    async function extractTxn(txr) {
        const receipt = await txr.wait();
        const log = receipt.logs.find((log) => log.address === minter.address);
        if (log === undefined) {
            throw Error("Couldn't extract action_id");
        }
        const evdat = minter.interface.parseLog(log);
        return evdat.args[0].toString();
    }
    return {
        async balance(address) {
            const bal = await w3.getBalance(address);
            // ethers BigNumber is not compatible with our bignumber
            return new bignumber_js_1.default(bal.toString());
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender)
                .freeze(chain_nonce, to, { value });
            return await extractTxn(res);
        },
        async transferNftToForeign(sender, chain_nonce, to, id) {
            let txr;
            const calldata = Buffer.concat([
                Buffer.from((new Int32Array([0])).buffer),
                Buffer.from((new Int32Array([chain_nonce])).buffer).reverse(),
                Buffer.from(to, "utf-8")
            ]);
            if (id.contract_type == "ERC721") {
                const erc = new ethers_1.Contract(id.contract, fakeERC721_json_1.abi, w3);
                txr = await erc.connect(sender)['safeTransferFrom(address,address,uint256,bytes)'](await sender.getAddress(), minter_addr, id.token, calldata);
            }
            else {
                const erc = new ethers_1.Contract(id.contract, fakeERC1155_json_1.abi, w3);
                txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, ethers_1.BigNumber.from(1), calldata);
            }
            return await extractTxn(txr);
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            const res = await signedMinter(sender)
                .withdraw(chain_nonce, to, value);
            return await extractTxn(res);
        },
        async unfreezeWrappedNft(sender, to, id) {
            const res = await signedMinter(sender)
                .withdraw_nft(to, id);
            return await extractTxn(res);
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdCQUF3Qjs7Ozs7O0FBRXhCLGdFQUFxQztBQUVyQyxtQ0FBOEQ7QUFHOUQsd0RBQXVEO0FBQ3ZELDBEQUF5RDtBQWlCbEQsS0FBSyxVQUFVLGlCQUFpQixDQUN0QyxRQUFrQixFQUNmLFdBQW1CLEVBQ25CLFVBQXFCO0lBRXJCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV6RCxTQUFTLFlBQVksQ0FBQyxNQUFjO1FBQ2hDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUosS0FBSyxVQUFVLFVBQVUsQ0FBQyxHQUF3QjtRQUNqRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkUsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ3RCLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7U0FDMUM7UUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVFLE9BQU87UUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDekIsTUFBTSxHQUFHLEdBQUcs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