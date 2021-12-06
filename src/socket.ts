import { io, ManagerOptions, SocketOptions } from "socket.io-client";
import { ClaimNftInfo } from "./helpers/algorand";

type ChainAwaiter<T> = {
  [action_id: string]:
    | {
        resolve?: (data: T) => void;
        event_res?: T;
      }
    | undefined;
};

type SocketResInnerBuf<T> = {
  [chain: number]: ChainAwaiter<T>;
};

type SocketResBuf<T> = {
  getResolver(
    chain_id: number,
    action_id: string
  ): ((data: T) => void) | undefined;
  setResolver(
    chain_id: number,
    action_id: string,
    resolver: (data: T) => void
  ): void;
  getEventRes(chain_id: number, action_id: string): T | undefined;
  setEventRes(chain_id: number, action_id: string, res: T): void;
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

export type AlgorandSocketHelper = {
  waitAlgorandNft(sourceChain: number, action_id: string): Promise<ClaimNftInfo>;
};

function pairAction(sourceChain: number, action_id: string): number {
  const numId = parseInt(action_id);
  return numId >= sourceChain ? numId * numId + sourceChain + numId : numId + sourceChain * sourceChain;
}

function socketResBuf<T>(): SocketResBuf<T> {
  const inner: SocketResInnerBuf<T> = {};

  const requireChain = (chain_id: number) => {
    if (inner[chain_id] === undefined) {
      inner[chain_id] = {};
    }
  };

  return {
    getResolver(
      chain_id: number,
      action_id: string
    ): ((data: T) => void) | undefined {
      requireChain(chain_id);

      return inner[chain_id][action_id]?.resolve;
    },
    setResolver(
      chain_id: number,
      action_id: string,
      resolver: (data: T) => void
    ): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = { resolve: resolver };
    },
    getEventRes(chain_id: number, action_id: string): T | undefined {
      requireChain(chain_id);

      return inner[chain_id][action_id]?.event_res;
    },
    setEventRes(chain_id: number, action_id: string, res: T): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = { event_res: res };
    },
    unsetAction(chain_id: number, action_id: string): void {
      requireChain(chain_id);

      inner[chain_id][action_id] = undefined;
    },
  };
}

function add_event<T>(
  buf: SocketResBuf<T>,
  chain: number,
  id: string,
  data: T
) {
  const resolve = buf.getResolver(chain, id);
  if (resolve === undefined) {
    buf.setEventRes(chain, id, data);
    return;
  }
  resolve(data);
}

async function waitSocketData<T>(
  buf: SocketResBuf<T>,
  chain: number,
  action_id: string
): Promise<T> {
  const data = buf.getEventRes(chain, action_id);
  if (data !== undefined) {
    buf.unsetAction(chain, action_id);
    return data;
  }

  const dataP: Promise<T> = new Promise((r) => {
    buf.setResolver(chain, action_id, r);
  });

  return await dataP;
}

/**
 * Create a [[SocketHelper]]
 *
 * @param uri  URI of the Migration-Validator socket api
 * @param options  socket.io options
 */
export function socketHelper(
  uri: string,
  options?: Partial<SocketOptions & ManagerOptions>
): TxnSocketHelper & AlgorandSocketHelper {
  const socket = io(uri, options);
  const txbuf: SocketResBuf<string> = socketResBuf();
  const algoBuf: SocketResBuf<ClaimNftInfo> = socketResBuf();

  socket.on(
    "tx_executed_event",
    (chain: number, action_id: string, hash: string) => {
      add_event(txbuf, chain, action_id, hash);
    }
  );

  socket.on(
    "algorand_minted_event",
    (_: number, action_id: string, app_id: number, nft_id: number) =>
      add_event(algoBuf, 15, action_id, {
        appId: app_id,
        nftId: nft_id,
      })
  );

  return {
    async waitTxHash(chain: number, action_id: string): Promise<string> {
      return await waitSocketData(txbuf, chain, action_id);
    },
    async waitAlgorandNft(sourceChain: number, action_id: string): Promise<ClaimNftInfo> {
      // Validator sends a an action paired with chain id
      // this is implementation dependent on validator
      const paired = pairAction(sourceChain, action_id).toString();
	  console.log(paired);
      return await waitSocketData(algoBuf, 15, paired);
    },
  };
}
