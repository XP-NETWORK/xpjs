"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeHeartbeat = void 0;
const axios_1 = __importDefault(require("axios"));
function bridgeHeartbeat(baseURL) {
    const api = axios_1.default.create({
        baseURL,
    });
    return {
        async status() {
            const res = await api.get("/status");
            return res.data;
        },
    };
}
exports.bridgeHeartbeat = bridgeHeartbeat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvaGVhcnRiZWF0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQU8xQixTQUFnQixlQUFlLENBQUMsT0FBZTtJQUM3QyxNQUFNLEdBQUcsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE9BQU87S0FDUixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0wsS0FBSyxDQUFDLE1BQU07WUFDVixNQUFNLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQWEsU0FBUyxDQUFDLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQVhELDBDQVdDIn0=