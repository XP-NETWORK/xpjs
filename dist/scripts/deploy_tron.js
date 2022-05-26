"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tron_1 = require("../helpers/tron");
//@ts-expect-error no typings, cope
const tronweb_1 = __importDefault(require("tronweb"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
(async () => {
    // Testnet
    // const api = "https://api.shasta.trongrid.io";
    // const signer = process.env.TRON_SK!;
    // const xpnftWrappedUri = "https://bridge-wnftapi.herokuapp.com/w/";
    // const xpnft1155WrappedUri = "https://bridge-wnftapi.herokuapp.com/w/{id}";
    // const frostGroupKey = process.env.FROST_GROUP_KEY!;
    // Mainnet
    const api = "https://api.trongrid.io";
    const signer = process.env.TRON_SK;
    const xpnftWrappedUri = "https://wnfts.xp.network/w/";
    const xpnft1155WrappedUri = "https://wnfts.xp.network/w/{id}";
    const frostGroupKey = process.env.FROST_GROUP_KEY;
    const prov = new tronweb_1.default({ fullHost: api });
    const tron = await tron_1.baseTronHelperFactory(prov);
    const contracts = await tron.deployMinter(signer, frostGroupKey, xpnftWrappedUri, xpnft1155WrappedUri);
    console.log(contracts);
})().catch((e) => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95X3Ryb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NyaXB0cy9kZXBsb3lfdHJvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBDQUF3RDtBQUN4RCxtQ0FBbUM7QUFDbkMsc0RBQThCO0FBQzlCLG1DQUFnQztBQUNoQyxlQUFNLEVBQUUsQ0FBQztBQUVULENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDVixVQUFVO0lBQ1YsZ0RBQWdEO0lBQ2hELHVDQUF1QztJQUN2QyxxRUFBcUU7SUFDckUsNkVBQTZFO0lBQzdFLHNEQUFzRDtJQUV0RCxVQUFVO0lBQ1YsTUFBTSxHQUFHLEdBQUcseUJBQXlCLENBQUM7SUFDdEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFRLENBQUM7SUFDcEMsTUFBTSxlQUFlLEdBQUcsNkJBQTZCLENBQUM7SUFDdEQsTUFBTSxtQkFBbUIsR0FBRyxpQ0FBaUMsQ0FBQztJQUM5RCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWdCLENBQUM7SUFFbkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDNUMsTUFBTSxJQUFJLEdBQUcsTUFBTSw0QkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUvQyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQ3ZDLE1BQU0sRUFDTixhQUFhLEVBQ2IsZUFBZSxFQUNmLG1CQUFtQixDQUNwQixDQUFDO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=