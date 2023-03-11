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
  BigUIntValue,
  BytesValue,
  ContractFunction,
  SmartContract,
  TokenIdentifierValue,
  TokenPayment,
  Transaction,
  TransactionHash,
  TransactionWatcher,
  U64Value,
} from "@multiversx/sdk-core";
import { WalletConnectV2Provider } from "@multiversx/sdk-wallet-connect-provider";
import { ISigner } from "@multiversx/sdk-wallet/out/interface";
import { ProxyNetworkProvider as ProxyProvider } from "@multiversx/sdk-network-providers";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";
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
import { UserSigner } from "@multiversx/sdk-wallet/out";

type ElrondSigner = ISigner | ExtensionProvider | WalletConnectV2Provider;

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
  const config = await provider.getNetworkConfig();
  const mintContract = new Address(elrondParams.minter_address);
  const swapContract = new Address(elrondParams.esdt_swap_address);
  const swapCtr = new SmartContract({
    address: swapContract,
  });
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
    return account;
  };

  const signAndSend = async (signer: ElrondSigner, tx: Transaction) => {
    const acc = await syncAccount(signer);
    tx.setNonce(acc.nonce);
    let stx: Transaction;
    if (signer instanceof WalletConnectV2Provider) {
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
      provider.sendTransaction(stx);
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
      const utx = swapCtr.call({
        chainID: config.ChainID,
        receiver: swapContract,
        gasLimit: 300000000,
        func: new ContractFunction("wrapEgld"),
        value: TokenPayment.egldFromAmount(value),
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
    const ow = new SmartContract({ address: owner });

    const args = [
      new TokenIdentifierValue(identifier),
      new BigUIntValue(new BigNumber(quantity ?? 1)),
      new BytesValue(Buffer.from(name, "utf-8")),
      new U64Value(new BigNumber(royalties ?? 0)),
      new BytesValue(hash ? Buffer.from(hash, "utf-8") : Buffer.alloc(0)),
      new BytesValue(attrs ? Buffer.from(attrs, "utf-8") : Buffer.alloc(0)),
    ];

    for (const uri of uris) {
      args.push(new BytesValue(Buffer.from(uri, "utf-8")));
    }

    return ow.call({
      func: new ContractFunction("ESDTNFTCreate"),
      chainID: config.ChainID,
      gasLimit: 70000000,
      args,
      receiver: owner,
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
    const ow = new SmartContract({ address });
    return ow.call({
      func: new ContractFunction("MultiESDTNFTTransfer"),
      chainID: config.ChainID,
      gasLimit: 300000000,
      args: [
        new AddressValue(mintContract),
        new BigUIntValue(new BigNumber(2)),
        new TokenIdentifierValue(tokenIdentReal(tokenIdentifier)),
        new U64Value(new BigNumber(nonce)),
        new BigUIntValue(new BigNumber(1)),
        new TokenIdentifierValue(esdtSwaphex.toString("hex")),
        new U64Value(new BigNumber(0x0)),
        new BigUIntValue(tx_fees),
        new BytesValue(Buffer.from("freezeSendNft", "ascii")),
        new U64Value(new BigNumber(chain_nonce)),
        new BytesValue(Buffer.from(to, "ascii")),
        new BytesValue(Buffer.from(mintWith, "ascii")),
      ],
    });
  };

  const unsignedUnfreezeNftTxn = (
    address: Address,
    to: string,
    { tokenIdentifier, nonce }: EsdtNftInfo,
    tx_fees: BigNumber,
    chain_nonce: string
  ) => {
    const ow = new SmartContract({ address });
    return ow.call({
      func: new ContractFunction("MultiESDTNFTTransfer"),
      gasLimit: 300000000,
      chainID: config.ChainID,
      args: [
        new AddressValue(mintContract),
        new BigUIntValue(new BigNumber(2)),
        new TokenIdentifierValue(tokenIdentReal(tokenIdentifier)),
        new U64Value(new BigNumber(nonce)),
        new BigUIntValue(new BigNumber(1)),
        new TokenIdentifierValue(esdtSwaphex.toString("hex")),
        new U64Value(new BigNumber(0x0)),
        new BigUIntValue(tx_fees),
        new BytesValue(Buffer.from("withdrawNft", "ascii")),
        new U64Value(new BigNumber(chain_nonce)),
        new BytesValue(Buffer.from(to, "ascii")),
      ],
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
    const sc = new SmartContract({ address: ESDT_ISSUE_ADDR });
    return sc.call({
      func: new ContractFunction("issueNonFungible"),
      args: [
        new TokenIdentifierValue(name),
        new TokenIdentifierValue(ticker),
        new BytesValue(Buffer.from("canFreeze", "ascii")),
        new BytesValue(Buffer.from(canFreeze ? "true" : "false", "ascii")),
        new BytesValue(Buffer.from("canWipe", "ascii")),
        new BytesValue(Buffer.from(canWipe ? "true" : "false", "ascii")),
        new BytesValue(Buffer.from("canChangeOwner", "ascii")),
        new BytesValue(
          Buffer.from(canTransferNFTCreateRole ? "true" : "false", "ascii")
        ),
      ],
      chainID: config.ChainID,
      gasLimit: 60000000,
      value: TokenPayment.egldFromAmount(ESDT_ISSUE_COST),
    });
  };

  const unsignedSetESDTRoles = (
    token: string,
    target: Address,
    roles: ESDTRole[]
  ) => {
    const ow = new SmartContract({ address: ESDT_ISSUE_ADDR });

    const args = [new TokenIdentifierValue(token), new AddressValue(target)];

    for (const r of roles) {
      new BytesValue(Buffer.from(r, "utf-8"));
    }
    return ow.call({
      chainID: config.ChainID,
      func: new ContractFunction("setSpecialRole"),
      gasLimit: 70000000,
      args: args,
    });
  };

  async function extractAction(tx: Transaction): Promise<string> {
    const tw = new TransactionWatcher(provider);
    let err;
    tw.awaitCompleted(tx).catch((e) => (err = e));
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
    return new Address(sender.getAddress().toString());
  }

  return {
    XpNft: elrondParams.esdt_nft,
    async balance(address: string | Address): Promise<BigNumber> {
      const wallet = new Account(new Address(address));

      return new BigNumber(wallet.balance.toString());
    },
    async isContractAddress(address) {
      return Address.fromString(address).isContractAddress();
    },
    getFeeMargin() {
      return elrondParams.feeMargin;
    },
    async extractTxnStatus(txn) {
      const status = await provider.getTransactionStatus(txn);
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
        const utx = swapCtr.call({
          func: new ContractFunction("wrapEgld"),
          chainID: config.ChainID,
          gasLimit: 50000000,
          value: TokenPayment.egldFromAmount(value),
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
      const ow = new SmartContract({
        address: new Address(
          "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
        ),
      });

      const txu = ow.call({
        func: new ContractFunction("transferOwnership"),
        args: [new TokenIdentifierValue(token), new AddressValue(target)],
        chainID: config.ChainID,
        gasLimit: 60000000,
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
      const sc = new SmartContract({ address: await getAddress(sender) });

      const txu = sc.call({
        func: new ContractFunction("MultiESDTNFTTransfer"),
        chainID: config.ChainID,
        gasLimit: 40000000 + 5000000 * nfts.length,
        args: [
          new AddressValue(mintContract),
          new BigUIntValue(new BigNumber(nfts.length + 1)),
          ...nfts.flatMap((nft) => [
            new TokenIdentifierValue(esdtNftHex.toString("hex")),
            new U64Value(new BigNumber(nft.native.nonce)),
            new BigUIntValue(new BigNumber(1)),
          ]),
          new TokenIdentifierValue(esdtSwaphex.toString("hex")),
          new U64Value(new BigNumber(0x0)),
          new BigUIntValue(txFees),
          new BytesValue(Buffer.from("withdrawBatchNft", "ascii")),
          new U64Value(new BigNumber(chainNonce)),
          new BytesValue(Buffer.from(to, "ascii")),
        ],
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
      const sc = new SmartContract({ address: await getAddress(sender) });
      const txu = sc.call({
        func: new ContractFunction("MultiESDTNFTTransfer"),
        args: [
          new AddressValue(mintContract),
          new BigUIntValue(new BigNumber(nfts.length + 1)),
          ...nfts.flatMap((nft) => [
            new TokenIdentifierValue(
              tokenIdentReal(nft.native.tokenIdentifier)
            ),
            new U64Value(new BigNumber(nft.native.nonce)),
            new BigUIntValue(new BigNumber(1)),
          ]),
          new TokenIdentifierValue(esdtSwaphex.toString("hex")),
          new U64Value(new BigNumber(0x0)),
          new BigUIntValue(txFees),
          new BytesValue(Buffer.from("freezeSendBatchNft", "ascii")),
          new U64Value(new BigNumber(chainNonce)),
          new BytesValue(Buffer.from(to, "ascii")),
          new BytesValue(Buffer.from(mintWith, "ascii")),
        ],
        chainID: config.ChainID,
        gasLimit: 50000000 + 5000000 * nfts.length,
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
      const esdtinfo = await provider.getFungibleTokensOfAccount(
        new Address(addr)
      );
      for (const t of esdtinfo) {
        if (t.identifier === elrondParams.esdt_swap) {
          new BigNumber(t.balance);
        }
      }
      throw new Error(`No wEGLD balance`);
    },
    async unwrapWegld(sender: ElrondSigner, amount: BigNumber) {
      const txu = swapCtr.call({
        func: new ContractFunction("ESDTTransfer"),
        chainID: config.ChainID,
        args: [
          new TokenIdentifierValue(esdtSwaphex.toString("hex")),
          new U64Value(amount),
          new BytesValue(Buffer.from("unwrapEgld")),
        ],
        gasLimit: 300500000,
        receiver: swapContract,
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
