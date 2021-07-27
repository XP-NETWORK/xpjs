export interface TransferForeign<Signer, ForeignAddr, Balance, Tx> {
    transferNativeToForeign(sender: Signer, to: ForeignAddr, value: Balance): Promise<Tx>;
}
export interface UnfreezeForeign<Signer, ForeignAddr, Balance, Tx> {
    unfreezeWrapped(sender: Signer, to: ForeignAddr, value: Balance): Promise<Tx>;
}
export interface TransferNftForeign<Signer, ForeignAddr, NftIdent, Tx> {
    transferNftToForeign(sender: Signer, to: ForeignAddr, id: NftIdent): Promise<Tx>;
}
export interface UnfreezeForeignNft<Signer, ForeignAddr, NftIdent, Tx> {
    unfreezeWrappedNft(sender: Signer, to: ForeignAddr, id: NftIdent): Promise<Tx>;
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
