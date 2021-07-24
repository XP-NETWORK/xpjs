"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViMy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3dlYjMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0VBQXFDO0FBRXJDLG1DQUEwQztBQVduQyxLQUFLLFVBQVUsaUJBQWlCLENBQ3RDLFFBQWtCLEVBQ2YsV0FBbUIsRUFDbkIsVUFBcUI7SUFFckIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBRXBCLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQVEsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXpELFNBQVMsWUFBWSxDQUFDLE1BQWM7UUFDaEMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxPQUFPO1FBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQ3pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6Qyx3REFBd0Q7WUFDeEQsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxNQUFjLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1lBQ3hFLE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDO2lCQUM1QixNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFjLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1lBQ2hFLE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBTSxDQUFDO2lCQUM1QixRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUM7S0FDSixDQUFBO0FBQ0wsQ0FBQztBQTdCRCw4Q0E2QkMifQ==