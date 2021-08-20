import { io, ManagerOptions, SocketOptions } from "socket.io-client";

type ChainAwaiter = {
	[action_id: string]: {
		resolve?: (hash: string) => void;
		event_res?: string;
	} | undefined;
};

type TxResBuf = {
	[chain: number]: ChainAwaiter
};

/**
 * Tracker for cross chain transaction
 */
export type TxnSocketHelper = {
	/**
	 * 
	 * @param chain  Nonce of the target chain
	 * @param action_id  Identifier for tracking a cross chain transaction
	 * @returns  transaction hash on the foreign chain
	 */
    waitTxHash(chain: number, action_id: string): Promise<string>;
}

/**
 * Create a [[TxnSocketHelper]]
 * 
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
export function txnSocketHelper(uri: string, options?: Partial<SocketOptions & ManagerOptions>): TxnSocketHelper {
    const socket = io(uri, options);
	const buf: TxResBuf = {
		1: {},
		2: {},
		3: {},
		4: {},
		5: {}
	};

    function add_event(chain: number, id: string, hash: string) {
		const resolve = buf[chain][id]?.resolve;
		if (resolve === undefined) {
			buf[chain][id] = { event_res: hash };
			return;
		}
		resolve(hash);
    }

    socket.on(
        "tx_executed_event",
        (chain: number, action_id: string, hash: string) => {
            add_event(chain, action_id, hash);
        }
    );


    return {
		async waitTxHash(chain: number, action_id: string): Promise<string> {
			const hash = buf[chain][action_id]?.event_res;
			if (hash !== undefined) {
				buf[chain][action_id] = undefined;
				return hash;
			}

			const hashP: Promise<string> = new Promise(r => {
				buf[chain][action_id] = { resolve: r };
			});

			return await hashP;
		}
     }
}
