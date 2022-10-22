export declare type EvNotifier = ReturnType<typeof evNotifier>;
export declare function evNotifier(url: string): {
    notifyWeb3(fromChain: number, fromHash: string, actionId?: string, type?: string, toChain?: number, txFees?: string, senderAddress?: string, targetAddress?: string, nftUri?: string, tokenId?: string, contract?: string): Promise<void>;
    notifyTron(txHash: string): Promise<void>;
    notifyElrond(txHash: string, sender: string, uris: string[], action_id: string | undefined): Promise<void>;
    notifyTezos(txHash: string): Promise<void>;
    notifyAlgorand(txHash: string): Promise<void>;
    notifySecret(txHash: string, vk: string): Promise<void>;
    notifySolana(txHash: string): Promise<void>;
    notifyNear(txHash: string): Promise<void>;
    notifyDfinity(actionId: string): Promise<void>;
    notifyTon(txHash: string): Promise<void>;
};
//# sourceMappingURL=index.d.ts.map