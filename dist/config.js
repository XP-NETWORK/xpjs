"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactories = exports.AppConfigs = void 0;
const _1 = require(".");
var AppConfigs;
(function (AppConfigs) {
    AppConfigs.MainNet = () => {
        return {
            exchangeRateUri: "https://testing-bridge-staging.xp.network/exchange/",
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
            exchangeRateUri: "https://testnet-notifier.xp.network/ex/exchange/",
            nftListUri: "https://testnet-notifier.xp.network/testnet-indexer/",
            whitelistedUri: "https://testnet-notifier.xp.network/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
            txSocketUri: "https://testnet-tx-socket.herokuapp.com",
            tronScanUri: "https://apilist.tronscan.org/api/",
            heartbeatUri: "https://testnet-validator-pinger.herokuapp.com/",
            wrappedNftPrefix: "https://bridge-wnftapi.herokuapp.com/",
            scVerifyUri: "https://testnet-sc-verify.herokuapp.com",
            network: "testnet",
        };
    };
    AppConfigs.Staging = () => {
        return {
            exchangeRateUri: "https://testing-bridge-staging.xp.network/exchange/",
            nftListUri: "https://tools.xp.network/index",
            whitelistedUri: "https://tools.xp.network/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1Mjc5MTU1NiwiZXhwIjoxNjY4MzQzNTU2fQ.gOzLCBPNGFfjqLzSZsMes0yplAhsRiQYzidVfE-IYtQ-aVqQU6LhzKevLxYLudnm28F5_7CzTKsiuUginuLTtQ",
            txSocketUri: "https://bridge1.xp.network/tx-socket",
            tronScanUri: "https://apilist.tronscan.org/api/",
            heartbeatUri: "https://xpheartbeat.herokuapp.com",
            wrappedNftPrefix: "https://staging-nft.xp.network/w/",
            scVerifyUri: "https://bridge1.xp.network/sc-verify",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3QkFBaUU7QUFFakUsSUFBaUIsVUFBVSxDQStDMUI7QUEvQ0QsV0FBaUIsVUFBVTtJQUNaLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLHFEQUFxRDtZQUN0RSxVQUFVLEVBQUUscUNBQXFDO1lBQ2pELGNBQWMsRUFBRSwrQkFBK0I7WUFDL0MsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxXQUFXLEVBQUUsOEJBQThCO1lBQzNDLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSxrREFBa0Q7WUFDbkUsVUFBVSxFQUFFLHNEQUFzRDtZQUNsRSxjQUFjLEVBQUUsc0NBQXNDO1lBQ3RELGdCQUFnQixFQUNkLGdMQUFnTDtZQUNsTCxXQUFXLEVBQUUseUNBQXlDO1lBQ3RELFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsWUFBWSxFQUFFLGlEQUFpRDtZQUMvRCxnQkFBZ0IsRUFBRSx1Q0FBdUM7WUFDekQsV0FBVyxFQUFFLHlDQUF5QztZQUN0RCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRVcsa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUscURBQXFEO1lBQ3RFLFVBQVUsRUFBRSxnQ0FBZ0M7WUFDNUMsY0FBYyxFQUFFLDJCQUEyQjtZQUMzQyxnQkFBZ0IsRUFDZCxnTEFBZ0w7WUFDbEwsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFlBQVksRUFBRSxtQ0FBbUM7WUFDakQsZ0JBQWdCLEVBQUUsbUNBQW1DO1lBQ3JELFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsRUEvQ2dCLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBK0MxQjtBQUVELElBQWlCLGNBQWMsQ0FvQjlCO0FBcEJELFdBQWlCLGNBQWM7SUFDaEIsc0JBQU8sR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoQyxPQUFPLElBQUEsZUFBWSxFQUNqQixVQUFVLENBQUMsT0FBTyxFQUFFLEVBQ3BCLE1BQU0sc0JBQW1CLENBQUMsT0FBTyxFQUFFLENBQ3BDLENBQUM7SUFDSixDQUFDLENBQUM7SUFFVyxzQkFBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hDLE9BQU8sSUFBQSxlQUFZLEVBQ2pCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDcEIsTUFBTSxzQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FDcEMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUNXLHNCQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEMsT0FBTyxJQUFBLGVBQVksRUFDakIsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUNwQixNQUFNLHNCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUNwQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQXBCZ0IsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFvQjlCIn0=