"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWrappedNft = exports.checkNotOldWrappedNft = exports.prepareTokenId = exports.getDefaultContract = exports.checkBlockedContracts = exports.oldXpWraps = exports._headers = void 0;
const consts_1 = require("../consts");
const axios_1 = __importDefault(require("axios"));
exports._headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
};
exports.oldXpWraps = new Set([
    "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
    "0xc69ECD37122A9b5FD7e62bC229d478BB83063C9d",
    "0xe12B16FFBf7D79eb72016102F3e3Ae6fe03fCA56",
    "0xa1B8947Ff4C1fD992561F629cfE67aEb90DfcBd5",
    "0x09F4e56187541f2bC660B0810cA509D2f8c65c96",
    "0x8B2957DbDC69E158aFceB9822A2ff9F2dd5BcD65",
    "0xE773Be36b35e7B58a9b23007057b5e2D4f6686a1",
    "0xFC2b3dB912fcD8891483eD79BA31b8E5707676C9",
    "0xb4A252B3b24AF2cA83fcfdd6c7Fac04Ff9d45A7D",
]);
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
function checkNotOldWrappedNft(contract) {
    if (exports.oldXpWraps.has(contract)) {
        throw new Error(`${contract} is an old wrapped NFT`);
    }
}
exports.checkNotOldWrappedNft = checkNotOldWrappedNft;
async function isWrappedNft(nft, fc, tc) {
    if (fc === consts_1.Chain.TEZOS) {
        return {
            bool: typeof nft.native.meta?.token?.metadata?.wrapped !==
                "undefined",
            wrapped: undefined,
        };
    }
    try {
        checkNotOldWrappedNft(nft.collectionIdent);
    }
    catch (_) {
        return { bool: false, wrapped: undefined };
    }
    if (/w\/$/.test(nft.uri)) {
        nft = {
            ...nft,
            uri: nft.uri + nft.native.tokenId,
        };
    }
    const wrapped = (await axios_1.default.get(nft.uri).catch(() => undefined))?.data
        .wrapped;
    const contract = wrapped?.contract || wrapped?.source_mint_ident;
    tc && contract && checkBlockedContracts(tc, contract);
    return { bool: typeof wrapped !== "undefined", wrapped };
}
exports.isWrappedNft = isWrappedNft;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxzQ0FBeUQ7QUFDekQsa0RBQTBCO0FBRWIsUUFBQSxRQUFRLEdBQUc7SUFDdEIsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyxNQUFNLEVBQUUsS0FBSztDQUNkLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNoQyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztDQUM3QyxDQUFDLENBQUM7QUFFSCxTQUFnQixxQkFBcUIsQ0FBQyxFQUFPLEVBQUUsUUFBZ0I7SUFDN0QsTUFBTSxLQUFLLEdBQUcsbUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLEVBQUUsY0FBYyxJQUFJLEtBQUssRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQ2Isa0JBQWtCLEtBQUssQ0FBQyxJQUFJLHdDQUF3QyxDQUNyRSxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBUEQsc0RBT0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FDaEMsR0FBcUIsRUFDckIsU0FBNEMsRUFDNUMsT0FBMEM7SUFFMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssQ0FDaEMseUdBQXlHLENBQzFHLENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTlCLE1BQU0sUUFBUSxHQUFHLG1CQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FB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