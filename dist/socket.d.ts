import { ManagerOptions, SocketOptions } from "socket.io-client";
import { ClaimNftInfo } from "./helpers/algorand";
/**
 * Tracker for cross chain transaction
 */
export declare type TxnSocketHelper = {
    /**
     *
     * @param chain  Nonce of the target chain
     * @param action_id  Identifier for tracking a cross chain transaction
     * @returns  transaction hash on the foreign chain
     */
    waitTxHash(chain: number, action_id: string): Promise<string>;
};
export declare type AlgorandSocketHelper = {
    waitAlgorandNft(sourceChain: number, receiver: string, action_id: string): Promise<ClaimNftInfo>;
    claimNfts(receiver: string): Promise<DbClaimInfo[]>;
};
declare type DbClaimInfo = {
    receiver: string;
    app_id: string;
    nft_id: string;
    action_id: string;
    inserted_at: Date;
};
/**
 * Create a [[SocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
export declare function socketHelper(uri: string, options?: Partial<SocketOptions & ManagerOptions>): TxnSocketHelper & AlgorandSocketHelper;
export {};
