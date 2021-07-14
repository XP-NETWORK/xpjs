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
  Nonce,
  parseUserKey,
  ProxyProvider,
  ResultingCall,
  TokenIdentifierValue,
  Transaction,
  TransactionPayload,
  U64Value,
  UserSigner,
} from "@elrondnetwork/erdjs";
import axios, { AxiosInstance } from "axios";
import BigNumber from "bignumber.js";
import {
  Faucet,
  TransferForeign,
  TransferNftForeign,
  UnfreezeForeign,
  UnfreezeForeignNft,
} from "./chain";

type EasyBalance = string | number | BigNumber;

export type NftInfo = {
  token: string;
  nonce: number;
};

export type ElrondHelper = Faucet<string | Address, EasyBalance, Transaction> &
  TransferForeign<ISigner, string, EasyBalance, Transaction> &
  UnfreezeForeign<ISigner, string, EasyBalance, Transaction> &
  TransferNftForeign<ISigner, string, NftInfo, Transaction> &
  UnfreezeForeignNft<ISigner, string, number, Transaction>;

export const elrondHelperFactory: (
  node_uri: string,
  faucet_key: string,
  minter_address: string,
  middleware_uri: string,
  esdt: string,
  esdt_nft: string
) => Promise<ElrondHelper> = async (
  node_uri: string,
  faucet_key: string,
  minter_address: string,
  middleware_uri: string,
  esdt: string,
  esdt_nft: string
) => {
  const provider = new ProxyProvider(node_uri);
  await NetworkConfig.getDefault().sync(provider);
  const mintContract = new Address(minter_address);
  const faucet = new UserSigner(parseUserKey(faucet_key));
  const faucetAcc = new Account(faucet.getAddress());
  const eventMiddleware = axios.create({
    baseURL: middleware_uri,
  });
  const esdtHex = Buffer.from(esdt, "utf-8");
  const esdtNftHex = Buffer.from(esdt_nft, "utf-8");

  const handleEvent = async (tx: Transaction) => {
    await tx.awaitNotarized(provider);
    const res = (await tx.getAsOnNetwork(provider))
      .getSmartContractResults()
      .getResultingCalls();

    const id = filterEventId(res);

    await emitEvent(eventMiddleware, id.toString());
  };

  const syncAccount = async (signer: ISigner) => {
    const account = new Account(signer.getAddress());
    account.sync(provider);

    return account;
  };

  return {
    async transferFromFaucet(
      to: string | Address,
      value: EasyBalance
    ): Promise<Transaction> {
      faucetAcc.sync(provider);

      const tx = new Transaction({
        receiver: new Address(to),
        nonce: faucetAcc.nonce,
        gasLimit: new GasLimit(70000),
        value: Balance.egld(value),
      });

      faucet.sign(tx);
      await tx.send(provider);

      return tx;
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
        value: Balance.egld(value),
        data: TransactionPayload.contractCall()
          .setFunction(new ContractFunction("freezeSend"))
          .addArg(new BytesValue(Buffer.from(to, "ascii")))
          .build(),
      });

      sender.sign(tx);
      await tx.send(provider);

      handleEvent(tx);

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

      handleEvent(tx);

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

      handleEvent(tx);

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

      handleEvent(tx);

      return tx;
    },
  };
};

function filterEventId(results: Array<ResultingCall>): number {
  for (const res of results) {
    if (res.nonce === new Nonce(0)) {
      continue;
    }
    const data = res.data.split("@");
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
