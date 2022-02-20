"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWrappedNft = exports.extractWrappedMetadata = exports.TransactionStatus = exports.ConcurrentSendError = void 0;
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
async function isWrappedNft(nft) {
    var _a;
    return typeof ((_a = (await axios_1.default.get(nft.uri).catch(() => undefined))) === null || _a === void 0 ? void 0 : _a.data.wrapped) !== "undefined";
}
exports.isWrappedNft = isWrappedNft;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxrREFBMEI7QUE0TjFCLFNBQWdCLG1CQUFtQjtJQUNqQyxPQUFPLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUZELGtEQUVDO0FBc0JELElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtJQUNuQix3Q0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFLNUI7QUFrREQsU0FBZ0Isc0JBQXNCLENBQ3BDLEdBQWlCO0lBRWpCLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7UUFDN0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4RDtTQUFNO1FBQ0wsT0FBTyxlQUFLO2FBQ1QsR0FBRyxDQUFzQyxHQUFHLENBQUMsR0FBRyxDQUFDO2FBQ2pELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCO0FBQ0gsQ0FBQztBQVZELHdEQVVDO0FBTU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxHQUFxQjs7SUFDckQsT0FBTyxPQUFPLENBQUEsTUFBQSxDQUFDLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDBDQUFFLElBQUksQ0FBQyxPQUFPLENBQUEsS0FBSyxXQUFXLENBQUM7QUFDakcsQ0FBQztBQUZELG9DQUVDIn0=