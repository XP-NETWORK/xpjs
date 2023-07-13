"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBigInt = exports.isWrappedNft = exports.checkNotOldWrappedNft = exports.prepareTokenId = exports.getDefaultContract = exports.checkBlockedContracts = exports.oldXpWraps = exports._headers = void 0;
const consts_1 = require("../consts");
const axios_1 = __importDefault(require("axios"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
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
const randomBigInt = () => BigInt(new bignumber_js_1.default(Math.random() * 150000).integerValue().toString());
exports.randomBigInt = randomBigInt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmFjdG9yeS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxzQ0FBeUQ7QUFDekQsa0RBQTBCO0FBQzFCLGdFQUFxQztBQUV4QixRQUFBLFFBQVEsR0FBRztJQUN0QixjQUFjLEVBQUUsa0JBQWtCO0lBQ2xDLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQztBQUVXLFFBQUEsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ2hDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0lBQzVDLDRDQUE0QztJQUM1Qyw0Q0FBNEM7SUFDNUMsNENBQTRDO0NBQzdDLENBQUMsQ0FBQztBQUVILFNBQWdCLHFCQUFxQixDQUFDLEVBQU8sRUFBRSxRQUFnQjtJQUM3RCxNQUFNLEtBQUssR0FBRyxtQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQyxJQUFJLEtBQUssRUFBRSxjQUFjLElBQUksS0FBSyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDckUsTUFBTSxJQUFJLEtBQUssQ0FDYixrQkFBa0IsS0FBSyxDQUFDLElBQUksd0NBQXdDLENBQ3JFLENBQUM7S0FDSDtBQUNILENBQUM7QUFQRCxzREFPQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxHQUFxQixFQUNyQixTQUE0QyxFQUM1QyxPQUEwQztJQUUxQyxNQUFNLGdCQUFnQixHQUFHLElBQUksS0FBSyxDQUNoQyx5R0FBeUcsQ0FDMUcsQ0FBQztJQUVGLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUIsTUFBTSxRQUFRLEdBQUcsbUJBQVUsQ0FBQyxHQUFH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