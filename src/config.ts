import { AppConfig } from ".";

export namespace AppConfigs {
  export const MainNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://indexnft.herokuapp.com",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
      txSocketUri: "transaction-socket.xp.network",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://xpheartbeat.herokuapp.com",
      wrappedNftPrefix: "https://nft.xp.network/w/",
      network: "mainnet"
    };
  };
  export const TestNet: () => AppConfig = () => {
    return {
      exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
      nftListUri: "https://testnet-notifier.xp.network/testnet-indexer/",
      nftListAuthToken:
        "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY0NDIzMDE0NiwiZXhwIjoxNjUyMDA2MTQ2fQ.gX6Auj4hFLdpem5Pk2kAnH71I19iGXfBYjmQrXylMFX_R1yzDEbylVAOLW6kABH9VjnLbAnCRdQvLaQIFmMUpw",
      txSocketUri: "https://testnet-tx-socket.herokuapp.com",
      tronScanUri: "https://apilist.tronscan.org/api/",
      heartbeatUri: "https://testnet-validator-pinger.herokuapp.com/",
      wrappedNftPrefix: "https://testnet-w-nft-api.herokuapp.com/",
      network: "testnet"
    };
  };
}
