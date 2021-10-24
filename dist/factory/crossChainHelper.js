"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainFactory = void 0;
const consts_1 = require("../consts");
function mapNonceToParams(chainParams) {
    const cToP = new Map();
    cToP.set(2, chainParams.elrondParams);
    cToP.set(3, chainParams.hecoParams);
    cToP.set(4, chainParams.bscParams);
    cToP.set(6, chainParams.avalancheParams);
    cToP.set(7, chainParams.polygonParams);
    cToP.set(8, chainParams.fantomParams);
    cToP.set(9, chainParams.tronParams);
    cToP.set(11, chainParams.celoParams);
    cToP.set(12, chainParams.harmonyParams);
    cToP.set(13, chainParams.ontologyParams);
    return cToP;
}
/**
 * This function is the basic entry point to use this package as a library.
 * @param chainParams: {@link ChainParams} Contains the details for all the chains to mint and transfer NFTs between them.
 * @returns {ChainFactory}: A factory object that can be used to mint and transfer NFTs between chains.
 */
function ChainFactory(chainParams) {
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    const inner = async (chain) => {
        let helper = map.get(chain);
        if (helper === undefined) {
            helper = await consts_1.CHAIN_INFO[chain].constructor(cToP.get(chain));
        }
        return helper;
    };
    return {
        inner,
        // TODO: Find some way to make this more generic, return a txn receipt, throw an exception, etc.
        transferNft: async (fromChain, toChain, nft, sender, receiver) => {
            const fromHelper = await inner(fromChain);
            const estimate = await fromHelper.estimateValidateTransferNft(receiver, nft);
            if (nft.chain === fromChain) {
                const transfer = await fromHelper.transferNativeToForeign(sender, toChain, receiver, nft, estimate);
                return transfer;
            }
            else {
                if (fromHelper.isWrappedNft(nft)) {
                    await fromHelper.unfreezeWrappedNft(sender, receiver, nft.id, estimate);
                    if (fromChain == toChain) {
                        return;
                    }
                    else {
                        const receipt = await fromHelper.transferNftToForeign(sender, fromChain, receiver, nft, estimate);
                        return receipt;
                    }
                }
            }
        },
        mint: async (chain, owner, args) => {
            return chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NDaGFpbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2Nyb3NzQ2hhaW5IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esc0NBQThDO0FBdUQ5QyxTQUFTLGdCQUFnQixDQUN2QixXQUF3QjtJQUV4QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztJQUV2RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBQ0Q7Ozs7R0FJRztBQUNILFNBQWdCLFlBQVksQ0FBQyxXQUF3QjtJQUNuRCxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztJQUM5QyxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QyxNQUFNLEtBQUssR0FBRyxLQUFLLEVBQUUsS0FBWSxFQUE2QixFQUFFO1FBQzlELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3hCLE1BQU0sR0FBRyxNQUFNLG1CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQztTQUNoRTtRQUNELE9BQU8sTUFBTyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLO1FBQ0wsZ0dBQWdHO1FBQ2hHLFdBQVcsRUFBRSxLQUFLLEVBQ2hCLFNBQWdCLEVBQ2hCLE9BQWMsRUFDZCxHQUFRLEVBQ1IsTUFBaUMsRUFDakMsUUFBMEIsRUFDWixFQUFFO1lBQ2hCLE1BQU0sVUFBVSxHQUFHLE1BQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVSxDQUFDLDJCQUEyQixDQUMzRCxRQUFRLEVBQ1IsR0FBRyxDQUNKLENBQUM7WUFDRixJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUMzQixNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyx1QkFBdUIsQ0FDdkQsTUFBTSxFQUNOLE9BQU8sRUFDUCxRQUFRLEVBQ1IsR0FBRyxFQUNILFFBQVEsQ0FDVCxDQUFDO2dCQUNGLE9BQU8sUUFBUSxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxVQUFVLENBQUMsa0JBQWtCLENBQ2pDLE1BQU0sRUFDTixRQUFRLEVBQ1IsR0FBRyxDQUFDLEVBQUUsRUFDTixRQUFRLENBQ1QsQ0FBQztvQkFDRixJQUFJLFNBQVMsSUFBSSxPQUFPLEVBQUU7d0JBQ3hCLE9BQU87cUJBQ1I7eUJBQU07d0JBQ0wsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsb0JBQW9CLENBQ25ELE1BQU0sRUFDTixTQUFTLEVBQ1QsUUFBUSxFQUNSLEdBQUcsRUFDSCxRQUFRLENBQ1QsQ0FBQzt3QkFDRixPQUFPLE9BQU8sQ0FBQztxQkFDaEI7aUJBQ0Y7YUFDRjtRQUNILENBQUM7UUFDRCxJQUFJLEVBQUUsS0FBSyxFQUNULEtBQXdDLEVBQ3hDLEtBQWEsRUFDYixJQUFpQixFQUNILEVBQUU7WUFDaEIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFuRUQsb0NBbUVDIn0=