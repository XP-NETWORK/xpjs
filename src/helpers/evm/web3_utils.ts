import axios from "axios";
import { ethers, PopulatedTransaction } from "ethers";

export const txnUnderpricedPolyWorkaround = async (
  utx: PopulatedTransaction
) => {
  const res = await axios
    .get(
      "https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata"
    )
    .catch(async () => {
      return await axios.get("https://gasstation-mainnet.matic.network/v2");
    });
  const { result, fast } = res.data;
  const trackerGas = result?.rapidgaspricegwei || fast?.maxFee;

  if (trackerGas) {
    const sixtyGwei = ethers.utils.parseUnits(
      Math.ceil(trackerGas).toString(),
      "gwei"
    );
    utx.maxFeePerGas = sixtyGwei;
    utx.maxPriorityFeePerGas = sixtyGwei;
  }
};
