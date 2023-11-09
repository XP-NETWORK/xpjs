import { AppConfig, ChainFactory, ChainFactoryConfigs } from ".";

export namespace AppConfigs {
  export const MainNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
      nftListUri: "https://nft-index.xp.network/index/",
      whitelistedUri: "https://nft-index.xp.network/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
      txSocketUri: "https://transaction-socket.xp.network",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://nft.xp.network/w/",
      scVerifyUri: "https://sc-verify.xp.network",
      storageContract: "",
      storegeNetwork: "",
      network: "mainnet",
    };
  };
  export const TestNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
      nftListUri: "https://tools.xp.network/testnet-indexer/",
      whitelistedUri: "https://tools.xp.network/testnet-notifier/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
      txSocketUri: "https://tools.xp.network/testnet-tx-socket", //"https://testnet-tx-socket.herokuapp.com",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://tools.xp.network/testnet-pinger/",
      wrappedNftPrefix: "https://tools.xp.network/testnet-wnft/", //"https://bridge-wnftapi.herokuapp.com/",
      scVerifyUri: "https://tools.xp.network/testnet-sc-verify/",
      storageContract: "0x38AEDf581C90D8EA955FC9a124b0A2B4471A61DD",
      storegeNetwork: "https://optimism-goerli.publicnode.com",
      network: "testnet",
    };
  };

  export const Staging: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
      nftListUri: "https://tools.xp.network/index/",
      whitelistedUri: "https://tools.xp.network/notifier/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
      txSocketUri: "https://tools.xp.network/tx-socket/", //"https://staging-tx-socket-925db65784a7.herokuapp.com/",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://tools.xp.network/wnft/", //"https://staging-nft.xp.network/w/",
      scVerifyUri: "https://tools.xp.network/sc-verify",
      storageContract: "",
      storegeNetwork: "",
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
