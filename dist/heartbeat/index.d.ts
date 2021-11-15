import { StatusResp } from "./resp";
export declare type BridgeHeartbeat = {
    status(): Promise<StatusResp>;
};
export declare function bridgeHeartbeat(baseURL: string): BridgeHeartbeat;
