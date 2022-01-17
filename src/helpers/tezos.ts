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
  Signer,
  TezosToolkit,
  TransactionOperation,
  TransferParams,
} from "@taquito/taquito";
import { validatePublicKey } from "@taquito/utils";
import BigNumber from "bignumber.js";

type TezosSigner = Signer;

type TezosNftInfo = {
  contract: string;
  id: string;
};

const randomAction = () =>
  new BigNumber(
    Math.floor(Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000))
  );

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
  WrappedNftCheck<TezosNftInfo> &
  Pick<PreTransfer<Signer, TezosNftInfo, string>, "preTransfer"> & {
    isApproved(signer: Signer, nft: NftInfo<TezosNftInfo>): Promise<boolean>
  };

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
    const tf = (await Tezos.estimate.transfer(op)).totalCost;

    return new BigNumber(tf*(validators.length+1));
  };

  async function isApproved(sender: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    const contract = await Tezos.contract.at(nft.native.contract);
    const ownerAddr = await sender.publicKeyHash();
    const storage = await contract.storage<{ operators: BigMapAbstraction }>();
    return typeof (await storage.operators.get({owner: ownerAddr, operator: bridge.address, token_id: nft.native.id})) == "symbol";
  }

  return {
    async transferNftToForeign(sender, chain, to, nft, fee) {
      Tezos.setSignerProvider(sender);
      const response = await bridge.methods
        .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.id))
        .send({
          amount: fee.toNumber(),
          gasLimit: 800_000,
          storageLimit: 60_000
        });
      return response;
    },
    async balance(address) {
      return Tezos.tz.getBalance(address);
    },
    async unfreezeWrappedNft(sender, to, nft, fee) {
      Tezos.setSignerProvider(sender);
      const response = await bridge.methods
        .withdraw_nft(to, parseInt(nft.native.id))
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
    isApproved,
    async preTransfer(signer, nft) {
      Tezos.setSignerProvider(signer);
      if (await isApproved(signer, nft)) {
        return;
      }
      const contract = await Tezos.contract.at(nft.native.contract);
      const response = await contract.methods
        .update_operators([{
          add_operator: {
            owner: await signer.publicKeyHash(),
            operator: bridge.address,
            token_id: nft.native.id
          }
        }]).send();
      return response.hash;
    }
  };
}
