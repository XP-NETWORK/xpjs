"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretHelperFactory = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const secretjs_1 = require("secretjs");
// TODO
const TRANSFER_GASL = new bignumber_js_1.default(0);
// TODO
const UNFREEZE_GASL = new bignumber_js_1.default(0);
async function secretHelperFactory(p) {
  const queryClient = await secretjs_1.SecretNetworkClient.create({
    grpcWebUrl: p.rpcUrl,
    chainId: p.chainId,
  });
  // TODO
  const gasPrice = 1;
  async function isApprovedForMinter(sender, nft) {
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
        appr["spender"].toLowerCase() === p.bridge.contractAddress.toLowerCase()
      ) {
        return true;
      }
    }
    return false;
  }
  async function preTransfer(sender, nft) {
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
        gasLimit: 250000,
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
      return new bignumber_js_1.default(b.balance?.amount || 0);
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
          },
          sender: signer.address,
        },
        {
          waitForCommit: true,
          gasLimit: 500000,
        }
      );
      return tx;
    },
    XpNft: `${p.xpnft.contractAddress},${p.xpnft.codeHash}`,
    validateAddress: async (a) => {
      try {
        secretjs_1.Bech32.decode(a);
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
      const contract = {
        address: contractAddress,
        codeHash: codeHash || "",
      };
      const { token_list } = await queryClient.query.snip721.GetOwnedTokens({
        contract,
        auth,
        owner,
      });
      const response = [];
      await Promise.all(
        token_list?.tokens?.map(async (token) => {
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
              metadata: tokenInfo.all_nft_info.info?.extension,
            },
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
          gasLimit: 500000,
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
        { waitForCommit: true, gasLimit: 500000 }
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
        { waitForCommit: true, gasLimit: 500000 }
      );
      await p.notifier.notifySecret(tx.transactionHash, nft.native.vk);
      return tx;
    },
  };
}
exports.secretHelperFactory = secretHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvc2VjcmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdFQUFxQztBQUNyQyx1Q0FBMkQ7QUF1RjNELE9BQU87QUFDUCxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdkMsT0FBTztBQUNQLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsbUJBQW1CLENBQ3ZDLENBQWU7SUFFZixNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNuRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ25CLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbkIsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxNQUFvQixFQUNwQixHQUEyQjtRQUUzQixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUN2RCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFO29CQUNOLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztvQkFDdkIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtpQkFDM0I7YUFDRjtZQUNELFFBQVEsRUFBRTtnQkFDUixPQUFPLEVBQUUsR0FBRyxDQUFDLGVBQWU7Z0JBQzVCLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVk7YUFDbEM7WUFDRCxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPO1NBQzdCLENBQUMsQ0FBQztRQUNILEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENB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
