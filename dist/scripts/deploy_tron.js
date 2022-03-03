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
    const api = "https://api.shasta.trongrid.io";
    const signer = process.env.TRON_SK;
    const xpnftWrappedUri = "https://bridge-wnftapi.herokuapp.com/w/";
    const xpnft1155WrappedUri = "https://bridge-wnftapi.herokuapp.com/w/{id}";
    const frostGroupKey = process.env.FROST_GROUP_KEY;
    const prov = new tronweb_1.default({ fullHost: api });
    const tron = await tron_1.baseTronHelperFactory(prov);
    const contracts = await tron.deployMinter(signer, frostGroupKey, xpnftWrappedUri, xpnft1155WrappedUri);
    console.log(contracts);
})().catch((e) => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95X3Ryb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NyaXB0cy9kZXBsb3lfdHJvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBDQUF3RDtBQUN4RCxtQ0FBbUM7QUFDbkMsc0RBQThCO0FBQzlCLG1DQUE4QjtBQUM5QixlQUFNLEVBQUUsQ0FBQztBQUdULENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDUixNQUFNLEdBQUcsR0FBRyxnQ0FBZ0MsQ0FBQztJQUM3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQVEsQ0FBQztJQUNwQyxNQUFNLGVBQWUsR0FBRyx5Q0FBeUMsQ0FBQztJQUNsRSxNQUFNLG1CQUFtQixHQUFHLDZDQUE2QyxDQUFDO0lBQzFFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZ0IsQ0FBQztJQUVuRCxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLDRCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9DLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FDckMsTUFBTSxFQUNOLGFBQWEsRUFDYixlQUFlLEVBQ2YsbUJBQW1CLENBQ3RCLENBQUM7SUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMifQ==