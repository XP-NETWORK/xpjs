import { io, ManagerOptions, SocketOptions } from "socket.io-client";

type ChainAwaiter = {
  [action_id: string]:
    | {
        resolve?: (hash: string) => void;
        event_res?: string;
      }
    | undefined;
};

type TxResInnerBuf = {
  [chain: number]: ChainAwaiter;
};

type TxResBuf = {
  getResolver(
    chain_id: number,
    action_id: string
  ): ((hash: string) => void) | undefined;
  setResolver(
    chain_id: number,
    action_id: string,
    resolver: (hash: string) => void
  ): void;
  getEventRes(chain_id: number, action_id: string): string | undefined;
  setEventRes(chain_id: number, action_id: string, res: string): void;
  unsetAction(chain_id: number, action_id: string): void;
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
};

function txResBuf(): TxResBuf {
  const inner: TxResInnerBuf = {};

  const requireChain = (chain_id: number) => {
    if (inner[chain_id] === undefined) {
      inner[chain_id] = {};
    }
  };

  return {
    getResolver(
      chain_id: number,
      action_id: string
    ): ((hash: string) => void) | undefined {
      requireChain(chain_id);

      return inner[chain_id][action_id]?.resolve;
    },
    setResolver(
      chain_id: number,
      action_id: string,
      resolver: (hash: string) => void
    ): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = { resolve: resolver };
    },
    getEventRes(chain_id: number, action_id: string): string | undefined {
      requireChain(chain_id);

      return inner[chain_id][action_id]?.event_res;
    },
    setEventRes(chain_id: number, action_id: string, res: string): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = { event_res: res };
    },
    unsetAction(chain_id: number, action_id: string): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = undefined;
    },
  };
}

/**
 * Create a [[TxnSocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
export function txnSocketHelper(
  uri: string,
  options?: Partial<SocketOptions & ManagerOptions>
): TxnSocketHelper {
  const socket = io(uri, options);
  const buf: TxResBuf = txResBuf();

  function add_event(chain: number, id: string, hash: string) {
    const resolve = buf.getResolver(chain, id);
    if (resolve === undefined) {
      buf.setEventRes(chain, id, hash);
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
      const hash = buf.getEventRes(chain, action_id);
      if (hash !== undefined) {
        buf.unsetAction(chain, action_id);
        return hash;
      }

      const hashP: Promise<string> = new Promise((r) => {
        buf.setResolver(chain, action_id, r);
      });

      return await hashP;
    },
  };
}
