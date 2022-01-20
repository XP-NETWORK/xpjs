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
  TransferParams,
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
  const bridge = await Tezos.contract.at(bridgeAddress);
  const xpnft = await Tezos.contract.at(xpnftAddress);
  const event_middleware = axios.create({
    baseURL: middlewareUri,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const estimateGas = (validators: string[], baseprice: number) => {
    return new BigNumber(baseprice * (validators.length + 1));
  };

  async function sendTx(sender: TezosSigner, tx: TransferParams) {
    if ("publicKeyHash" in sender) {
      Tezos.setSignerProvider(sender);
      const res = await Tezos.contract.transfer(tx);
      await res.confirmation();
      return res.hash;
    } else {
      Tezos.setWalletProvider(sender);
      const res = await Tezos.wallet.transfer(tx).send();
      await res.confirmation();
      return res.opHash;
    }
  }

  function getAddress(sender: TezosSigner) {
    if ("publicKeyHash" in sender) {
      return sender.publicKeyHash();
    } else {
      return sender.getPKH();
    }
  }

  async function isApprovedForMinter(sender: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    const contract = await Tezos.contract.at(nft.native.contract);
    const ownerAddr = await getAddress(sender);
    const storage = await contract.storage<{ operators: BigMapAbstraction }>();
    return (
      typeof (await storage.operators.get({
        owner: ownerAddr,
        operator: bridge.address,
        token_id: nft.native.token_id,
      })) == "symbol"
    );
  }

  async function notifyValidator(hash: string): Promise<void> {
    await event_middleware.post("/tx/web3", {
      tx_hash: hash,
    });
  }

  async function preTransfer(signer: TezosSigner, nft: NftInfo<TezosNftInfo>) {
    if (await isApprovedForMinter(signer, nft)) {
      return;
    }
    const contract = await Tezos.contract.at(nft.native.contract);
    const tx = contract.methods
      .update_operators([
        {
          add_operator: {
            owner: await getAddress(signer),
            operator: bridge.address,
            token_id: nft.native.token_id,
          },
        },
      ])
      .toTransferParams();
    return await sendTx(signer, tx);
  }

  return {
    async transferNftToForeign(sender, chain, to, nft, fee) {
      const tx = bridge.methods
        .freeze_fa2(chain, nft.native.contract, to, parseInt(nft.native.token_id))
        .toTransferParams();
      tx.amount = fee.toNumber() / 1e6;
      const hash = await sendTx(sender, tx);

      notifyValidator(hash);
      return hash;
    },
    async balance(address) {
      return Tezos.tz.getBalance(address);
    },
    async unfreezeWrappedNft(sender, to, nft, fee) {
      const tx = bridge.methods
        .withdraw_nft(to, parseInt(nft.native.token_id))
        .toTransferParams();
      
      tx.amount = fee.toNumber() / 1e6;
      const hash = await sendTx(sender, tx);
      notifyValidator(hash);
      return hash;
    },
    async mintNft(signer, { identifier, attrs, contract, uris }) {
      const tx = xpnft.methods
        .mint({
          token_id: identifier,
          address: contract,
          metadata: {
            uri: uris[0],
            attrs,
          },
          amount: 1,
        })
        .toTransferParams();
      return await sendTx(signer, tx);
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
