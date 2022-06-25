import TonWeb from "tonweb";
import TonWebMnemonic from "tonweb-mnemonic";
import {
  ChainNonceGet,
  EstimateTxFees,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

export type TonSigner = TonWebMnemonic.KeyPair | undefined;

export type TonNft = {
  nftId: number;
};

export type TonHelper = ChainNonceGet &
  TransferNftForeign<TonSigner, TonNft, string> &
  UnfreezeForeignNft<TonSigner, TonNft, string> &
  EstimateTxFees<TonNft> &
  ValidateAddress;

export type TonParams = {
  tonweb: TonWeb;
  bridgeAddr: string;
  burnerAddr: string;
  xpnftAddr: string;
};

export async function tonHelper(_args: TonParams): Promise<TonHelper> {
  // TODO
  return {} as any;
}
