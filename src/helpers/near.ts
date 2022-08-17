import BigNumber from "bignumber.js";
import {
  Account,
  connect,
  Contract,
  DEFAULT_FUNCTION_CALL_GAS,
} from "near-api-js";
import { Chain } from "../consts";
import {
  ChainNonceGet,
  EstimateTxFees,
  TransferNftForeign,
  UnfreezeForeignNft,
  ValidateAddress,
} from "./chain";

export type NearParams = {
  networkId: string;
  nonce: number;
  rpcUrl: string;
  bridge: string;
  xpnft: string;
};
export type NearNFT = {
  tokenId: string;
};

export type NearHelper = ChainNonceGet &
  TransferNftForeign<Account, NearNFT, string> &
  UnfreezeForeignNft<Account, NearNFT, string> &
  EstimateTxFees<NearNFT> &
  ValidateAddress;

export async function nearHelperFactory({
  networkId,
  bridge,
  rpcUrl,
}: NearParams): Promise<NearHelper> {
  const near = await connect({
    nodeUrl: rpcUrl,
    networkId,
    headers: {},
  });

  const getMinter = async (connection: Account) => {
    return new Contract(connection, bridge, {
      changeMethods: ["freeze_nft"],
      viewMethods: [],
    }) as any;
  };

  return {
    async estimateValidateTransferNft(_to, _metadata, _mintWith) {
      return new BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft(_to, _metadata, _mintWith) {
      return new BigNumber(0); // TODO
    },
    getNonce() {
      return Chain.NEAR;
    },
    async transferNftToForeign(
      sender,
      chain_nonce,
      to,
      id,
      txFees,
      mint_with,
      gasLimit
    ) {
      const minter = await getMinter(sender);
      const resp = minter.freeze_nft(
        {
          token_id: id.native.tokenId,
          chain_nonce,
          to,
          amt: new BigNumber(txFees),
          mint_with,
        },
        gasLimit ?? DEFAULT_FUNCTION_CALL_GAS,
        txFees
      );
      return resp;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      const minter = await getMinter(sender);
      const resp = minter.withdraw_nft(
        // token_id: TokenId, chain_nonce: u8, to: String, amt: u128
        {
          token_id: id.native.tokenId,
          chain_nonce: nonce,
          to,
          amt: new BigNumber(txFees),
        },
        DEFAULT_FUNCTION_CALL_GAS,
        txFees
      );
      return resp;
    },
    async validateAddress(adr) {
      try {
        new Account(near.connection, adr).accountId;
        return true;
      } catch (e) {
        return false;
      }
    },
  };
}
