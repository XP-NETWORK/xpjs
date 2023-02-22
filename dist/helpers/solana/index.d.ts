import { Wallet } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { EvNotifier } from "../../notifier";
import {
  ChainNonceGet,
  EstimateTxFees,
  FeeMargins,
  GetFeeMargins,
  GetProvider,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
  BalanceCheck,
  MintNft,
} from "../chain";
export declare type SolanaSigner = Wallet;
export declare type SolanaNft = {
  nftMint: string;
};
declare type SolanaMintArgs = {
  uri: string;
};
export declare type SolanaHelper = ChainNonceGet &
  BalanceCheck &
  MintNft<SolanaSigner, SolanaMintArgs, string> &
  TransferNftForeign<SolanaSigner, SolanaNft, string> &
  UnfreezeForeignNft<SolanaSigner, SolanaNft, string> &
  EstimateTxFees<SolanaNft> &
  ValidateAddress & {
    connection: Connection;
  } & {
    XpNft: string;
  } & GetFeeMargins &
  GetProvider<Connection>;
export declare type SolanaParams = {
  endpoint: string;
  bridgeContractAddr: string;
  xpnftAddr: string;
  notifier: EvNotifier;
  feeMargin: FeeMargins;
};
export declare function solanaHelper(args: SolanaParams): Promise<SolanaHelper>;
export {};
//# sourceMappingURL=index.d.ts.map
