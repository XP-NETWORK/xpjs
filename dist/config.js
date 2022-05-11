"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigs = void 0;
var AppConfigs;
(function (AppConfigs) {
    AppConfigs.MainNet = () => {
        return {
            exchangeRateUri: "https://testing-bridge.xp.network/exchange/",
            nftListUri: "https://indexnft.herokuapp.com",
            nftListAuthToken: "eyJhbGciOiJFUzI1NiJ9.eyJhdXRob3JpdHkiOjEsImlhdCI6MTYzODk2MjMzOCwiZXhwIjoxNjQ2NzM4MzM4fQ.9eQMNMtt-P6myPlji7nBC9PAwTftd0qQvwnIZSt4ycM4E45NpzCF0URsdYj_YN_xqQKQpcHiZu1o4EXjJa_-Zw",
            txSocketUri: "https://transaction-socket.xp.network",
            tronScanUri: "https://apilist.tronscan.org/api/",
            heartbeatUri: "https://xpheartbeat.herokuapp.com",
            wrappedNftPrefix: "https://nft.xp.network/w/",
            network: "mainnet"
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
            network: "testnet"
        };
    };
})(AppConfigs = exports.AppConfigs || (exports.AppConfigs = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxJQUFpQixVQUFVLENBMkIxQjtBQTNCRCxXQUFpQixVQUFVO0lBQ1osa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsNkNBQTZDO1lBQzlELFVBQVUsRUFBRSxnQ0FBZ0M7WUFDNUMsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBQ1csa0JBQU8sR0FBb0IsR0FBRyxFQUFFO1FBQzNDLE9BQU87WUFDTCxlQUFlLEVBQUUsNkNBQTZDO1lBQzlELFVBQVUsRUFBRSxzREFBc0Q7WUFDbEUsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx5Q0FBeUM7WUFDdEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsaURBQWlEO1lBQy9ELGdCQUFnQixFQUFFLDBDQUEwQztZQUM1RCxPQUFPLEVBQUUsU0FBUztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyxFQTNCZ0IsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUEyQjFCIn0=