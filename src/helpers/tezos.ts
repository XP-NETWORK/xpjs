import {
  BalanceCheck,
  EstimateTxFees,
  MintNft,
  NftMintArgs,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "..";
import { Signer, TezosToolkit, TransactionOperation } from "@taquito/taquito";
import { validatePublicKey } from "@taquito/utils";
import BigNumber from "bignumber.js";

type TezosSigner = Signer;

type TezosNftInfo = {
  contract: string;
  id: string;
};

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
  EstimateTxFees<BigNumber>;

export type TezosParams = {
  rpc: string;
  xpnftAddress: string;
  bridgeAddress: string;
};

export async function tezosHelperFactory({
  rpc,
  xpnftAddress,
  bridgeAddress,
}: TezosParams): Promise<TezosHelper> {
  const Tezos = new TezosToolkit(rpc);

  const bridge = await Tezos.contract.at(bridgeAddress);
  const xpnft = await Tezos.contract.at(xpnftAddress);

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
    async estimateValidateTransferNft(_to, _uri) {
      return Promise.resolve(NFT_TRANSFER_COST);
    },
    async estimateValidateUnfreezeNft(_to, _uri) {
      return Promise.resolve(NFT_UNFREEZE_COST);
    },
  };
}
