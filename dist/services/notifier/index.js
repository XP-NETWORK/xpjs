"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evNotifier = void 0;
const axios_1 = __importDefault(require("axios"));
const __1 = require("../..");
function evNotifier(url) {
    const api = axios_1.default.create({
        baseURL: url,
    });
    return {
        async getCollectionContract(collectionAddress, chainNonce) {
            const res = (await api
                .get(`/collection-contract/${collectionAddress}/${chainNonce}`)
                .catch(() => ({ data: undefined }))).data;
            if (res?.status === "SUCCESS") {
                return res.contractAddress;
            }
            return "";
        },
        async createCollectionContract(collectionAddress, chainNonce, type) {
            const ethereum = chainNonce === __1.Chain.ETHEREUM;
            const error = new Error("Failed to deploy contract. Please come back later");
            error.name = "FAIL";
            const res = (await api
                .post(`/${ethereum ? "eth-" : ""}collection-contract`, {
                chainNonce,
                collectionAddress,
                type,
            })
                .catch(() => ({ data: undefined }))).data;
            if (res?.status === "SUCCESS") {
                let contractAddress = res?.contractAddress || "";
                let timedOut = false;
                const errorTimeout = setTimeout(() => {
                    timedOut = true;
                }, 150000);
                while (!contractAddress && !timedOut) {
                    await new Promise((r) => setTimeout(r, 2300));
                    contractAddress = await this.getCollectionContract(collectionAddress, chainNonce);
                }
                clearTimeout(errorTimeout);
                if (timedOut && !contractAddress)
                    throw error;
                return contractAddress;
            }
            throw error;
        },
        async notifyWeb3(fromChain, fromHash, actionId, type, toChain, txFees, senderAddress, targetAddress, nftUri, tokenId, contract) {
            await api.post("/tx/web3", {
                chain_nonce: fromChain,
                tx_hash: fromHash,
                actionId,
                type,
                toChain,
                txFees,
                senderAddress,
                targetAddress,
                nftUri,
                tokenId,
                contract,
            });
        },
        async notifyTron(txHash) {
            await api.post("/tx/tron", {
                tx_hash: txHash,
            });
        },
        async notifyElrond(txHash, sender, uris, action_id) {
            await api.post("/tx/elrond", {
                tx_hash: txHash,
                sender,
                uris,
                action_id,
            });
        },
        async notifyTezos(txHash) {
            await api.post("/tx/tezos", {
                tx_hash: txHash,
            });
        },
        async notifyAlgorand(txHash) {
            await api.post("/tx/algorand", {
                tx_hash: txHash,
            });
        },
        async notifySecret(txHash, vk) {
            await api.post("/tx/scrt", { tx_hash: txHash, vk: vk });
        },
        async notifySolana(txHash) {
            await api.post("/tx/solana", { tx_hash: txHash });
        },
        async notifyNear(txHash) {
            await api.post("/tx/near", { tx_hash: txHash });
        },
        async notifyDfinity(actionId) {
            await api.post("/tx/dfinity", { action_id: actionId });
        },
        async notifyTon(txHash) {
            await api.post("/tx/ton", { tx_hash: txHash });
        },
        async notifyAptos(txHash) {
            await api.post("/tx/aptos", { tx_hash: txHash });
        },
        async notifyEVM(nonce, address) {
            await api.post("/whitelist", {
                contract: address,
                chain_nonce: nonce,
            });
        },
    };
}
exports.evNotifier = evNotifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvbm90aWZpZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLDZCQUE4QjtBQVc5QixTQUFnQixVQUFVLENBQUMsR0FBVztJQUNwQyxNQUFNLEdBQUcsR0FBRyxlQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE9BQU8sRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsT0FBTztRQUNMLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBeUIsRUFBRSxVQUFrQjtZQUN2RSxNQUFNLEdBQUcsR0FBRyxDQUNWLE1BQU0sR0FBRztpQkFDTixHQUFHLENBQ0Ysd0JBQXdCLGlCQUFpQixJQUFJLFVBQVUsRUFBRSxDQUMxRDtpQkFDQSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3RDLENBQUMsSUFBSSxDQUFDO1lBRVAsSUFBSSxHQUFHLEVBQUUsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDN0IsT0FBTyxHQUFHLENBQUMsZUFBZSxDQUFDO2FBQzVCO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBQ0QsS0FBSyxDQUFDLHdCQUF3QixDQUM1QixpQkFBeUIsRUFDekIsVUFBa0IsRUFDbEIsSUFBWTtZQUVaLE1BQU0sUUFBUSxHQUFHLFVBQVUsS0FBSyxTQUFLLENBQUMsUUFBUSxDQUFDO1lBQy9DLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUNyQixtREFBbUQsQ0FDcEQsQ0FBQztZQUNGLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxHQUFHLENBQ1YsTUFBTSxHQUFHO2lCQUNOLElBQUksQ0FDSCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFF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