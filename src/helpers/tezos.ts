import {
  BalanceCheck,
  Chain,
  ChainNonceGet,
  EstimateTxFees,
  MintNft,
  NftInfo,
  NftMintArgs,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "..";
import {
  BigMapAbstraction,
  ContractAbstraction,
  ContractMethod,
  ContractProvider,
  SendParams,
  Signer,
  TezosToolkit,
  TransactionOperation,
  TransactionWalletOperation,
  Wallet,
  WalletProvider,
} from "@taquito/taquito";

import * as utils from "@taquito/utils";
import BigNumber from "bignumber.js";
import { EvNotifier } from "../notifier";
import { FeeMargins, GetFeeMargins, WhitelistCheck } from "./chain";

type TezosSigner = WalletProvider | Signer;

export type TezosNftInfo = {
  contract: string;
  token_id: string;
};

export type TezosHelper = TransferNftForeign<
  TezosSigner,
  TezosNftInfo,
  string
> &
  MintNft<TezosSigner, NftMintArgs, string> &
  BalanceCheck &
  UnfreezeForeignNft<TezosSigner, TezosNftInfo, string> &
  ValidateAddress &
  EstimateTxFees<TezosNftInfo> &
  ChainNonceGet &
  Pick<PreTransfer<Signer, TezosNftInfo, string>, "preTransfer"> & {
    isApprovedForMinter(
      signer: TezosSigner,
      nft: NftInfo<TezosNftInfo>
    ): Promise<boolean>;
  } & {
    approveForMinter(
      address: NftInfo<TezosNftInfo>,
      sender: TezosSigner
    ): Promise<string | undefined>;
  } & {
    XpNft: string;
  } & GetFeeMargins &
  WhitelistCheck<TezosNftInfo>;

export type TezosParams = {
  Tezos: TezosToolkit;
  notifier: EvNotifier;
  xpnftAddress: string;
  bridgeAddress: string;
  validators: string[];
  feeMargin: FeeMargins;
};

export async function tezosHelperFactory({
  Tezos,
  notifier,
  xpnftAddress,
  bridgeAddress,
  validators,
  feeMargin,
}: TezosParams): Promise<TezosHelper> {
  const estimateGas = (validators: string[], baseprice: number) => {
    return new BigNumber(baseprice * (validators.length + 1));
  };

  async function withContract(
    sender: TezosSigner,
    contract: string,
    cb: (
      contract: ContractAbstraction<ContractProvider | Wallet>
    ) => ContractMethod<ContractProvider | Wallet>,
    params?: Partial<SendParams>
  ) {
    if ("publicKeyHash" in sender) {
      Tezos.setSignerProvider(sender);

      const contractI = await Tezos.contract.at(contract);

      const res = cb(contractI);
      const tx = await res.send(params);
      await tx.confirmation();
      return (tx as TransactionOperation).hash;
    } else {
      Tezos.setWalletProvider(sender);
      const contractI = await Tezos.wallet.at(contract);

      const res = cb(contractI);

      const estim = await Tezos.estimate.transfer(res.toTransferParams(params));

      if (params) {
        if (!params.storageLimit) params.storageLimit = estim.storageLimit;
      } else {
        params = { storageLimit: estim.storageLimit };
      }
      const tx = await res.send(params);
      await tx.confirmation();
      return (tx as TransactionWalletOperation).opHash;
    }
  }

  function withBridge(
    sender: TezosSigner,
    cb: (
      bridge: ContractAbstraction<ContractProvider | Wallet>
    ) => ContractMethod<ContractProvider | Wallet>,
    params?: Partial<SendParams>
  ) {
    return withContract(sender, bridgeAddress, cb, params);
  }

  function getAddress(sender: TezosSigner) {
    if ("publicKeyHash" in sender) {
      return sender.publicKeyHash();
    } else {
      return sender.getPKH();
    }
  }

  async function isApprovedForMinter(
    sender: TezosSigner,
    nft: NftInfo<TezosNftInfo>
  ) {
    const owner = await getAddress(sender);
    const contract = await Tezos.contract.at(nft.native.contract);
    const storage = await contract.storage<{
      operators?: BigMapAbstraction;
      operator?: BigMapAbstraction;
    }>();

    let op = await storage?.operators?.get({
      owner,
      operator: bridgeAddress,
      token_id: nft.native.token_id,
    });

    return op != undefined;
  }

  async function notifyValidator(hash: string): Promise<void> {
    await notifier.notifyTezos(hash);
  }

  async function preTransfer(signer: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    if (await isApprovedForMinter(signer, nft)) {
      return;
    }
    const owner = await getAddress(signer);
    return await withContract(signer, nft.native.contract, (contract) =>
      contract.methods.update_operators([
        {
          add_operator: {
            owner,
            operator: bridgeAddress,
            token_id: nft.native.token_id,
          },
        },
      ])
    );
  }

  return {
    XpNft: xpnftAddress,
    async transferNftToForeign(sender, chain, to, nft, fee, mw) {
      //       await preTransfer(sender, nft);
      const hash = await withBridge(
        sender,
        (bridge) =>
          bridge.methods.freeze_fa2(
            chain,
            nft.collectionIdent,
            mw,
            to,
            parseInt(nft.native.token_id)
          ),
        { amount: fee.toNumber() / 1e6 }
      );

      notifyValidator(hash);
      return hash;
    },
    async balance(address) {
      return new BigNumber((await Tezos.tz.getBalance(address)).toString(10));
    },
    async unfreezeWrappedNft(sender, to, nft, fee, nonce) {
      const hash = await withBridge(
        sender,
        (bridge) => {
          return bridge.methods.withdraw_nft(
            nft.native.contract,
            nonce,
            to,
            parseInt(nft.native.token_id)
          );
        },
        { amount: fee.toNumber() / 1e6 }
      );

      notifyValidator(hash);
      return hash;
    },
    async mintNft(signer, { identifier, attrs, contract, uris }) {
      return await withContract(signer, xpnftAddress, (xpnft) =>
        xpnft.methods.mint({
          token_id: identifier,
          address: contract,
          metadata: {
            uri: uris[0],
            attrs,
          },
          amount: 1,
        })
      );
    },
    async validateAddress(adr) {
      return Promise.resolve(
        utils.validateAddress(adr) === utils.ValidationResult.VALID
      );
    },
    getNonce() {
      return Chain.TEZOS;
    },
    getFeeMargin() {
      return feeMargin;
    },
    async estimateValidateTransferNft() {
      return estimateGas(validators, 1.2e5);
    },
    async estimateValidateUnfreezeNft() {
      return estimateGas(validators, 1.2e4);
    },
    preTransfer,
    isApprovedForMinter,
    approveForMinter: (nft, sender) => preTransfer(sender, nft),
    async isNftWhitelisted(nft) {
      const bridge = await Tezos.contract.at(bridgeAddress);
      const storage = await bridge.storage<{
        nft_whitelist: BigMapAbstraction;
      }>();
      const whitelisted = await storage.nft_whitelist.get(nft.native.contract);

      return whitelisted == 2;
    },
  };
}
