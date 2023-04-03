import axios from "axios";
import { StatusResp } from "./resp";

export type BridgeHeartbeat = {
  status(): Promise<StatusResp>;
};

export function bridgeHeartbeat(baseURL: string): BridgeHeartbeat {
  const api = axios.create({
    baseURL,
  });

  return {
    async status() {
      const res = await api.get<StatusResp>("/status");
      return res.data;
    },
  };
}
