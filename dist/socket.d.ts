declare type TxnSocketHelper = {
    waitTxHashPolkadot(id: string): Promise<string>;
    waitTxHashElrond(id: string): Promise<string>;
};
export declare function txnSocketHelper(uri: string): TxnSocketHelper;
export {};
