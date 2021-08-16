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
    return {
        async balance(address) {
            const bal = await w3.getBalance(address);
            // ethers BigNumber is not compatible with our bignumber
            return new bignumber_js_1.default(bal.toString());
        },
        async transferNativeToForeign(sender, chain_nonce, to, value) {
            return [await signedMinter(sender)
                    .freeze(chain_nonce, to, { value }), undefined];
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
            return [txr, undefined];
        },
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            return [await signedMinter(sender)
                    .withdraw(chain_nonce, to, value), undefined];
        },
        async unfreezeWrappedNft(sender, to, id) {
            return [await signedMinter(sender)
                    .withdraw_nft(to, id), undefined];
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdCQUF3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV4QixnRUFBcUM7QUFFckMsbUNBQThEO0FBRzlELCtEQUFpRDtBQUNqRCwwREFBeUQ7QUFpQmxELEtBQUssVUFBVSxpQkFBaUIsQ0FDdEMsUUFBa0IsRUFDZixXQUFtQixFQUNuQixVQUFxQjtJQUVyQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFFcEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekQsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELE9BQU87UUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE1BQWMsRUFBRSxXQUFtQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtZQUM3RixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDO3FCQUM3QixNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNQLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxFQUFVLEVBQUUsRUFBYztZQUN6RixJQUFJLEdBQUcsQ0FBQztZQUNSLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQzthQUN4QixDQUFDLENBQUM7WUFFSCxJQUFJLEVBQUUsQ0FBQyxhQUFhLElBQUksUUFBUSxFQUFFO2dCQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3RELEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDN0c7aUJBQU07Z0JBQ04sTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsc0JBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDdkQsR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxrQkFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM1SDtZQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDeEIsQ0FBQztRQUNLLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBYyxFQUFFLFdBQW1CLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1lBQ3JGLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUM7cUJBQzdCLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDUCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBYyxFQUFFLEVBQVUsRUFBRSxFQUFhO1lBQ2pFLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUM7cUJBQ2hDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUNFLENBQUE7QUFDTCxDQUFDO0FBbkRELDhDQW1EQyJ9