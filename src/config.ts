import { AppConfig, ChainFactory, ChainFactoryConfigs } from ".";

export namespace AppConfigs {
  export const MainNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://nft-index.xp.network/index/",
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
      exchangeRateUri: "http://localhost:3068/exchange/",
      nftListUri: "http://localhost:3066",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
      txSocketUri: "http://localhost:3062",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://testnet-validator-pinger.herokuapp.com/",
      wrappedNftPrefix: "http://localhost:3060",
      scVerifyUri: "http://localhost:3063",
      network: "testnet",
    };
  };

  export const Staging: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://tools.xp.network/index",
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
