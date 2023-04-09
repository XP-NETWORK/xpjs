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
    //   if (
    //     (fromType === ChainType.EVM && toType === ChainType.TEZOS) ||
    //     (fromType === ChainType.TEZOS && toType === ChainType.EVM)
    //   ) {
    //     throw defaultMintError;
    //   }
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