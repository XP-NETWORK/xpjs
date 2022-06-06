import { SecretNetworkClient, Tx } from "secretjs";
import { EvNotifier } from "../notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type SecretNftInfo = {
    contract: string;
    contractHash: string;
    token_id: string;
};
declare type SecretSigner = SecretNetworkClient;
export declare type SecretHelper = TransferNftForeign<SecretSigner, SecretNftInfo, Tx> & UnfreezeForeignNft<SecretSigner, SecretNftInfo, Tx> & ValidateAddress & EstimateTxFees<SecretNftInfo> & ChainNonceGet & PreTransfer<SecretSigner, SecretNftInfo, string> & BalanceCheck & GetFeeMargins & {
    XpNft: string;
} & GetProvider<SecretNetworkClient>;
export declare type SecretContract = {
    contractAddress: string;
    codeHash: string;
};
export declare type SecretParams = {
    rpcUrl: string;
    chainId: string;
    notifier: EvNotifier;
    bridge: SecretContract;
    xpnft: SecretContract;
    feeMargin: FeeMargins;
};
export declare function secretHelperFactory(p: SecretParams): Promise<SecretHelper>;
export {};
