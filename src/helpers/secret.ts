import BigNumber from "bignumber.js";
import { Bech32, SecretNetworkClient, Tx } from "secretjs";
import { Snip721MintOptions } from "secretjs/dist/extensions/snip721/types";
import { Snip721GetTokensResponse } from "secretjs/dist/extensions/snip721/msg/GetTokens";
import { EvNotifier } from "../notifier";
import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  MintNft,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

export type SecretNftInfo = {
  contract: string;
  contractHash: string;
  chainId: string;
  tokenId: string;
  vk: string;
};
export type SecretMintArgs = {
  url: string;
  contract?: SecretContract;
};

type SecretSigner = SecretNetworkClient;

type GetOwnedTokensResponse = Snip721GetTokensResponse & {
  generic_err?: { msg: string };
};

export type SecretHelper = TransferNftForeign<SecretSigner, SecretNftInfo, Tx> &
  UnfreezeForeignNft<SecretSigner, SecretNftInfo, Tx> &
  ValidateAddress &
  EstimateTxFees<SecretNftInfo> &
  ChainNonceGet &
  PreTransfer<SecretSigner, SecretNftInfo, string> &
  BalanceCheck &
  GetFeeMargins & { XpNft: string } & GetProvider<SecretNetworkClient> &
  MintNft<SecretSigner, SecretMintArgs, Tx> & {
    nftList(
      owner: string,

      viewingKey: string,
      contract: string,
      codeHash?: string
    ): Promise<NftInfo<SecretNftInfo>[]>;
    setViewingKey(
      client: SecretNetworkClient,
      contract: string,
      vk: string
    ): Promise<Tx>;
    isApprovedForMinter(
      sender: SecretSigner,
      nft: NftInfo<SecretNftInfo>
    ): Promise<boolean>;
  };

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
  umt: SecretContract;
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

  async function isApprovedForMinter(
    sender: SecretSigner,
    nft: NftInfo<SecretNftInfo>
  ) {
    const approval = await sender.query.snip721.GetTokenInfo({
      auth: {
        viewer: {
          address: sender.address,
          viewing_key: nft.native.vk,
        },
      },
      contract: {
        address: nft.collectionIdent,
        codeHash: nft.native.contractHash,
      },
      token_id: nft.native.tokenId,
    });
    for (let appr of approval.all_nft_info.access.approvals) {
      if (
        (appr as any)["spender"].toLowerCase() ===
        p.bridge.contractAddress.toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  }

  async function preTransfer(
    sender: SecretSigner,
    nft: NftInfo<SecretNftInfo>
  ) {
    // TODO: check if approved
    if (await isApprovedForMinter(sender, nft)) {
      return undefined;
    }
    const res = await sender.tx.compute.executeContract(
      {
        sender: sender.address,
        contractAddress: nft.native.contract,
        codeHash: nft.native.contractHash,
        msg: {
          approve: {
            spender: p.bridge.contractAddress,
            token_id: nft.native.tokenId,
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
    isApprovedForMinter,
    async mintNft(signer, args) {
      const minter = args.contract ? args.contract : p.umt;
      const tx = await signer.tx.compute.executeContract(
        {
          contractAddress: minter.contractAddress,
          codeHash: minter.codeHash,
          msg: {
            mint_nft: {
              public_metadata: {
                token_uri: args.url,
              },
              owner: signer.address,
              transferable: true,
            },
          } as Snip721MintOptions,
          sender: signer.address,
        },
        {
          waitForCommit: true,
          gasLimit: 50_000,
        }
      );
      return tx;
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
    async nftList(owner, vk, contractAddress, codeHash) {
      const auth = {
        viewer: {
          viewing_key: vk,
          address: owner,
        },
      };
      if (!codeHash) {
        codeHash = await queryClient.query.compute.contractCodeHash(
          contractAddress
        );
      }
      const contract = {
        address: contractAddress,
        codeHash: codeHash || "",
      };

      const { token_list, generic_err } =
        (await queryClient.query.snip721.GetOwnedTokens({
          contract,
          auth,
          owner,
        })) as GetOwnedTokensResponse;

      if (generic_err) throw new Error(generic_err.msg);

      const response: NftInfo<SecretNftInfo>[] = [];

      await Promise.all(
        token_list.tokens.map(async (token) => {
          const tokenInfo = await queryClient.query.snip721.GetTokenInfo({
            contract,
            auth,
            token_id: token,
          });

          response.push({
            collectionIdent: contractAddress,
            uri: tokenInfo.all_nft_info.info?.token_uri || "",
            native: {
              chainId: p.chainId,
              contract: contractAddress,
              contractHash: codeHash || "",
              tokenId: token,
              vk,
            },
            metaData: tokenInfo.all_nft_info.info?.extension,
          });
        })
      );
      return response;
    },
    estimateValidateTransferNft: async () => {
      return TRANSFER_GASL.times(gasPrice);
    },
    estimateValidateUnfreezeNft: async () => {
      return UNFREEZE_GASL.times(gasPrice);
    },
    async setViewingKey(client, contract, vk) {
      const tx = await client.tx.snip721.setViewingKey(
        {
          contractAddress: contract,
          msg: {
            set_viewing_key: {
              key: vk,
            },
          },
          sender: client.address,
        },
        {
          waitForCommit: true,
          gasLimit: 30000,
        }
      );
      return tx;
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
              viewer: {
                viewing_key: nft.native.vk,
                address: wallet.address,
              },
              token_id: nft.native.tokenId,
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
        { waitForCommit: true, gasLimit: 150_000 }
      );

      await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);

      return tx;
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
              token_id: nft.native.tokenId,
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

      await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);

      return tx;
    },
  };
}
