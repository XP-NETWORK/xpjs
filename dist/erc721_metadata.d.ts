export declare type Erc721Attrs = {
    trait_type: string;
    value: string;
};
export declare type Erc721Metadata = {
    name: string;
    description: string;
    image: string;
    attributes: Erc721Attrs[];
};
export declare type Erc721WrappedData = {
    contract: string;
    tokenId: string;
};
export declare type ElrdWrappedData = {
    tokenId: string;
    nonce: string;
};
export declare type Erc721MetadataEx<T> = Erc721Metadata & {
    wrapped: T & {
        origin: string;
        original_uri: string;
    };
};
