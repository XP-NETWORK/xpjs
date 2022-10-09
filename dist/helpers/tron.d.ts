import { BalanceCheck, EstimateTxFees, FeeMargins, GetFeeMargins, MintNft, TransferNftForeign, UnfreezeForeignNft } from "./chain";
import { TronWeb } from "tronweb";
import { EthNftInfo, MintArgs } from "./web3";
import { Approve, ExtractAction, ExtractTxnStatus, IsApproved, PreTransfer, PreTransferRawTxn, ValidateAddress, WhitelistCheck, GetTokenURI } from "..";
import { ChainNonceGet } from "..";
import { EvNotifier } from "../notifier";
declare type TronSender = string | undefined;
export declare type MinterRes = {
    minter: string;
    xpnft: string;
    xpnft1155: string;
    whitelist: string[];
};
export declare type BaseTronHelper = BalanceCheck & MintNft<TronSender, MintArgs, string> & {
    /**
     *
     * Deploy an ERC721 user minter smart contract
     *
     * @argument deployer  deployer of this smart contract
     * @returns Address of the deployed smart contract
     */
    deployErc721(deployer: TronSender): Promise<string>;
    /**
     * Deploy Minter Smart Contract
     *
     * @argument deployer  deployer of the smart contract
     * @argument frostGroupKey FROST SECP256k1 Group Key
     * @argument xpnftPrefix XP Wrapped NFT backend with "/" suffix
     * @argument xpnftPrefix1155 XP Wrapped NFT Backend in erc1155 format (with {id})
     * @argument whitelist List of NFTs to whitelist
     */
    deployMinter(deployer: TronSender, frostGroupKey: string, xpnftPrefix: string, xpnftPrefix1155: string, whitelist?: string[]): Promise<MinterRes>;
};
export declare type TronHelper = BaseTronHelper & TransferNftForeign<TronSender, EthNftInfo, string> & UnfreezeForeignNft<TronSender, EthNftInfo, string> & EstimateTxFees<EthNftInfo> & ChainNonceGet & Approve<TronSender> & ValidateAddress & IsApproved<TronSender> & ExtractAction<string> & Pick<PreTransfer<TronSender, EthNftInfo, string>, "preTransfer"> & PreTransferRawTxn<EthNftInfo, TronRawTxn> & ExtractTxnStatus & WhitelistCheck<EthNftInfo> & {
    XpNft: string;
    XpNft1155: string;
} & GetFeeMargins & GetTokenURI;
export declare function baseTronHelperFactory(provider: TronWeb): Promise<BaseTronHelper>;
export interface TronParams {
    provider: TronWeb;
    notifier: EvNotifier;
    minter_addr: string;
    erc721_addr: string;
    erc1155_addr: string;
    validators: string[];
    feeMargin: FeeMargins;
}
export interface TronRawTxn {
    readonly visible: boolean;
    readonly txID: string;
    readonly raw_data: {
        readonly ref_block_bytes: string;
        readonly ref_block_hash: string;
        expiration: number;
        readonly fee_limit: number;
        readonly timestamp: number;
        readonly contract: {
            readonly parameter: {
                readonly value: {
                    readonly data: string;
                    readonly owner_address: string;
                    readonly contract_address: string;
                };
                readonly type_url: string;
            };
            readonly type: string;
        }[];
    };
    readonly raw_data_hex: string;
}
export declare function tronHelperFactory(tronParams: TronParams): Promise<TronHelper>;
export {};
//# sourceMappingURL=tron.d.ts.map