"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeploy = exports.sleep = void 0;
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const getDeploy = async (client, deployHash) => {
    let i = 300;
    while (i !== 0) {
        try {
            const [_, raw] = await client.getDeploy(deployHash);
            if (raw.execution_results.length !== 0) {
                // @ts-ignore
                if (raw.execution_results[0].result.Success) {
                    return raw;
                }
                else {
                    // @ts-ignore
                    throw Error("Contract execution: " +
                        // @ts-ignore
                        raw.execution_results[0].result.Failure.error_message);
                }
            }
            else {
                i--;
                await (0, exports.sleep)(4000);
                continue;
            }
        }
        catch (e) {
            console.log(e.message);
            if (e.message.match(/(deploy not known|no such deploy)/gim)) {
                i--;
                await (0, exports.sleep)(4000);
                continue;
            }
            else {
                throw e;
            }
        }
    }
    throw Error("Timeout after " + i + "s. Something's wrong");
};
exports.getDeploy = getDeploy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2Nhc3Blci93YWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVPLE1BQU0sS0FBSyxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUU7SUFDbEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQztBQUZXLFFBQUEsS0FBSyxTQUVoQjtBQUNLLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxNQUFvQixFQUFFLFVBQWtCLEVBQUUsRUFBRTtJQUMxRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDZCxJQUFJO1lBQ0YsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFcEQsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEMsYUFBYTtnQkFDYixJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO29CQUMzQyxPQUFPLEdBQUcsQ0FBQztpQkFDWjtxQkFBTTtvQkFDTCxhQUFhO29CQUNiLE1BQU0sS0FBSyxDQUNULHNCQUFzQjt3QkFDcEIsYUFBYTt3QkFDYixHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQ3hELENBQUM7aUJBQ0g7YUFDRjtpQkFBTTtnQkFDTCxDQUFDLEVBQUUsQ0FBQztnQkFDSixNQUFNLElBQUEsYUFBSyxFQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixTQUFTO2FBQ1Y7U0FDRjtRQUFDLE9BQU8sQ0FBTSxFQUFFO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFO2dCQUMzRCxDQUFDLEVBQUUsQ0FBQztnQkFDSixNQUFNLElBQUEsYUFBSyxFQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixTQUFTO2FBQ1Y7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLENBQUM7YUFDVDtTQUNGO0tBQ0Y7SUFDRCxNQUFNLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztBQUM3RCxDQUFDLENBQUM7QUFuQ1csUUFBQSxTQUFTLGFBbUNwQiJ9