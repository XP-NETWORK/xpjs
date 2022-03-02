export declare type EvNotifier = ReturnType<typeof evNotifier>;
export declare function evNotifier(url: string): {
    notifyWeb3(chainNonce: number, txHash: string): Promise<void>;
    notifyTron(txHash: string): Promise<void>;
    notifyElrond(txHash: string, sender: string, uris: string[]): Promise<void>;
    notifyTezos(txHash: string): Promise<void>;
};
