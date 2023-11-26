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
            storageContract: "",
            storegeNetwork: "",
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
            storageContract: "0x0263A038014505881E33d4201950fa11c29793F3",
            storegeNetwork: "https://optimism-goerli.publicnode.com",
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
            storageContract: "",
            storegeNetwork: "",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3QkFBaUU7QUFFakUsSUFBaUIsVUFBVSxDQXFEMUI7QUFyREQsV0FBaUIsVUFBVTtJQUNaLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLGtEQUFrRDtZQUNuRSxVQUFVLEVBQUUscUNBQXFDO1lBQ2pELGNBQWMsRUFBRSwrQkFBK0I7WUFDL0MsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLDJCQUEyQjtZQUM3QyxXQUFXLEVBQUUsOEJBQThCO1lBQzNDLGVBQWUsRUFBRSxFQUFFO1lBQ25CLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxrQkFBTyxHQUFvQixHQUFHLEVBQUU7UUFDM0MsT0FBTztZQUNMLGVBQWUsRUFBRSxrREFBa0Q7WUFDbkUsVUFBVSxFQUFFLDJDQUEyQztZQUN2RCxjQUFjLEVBQUUsNENBQTRDO1lBQzVELGdCQUFnQixFQUNkLGdMQUFnTDtZQUNsTCxXQUFXLEVBQUUsNENBQTRDO1lBQ3pELFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsWUFBWSxFQUFFLDBDQUEwQztZQUN4RCxnQkFBZ0IsRUFBRSx3Q0FBd0M7WUFDMUQsV0FBVyxFQUFFLDZDQUE2QztZQUMxRCxlQUFlLEVBQUUsNENBQTRDO1lBQzdELGNBQWMsRUFBRSx3Q0FBd0M7WUFDeEQsT0FBTyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVXLGtCQUFPLEdBQW9CLEdBQUcsRUFBRTtRQUMzQyxPQUFPO1lBQ0wsZUFBZSxFQUFFLGtEQUFrRDtZQUNuRSxVQUFVLEVBQUUsaUNBQWlDO1lBQzdDLGNBQWMsRUFBRSxvQ0FBb0M7WUFDcEQsZ0JBQWdCLEVBQ2QsZ0xBQWdMO1lBQ2xMLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxZQUFZLEVBQUUsbUNBQW1DO1lBQ2pELGdCQUFnQixFQUFFLGdDQUFnQztZQUNsRCxXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELGVBQWUsRUFBRSxFQUFFO1lBQ25CLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDLEVBckRnQixVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQXFEMUI7QUFFRCxJQUFpQixjQUFjLENBb0I5QjtBQXBCRCxXQUFpQixjQUFjO0lBQ2hCLHNCQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUU7UUFDaEMsT0FBTyxJQUFBLGVBQVksRUFDakIsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUNwQixNQUFNLHNCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUNwQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRVcsc0JBQU8sR0FBRyxLQUFLLElBQUksRUFBRTtRQUNoQyxPQUFPLElBQUEsZUFBWSxFQUNqQixVQUFVLENBQUMsT0FBTyxFQUFFLEVBQ3BCLE1BQU0sc0JBQW1CLENBQUMsT0FBTyxFQUFFLENBQ3BDLENBQUM7SUFDSixDQUFDLENBQUM7SUFDVyxzQkFBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2hDLE9BQU8sSUFBQSxlQUFZLEVBQ2pCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDcEIsTUFBTSxzQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FDcEMsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUMsRUFwQmdCLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBb0I5QiJ9