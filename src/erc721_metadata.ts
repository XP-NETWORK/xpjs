export type Erc721Attrs = {
    trait_type: string,
    value: string
};

export type Erc721Metadata = {
    name: string,
    description: string,
    image: string,
    attributes: Erc721Attrs[]
};

export type Erc721WrappedData = {
    contract: string,
    tokenId: string
}

export type ElrdWrappedData = {
    tokenId: string,
    nonce: string
}

export type Erc721MetadataEx<T> = Erc721Metadata & {
    wrapped: T & {
        origin: string,
        original_uri: string
    }
};