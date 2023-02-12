"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactories = exports.AppConfigs = void 0;
const _1 = require(".");
var AppConfigs;
(function (AppConfigs) {
  AppConfigs.MainNet = () => {
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
  AppConfigs.TestNet = () => {
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
      network: "testnet",
    };
  };
  AppConfigs.Staging = () => {
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
})((AppConfigs = exports.AppConfigs || (exports.AppConfigs = {})));
var ChainFactories;
(function (ChainFactories) {
  ChainFactories.MainNet = async () => {
    return (0, _1.ChainFactory)(
      AppConfigs.MainNet(),
      await _1.ChainFactoryConfigs.MainNet()
    );
  };
  ChainFactories.TestNet = async () => {
    return (0, _1.ChainFactory)(
      AppConfigs.TestNet(),
      await _1.ChainFactoryConfigs.TestNet()
    );
  };
  ChainFactories.Staging = async () => {
    return (0, _1.ChainFactory)(
      AppConfigs.Staging(),
      await _1.ChainFactoryConfigs.Staging()
    );
  };
})((ChainFactories = exports.ChainFactories || (exports.ChainFactories = {})));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3QkFBaUU7QUFFakUsSUFBaUIsVUFBVSxDQTRDMUI7QUE1Q0QsV0FBaUIsVUFBVTtJQUNaLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLDZDQUE2QztZQUM5RCxVQUFVLEVBQUUscUNBQXFDO1lBQ2pELGdCQUFnQixFQUNkLGdMQUFnTDtZQUNsTCxXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsWUFBWSxFQUFFLG1DQUFtQztZQUNqRCxnQkFBZ0IsRUFBRSwyQkFBMkI7WUFDN0MsV0FBVyxFQUFFLDhCQUE4QjtZQUMzQyxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBQ1csa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsNkNBQTZDO1lBQzlELFVBQVUsRUFBRSxzREFBc0Q7WUFDbEUsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx5Q0FBeUM7WUFDdEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsaURBQWlEO1lBQy9ELGdCQUFnQixFQUFFLDBDQUEwQztZQUM1RCxXQUFXLEVBQUUseUNBQXlDO1lBQ3RELE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFFVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSw2Q0FBNkM7WUFDOUQsVUFBVSxFQUFFLGdDQUFnQztZQUM1QyxnQkFBZ0IsRUFDZCxnTEFBZ0w7WUFDbEwsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFlBQVksRUFBRSxtQ0FBbUM7WUFDakQsZ0JBQWdCLEVBQUUsbUNBQW1DO1lBQ3JELFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsRUE1Q2dCLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBNEMxQjtBQUVELElBQWlCLGNBQWMsQ0FvQjlCO0FBcEJELFdBQWlCLGNBQWM7SUFDaEIsc0JBQU8sR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoQyxPQUFPLElBQUEsZUFBWSxFQUNqQixVQUFVLENBQUMsT0FBTyxFQUFFLEVBQ3BCLE1BQU0sc0JBQW1CLENBQUMsT0FBTyxFQUFFLENBQ3BDLENBQUM7SUFDSixDQUFDLENBQUM7SUFFVyxzQkFBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hDLE9BQU8sSUFBQSxlQUFZLEVBQ2pCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDcEIsTUFBTSxzQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FDcEMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUNXLHNCQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEMsT0FBTyxJQUFBLGVBQVksRUFDakIsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUNwQixNQUFNLHNCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUNwQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQXBCZ0IsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFvQjlCIn0=
