import { ElrondParams } from "../helpers/elrond";
import { TronParams } from "../helpers/tron";
import { Web3Params } from "../helpers/web3";
export * from "./factories";
import { ChainNonceGet, EstimateTxFees, ExtractAction, ExtractTxnStatus, MintNft, NftInfo, TransactionStatus, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { AlgorandParams, AlgoSignerH, ClaimNftInfo } from "../helpers/algorand";
import { TezosParams } from "../helpers/tezos";
import { BalanceCheck, EstimateTxFeesBatch, GetFeeMargins, TransferNftForeignBatch, UnfreezeForeignNftBatch, WhitelistCheck } from "../helpers/chain";
import { ChainNonce, InferChainH, InferChainParam, InferSigner } from "../type-utils";
import { SecretParams } from "../helpers/secret";
import { DfinityParams } from "../helpers/dfinity/dfinity";
declare type FullChain<Signer, RawNft, Resp> = TransferNftForeign<Signer, RawNft, Resp> & UnfreezeForeignNft<Signer, RawNft, Resp> & EstimateTxFees<RawNft> & ChainNonceGet & ValidateAddress & {
    XpNft: string;
    XpNft1155?: string;
} & GetFeeMargins;
declare type FullChainBatch<Signer, RawNft, Resp> = FullChain<Signer, RawNft, Resp> & TransferNftForeignBatch<Signer, RawNft, Resp> & UnfreezeForeignNftBatch<Signer, RawNft, Resp> & EstimateTxFeesBatch<RawNft>;
/**
 * A type representing a chain factory.
 *
 */
export declare type ChainFactory = {
    /**
     * Creates an helper factory for a given chain
     * @param chain: {@link ChainNonce} to create the helper for.
     */
    inner<T extends ChainNonce>(chain: T): Promise<InferChainH<T>>;
    /**
     * Whether or not the bridge is alive for a given chain
     * this is checked regardless before using any bridge related function(e.g transferNft) is called
     */
    bridgeStatus(): Promise<{
        [chainNonce: number]: "alive" | "dead";
    }>;
    /**
     * Check the balance of an account
     *
     * @param inner The chain to check the balance in
     * @param address address of the account
     */
    balance(inner: BalanceCheck, address: string): Promise<BigNumber>;
    /**
     * Transfers the NFT from one chain to other.
     * @param fromChain {@link FullChain} the chain to transfer from. Use inner method of the factory to get this.
     * @param toChain {@link FullChain} the chain to transfer to. Use inner method of the factory to get this.
     * WARN: Algorand NFTs must be manually claimed by the receiver
     * @param nft {@link NftInfo} the nft to be transferred. Can be fetched from the `nftList` method of the factory.
     * @param sender {@link Sender} The owner of the NFT.
     * @param receiver Address of the Receiver of the NFT. Could be Web3 or Elrond or Tron Address.
     * @param fee validator fees from {@link estimateFees} (will be calculated automatically if not given)
     * @param mintWith an arbitrary address of the target chain minter contract
     * @param gasLimit an arbitrary gas limit value (required for some chains)
     */
    transferNft<SignerF, RawNftF, Resp>(fromChain: FullChain<SignerF, RawNftF, Resp>, toChain: FullChain<never, unknown, unknown>, nft: NftInfo<RawNftF>, sender: SignerF, receiver: string, fee?: BigNumber.Value, mintWith?: string, gasLimit?: ethers.BigNumberish | undefined): Promise<Resp>;
    transferBatchNft<SignerF, RawNftF, Resp>(fromChain: FullChainBatch<SignerF, RawNftF, Resp>, toChain: FullChainBatch<never, unknown, unknown>, nft: NftInfo<RawNftF>[], sender: SignerF, receiver: string, fee?: BigNumber.Value, mintWith?: string): Promise<Resp[]>;
    transferSft<SignerF, RawNftF, Resp>(fromChain: FullChainBatch<SignerF, RawNftF, Resp>, toChain: FullChainBatch<never, unknown, unknown>, nft: NftInfo<RawNftF>, sender: SignerF, receiver: string, amt: bigint, fee?: BigNumber.Value, mintWith?: string): Promise<Resp[]>;
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
    nftList<RawNft>(chain: ChainNonceGet, owner: string): Promise<NftInfo<RawNft>[]>;
    /**
     * Estimates the required fee for transferring an NFT.
     * @param fromChain: {@link FullChain} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
     * @param toChain: {@link FullChain} Chain to which the NFT must be sent. Can be obtained from the `inner` method on the factory.
     * @param nft: {@link NftInfo} The NFT that has to be transferred. Generally comes from the `nftList` method of the factory.
     * @param receiver: Address of the receiver of the NFT in raw string..
     */
    estimateFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(fromChain: FullChain<SignerF, RawNftF, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>, nft: NftInfo<RawNftF>, receiver: string): Promise<BigNumber>;
    estimateBatchFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(fromChain: FullChain<SignerF, RawNftF, Resp>, toChain: FullChain<SignerT, RawNftT, Resp>, nft: NftInfo<RawNftF>[], receiver: string): Promise<BigNumber>;
    /**
     *
     * @param nonce : {@link ChainNonce} could be a ElrondNonce, Web3Nonce, or TronNonce.
     * @param params : New Params to be set.
     */
    updateParams<T extends ChainNonce>(nonce: T, params: InferChainParam<T>): void;
    pkeyToSigner<S extends ChainNonce>(nonce: S, key: string): Promise<InferSigner<InferChainH<S>>>;
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
    getVerifiedContract(from: string, targetChain: number, fc: number, tokenId?: string): Promise<string | undefined>;
    checkWhitelist<RawNft>(chain: Partial<WhitelistCheck<RawNft>> & ChainNonceGet, nft: NftInfo<RawNft>): Promise<boolean>;
    isWrappedNft(nft: NftInfo<unknown>, fromChain: number): Promise<boolean>;
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
    tezosParams: TezosParams;
    velasParams: Web3Params;
    iotexParams: Web3Params;
    vechainParams: Web3Params;
    auroraParams: Web3Params;
    godwokenParams: Web3Params;
    gateChainParams: Web3Params;
    secretParams: SecretParams;
    hederaParams: Web3Params;
    skaleParams: Web3Params;
    dfinityParams: DfinityParams;
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
    wrappedNftPrefix: string;
    scVerifyUri: string;
    network: "testnet" | "mainnet";
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
export * from "./factories";
export * from "./cons";
//# sourceMappingURL=index.d.ts.map