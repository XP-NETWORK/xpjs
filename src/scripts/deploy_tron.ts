import { baseTronHelperFactory } from "../helpers/tron";
//@ts-expect-error no typings, cope
import TronWeb from "tronweb";
import { config } from "dotenv";
config();

(async () => {

  // Testnet
  // const api = "https://api.shasta.trongrid.io";
  // const signer = process.env.TRON_SK!;
  // const xpnftWrappedUri = "https://bridge-wnftapi.herokuapp.com/w/";
  // const xpnft1155WrappedUri = "https://bridge-wnftapi.herokuapp.com/w/{id}";
  // const frostGroupKey = process.env.FROST_GROUP_KEY!;

  // Mainnet
  const api = "https://api.trongrid.io";
  const signer = process.env.TRON_SK!;
  const xpnftWrappedUri = "https://wnfts.xp.network/w/";
  const xpnft1155WrappedUri = "https://wnfts.xp.network/w/{id}";
  const frostGroupKey = process.env.FROST_GROUP_KEY!;

  const prov = new TronWeb({ fullHost: api });
  const tron = await baseTronHelperFactory(prov);

  const contracts = await tron.deployMinter(
    signer,
    frostGroupKey,
    xpnftWrappedUri,
    xpnft1155WrappedUri
  );
  
  console.log(contracts);

})().catch((e) => console.error(e));
