export interface Faucet<Addr, Balance, Tx> {
  transferFromFaucet(to: Addr, value: Balance): Promise<Tx>;
}

export interface TransferForeign<Signer, ForeignAddr, Balance, Tx> {
  transferNativeToForeign(
    sender: Signer,
    to: ForeignAddr,
    value: Balance
  ): Promise<Tx>;
}

export interface UnfreezeForeign<Signer, ForeignAddr, Balance, Tx> {
  unfreezeWrapped(sender: Signer, to: ForeignAddr, value: Balance): Promise<Tx>;
}

export interface TransferNftForeign<Signer, ForeignAddr, NftIdent, Tx> {
  transferNftToForeign(
    sender: Signer,
    to: ForeignAddr,
    id: NftIdent
  ): Promise<Tx>;
}

export interface UnfreezeForeignNft<Signer, ForeignAddr, NftIdent, Tx> {
  unfreezeWrappedNft(
    sender: Signer,
    to: ForeignAddr,
    id: NftIdent
  ): Promise<Tx>;
}
