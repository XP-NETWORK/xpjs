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
  const bridge = new BridgeContract(args.tonweb.provider, {
    burner: args.burnerAddr,
  });

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
    async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
      const rSigner = signer.wallet || ton;
      const addr = (await rSigner.send("ton_requestAccounts", undefined))[
        signer.accIdx
      ];

      const nftColl = new TonWeb.token.nft.NftCollection(ton.provider, {
        ownerAddress: new TonWeb.Address(addr),
        nftItemCodeHex: TonWeb.token.nft.NftItem.codeHex,
      });

      const nftItemAddr = await nftColl.getNftItemAddressByIndex(
        nft.native.nftId
      );
      const txFeesFull = new BN(txFees.toString(10));
      const nftFee = TonWeb.utils.toNano("0.05");
      const payload = await bridge.createFreezeBody({
        amount: txFeesFull.sub(nftFee),
        to: Buffer.from(to),
        chainNonce,
        mintWith: Buffer.from(mintWith),
      });

      await rSigner.send("ton_sendTransaction", {
        value: nftFee.toString(10),
        to: nftItemAddr.toString(true, true, true),
        data: Buffer.from(await payload.getRepr()).toString("base64"),
      });

      // TODO: Tx hash
      return "";
    },
    async unfreezeWrappedNft(signer, to, nft, txFees, chainNonce) {
      const rSigner = signer.wallet || ton;

      const nftColl = new TonWeb.token.nft.NftCollection(ton.provider, {
        ownerAddress: await bridge.getAddress(),
        nftItemCodeHex: TonWeb.token.nft.NftItem.codeHex,
      });

      const nftItemAddr = await nftColl.getNftItemAddressByIndex(
        nft.native.nftId
      );

      const txFeesFull = new BN(txFees.toString(10));
      const nftFee = TonWeb.utils.toNano("0.05");
      const payload = await bridge.createWithdrawBody({
        to: Buffer.from(to),
        chainNonce: parseInt(chainNonce),
        txFees: txFeesFull.sub(nftFee),
      });

      await rSigner.send("ton_sendTransaction", {
        value: nftFee.toString(10),
        to: nftItemAddr.toString(true, true, true),
        data: Buffer.from(await payload.getRepr()).toString("base64"),
      });

      // TODO: tx hash
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
