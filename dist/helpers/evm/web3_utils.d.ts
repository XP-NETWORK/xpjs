import { PopulatedTransaction } from "ethers";
export declare const txnUnderpricedPolyWorkaround: (utx: PopulatedTransaction) => Promise<void>;
export declare const getWrapped: (uri: string) => Promise<any>;
export declare const tryTimes: (times: number, condition?: string) => (cb: (...args: any) => Promise<any>, ...args: any) => Promise<any>;
//# sourceMappingURL=web3_utils.d.ts.map