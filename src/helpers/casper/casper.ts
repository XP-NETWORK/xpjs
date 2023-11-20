import {
  CLByteArray,
  CLKey,
  CLOption,
  CLPublicKey,
  CasperClient,
  DeployUtil,
} from "casper-js-sdk";
import { CEP78Client } from "casper-cep78-js-client/dist/src";
import {
  BalanceCheck,
  ChainNonceGet,
  EstimateDeployFees,
  EstimateTxFees,
  FeeMargins,
  GetExtraFees,
  GetFeeMargins,
  GetProvider,
  MintNft,
  NftInfo,
  PreTransfer,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "../chain";
import BigNumber from "bignumber.js";
import { CasperLabsHelper } from "casper-js-sdk/dist/@types/casperlabsSigner";
import { AsymmetricKey } from "casper-js-sdk/dist/lib/Keys";
import { EvNotifier } from "../../services/notifier";
import { XpBridgeClient } from "xpbridge-client";
import { Chain } from "../../consts";
import { SignatureService } from "../../services/estimator";
import { isBrowser } from "@pedrouid/environment";
import { getDeploy } from "./wait";
import { isWrappedNft } from "../../factory";

export interface CasperParams {
  rpc: string;
  network: string;
  bridge: string;
  notifier: EvNotifier;
  xpnft: string;
  umt: string;
  feeMargin: FeeMargins;
  sig: SignatureService;
  nwl: boolean;
}

export interface CasperNFT {
  tokenId?: string;
  tokenHash?: string;
  contract_hash: string;
}

export interface CasperMintNft {
  contract?: string;
  collectionName: string;
  uri: string;
}

interface CasperBrowserAdapt {
  setProxy(proxy: string): void;
  toAccountHash(account: string): string;
}

export type CasperHelper = ChainNonceGet &
  BalanceCheck &
  Pick<
    PreTransfer<CasperLabsHelper, CasperNFT, string, string | undefined>,
    "preTransfer"
  > &
  ValidateAddress &
  GetFeeMargins &
  GetProvider<CasperClient> & {
    isApprovedForMinter(
      sender: CasperLabsHelper,
      nft: NftInfo<CasperNFT>,
      contract: string
    ): Promise<boolean>;
  } & TransferNftForeign<CasperLabsHelper, CasperNFT, string> &
  UnfreezeForeignNft<CasperLabsHelper, CasperNFT, string> &
  EstimateTxFees<CasperNFT> & { XpNft: string } & GetExtraFees &
  MintNft<CasperLabsHelper, CasperMintNft, string> &
  CasperBrowserAdapt &
  EstimateDeployFees & {
    convertToAccountHash(adr: string): string;
  };

function getTokenIdentifier(nft: NftInfo<CasperNFT>): string {
  if (nft.native.tokenId || nft.native.tokenHash) {
    return (nft.native.tokenId || nft.native.tokenHash) as string;
  }
  throw new Error(`No Token Identifier found`);
}

function raise(msg: string): never {
  throw new Error(msg);
}

export async function casperHelper({
  rpc,
  network,
  bridge,
  feeMargin,
  xpnft,
  umt,
  sig,
  nwl,
  notifier,
}: CasperParams): Promise<CasperHelper> {
  let client = new CasperClient(rpc);
  let cep78Client = new CEP78Client(rpc, network);
  let bridgeClient = new XpBridgeClient(rpc, network);
  bridgeClient.setContractHash(bridge);

  const getBridgeOrUNS = async (collection: string) => {
    if (!nwl) {
      return bridge;
    }
    const cc = await notifier.getCollectionContract(collection, Chain.CASPER);
    if (cc === "") {
      return bridge;
    }
    return cc;
  };

  async function isApprovedForMinter(
    _sender: CasperLabsHelper,
    nft: NftInfo<CasperNFT>,
    contract: string
  ) {
    cep78Client.setContractHash(nft.native.contract_hash);
    const tid = getTokenIdentifier(nft);
    const result = (await cep78Client.contractClient
      .queryContractDictionary("approved", tid)
      .catch(() => undefined)) as CLOption<CLKey>;

    if (result === undefined) {
      return false;
    }
    if (result.isNone()) {
      return false;
    }

    return (
      Buffer.from(result.data.unwrap().data.data)
        .toString("hex")
        .toLowerCase() === contract.split("-")[1].toLowerCase()
    );
  }

  async function signWithCasperWallet(sender: any, deploy: DeployUtil.Deploy) {
    const address = await sender.getActivePublicKey();
    const signedDeployJson = await sender.sign(
      JSON.stringify(DeployUtil.deployToJson(deploy)),
      address
    );

    const signedDeploy = DeployUtil.setSignature(
      deploy,
      signedDeployJson.signature,
      CLPublicKey.fromHex(address)
    );

    const res = await client.putDeploy(signedDeploy).catch((e) => {
      console.log(e, "e in signWithCasperWallet");
      return "";
    });

    res && (await getDeploy(client, res));
    return res;
  }

  //@ts-ignore
  const transferCSPR = async (signer: CasperLabsHelper) => {
    let deployParams = new DeployUtil.DeployParams(
      CLPublicKey.fromHex(await signer.getActivePublicKey()),
      network,
      1,
      1800000
    );
    const toPublicKey = CLPublicKey.fromHex(
      "020298a6a0009a97f5f1717056a77a7caf6d733c71508a4bb4fabc64469b9bee4a5b"
    );
    const session = DeployUtil.ExecutableDeployItem.newTransfer(
      "3000000000",
      toPublicKey,
      undefined,
      Math.floor(Math.random() * 10000000)
    );
    const payment = DeployUtil.standardPayment(100000000);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    if (isBrowser()) {
      const hash = await signWithCasperWallet(signer, deploy);
      return hash;
    }
    const signed = await signer.sign(
      DeployUtil.deployToJson(deploy),
      await signer.getActivePublicKey()
    );
    const transfer = await client.deployFromJson(signed).unwrap().send(rpc);
    await getDeploy(client, transfer);
    return transfer;
  };

  async function preTransfer(
    sender: CasperLabsHelper,
    nft: NftInfo<CasperNFT>,
    _: BigNumber,
    address?: string
  ) {
    const contract = await getBridgeOrUNS(nft.native.contract_hash);
    const wnft = await isWrappedNft(nft, 39);
    if (!wnft.bool && !address && contract === bridge) return;
    let approveFor = address ?? contract;

    if (await isApprovedForMinter(sender, nft, approveFor)) {
      return undefined;
    }
    cep78Client.setContractHash(nft.native.contract_hash);
    const deploy = cep78Client.approve(
      {
        operator: new CLByteArray(Buffer.from(approveFor.split("-")[1], "hex")),
        tokenHash: nft.native.tokenHash,
        tokenId: nft.native.tokenId,
      },
      "2000000000",
      CLPublicKey.fromHex(await sender.getActivePublicKey())
    );

    if (isBrowser()) {
      return signWithCasperWallet(sender, deploy);
    }

    const signed = await sender.sign(
      DeployUtil.deployToJson(deploy),
      await sender.getActivePublicKey()
    );
    const dep = client.deployFromJson(signed).unwrap();
    return await client.putDeploy(dep);
  }

  return {
    preTransfer,
    async validateAddress(adr) {
      try {
        CLPublicKey.fromHex(adr);
        return true;
      } catch (e) {
        return false;
      }
    },
    convertToAccountHash(adr) {
      try {
        return Buffer.from(CLPublicKey.fromHex(adr).toAccountHash()).toString(
          "hex"
        );
      } catch {
        return "";
      }
    },
    async mintNft(owner, options) {
      cep78Client.setContractHash(options.contract ?? umt);
      const address = await owner.getActivePublicKey();

      const deploy = cep78Client.mint(
        {
          meta: {
            token_uri: options.uri,
          },
          owner: CLPublicKey.fromHex(address),
          collectionName: options.contract
            ? options.collectionName
            : "UserNftMinter",
        },
        {
          useSessionCode: false,
        },
        "15000000000",
        CLPublicKey.fromHex(address)
      );

      if (isBrowser()) {
        return signWithCasperWallet(owner, deploy);
      }

      const signed = await owner.sign(
        DeployUtil.deployToJson(deploy),
        await owner.getActivePublicKey()
      );
      return DeployUtil.deployFromJson(signed).unwrap().send(rpc);
    },
    isApprovedForMinter,
    getProvider() {
      return client;
    },
    setProxy(proxy: string) {
      rpc = proxy + rpc;
      client = new CasperClient(rpc);
      cep78Client = new CEP78Client(rpc, network);
      bridgeClient = new XpBridgeClient(rpc, network);
      bridgeClient.setContractHash(bridge);
    },
    async estimateUserStoreDeploy() {
      return new BigNumber("30000000000");
    },
    async estimateContractDeploy() {
      return new BigNumber("30000000000");
    },
    toAccountHash(account: string) {
      return CLPublicKey.fromHex(account).toAccountRawHashStr();
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
    async transferNftToForeign(sender, chain_nonce, to, id, _txFees, mintWith) {
      const signature = await sig.casper(
        Chain.CASPER,
        chain_nonce,
        to,
        id.collectionIdent,
        id.native.tokenId || id.native.tokenHash || raise("No Token Identifier")
      );

      let contract = await getBridgeOrUNS(id.native.contract_hash);
      if (contract === bridge) {
        try {
          // await transferCSPR(sender);
          const newc = await notifier.createCollectionContract(
            id.native.contract_hash,
            Chain.CASPER,
            "ERC721"
          );
          contract = newc;
        } catch (e) {
          console.log(
            `Failed to deploy store for casper collection: ${id.native.contract_hash}. Reason: ${e}`
          );
        }
      }
      let newPt = await preTransfer(sender, id, new BigNumber(0), contract);
      newPt && (await getDeploy(client, newPt));
      bridgeClient.setContractHash(contract);
      const deploy = bridgeClient.freezeNft(
        {
          amt: signature.fees!,
          chain_nonce,
          to,
          contract: id.native.contract_hash,
          mint_with: mintWith,
          sig_data: Buffer.from(signature.sig!, "hex"),
          token_id: id.native.tokenId || id.native.tokenHash || "",
        },
        "35000000000",
        CLPublicKey.fromHex(await sender.getActivePublicKey())
      );

      if (isBrowser()) {
        const hash = await signWithCasperWallet(sender, deploy);
        await notifier.notifyCasper(hash);
        return hash;
      }

      const signed = await sender.sign(
        DeployUtil.deployToJson(deploy),
        await sender.getActivePublicKey()
      );
      const dep = client.deployFromJson(signed).unwrap();
      const hash = await client.putDeploy(dep);

      await notifier.notifyCasper(hash);
      return hash;
    },
    async unfreezeWrappedNft(sender, to, id, _txFees, nonce) {
      const signature = await sig.casper(
        Chain.CASPER,
        nonce,
        to,
        id.collectionIdent,
        id.native.tokenId || id.native.tokenHash || raise("No Token Identifier")
      );

      const deploy = bridgeClient.withdrawNft(
        {
          amt: signature.fees!,
          chain_nonce: nonce,
          to,
          contract: id.native.contract_hash,
          sig_data: Buffer.from(signature.sig!, "hex"),
          token_id: id.native.tokenId || id.native.tokenHash || "",
        },
        "35000000000",
        CLPublicKey.fromHex(await sender.getActivePublicKey())
      );

      if (isBrowser()) {
        const hash = await signWithCasperWallet(sender, deploy);
        await notifier.notifyCasper(hash);
        return hash;
      }

      const signed = await sender.sign(
        DeployUtil.deployToJson(deploy),
        await sender.getActivePublicKey()
      );
      const dep = client.deployFromJson(signed).unwrap();
      const hash = await client.putDeploy(dep);

      await notifier.notifyCasper(hash);

      return hash;
    },
    getNonce() {
      return Chain.CASPER;
    },
    async balance(address) {
      return new BigNumber(
        (
          await client.balanceOfByPublicKey(CLPublicKey.fromHex(address))
        ).toString()
      );
    },
    getFeeMargin() {
      return feeMargin;
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
