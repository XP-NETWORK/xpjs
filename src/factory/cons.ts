import {
  BatchExchangeRateRepo,
  cachedExchangeRateRepo,
  ExchangeRateRepo,
  networkBatchExchangeRateRepo,
  NetworkModel,
} from "crypto-exchange-rate";

import { NftInfo, FullChain } from "..";

import { CHAIN_INFO, ChainType } from "../consts";

export function exchangeRateRepo(
  baseUrl: string
): ExchangeRateRepo & BatchExchangeRateRepo {
  const baseService = NetworkModel.batchExchangeRateService(baseUrl);

  return cachedExchangeRateRepo(
    networkBatchExchangeRateRepo(
      baseService,
      NetworkModel.exchangeRateDtoMapper()
    )
  );
}

export function getDefaultContract<SignerT, RawNftF, Resp, RawNftT>(
  nft: NftInfo<RawNftF>,
  fromChain: FullChain<SignerT, RawNftT, Resp>,
  toChain: FullChain<SignerT, RawNftT, Resp>
): string | undefined {
  const from = fromChain.getNonce();
  const to = toChain.getNonce();

  const fromType = CHAIN_INFO.get(from)?.type;
  const toType = CHAIN_INFO.get(to)?.type;

  const contract =
    "contractType" in nft.native &&
    //@ts-ignore contractType is checked
    nft.native.contractType === "ERC1155" &&
    toChain.XpNft1155
      ? toChain.XpNft1155
      : toChain.XpNft;

  if (
    typeof window !== "undefined" &&
    (/(testing\.bridge)/.test(window.location.origin) ||
      /testnet/.test(window.location.pathname))
  ) {
    return contract;
  }

  if (fromType === ChainType.EVM && toType === ChainType.EVM) {
    return undefined;
  }

  if (fromType === ChainType.ELROND && toType === ChainType.EVM) {
    return undefined;
  }

  if (fromType === ChainType.EVM && toType === ChainType.ELROND) {
    return undefined;
  }

  return contract;
}
