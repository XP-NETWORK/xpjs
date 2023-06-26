import {
  CLByteArray,
  CLKey,
  CLOption,
  CLPublicKey,
  CasperClient,
  DeployUtil,
} from "casper-js-sdk";
import { CEP78Client } from "casper-cep78-js-client";
import {
  BalanceCheck,
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetExtraFees,
  GetFeeMargins,
  GetProvider,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";
import BigNumber from "bignumber.js";
import { CasperLabsHelper } from "casper-js-sdk/dist/@types/casperlabsSigner";
import { AsymmetricKey } from "casper-js-sdk/dist/lib/Keys";
import { EvNotifier } from "../services/notifier";
import { XpBridgeClient } from "xpbridge-client";

export interface CasperParams {
  rpc: string;
  network: string;
  bridge: string;
  notifier: EvNotifier;
  xpnft: string;
  feeMargin: FeeMargins;
}

export interface CasperNFT {
  tokenId?: string;
  tokenHash?: string;
  contract: string;
}

export type CasperHelper = ChainNonceGet &
  BalanceCheck &
  Pick<
    PreTransfer<CasperLabsHelper, CasperNFT, string, undefined>,
    "preTransfer"
  > &
  ValidateAddress &
  GetFeeMargins &
  GetProvider<CasperClient> & {
    isApprovedForMinter(
      sender: CasperLabsHelper,
      nft: NftInfo<CasperNFT>
    ): Promise<boolean>;
  } & TransferNftForeign<CasperLabsHelper, CasperNFT, string> &
  UnfreezeForeignNft<CasperLabsHelper, CasperNFT, string> &
  EstimateTxFees<CasperNFT> & { XpNft: string } & GetExtraFees;

function getTokenIdentifier(nft: NftInfo<CasperNFT>): string {
  if (nft.native.tokenId || nft.native.tokenHash) {
    return (nft.native.tokenId || nft.native.tokenHash) as string;
  }
  throw new Error(`No Token Identifier found`);
}

export async function casperHelper({
  rpc,
  network,
  bridge,
  feeMargin,
  xpnft,
}: CasperParams): Promise<CasperHelper> {
  const client = new CasperClient(rpc);
  const cep78Client = new CEP78Client(rpc, network);
  const bridgeClient = new XpBridgeClient(rpc, network);
  bridgeClient.setContractHash(bridge);

  return {
    async validateAddress(adr) {
      try {
        CLPublicKey.fromHex(adr);
        return true;
      } catch (e) {
        return false;
      }
    },

    async isApprovedForMinter(_sender, nft) {
      cep78Client.setContractHash(nft.native.contract);
      const tid = getTokenIdentifier(nft);
      const result = (await cep78Client.contractClient.queryContractDictionary(
        "approved",
        tid
      )) as CLOption<CLKey>;

      if (result.isNone()) {
        return false;
      }
      return (
        Buffer.from(result.data.unwrap().data.data)
          .toString("hex")
          .toLowerCase() === bridge.split("-")[1].toLowerCase()
      );
    },
    getProvider() {
      return client;
    },
    async estimateValidateTransferNft() {
      return new BigNumber("30000000000");
    },
    XpNft: xpnft,
    async estimateValidateUnfreezeNft() {
      return new BigNumber("30000000000");
    },
    getExtraFees() {
      return new BigNumber("0");
    },
    async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
      const deploy = bridgeClient.freezeNft(
        {
          amt: txFees.toString(),
          chain_nonce,
          to,
          contract: id.native.contract,
          mint_with: mintWith,
          sig_data: new Uint8Array(0),
          token_id: id.native.tokenId || id.native.tokenHash || "",
        },
        "15000000000",
        CLPublicKey.fromHex(await sender.getActivePublicKey())
      );

      const signed = await sender.sign(
        DeployUtil.deployToJson(deploy),
        await sender.getActivePublicKey()
      );
      const dep = client.deployFromJson(signed).unwrap();
      return await client.putDeploy(dep);
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const deploy = bridgeClient.withdrawNft(
        {
          amt: txFees.toString(),
          chain_nonce: parseInt(nonce),
          to,
          contract: id.native.contract,
          sig_data: new Uint8Array(0),
          token_id: id.native.tokenId || id.native.tokenHash || "",
        },
        "15000000000",
        CLPublicKey.fromHex(await sender.getActivePublicKey())
      );
      const signed = await sender.sign(
        DeployUtil.deployToJson(deploy),
        await sender.getActivePublicKey()
      );
      const dep = client.deployFromJson(signed).unwrap();
      return await client.putDeploy(dep);
    },
    getNonce() {
      return 38;
    },
    async balance(address) {
      return new BigNumber(
        (await client.balanceOfByAccountHash(address)).toString()
      );
    },
    getFeeMargin() {
      return feeMargin;
    },

    async preTransfer(sender, nft) {
      cep78Client.setContractHash(nft.native.contract);
      const deploy = cep78Client.approve(
        {
          operator: new CLByteArray(Buffer.from(bridge.split("-")[1], "hex")),
          tokenHash: nft.native.tokenHash,
          tokenId: nft.native.tokenId,
        },
        "2000000000",
        CLPublicKey.fromHex(await sender.getActivePublicKey())
      );
      const signed = await sender.sign(
        DeployUtil.deployToJson(deploy),
        await sender.getActivePublicKey()
      );
      const dep = client.deployFromJson(signed).unwrap();
      return await client.putDeploy(dep);
    },
  };
}

export function CasperHelperFromKeys(keys: AsymmetricKey): CasperLabsHelper {
  return {
    async sign(deploy) {
      return DeployUtil.deployToJson(
        DeployUtil.deployFromJson(deploy).unwrap().sign([keys])
      );
    },
    disconnectFromSite() {
      throw new Error("Not implemented");
    },
    async getActivePublicKey() {
      return keys.publicKey.toHex();
    },
    getSelectedPublicKeyBase64() {
      throw new Error("Not implemented");
    },
    getVersion() {
      throw new Error("Not implemented");
    },
    isConnected() {
      throw new Error("Not implemented");
    },
    requestConnection() {
      throw new Error("Not implemented");
    },
    signMessage() {
      throw new Error("Not implemented");
    },
  };
}
