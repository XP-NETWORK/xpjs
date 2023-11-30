import { Cell, Slice, Address, Builder, Dictionary, ContractProvider, Sender, Contract, ContractABI } from "ton-core";
export type ClaimData1 = {
    $$type: "ClaimData1";
    tokenId: bigint;
    sourceChain: string;
    destinationChain: string;
    destinationUserAddress: Address;
    tokenAmount: bigint;
};
export type ClaimData2 = {
    $$type: "ClaimData2";
    name: string;
    symbol: string;
    nftType: string;
};
export type ClaimData3 = {
    $$type: "ClaimData3";
    fee: bigint;
    sourceNftContractAddress: Cell;
    royaltyReceiver: Address;
    metadata: string;
};
export type RoyaltyParams = {
    $$type: "RoyaltyParams";
    numerator: bigint;
    denominator: bigint;
    destination: Address;
};
export type ClaimData4 = {
    $$type: "ClaimData4";
    newContent: Cell;
    transactionHash: string;
    royalty: RoyaltyParams;
};
export type ClaimData = {
    $$type: "ClaimData";
    data1: ClaimData1;
    data2: ClaimData2;
    data3: ClaimData3;
    data4: ClaimData4;
};
export declare function storeClaimData1(src: ClaimData1): (builder: Builder) => void;
export declare function storeClaimData2(src: ClaimData2): (builder: Builder) => void;
export declare function storeClaimData3(src: ClaimData3): (builder: Builder) => void;
export declare function storeRoyaltyParams(src: RoyaltyParams): (builder: Builder) => void;
export declare function storeClaimData4(src: ClaimData4): (builder: Builder) => void;
export declare function storeClaimData(src: ClaimData): (builder: Builder) => void;
export type SignerAndSignature = {
    $$type: "SignerAndSignature";
    signature: Cell;
    key: bigint;
};
export type ClaimNFT721 = {
    $$type: "ClaimNFT721";
    data: ClaimData;
    signatures: Dictionary<bigint, SignerAndSignature>;
    len: bigint;
};
export declare function storeSignerAndSignature(src: SignerAndSignature): (builder: Builder) => void;
export declare function loadSignerAndSignature(slice: Slice): {
    $$type: "SignerAndSignature";
    signature: Cell;
    key: bigint;
};
export declare function storeClaimNFT721(src: ClaimNFT721): (builder: Builder) => void;
export declare function storeTransfer(src: Transfer): (builder: Builder) => void;
export type Transfer = {
    $$type: "Transfer";
    query_id: bigint;
    new_owner: Address;
    response_destination: Address;
    custom_payload: Cell | null;
    forward_amount: bigint;
    forward_payload: Cell;
};
export type GetStaticData = {
    $$type: "GetStaticData";
    query_id: bigint;
};
export declare function storeGetStaticData(src: GetStaticData): (builder: Builder) => void;
export declare class NftItem implements Contract {
    static init(collection_address: Address, item_index: bigint, owner: Address, individual_content: Cell): Promise<{
        code: Cell;
        data: Cell;
    }>;
    static fromInit(collection_address: Address, item_index: bigint, owner: Address, individual_content: Cell): Promise<NftItem>;
    static fromAddress(address: Address): NftItem;
    readonly address: Address;
    readonly init?: {
        code: Cell;
        data: Cell;
    };
    readonly abi: ContractABI;
    private constructor();
    send(provider: ContractProvider, via: Sender, args: {
        value: bigint;
        bounce?: boolean | null | undefined;
    }, message: Transfer | GetStaticData): Promise<void>;
    getGetNftData(provider: ContractProvider): Promise<{
        $$type: "GetNftData";
        is_initialized: boolean;
        index: bigint;
        collection_address: Address;
        owner_address: Address;
        individual_content: Cell;
    }>;
}
export type CollectionDeploy = {
    $$type: "CollectionDeploy";
    newOwner: Address;
};
export declare function storeCollectionDeploy(src: CollectionDeploy): (builder: Builder) => void;
export type GetRoyaltyParams = {
    $$type: "GetRoyaltyParams";
    query_id: bigint;
};
export declare function storeGetRoyaltyParams(src: GetRoyaltyParams): (builder: Builder) => void;
export declare class NftCollection implements Contract {
    static init(owner_address: Address, collection_content: Cell, royalty_params: RoyaltyParams): Promise<{
        code: Cell;
        data: Cell;
    }>;
    static fromInit(owner_address: Address, collection_content: Cell, royalty_params: RoyaltyParams): Promise<NftCollection>;
    static fromAddress(address: Address): NftCollection;
    readonly address: Address;
    readonly init?: {
        code: Cell;
        data: Cell;
    };
    readonly abi: ContractABI;
    private constructor();
    send(provider: ContractProvider, via: Sender, args: {
        value: bigint;
        bounce?: boolean | null | undefined;
    }, message: CollectionDeploy | "Mint" | GetRoyaltyParams): Promise<void>;
    getGetCollectionData(provider: ContractProvider): Promise<{
        $$type: "CollectionData";
        next_item_index: bigint;
        collection_content: Cell;
        owner_address: Address;
    }>;
    getGetNftAddressByIndex(provider: ContractProvider, item_index: bigint): Promise<Address | null>;
    getGetNftItemInit(provider: ContractProvider, item_index: bigint): Promise<{
        $$type: "StateInit";
        code: Cell;
        data: Cell;
    }>;
    getGetNftContent(provider: ContractProvider, index: bigint, individual_content: Cell): Promise<Cell>;
    getRoyaltyParams(provider: ContractProvider): Promise<{
        $$type: "RoyaltyParams";
        numerator: bigint;
        denominator: bigint;
        destination: Address;
    }>;
}
//# sourceMappingURL=v3types.d.ts.map