import axios from "axios";
import BigNumber from "bignumber.js";

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
    async notifySecret(txHash: string, vk: string) {
      await api.post("/tx/scrt", { tx_hash: txHash, vk: vk });
    },
    async notifySolana(txHash: string) {
      await api.post("/tx/solana", { tx_hash: txHash });
    },
    async notifyNear(txHash: string) {
      await api.post("/tx/near", { tx_hash: txHash });
    },
    async notifyDfinity(actionId: string) {
      await api.post("/tx/dfinity", { action_id: actionId });
    },
    async notifyTon(txHash: string) {
      await api.post("/tx/ton", { tx_hash: txHash });
    },
    async notifyAptos(txHash: string) {
      await api.post("/tx/aptos", { tx_hash: txHash });
    },
    async notifyEVM(nonce: number, address: string) {
      await api.post("/whitelist", {
        contract: address,
        chain_nonce: nonce,
        // action_id: actionId,
      });
    },
  };
}
