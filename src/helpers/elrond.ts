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
  GasLimit,
  ISigner,
  NetworkConfig,
  ProxyProvider,
  TokenIdentifierValue,
  Transaction,
  TransactionHash,
  TransactionPayload,
  U64Value,
} from "@elrondnetwork/erdjs";
import axios from "axios";
import BigNumber from "bignumber.js";
import {
  BalanceCheck,
  BatchWrappedBalanceCheck,
  ConcurrentSendError,
  DecodeRawNft,
  DecodeWrappedNft,
  GetLockedNft,
  ListNft,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
  WrappedNft,
} from "./chain";
import { Base64 } from "js-base64";

type EasyBalance = string | number | BigNumber;

const ESDT_ISSUE_ADDR = new Address(
  "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
);
const ESDT_ISSUE_COST = "50000000000000000";

const NFT_TRANSFER_COST = new BigNumber(40000000);
const NFT_UNFREEZE_COST = new BigNumber(35000000);

/**
 * Information required to perform NFT transfers in this chain
 */
export type NftInfo = {
  token: string;
  nonce: EasyBalance;
};

type ContractRes = {
  readonly [idx: string]: number | string;
};

/**
 * Information associated with an ESDT Token
 */
export type EsdtTokenInfo = {
  readonly balance: string;
  readonly tokenIdentifier: string;
};

type BEsdtNftInfo = {
  readonly attributes?: string;
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
    sender: ISigner,
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
  setESDTRole(sender: ISigner, token: string, roles: [ESDTRole]): Promise<void>;
}

/**
 * Identifier for tracking a given action
 */
type EventIdent = number;

/**
 * Traits implemented by this module
 */
export type ElrondHelper = BalanceCheck<string | Address, BigNumber> &
  BatchWrappedBalanceCheck<string | Address, BigNumber> &
  // TODO: Use TX Fees
  TransferForeign<ISigner, string, EasyBalance, Transaction, EventIdent> &
  // TODO: Use TX Fees
  UnfreezeForeign<ISigner, string, EasyBalance, Transaction, EventIdent> &
  TransferNftForeign<
    ISigner,
    string,
    EasyBalance,
    NftInfo,
    Transaction,
    EventIdent
  > &
  UnfreezeForeignNft<
    ISigner,
    string,
    EasyBalance,
    number,
    Transaction,
    EventIdent
  > &
  IssueESDTNFT &
  MintNft<ISigner, NftIssueArgs, void> &
  ListNft<string, string, EsdtNftInfo> &
  GetLockedNft<NftInfo, EsdtNftInfo> &
  DecodeWrappedNft<EsdtNftInfo> &
  DecodeRawNft;

/**
 * Create an object implementing cross chain utilities for elrond
 *
 * @param node_uri  URI of the elrond node
 * @param minter_address  Address of the minter smart contract
 * @param middleware_uri  REST API of elrond-event-middleware
 * @param esdt  Identifier of the ESDT Wrapper
 * @param esdt_nft  Identifier of the ESDT NFT Wrapper
 */
export const elrondHelperFactory: (
  node_uri: string,
  minter_address: string,
  esdt_swap_address: string,
  esdt: string,
  esdt_nft: string,
  esdt_swap: string
) => Promise<ElrondHelper> = async (
  node_uri: string,
  minter_address: string,
  esdt_swap_address: string,
  esdt: string,
  esdt_nft: string,
  esdt_swap: string
) => {
  const provider = new ProxyProvider(node_uri);
  await NetworkConfig.getDefault().sync(provider);
  const mintContract = new Address(minter_address);
  const swapContract = new Address(esdt_swap_address);
  const providerRest = axios.create({
    baseURL: node_uri,
  });
  const esdtHex = Buffer.from(esdt, "utf-8");
  const esdtNftHex = Buffer.from(esdt_nft, "utf-8");
  const esdtSwaphex = Buffer.from(esdt_swap, "utf-8");
  const decoder = new TextDecoder();
  const networkConfig = await provider.getNetworkConfig();
  const gasPrice = networkConfig.MinGasPrice.valueOf();

  const syncAccount = async (signer: ISigner) => {
    const account = new Account(signer.getAddress());
    await account.sync(provider);

    return account;
  };

  const signAndSend = async (signer: ISigner, tx: Transaction) => {
    const acc = await syncAccount(signer);

    tx.setNonce(acc.nonce);
    await signer.sign(tx);

    try {
      await tx.send(provider);
    } catch (e: any) {
      if (e.message.includes("lowerNonceInTx")) {
        throw ConcurrentSendError();
      } else {
        throw e;
      }
    }
    return tx;
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

  const doEgldSwap = (
    sender: ISigner,
    value: EasyBalance
  ) => {
    const utx = new Transaction({
      receiver: swapContract,
      gasLimit: new GasLimit(50000000),
      value: new Balance(Egld.getToken(), Egld.getNonce(), new BigNumber(value.toString())),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("wrapEgld"))
        .build()
    })

    return signAndSend(sender, utx)
  }

  const unsignedTransferTxn = (
    chain_nonce: number,
    to: string,
    value: EasyBalance
  ) => {
    return new Transaction({
      receiver: mintContract,
      gasLimit: new GasLimit(50000000),
      value: new Balance(Egld.getToken(), Egld.getNonce(), new BigNumber(value.toString())),
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

  const unsignedTransferNftTxn = (
    chain_nonce: number,
    address: Address,
    to: string,
    { token, nonce }: NftInfo,
    tx_fees: BigNumber
  ) => {
    return new Transaction({
      receiver: address,
      gasLimit: new GasLimit(70000000),
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("MultiESDTNFTTransfer"))
        .addArg(new AddressValue(mintContract))
        .addArg(new BigUIntValue(new BigNumber(2)))
        .addArg(new TokenIdentifierValue(Buffer.from(token, "utf-8")))
        .addArg(new U64Value(new BigNumber(nonce)))
        .addArg(new BigUIntValue(new BigNumber(1)))
        .addArg(new TokenIdentifierValue(esdtSwaphex))
        .addArg(new U64Value(new BigNumber(0x0)))
        .addArg(new BigUIntValue(tx_fees))
        .addArg(new BytesValue(Buffer.from("freezeSendNft", "ascii")))
        .addArg(new U64Value(new BigNumber(chain_nonce)))
        .addArg(new BytesValue(Buffer.from(to, "ascii")))
        .build(),
    });
  };

  const unsignedUnfreezeNftTxn = (address: Address, to: string, id: number, tx_fees: BigNumber) => {
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
      value: new Balance(Egld.getToken(), Egld.getNonce(), new BigNumber(ESDT_ISSUE_COST.toString())),
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

  async function getLockedNft({
    token,
    nonce,
  }: NftInfo): Promise<EsdtNftInfo | undefined> {
    const nfts = await listNft(minter_address);
    return nfts.get(`${token}-${nonce.toString()}`);
  }

  const rawNftDecoder = (nftDat: Uint8Array) => {
    /// TokenLen(4 by), TokenIdent(TokenLen by), Nonce(8 by)
    /// BinaryCodec is broken for browsers. Decode manually :|
    if (nftDat.length < 12) {
      throw Error("not a wrapped nft");
    }

    const tokenLen = new Uint32Array(nftDat.slice(0, 4).reverse())[0];
    if (nftDat.length !== 12 + tokenLen) {
      throw Error("not a wrapped nft");
    }
    const token = decoder.decode(nftDat.slice(4, 4 + tokenLen));
    // TODO: Consider LO
    // tfw js can't convert be bytes to u64
    const nonce = new Uint32Array(
      nftDat.slice(4 + tokenLen, 12 + tokenLen).reverse()
    )[0];

    return { token, nonce };
  };

  async function extractId(
    tx: Transaction
  ): Promise<[Transaction, EventIdent]> {
    let err;
    await tx.awaitExecuted(provider).catch((e) => (err = e));
    if (err) {
      await new Promise((r) => setTimeout(r, 3000));
      return extractId(tx);
    }

    const txr = await transactionResult(tx.getHash());

    const id = filterEventId(txr["smartContractResults"]);

    return [tx, id];
  }

  function estimateGas(
    base_fees: BigNumber,
    cnt: number
  ) {
    return base_fees.times((cnt+1)*gasPrice); // assume execution takes about twice as much gas fees
  }

  return {
    async balance(address: string | Address): Promise<BigNumber> {
      const wallet = new Account(new Address(address));

      await wallet.sync(provider);

      return wallet.balance.valueOf();
    },
    async balanceWrappedBatch(
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
    },
    async transferNativeToForeign(
      sender: ISigner,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<[Transaction, EventIdent]> {
      const txu = unsignedTransferTxn(chain_nonce, to, new BigNumber(value.toString()).plus(txFees.toString()));
      const tx = await signAndSend(sender, txu);

      return await extractId(tx);
    },
    async unfreezeWrapped(
      sender: ISigner,
      chain_nonce: number,
      to: string,
      value: EasyBalance,
      txFees: EasyBalance
    ): Promise<[Transaction, EventIdent]> {
      await doEgldSwap(sender, txFees);
      const txu = unsignedUnfreezeTxn(
        chain_nonce,
        sender.getAddress(),
        to,
        value,
      );
      const tx = await signAndSend(sender, txu);

      return await extractId(tx);
    },
    async transferNftToForeign(
      sender: ISigner,
      chain_nonce: number,
      to: string,
      info: NftInfo,
      txFees: EasyBalance
    ): Promise<[Transaction, EventIdent]> {
      await doEgldSwap(sender, txFees);
      const txu = unsignedTransferNftTxn(
        chain_nonce,
        sender.getAddress(),
        to,
        info,
        new BigNumber(txFees.toString())
      );
      const tx = await signAndSend(sender, txu);

      return await extractId(tx);
    },
    async unfreezeWrappedNft(
      sender: ISigner,
      to: string,
      nonce: number,
      txFees: EasyBalance
    ): Promise<[Transaction, EventIdent]> {
      await doEgldSwap(sender, txFees);
      const txu = unsignedUnfreezeNftTxn(sender.getAddress(), to, nonce, new BigNumber(txFees.toString()));
      const tx = await signAndSend(sender, txu);

      return await extractId(tx);
    },
    unsignedIssueESDTNft,
    async issueESDTNft(
      sender: ISigner,
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
      return Buffer.from(tickerh, "hex").toString("utf-8")
    },
    async mintNft(owner: ISigner, args: NftIssueArgs): Promise<void> {
      const txu = unsignedMintNftTxn(owner.getAddress(), args);

      await signAndSend(owner, txu);
    },
    listNft,
    getLockedNft,
    async setESDTRole(
      manager: ISigner,
      token: string,
      target: Address,
      roles: [ESDTRole]
    ): Promise<void> {
      const txu = unsignedSetESDTRoles(token, target, roles);

      await signAndSend(manager, txu);
    },
    decodeWrappedNft(raw_data: EsdtNftInfo): WrappedNft {
      if (!raw_data.attributes) {
        throw Error("can't decode chain nonce");
      }
      return {
        // TODO: CONSIDER ALL BE BYTES
        chain_nonce: Base64.toUint8Array(raw_data.attributes!!)[0],
        data: Base64.toUint8Array(raw_data.uris[0]),
      };
    },
    async decodeUrlFromRaw(data: Uint8Array): Promise<string> {
      const nft_info = rawNftDecoder(data);
      const locked = await getLockedNft(nft_info);

      if (locked === undefined) {
        throw Error("Not a wrapped nft");
      }

      return Base64.atob(locked!.uris[0]);
    },
    async estimateValidateTransferNft(validators: string[]) {
      return estimateGas(NFT_TRANSFER_COST, validators.length) // TODO: properly estimate NFT_TRANSFER_COST
    },
    async estimateValidateUnfreezeNft(validators: string[]) {
      return estimateGas(NFT_UNFREEZE_COST, validators.length) // TODO: properly estimate NFT_UNFREEZE_COST
    }
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
