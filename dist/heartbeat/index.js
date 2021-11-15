"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeHeartbeat = void 0;
const axios_1 = __importDefault(require("axios"));
function bridgeHeartbeat(baseURL) {
    const api = axios_1.default.create({
        baseURL
    });
    return {
        async status() {
            const res = await api.get("/status");
            return res.data;
        }
    };
}
exports.bridgeHeartbeat = bridgeHeartbeat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVhcnRiZWF0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQU8xQixTQUFnQixlQUFlLENBQzNCLE9BQWU7SUFFZixNQUFNLEdBQUcsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3JCLE9BQU87S0FDVixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0gsS0FBSyxDQUFDLE1BQU07WUFDUixNQUFNLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQWEsU0FBUyxDQUFDLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7S0FDSixDQUFBO0FBQ0wsQ0FBQztBQWJELDBDQWFDIn0=