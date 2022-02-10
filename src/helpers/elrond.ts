/**
 * Elrond Implementation for cross chain traits
 * Unsigned Transaction methods should be used for usage with @elrondnetwork/dapp
 * Note that Unsigned Transactions need to be manually handled after they have been added to the block
 * @module
 */
import {
  Account,
  Address,
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
  WalletConnectProvider,
} from "@elrondnetwork/erdjs";
import axios from "axios";
import BigNumber from "bignumber.js";
import {
  BalanceCheck,
  BatchWrappedBalanceCheck,
  ConcurrentSendError,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  WrappedNftCheck,
  TransactionStatus,
} from "./chain";
import {
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  MintRawTxn,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  TransferNftForeignUnsigned,
  UnfreezeForeignNftUnsigned,
  ValidateAddress,
} from "..";
import { NftMintArgs } from "..";

type ElrondSigner = ISigner | ExtensionProvider | WalletConnectProvider;

type EasyBalance = string | number | BigNumber;

const ESDT_ISSUE_ADDR = new Address(
  "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
);
const ESDT_ISSUE_COST = "50000000000000000";

const NFT_TRANSFER_COST = new BigNumber(45000000);
const NFT_UNFREEZE_COST = new BigNumber(45000000);

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

function isEsdtNftInfo(maybe: MaybeEsdtNftInfo): maybe is EsdtNftInfo {
  return maybe.creator != undefined && maybe.balance == "1";
}

/**
 * arguments required to issue an NFT
 */
export type NftIssueArgs = {
  readonly identifier: string;
  readonly quantity: number | undefined;
  readonly name: string;
  readonly royalties: number | undefined;
  readonly hash: string | undefined;
  readonly attrs: string | undefined;
  readonly uris: Array<string>;
};

/**
 * Utility for issuing ESDT which supports NFT minting
 */
export interface IssueESDTNFT {
  /**
   * Unsigned Transaction for [[issueESDTNft]]
   */
  unsignedIssueESDTNft(
    name: string,
    ticker: string,
    canFreeze: boolean | undefined,
    canWipe: boolean | undefined,
    canTransferNFTCreateRole: boolean | undefined
  ): Transaction;

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
export type ESDTRole =
  | "ESDTRoleNFTCreate"
  | "ESDTRoleNFTBurn"
  | "ESDTRoleNFTAddQuantity";

/**
 * Utility for setting ESDT roles
 */
export interface SetESDTRoles {
  /**
   * Unsigned Transaction for [[setESDTRole]]
   */
  unsignedSetESDTRoles(
    token: string,
    target: Address,
    roles: [ESDTRole]
  ): Transaction;

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
    roles: [ESDTRole]
  ): Promise<void>;
}

/**
 * Identifier for tracking a given action
 */
type EventIdent = string;

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
export type ElrondHelper = BalanceCheck<string | Address, BigNumber> &
  BatchWrappedBalanceCheck<string | Address, BigNumber> &
  TransferForeign<ElrondSigner, string, BigNumber, Transaction> &
  UnfreezeForeign<ElrondSigner, string, BigNumber> &
  TransferNftForeign<
    ElrondSigner,
    string,
    BigNumber,
    EsdtNftInfo,
    Transaction
  > &
  UnfreezeForeignNft<
    ElrondSigner,
    string,
    BigNumber,
    EsdtNftInfo,
    Transaction
  > &
  IssueESDTNFT &
  MintNft<ElrondSigner, NftMintArgs, string> & {
    mintableEsdts(address: Address): Promise<string[]>;
  } & WrappedNftCheck<EsdtNftInfo> &
  ChainNonceGet &
  ValidateAddress &
  ExtractAction<Transaction> &
  PreTransfer<ElrondSigner, EsdtNftInfo, string> &
  EstimateTxFees<BigNumber, string> &
  TransferNftForeignUnsigned<
    string,
    BigNumber,
    EsdtNftInfo,
    ElrondRawUnsignedTxn
  > &
  UnfreezeForeignNftUnsigned<
    string,
    BigNumber,
    EsdtNftInfo,
    ElrondRawUnsignedTxn
  > &
  PreTransferRawTxn<EsdtNftInfo, ElrondRawUnsignedTxn> &
  ExtractTxnStatus &
  MintRawTxn<ElrondRawUnsignedTxn>;

/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt  Identifier of the ESDT Wrapper
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export interface ElrondParams {
  node_uri: string;
  minter_address: string;
  esdt_swap_address: string;
  esdt: string;
  esdt_nft: string;
  esdt_swap: string;
  validators: string[];
  nonce: number;
}

export const elrondHelperFactory: (
  elrondParams: ElrondParams
) => Promise<ElrondHelper> = async (elrondParams: ElrondParams) => {
  const provider = new ProxyProvider(elrondParams.node_uri);
  await NetworkConfig.getDefault().sync(provider);
  const mintContract = new Address(elrondParams.minter_address);
  const swapContract = new Address(elrondParams.esdt_swap_address);
  const providerRest = axios.create({
    baseURL: elrondParams.node_uri,
  });
  const esdtHex = Buffer.from(elrondParams.esdt, "utf-8");
  const esdtNftHex = Buffer.from(elrondParams.esdt_nft, "utf-8");
  const esdtSwaphex = Buffer.from(elrondParams.esdt_swap, "utf-8");
  const decoder = new TextDecoder();
  const networkConfig = await provider.getNetworkConfig();
  const gasPriceModif =
    networkConfig.MinGasPrice.valueOf() *
    networkConfig.GasPriceModifier.valueOf();

  const syncAccount = async (signer: ElrondSigner) => {
    const account = new Account(await getAddress(signer));
    await account.sync(provider);

    return account;
  };

  const signAndSend = async (signer: ElrondSigner, tx: Transaction) => {
    const acc = await syncAccount(signer);
    tx.setNonce(acc.nonce);
    let stx: Transaction;
    if (signer instanceof WalletConnectProvider) {
      const txs = await signer.signTransactions([tx]);
      stx = txs[0];
    } else if (signer instanceof ExtensionProvider) {
      stx = await signer.signTransaction(tx);
    } else {
      await (signer as ISigner).sign(tx);
      stx = tx;
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

      const tx = await signAndSend(sender, utx);
      await transactionResult(tx.getHash());

      return tx.getHash().toString();
    }
    return undefined;
  };

  const unsignedTransferTxn = (
    chain_nonce: number,
    to: string,
    value: EasyBalance
  ) => {
    return new Transaction({
      receiver: mintContract,
      gasLimit: new GasLimit(50000000),
      value: new Balance(
        Egld.getToken(),
        Egld.getNonce(),
        new BigNumber(value.toString())
      ),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("freezeSend"))
        .addArg(new U64Value(new BigNumber(chain_nonce)))
        .addArg(new BytesValue(Buffer.from(to, "ascii")))
        .build(),
    });
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
      gasLimit: new GasLimit(70000000),
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
    id: number,
    tx_fees: BigNumber,
    chain_nonce: string
  ) => {
    return new Transaction({
      receiver: address,
      gasLimit: new GasLimit(70000000),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
        .addArg(new AddressValue(mintContract))
        .addArg(new BigUIntValue(new BigNumber(2)))
        .addArg(new TokenIdentifierValue(esdtNftHex))
        .addArg(new U64Value(new BigNumber(id)))
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

  const unsignedUnfreezeTxn = (
    chain_nonce: number,
    address: Address,
    to: string,
    value: EasyBalance
  ) => {
    return new Transaction({
      receiver: address,
      gasLimit: new GasLimit(50000000),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("ESDTNFTTransfer"))
        .addArg(new TokenIdentifierValue(esdtHex))
        .addArg(new U64Value(new BigNumber(chain_nonce)))
        .addArg(new BigUIntValue(new BigNumber(value)))
        .addArg(new AddressValue(mintContract))
        .addArg(new BytesValue(Buffer.from("withdraw", "ascii")))
        .addArg(new BytesValue(Buffer.from(to, "ascii")))
        .build(),
    });
  };

  const listEsdt = async (owner: string) => {
    const raw = await providerRest(`/address/${owner}/esdt`);
    const dat = raw.data.data.esdts as { [index: string]: MaybeEsdtNftInfo };

    return dat;
  };

  async function listNft(owner: string): Promise<Map<string, EsdtNftInfo>> {
    const ents: [string, MaybeEsdtNftInfo][] = Object.entries(
      await listEsdt(owner)
    );

    const fmapCb: (
      tok: [string, MaybeEsdtNftInfo]
    ) => [] | [[string, EsdtNftInfo]] = ([tok, info]) => {
      if (!isEsdtNftInfo(info)) {
        return [];
      }

      let sp = tok.split("-");
      let nonce = sp.pop() ?? "";
      return [[`${sp.join("-")}-${parseInt(nonce, 16).toString()}`, info]];
    };

    return new Map(ents.flatMap(fmapCb));
  }

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
        .addArg(
          new BytesValue(Buffer.from("canTransferNFTCreateRole", "ascii"))
        )
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
    roles: [ESDTRole]
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

  function estimateGas(base_fees: BigNumber, cnt: number) {
    return base_fees.times((cnt + 1) * gasPriceModif); // assume execution takes about twice as much gas fees
  }

  async function getAddress(sender: ElrondSigner): Promise<Address> {
    return new Address(await sender.getAddress());
  }

  async function balanceWrappedBatch(
    address: string | Address,
    chain_nonces: number[]
  ): Promise<Map<number, BigNumber>> {
    const esdts = Object.values(await listEsdt(address.toString()));

    const res = new Map(chain_nonces.map((v) => [v, new BigNumber(0)]));

    for (const esdt of esdts) {
      esdt.nonce &&
        esdt.tokenIdentifier.startsWith(esdt.tokenIdentifier) &&
        res.set(esdt.nonce, new BigNumber(esdt.balance));
    }

    return res;
  }

  return {
    async balance(address: string | Address): Promise<BigNumber> {
      const wallet = new Account(new Address(address));

      await wallet.sync(provider);

      return wallet.balance.valueOf();
    },
    balanceWrappedBatch,
    async transferNftToForeignTxn(
      chain_nonce,
      to,
      nft,
      txFees,
      sender,
      mintWith
    ) {
      return unsignedTransferNftTxn(
        chain_nonce,
        new Address(sender),
        to,
        nft.native,
        new BigNumber(txFees.toString()),
        mintWith
      ).toPlainObject();
    },
    async unfreezeWrappedNftTxn(to, nft, fee, sender, nonce) {
      const txu = unsignedUnfreezeNftTxn(
        new Address(sender),
        to,
        nft.native.nonce,
        new BigNumber(fee.toString()),
        nonce
      );
      txu.getSignature().hex();
      return txu.toPlainObject();
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
    async transferNativeToForeign(
      sender: ElrondSigner,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<Transaction> {
      const txu = unsignedTransferTxn(
        chain_nonce,
        to,
        new BigNumber(value.toString()).plus(txFees.toString())
      );
      const tx = await signAndSend(sender, txu);

      return tx;
    },
    async unfreezeWrapped(
      sender: ElrondSigner,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      _txFees: EasyBalance
    ): Promise<string> {
      const txu = unsignedUnfreezeTxn(
        chain_nonce,
        await getAddress(sender),
        to,
        value
      );
      const tx = await signAndSend(sender, txu);

      return tx.getHash().toString();
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

      return tx;
    },
    async unfreezeWrappedNft(
      sender: ElrondSigner,
      to: string,
      nft: NftInfo<EsdtNftInfo>,
      txFees: EasyBalance,
      nonce
    ): Promise<Transaction> {
      const txu = unsignedUnfreezeNftTxn(
        await getAddress(sender),
        to,
        nft.native.nonce,
        new BigNumber(txFees.toString()),
        nonce
      );
      const tx = await signAndSend(sender, txu);

      return tx;
    },
    unsignedIssueESDTNft,
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
      const tickerh: string = res["smartContractResults"][0].data.split("@")[2];
      return Buffer.from(tickerh, "hex").toString("utf-8");
    },
    async mintNft(owner: ElrondSigner, args: NftMintArgs): Promise<string> {
      const txu = unsignedMintNftTxn(
        await getAddress(owner),
        args as NftIssueArgs
      );
      const tx = await signAndSend(owner, txu);
      return tx.getHash().toString();
    },
    async mintableEsdts(address: Address): Promise<string[]> {
      const res = await providerRest.get(
        `/address/${address.toString()}/esdts-with-role/ESDTRoleNFTCreate`
      );

      return res.data["data"]["tokens"];
    },
    isWrappedNft(nft) {
      return (
        tokenIdentReal(nft.native.tokenIdentifier) === elrondParams.esdt_nft
      );
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
    listNft,
    async setESDTRole(
      manager: ElrondSigner,
      token: string,
      target: Address,
      roles: [ESDTRole]
    ): Promise<void> {
      const txu = unsignedSetESDTRoles(token, target, roles);

      await signAndSend(manager, txu);
    },
    getNonce() {
      return elrondParams.nonce;
    },
    async estimateValidateTransferNft(
      _toAddress: string,
      _nftUri: NftInfo<string>
    ) {
      return estimateGas(NFT_TRANSFER_COST, elrondParams.validators.length); // TODO: properly estimate NFT_TRANSFER_COST
    },
    async mintRawTxn(args, address) {
      const txu = unsignedMintNftTxn(
        new Address(address),
        args as NftIssueArgs
      );
      return txu.toPlainObject();
    },

    async estimateValidateUnfreezeNft(_to: string, _nftUri: NftInfo<string>) {
      return estimateGas(NFT_UNFREEZE_COST, elrondParams.validators.length); // TODO: properly estimate NFT_UNFREEZE_COST
    },
    wrapNftForTransfer(nft: NftInfo<EsdtNftInfo>) {
      // Approximation for wrapping this nft
      const dataLen = 4 + tokenIdentReal(nft.native.tokenIdentifier).length + 4;
      return new Uint8Array(dataLen);
    },
    async validateAddress(adr: string) {
      try {
        new Address(adr);
        return await providerRest
          .get(`/address/${adr}/esdt`)
          .then((_) => true)
          .catch((_) => false);
      } catch (_) {
        return false;
      }
    },
  };
};

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
