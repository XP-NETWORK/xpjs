import { Web3Helper } from "../evm/web3";
import { HederaService } from "../../services/hederaApi";
import { Web3Params } from "./depricated";
type HSDK = typeof import("@hashgraph/sdk");
type tokenListResponce = {
    contract: string;
    htsToken: string;
    tokens: string[];
    associated?: boolean;
};
type tokenListRequest = {
    contract: string;
    hts_token: string;
    nft_id: string;
};
type HederaHelperFactory = Web3Helper & {
    toSolidityAddress(address: string): Promise<string>;
    listHederaClaimableNFT(tokens: tokenListRequest[], signer: any): Promise<tokenListResponce[]>;
    claimNFT(proxyContract: string | undefined, htsToken: string | undefined, tokenId: string, signer: any): Promise<boolean>;
    checkAndAssociate(tokens: tokenListRequest[], signer: any): Promise<boolean>;
    associateToken(tokens: tokenListResponce[], signer: any): Promise<boolean>;
    injectSDK?(sdk: HSDK): HederaHelperFactory & {
        isInjected: boolean;
    };
};
type HederaParams = {
    htcToken: string;
    Xpnfthtsclaims: string;
    hederaApi: HederaService;
};
export declare const HederaHelperFactory: (params: Web3Params & HederaParams) => Promise<HederaHelperFactory>;
export {};
//# sourceMappingURL=hedera_refactor.d.ts.map