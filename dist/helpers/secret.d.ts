import { SecretNetworkClient, Tx } from "secretjs";
import { Extension } from "secretjs/dist/extensions/snip721/types";
import { EvNotifier } from "../notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress } from "./chain";
export declare type SecretNftInfo = {
    contract: string;
    contractHash: string;
    chainId: string;
    tokenId: string;
    vk: string;
    metadata: Extension | undefined;
};
export declare type SecretMintArgs = {
    url: string;
    contract?: SecretContract;
};
declare type SecretSigner = SecretNetworkClient;
export declare type SecretHelper = TransferNftForeign<SecretSigner, SecretNftInfo, Tx> & UnfreezeForeignNft<SecretSigner, SecretNftInfo, Tx> & ValidateAddress & EstimateTxFees<SecretNftInfo> & ChainNonceGet & PreTransfer<SecretSigner, SecretNftInfo, string, undefined> & BalanceCheck & GetFeeMargins & {
    XpNft: string;
} & GetProvider<SecretNetworkClient> & MintNft<SecretSigner, SecretMintArgs, Tx> & {
    nftList(owner: string, viewingKey: string, contract: string, codeHash?: string): Promise<NftInfo<SecretNftInfo>[]>;
    setViewingKey(client: SecretNetworkClient, contract: string, vk: string): Promise<Tx>;
    isApprovedForMinter(sender: SecretSigner, nft: NftInfo<SecretNftInfo>): Promise<boolean>;
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