"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whitelistedService = void 0;
const axios_1 = __importDefault(require("axios"));
const whitelistedService = (appConfig) => {
    return axios_1.default.create({
        baseURL: appConfig.whitelistedUri,
    });
};
exports.whitelistedService = whitelistedService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hpdGVsaXN0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvd2hpdGVsaXN0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0Esa0RBQTZDO0FBSXRDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxTQUFvQixFQUFFLEVBQUU7SUFDekQsT0FBTyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2xCLE9BQU8sRUFBRSxTQUFTLENBQUMsY0FBYztLQUNsQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFKVyxRQUFBLGtCQUFrQixzQkFJN0IifQ==