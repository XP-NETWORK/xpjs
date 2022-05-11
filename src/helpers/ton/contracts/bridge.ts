import BN from "bn.js";
import TonWeb, { ContractMethods, ContractOptions } from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

const Contract = TonWeb.Contract;
const Cell = TonWeb.boc.Cell;

declare type SeqnoMethod = (() => SeqnoMethodResult);

interface SeqnoMethodResult {
    call: () => Promise<number>;
}

interface BridgeOptions extends ContractOptions {
}

interface BridgeMethods extends ContractMethods {
    seqno: SeqnoMethod;
    getPublicKey: () => Promise<BN>;
    isInitialized: () => Promise<BN>;
    getActionId: () => Promise<BN>;
}

interface WithdrawParams {
    chainNonce: number;
    to: Uint8Array
}

interface FreezeParams {
    chainNonce: number;
    to: Uint8Array;
    amount?: number | BN;
}

export class BridgeContract extends Contract<BridgeOptions, BridgeMethods> {
    constructor(provider: HttpProvider, options: BridgeOptions) {
        super(provider, options);

        this.methods.seqno = () => {
            return {
                call: async () => {
                    const address = await this.getAddress();
                    let n = null;
                    try {
                        n = (await provider.call2(address.toString(), 'seqno')).toNumber();
                    } catch (e) {
                        console.log(e)
                    }
                    return n;
                }
            }
        }
        this.methods.getPublicKey = this.getPublicKey
        this.methods.isInitialized = this.isInitialized
        this.methods.getActionId = this.getActionId
    }

    serializeUri(uri: string): Uint8Array {
        return new TextEncoder().encode(encodeURI(uri));
    }

    async createWithdrawBody(params: WithdrawParams) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(new TonWeb.Address("kQD12nXLsUqUthWhFiZWsJvaV1NulF-R6piCJtns382mncPb")); // target address
        cell.bits.writeAddress(await this.getAddress()); // bridge as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(new BN(0)); // forward amount
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        const msg = new Cell()
        msg.bits.writeUint(params.chainNonce, 8);
        msg.bits.writeBytes(params.to);
        cell.refs[0] = msg;
        
        return cell;
    }

    async createFreezeBody(params: FreezeParams) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeAddress(await this.getAddress()); // target address
        cell.bits.writeAddress(undefined); // undefined as response address
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.amount || new BN(0));
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        cell.bits.writeUint(params.chainNonce, 8);
        cell.bits.writeBytes(params.to);

        return cell;
    }

    getPublicKey = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_public_key');
        return result
    }

    isInitialized = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'is_initialized');
        return result
    }

    getActionId = async () => {
        const address = await this.getAddress();
        const result = await this.provider.call2(address.toString(), 'get_action_id');
        return result
    }
}
