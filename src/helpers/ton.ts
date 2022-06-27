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
// import { BridgeContract } from "./ton-bridge";

export type TonSigner = TonWallet | { accIdx: number };

export type TonNft = {
  nftId: number;
};

export type TonHelper = ChainNonceGet &
  TransferNftForeign<TonSigner, TonNft, string> &
  UnfreezeForeignNft<TonSigner, TonNft, string> &
  EstimateTxFees<TonNft> &
  ValidateAddress & { XpNft: string } & {
    tonKpWrapper: (kp: TonWebMnemonic.KeyPair) => TonWallet;
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
  // const bridge = new BridgeContract(args.tonweb.provider, {
  //   burner: args.burnerAddr
  // });

  const ton = args.tonweb as TonWeb & TonWallet;

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
    async transferNftToForeign() {
      // TODO
      return "";
    },
    async unfreezeWrappedNft() {
      // TODO
      return "";
    },
    tonKpWrapper(kp: TonWebMnemonic.KeyPair): TonWallet {
      const wallet = new TonWeb.Wallets.all.v3R2(ton.provider, {
        publicKey: kp.publicKey,
        wc: 0,
      });
      return {
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
                  payload: Buffer.from(params!.data, "base64"),
                })
                .send();
          }
        },
      };
    },
  };
}
