"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigs = void 0;
var AppConfigs;
(function (AppConfigs) {
    AppConfigs.MainNet = () => {
        return {
            exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
            nftListUri: "https://nft-index.xp.network/index/",
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
            exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
            nftListUri: "https://testnet-notifier.xp.network/testnet-indexer/",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTY1MjA4NzAwNiwiZXhwIjoxNjU5ODYzMDA2fQ.ERjXpljkyuklPTJCSXQXZ-Wh09oxQwA4u8HKIbIwO1TSajvLIlNgxseqBVEd5D4lkqXYGwcezkuezuRc3kKkKg",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxJQUFpQixVQUFVLENBNEMxQjtBQTVDRCxXQUFpQixVQUFVO0lBQ1osa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsNkNBQTZDO1lBQzlELFVBQVUsRUFBRSxxQ0FBcUM7WUFDakQsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxXQUFXLEVBQUUsOEJBQThCO1lBQzNDLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSw2Q0FBNkM7WUFDOUQsVUFBVSxFQUFFLHNEQUFzRDtZQUNsRSxnQkFBZ0IsRUFDZCxnTEFBZ0w7WUFDbEwsV0FBVyxFQUFFLHlDQUF5QztZQUN0RCxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFlBQVksRUFBRSxpREFBaUQ7WUFDL0QsZ0JBQWdCLEVBQUUsMENBQTBDO1lBQzVELFdBQVcsRUFBRSx5Q0FBeUM7WUFDdEQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVXLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLDZDQUE2QztZQUM5RCxVQUFVLEVBQUUsZ0NBQWdDO1lBQzVDLGdCQUFnQixFQUNkLGdMQUFnTDtZQUNsTCxXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsWUFBWSxFQUFFLG1DQUFtQztZQUNqRCxnQkFBZ0IsRUFBRSxtQ0FBbUM7WUFDckQsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQTVDZ0IsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUE0QzFCIn0=