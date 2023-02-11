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
  UserSigner,
  WalletConnectProvider,
} from "@elrondnetwork/erdjs";
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
} from "./chain";
import {
  Chain,
  ChainNonceGet,
  EstimateTxFees,
  ExtractAction,
  ExtractTxnStatus,
  NftInfo,
  PreTransfer,
  PreTransferRawTxn,
  ValidateAddress,
} from "..";
import { EvNotifier } from "../notifier";
import { Base64 } from "js-base64";

type ElrondSigner = ISigner | ExtensionProvider | WalletConnectProvider;

type EasyBalance = string | number | BigNumber;

const ESDT_ISSUE_ADDR = new Address(
  "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
);
const ESDT_ISSUE_COST = "50000000000000000";

const NFT_TRANSFER_COST = new BigNumber(350000000);
const NFT_UNFREEZE_COST = new BigNumber(350000000);

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
export type ESDTRole =
  | "ESDTRoleNFTCreate"
  | "ESDTRoleNFTBurn"
  | "ESDTRoleNFTAddQuantity";

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
  GetTokenURI;

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
  minter_address: string;
  esdt_swap_address: string;
  esdt_nft: string;
  esdt_swap: string;
  feeMargin: FeeMargins;
}

export async function elrondHelperFactory(
  elrondParams: ElrondParams
): Promise<ElrondHelper> {
  const provider = new ProxyProvider(elrondParams.node_uri);
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
    if (signer instanceof WalletConnectProvider) {
      const txs = await signer.signTransactions([tx]);
      stx = txs[0];
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
    chain_nonce: string
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
    const dat = raw.data.data.esdts as { [index: string]: MaybeEsdtNftInfo };

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
        sender.getAddress().toString(),
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
        sender.getAddress().toString(),
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
      const tickerh: string = res["smartContractResults"][0].data.split("@")[2];
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
    getNonce() {
      return Chain.ELROND;
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
        sender.getAddress().toString(),
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
        sender.getAddress().toString(),
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
