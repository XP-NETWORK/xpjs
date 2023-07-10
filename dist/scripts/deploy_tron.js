"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tron_1 = require("../helpers/tron");
//@ts-expect-error no typings, cope
const tronweb_1 = __importDefault(require("tronweb"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
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
    const tron = await (0, tron_1.baseTronHelperFactory)(prov);
    const contracts = await tron.deployMinter(signer, frostGroupKey, xpnftWrappedUri, xpnft1155WrappedUri);
    console.log(contracts);
})().catch((e) => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95X3Ryb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NyaXB0cy9kZXBsb3lfdHJvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBDQUF3RDtBQUN4RCxtQ0FBbUM7QUFDbkMsc0RBQThCO0FBQzlCLG1DQUFnQztBQUNoQyxJQUFBLGVBQU0sR0FBRSxDQUFDO0FBRVQsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNWLFVBQVU7SUFDVixnREFBZ0Q7SUFDaEQsdUNBQXVDO0lBQ3ZDLHFFQUFxRTtJQUNyRSw2RUFBNkU7SUFDN0Usc0RBQXNEO0lBRXRELFVBQVU7SUFDVixNQUFNLEdBQUcsR0FBRyx5QkFBeUIsQ0FBQztJQUN0QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQVEsQ0FBQztJQUNwQyxNQUFNLGVBQWUsR0FBRyw2QkFBNkIsQ0FBQztJQUN0RCxNQUFNLG1CQUFtQixHQUFHLGlDQUFpQyxDQUFDO0lBQzlELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZ0IsQ0FBQztJQUVuRCxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM1QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsNEJBQXFCLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUN2QyxNQUFNLEVBQ04sYUFBYSxFQUNiLGVBQWUsRUFDZixtQkFBbUIsQ0FDcEIsQ0FBQztJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9