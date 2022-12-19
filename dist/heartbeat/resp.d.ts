type DeathReason = {
  component: "node" | "validator" | "balance";
  error: string;
};
type ValidatorStatus = {
  status: "alive" | "dead";
  death_reason?: DeathReason;
};
type ChainStatus = {
  bridge_alive: boolean;
  validators: ValidatorStatus[];
};
export type StatusResp = {
  [chainNonce: string]: ChainStatus;
};
export {};
//# sourceMappingURL=resp.d.ts.map
