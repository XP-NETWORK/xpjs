import { AppConfig } from ".";

export namespace AppConfigs {
  export const MainNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://indexnft.herokuapp.com",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
      txSocketUri: "https://transaction-socket.xp.network",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://nft.xp.network/w/",
	  scVerifyUri: "https://sc-verify.xp.network",
      network: "mainnet"
    };
  };
  export const TestNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://testnet-notifier.xp.network/testnet-indexer/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
      txSocketUri: "https://testnet-tx-socket.herokuapp.com",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://testnet-validator-pinger.herokuapp.com/",
      wrappedNftPrefix: "https://testnet-w-nft-api.herokuapp.com/",
	  scVerifyUri: "https://testnet-sc-verify.herokuapp.com",
      network: "testnet"
    };
  };
}
