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

export const getWrapped = async (uri: string) => {
  return (await axios.get(uri).catch(() => ({ data: undefined }))).data
    ?.wrapped;
};

export const tryTimes =
  (times: number, condition: string = "") =>
  async (cb: (...args: any) => Promise<any>, ...args: any) => {
    for (let i = 0; i < times; i++) {
      try {
        const gasLimit = args.at(-1).gasLimit;
        return await cb(...args.slice(0, -1), {
          gasLimit: gasLimit * (i + 1),
        });
      } catch (error: any) {
        console.log(`Attempt ${i + 1} failed: retry`);
        if (condition && !error.message.includes(condition)) {
          throw error;
        }
      }
    }
    throw new Error("PRC is not responding, please try later");
  };
