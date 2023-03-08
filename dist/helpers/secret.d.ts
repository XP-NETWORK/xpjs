import { SecretNetworkClient } from "secretjs";
import { Extension } from "secretjs/dist/extensions/snip721/types";
import { EvNotifier } from "../notifier";
import { BalanceCheck, ChainNonceGet, EstimateTxFees, FeeMargins, GetFeeMargins, GetProvider, MintNft, NftInfo, PreTransfer, TransferNftForeign, UnfreezeForeignNft, ValidateAddress, WhitelistCheck } from "./chain";
export type SecretNftInfo = {
    contract: string;
    contractHash: string;
    chainId: string;
    tokenId: string;
    vk: string;
    metadata: Extension | undefined;
};
export type SecretMintArgs = {
    url: string;
    contract?: SecretContract;
};
type SecretSigner = SecretNetworkClient;
export type SecretHelper = TransferNftForeign<SecretSigner, SecretNftInfo, any> & UnfreezeForeignNft<SecretSigner, SecretNftInfo, any> & ValidateAddress & EstimateTxFees<SecretNftInfo> & ChainNonceGet & WhitelistCheck<SecretNftInfo> & PreTransfer<SecretSigner, SecretNftInfo, string, undefined> & BalanceCheck & GetFeeMargins & {
    XpNft: string;
} & GetProvider<SecretNetworkClient> & MintNft<SecretSigner, SecretMintArgs, any> & {
    nftList(owner: string, viewingKey: string, contract: string, codeHash?: string): Promise<NftInfo<SecretNftInfo>[]>;
    setViewingKey(client: SecretNetworkClient, contract: string, vk: string): Promise<any>;
    isApprovedForMinter(sender: SecretSigner, nft: NftInfo<SecretNftInfo>): Promise<boolean>;
};
export type SecretContract = {
    contractAddress: string;
    codeHash: string;
};
export type SecretParams = {
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