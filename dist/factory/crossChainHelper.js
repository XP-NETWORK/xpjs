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
    return cToP;
}
function ChainFactory(chainParams) {
    let map = new Map();
    let cToP = mapNonceToParams(chainParams);
    const inner = async (chainNonce) => {
        let helper = map.get(chainNonce);
        if (helper === undefined) {
            helper = await consts_1.CHAIN_INFO[chainNonce].constructor(cToP.get(chainNonce));
        }
        return helper;
    };
    return {
        inner,
        // TODO: Find some way to make this more generic, return a txn receipt, throw an exception, etc.
        transferNft: async (fromChain, toChain, nft, sender, receiver, validators) => {
            const fromHelper = await inner(fromChain);
            const estimate = await fromHelper.estimateValidateTransferNft(validators, receiver, nft);
            if (nft.chain === fromChain) {
                await fromHelper.transferNativeToForeign(sender, toChain, receiver, nft, estimate);
            }
            else {
                fromHelper.transferNftToForeign(sender, fromChain, receiver, nft, estimate);
            }
        },
        mint: async (chain, owner, args) => {
            chain.mintNft(owner, args);
        },
    };
}
exports.ChainFactory = ChainFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NDaGFpbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mYWN0b3J5L2Nyb3NzQ2hhaW5IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esc0NBQThDO0FBdUM5QyxTQUFTLGdCQUFnQixDQUN2QixXQUF3QjtJQUV4QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztJQUV2RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVuQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFnQixZQUFZLENBQUMsV0FBd0I7SUFDbkQsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7SUFDOUMsSUFBSSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFekMsTUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFFLFVBQWtCLEVBQTZCLEVBQUU7UUFDcEUsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxHQUFHLE1BQU0sbUJBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQyxDQUFDO1NBQzFFO1FBQ0QsT0FBTyxNQUFPLENBQUM7SUFDakIsQ0FBQyxDQUFDO0lBRUYsT0FBTztRQUNMLEtBQUs7UUFDTCxnR0FBZ0c7UUFDaEcsV0FBVyxFQUFFLEtBQUssRUFDaEIsU0FBZ0IsRUFDaEIsT0FBYyxFQUNkLEdBQVEsRUFDUixNQUFXLEVBQ1gsUUFBYSxFQUNiLFVBQWlCLEVBQ0YsRUFBRTtZQUNqQixNQUFNLFVBQVUsR0FBRyxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQywyQkFBMkIsQ0FDM0QsVUFBVSxFQUNWLFFBQVEsRUFDUixHQUFVLENBQ1gsQ0FBQztZQUVGLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQzNCLE1BQU0sVUFBVSxDQUFDLHVCQUF1QixDQUN0QyxNQUFNLEVBQ04sT0FBTyxFQUNQLFFBQVEsRUFDUixHQUFVLEVBQ1YsUUFBZ0UsQ0FDakUsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLFVBQVUsQ0FBQyxvQkFBb0IsQ0FDN0IsTUFBTSxFQUNOLFNBQVMsRUFDVCxRQUFRLEVBQ1IsR0FBVSxFQUNWLFFBQWdFLENBQ2pFLENBQUM7YUFDSDtRQUNILENBQUM7UUFDRCxJQUFJLEVBQUUsS0FBSyxFQUNULEtBQTZDLEVBQzdDLEtBQWEsRUFDYixJQUFpQixFQUNGLEVBQUU7WUFDakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBeERELG9DQXdEQyJ9