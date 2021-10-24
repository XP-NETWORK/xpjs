import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { Chain } from "../consts";
import { MintNft } from "..";
export declare type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;
/**
 * A type representing a chain factory.
 *
 */
declare type ChainFactory = {
    /**
     * Create a cross chain helper object
     * @param chain: {@link Chain} to create the helper for
     */
    inner(chain: Chain): Promise<CrossChainHelper>;
    transferNft(fromChain: Chain, toChain: Chain, nft: any, sender: any, receiver: any): Promise<any>;
    /**
     * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the {@link inner} method.
     * @param owner: {@link Signer} A signer to  sign transaction, can come from either metamask, tronlink, or the elrond's maiar wallet.
     * @param args: {@link NftMintArgs} Arguments to mint the nft.
     */
    mint<Signer>(chain: MintNft<Signer, NftMintArgs, any>, owner: Signer, args: NftMintArgs): Promise<any>;
};
/**
 * A type representing all the supported chain params.
 */
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
    ontologyParams: Web3Params;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
export declare function ChainFactory(chainParams: ChainParams): ChainFactory;
/**
 * The interface that defines the arguments to mint an NFT.
 * @property contract is the address of the smart contract that will mint the NFT and it is mandatory for WEB3 and Tron Chains.
 * @property identifier is the identifier of the NFT to mint and it is mandatory for Elrond Chain.
 */
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
