import {
  Account,
  Address,
  AddressValue,
  Balance,
  BigUIntValue,
  BytesValue,
  ContractFunction,
  GasLimit,
  ISigner,
  NetworkConfig,
  ProxyProvider,
  TokenIdentifierValue,
  Transaction,
  TransactionPayload,
  U64Value,
} from "@elrondnetwork/erdjs";
import axios, { AxiosInstance } from "axios";
import BigNumber from "bignumber.js";
import {
  BalanceCheck,
  ListNft,
  MintNft,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
} from "./chain";

type EasyBalance = string | number | BigNumber;

const ESDT_ISSUE_ADDR = new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u");
const ESDT_ISSUE_COST = "50000000000000000";

export type NftInfo = {
  token: string;
  nonce: EasyBalance;
};

type ContractRes = {
  readonly [idx: string]: number | string;
}

export type EsdtTokenInfo = {
  readonly balance: number;
  readonly tokenIdentifier: string;
}

type BEsdtNftInfo = {
  readonly creator: string;
  readonly name: string;
  readonly nonce: number;
  readonly royalties: string;
  readonly uris: string[];
}

type MaybeEsdtNftInfo = EsdtTokenInfo & (BEsdtNftInfo | undefined);

export type EsdtNftInfo = EsdtTokenInfo & BEsdtNftInfo;

function isEsdtNftInfo(maybe: MaybeEsdtNftInfo): maybe is EsdtNftInfo {
  return maybe.creator != undefined;
}

export type NftIssueArgs = {
  readonly identifier: string,
  readonly quantity: number | undefined,
  readonly name: string,
  readonly royalties: number | undefined,
  readonly hash: string | undefined,
  readonly attrs: string | undefined,
  readonly uris: Array<string>
}

export interface IssueESDTNFT {
  issueESDTNft(
    sender: ISigner,
    name: string,
    ticker: string,
    canFreeze: boolean | undefined,
    canWipe: boolean | undefined,
    canTransferNFTCreateRole: boolean | undefined
  ): Promise<void>;
}

export type ElrondHelper = BalanceCheck<string | Address, BigNumber> &
  TransferForeign<ISigner, string, EasyBalance, Transaction> &
  UnfreezeForeign<ISigner, string, EasyBalance, Transaction> &
  TransferNftForeign<ISigner, string, NftInfo, Transaction> &
  UnfreezeForeignNft<ISigner, string, number, Transaction> &
  IssueESDTNFT &
  MintNft<ISigner, NftIssueArgs, void> &
  ListNft<string, string, EsdtNftInfo>;


export const elrondHelperFactory: (
  node_uri: string,
  minter_address: string,
  middleware_uri: string,
  esdt: string,
  esdt_nft: string
) => Promise<ElrondHelper> = async (
  node_uri: string,
  minter_address: string,
  middleware_uri: string,
  esdt: string,
  esdt_nft: string
) => {
  const provider = new ProxyProvider(node_uri);
  await NetworkConfig.getDefault().sync(provider);
  const mintContract = new Address(minter_address);
  const eventMiddleware = axios.create({
    baseURL: middleware_uri,
  });
  const providerRest = axios.create({
    baseURL: node_uri
  });
  const esdtHex = Buffer.from(esdt, "utf-8");
  const esdtNftHex = Buffer.from(esdt_nft, "utf-8");

  const handleEvent = async (tx: Transaction) => {
	await new Promise(r => setTimeout(r, 3000))
    await tx.awaitNotarized(provider);
    const res: Array<ContractRes> = (await transactionResult(tx.getHash().toString()))["smartContractResults"];

    const id = filterEventId(res);

    await emitEvent(eventMiddleware, id.toString());
  };

  const syncAccount = async (signer: ISigner) => {
    const account = new Account(signer.getAddress());
    await account.sync(provider);

    return account;
  };

  const transactionResult = async (tx_hash: string) => {
    const uri = `/transaction/${tx_hash}?withResults=true`;

    while (true) {
	  // TODO: type safety
      const res = await providerRest.get(uri);
      const data = res.data;
      if (data["code"] != "successful") {
        throw Error("failed to execute txn")
      }

      const tx_info = data["data"]["transaction"]
      if (tx_info["status"] == "pending") {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      if (tx_info["status"] != "success") {
        throw Error("failed to execute txn")
      }

      return tx_info;
    }
  }

  return {
    async balance(
      address: string | Address
    ): Promise<BigNumber> {
      const wallet = new Account(new Address(address));

      await wallet.sync(provider);

      return wallet.balance.valueOf();
    },
    async transferNativeToForeign(
      sender: ISigner,
      to: string,
      value: EasyBalance
    ): Promise<Transaction> {
      const account = await syncAccount(sender);

      const tx = new Transaction({
        receiver: mintContract,
        nonce: account.nonce,
        gasLimit: new GasLimit(50000000),
        value: new Balance(value.toString()),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("freezeSend"))
          .addArg(new BytesValue(Buffer.from(to, "ascii")))
          .build(),
      });

      sender.sign(tx);
      await tx.send(provider);

      await handleEvent(tx);

      return tx;
    },
    async unfreezeWrapped(
      sender: ISigner,
      to: string,
      value: EasyBalance
    ): Promise<Transaction> {
      const account = await syncAccount(sender);

      const tx = new Transaction({
        receiver: mintContract,
        nonce: account.nonce,
        gasLimit: new GasLimit(50000000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("ESDTTransfer"))
          .addArg(new TokenIdentifierValue(esdtHex))
          .addArg(new BigUIntValue(new BigNumber(value)))
          .addArg(new BytesValue(Buffer.from("withdraw", "ascii")))
          .addArg(new BytesValue(Buffer.from(to, "ascii")))
          .build(),
      });

      sender.sign(tx);
      await tx.send(provider);

      await handleEvent(tx);

      return tx;
    },
    async transferNftToForeign(
      sender: ISigner,
      to: string,
      { token, nonce }: NftInfo
    ): Promise<Transaction> {
      const account = await syncAccount(sender);

      const tx = new Transaction({
        receiver: account.address,
        nonce: account.nonce,
        gasLimit: new GasLimit(70000000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("ESDTNFTTransfer"))
          .addArg(new TokenIdentifierValue(Buffer.from(token, "utf-8")))
          .addArg(new U64Value(new BigNumber(nonce)))
          .addArg(new BigUIntValue(new BigNumber(1)))
          .addArg(new AddressValue(mintContract))
          .addArg(new BytesValue(Buffer.from("freezeSendNft", "ascii")))
          .addArg(new BytesValue(Buffer.from(to, "ascii")))
          .build(),
      });

      sender.sign(tx);
      await tx.send(provider);

      await handleEvent(tx);

      return tx;
    },
    async unfreezeWrappedNft(
      sender: ISigner,
      to: string,
      id: number
    ): Promise<Transaction> {
      const account = await syncAccount(sender);

      const tx = new Transaction({
        receiver: account.address,
        nonce: account.nonce,
        gasLimit: new GasLimit(70000000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("ESDTNFTTransfer"))
          .addArg(new TokenIdentifierValue(esdtNftHex))
          .addArg(new U64Value(new BigNumber(id)))
          .addArg(new BigUIntValue(new BigNumber(1)))
          .addArg(new AddressValue(mintContract))
          .addArg(new BytesValue(Buffer.from("withdrawNft", "ascii")))
          .addArg(new BytesValue(Buffer.from(to, "ascii")))
          .build(),
      });

      sender.sign(tx);
      await tx.send(provider);

      await handleEvent(tx);

      return tx;
    },
    async issueESDTNft(
      sender: ISigner,
      name: string,
      ticker: string,
      canFreeze: boolean = false,
      canWipe: boolean = false,
      canTransferNFTCreateRole: boolean = false
    ): Promise<void> {
      const account = await syncAccount(sender);
  
      const tx = new Transaction({
        receiver: ESDT_ISSUE_ADDR,
        nonce: account.nonce,
        value: new Balance(ESDT_ISSUE_COST),
        gasLimit: new GasLimit(60000000),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("issueNonFungible"))
          .addArg(new TokenIdentifierValue(Buffer.from(name, 'utf-8')))
          .addArg(new TokenIdentifierValue(Buffer.from(ticker, 'utf-8')))
          .addArg(new BytesValue(Buffer.from(canFreeze ? "true" : "false", 'ascii')))
          .addArg(new BytesValue(Buffer.from(canWipe ? "true" : "false", 'ascii')))
          .addArg(new BytesValue(Buffer.from(canTransferNFTCreateRole ? "true" : "false", 'ascii')))
          .build()
      });

      sender.sign(tx);
      await tx.send(provider);
    },
    async mintNft(
      owner: ISigner,
      {
        identifier,
        quantity,
        name,
        royalties,
        hash,
        attrs,
        uris
      }: NftIssueArgs
    ): Promise<void> {
      const account = await syncAccount(owner);

      let baseArgs = TransactionPayload.contractCall()
        .setFunction(new ContractFunction("ESDTNFTCreate"))
        .addArg(new TokenIdentifierValue(Buffer.from(identifier, 'utf-8')))
        .addArg(new BigUIntValue(new BigNumber(quantity ?? 1)))
        .addArg(new BytesValue(Buffer.from(name, 'utf-8')))
        .addArg(new U64Value(new BigNumber(royalties ?? 0)))
        .addArg(new BytesValue(hash ? Buffer.from(hash, 'utf-8') : Buffer.alloc(0)))
        .addArg(new BytesValue(attrs ? Buffer.from(attrs, 'utf-8') : Buffer.alloc(0)));

      for (const uri of uris) {
        baseArgs = baseArgs.addArg(new BytesValue(Buffer.from(uri, 'utf-8')));
      }

      const tx = new Transaction({
        receiver: account.address,
        nonce: account.nonce,
        gasLimit: new GasLimit(70000000), // TODO: Auto derive
        data: baseArgs.build()
      });

      owner.sign(tx);
      await tx.send(provider);
    },
    async listNft(owner: string): Promise<Map<string, EsdtNftInfo>> {
      const raw = await providerRest(`/address/${owner}/esdt`);
      const dat = raw.data.data.esdts as { [index: string]: MaybeEsdtNftInfo };
      const ents: [string, MaybeEsdtNftInfo][] = Object.entries(dat);

      return new Map(
        ents.filter(([_ident, info]) => isEsdtNftInfo(info))
      );
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

async function emitEvent(middleware: AxiosInstance, id: string): Promise<void> {
  await middleware.post("/event/transfer", undefined, { headers: { id } });
}
