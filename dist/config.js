"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactories = exports.AppConfigs = void 0;
const _1 = require(".");
var AppConfigs;
(function (AppConfigs) {
    AppConfigs.MainNet = () => {
        return {
            exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
            nftListUri: "https://nft-index.xp.network/index/",
            whitelistedUri: "https://nft-index.xp.network/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
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
            exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
            nftListUri: "https://tools.xp.network/testnet-indexer/",
            whitelistedUri: "https://tools.xp.network/testnet-notifier/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
            txSocketUri: "https://tools.xp.network/testnet-tx-socket",
            tronScanUri: "https://apilist.tronscan.org/api/",
            heartbeatUri: "https://tools.xp.network/testnet-pinger/",
            wrappedNftPrefix: "https://tools.xp.network/testnet-wnft/",
            scVerifyUri: "https://tools.xp.network/testnet-sc-verify/",
            network: "testnet",
        };
    };
    AppConfigs.Staging = () => {
        return {
            exchangeRateUri: "https://tools.xp.network/exchange-rate/exchange/",
            nftListUri: "https://tools.xp.network/index/",
            whitelistedUri: "https://tools.xp.network/notifier/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
            txSocketUri: "https://tools.xp.network/tx-socket/",
            tronScanUri: "https://apilist.tronscan.org/api/",
            heartbeatUri: "https://xpheartbeat.herokuapp.com",
            wrappedNftPrefix: "https://tools.xp.network/wnft/",
            scVerifyUri: "https://tools.xp.network/sc-verify",
            network: "staging",
        };
    };
})(AppConfigs = exports.AppConfigs || (exports.AppConfigs = {}));
var ChainFactories;
(function (ChainFactories) {
    ChainFactories.MainNet = async () => {
        return (0, _1.ChainFactory)(AppConfigs.MainNet(), await _1.ChainFactoryConfigs.MainNet());
    };
    ChainFactories.TestNet = async () => {
        return (0, _1.ChainFactory)(AppConfigs.TestNet(), await _1.ChainFactoryConfigs.TestNet());
    };
    ChainFactories.Staging = async () => {
        return (0, _1.ChainFactory)(AppConfigs.Staging(), await _1.ChainFactoryConfigs.Staging());
    };
})(ChainFactories = exports.ChainFactories || (exports.ChainFactories = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3QkFBaUU7QUFFakUsSUFBaUIsVUFBVSxDQStDMUI7QUEvQ0QsV0FBaUIsVUFBVTtJQUNaLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLGtEQUFrRDtZQUNuRSxVQUFVLEVBQUUscUNBQXFDO1lBQ2pELGNBQWMsRUFBRSwrQkFBK0I7WUFDL0MsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxXQUFXLEVBQUUsOEJBQThCO1lBQzNDLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSxrREFBa0Q7WUFDbkUsVUFBVSxFQUFFLDJDQUEyQztZQUN2RCxjQUFjLEVBQUUsNENBQTRDO1lBQzVELGdCQUFnQixFQUNkLGdMQUFnTDtZQUNsTCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsWUFBWSxFQUFFLDBDQUEwQztZQUN4RCxnQkFBZ0IsRUFBRSx3Q0FBd0M7WUFDMUQsV0FBVyxFQUFFLDZDQUE2QztZQUMxRCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRVcsa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsa0RBQWtEO1lBQ25FLFVBQVUsRUFBRSxpQ0FBaUM7WUFDN0MsY0FBYyxFQUFFLG9DQUFvQztZQUNwRCxnQkFBZ0IsRUFDZCxnTEFBZ0w7WUFDbEwsV0FBVyxFQUFFLHFDQUFxQztZQUNsRCxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFlBQVksRUFBRSxtQ0FBbUM7WUFDakQsZ0JBQWdCLEVBQUUsZ0NBQWdDO1lBQ2xELFdBQVcsRUFBRSxvQ0FBb0M7WUFDakQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsRUEvQ2dCLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBK0MxQjtBQUVELElBQWlCLGNBQWMsQ0FvQjlCO0FBcEJELFdBQWlCLGNBQWM7SUFDaEIsc0JBQU8sR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoQyxPQUFPLElBQUEsZUFBWSxFQUNqQixVQUFVLENBQUMsT0FBTyxFQUFFLEVBQ3BCLE1BQU0sc0JBQW1CLENBQUMsT0FBTyxFQUFFLENBQ3BDLENBQUM7SUFDSixDQUFDLENBQUM7SUFFVyxzQkFBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hDLE9BQU8sSUFBQSxlQUFZLEVBQ2pCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDcEIsTUFBTSxzQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FDcEMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUNXLHNCQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEMsT0FBTyxJQUFBLGVBQVksRUFDakIsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUNwQixNQUFNLHNCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUNwQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQXBCZ0IsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFvQjlCIn0=