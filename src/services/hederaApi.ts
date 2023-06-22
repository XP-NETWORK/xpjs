import axios from "axios";

export interface HederaService {
  getTokens(addresss: string): Promise<{ token_id: string; balance: number }[]>;
  getokenInfo(tokenId: string): Promise<{ treasury_account_id: string }>;
  isContract(address: string): Promise<boolean>;
}

export function hederaService(url: string): HederaService {
  const request = axios.create({
    baseURL: url,
  });
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
      const res = await request.get(`/contracts/${address}`).catch(() => false);
      return Boolean(res);
    },
  };
}
