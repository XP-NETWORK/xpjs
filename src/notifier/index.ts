import axios from "axios";

export type EvNotifier = ReturnType<typeof evNotifier>;

export function evNotifier(url: string) {
  const api = axios.create({
    baseURL: url,
  });

  return {
    async notifyWeb3(chainNonce: number, txHash: string) {
      await api.post("/tx/web3", {
        chain_nonce: chainNonce,
        tx_hash: txHash,
      });
    },
    async notifyTron(txHash: string) {
      await api.post("/tx/tron", {
        tx_hash: txHash,
      });
    },
    async notifyElrond(txHash: string, sender: string, uris: string[]) {
      await api.post("/tx/elrond", {
        tx_hash: txHash,
        sender,
        uris,
      });
    },
    async notifyTezos(txHash: string) {
      await api.post("/tx/tezos", {
        tx_hash: txHash,
      });
    },
  };
}
