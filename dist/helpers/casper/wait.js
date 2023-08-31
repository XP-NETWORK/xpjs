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
            console.log("bf");
            const [_, raw] = await client.getDeploy(deployHash);
            console.log("af");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXJzL2Nhc3Blci93YWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVPLE1BQU0sS0FBSyxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQUU7SUFDbEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQztBQUZXLFFBQUEsS0FBSyxTQUVoQjtBQUNLLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxNQUFvQixFQUFFLFVBQWtCLEVBQUUsRUFBRTtJQUMxRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDZCxJQUFJO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLGFBQWE7Z0JBQ2IsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtvQkFDM0MsT0FBTyxHQUFHLENBQUM7aUJBQ1o7cUJBQU07b0JBQ0wsYUFBYTtvQkFDYixNQUFNLEtBQUssQ0FDVCxzQkFBc0I7d0JBQ3BCLGFBQWE7d0JBQ2IsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUN4RCxDQUFDO2lCQUNIO2FBQ0Y7aUJBQU07Z0JBQ0wsQ0FBQyxFQUFFLENBQUM7Z0JBQ0osTUFBTSxJQUFBLGFBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEIsU0FBUzthQUNWO1NBQ0Y7UUFBQyxPQUFPLENBQU0sRUFBRTtZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsRUFBRTtnQkFDM0QsQ0FBQyxFQUFFLENBQUM7Z0JBQ0osTUFBTSxJQUFBLGFBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEIsU0FBUzthQUNWO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxDQUFDO2FBQ1Q7U0FDRjtLQUNGO0lBQ0QsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFDO0FBcENXLFFBQUEsU0FBUyxhQW9DcEIifQ==