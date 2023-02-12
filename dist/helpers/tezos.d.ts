import { BalanceCheck, ChainNonceGet, EstimateTxFees, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "..";
import { Signer, TezosToolkit, WalletProvider } from "@taquito/taquito";
import { EvNotifier } from "../notifier";
import { FeeMargins, GetFeeMargins, WhitelistCheck, GetTokenURI } from "./chain";
type TezosSigner = WalletProvider | Signer;
export type TezosNftInfo = {
    contract: string;
    token_id: string;
};
type TezosMintArgs = {
    identifier: string;
    attrs: string;
    contract: string;
    uri: string;
};
export type TezosHelper = TransferNftForeign<TezosSigner, TezosNftInfo, string> & MintNft<TezosSigner, TezosMintArgs, string> & BalanceCheck & UnfreezeForeignNft<TezosSigner, TezosNftInfo, string> & ValidateAddress & EstimateTxFees<TezosNftInfo> & ChainNonceGet & Pick<PreTransfer<Signer, TezosNftInfo, string, undefined>, "preTransfer"> & {
    isApprovedForMinter(nft: NftInfo<TezosNftInfo>, signer: TezosSigner): Promise<boolean>;
} & {
    approveForMinter(address: NftInfo<TezosNftInfo>, sender: TezosSigner): Promise<string | undefined>;
} & {
    XpNft: string;
} & GetFeeMargins & WhitelistCheck<TezosNftInfo> & GetTokenURI;
export type TezosParams = {
    Tezos: TezosToolkit;
    notifier: EvNotifier;
    xpnftAddress: string;
    bridgeAddress: string;
    validators: string[];
    feeMargin: FeeMargins;
};
export declare function tezosHelperFactory({ Tezos, notifier, xpnftAddress, bridgeAddress, validators, feeMargin, }: TezosParams): Promise<TezosHelper>;
export {};
//# sourceMappingURL=tezos.d.ts.map