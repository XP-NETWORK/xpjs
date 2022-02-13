"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractWrappedMetadata = exports.TransactionStatus = exports.ConcurrentSendError = void 0;
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
function extractWrappedMetadata(nft) {
    if (nft.native.meta && nft.native.meta.token.metadata.wrapped) {
        return Promise.resolve(nft.native.meta.token.metadata);
    }
    else {
        return axios_1.default
            .get(nft.uri)
            .then((v) => v.data);
    }
}
exports.extractWrappedMetadata = extractWrappedMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxrREFBMEI7QUEyTjFCLFNBQWdCLG1CQUFtQjtJQUNqQyxPQUFPLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUZELGtEQUVDO0FBc0JELElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7QUFLRCxTQUFnQixzQkFBc0IsQ0FDcEMsR0FBaUI7SUFFakIsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtRQUM3RCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3hEO1NBQU07UUFDTCxPQUFPLGVBQUs7YUFDVCxHQUFHLENBQXNDLEdBQUcsQ0FBQyxHQUFHLENBQUM7YUFDakQsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEI7QUFDSCxDQUFDO0FBVkQsd0RBVUMifQ==