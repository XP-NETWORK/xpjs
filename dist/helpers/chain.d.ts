export interface TransferForeign<Signer, ForeignAddr, Balance, Tx, EventIdent> {
    transferNativeToForeign(sender: Signer, chain_nonce: number, to: ForeignAddr, value: Balance): Promise<[Tx, EventIdent]>;
}
export interface UnfreezeForeign<Signer, ForeignAddr, Balance, Tx, EventIdent> {
    unfreezeWrapped(sender: Signer, chain_nonce: number, to: ForeignAddr, value: Balance): Promise<[Tx, EventIdent]>;
}
export interface TransferNftForeign<Signer, ForeignAddr, NftIdent, Tx, EventIdent> {
    transferNftToForeign(sender: Signer, chain_nonce: number, to: ForeignAddr, id: NftIdent): Promise<[Tx, EventIdent]>;
}
export interface UnfreezeForeignNft<Signer, ForeignAddr, NftIdent, Tx, EventIdent> {
    unfreezeWrappedNft(sender: Signer, to: ForeignAddr, id: NftIdent): Promise<[Tx, EventIdent]>;
}
export interface BalanceCheck<Addr, Balance> {
    balance(address: Addr): Promise<Balance>;
}
export interface MintNft<Signer, Args, Identifier> {
    mintNft(owner: Signer, options: Args): Promise<Identifier>;
}
export interface ListNft<Addr, K, V> {
    listNft(owner: Addr): Promise<Map<K, V>>;
}
export interface GetLockedNft<Ident, Info> {
    getLockedNft(ident: Ident): Promise<Info | undefined>;
}
