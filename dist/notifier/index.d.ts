export declare type EvNotifier = ReturnType<typeof evNotifier>;
export declare function evNotifier(url: string): {
    notifyWeb3(fromChain: number, fromHash: string, actionId?: string | undefined, type?: string | undefined, toChain?: number | undefined, txFees?: string | undefined, senderAddress?: string | undefined, targetAddress?: string | undefined, nftUri?: string | undefined, tokenId?: string | undefined, contract?: string | undefined): Promise<void>;
    notifyTron(txHash: string): Promise<void>;
    notifyElrond(txHash: string, sender: string, uris: string[], action_id: string | undefined): Promise<void>;
    notifyTezos(txHash: string): Promise<void>;
    notifyAlgorand(txHash: string): Promise<void>;
};
