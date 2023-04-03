import {
  BalanceCheck,
  Chain,
  ChainNonceGet,
  EstimateTxFees,
  MintNft,
  NftInfo,
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
  MichelsonMap,
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
import { EvNotifier } from "../services/notifier";
import {
  FeeMargins,
  GetFeeMargins,
  WhitelistCheck,
  GetTokenURI,
  TransferNftForeignBatch,
  UnfreezeForeignNftBatch,
  EstimateTxFeesBatch,
} from "./chain";

type TezosSigner = WalletProvider | Signer;

export type TezosNftInfo = {
  contract: string;
  token_id: string;
  amt: number;
};

type TezosMintArgs = {
  identifier: string;
  contract: string;
  uri: string;
  to: string;
  amt: number;
};

export type TezosHelper = TransferNftForeign<
  TezosSigner,
  TezosNftInfo,
  string
> &
  MintNft<TezosSigner, TezosMintArgs, string> &
  BalanceCheck &
  UnfreezeForeignNft<TezosSigner, TezosNftInfo, string> &
  TransferNftForeignBatch<TezosSigner, TezosNftInfo, string> &
  UnfreezeForeignNftBatch<TezosSigner, TezosNftInfo, string> &
  EstimateTxFeesBatch<TezosNftInfo> &
  ValidateAddress &
  EstimateTxFees<TezosNftInfo> &
  ChainNonceGet &
  Pick<PreTransfer<Signer, TezosNftInfo, string, undefined>, "preTransfer"> & {
    isApprovedForMinter(
      nft: NftInfo<TezosNftInfo>,
      signer: TezosSigner
    ): Promise<boolean>;
  } & {
    approveForMinter(
      address: NftInfo<TezosNftInfo>,
      sender: TezosSigner
    ): Promise<string | undefined>;
  } & {
    XpNft: string;
    XpNft1155: string;
  } & GetFeeMargins &
  WhitelistCheck<TezosNftInfo> &
  GetTokenURI;

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

      const estim = await Tezos.estimate
        .transfer(res.toTransferParams(params))
        .catch(() => ({ storageLimit: 0 }));

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
    nft: NftInfo<TezosNftInfo>,
    sender: TezosSigner
  ) {
    const owner = await getAddress(sender);
    const contract = await Tezos.contract.at(nft.native.contract);
    const storage = await contract.storage<{
      operators?: BigMapAbstraction;
      operator?: BigMapAbstraction;
    }>();

    const storageOperator = storage.operator || storage.operators;
    const args = storage.operator
      ? [bridgeAddress, nft.native.token_id, owner]
      : {
          owner,
          operator: bridgeAddress,
          token_id: nft.native.token_id,
        };

    const op = await storageOperator?.get(args);

    return op != undefined;
  }

  async function notifyValidator(hash: string): Promise<void> {
    await notifier.notifyTezos(hash);
  }

  async function preTransfer(signer: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    if (await isApprovedForMinter(nft, signer)) {
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

  let transferNft = async (
    sender: TezosSigner,
    chain: number,
    to: string,
    nft: NftInfo<TezosNftInfo>,
    fee: BigNumber,
    mw: string,
    amt: number
  ) => {
    //       await preTransfer(sender, nft);
    const hash = await withBridge(
      sender,
      (bridge) =>
        bridge.methodsObject.freeze_fa2({
          fa2_address: nft.collectionIdent,
          token_id: parseInt(nft.native.token_id),
          chain_nonce: chain,
          to,
          mint_with: mw,
          amt,
        }) as any,
      { amount: fee.toNumber() / 1e6 }
    );

    notifyValidator(hash);
    return hash;
  };

  let unfreezeWrappedNft = async (
    sender: TezosSigner,
    to: string,
    nft: NftInfo<TezosNftInfo>,
    fee: BigNumber,
    nonce: number,
    amt: number
  ) => {
    const hash = await withBridge(
      sender,
      (bridge) => {
        return bridge.methodsObject.withdraw_nft({
          amt,
          burner: nft.native.contract,
          chain_nonce: nonce,
          to,
          token_id: parseInt(nft.native.token_id),
        }) as any;
      },
      { amount: fee.toNumber() / 1e6 }
    );

    notifyValidator(hash);
    return hash;
  };

  return {
    XpNft: xpnftAddress,
    XpNft1155: xpnftAddress,
    transferNftToForeign: (sender, chain, to, nft, fee, mw) =>
      transferNft(sender, chain, to, nft, fee, mw, 1),

    transferNftBatchToForeign: (
      sender,
      chain_nonce,
      to,
      id,
      mintWith,
      txFees
    ) =>
      transferNft(sender, chain_nonce, to, id[0], txFees, mintWith, id.length),
    async balance(address) {
      return new BigNumber((await Tezos.tz.getBalance(address)).toString(10));
    },
    unfreezeWrappedNftBatch: (sender, chainNonce, to, nfts, txFees) =>
      unfreezeWrappedNft(sender, to, nfts[0], txFees, chainNonce, nfts.length),
    unfreezeWrappedNft: (sender, to, nft, txFees, chainNonce) =>
      unfreezeWrappedNft(sender, to, nft, txFees, parseInt(chainNonce), 1),
    async mintNft(signer, { identifier, contract, uri, to, amt }) {
      const metadata = new MichelsonMap();
      metadata.set("", utils.char2Bytes(uri));
      return await withContract(signer, contract, (umt) =>
        umt.methods.mint(to, amt, metadata, identifier)
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
    async estimateValidateTransferNftBatch(_, ids) {
      return estimateGas(validators, 1.2e5 * ids.length);
    },
    async estimateValidateUnfreezeNftBatch(_, ids) {
      return estimateGas(validators, 1.2e4 * ids.length);
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
    async getTokenURI(contract, tokenId) {
      if (utils.validateAddress(contract) && tokenId) {
        const _contract = await Tezos.contract.at(contract);

        const storage = (await _contract.storage()) as any;
        const tokenStorage = await storage.token_metadata.get(tokenId);
        if (tokenStorage) {
          return utils.bytes2Char(tokenStorage.token_info?.get(""));
        }
      }
      return "";
    },
  };
}
