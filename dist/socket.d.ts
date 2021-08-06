import { ManagerOptions, SocketOptions } from "socket.io-client";
export declare type TxnSocketHelper = {
    waitTxHashPolkadot(id: string): Promise<string>;
    waitTxHashElrond(id: string): Promise<string>;
};
export declare function txnSocketHelper(uri: string, options?: Partial<SocketOptions & ManagerOptions>): TxnSocketHelper;
