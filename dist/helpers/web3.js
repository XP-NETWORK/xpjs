"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3HelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ethers_1 = require("ethers");
async function web3HelperFactory(node_uri, minter_addr, minter_abi) {
    const w3 = new ethers_1.providers.JsonRpcProvider(node_uri);
    await w3.ready;
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
        async transferNativeToForeign(sender, to, value) {
            return await signedMinter(sender)
                .freeze(to, { value });
        },
        async unfreezeWrapped(sender, to, value) {
            return await signedMinter(sender)
                .withdraw(to, value);
        }
    };
}
exports.web3HelperFactory = web3HelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBRXJDLG1DQUFxRDtBQVc5QyxLQUFLLFVBQVUsaUJBQWlCLENBQ25DLFFBQWdCLEVBQ2hCLFdBQW1CLEVBQ25CLFVBQXFCO0lBRXJCLE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDO0lBRWYsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBUSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFekQsU0FBUyxZQUFZLENBQUMsTUFBYztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELE9BQU87UUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7WUFDekIsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLHdEQUF3RDtZQUN4RCxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE1BQWMsRUFBRSxFQUFVLEVBQUUsS0FBa0I7WUFDeEUsT0FBTyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUM7aUJBQzVCLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFDRCxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWMsRUFBRSxFQUFVLEVBQUUsS0FBa0I7WUFDaEUsT0FBTyxNQUFNLFlBQVksQ0FBQyxNQUFNLENBQUM7aUJBQzVCLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztLQUNKLENBQUE7QUFDTCxDQUFDO0FBOUJELDhDQThCQyJ9