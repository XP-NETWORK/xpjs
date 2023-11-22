/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
import {
  Account,
  AddressValue,
  Balance,
  BigUIntValue,
  BytesValue,
  ContractFunction,
  Egld,
  ExtensionProvider,
  GasLimit,
  ISigner,
  NetworkConfig,
  ProxyProvider,
  TokenIdentifierValue,
  Transaction,
  TransactionHash,
  TransactionPayload,
  U64Value,
  UserSigner,
  WalletConnectProvider,
  Nonce,
  Address,
} from "@elrondnetwork/erdjs";

import { CHAIN_INFO } from "../..";

import {
  Transaction as XTRX,
  Address as XADDR,
  Account as XACC,
  TransactionPayload as XTRXPayload,
  AbiRegistry,
  SmartContract,
  StructType,
  FieldDefinition,
  BytesType,
  AddressType,
  BigUIntType,
  Struct,
  Field,
  BytesValue as XBytesValue,
  AddressValue as XAddressValue,
  BigUIntValue as XBigUIntValue,
  //BinaryCodec,
  VariadicValue,
  //ResultsParser,
  //SignableMessage,
} from "@multiversx/sdk-core";

import { ExtensionProvider as XExtensionProvider } from "@multiversx/sdk-extension-provider";

//import { Nonce as XNonce } from "@multiversx/sdk-network-providers/out/primitives";

import axios from "axios";
import BigNumber from "bignumber.js";
import {
  BalanceCheck,
  ConcurrentSendError,
  MintNft,
  TransferNftForeign,
  UnfreezeForeignNft,
  TransactionStatus,
  TransferNftForeignBatch,
  UnfreezeForeignNftBatch,
  EstimateTxFeesBatch,
  GetFeeMargins,
  FeeMargins,
  IsContractAddress,
  GetTokenURI,
  LockNFT,
  ClaimV3NFT,
  GetClaimData,
  GetTokenInfo,
} from "../chain";
import {
  //Chain,
  ChainNonce,
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  ValidateAddress,
} from "../..";
import { EvNotifier } from "../../services/notifier";
import { Base64 } from "js-base64";
import abi from "./v3Bridge_abi.json";

import { multiversexService } from "../../services/multiversex";

type ElrondSigner = (
  | ISigner
  | ExtensionProvider
  | WalletConnectProvider
  | XExtensionProvider
) & {
  chainId?: string;
};

type EasyBalance = string | number | BigNumber;

const ESDT_ISSUE_ADDR = new Address(
  "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
);
const ESDT_ISSUE_COST = "50000000000000000";

const NFT_TRANSFER_COST = new BigNumber(350000000);
const NFT_UNFREEZE_COST = new BigNumber(350000000);
const DEFAULT_V3_ROYALTY_RECEIVER =
  "2130d2c16f919f634de847801cdccefbbc1f89bdd2524d5b6b94edbf821b2b00";
//const DEFAULT_V3_ROYALTY = "1000";

type ContractRes = {
  readonly [idx: string]: number | string;
};

/**
 * Information associated with an ESDT Token
 */
export type EsdtTokenInfo = {
  readonly balance: 1 | string;
  readonly tokenIdentifier: string;
};

type BEsdtNftInfo = {
  readonly attributes?: string[];
  readonly creator: string;
  readonly name: string;
  readonly nonce: number;
  readonly royalties: string;
  readonly uris: string[];
};

type MaybeEsdtNftInfo = EsdtTokenInfo & (BEsdtNftInfo | undefined);

/**
 * Information associated with an ESDT NFT
 */
export type EsdtNftInfo = EsdtTokenInfo & BEsdtNftInfo;

/**
 * arguments required to issue an NFT
 */
export type NftIssueArgs = {
  readonly identifier: string;
  readonly uris: Array<string>;
  readonly name: string;
  readonly quantity?: number;
  readonly royalties?: number;
  readonly hash?: string;
  readonly attrs?: string;
};

/**
 * Utility for issuing ESDT which supports NFT minting
 */
export interface IssueESDTNFT {
  /**
   * Issue a new ESDT supporting NFTs
   *
   * @param sender  Owner of this ESDT
   * @param name  Name of the ESDT
   * @param ticker  Ticker of the ESDT
   * @param canFreeze  Wheteher this ESDT can be frozen
   * @param canWipe  Whether this ESDT can be wiped
   * @param canTransferNFTCreateRole  Whether the NFT Creation role can be transferred
   *
   * @returns ticker of the esdt
   */
  issueESDTNft(
    sender: ElrondSigner,
    name: string,
    ticker: string,
    canFreeze: boolean | undefined,
    canWipe: boolean | undefined,
    canTransferNFTCreateRole: boolean | undefined
  ): Promise<string>;
}

/**
 * Possible roles for an ESDT
 *
 * ESDTRoleNFTCreate: Allow creating NFTs
 * ESDTRoleNFTBurn: Allow burning NFTs
 * ESDTRoleNFTAddQuanitity: Allowing minting >1 NFTs (SFT)
 */
export type ESDTRole = "ESDTRoleNFTCreate" | "ESDTRoleNFTBurn";

/**
 * Utility for setting ESDT roles
 */
export interface SetESDTRoles {
  /**
   *
   * Set the roles for a given account for an esdt
   *
   * @param sender  Target account
   * @param token  ESDT Identifier
   * @param roles  Roles to set
   */
  setESDTRole(
    sender: ElrondSigner,
    token: string,
    target: Address,
    roles: ESDTRole[]
  ): Promise<Transaction>;
  transferESDTOwnership(
    sender: ElrondSigner,
    token: string,
    target: Address
  ): Promise<Transaction>;
}

export interface ElrondRawUnsignedTxn {
  readonly nonce: number;
  readonly value: string;
  readonly receiver: string;
  readonly sender: string;
  readonly gasPrice: number;
  readonly gasLimit: number;
  readonly data?: string;
  readonly chainID: string;
  readonly version: number;
  readonly options?: number;
  readonly signature?: string;
}

/**
 * Traits implemented by this module
 */
export type ElrondHelper = BalanceCheck &
  TransferNftForeign<ElrondSigner, EsdtNftInfo, Transaction> &
  UnfreezeForeignNft<ElrondSigner, EsdtNftInfo, Transaction> &
  TransferNftForeignBatch<ElrondSigner, EsdtNftInfo, Transaction> &
  UnfreezeForeignNftBatch<ElrondSigner, EsdtNftInfo, Transaction> &
  IssueESDTNFT &
  MintNft<ElrondSigner, NftIssueArgs, string> & {
    mintableEsdts(address: Address): Promise<string[]>;
  } & ChainNonceGet &
  ValidateAddress &
  ExtractAction<Transaction> &
  PreTransfer<ElrondSigner, EsdtNftInfo, string, undefined> &
  EstimateTxFees<EsdtNftInfo> &
  EstimateTxFeesBatch<EsdtNftInfo> &
  PreTransferRawTxn<EsdtNftInfo, ElrondRawUnsignedTxn> &
  ExtractTxnStatus &
  SetESDTRoles & { XpNft: string } & GetFeeMargins & {
    wegldBalance(address: string): Promise<BigNumber>;
    unwrapWegld(sender: ElrondSigner, amt: BigNumber): Promise<string>;
  } & IsContractAddress &
  GetTokenURI &
  LockNFT<ElrondSigner, EsdtNftInfo, XTRX> &
  ClaimV3NFT<ElrondSigner, XTRX> &
  GetClaimData &
  GetTokenInfo;

/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export interface ElrondParams {
  node_uri: string;
  notifier: EvNotifier;
  nonce: ChainNonce;
  minter_address: string;
  esdt_swap_address: string;
  esdt_nft: string;
  esdt_swap: string;
  v3_bridge: string;
  elrondApi: string;
  elrondIndex: string;
  feeMargin: FeeMargins;
}

export async function elrondHelperFactory(
  elrondParams: ElrondParams
): Promise<ElrondHelper> {
  const provider = new ProxyProvider(elrondParams.node_uri);
  //const proxyNetworkProvider = new ProxyNetworkProvider(elrondParams.node_uri);
  await NetworkConfig.getDefault().sync(provider);
  const mintContract = new Address(elrondParams.minter_address);
  const swapContract = new Address(elrondParams.esdt_swap_address);
  const providerRest = axios.create({
    baseURL: elrondParams.node_uri,
  });
  const esdtNftHex = Buffer.from(elrondParams.esdt_nft, "utf-8");
  const esdtSwaphex = Buffer.from(elrondParams.esdt_swap, "utf-8");
  const networkConfig = await provider.getNetworkConfig();
  const gasPriceModif =
    networkConfig.MinGasPrice.valueOf() *
    networkConfig.GasPriceModifier.valueOf();

  const bridgeAddress = new Address(elrondParams.v3_bridge);
  const abiRegistry = AbiRegistry.create(abi);
  const bridgeContract = new SmartContract({
    address: bridgeAddress,
    abi: abiRegistry,
  });

  const multiversexApiService = multiversexService(
    elrondParams.elrondApi,
    elrondParams.elrondIndex
  );

  async function notifyValidator(
    txn: Transaction,
    sender: string,
    uri: string[],
    action_id: string | undefined
  ) {
    await elrondParams.notifier.notifyElrond(
      txn.getHash().toString(),
      sender,
      uri,
      action_id
    );
  }

  const syncAccount = async (signer: ElrondSigner) => {
    const account = new Account(await getAddress(signer));
    await account.sync(provider);

    return account;
  };

  const signAndSend = async (signer: ElrondSigner, tx: Transaction) => {
    const acc = await syncAccount(signer);

    tx.setNonce(acc.nonce);
    let stx: Transaction;

    if ((signer as any).signTransactions) {
      const wcSigenr = signer as any;
      const address = (await signer.getAddress()) as string;

      const res = await (
        await axios(`https://gateway.multiversx.com/address/${address}/nonce`)
      ).data;

      const payload = new XTRX({
        chainID: wcSigenr.chainId,
        sender: new XADDR(address),
        data: tx.getData(),
        gasLimit: tx.getGasLimit(),
        receiver: tx.getReceiver(),
        value: tx.getValue(),
        nonce: new Nonce(res.data.nonce),
      });

      const txs = await wcSigenr.signTransactions([payload]);

      stx = txs[0];
      await provider.sendTransaction(stx);
      return stx;
    } else if (signer instanceof ExtensionProvider) {
      stx = await signer.signTransaction(tx);
    } else if (signer instanceof UserSigner) {
      await signer.sign(tx);
      stx = tx;
    } else {
      //@ts-ignore
      stx = await signer.signTransaction(tx);
    }
    try {
      await stx.send(provider);
    } catch (e: any) {
      if (e.message.includes("lowerNonceInTx")) {
        throw ConcurrentSendError();
      } else {
        throw e;
      }
    }
    return stx;
  };

  const transactionResult = async (tx_hash: TransactionHash) => {
    const uri = `/transaction/${tx_hash.toString()}?withResults=true`;
    let tries = 0;

    while (tries < 10) {
      tries += 1;
      let err;
      // TODO: type safety
      const res = await providerRest.get(uri).catch((e) => (err = e));
      if (err) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      const data = res.data;
      if (data["code"] != "successful") {
        throw Error("failed to execute txn");
      }

      const tx_info = data["data"]["transaction"];
      if (tx_info["status"] == "pending") {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (tx_info["status"] != "success") {
        throw Error("failed to execute txn");
      }

      return tx_info;
    }

    throw Error(`failed to query transaction exceeded 10 retries ${tx_hash}`);
  };

  const doEgldSwap = async (
    sender: ElrondSigner,
    nft: NftInfo<EsdtNftInfo>,
    value: BigNumber
  ) => {
    const esdts = await listEsdt((await sender.getAddress()).toString());
    const res = esdts[nft.native.nonce];

    if (res === undefined || new BigNumber(res.balance).lt(value)) {
      const utx = new Transaction({
        receiver: swapContract,
        gasLimit: new GasLimit(300000000),
        value: new Balance(
          Egld.getToken(),
          Egld.getNonce(),
          new BigNumber(value.toString()) //.div(3)
        ),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("wrapEgld"))
          .build(),
      });

      const tx = await signAndSend(sender, utx);
      await transactionResult(tx.getHash());

      return tx.getHash().toString();
    }
    return undefined;
  };

  const unsignedMintNftTxn = (
    owner: Address,
    { identifier, quantity, name, royalties, hash, attrs, uris }: NftIssueArgs
  ) => {
    let baseArgs = TransactionPayload.contractCall()
      .setFunction(new ContractFunction("ESDTNFTCreate"))
      .addArg(new TokenIdentifierValue(Buffer.from(identifier, "utf-8")))
      .addArg(new BigUIntValue(new BigNumber(quantity ?? 1)))
      .addArg(new BytesValue(Buffer.from(name, "utf-8")))
      .addArg(new U64Value(new BigNumber(royalties ?? 0)))
      .addArg(
        new BytesValue(hash ? Buffer.from(hash, "utf-8") : Buffer.alloc(0))
      )
      .addArg(
        new BytesValue(attrs ? Buffer.from(attrs, "utf-8") : Buffer.alloc(0))
      );

    for (const uri of uris) {
      baseArgs = baseArgs.addArg(new BytesValue(Buffer.from(uri, "utf-8")));
    }

    return new Transaction({
      receiver: owner,
      gasLimit: new GasLimit(70000000), // TODO: Auto derive
      data: baseArgs.build(),
    });
  };

  function tokenIdentReal(tokenIdentifier: string): string {
    const base = tokenIdentifier.split("-");
    base.pop();
    return base.join("-");
  }

  const unsignedTransferNftTxn = (
    chain_nonce: number,
    address: Address,
    to: string,
    { tokenIdentifier, nonce }: EsdtNftInfo,
    tx_fees: BigNumber,
    mintWith: string
  ) => {
    return new Transaction({
      receiver: address,
      gasLimit: new GasLimit(300000000),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
        .addArg(new AddressValue(mintContract))
        .addArg(new BigUIntValue(new BigNumber(2)))
        .addArg(
          new TokenIdentifierValue(
            Buffer.from(tokenIdentReal(tokenIdentifier), "utf-8")
          )
        )
        .addArg(new U64Value(new BigNumber(nonce)))
        .addArg(new BigUIntValue(new BigNumber(1)))
        .addArg(new TokenIdentifierValue(esdtSwaphex))
        .addArg(new U64Value(new BigNumber(0x0)))
        .addArg(new BigUIntValue(tx_fees))
        .addArg(new BytesValue(Buffer.from("freezeSendNft", "ascii")))
        .addArg(new U64Value(new BigNumber(chain_nonce)))
        .addArg(new BytesValue(Buffer.from(to, "ascii")))
        .addArg(new BytesValue(Buffer.from(mintWith, "ascii")))
        .build(),
    });
  };

  const unsignedUnfreezeNftTxn = (
    address: Address,
    to: string,
    { tokenIdentifier, nonce }: EsdtNftInfo,
    tx_fees: BigNumber,
    chain_nonce: ChainNonce
  ) => {
    return new Transaction({
      receiver: address,
      gasLimit: new GasLimit(300000000),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
        .addArg(new AddressValue(mintContract))
        .addArg(new BigUIntValue(new BigNumber(2)))
        .addArg(
          new TokenIdentifierValue(
            Buffer.from(tokenIdentReal(tokenIdentifier), "utf-8")
          )
        )
        .addArg(new U64Value(new BigNumber(nonce)))
        .addArg(new BigUIntValue(new BigNumber(1)))
        .addArg(new TokenIdentifierValue(esdtSwaphex))
        .addArg(new U64Value(new BigNumber(0x0)))
        .addArg(new BigUIntValue(tx_fees))
        .addArg(new BytesValue(Buffer.from("withdrawNft", "ascii")))
        .addArg(new U64Value(new BigNumber(chain_nonce)))
        .addArg(new BytesValue(Buffer.from(to, "ascii")))
        .build(),
    });
  };

  const listEsdt = async (owner: string) => {
    const raw = await providerRest(`/address/${owner}/esdt`);
    const dat = raw.data.data.esdts as {
      [index: string]: MaybeEsdtNftInfo;
    };

    return dat;
  };

  const unsignedIssueESDTNft = (
    name: string,
    ticker: string,
    canFreeze: boolean | undefined,
    canWipe: boolean | undefined,
    canTransferNFTCreateRole: boolean | undefined
  ) => {
    let baseArgs = TransactionPayload.contractCall()
      .setFunction(new ContractFunction("issueNonFungible"))
      .addArg(new TokenIdentifierValue(Buffer.from(name, "utf-8")))
      .addArg(new TokenIdentifierValue(Buffer.from(ticker, "utf-8")));

    if (canFreeze !== undefined) {
      baseArgs = baseArgs
        .addArg(new BytesValue(Buffer.from("canFreeze", "ascii")))
        .addArg(
          new BytesValue(Buffer.from(canFreeze ? "true" : "false", "ascii"))
        );
    }
    if (canWipe !== undefined) {
      baseArgs = baseArgs
        .addArg(new BytesValue(Buffer.from("canWipe", "ascii")))
        .addArg(
          new BytesValue(Buffer.from(canWipe ? "true" : "false", "ascii"))
        );
    }
    if (canTransferNFTCreateRole !== undefined) {
      baseArgs = baseArgs
        .addArg(new BytesValue(Buffer.from("canChangeOwner", "ascii")))
        .addArg(
          new BytesValue(
            Buffer.from(canTransferNFTCreateRole ? "true" : "false", "ascii")
          )
        );
    }

    return new Transaction({
      receiver: ESDT_ISSUE_ADDR,
      value: new Balance(
        Egld.getToken(),
        Egld.getNonce(),
        new BigNumber(ESDT_ISSUE_COST.toString())
      ),
      gasLimit: new GasLimit(60000000),
      data: baseArgs.build(),
    });
  };

  const unsignedSetESDTRoles = (
    token: string,
    target: Address,
    roles: ESDTRole[]
  ) => {
    let baseArgs = TransactionPayload.contractCall()
      .setFunction(new ContractFunction("setSpecialRole"))
      .addArg(new TokenIdentifierValue(Buffer.from(token)))
      .addArg(new AddressValue(target));

    for (const role of roles) {
      baseArgs = baseArgs.addArg(new BytesValue(Buffer.from(role, "utf-8")));
    }

    return new Transaction({
      receiver: ESDT_ISSUE_ADDR,
      gasLimit: new GasLimit(70000000), // TODO: auto derive
      data: baseArgs.build(),
    });
  };

  async function extractAction(tx: Transaction): Promise<string> {
    let err;
    await tx.awaitExecuted(provider).catch((e) => (err = e));
    if (err) {
      await new Promise((r) => setTimeout(r, 3000));
      return await extractAction(tx);
    }

    const txr = await transactionResult(tx.getHash());

    const id = filterEventId(txr["smartContractResults"]);

    return id.toString();
  }

  function estimateGas(base_fees: BigNumber) {
    return base_fees.multipliedBy(gasPriceModif); // assume execution takes about twice as much gas fees
  }

  async function getAddress(sender: ElrondSigner): Promise<Address> {
    return new Address(await sender.getAddress());
  }

  return {
    XpNft: elrondParams.esdt_nft,
    getNonce: () => elrondParams.nonce,
    async balance(address: string | Address): Promise<BigNumber> {
      const wallet = new Account(new Address(address));

      await wallet.sync(provider);

      return wallet.balance.valueOf();
    },
    async isContractAddress(address) {
      return Address.fromString(address).isContractAddress();
    },
    getFeeMargin() {
      return elrondParams.feeMargin;
    },
    async extractTxnStatus(txn) {
      const status = await provider.getTransactionStatus(
        new TransactionHash(txn)
      );
      if (status.isPending()) {
        return TransactionStatus.PENDING;
      }
      if (status.isSuccessful()) {
        return TransactionStatus.SUCCESS;
      }
      if (status.isFailed()) {
        return TransactionStatus.FAILURE;
      }
      return TransactionStatus.UNKNOWN;
    },
    preTransfer: doEgldSwap,
    preUnfreeze: doEgldSwap,
    extractAction,
    async transferNftToForeign(
      sender: ElrondSigner,
      chain_nonce: number,
      to: string,
      info: NftInfo<EsdtNftInfo>,
      txFees: EasyBalance,
      mintWith
    ): Promise<Transaction> {
      const txu = unsignedTransferNftTxn(
        chain_nonce,
        await getAddress(sender),
        to,
        info.native,
        new BigNumber(txFees.toString()),
        mintWith
      );
      const tx = await signAndSend(sender, txu);
      await notifyValidator(
        tx,
        (await sender.getAddress()).toString(),
        [info.uri],
        undefined
        // await extractAction(tx)
      );

      return tx;
    },
    async unfreezeWrappedNft(
      sender: ElrondSigner,
      to: string,
      nft: NftInfo<EsdtNftInfo>,
      txFees: EasyBalance,
      nonce
    ): Promise<Transaction> {
      console.log(`Unfreezing`);
      const txu = unsignedUnfreezeNftTxn(
        await getAddress(sender),
        to,
        nft.native,
        new BigNumber(txFees.toString()),
        nonce
      );
      const tx = await signAndSend(sender, txu);
      await notifyValidator(
        tx,
        (await sender.getAddress()).toString(),
        [nft.uri],
        undefined
        // await extractAction(tx)
      );

      return tx;
    },
    async issueESDTNft(
      sender: ElrondSigner,
      name: string,
      ticker: string,
      canFreeze: boolean = false,
      canWipe: boolean = false,
      canTransferNFTCreateRole: boolean = false
    ): Promise<string> {
      const txu = unsignedIssueESDTNft(
        name,
        ticker,
        canFreeze,
        canWipe,
        canTransferNFTCreateRole
      );

      const tx = await signAndSend(sender, txu);
      const res = await transactionResult(tx.getHash());
      const result = res["smartContractResults"].find((e: any) =>
        e.data.startsWith("@")
      );
      const tickerh: string = result.data.split("@")[2];
      return Buffer.from(tickerh, "hex").toString("utf-8");
    },
    async mintNft(owner: ElrondSigner, args: NftIssueArgs): Promise<string> {
      const txu = unsignedMintNftTxn(await getAddress(owner), args);
      const tx = await signAndSend(owner, txu);
      return tx.getHash().toString();
    },
    async mintableEsdts(address: Address): Promise<string[]> {
      const res = await providerRest.get(
        `/address/${address.toString()}/esdts-with-role/ESDTRoleNFTCreate`
      );

      return res.data["data"]["tokens"];
    },
    async preTransferRawTxn(id, address, value) {
      if (!address || !value) {
        throw new Error("address and value is required for elrond egld swap");
      }
      const esdts = await listEsdt(address);
      const res = esdts[id.native.nonce];
      if (res === undefined || new BigNumber(res.balance).lt(value)) {
        const utx = new Transaction({
          receiver: swapContract,
          gasLimit: new GasLimit(50000000),
          value: new Balance(
            Egld.getToken(),
            Egld.getNonce(),
            new BigNumber(value.toString())
          ),
          data: TransactionPayload.contractCall()
            .setFunction(new ContractFunction("wrapEgld"))
            .build(),
        });
        return utx.toPlainObject();
      }
      return undefined;
    },
    async setESDTRole(
      manager: ElrondSigner,
      token: string,
      target: Address,
      roles: ESDTRole[]
    ): Promise<Transaction> {
      const txu = unsignedSetESDTRoles(token, target, roles);

      const tx = await signAndSend(manager, txu);
      await transactionResult(tx.getHash());
      return tx;
    },
    async transferESDTOwnership(sender, token, target): Promise<Transaction> {
      const txu = new Transaction({
        receiver: new Address(
          "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
        ),
        gasLimit: new GasLimit(60000000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("transferOwnership"))
          .addArg(new TokenIdentifierValue(Buffer.from(token, "utf-8")))
          .addArg(new AddressValue(target))
          .build(),
      });

      return await signAndSend(sender, txu);
    },

    async estimateValidateTransferNft(
      _toAddress: string,
      _nftUri: NftInfo<unknown>
    ) {
      return estimateGas(NFT_TRANSFER_COST); // TODO: properly estimate NFT_TRANSFER_COST
    },
    async estimateValidateUnfreezeNft(_to: string, _nftUri: NftInfo<unknown>) {
      return estimateGas(NFT_UNFREEZE_COST); // TODO: properly estimate NFT_UNFREEZE_COST
    },
    async unfreezeWrappedNftBatch(sender, chainNonce, to, nfts, txFees) {
      const txu = new Transaction({
        receiver: await getAddress(sender),
        gasLimit: new GasLimit(40000000 + 5000000 * nfts.length), // TODO: better estimate
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
          .setArgs([
            new AddressValue(mintContract),
            new BigUIntValue(new BigNumber(nfts.length + 1)),
            ...nfts.flatMap((nft) => [
              new TokenIdentifierValue(esdtNftHex),
              new U64Value(new BigNumber(nft.native.nonce)),
              new BigUIntValue(new BigNumber(1)),
            ]),
            new TokenIdentifierValue(esdtSwaphex),
            new U64Value(new BigNumber(0x0)),
            new BigUIntValue(txFees),
            new BytesValue(Buffer.from("withdrawBatchNft", "ascii")),
            new U64Value(new BigNumber(chainNonce)),
            new BytesValue(Buffer.from(to, "ascii")),
          ])
          .build(),
      });
      const tx = await signAndSend(sender, txu);
      await notifyValidator(
        tx,
        (await sender.getAddress()).toString(),
        nfts.map((n) => n.uri),
        undefined
        // await extractAction(tx)
      );

      return tx;
    },
    async transferNftBatchToForeign(
      sender,
      chainNonce,
      to,
      nfts,
      mintWith,
      txFees
    ) {
      const txu = new Transaction({
        receiver: await getAddress(sender),
        gasLimit: new GasLimit(50000000 + 5000000 * nfts.length), // TODO: better estimate
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
          .setArgs([
            new AddressValue(mintContract),
            new BigUIntValue(new BigNumber(nfts.length + 1)),
            ...nfts.flatMap((nft) => [
              new TokenIdentifierValue(
                Buffer.from(tokenIdentReal(nft.native.tokenIdentifier), "utf-8")
              ),
              new U64Value(new BigNumber(nft.native.nonce)),
              new BigUIntValue(new BigNumber(1)),
            ]),
            new TokenIdentifierValue(esdtSwaphex),
            new U64Value(new BigNumber(0x0)),
            new BigUIntValue(txFees),
            new BytesValue(Buffer.from("freezeSendBatchNft", "ascii")),
            new U64Value(new BigNumber(chainNonce)),
            new BytesValue(Buffer.from(to, "ascii")),
            new BytesValue(Buffer.from(mintWith, "ascii")),
          ])
          .build(),
      });
      const tx = await signAndSend(sender, txu);
      await notifyValidator(
        tx,
        (await sender.getAddress()).toString(),
        nfts.map((n) => n.uri),
        undefined
        // await extractAction(tx)
      );

      return tx;
    },
    async wegldBalance(addr) {
      const esdtInfo = await provider.getAddressEsdt(
        new Address(addr),
        elrondParams.esdt_swap
      );

      return new BigNumber(esdtInfo.balance);
    },
    async unwrapWegld(sender: ElrondSigner, amount: BigNumber) {
      const txu = new Transaction({
        receiver: swapContract,
        gasLimit: new GasLimit(300500000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("ESDTTransfer"))
          .addArg(new TokenIdentifierValue(esdtSwaphex))
          .addArg(new U64Value(amount))
          .addArg(new BytesValue(Buffer.from("unwrapEgld")))
          .build(),
      });

      const tx = await signAndSend(sender, txu);

      return tx.getHash().toString();
    },
    async estimateValidateTransferNftBatch(_, nfts) {
      return estimateGas(new BigNumber(360000000 + 5000000 * nfts.length));
    },
    async estimateValidateUnfreezeNftBatch(_, nfts) {
      return estimateGas(new BigNumber(340000000 + 5000000 * nfts.length));
    },
    validateAddress(adr: string, options) {
      try {
        new Address(adr);
        if (options?.apiValidation) {
          return providerRest
            .get(`/address/${adr}/esdt`)
            .then((_) => true)
            .catch((_) => false);
        }
        return true;
      } catch (_) {
        return false;
      }
    },
    async getTokenURI(_, tokenId) {
      if (tokenId) {
        const url = `https://api.elrond.com/nfts/${tokenId}`;
        const res = await axios(url).catch(() => ({ data: null }));

        if (res.data?.metadata) {
          return url;
        }

        const uri = res.data?.uris[1] || res.data?.uris[0];
        if (uri) {
          return Base64.decode(uri);
        }
      }
      return "";
    },
    async getTokenInfo(depTrxData) {
      console.log(depTrxData, "depTrxData");

      const nftData = await multiversexApiService.getTokenInfo(
        depTrxData.sourceNftContractAddress,
        Number(depTrxData.tokenId).toString(16)
      );

      const collectionData = await multiversexApiService.getCollectionInfo(
        depTrxData.sourceNftContractAddress
      );

      console.log(collectionData, "collectionData");

      return {
        metadata: Base64.decode(nftData?.uris?.at(1) || ""),
        name: collectionData.name,
        symbol: depTrxData.sourceNftContractAddress,
        //image: Base64.decode(nftData?.uris?.at(0) || ""),
        royalty: String(nftData.royalties * 100),
      };
    },
    async getClaimData(hash, helpers) {
      try {
        /*const sourceNonce = Array.from(CHAIN_INFO.values()).find((c) => c.v3_chainId === "MULTIVERSX")?.nonce;

                if (!sourceNonce) {
                    throw new Error("Source chain is undefined");
                }
                console.log(sourceNonce, "sourceNonce in elrond");

                const sourceChain = helpers.get(sourceNonce as ChainNonce);

                const data = (
                    await axios(`${elrondParams.elrondApi}/transaction/${hash}?withResults=true`).catch(() => undefined)
                )?.data?.data?.transaction;

                // const x = provider.getTransaction();

                if (!data) {
                    throw new Error("Failed to get Multiversex trx data");
                }

                const topics = data.logs.events.find((e: any) => e.address === data.sender).topics;
                console.log(topics, "topics");

                const decodedData = decodeBase64Array(topics);

                console.log(decodedData);

                if (!decodedData) {
                    throw new Error("Failed to get Multiversex trx data");
                }

                const tokenId = String(decodedData[1].charCodeAt(0));
                const destinationChain = decodedData[2] as V3_ChainId;
                const destinationUserAddress = decodedData[3];
                const sourceNftContractAddress = decodedData[4];
                const tokenAmount = String(decodedData[5].charCodeAt(0));
                const nftType = decodedData[6] as "singular" | "multiple";
                const sourceChain = decodedData[7] as V3_ChainId;*/

        const decoded = await multiversexApiService.getLockDecodedArgs(hash);

        /*const decoded: DepTrxData = {
                    destinationChain,
                    destinationUserAddress,
                    nftType,
                    sourceChain,
                    sourceNftContractAddress,
                    tokenAmount,
                    tokenId,
                };*/

        const sourceNonce = Array.from(CHAIN_INFO.values()).find(
          (c) => c.v3_chainId === decoded.sourceChain
        )?.nonce;

        if (!sourceNonce) {
          throw new Error("Source chain is undefined");
        }
        console.log(sourceNonce, "sourceNonce in elrond");

        const sourceChainHelper = helpers.get(sourceNonce as ChainNonce);

        const tokenInfo = await (sourceChainHelper as any).getTokenInfo(
          decoded
        );

        return {
          ...tokenInfo,
          ...decoded,
        };
      } catch (e) {
        console.log(e, "e");
        throw e;
      }
    },
    async lockNFT(signer, toChain, id, receiver) {
      let collectionIdentifiers =
        "@" + Buffer.from(id.collectionIdent).toString("hex");
      let noncec = "@" + id.native.tokenIdentifier.split("-").at(2);
      let quantity = "@" + "01";
      let destination_address = "@" + bridgeAddress.hex();
      let method = "@" + Buffer.from("lock721").toString("hex");
      let token_id =
        "@" + Buffer.from(id.native.tokenIdentifier).toString("hex");
      let destination_chain = "@" + Buffer.from(toChain).toString("hex");
      let destination_user_address =
        "@" + Buffer.from(receiver).toString("hex");
      let source_nft_contract_address = collectionIdentifiers;

      const senderAddress = (await signer.getAddress()) as string;
      const sender = new XADDR(senderAddress);
      const trx = new XTRX({
        data: new XTRXPayload(
          "ESDTNFTTransfer" +
            collectionIdentifiers +
            noncec +
            quantity +
            destination_address +
            method +
            token_id +
            destination_chain +
            destination_user_address +
            source_nft_contract_address +
            noncec
        ),
        gasLimit: 600000000,
        sender,
        receiver: sender,
        chainID: signer.chainId || "1",
      });

      const account = new XACC(sender);
      account.update(await provider.getAccount(new Address(senderAddress)));
      trx.setNonce(account.nonce);

      const txs = await (signer as XExtensionProvider).signTransaction(trx);

      await provider.sendTransaction(txs as unknown as Transaction);
      return txs;
    },
    async claimV3NFT(
      signer,
      helpers,
      from,
      transactionHash,
      storageContract,
      initialClaimData
    ) {
      const [claimDataRes] = await Promise.allSettled([
        // bridge.validatorsCount(),
        from.getClaimData(transactionHash, helpers),
      ]);

      if (claimDataRes.status === "rejected") {
        throw new Error("Failed to get claimData from dep chain");
      }

      const claimData = claimDataRes.value;
      initialClaimData.royaltyReceiver =
        initialClaimData.royaltyReceiver || DEFAULT_V3_ROYALTY_RECEIVER;

      console.log(
        { ...claimData, ...initialClaimData, transactionHash },
        "claim data"
      );

      const structClaimData = new StructType("ClaimData", [
        new FieldDefinition("token_id", "name of the nft", new BytesType()),
        new FieldDefinition(
          "source_chain",
          "attributes of the nft",
          new BytesType()
        ),
        new FieldDefinition(
          "destination_chain",
          "attributes of the nft",
          new BytesType()
        ),
        new FieldDefinition(
          "destination_user_address",
          "attributes of the nft",
          new AddressType()
        ),
        new FieldDefinition(
          "source_nft_contract_address",
          "attributes of the nft",
          new BytesType()
        ),
        new FieldDefinition("name", "attributes of the nft", new BytesType()),
        new FieldDefinition("symbol", "attributes of the nft", new BytesType()),
        new FieldDefinition(
          "royalty",
          "attributes of the nft",
          new BigUIntType()
        ),
        new FieldDefinition(
          "royalty_receiver",
          "attributes of the nft",
          new AddressType()
        ),
        new FieldDefinition("attrs", "attributes of the nft", new BytesType()),
        new FieldDefinition(
          "transaction_hash",
          "attributes of the nft",
          new BytesType()
        ),
        new FieldDefinition(
          "token_amount",
          "attributes of the nft",
          new BigUIntType()
        ),
        new FieldDefinition(
          "nft_type",
          "attributes of the nft",
          new BytesType()
        ),
        new FieldDefinition("fee", "attributes of the nft", new BigUIntType()),
      ]);

      /*const structSigInfo = new StructType("SignatureInfo", [
                new FieldDefinition("public_key", "attributes of the nft", new AddressType()),
                new FieldDefinition("sig", "attributes of the nft", new BytesType()),
            ]);*/

      const claimDataArgs = new Struct(structClaimData, [
        new Field(
          new XBytesValue(
            Buffer.from(Number(claimData.tokenId).toString(16), "hex")
          ),
          "token_id"
        ),
        new Field(
          new XBytesValue(Buffer.from(claimData.sourceChain)),
          "source_chain"
        ),
        new Field(
          new XBytesValue(Buffer.from(claimData.destinationChain)),
          "destination_chain"
        ),
        new Field(
          new XAddressValue(new XADDR(claimData.destinationUserAddress)),
          "destination_user_address"
        ),
        new Field(
          new XBytesValue(Buffer.from(claimData.sourceNftContractAddress)),
          "source_nft_contract_address"
        ),
        new Field(new XBytesValue(Buffer.from(claimData.name)), "name"),
        new Field(new XBytesValue(Buffer.from(claimData.symbol)), "symbol"),
        new Field(
          new XBigUIntValue(Number(claimData.royalty) / 100),
          "royalty"
        ),
        new Field(
          new XAddressValue(new XADDR(initialClaimData.royaltyReceiver)),
          "royalty_receiver"
        ),
        new Field(new XBytesValue(Buffer.from(claimData.metadata)), "attrs"),
        new Field(
          new XBytesValue(Buffer.from(transactionHash)),
          "transaction_hash"
        ),
        new Field(new XBigUIntValue(claimData.tokenAmount), "token_amount"),
        new Field(new XBytesValue(Buffer.from(claimData.nftType)), "nft_type"),
        new Field(
          new XBigUIntValue(new BigNumber(initialClaimData.fee)),
          "fee"
        ),
      ]);

      const address = new XADDR((await signer.getAddress()) as string);

      const signatures = await storageContract.getLockNftSignatures(
        transactionHash,
        CHAIN_INFO.get(from.getNonce())?.v3_chainId!
      );

      console.log(signatures, "signatures");

      const image =
        (await axios(claimData.metadata).catch(() => undefined))?.data?.image ||
        "";

      const sigArgs = signatures.map((item) => {
        return {
          sig: new XBytesValue(
            Buffer.from(item.signature.replace("0x", ""), "hex")
          ),
          public_key: new XAddressValue(
            new XADDR(Buffer.from(item.signerAddress, "hex"))
          ),
        };
      });
      const data = [
        claimDataArgs,
        sigArgs,
        VariadicValue.fromItems(
          new XBytesValue(Buffer.from(image, "utf-8")),
          new XBytesValue(Buffer.from(claimData.metadata, "utf-8"))
        ),
      ];

      const trx = bridgeContract.methods
        .claimNft721(data)
        .withSender(address)
        .withChainID(signer.chainId!)
        .withGasLimit(6_000_000_00)
        .withValue(new BigNumber("50000000000000000"))
        .buildTransaction();

      const account = new XACC(address);
      account.update(await provider.getAccount(Address.fromHex(address.hex())));
      trx.setNonce(account.nonce);

      const txs = await (signer as XExtensionProvider).signTransaction(trx);

      await provider.sendTransaction(txs as unknown as Transaction);
      return txs;
    },
  };
}

function filterEventId(results: Array<ContractRes>): number {
  for (const res of results) {
    if (res["nonce"] === 0) {
      continue;
    }
    const data = (res.data as string).split("@");
    if (data[0] != "" || data[1] != "6f6b" || data.length != 3) {
      continue;
    }

    try {
      return parseInt(data[2], 16);
    } catch (NumberFormatException) {
      continue;
    }
  }

  throw Error(`invalid result: ${results.toString()}`);
}
