"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTokenId = exports.getDefaultContract = exports.checkBlockedContracts = exports._headers = void 0;
const consts_1 = require("../consts");
exports._headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
};
function checkBlockedContracts(to, contract) {
    const chain = consts_1.CHAIN_INFO.get(to);
    if (chain?.rejectUnfreeze && chain?.rejectUnfreeze.includes(contract)) {
        throw new Error(`Transfering to ${chain.name} is prohibited by the NFT project team`);
    }
}
exports.checkBlockedContracts = checkBlockedContracts;
function getDefaultContract(nft, fromChain, toChain) {
    const defaultMintError = new Error(`Transfer has been canceled. The NFT you are trying to send will be minted with a default NFT collection`);
    const from = fromChain.getNonce();
    const to = toChain.getNonce();
    const fromType = consts_1.CHAIN_INFO.get(from)?.type;
    const toType = consts_1.CHAIN_INFO.get(to)?.type;
    const contract = 
    //@ts-ignore contractType is checked
    "contractType" in nft.native &&
        //@ts-ignore contractType is checked
        nft.native.contractType === "ERC1155" &&
        toChain.XpNft1155
        ? toChain.XpNft1155
        : toChain.XpNft;
    if (typeof window !== "undefined" &&
        (/(allowDefaultMint=true)/.test(window.location.search) ||
            /testnet/.test(window.location.pathname))) {
        return contract;
    }
    if ((from === consts_1.Chain.VECHAIN && toType === consts_1.ChainType.EVM) ||
        (to === consts_1.Chain.VECHAIN && fromType === consts_1.ChainType.EVM)) {
        throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.ELROND) ||
        (fromType === consts_1.ChainType.ELROND && toType === consts_1.ChainType.EVM)) {
        throw defaultMintError;
    }
    if ((fromType === consts_1.ChainType.EVM && toType === consts_1.ChainType.TEZOS) ||
        (fromType === consts_1.ChainType.TEZOS && toType === consts_1.ChainType.EVM)) {
        throw defaultMintError;
    }
    if (from === consts_1.Chain.SECRET) {
        throw defaultMintError;
    }
    if (fromType === consts_1.ChainType.TRON) {
        throw defaultMintError;
    }
    return contract;
}
exports.getDefaultContract = getDefaultContract;
function prepareTokenId(nft, from) {
    const tokenId = 
    //@ts-ignore
    nft.native && "tokenId" in nft.native && nft.native.tokenId.toString();
    if (tokenId) {
        const notNumber = isNaN(Number(tokenId));
        if (notNumber) {
            if (from === consts_1.Chain.ELROND) {
                if (nft.native.nonce)
                    return String(nft.native.nonce);
                const hex = tokenId.split("-")?.at(2);
                return String(hex ? parseInt(hex, 16) : "");
            }
            if (from === consts_1.Chain.TON || from === consts_1.Chain.SECRET) {
                return "1";
            }
        }
        else {
            return tokenId;
        }
    }
    return undefined;
}
exports.prepareTokenId = prepareTokenId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxzQ0FBeUQ7QUFFNUMsUUFBQSxRQUFRLEdBQUc7SUFDdEIsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyxNQUFNLEVBQUUsS0FBSztDQUNkLENBQUM7QUFFRixTQUFnQixxQkFBcUIsQ0FBQyxFQUFPLEVBQUUsUUFBZ0I7SUFDN0QsTUFBTSxLQUFLLEdBQUcsbUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLEVBQUUsY0FBYyxJQUFJLEtBQUssRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQ2Isa0JBQWtCLEtBQUssQ0FBQyxJQUFJLHdDQUF3QyxDQUNyRSxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBUEQsc0RBT0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7SUFFMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssQ0FDaEMseUdBQXlHLENBQzFHLENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTlCLE1BQU0sUUFBUSxHQUFHLG1CQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQztJQUM1QyxNQUFNLE1BQU0sR0FBRyxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7SUFFeEMsTUFBTSxRQUFRO0lBQ1osb0NBQW9DO0lBQ3BDLGNBQWMsSUFBSSxHQUFHLENBQUMsTUFBTTtRQUM1QixvQ0FBb0M7UUFDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZ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