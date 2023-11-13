import { CasperClient } from "casper-js-sdk";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const getDeploy = async (client: CasperClient, deployHash: string) => {
  let i = 300;
  while (i !== 0) {
    try {
      const [_, raw] = await client.getDeploy(deployHash);

      if (raw.execution_results.length !== 0) {
        // @ts-ignore
        if (raw.execution_results[0].result.Success) {
          return raw;
        } else {
          // @ts-ignore
          throw Error(
            "Contract execution: " +
              // @ts-ignore
              raw.execution_results[0].result.Failure.error_message
          );
        }
      } else {
        i--;
        await sleep(4000);
        continue;
      }
    } catch (e: any) {
      console.log(e.message);
      if (e.message.match(/(deploy not known|no such deploy)/gim)) {
        i--;
        await sleep(4000);
        continue;
      } else {
        throw e;
      }
    }
  }
  throw Error("Timeout after " + i + "s. Something's wrong");
};
