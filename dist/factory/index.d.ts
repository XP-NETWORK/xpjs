import { ElrondHelper, ElrondParams, ElrondRawUnsignedTxn } from "../helpers/elrond";
import { TronHelper, TronParams, TronRawTxn } from "../helpers/tron";
import { Web3Helper, Web3Params } from "../helpers/web3";
import { ChainNonce, ElrondNonce, TronNonce, Web3Nonce } from "../consts";
export * from "./factories";
import { ChainNonceGet, EstimateTxFees, ExtractAction, ExtractTxnStatus, MintNft, MintRawTxn, NftInfo, PreTransferRawTxn, TransactionStatus, TransferNftForeign, TransferNftForeignUnsigned, UnfreezeForeignNft, UnfreezeForeignNftUnsigned, ValidateAddress, WrappedNftCheck } from "..";
import BigNumber from "bignumber.js";
import { PopulatedTransaction } from "ethers";
import { AlgorandParams, AlgorandHelper, AlgoSignerH, ClaimNftInfo } from "../helpers/algorand";
export declare type CrossChainHelper = ElrondHelper | Web3Helper | TronHelper | AlgorandHelper;
declare type NftUriChain<RawNft> = ChainNonceGet & WrappedNftCheck<RawNft>;
declare type FullChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, string, BigNumber, RawNft, Resp> & UnfreezeForeignNft<Signer, string, BigNumber, RawNft, Resp> & EstimateTxFees<BigNumber> & NftUriChain<RawNft> & ValidateAddress;
declare type RawTxnBuiladableChain<RawNft, Resp> = TransferNftForeignUnsigned<string, BigNumber, RawNft, Resp> & UnfreezeForeignNftUnsigned<string, BigNumber, RawNft, Resp> & WrappedNftCheck<RawNft> & PreTransferRawTxn<RawNft, Resp> & MintRawTxn<Resp>;
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
     * WARN: Algorand NFTs must be manually claimed by the receiver
     * @param nft {@link NftInfo} the nft to be transferred. Can be fetched from the `nftList` method of the factory.
     * @param sender {@link Sender} The owner of the NFT.
     * @param receiver Address of the Receiver of the NFT. Could be Web3 or Elrond or Tron Address.
     * @param fee validator fees from {@link estimateFees} (will be calculated automatically if not given)
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
    pkeyToSigner<S>(nonce: ChainNonce<WrappedNftCheck<S>, unknown>, key: string): Promise<S>;
    /**
     *
     * Get transaction in the destination chain
     * WARN: use claimAlgorandNft instead for algorand.
     *
     * @param chain source chain
     * @param destination destination chain
     * @param hash transaction hash from source chain
     *
     * @returns transaction hash in original chain, unique action id
     */
    getDestinationTransaction<Txn>(chain: ExtractAction<Txn> & ExtractTxnStatus, destination: number, hash: Txn): Promise<[string, TransactionStatus]>;
    /**
     *
     * Claim an algorand nft
     *
     *
     * @param originChain chain from which the nft was transferred
     * @param txn Transaction Hash of the original
     * @param claimer the account which can claim the nft
     */
    waitAlgorandNft<Txn>(originChain: ExtractAction<Txn> & ChainNonceGet, txn: Txn, claimer: AlgoSignerH): Promise<ClaimNftInfo>;
    /**
     *
     * @param claimer: the account which can claim the nfts
     */
    claimableAlgorandNfts(claimer: string): Promise<ClaimNftInfo[]>;
    /**
     * Returns a raw txn (hopefully Typed JS Objects in all chains) which can be sent over the wire for signing and broadcasting.
     * @param from The chain from which the NFT is being sent.
     * @param toNonce The nonce of the chain to which the NFT is being sent.
     * @param sender the address of the sender of the NFT.
     * @param to the address of the receiver of the NFT.
     * @param nft the NFT to be transferred.
     * @param fee the fee to be paid for the transaction.
     */
    generateNftTxn<RawNftF, Resp>(from: RawTxnBuiladableChain<RawNftF, Resp>, toNonce: number, sender: string, to: string, nft: NftInfo<RawNftF>, fee: BigNumber): Promise<PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn>;
    generatePreTransferTxn<RawNftF, Resp>(from: RawTxnBuiladableChain<RawNftF, Resp>, sender: string, nft: NftInfo<RawNftF>, fee: BigNumber): Promise<PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn | undefined>;
    generateMintTxn<RawNftF, Resp>(from: RawTxnBuiladableChain<RawNftF, Resp>, sender: string, nft: NftMintArgs): Promise<PopulatedTransaction | ElrondRawUnsignedTxn | TronRawTxn>;
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
    algorandParams: AlgorandParams;
    fuseParams: Web3Params;
    uniqueParams: Web3Params;
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
    txSocketUri: string;
    nftListUri: string;
    nftListAuthToken: string;
    tronScanUri: string;
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
