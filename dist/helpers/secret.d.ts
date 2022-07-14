import { SecretNetworkClient, Tx } from "secretjs";
import { EvNotifier } from "../notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type SecretNftInfo = {
    contract: string;
    contractHash: string;
    chainId: string;
    token_id: string;
};
export declare type SecretMintArgs = {
    url: string;
    contract?: SecretContract;
};
declare type SecretSigner = SecretNetworkClient;
export declare type SecretHelper = TransferNftForeign<SecretSigner, SecretNftInfo, Tx> & UnfreezeForeignNft<SecretSigner, SecretNftInfo, Tx> & ValidateAddress & EstimateTxFees<SecretNftInfo> & ChainNonceGet & PreTransfer<SecretSigner, SecretNftInfo, string> & BalanceCheck & GetFeeMargins & {
    XpNft: string;
} & GetProvider<SecretNetworkClient> & MintNft<SecretSigner, SecretMintArgs, Tx> & {
    nftList(owner: string, viewingKey: string, contract: string, codeHash?: string): Promise<NftInfo<SecretNftInfo>[]>;
};
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
    umt: SecretContract;
    feeMargin: FeeMargins;
};
export declare function secretHelperFactory(p: SecretParams): Promise<SecretHelper>;
export {};
//# sourceMappingURL=secret.d.ts.map