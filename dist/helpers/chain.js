"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWrappedNft = exports.TransactionStatus = exports.ConcurrentSendError = void 0;
const axios_1 = __importDefault(require("axios"));
function ConcurrentSendError() {
    return new Error("concurrent_send");
}
exports.ConcurrentSendError = ConcurrentSendError;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILURE"] = "failure";
    TransactionStatus["UNKNOWN"] = "unknown";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
async function isWrappedNft(nft) {
    return (typeof (await axios_1.default.get(nft.uri).catch(() => undefined))?.data.wrapped !==
        "undefined");
}
exports.isWrappedNft = isWrappedNft;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFvSTFCLFNBQWdCLG1CQUFtQjtJQUNqQyxPQUFPLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUZELGtEQUVDO0FBa0JELElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7QUFzRE0sS0FBSyxVQUFVLFlBQVksQ0FBQyxHQUFxQjtJQUN0RCxPQUFPLENBQ0wsT0FBTyxDQUFDLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU87UUFDdEUsV0FBVyxDQUNaLENBQUM7QUFDSixDQUFDO0FBTEQsb0NBS0MifQ==