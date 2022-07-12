declare type DeathReason = {
    component: "node" | "validator" | "balance";
    error: string;
};
declare type ValidatorStatus = {
    status: "alive" | "dead";
    death_reason?: DeathReason;
};
declare type ChainStatus = {
    bridge_alive: boolean;
    validators: ValidatorStatus[];
};
export declare type StatusResp = {
    [chainNonce: string]: ChainStatus;
};
export {};
//# sourceMappingURL=resp.d.ts.map