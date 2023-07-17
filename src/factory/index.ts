import { Chain, CHAIN_INFO, ChainType } from "../consts";
import { ElrondParams } from "../helpers/elrond";
import { TronParams } from "../helpers/tron";
import { Web3Params } from "../helpers/evm/web3";

export * from "./utils";
export * from "./factories";

import BigNumber from "bignumber.js";
import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  MintNft,
  NftInfo,
  socketHelper,
  TransactionStatus,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  EstimateDeployFees,
} from "..";

import { UserSigner } from "@elrondnetwork/erdjs/out";
import { ContractFactory, Wallet } from "@hashgraph/hethers";
import algosdk from "algosdk";
import { ethers, utils } from "ethers";
import { Base64 } from "js-base64";
import { bridgeHeartbeat } from "../services/heartbeat";
import { exchangeRateRepo } from "../services/exchangeRate";
import { nftList } from "../services/nftList";
import { scVerify } from "../services/scVerify";
import {
  AlgorandHelper,
  AlgorandParams,
  AlgoSignerH,
  algoSignerWrapper,
  ClaimNftInfo,
} from "../helpers/algorand";
import { AptosParams } from "../helpers/aptos";
import {
  BalanceCheck,
  EstimateTxFeesBatch,
  FeeMargins,
  GetFeeMargins,
  TransferNftForeignBatch,
  UnfreezeForeignNftBatch,
  WhitelistCheck,
  GetExtraFees,
} from "../helpers/chain";
import { DfinityParams } from "../helpers/dfinity/dfinity";
import {
  HEDERA_PROXY_ABI,
  HEDERA_PROXY_BC,
  HEDERA_TOKEN_SERVICE_ABI,
} from "../helpers/hedera/hts_abi";
import { NearParams } from "../helpers/near";
import { SecretParams } from "../helpers/secret";
import { SolanaParams } from "../helpers/solana";
import { TezosParams } from "../helpers/tezos";
import { TonParams } from "../helpers/ton/ton";
import { Web3ERC20Params } from "../helpers/evm/web3_erc20";
import {
  ChainNonce,
  HelperMap,
  InferChainH,
  InferChainParam,
  InferNativeNft,
  InferSigner,
  ParamMap,
} from "../type-utils";
import {
  getDefaultContract,
  checkNotOldWrappedNft,
  isWrappedNft,
} from "./utils";

import { CasperParams } from "../helpers/casper";

export type FullChain<Signer, RawNft, Resp> = TransferNftForeign<
  Signer,
  RawNft,
  Resp
> &
  UnfreezeForeignNft<Signer, RawNft, Resp> &
  EstimateTxFees<RawNft> &
  EstimateDeployFees &
  ChainNonceGet &
  ValidateAddress & { XpNft: string; XpNft1155?: string } & GetFeeMargins &
  GetExtraFees;

type FullChainBatch<Signer, RawNft, Resp> = FullChain<Signer, RawNft, Resp> &
  TransferNftForeignBatch<Signer, RawNft, Resp> &
  UnfreezeForeignNftBatch<Signer, RawNft, Resp> &
  EstimateTxFeesBatch<RawNft>;

/**
 * A type representing a chain factory.
 */
export type ChainFactory = {
  /**
   * Creates an helper factory for a given chain
   * @param chain: {@link ChainNonce} to create the helper for.
   */
  inner<T extends ChainNonce>(chain: T): Promise<InferChainH<T>>;
  /**
   * Whether or not the bridge is alive for a given chain
   * this is checked regardless before using any bridge related function(e.g transferNft) is called
   */
  bridgeStatus(): Promise<{ [chainNonce: number]: "alive" | "dead" }>;
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

  transferNft<SignerF, RawNftF, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<never, unknown, unknown>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string,
    fee?: BigNumber.Value,
    mintWith?: string,
    gasLimit?: ethers.BigNumberish | undefined,
    extraFee?: BigNumber.Value,
    gasPrice?: ethers.BigNumberish | undefined
  ): Promise<Resp | undefined>;

  transferBatchNft<SignerF, RawNftF, Resp>(
    fromChain: FullChainBatch<SignerF, RawNftF, Resp>,
    toChain: FullChainBatch<never, unknown, unknown>,
    nft: NftInfo<RawNftF>[],
    sender: SignerF,
    receiver: string,
    fee?: BigNumber.Value,
    mintWith?: string
  ): Promise<Resp[]>;

  claimHederaNFT(
    serialNumber: ethers.BigNumberish,
    proxyAddress: string,
    htsToken: string,
    sender: Wallet
  ): Promise<any>;

  listHederaClaimableNFT(
    proxyContract: string,
    htsToken: string,
    sender: Wallet
  ): Promise<ethers.BigNumber[]>;

  transferSft<SignerF, RawNftF, Resp>(
    fromChain: FullChainBatch<SignerF, RawNftF, Resp>,
    toChain: FullChainBatch<never, unknown, unknown>,
    nft: NftInfo<RawNftF>,
    sender: SignerF,
    receiver: string,
    amt: bigint,
    fee?: BigNumber.Value,
    mintWith?: string
  ): Promise<Resp[]>;
  /**
   * Mints an NFT on the chain.
   * @param chain: {@link MintNft} Chain to mint the nft on. Can be obtained from the `inner` method on the factory.
   * @param owner: {@link Signer} A signer to sign transaction, can come from either metamask, tronlink, or the elrond's maiar defi wallet.
   * @param args: {@link NftMintArgs} Arguments to mint the nft. Contract is must for web3 and tron. Identifier is must for elrond.
   */
  mint<Signer, Args, Ret>(
    chain: MintNft<Signer, Args, Ret>,
    owner: Signer,
    args: Args
  ): Promise<Ret>;
  /**
   * Lists all the NFTs on the chain owner by {@param owner}.
   * @param chain: Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
   * @param owner: Address of the owner of the NFT as a raw string.
   */
  nftList<T>(
    chain: ChainNonceGet & T,
    owner: string
  ): Promise<NftInfo<InferNativeNft<T>>[]>;
  /**
   * Estimates the required fee for transferring an NFT.
   * @param fromChain: {@link FullChain} Chain on which the NFT was minted. Can be obtained from the `inner` method on the factory.
   * @param toChain: {@link FullChain} Chain to which the NFT must be sent. Can be obtained from the `inner` method on the factory.
   * @param nft: {@link NftInfo} The NFT that has to be transferred. Generally comes from the `nftList` method of the factory.
   * @param receiver: Address of the receiver of the NFT in raw string..
   */
  estimateFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ): Promise<BigNumber>;

  estimateWithContractDep<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string
  ): Promise<{ calcContractDep: BigNumber }>;

  estimateSFTfees<SignerF, RawNftF, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    amount: bigint,
    price: number
  ): Promise<BigNumber>;

  estimateBatchFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>[],
    receiver: string
  ): Promise<BigNumber>;
  /**
   * @param nonce : {@link ChainNonce} could be a ElrondNonce, Web3Nonce, or TronNonce.
   * @param params : New Params to be set.
   */
  updateParams<T extends ChainNonce>(
    nonce: T,
    params: InferChainParam<T>
  ): void;
  pkeyToSigner<S extends ChainNonce>(
    nonce: S,
    key: string
  ): Promise<InferSigner<InferChainH<S>>>;
  /**
   * Get transaction in the destination chain
   * WARN: use claimAlgorandNft instead for algorand.
   *
   * @param chain source chain
   * @param destination destination chain
   * @param hash transaction hash from source chain
   *
   * @returns transaction hash in original chain, unique action id
   */
  getDestinationTransaction<Txn>(
    chain: ExtractAction<Txn> & ExtractTxnStatus,
    destination: number,
    hash: Txn
  ): Promise<[string, TransactionStatus]>;
  /**
   * Claim an algorand nft
   *
   * @param originChain chain from which the nft was transferred
   * @param txn Transaction Hash of the original
   * @param claimer the account which can claim the nft
   */
  waitAlgorandNft<Txn>(
    originChain: ExtractAction<Txn> & ChainNonceGet,
    txn: Txn,
    claimer: AlgoSignerH
  ): Promise<ClaimNftInfo>;
  /**
   * @param claimer: the account which can claim the nfts
   */
  claimableAlgorandNfts(claimer: string): Promise<ClaimNftInfo[]>;

  getVerifiedContract(
    from: string,
    targetChain: number,
    fc: number,
    tokenId?: string
  ): Promise<string | undefined>;

  checkWhitelist<RawNft>(
    chain: Partial<WhitelistCheck<RawNft>> & ChainNonceGet,
    nft: NftInfo<RawNft>
  ): Promise<boolean>;

  isWrappedNft(
    nft: NftInfo<unknown>,
    fromChain: number
  ): Promise<{ bool: boolean; wrapped: any }>;

  setProvider(fromChain: number, provider: any): Promise<void>;

  whitelistEVM<T extends ChainNonce>(
    chain: T,
    address: string,
    nonce: number
  ): Promise<{ success: true }>;
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
  skaleParams: Web3ERC20Params;
  dfinityParams: DfinityParams;
  nearParams: NearParams;
  moonbeamParams: Web3Params;
  abeyChainParams: Web3Params;
  tonParams: TonParams;
  aptosParams: AptosParams;
  solanaParams: SolanaParams;
  caduceusParams: Web3Params;
  okcParams: Web3Params;
  arbitrumParams: Web3Params;
  bitgertParams: Web3Params;
  optimismParams: Web3Params;
  casperParams: CasperParams;
}

export type MoralisNetwork = "mainnet" | "testnet";

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
  whitelistedUri: string;
  nftListAuthToken: string;
  tronScanUri: string;
  wrappedNftPrefix: string;
  scVerifyUri: string;
  network: "testnet" | "mainnet" | "staging";
}

function mapNonceToParams(chainParams: Partial<ChainParams>): ParamMap {
  const cToP: ParamMap = new Map();
  cToP.set(Chain.ELROND, chainParams.elrondParams);
  cToP.set(Chain.HECO, chainParams.hecoParams);
  cToP.set(Chain.BSC, chainParams.bscParams);
  cToP.set(Chain.ETHEREUM, chainParams.ropstenParams);
  cToP.set(Chain.AVALANCHE, chainParams.avalancheParams);
  cToP.set(Chain.POLYGON, chainParams.polygonParams);
  cToP.set(Chain.FANTOM, chainParams.fantomParams);
  cToP.set(Chain.TRON, chainParams.tronParams);
  cToP.set(Chain.CELO, chainParams.celoParams!);
  cToP.set(Chain.HARMONY, chainParams.harmonyParams);
  cToP.set(Chain.ONT, chainParams.ontologyParams);
  cToP.set(Chain.XDAI, chainParams.xDaiParams);
  cToP.set(Chain.ALGORAND, chainParams.algorandParams);
  cToP.set(Chain.FUSE, chainParams.fuseParams);
  cToP.set(Chain.UNIQUE, chainParams.uniqueParams);
  cToP.set(Chain.TEZOS, chainParams.tezosParams);
  cToP.set(Chain.VELAS, chainParams.velasParams);
  cToP.set(Chain.IOTEX, chainParams.iotexParams);
  cToP.set(Chain.AURORA, chainParams.auroraParams);
  cToP.set(Chain.GODWOKEN, chainParams.godwokenParams);
  cToP.set(Chain.GATECHAIN, chainParams.gateChainParams);
  cToP.set(Chain.VECHAIN, chainParams.vechainParams);
  cToP.set(Chain.SECRET, chainParams.secretParams);
  cToP.set(Chain.HEDERA, chainParams.hederaParams);
  cToP.set(Chain.SKALE, chainParams.skaleParams);
  cToP.set(Chain.DFINITY, chainParams.dfinityParams);
  cToP.set(Chain.NEAR, chainParams.nearParams);
  cToP.set(Chain.MOONBEAM, chainParams.moonbeamParams);
  cToP.set(Chain.ABEYCHAIN, chainParams.abeyChainParams);
  cToP.set(Chain.TON, chainParams.tonParams);
  cToP.set(Chain.APTOS, chainParams.aptosParams);
  cToP.set(Chain.SOLANA, chainParams.solanaParams);
  cToP.set(Chain.CADUCEUS, chainParams.caduceusParams);
  cToP.set(Chain.OKC, chainParams.okcParams);
  cToP.set(Chain.ARBITRUM, chainParams.arbitrumParams);
  cToP.set(Chain.BITGERT, chainParams.bitgertParams);
  cToP.set(Chain.OPTIMISM, chainParams.optimismParams);
  cToP.set(Chain.CASPER, chainParams.casperParams);
  return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param appConfig: {@link AppConfig} The configuration of the library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
export function ChainFactory(
  appConfig: AppConfig,
  chainParams: Partial<ChainParams>
): ChainFactory {
  let helpers: HelperMap<ChainNonce> = new Map();
  let cToP = mapNonceToParams(chainParams);

  const heartbeatRepo = bridgeHeartbeat(appConfig.heartbeatUri);

  const remoteExchangeRate = exchangeRateRepo(appConfig.exchangeRateUri);

  const txSocket = socketHelper(appConfig.txSocketUri);

  const nftListService = nftList(
    appConfig.nftListUri,
    appConfig.nftListAuthToken
  );

  const scVerifyRest = scVerify(appConfig.scVerifyUri);

  const inner = async <T extends ChainNonce>(
    chain: T
  ): Promise<InferChainH<T>> => {
    let helper = helpers.get(chain);
    if (helper === undefined) {
      helper = await CHAIN_INFO.get(chain)!.constructor(cToP.get(chain)!);
      helpers.set(chain, helper);
    }
    return helper!;
  };

  const setProvider = async <T extends ChainNonce>(chain: T, provider: any) => {
    const args = {
      ...cToP.get(chain)!,
      provider,
    };
    const helper = await CHAIN_INFO.get(chain)!.constructor(args);
    helpers.set(chain, helper);
  };

  async function calcExchangeFees<T extends ChainNonce>(
    fromChain: T,
    toChain: T,
    val: BigNumber,
    toChainFee: FeeMargins
  ): Promise<BigNumber> {
    const rate = await remoteExchangeRate.getBatchedRate([
      CHAIN_INFO.get(toChain)!.currency,
      CHAIN_INFO.get(fromChain)!.currency,
    ]);
    const feeR = val.dividedBy(CHAIN_INFO.get(toChain)!.decimals);
    const fromExRate = rate.get(CHAIN_INFO.get(fromChain)!.currency)!;
    const toExRate = rate.get(CHAIN_INFO.get(toChain)!.currency)!;
    const usdFee = Math.min(
      Math.max(toChainFee.min, feeR.times(toExRate * 0.1).toNumber()),
      toChainFee.max
    );
    const feeProfit = usdFee / fromExRate;

    return feeR
      .times(toExRate / fromExRate)
      .plus(feeProfit * 0.5)
      .times(CHAIN_INFO.get(fromChain)!.decimals)
      .integerValue(BigNumber.ROUND_CEIL);
  }
  const estimateFees = async <SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>,
    receiver: string,
    extraFee?: BigNumber.Value
  ) => {
    const estimate = await toChain.estimateValidateTransferNft(
      receiver,
      nft as any,
      ""
    );

    let conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate,
      toChain.getFeeMargin()
    );

    if (extraFee) {
      conv = conv.multipliedBy(extraFee).integerValue(BigNumber.ROUND_CEIL);
    }

    return fromChain.getExtraFees ? fromChain.getExtraFees().plus(conv) : conv;
  };

  const estimateWithContractDep = async <
    SignerF,
    RawNftF,
    SignerT,
    RawNftT,
    Resp
  >(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    toChain: FullChain<SignerT, RawNftT, Resp>,
    nft: NftInfo<any>
  ) => {
    const from = fromChain.getNonce();
    const to = toChain.getNonce();
    const noDeploy = new Error(`${from} or ${to} is undeployable`);

    let calcContractDep: BigNumber = new BigNumber("0");
    let originalContract: string;
    let originalChain: string;

    try {
      const { bool, wrapped } = await isWrappedNft(nft, from, to);

      if (bool) {
        originalContract = wrapped?.contract;
        originalChain = wrapped?.origin;

        if (to == Number(originalChain)) throw noDeploy;
      } else {
        originalContract = nft.collectionIdent || nft.native.contract;
        originalChain = nft.native.chainId;
      }

      const fromType = CHAIN_INFO.get(
        Number(originalChain) as ChainNonce
      )?.type;

      const toType = CHAIN_INFO.get(to)?.type;

      const deployable = [
        ChainType.EVM,
        ChainType.SOLANA,
        ChainType.NEAR,
        ChainType.APTOS,
        ChainType.TON,
      ];

      const deployableFrom = deployable.find((type) => type === fromType);
      const deployableTo = deployable.find((type) => type === toType);

      if (!deployableFrom || !deployableTo) throw noDeploy;

      const _chain =
        from == Number(originalChain) //if first time sending
          ? to
          : to == Number(originalChain) //if sending back
          ? from
          : to; //all the rest

      const [checkWithOutTokenId, verifyList] = await Promise.all([
        scVerifyRest.checkWithOutTokenId(
          Number(originalChain),
          _chain,
          originalContract
        ),
        scVerifyRest.list(originalContract, to, from),
      ]);

      if (
        !checkWithOutTokenId &&
        !verifyList &&
        toChain?.estimateContractDeploy
      ) {
        //@ts-ignore
        const contractFee = await toChain?.estimateContractDeploy(toChain);
        calcContractDep = (
          await calcExchangeFees(from, to, contractFee, toChain.getFeeMargin())
        ).multipliedBy(1.1);
      }

      return { calcContractDep };
    } catch (error: any) {
      console.log(
        error.message,
        console.log("error in estimateWithContractDep")
      );
      return { calcContractDep };
    }
  };

  const estimateSFTfees = async <SignerF, RawNftF, Resp>(
    fromChain: FullChain<SignerF, RawNftF, Resp>,
    amount: bigint,
    price: number = 0.05
  ) => {
    const rate = await remoteExchangeRate.getBatchedRate([
      CHAIN_INFO.get(fromChain.getNonce())!.currency,
    ]);

    const fromExRate = rate.get(
      CHAIN_INFO.get(fromChain.getNonce())!.currency
    )!;
    const y = price / fromExRate;

    const sftFees = Number(amount) <= 10 ? 0 : y * (Number(amount) - 10);
    return new BigNumber(sftFees)
      .multipliedBy(CHAIN_INFO.get(fromChain.getNonce())!.decimals)
      .integerValue();
  };

  async function bridgeStatus(): Promise<{ [x: number]: "alive" | "dead" }> {
    const res = await heartbeatRepo.status();
    return Object.fromEntries(
      Object.entries(res).map(([c, s]) => [
        c,
        s.bridge_alive ? "alive" : "dead",
      ])
    );
  }

  async function estimateBatchFees<SignerF, RawNftF, SignerT, RawNftT, Resp>(
    fromChain: FullChainBatch<SignerF, RawNftF, Resp>,
    toChain: FullChainBatch<SignerT, RawNftT, Resp>,
    nft: NftInfo<RawNftF>[],
    receiver: string
  ): Promise<BigNumber> {
    const estimate = await toChain.estimateValidateTransferNftBatch(
      receiver,
      nft as any,
      new Array(nft.length).fill(toChain.XpNft)
    );
    const conv = await calcExchangeFees(
      fromChain.getNonce(),
      toChain.getNonce(),
      estimate.times(nft.length),
      toChain.getFeeMargin()
    );
    return conv;
  }

  async function requireBridge(chains: number[]): Promise<void> {
    const status = await heartbeatRepo.status();
    let deadChain: number | undefined;
    const alive = chains.every((c) => {
      const stat = status[c].bridge_alive;
      if (!stat) {
        deadChain = c;
      }
      return stat;
    });
    if (!alive) {
      throw Error(`chain ${deadChain} is dead! its unsafe to use the bridge`);
    }
  }

  async function algoOptInCheck(
    nft: NftInfo<unknown>,
    toChain: FullChain<unknown, unknown, unknown>,
    receiver: string,
    wrapped: any
  ) {
    if ("meta" in (nft.native as Record<string, any>)) return;
    //const nftDat = await axios.get(nft.uri);
    if (
      wrapped.origin == Chain.ALGORAND.toString() &&
      "isOptIn" in toChain &&
      //@ts-ignore
      !(await (toChain as AlgorandHelper).isOptIn(
        receiver,
        parseInt(wrapped.assetID)
      ))
    ) {
      throw Error("receiver hasn't opted-in to wrapped nft");
    }
  }

  async function getVerifiedContract(
    from: string,
    tc: number,
    fc: number,
    _?: string
  ): Promise<string | undefined> {
    const res = await scVerifyRest.checkWithOutTokenId(
      fc,
      tc,
      from
    ); /*await scVerifyRest.default(
            from,
            tc,
            fc,
            tokenId && !isNaN(Number(tokenId)) ? tokenId : undefined
        );*/

    return res?.data;
  }

  /*async function checkMintWith(
        from: string,
        to: string,
        targetChain: number,
        fromChain: number,
        tokenId?: string
    ): Promise<boolean> {
        const res = await scVerifyRest.verify(
            from,
            to,
            targetChain,
            fromChain,
            tokenId
        );

        return res?.data.data == "allowed";
    }*/

  return {
    estimateWithContractDep,
    getVerifiedContract,
    balance: (i, a) => i.balance(a),
    async transferBatchNft(from, to, nfts, signer, receiver, fee, mw) {
      type Result = ReturnType<typeof to.transferNftBatchToForeign>;
      let result: Result[] = [];
      if (appConfig.network === "mainnet") {
        await requireBridge([from.getNonce(), to.getNonce()]);
      }

      if (!fee) {
        fee = await estimateBatchFees(from, to, nfts, receiver);
      }
      if (!(await to.validateAddress(receiver))) {
        throw Error("invalid address");
      }
      console.log(`Batch Minting With: ${mw || to.XpNft1155!}`);
      const wrapped: NftInfo<any>[] = [];
      const unwrapped: NftInfo<any>[] = [];
      await Promise.all(
        nfts.map(async (e) => {
          if (
            // @ts-ignore
            e.native.contractType &&
            // @ts-ignore
            e.native.contractType === "ERC721"
          ) {
            throw new Error(`ERC721 is not supported`);
          }
          if ((await isWrappedNft(e, from.getNonce())).bool) {
            wrapped.push(e);
          } else {
            unwrapped.push(e);
          }
        })
      );
      const toNonce = to.getNonce();
      unwrapped.length &&
        result.push(
          from.transferNftBatchToForeign(
            signer,
            toNonce,
            receiver,
            unwrapped,
            mw || to.XpNft1155!,
            new BigNumber(fee),
            cToP.get(toNonce)
          )
        );
      wrapped.length &&
        result.push(
          from.unfreezeWrappedNftBatch(
            signer,
            to.getNonce(),
            receiver,
            wrapped,
            new BigNumber(fee)
          )
        );
      return await Promise.all(result);
    },
    estimateBatchFees,
    async whitelistEVM<T extends ChainNonce>(chain: T, address: string) {
      const chainLocal = cToP.get(chain);

      if (!chainLocal) throw new Error("Chain not found");
      const params = await CHAIN_INFO.get(chain)?.constructor(chainLocal);
      if (!params) throw new Error("An error occured");
      const isAddressValid = await params.validateAddress(address);
      if (!isAddressValid) throw new Error("Address is not valid");

      try {
        await chainLocal.notifier.notifyEVM(chain, address);
        return { success: true };
      } catch (error) {
        throw new Error("An error occured");
      }
    },
    async transferSft(from, to, nft, sender, receiver, amt, fee?, mintWith?) {
      if (Number(amt) > 50)
        throw new Error("Currenly more that 50 SFTs is not supported");
      let transfers = Array(parseInt(amt.toString())).fill(nft);
      if (!fee) {
        fee = await estimateFees(from, to, transfers[0], receiver);
        const deplFees = (await estimateWithContractDep(from, to, transfers[0]))
          .calcContractDep;
        if (deplFees.gt(0)) {
          fee = new BigNumber(fee)
            .plus(deplFees)
            .integerValue(BigNumber.ROUND_CEIL);
        }
      }
      const sftFees = await estimateSFTfees(from, amt, 0.05);
      const x = new BigNumber(fee).plus(sftFees);

      console.log(x.toNumber());

      if (amt === BigInt(1)) {
        const response = this.transferNft(
          from,
          to,
          nft,
          sender,
          receiver,
          new BigNumber(x!).integerValue(),
          mintWith
        );
        return response as any;
      } else {
        const response = this.transferBatchNft(
          from,
          to,
          transfers,
          sender,
          receiver,
          new BigNumber(x!).integerValue(),
          mintWith
        );
        return response as any;
      }

      const response = this.transferBatchNft(
        from,
        to,
        transfers,
        sender,
        receiver,
        new BigNumber(x!).integerValue(),
        mintWith
      );
      return response;
    },
    async getDestinationTransaction<T>(
      chain: ExtractAction<T> & ExtractTxnStatus,
      targetNonce: number,
      txn: T
    ) {
      const action = await chain.extractAction(txn);
      const hash = await txSocket.waitTxHash(targetNonce, action);
      const status = await chain.extractTxnStatus(hash);
      return [hash, status];
    },
    async pkeyToSigner<T extends ChainNonce>(nonce: T, key: string) {
      switch (nonce) {
        case Chain.ELROND: {
          return UserSigner.fromPem(key);
        }
        case Chain.TRON: {
          return key;
        }
        case Chain.ALGORAND: {
          const algo = await inner(Chain.ALGORAND);
          const mnem = algosdk.secretKeyToMnemonic(Base64.toUint8Array(key));
          return algoSignerWrapper(
            algo.algod,
            algosdk.mnemonicToSecretKey(mnem)
          );
        }
        default: {
          const chainH = (await inner(nonce)) as any;
          return chainH.createWallet(key);
        }
      }
    },
    estimateFees,
    estimateSFTfees,
    inner,
    bridgeStatus,
    updateParams<T extends ChainNonce>(
      chainNonce: T,
      params: InferChainParam<T>
    ) {
      helpers.delete(chainNonce);
      cToP.set(chainNonce, params);
    },
    async nftList<T>(chain: ChainNonceGet & T, owner: string) {
      return nftListService.get(chain, owner);
    },
    transferNft: async (
      fromChain,
      toChain,
      nft,
      sender,
      receiver,
      fee,
      mintWith,
      gasLimit,
      extraFee,
      gasPrice
    ) => {
      const fromNonce = fromChain.getNonce();
      const toNonce = toChain.getNonce();
      //@ts-ignore
      if (nft.native.contract) {
        if (![9, 18, 24, 31, 27, 26].includes(fromNonce)) {
          try {
            checkNotOldWrappedNft(
              //@ts-ignore
              utils.getAddress(nft.native.contract)
            );
          } catch {
            console.log("non evm nonce");
          }
        }
      }

      if (appConfig.network === "mainnet") {
        await requireBridge([fromNonce, toNonce]);
      }

      if (!fee) {
        fee = await estimateFees(fromChain, toChain, nft, receiver, extraFee);
        const deplFees = (
          await estimateWithContractDep(fromChain, toChain, nft)
        ).calcContractDep;
        if (deplFees.gt(0)) {
          fee = new BigNumber(fee)
            .plus(deplFees)
            .integerValue(BigNumber.ROUND_CEIL);
        }
      }
      // if (!(await toChain.validateAddress(receiver))) {
      //   throw Error("invalid address");
      // }
      const { bool: unfreeze, wrapped } = await isWrappedNft(
        nft,
        fromNonce,
        toNonce
      );

      if (unfreeze) {
        await algoOptInCheck(nft, toChain, receiver, wrapped);

        const res = await fromChain.unfreezeWrappedNft(
          sender,
          receiver,
          nft,
          new BigNumber(fee),
          toNonce,
          gasLimit,
          gasPrice
        );

        return res;
      } else {
        const mw =
          /*//@ts-ignore contract is checked
                    "contract" in nft.native &&
                    mintWith &&
                    (await checkMintWith(
                        nft.collectionIdent,
                        mintWith,
                        toNonce,
                        fromNonce,
                        prepareTokenId(nft, fromNonce)
                    ))
                        ? mintWith
                        : */ mintWith ||
          getDefaultContract(nft, fromChain, toChain);

        console.log(`Minting With : ${mw}`);

        if (mw === undefined) {
          throw new Error(`Mint with is not set`);
        }

        const res = await fromChain.transferNftToForeign(
          sender,
          toNonce,
          receiver,
          nft,
          new BigNumber(fee),
          mw,
          gasLimit,
          gasPrice,
          cToP.get(toNonce)
        );

        return res;
      }
    },
    mint: async <Signer, Args, Ret>(
      chain: MintNft<Signer, Args, Ret>,
      owner: Signer,
      args: Args
    ): Promise<Ret> => {
      return await chain.mintNft(owner, args);
    },
    /**
     * Claim a transferred NFT
     * @param serialNumber The Serial Number of the claimable NFTs
     * @param contractAddress The MintWith HTS Proxy Contract used in the transfer
     * @param sender wallet of the sender
     * @returns txn response of the claimer
     */
    async claimHederaNFT(serialNumber, contractAddress, htsToken, sender) {
      const htscf = new ContractFactory(
        HEDERA_PROXY_ABI,
        HEDERA_PROXY_BC,
        sender
      );
      const hts_contract = htscf.attach(contractAddress);
      const cf = new ContractFactory(HEDERA_TOKEN_SERVICE_ABI, "0x", sender);
      const contract = cf.attach("0x0000000000000000000000000000000000000167");
      (
        await contract.associateToken(await sender.getAddress(), htsToken, {
          gasLimit: 1000000,
        })
      ).wait();

      const res = await hts_contract.functions.claimNft(
        serialNumber,
        htsToken,
        {
          gasLimit: 1000000,
        }
      );
      return res;
    },
    /**
     *  Returns all the claimable NFTs of the contract
     * @param proxyContract the address of the HTS Proxy contract that was used as mintWith in the transfer
     * @param sender wallet of the sender
     * @returns array of tokens that were minted
     */
    async listHederaClaimableNFT(proxyContract, htsToken, sender) {
      const cf = new ContractFactory(HEDERA_PROXY_ABI, HEDERA_PROXY_BC, sender);
      const contract = cf.attach(proxyContract);
      const tokens = await contract.functions.getClaimableNfts(
        await sender.getAddress(),
        htsToken,
        {
          gasLimit: 1000000,
        }
      );
      return tokens[0];
    },
    waitAlgorandNft: async (origin, hash, claimer) => {
      const action = await origin.extractAction(hash);

      return await txSocket.waitAlgorandNft(
        origin.getNonce(),
        claimer.address,
        action
      );
    },
    claimableAlgorandNfts: async (claimer) => {
      const algo: AlgorandHelper = await inner(Chain.ALGORAND);
      return await algo.claimableNfts(txSocket, claimer);
    },
    async checkWhitelist(chain, nft) {
      if (
        !chain.isNftWhitelisted ||
        (await isWrappedNft(nft, chain.getNonce())).bool
      ) {
        return true;
      }

      return await chain.isNftWhitelisted(nft);
    },
    isWrappedNft,
    setProvider,
  };
}
