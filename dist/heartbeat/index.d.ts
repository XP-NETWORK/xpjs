import { StatusResp } from "./resp";
export type BridgeHeartbeat = {
  status(): Promise<StatusResp>;
};
export declare function bridgeHeartbeat(baseURL: string): BridgeHeartbeat;
//# sourceMappingURL=index.d.ts.map
