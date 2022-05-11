import axios from "axios";

export type EvNotifier = ReturnType<typeof evNotifier>;

export function evNotifier(url: string) {
  const api = axios.create({
    baseURL: url,
  });

  return {
    async notifyWeb3(
      fromChain: number,
      fromHash: string,
      actionId?: string,
      type?: string,
      toChain?: number,
      txFees?: string,
      senderAddress?: string,
      targetAddress?: string,
      nftUri?: string,
      tokenId?: string,
      contract?: string
    ) {
      await api.post("/tx/web3", {
        chain_nonce: fromChain,
        tx_hash: fromHash,
        actionId,
        type,
        toChain,
        txFees,
        senderAddress,
        targetAddress,
        nftUri,
        tokenId,
        contract,
      });
    },
    async notifyTron(txHash: string) {
      await api.post("/tx/tron", {
        tx_hash: txHash,
      });
    },
    async notifyElrond(
      txHash: string,
      sender: string,
      uris: string[],
      action_id: string | undefined
    ) {
      await api.post("/tx/elrond", {
        tx_hash: txHash,
        sender,
        uris,
        action_id,
      });
    },
    async notifyTezos(txHash: string) {
      await api.post("/tx/tezos", {
        tx_hash: txHash,
      });
    },
    async notifyAlgorand(txHash: string) {
      await api.post("/tx/algorand", {
        tx_hash: txHash,
      });
    },
    async notifyTon(txHash: string) {
      await api.post("/tx/ton", {
        tx_hash: txHash,
      })
    }
  };
}
