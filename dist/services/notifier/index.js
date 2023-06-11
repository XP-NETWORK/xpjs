"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evNotifier = void 0;
const axios_1 = __importDefault(require("axios"));
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
            const error = new Error("Failed to deploy contract. Please come back later");
            error.name = "FAIL";
            const res = (await api
                .post("/collection-contract", {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvbm90aWZpZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQTBCO0FBVzFCLFNBQWdCLFVBQVUsQ0FBQyxHQUFXO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLGVBQUssQ0FBQyxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLEdBQUc7S0FDYixDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0wsS0FBSyxDQUFDLHFCQUFxQixDQUFDLGlCQUF5QixFQUFFLFVBQWtCO1lBQ3ZFLE1BQU0sR0FBRyxHQUFHLENBQ1YsTUFBTSxHQUFHO2lCQUNOLEdBQUcsQ0FDRix3QkFBd0IsaUJBQWlCLElBQUksVUFBVSxFQUFFLENBQzFEO2lCQUNBLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDdEMsQ0FBQyxJQUFJLENBQUM7WUFFUCxJQUFJLEdBQUcsRUFBRSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUM3QixPQUFPLEdBQUcsQ0FBQyxlQUFlLENBQUM7YUFDNUI7WUFFRCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxLQUFLLENBQUMsd0JBQXdCLENBQzVCLGlCQUF5QixFQUN6QixVQUFrQixFQUNsQixJQUFZO1lBRVosTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQ3JCLG1EQUFtRCxDQUNwRCxDQUFDO1lBQ0YsS0FBSyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDcEIsTUFBTSxHQUFHLEdBQUcsQ0FDVixNQUFNLEdBQUc7aUJBQ04sSUFBSSxDQUE2QixzQkFBc0IsRUFBRTtnQkFDeEQsVUFBVTtnQkFDVixpQkFBaUI7Z0JBQ2pCLElBQUk7YUFDTCxDQUFDO2lCQUNELEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNB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