import { ElrondHelper, ElrondParams } from "../helpers/elrond";
import { TronHelper, TronParams } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { ChainNonce, ElrondNonce, TronNonce, Web3Nonce } from "../consts";
export * from "./factories";
import { ChainNonceGet, EstimateTxFees, ExtractTxn, MintNft, NftInfo, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WrappedNftCheck } from "..";
import BigNumber from "bignumber.js";
import { UserSigner } from "@elrondnetwork/erdjs/out";
import { Wallet } from "ethers";
import { AlgorandArgs } from "../helpers/algorand";
export declare type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper;
declare type NftUriChain<RawNft> = ChainNonceGet & WrappedNftCheck<RawNft>;
declare type FullChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, string, BigNumber, RawNft, Resp> & UnfreezeForeignNft<Signer, string, BigNumber, RawNft, Resp> & EstimateTxFees<BigNumber> & NftUriChain<RawNft> & ValidateAddress;
/**
 * A type representing a chain factory.
 *
 */
export declare type ChainFactory = {
    /**
     * Creates an helper factory for a given chain
     * @type T: Either {@link ElrondHelper} | {@link Web3Helper} | {@link TronHelper} as required.
     * @type P: Either {@link ElrondParams} | {@link Web3Params} | {@link TronParams} as required.
     * @param chain: {@link Chain} to create the helper for.
     */
    inner<T, P>(chain: ChainNonce<T, P>): Promise<T>;
    /**
     * Whether or not the bridge is alive for a given chain
     * this is checked regardless before using any bridge related function(e.g transferNft) is called
     */
    bridgeStatus(): Promise<{
        [chainNonce: number]: "alive" | "dead";
    }>;
    /**
     * Transfers the NFT from one chain to other.
     * @param fromChain {@link FullChain} the chain to transfer from. Use inner method of the factory to get this.
     * @param toChain {@link FullChain} the chain to transfer to. Use inner method of the factory to get this.
     * @param nft {@link NftInfo} the nft to be transferred. Can be fetched from the `nftList` method of the factory.
     * @param sender {@link Sender} The owner of the NFT.
     * @param receiver Address of the Receiver of the NFT. Could be Web3 or Elrond or Tron Address.
     */
    transferNft<SignerF, RawNftF, SignerT, RawNftT, Resp>(fromChain: FullChain<SignerF, RawNftF, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>, nft: NftInfo<RawNftF>, sender: SignerF, receiver: string, fee?: BigNumber): Promise<Resp>;
    /**
     * Mints an NFT on the chain.
     * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the `inner` method on the factory.
     * @param owner: {@link Signer} A signer to sign transaction, can come from either metamask, tronlink, or the elrond's maiar defi wallet.
     * @param args: {@link NftMintArgs} Arguments to mint the nft. Contract is must for web3 and tron. Identifier is must for elrond.
     */
    mint<Signer>(chain: MintNft<Signer, NftMintArgs, string>, owner: Signer, args: NftMintArgs): Promise<string>;
    /**
     * Lists all the NFTs on the chain owner by {@param owner}.
     * @param chain: {@link NftUriChain<RawNft>} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
     * @param owner: Address of the owner of the NFT as a raw string.
     */
    nftList<RawNft>(chain: NftUriChain<RawNft>, owner: string): Promise<NftInfo<RawNft>[]>;
    /**
     * Estimates the required fee for transferring an NFT.
     * @param fromChain: {@link FullChain} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
     * @param toChain: {@link FullChain} Chain to which the NFT must be sent. Can be obtained from the `inner` method on the factory.
     * @param nft: {@link NftInfo} The NFT that has to be transferred. Generally comes from the `nftList` method of the factory.
     * @param receiver: Address of the receiver of the NFT in raw string..
     */
    estimateFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(fromChain: FullChain<SignerF, RawNftF, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>, nft: NftInfo<RawNftF>, receiver: string): Promise<BigNumber>;
    /**
     *
     * @param nonce : {@link ChainNonce} could be a ElrondNonce, Web3Nonce, or TronNonce.
     * @param params : New Params to be set.
     */
    updateParams<T, TP>(nonce: ChainNonce<T, TP>, params: TP): void;
    nonceToChainNonce(nonce: number): ElrondNonce | TronNonce | Web3Nonce;
    pkeyToSigner(nonce: number, key: string): Promise<Wallet | UserSigner | string>;
    getDestinationTransaction<Txn>(hash: Txn, chain: ExtractTxn<Txn>): Promise<[string, string]>;
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
    xDaiParams: Web3Params;
    algorandParams: AlgorandArgs;
}
export declare type MoralisNetwork = "mainnet" | "testnet";
/**
 * A struct for the configuration of the library.
 * @field exchangeRateUri: The URI of the exchange rate service.
 * @field moralisServer: The URI of the moralis server.
 * @field moralisAppId: The app id of the moralis server.
 * @field tronScanUri: The URI of the tron scan service.
 */
export interface AppConfig {
    exchangeRateUri: string;
    heartbeatUri: string;
    moralisServer: string;
    moralisAppId: string;
    tronScanUri: string;
    moralisSecret?: string;
    moralisNetwork: MoralisNetwork;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
export declare function ChainFactory(appConfig: AppConfig, chainParams: Partial<ChainParams>): ChainFactory;
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
