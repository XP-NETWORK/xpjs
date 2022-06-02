import BigNumber from "bignumber.js";
import { Bech32, SecretNetworkClient } from "secretjs";
import { EvNotifier } from "../notifier";
import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

export type SecretNftInfo = {
  contract: string;
  contractHash: string;
  token_id: string;
};

type SecretSigner = SecretNetworkClient;

export type SecretHelper = TransferNftForeign<
  SecretSigner,
  SecretNftInfo,
  string
> &
  UnfreezeForeignNft<SecretSigner, SecretNftInfo, string> &
  ValidateAddress &
  EstimateTxFees<SecretNftInfo> &
  ChainNonceGet &
  PreTransfer<SecretSigner, SecretNftInfo, string> &
  BalanceCheck &
  GetFeeMargins & { XpNft: string } & GetProvider<SecretNetworkClient>;

export type SecretContract = {
  contractAddress: string;
  codeHash: string;
};

export type SecretParams = {
  rpcUrl: string;
  chainId: string;
  notifier: EvNotifier;
  bridge: SecretContract;
  xpnft: SecretContract;
  feeMargin: FeeMargins;
};

// TODO
const TRANSFER_GASL = new BigNumber(0);

// TODO
const UNFREEZE_GASL = new BigNumber(0);

export async function secretHelperFactory(
  p: SecretParams
): Promise<SecretHelper> {
  const queryClient = await SecretNetworkClient.create({
    grpcWebUrl: p.rpcUrl,
    chainId: p.chainId,
  });

  // TODO
  const gasPrice = 1;

  async function preTransfer(
    sender: SecretSigner,
    nft: NftInfo<SecretNftInfo>
  ) {
    // TODO: check if approved
    const res = await sender.tx.compute.executeContract(
      {
        sender: sender.address,
        contractAddress: nft.native.contract,
        codeHash: nft.native.contractHash,
        msg: {
          approve: {
            spender: p.bridge.contractAddress,
            token_id: nft.native.token_id,
          },
        },
      },
      {
        waitForCommit: true,
        gasLimit: 100_000,
      }
    );
    return res.transactionHash;
  }

  return {
    getFeeMargin() {
      return p.feeMargin;
    },
    getProvider() {
      return queryClient;
    },
    getNonce: () => 0x18,
    balance: async (address) => {
      const b = await queryClient.query.bank.balance({
        address,
        denom: "uscrt",
      });

      return new BigNumber(b.balance?.amount || 0);
    },
    XpNft: `${p.xpnft.contractAddress},${p.xpnft.codeHash}`,
    validateAddress: async (a) => {
      try {
        Bech32.decode(a);
        return true;
      } catch {
        return false;
      }
    },
    estimateValidateTransferNft: async () => {
      return TRANSFER_GASL.times(gasPrice);
    },
    estimateValidateUnfreezeNft: async () => {
      return UNFREEZE_GASL.times(gasPrice);
    },
    preTransfer,
    preUnfreeze: preTransfer,
    transferNftToForeign: async (wallet, chainNonce, to, nft, fee, mw) => {
      const tx = await wallet.tx.compute.executeContract(
        {
          sender: wallet.address,
          contractAddress: p.bridge.contractAddress,
          codeHash: p.bridge.codeHash,
          msg: {
            freeze_nft: {
              contract: nft.native.contract,
              contract_hash: nft.native.contractHash,
              token_id: nft.native.token_id,
              to,
              chain_nonce: chainNonce,
              minter: mw,
            },
          },
          sentFunds: [
            {
              denom: "uscrt",
              amount: fee.toString(10),
            },
          ],
        },
        { waitForCommit: true }
      );

      await p.notifier.notifySecret(tx.transactionHash);

      return tx.transactionHash;
    },
    unfreezeWrappedNft: async (wallet, to, nft, fee, chainNonce) => {
      const tx = await wallet.tx.compute.executeContract(
        {
          sender: wallet.address,
          contractAddress: p.bridge.contractAddress,
          codeHash: p.bridge.codeHash,
          msg: {
            withdraw_nft: {
              burner: nft.native.contract,
              burner_hash: nft.native.contractHash,
              token_id: nft.native.token_id,
              to,
              chain_nonce: Number(chainNonce),
            },
          },
          sentFunds: [
            {
              denom: "uscrt",
              amount: fee.toString(10),
            },
          ],
        },
        { waitForCommit: true, gasLimit: 100_000 }
      );

      await p.notifier.notifySecret(tx.transactionHash);

      return tx.transactionHash;
    },
  };
}
