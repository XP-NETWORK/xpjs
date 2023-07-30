import BN from "bn.js";
import { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";
declare const Contract: typeof import("tonweb/dist/types/contract/contract").Contract;
declare type SeqnoMethod = () => SeqnoMethodResult;
interface SeqnoMethodResult {
    call: () => Promise<number>;
}
interface BridgeOptions extends ContractOptions {
    burner: string;
}
interface BridgeMethods extends ContractMethods {
    seqno: SeqnoMethod;
    getPublicKey: () => Promise<BN>;
    isInitialized: () => Promise<BN>;
    getActionId: () => Promise<BN>;
    getWhitelist: () => Promise<string[]>;
}
interface WithdrawParams {
    chainNonce: number;
    to: Uint8Array;
    txFees: BN;
}
interface FreezeParams {
    chainNonce: number;
    to: Uint8Array;
    mintWith: Uint8Array;
    amount?: number | BN;
}
export declare class BridgeContract extends Contract<BridgeOptions, BridgeMethods> {
    whiteListedCollections: string[];
    nwls: string[];
    constructor(provider: HttpProvider, options: BridgeOptions);
    serializeUri(uri: string): Uint8Array;
    init(): Promise<void>;
    createWithdrawBody(params: WithdrawParams): Promise<import("tonweb/dist/types/boc/cell").Cell>;
    createFreezeBody(params: FreezeParams): Promise<import("tonweb/dist/types/boc/cell").Cell>;
    getPublicKey: () => Promise<any>;
    isInitialized: () => Promise<any>;
    getActionId: () => Promise<any>;
    getWhitelist: () => Promise<string[]>;
}
export {};
//# sourceMappingURL=ton-bridge.d.ts.map