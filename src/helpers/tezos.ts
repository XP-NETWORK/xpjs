import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  MintNft,
  NftInfo,
  NftMintArgs,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WrappedNftCheck,
} from "..";
import {
  BigMapAbstraction,
  ChainIds,
  ContractAbstraction,
  ContractMethod,
  ContractProvider,
  SendParams,
  Signer,
  TezosToolkit,
  TransactionOperation,
  TransactionWalletOperation,
  TransferParams,
  Wallet,
  WalletProvider,
} from "@taquito/taquito";

import * as utils from "@taquito/utils";
import BigNumber from "bignumber.js";
import axios from "axios";

type TezosSigner = WalletProvider | Signer;

type TezosNftInfo = {
  contract: string;
  token_id: string;
};

export type TezosHelper = TransferNftForeign<
  TezosSigner,
  string,
  BigNumber,
  TezosNftInfo,
  string
> &
  MintNft<TezosSigner, NftMintArgs, string> &
  BalanceCheck<string, BigNumber> &
  UnfreezeForeignNft<
    TezosSigner,
    string,
    BigNumber,
    TezosNftInfo,
    string
  > &
  ValidateAddress &
  EstimateTxFees<BigNumber, TezosNftInfo> &
  ChainNonceGet &
  WrappedNftCheck<TezosNftInfo> &
  Pick<PreTransfer<Signer, TezosNftInfo, string>, "preTransfer"> & {
    isApprovedForMinter(signer: Signer, nft: NftInfo<TezosNftInfo>): Promise<boolean>;
  } & {
    approveForMinter(
      address: NftInfo<TezosNftInfo>,
      sender: TezosSigner
    ): Promise<string | undefined>;
  };

export type TezosParams = {
  Tezos: TezosToolkit;
  middlewareUri: string;
  xpnftAddress: string;
  bridgeAddress: string;
  validators: string[];
};

export async function tezosHelperFactory({
  Tezos,
  middlewareUri,
  xpnftAddress,
  bridgeAddress,
  validators,
}: TezosParams): Promise<TezosHelper> {
  const event_middleware = axios.create({
    baseURL: middlewareUri,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const estimateGas = (validators: string[], baseprice: number) => {
    return new BigNumber(baseprice * (validators.length + 1));
  };

  const net = await Tezos.rpc.getChainId() == ChainIds.MAINNET ? "mainnet" : "hangzhou2net";

  async function withContract(sender: TezosSigner, contract: string, cb: (contract: ContractAbstraction<ContractProvider | Wallet>) => ContractMethod<ContractProvider | Wallet>, params?: Partial<SendParams>) {
    if ("publicKeyHash" in sender) {
      Tezos.setSignerProvider(sender);
      const contractI = await Tezos.contract.at(contract);
      const res = cb(contractI);
      const tx = await res.send(params);
      await tx.confirmation()
      return (tx as TransactionOperation).hash;
    } else {
      Tezos.setWalletProvider(sender);
      const contractI = await Tezos.wallet.at(contract);
      const res = cb(contractI);
      if (params) {
        if (!params.storageLimit)
          params.storageLimit = 60_000;
      } else {
        params = { storageLimit: 60_000 };
      }
      const tx = await res.send(params)
      await tx.confirmation();
      return (tx as TransactionWalletOperation).opHash;
    }
  }

  function withBridge(sender: TezosSigner, cb: (bridge: ContractAbstraction<ContractProvider | Wallet>) => ContractMethod<ContractProvider | Wallet>, params?: Partial<SendParams>) {
    return withContract(sender, bridgeAddress, cb, params);
  }

  function getAddress(sender: TezosSigner) {
    if ("publicKeyHash" in sender) {
      return sender.publicKeyHash();
    } else {
      return sender.getPKH();
    }
  }

  async function isApprovedForMinter(sender: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    const baseUrl = `https://better-call.dev/v1/contract/${net}/${nft.native.contract}/entrypoints/run_operation`;
    const owner = await getAddress(sender);
    const res = await axios.post(baseUrl, {
      name: "update_operators",
      source: owner,
      cancelToken: { promise: {} },
      data: {
        update_operators: [      {
          "@or_29": {
            "add_operator": {
              "@pair_32": {
                "token_id": nft.native.token_id,
                "operator": bridgeAddress
              },
              owner
            },
            "schemaKey": "L"
          }
        }]
      }
    }).catch(_ => undefined);
    if (res == undefined) {
      return false;
    }
    return res.data[0].status == "applied";
  }

  async function notifyValidator(hash: string): Promise<void> {
    await event_middleware.post("/tx/tezos", {
      tx_hash: hash,
    });
  }

  async function preTransfer(signer: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    if (await isApprovedForMinter(signer, nft)) {
      return;
    }
    const owner = await getAddress(signer)
    return await withContract(signer, nft.native.contract, (contract) => contract.methods.update_operators([
      {
        add_operator: {
          owner,
          operator: bridgeAddress,
          token_id: nft.native.token_id,
        },
      },
    ]));
  }

  return {
    async transferNftToForeign(sender, chain, to, nft, fee) {
      const hash = await withBridge(sender, (bridge) => bridge.methods.freeze_fa2(
        chain, nft.native.contract, to, parseInt(nft.native.token_id)
      ), { amount: fee.toNumber() / 1e6 });

      notifyValidator(hash);
      return hash;
    },
    async balance(address) {
      return Tezos.tz.getBalance(address);
    },
    async unfreezeWrappedNft(sender, to, nft, fee) {
      const hash = await withBridge(sender, (bridge) => bridge.methods.withdraw_nft(
        to, parseInt(nft.native.token_id)
      ), { amount: fee.toNumber() / 1e6 });

      notifyValidator(hash);
      return hash;
    },
    async mintNft(signer, { identifier, attrs, contract, uris }) {
      return await withContract(signer, xpnftAddress, (xpnft) => xpnft.methods.mint({
        token_id: identifier,
        address: contract,
        metadata: {
          uri: uris[0],
          attrs,
        },
        amount: 1,
      }));
    },
    async validateAddress(adr) {
      return Promise.resolve(utils.validateAddress(adr) === utils.ValidationResult.VALID);
    },
    isWrappedNft(nft) {
      return nft.native.contract.toLowerCase() === xpnftAddress.toLowerCase();
    },
    getNonce() {
      return 0x12;
    },
    async estimateValidateTransferNft() {
      return estimateGas(validators, 1.2e5);
    },
    async estimateValidateUnfreezeNft() {
      return estimateGas(validators, 1.2e4);
    },
    preTransfer,
    isApprovedForMinter,
    approveForMinter: (nft, sender) => preTransfer(sender, nft)
  };
}
