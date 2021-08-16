"use strict";
// TODO: Catch Event IDs
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
exports.web3HelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
const ERC721_abi = __importStar(require("../fakeERC721.json"));
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
                const erc = new ethers_1.Contract(id.contract, ERC721_abi, w3);
                txr = await erc.connect(sender).safeTransferFrom(await sender.getAddress(), minter_addr, id.token, calldata);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdCQUF3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV4QixnRUFBcUM7QUFFckMsbUNBQThEO0FBRzlELCtEQUFpRDtBQUNqRCwwREFBeUQ7QUFpQmxELEtBQUssVUFBVSxpQkFBaUIsQ0FDdEMsUUFBa0IsRUFDZixXQUFtQixFQUNuQixVQUFxQjtJQUVyQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFFcEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekQsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVKLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBd0I7UUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUN0QixNQUFNLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRSxPQUFPO1FBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lB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