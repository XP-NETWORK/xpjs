"use strict";
// TODO: Catch Event IDs
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
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
        async unfreezeWrapped(sender, chain_nonce, to, value) {
            return [await signedMinter(sender)
                    .withdraw(chain_nonce, to, value), undefined];
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdCQUF3Qjs7Ozs7O0FBRXhCLGdFQUFxQztBQUVyQyxtQ0FBMEM7QUFXbkMsS0FBSyxVQUFVLGlCQUFpQixDQUN0QyxRQUFrQixFQUNmLFdBQW1CLEVBQ25CLFVBQXFCO0lBRXJCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUVwQixNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFRLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV6RCxTQUFTLFlBQVksQ0FBQyxNQUFjO1FBQ2hDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsT0FBTztRQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtZQUN6QixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekMsd0RBQXdEO1lBQ3hELE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsTUFBYyxFQUFFLFdBQW1CLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1lBQzdGLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUM7cUJBQzdCLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFjLEVBQUUsV0FBbUIsRUFBRSxFQUFVLEVBQUUsS0FBa0I7WUFDckYsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQztxQkFDN0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNKLENBQUE7QUFDTCxDQUFDO0FBN0JELDhDQTZCQyJ9