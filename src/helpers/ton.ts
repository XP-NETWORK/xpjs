import { BN } from "@project-serum/anchor";
import BigNumber from "bignumber.js";
import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import { Chain } from "../consts";
import {
  ChainNonceGet,
  EstimateTxFees,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";
import { BridgeContract } from "./ton-bridge";

export type TonSigner = { wallet?: TonWallet; accIdx: number };

export type TonNft = {
  nftItemAddr: string;
};

export type TonHelper = ChainNonceGet &
  TransferNftForeign<TonSigner, TonNft, string> &
  UnfreezeForeignNft<TonSigner, TonNft, string> &
  EstimateTxFees<TonNft> &
  ValidateAddress & { XpNft: string } & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonSigner;
  };

export type TonParams = {
  tonweb: TonWeb;
  bridgeAddr: string;
  burnerAddr: string;
  xpnftAddr: string;
};

type MethodMap = {
  ton_requestAccounts: [undefined, string];
  ton_sendTransaction: [{ value: string; to: string; data: string }, unknown];
  ton_getBalance: [undefined, string];
};

type TonWallet = {
  send<M extends keyof MethodMap>(
    method: M,
    params: MethodMap[M][0]
  ): Promise<MethodMap[M][1]>;
};

export async function tonHelper(args: TonParams): Promise<TonHelper> {
  const bridge = new BridgeContract(args.tonweb.provider, {
    address: args.bridgeAddr,
    burner: args.burnerAddr,
  });

  const ton = args.tonweb as TonWeb & TonWallet;
  ton.provider.sendBoc = (b) =>
    ton.provider.send("sendBocReturnHash", { boc: b });

  return {
    getNonce: () => Chain.TON,
    XpNft: args.xpnftAddr,
    async estimateValidateTransferNft() {
      return new BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft() {
      return new BigNumber(0); // TODO
    },
    async validateAddress(adr) {
      return TonWeb.Address.isValid(adr);
    },
    async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
      const rSigner = signer.wallet || ton;

      const txFeesFull = new BN(txFees.toString(10));
      const nftFee = TonWeb.utils.toNano("0.07");
      const payload = await bridge.createFreezeBody({
        amount: txFeesFull.sub(nftFee),
        to: Buffer.from(to),
        chainNonce,
        mintWith: Buffer.from(mintWith),
      });

      console.log(
        await rSigner.send("ton_sendTransaction", {
          value: txFeesFull.toString(10),
          to: nft.native.nftItemAddr,
          data: TonWeb.utils.bytesToBase64(await payload.getRepr()),
        })
      );

      // TODO: Tx hash
      return "";
    },
    async unfreezeWrappedNft(signer, to, nft, txFees, chainNonce) {
      const rSigner = signer.wallet || ton;

      const txFeesFull = new BN(txFees.toString(10));
      const nftFee = TonWeb.utils.toNano("0.05");
      const payload = await bridge.createWithdrawBody({
        to: Buffer.from(to),
        chainNonce: parseInt(chainNonce),
        txFees: txFeesFull.sub(nftFee),
      });

      console.log(
        "txHash:",
        await rSigner.send("ton_sendTransaction", {
          value: txFeesFull.toString(10),
          to: nft.native.nftItemAddr,
          data: TonWeb.utils.bytesToBase64(await payload.getRepr()),
        })
      );

      // TODO: tx hash
      return "";
    },
    tonKpWrapper(kp: TonWebMnemonic.KeyPair): TonSigner {
      const wallet = new TonWeb.Wallets.all.v3R2(ton.provider, {
        publicKey: kp.publicKey,
        wc: 0,
      });

      const wWallet: TonWallet = {
        async send(method, params) {
          switch (method) {
            case "ton_getBalance":
              return await ton.getBalance(await wallet.getAddress());
            case "ton_requestAccounts":
              return [await wallet.getAddress()];
            case "ton_sendTransaction":
              return await wallet.methods
                .transfer({
                  secretKey: kp.secretKey,
                  toAddress: params!.to,
                  amount: new BN(params!.value),
                  seqno: (await wallet.methods.seqno().call()) || 0,
                  sendMode: 3,
                  payload: TonWeb.utils.base64ToBytes(params!.data),
                })
                .send();
          }
        },
      };

      return {
        wallet: wWallet,
        accIdx: 0,
      };
    },
  };
}
