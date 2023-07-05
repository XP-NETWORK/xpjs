import { AppConfig, ChainFactory, ChainFactoryConfigs } from ".";

export namespace AppConfigs {
  export const MainNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://nft-index.xp.network/index/",
      whitelistedUri: "https://nft-index.xp.network/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
      txSocketUri: "https://transaction-socket.xp.network",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://nft.xp.network/w/",
      scVerifyUri: "https://sc-verify.xp.network",
      network: "mainnet",
    };
  };
  export const TestNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testnet-notifier.xp.network/ex/exchange/",
      nftListUri: "https://testnet-notifier.xp.network/testnet-indexer/",
      whitelistedUri: "https://testnet-notifier.xp.network/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
      txSocketUri: "https://testnet-tx-socket.herokuapp.com",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://testnet-validator-pinger.herokuapp.com/",
      wrappedNftPrefix: "https://testnet-w-nft-api.herokuapp.com/",
      scVerifyUri: "https://testnet-sc-verify.herokuapp.com",
      network: "testnet",
    };
  };

  export const Staging: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://tools.xp.network/index",
      whitelistedUri: "https://tools.xp.network/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
      txSocketUri: "https://bridge1.xp.network/tx-socket",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://staging-nft.xp.network/w/",
      scVerifyUri: "https://bridge1.xp.network/sc-verify",
      network: "staging",
    };
  };
}

export namespace ChainFactories {
  export const MainNet = async () => {
    return ChainFactory(
      AppConfigs.MainNet(),
      await ChainFactoryConfigs.MainNet()
    );
  };

  export const TestNet = async () => {
    return ChainFactory(
      AppConfigs.TestNet(),
      await ChainFactoryConfigs.TestNet()
    );
  };
  export const Staging = async () => {
    return ChainFactory(
      AppConfigs.Staging(),
      await ChainFactoryConfigs.Staging()
    );
  };
}
