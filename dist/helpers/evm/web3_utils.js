"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrapped = exports.txnUnderpricedPolyWorkaround = void 0;
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const txnUnderpricedPolyWorkaround = async (utx) => {
    const res = await axios_1.default
        .get("https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata")
        .catch(async () => {
        return await axios_1.default.get("https://gasstation-mainnet.matic.network/v2");
    });
    const { result, fast } = res.data;
    const trackerGas = result?.rapidgaspricegwei || fast?.maxFee;
    if (trackerGas) {
        const sixtyGwei = ethers_1.ethers.utils.parseUnits(Math.ceil(trackerGas).toString(), "gwei");
        utx.maxFeePerGas = sixtyGwei;
        utx.maxPriorityFeePerGas = sixtyGwei;
    }
};
exports.txnUnderpricedPolyWorkaround = txnUnderpricedPolyWorkaround;
const getWrapped = async (uri) => {
    return (await axios_1.default.get(uri).catch(() => ({ data: undefined }))).data
        ?.wrapped;
};
exports.getWrapped = getWrapped;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViM191dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2V2bS93ZWIzX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQUMxQixtQ0FBc0Q7QUFFL0MsTUFBTSw0QkFBNEIsR0FBRyxLQUFLLEVBQy9DLEdBQXlCLEVBQ3pCLEVBQUU7SUFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLGVBQUs7U0FDcEIsR0FBRyxDQUNGLGlGQUFpRixDQUNsRjtTQUNBLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNoQixPQUFPLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQ3hFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQ2xDLE1BQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxpQkFBaUIsSUFBSSxJQUFJLEVBQUUsTUFBTSxDQUFDO0lBRTdELElBQUksVUFBVSxFQUFFO1FBQ2QsTUFBTSxTQUFTLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQ2hDLE1BQU0sQ0FDUCxDQUFDO1FBQ0YsR0FBRyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7UUFDN0IsR0FBRyxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztLQUN0QztBQUNILENBQUMsQ0FBQztBQXJCVyxRQUFBLDRCQUE0QixnQ0FxQnZDO0FBRUssTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQzlDLE9BQU8sQ0FBQyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNuRSxFQUFFLE9BQU8sQ0FBQztBQUNkLENBQUMsQ0FBQztBQUhXLFFBQUEsVUFBVSxjQUdyQiJ9