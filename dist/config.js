"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigs = void 0;
var AppConfigs;
(function (AppConfigs) {
    AppConfigs.MainNet = () => {
        return {
            exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
            nftListUri: "https://indexnft.herokuapp.com",
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
            scVerifyUri: "https://sc-verify.xp.network",
            network: "testnet",
        };
    };
})(AppConfigs = exports.AppConfigs || (exports.AppConfigs = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxJQUFpQixVQUFVLENBNkIxQjtBQTdCRCxXQUFpQixVQUFVO0lBQ1osa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsNkNBQTZDO1lBQzlELFVBQVUsRUFBRSxnQ0FBZ0M7WUFDNUMsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxXQUFXLEVBQUUsOEJBQThCO1lBQzNDLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSw2Q0FBNkM7WUFDOUQsVUFBVSxFQUFFLHNEQUFzRDtZQUNsRSxnQkFBZ0IsRUFDZCxnTEFBZ0w7WUFDbEwsV0FBVyxFQUFFLHlDQUF5QztZQUN0RCxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFlBQVksRUFBRSxpREFBaUQ7WUFDL0QsZ0JBQWdCLEVBQUUsMENBQTBDO1lBQzVELFdBQVcsRUFBRSw4QkFBOEI7WUFDM0MsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsRUE3QmdCLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBNkIxQiJ9