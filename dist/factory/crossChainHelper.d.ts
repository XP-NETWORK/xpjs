import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain } from "../consts";
import { MintNft } from "..";
export declare type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;
declare type ChainFactory = {
    inner(chainNonce: number): Promise<CrossChainHelper>;
    transferNft(fromChain: Chain, toChain: Chain, nft: any, sender: any, receiver: any, validators: any[]): Promise<void>;
    mint<Signer, Response>(chain: MintNft<Signer, NftMintArgs, Response>, owner: Signer, args: NftMintArgs): Promise<void>;
};
export interface ChainParams {
    elrondParams: ElrondParams;
    hecoParams: Web3Params;
    bscParams: Web3Params;
    ropstenParams: Web3Params;
    avalancheParams: Web3Params;
    polygonParams: Web3Params;
    fantomParams: Web3Params;
    tronParams: TronParams;
    celoParams: Web3Params;
    harmonyParams: Web3Params;
}
export declare function ChainFactory(chainParams: ChainParams): ChainFactory;
export interface NftMintArgs {
    readonly contract?: string;
    readonly uris: string[];
    readonly identifier?: string;
    readonly quantity?: number | undefined;
    readonly name?: string;
    readonly royalties?: number | undefined;
    readonly hash?: string | undefined;
    readonly attrs: string | undefined;
}
export {};
