import { ManagerOptions, SocketOptions } from "socket.io-client";
export declare type TxnSocketHelper = {
    waitTxHash(chain: number, action_id: string): Promise<string>;
};
export declare function txnSocketHelper(uri: string, options?: Partial<SocketOptions & ManagerOptions>): TxnSocketHelper;
