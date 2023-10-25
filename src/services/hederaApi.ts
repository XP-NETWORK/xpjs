import axios from "axios";

export interface HederaService {
  getTokens(addresss: string): Promise<{ token_id: string; balance: number }[]>;
  getokenInfo(tokenId: string): Promise<{ treasury_account_id: string }>;
  isContract(address: string): Promise<boolean>;
  getEVMAddress(address: string): Promise<string>;
  readContract(to: string, data: any): Promise<any>;
  getEVMAccount(address: string): Promise<string>;
  getTranactionIdByHash(hash: string): Promise<string>;
}

export function hederaService(url: string): HederaService {
  const request = axios.create({
    baseURL: url,
  });

  const getContract = async (address: string) =>
    await request.get(`/contracts/${address}`).catch(() => undefined);

  return {
    async getTokens(address) {
      try {
        const res = (await request.get(`/accounts/${address}/tokens`)).data;
        return res.tokens;
      } catch {
        return [];
      }
    },
    async getokenInfo(tokenId) {
      const res = (await request.get(`/tokens/${tokenId}`)).data;
      return res;
    },
    async isContract(address) {
      const res = await getContract(address);
      return Boolean(res);
    },
    async getEVMAddress(address) {
      const res = await getContract(address);
      if (res?.data?.evm_address) {
        return res.data.evm_address;
      }
      throw new Error("Failed to convert address to EVM format");
    },
    async getEVMAccount(address) {
      const res = await request.get(`/accounts/${address}`);
      if (res?.data?.evm_address) {
        return res.data.evm_address;
      }
      throw new Error("Failed to convert address to EVM format");
    },
    async readContract(to: string, data: any) {
      const res = await request.post(`/contracts/call`, {
        data,
        to,
      });
      return res.data.result;
    },
    async getTranactionIdByHash(hash) {
      const getTimestamp = (hash: string) =>
        new Promise(async (resolve, reject) => {
          let timestamp: string | undefined;
          const tm = setTimeout(
            () => reject("Time out on getTimestapm "),
            120 * 1000
          );
          while (!timestamp) {
            await new Promise((r) => setTimeout(r, 3000));

            const result = await request
              .get(`/contracts/results/${hash}`)
              .catch(() => undefined);
            timestamp = result?.data?.timestamp;
          }
          clearTimeout(tm);
          resolve(timestamp);
        });

      const timestamp = await getTimestamp(hash);

      const error = new Error(`Failed to decode ${hash} to transactionId`);
      if (!timestamp) {
        throw error;
      }

      await new Promise((r) => setTimeout(r, 4000));

      const transactions = await request
        .get(`/transactions?timestamp=${timestamp}`)
        .catch(() => undefined);

      const transaction = transactions?.data?.transactions?.at(0);
      if (!transaction?.transaction_id) {
        throw error;
      }

      return transaction.transaction_id;
    },
  };
}
