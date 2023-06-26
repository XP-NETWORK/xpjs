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
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  NftInfo,
  PreTransfer,
  ValidateAddress,
} from "./chain";
import BigNumber from "bignumber.js";
import { CasperLabsHelper } from "casper-js-sdk/dist/@types/casperlabsSigner";
import { AsymmetricKey } from "casper-js-sdk/dist/lib/Keys";
import { EvNotifier } from "../services/notifier";

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
  };

function getTokenIdentifier(nft: NftInfo<CasperNFT>): string {
  if (nft.native.tokenId || nft.native.tokenHash) {
    return nft.native.tokenId || (nft.native.tokenHash as string);
  }
  throw new Error(`No Token Identifier found`);
}

export async function casperHelper({
  rpc,
  network,
  bridge,
  feeMargin,
}: CasperParams): Promise<CasperHelper> {
  const client = new CasperClient(rpc);
  const cep78Client = new CEP78Client(rpc, network);

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
      console.log(tid);
      const result = (await cep78Client.contractClient.queryContractDictionary(
        "approved",
        tid
      )) as CLOption<CLKey>;

      console.log(result.data);
      return (
        Buffer.from(result.data.unwrap().data.data).toString("hex") === bridge
      );
    },
    getProvider() {
      return client;
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
          operator: new CLByteArray(Buffer.from(bridge, "hex")),
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
