import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  MintNft,
  NftMintArgs,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  WrappedNftCheck,
} from "..";
import {
  Signer,
  TezosToolkit,
  TransactionOperation,
  TransferParams,
} from "@taquito/taquito";
import { validatePublicKey } from "@taquito/utils";
import BigNumber from "bignumber.js";
import axios from "axios";

type TezosSigner = Signer;

type TezosNftInfo = {
  contract: string;
  id: string;
};

const randomAction = () =>
  new BigNumber(
    Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
  );

const NFT_TRANSFER_COST = new BigNumber(45000000);
const NFT_UNFREEZE_COST = new BigNumber(45000000);

export type TezosHelper = TransferNftForeign<
  TezosSigner,
  string,
  BigNumber,
  TezosNftInfo,
  TransactionOperation
> &
  MintNft<TezosSigner, NftMintArgs, TransactionOperation> &
  BalanceCheck<string, BigNumber> &
  UnfreezeForeignNft<
    TezosSigner,
    string,
    BigNumber,
    TezosNftInfo,
    TransactionOperation
  > &
  ValidateAddress &
  EstimateTxFees<BigNumber, TezosNftInfo> &
  ChainNonceGet &
  WrappedNftCheck<TezosNftInfo>;

export type TezosParams = {
  Tezos: TezosToolkit;
  xpnftAddress: string;
  bridgeAddress: string;
  validators: string[];
};

export async function tezosHelperFactory({
  Tezos,
  xpnftAddress,
  bridgeAddress,
  validators,
}: TezosParams): Promise<TezosHelper> {
  const bridge = await Tezos.contract.at(bridgeAddress);
  const xpnft = await Tezos.contract.at(xpnftAddress);

  const estimateGas = async (validators: string[], op: TransferParams) => {
    let fee = 0;

    for (const [i, addr] of validators.entries()) {
      op.source = addr;
      let tf = (await Tezos.estimate.transfer(op)).totalCost;
      if (i == validators.length - 1 && validators.length != 1) tf = tf * 2;
      fee = fee + tf;
    }
    return new BigNumber(fee.toString());
  };

  return {
    async transferNftToForeign(sender, chain, to, nft, fee) {
      Tezos.setSignerProvider(sender);
      const response = await bridge.methods
        .freeze_fa2(nft.native.contract, nft.native.id, chain, to)
        .send({
          amount: fee.toNumber(),
        });
      return response;
    },
    async balance(address) {
      return Tezos.tz.getBalance(address);
    },
    async unfreezeWrappedNft(sender, to, nft, fee) {
      Tezos.setSignerProvider(sender);
      const response = await bridge.methods
        .withdraw_nft(to, nft.native.id)
        .send({
          amount: fee.toNumber(),
        });
      return response;
    },
    async mintNft(signer, { identifier, attrs, contract, uris }) {
      Tezos.setSignerProvider(signer);
      const response = xpnft.methods
        .mint({
          token_id: identifier,
          address: contract,
          metadata: {
            uri: uris[0],
            attrs,
          },
          amount: 1,
        })
        .send();
      return response;
    },
    async validateAddress(adr) {
      return Promise.resolve(validatePublicKey(adr) === 3);
    },
    isWrappedNft(nft) {
      return nft.native.contract.toLowerCase() === xpnftAddress.toLowerCase();
    },
    getNonce() {
      return 0x11;
    },
    async estimateValidateTransferNft(to, meta) {
      const utx = bridge.methods
        .validate_transfer_nft(randomAction(), to, {}, meta.native.contract)
        .toTransferParams();
      return estimateGas(validators, utx);
    },
    async estimateValidateUnfreezeNft(to, meta) {
      const utx = bridge.methods
        .validate_unfreeze_nft(
          randomAction(),
          to,
          meta.native.id,
          meta.native.contract
        )
        .toTransferParams();
      return estimateGas(validators, utx);
    },
  };
}
