"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tonHelper = void 0;
const anchor_1 = require("@project-serum/anchor");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const tonweb_1 = __importDefault(require("tonweb"));
const ton_1 = require("ton");
const consts_1 = require("../../consts");
const ton_bridge_1 = require("./ton-bridge");
const emitter_1 = require("../../services/emitter");
const js_base64_1 = require("js-base64");
const axios_1 = __importDefault(require("ton/node_modules/axios"));
const base64url_1 = __importDefault(require("base64url"));
const newton_1 = require("newton");
const v3types_1 = require("./v3types");
const consts_2 = require("../../consts");
let wl_prom;
async function tonHelper(args) {
    const bridge = new ton_bridge_1.BridgeContract(args.tonweb.provider, {
        address: args.bridgeAddr,
        burner: args.burnerAddr,
    });
    bridge.init();
    const ton = args.tonweb;
    ton.provider.sendBoc = (b) => ton.provider.send("sendBocReturnHash", { boc: b });
    async function waitTonTrx(exBodyMsg, value, address, msgType) {
        console.log(exBodyMsg, "TON:exBodyMsg");
        let body = "";
        let stop = false;
        let fastResolve;
        const setStop = () => {
            stop = true;
            emitter_1.Emitter?.removeEventListener("cancel tonKeeper", setStop);
            fastResolve(true);
            throw new Error("User has declined transaction");
        };
        const noTrx = setTimeout(() => {
            stop = true;
            throw new Error("waitTonTrx timeout");
        }, 60 * 1000 * 20);
        emitter_1.Emitter?.addEventListener("cancel tonKeeper", setStop);
        await new Promise((r) => {
            setTimeout(r, 10 * 1000);
        });
        async function getUserTrxs(address) {
            try {
                await new Promise((r) => {
                    setTimeout(r, 30 * 1000);
                });
                const trxs = await ton.provider.getTransactions(address, 20);
                return trxs;
            }
            catch (e) {
                console.log(e, "new iterration 30 sec");
                return await getUserTrxs(address);
            }
        }
        while (!body) {
            console.log("TON:tring to find the trx...");
            if (stop)
                return;
            //get last 20 trx of address
            const timeout = setTimeout(() => {
                throw new Error("TON: timeout when trying to send trx");
            }, 60 * 1000 * 10);
            const trxs = await getUserTrxs(address);
            if (trxs) {
                clearTimeout(timeout);
            }
            //find body of the trx
            body = trxs.find((trx) => {
                const messages = trx[msgType];
                let message = "";
                let msgVal = "";
                message = Array.isArray(messages)
                    ? messages?.at(0)?.msg_data?.body
                    : messages?.msg_data?.body;
                msgVal = Array.isArray(trx["out_msgs"])
                    ? trx.out_msgs?.at(0)?.value
                    : trx["out_msgs"].value;
                trx.utime * 1000 >= +new Date(Date.now() - 1000 * 60 * 5) &&
                    console.log(trx.utime, "trx happend no more than 5 minutes ago");
                return message === exBodyMsg && msgVal === value;
            })?.data;
        }
        clearTimeout(noTrx);
        const dict = ton_1.Cell.fromBoc(Buffer.from(body, "base64"))[0].hash();
        const exHash = dict.toString("base64");
        console.log(exHash, "exHash");
        let trxData = undefined;
        while (trxData === undefined) {
            await new Promise((r) => setTimeout(r, 6 * 1000));
            const res = await (0, axios_1.default)(`https://toncenter.com/api/index/getTransactionByHash?tx_hash=${encodeURIComponent(exHash)}&include_msg_body=true`).catch(() => undefined);
            trxData = res?.data;
        }
        return trxData[0]["in_msg"].hash;
    }
    return {
        preTransfer: () => Promise.resolve(true),
        preUnfreeze: () => Promise.resolve(true),
        getNonce: () => consts_1.Chain.TON,
        getExtraFees: (toNonce) => {
            const extra = args.extraFees.get(toNonce) || "0";
            return new bignumber_js_1.default(tonweb_1.default.utils.toNano(extra).toString(10));
        },
        XpNft: args.xpnftAddr,
        async balance(address) {
            return new bignumber_js_1.default(await ton.getBalance(address));
        },
        async estimateValidateTransferNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async estimateValidateUnfreezeNft() {
            return new bignumber_js_1.default(0); // TODO
        },
        async validateAddress(adr) {
            return tonweb_1.default.Address.isValid(adr);
        },
        getFeeMargin() {
            return args.feeMargin;
        },
        async transferNftToForeign(signer, chainNonce, to, nft, txFees, mintWith) {
            const rSigner = signer.wallet || ton;
            const txFeesFull = new anchor_1.BN(txFees.toString(10)).add(tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7)));
            const nftFee = tonweb_1.default.utils.toNano("0.07");
            const payload = await bridge.createFreezeBody({
                amount: txFeesFull.sub(nftFee),
                to: Buffer.from(to),
                chainNonce,
                mintWith: Buffer.from(mintWith),
            });
            console.log(txFeesFull.toString(10), "val");
            console.log("TON:transferNftToForeign");
            console.log(nft.native.nftItemAddr);
            const res = (await rSigner.send("ton_sendTransaction", {
                value: txFeesFull.toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            const hash = await rSigner.handleResponse(res);
            await args.notifier.notifyTon(hash);
            return hash;
        },
        async unfreezeWrappedNft(signer, to, nft, _txFees, chainNonce) {
            const rSigner = signer.wallet || ton;
            const value = new anchor_1.BN(_txFees.toString(10)).add(tonweb_1.default.utils.toNano((Math.random() * 0.01).toFixed(7)));
            const nftFee = tonweb_1.default.utils.toNano("0.05");
            const payload = await bridge.createWithdrawBody({
                to: new Uint8Array(Buffer.from(to)),
                chainNonce: chainNonce,
                txFees: value.sub(nftFee),
            });
            console.log(value.toString(10), "v");
            console.log(nft.native.nftItemAddr);
            console.log("TON:unfreezeWrappedNft");
            const res = (await rSigner.send("ton_sendTransaction", {
                value: new anchor_1.BN(value).toString(10),
                to: nft.native.nftItemAddr,
                data: payload,
            }));
            const hash = await rSigner.handleResponse(res);
            await args.notifier.notifyTon(hash);
            return hash;
        },
        tonKeeperWrapper(args) {
            console.log(args, "args");
            let payload = "";
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            payload = (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false));
                            value = params.value;
                            return args.wallet.send(`https://app.tonkeeper.com/transfer/${params.to}?amount=${new anchor_1.BN(value).toString(10)}&bin=${encodeURIComponent(payload)}&open=1`);
                        //!
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    console.log(res);
                    const result = await waitTonTrx(payload, value, args.config.address, "out_msgs");
                    args.wallet.onSuccess && args.wallet.onSuccess();
                    return result;
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonWalletWrapper(args) {
            let payload = "";
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            value = params.value;
                            payload = (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false));
                            console.log(payload, "payload");
                            return await args.wallet.send("ton_sendTransaction", [
                                {
                                    to: params.to,
                                    value,
                                    dataType: "boc",
                                    data: payload,
                                },
                            ]);
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    return (res &&
                        (await waitTonTrx(payload, value, args.config.address, "out_msgs")));
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonHubWrapper(args) {
            let value = "";
            const tonHub = {
                async send(method, params) {
                    switch (method) {
                        case "ton_sendTransaction":
                            value = new anchor_1.BN(params.value).toString();
                            return await args.wallet.requestTransaction({
                                seed: args.config.seed,
                                appPublicKey: args.config.appPublicKey,
                                to: params.to,
                                value,
                                timeout: 5 * 60 * 1000,
                                text: `ton_sendTransaction to ${params.to}`,
                                payload: (0, js_base64_1.fromUint8Array)(await params.data.toBoc(false)),
                            });
                        default:
                            return null;
                    }
                },
                async handleResponse(res) {
                    if (res.type === "success" && res.response != undefined) {
                        return await waitTonTrx(res.response, value, args.config.address, "in_msg");
                    }
                    else {
                        throw new Error(`TonHub:${res.type}`);
                    }
                },
            };
            return {
                wallet: tonHub,
                accIdx: 0,
            };
        },
        tonKpWrapper(kp) {
            const wallet = new tonweb_1.default.Wallets.all.v3R2(ton.provider, {
                publicKey: kp.publicKey,
                wc: 0,
            });
            const wWallet = {
                async send(method, params) {
                    switch (method) {
                        case "ton_getBalance":
                            return await ton.getBalance(await wallet.getAddress());
                        case "ton_requestAccounts":
                            return [await wallet.getAddress()];
                        case "ton_sendTransaction":
                            return await wallet.methods
                                .transfer({
                                secretKey: kp.secretKey,
                                toAddress: params.to,
                                amount: new anchor_1.BN(params.value),
                                seqno: (await wallet.methods.seqno().call()) || 0,
                                sendMode: 3,
                                payload: params.data,
                            })
                                .send();
                    }
                },
                async handleResponse(res) {
                    return res.hash;
                },
            };
            return {
                wallet: wWallet,
                accIdx: 0,
            };
        },
        async isNftWhitelisted(nft) {
            const collectionAddress = nft.native?.collectionAddress;
            if (!collectionAddress)
                return false;
            let whitelistedCollections;
            if (wl_prom) {
                whitelistedCollections = wl_prom;
            }
            else {
                whitelistedCollections = bridge.getWhitelist();
                wl_prom = whitelistedCollections;
            }
            const res = await wl_prom;
            wl_prom = undefined;
            return res.includes(collectionAddress) ? true : false;
        },
        getNftListAddr(address) {
            return base64url_1.default.encode(address);
        },
        getScVerifyAddr(address) {
            return address.replace(/[^a-zA-Z0-9]/g, "");
        },
        //TODO: complete getClaimData method for TON
        async getClaimData(hash, helpers) {
            hash;
            //TODO: fetch and decode TON trx;
            const decoded = {};
            const sourceNonce = Array.from(consts_2.CHAIN_INFO.values()).find((c) => c.v3_chainId === decoded.sourceChain)?.nonce;
            const sourceChainHelper = helpers.get(sourceNonce);
            const tokenInfo = await sourceChainHelper.getTokenInfo(decoded);
            return {
                ...tokenInfo,
                ...decoded,
            };
        },
        async getTokenInfo(depTrxData) {
            const client = new newton_1.TonClient({
                endpoint: args.tonweb.provider.host,
                apiKey: args.tonweb.provider.options.apiKey,
            });
            const addr = newton_1.Address.parseFriendly(depTrxData.sourceNftContractAddress).address;
            const nftItem = client.open(v3types_1.NftItem.fromAddress(addr));
            const nftData = await nftItem.getGetNftData();
            let metaDataURL = "";
            let royalty = "0";
            if (nftData.collection_address) {
                const nftCollection = client.open(v3types_1.NftCollection.fromAddress(nftData.collection_address));
                const [collectionData, royaltyData] = await Promise.allSettled([
                    nftCollection.getGetCollectionData(),
                    nftCollection.getRoyaltyParams(),
                ]);
                if (collectionData.status === "fulfilled") {
                    const { collection_content } = collectionData.value;
                    const collectionContentSlice = collection_content.asSlice();
                    collectionContentSlice.loadUint(8);
                    metaDataURL = collectionContentSlice.loadStringTail();
                }
                if (royaltyData.status === "fulfilled") {
                    const royaltyParams = royaltyData.value;
                    const royaltyInNum = royaltyParams.numerator / royaltyParams.denominator;
                    const standardRoyalty = royaltyInNum * BigInt(10);
                    royalty = standardRoyalty.toString();
                }
            }
            else {
                const individualContentSlice = nftData.individual_content.asSlice();
                individualContentSlice.loadBits(8);
                metaDataURL = individualContentSlice.loadStringTail();
            }
            const metaData = (await axios_1.default.get(typeof window !== "undefined" ? args.proxy + metaDataURL : metaDataURL)).data;
            console.log(metaData);
            return {
                name: metaData.name || "",
                symbol: "",
                metadata: metaDataURL,
                royalty,
                //image: "",
            };
        },
        //TODO: lock trx in TON
        async lockNFT(sender, toChain, id, receiver) {
            console.log(sender, toChain, id, receiver);
            return "";
        },
        async claimV3NFT(sender, helpers, from, transactionHash, storageContract, initialClaimData) {
            const [claimDataRes] = await Promise.allSettled([
                // bridge.validatorsCount(),
                from.getClaimData(transactionHash, helpers),
            ]);
            if (claimDataRes.status === "rejected") {
                throw new Error("Failed to get claimData from dep chain");
            }
            const claimData = claimDataRes.value;
            console.log({ ...claimData, ...initialClaimData, transactionHash }, "claim data");
            let sourceNftContractAddress_ = (0, newton_1.beginCell)()
                .storeSlice((0, newton_1.beginCell)()
                .storeStringTail(claimData.sourceNftContractAddress)
                .endCell()
                .asSlice())
                .endCell();
            try {
                sourceNftContractAddress_ = (0, newton_1.beginCell)()
                    .storeSlice((0, newton_1.beginCell)()
                    .storeAddress(newton_1.Address.parseFriendly(claimData.sourceNftContractAddress)
                    .address)
                    .endCell()
                    .asSlice())
                    .endCell();
            }
            catch (e) {
                console.log("Not Native TON Address");
            }
            const encodedClaimData = {
                $$type: "ClaimData",
                data1: {
                    $$type: "ClaimData1",
                    tokenId: BigInt(claimData.tokenId),
                    destinationChain: claimData.destinationChain,
                    destinationUserAddress: newton_1.Address.parseFriendly(claimData.destinationUserAddress).address,
                    sourceChain: claimData.sourceChain,
                    tokenAmount: BigInt(claimData.tokenAmount),
                },
                data2: {
                    $$type: "ClaimData2",
                    name: claimData.name,
                    nftType: claimData.nftType,
                    symbol: claimData.symbol,
                },
                data3: {
                    $$type: "ClaimData3",
                    fee: BigInt(initialClaimData.fee),
                    metadata: claimData.metadata,
                    royaltyReceiver: newton_1.Address.parseFriendly(initialClaimData.royaltyReceiver).address,
                    sourceNftContractAddress: sourceNftContractAddress_,
                },
                data4: {
                    $$type: "ClaimData4",
                    newContent: (0, newton_1.beginCell)()
                        .storeInt(0x01, 8)
                        .storeStringRefTail(claimData.metadata)
                        .endCell(),
                    royalty: {
                        $$type: "RoyaltyParams",
                        numerator: BigInt(10000),
                        denominator: BigInt(claimData.royalty),
                        destination: newton_1.Address.parseFriendly(initialClaimData.royaltyReceiver)
                            .address,
                    },
                    transactionHash,
                },
            };
            console.log((0, v3types_1.storeClaimData)(encodedClaimData).toString(), "encodedClaimData");
            const signatures = await storageContract.getLockNftSignatures(transactionHash, consts_2.CHAIN_INFO.get(from.getNonce())?.v3_chainId);
            const publicKey = (0, newton_1.beginCell)()
                .storeBuffer(Buffer.from(signatures[0].signerAddress, "hex"))
                .endCell()
                .beginParse()
                .loadUintBig(256);
            console.log(signatures);
            const sig = {
                $$type: "SignerAndSignature",
                key: publicKey,
                signature: (0, newton_1.beginCell)()
                    .storeBuffer(Buffer.from(signatures[0].signature.replace(/^0x/, ""), "hex"))
                    .endCell(),
            };
            const dictA = newton_1.Dictionary.empty().set(0n, sig);
            console.log(dictA, "encoded Sigs");
            const data = (0, newton_1.beginCell)()
                .store((0, v3types_1.storeClaimNFT721)({
                $$type: "ClaimNFT721",
                data: encodedClaimData,
                len: 1n,
                signatures: dictA,
            }))
                .endCell()
                .toBoc({ idx: false });
            await sender.send("ton_sendTransaction", [
                {
                    to: args.v3_bridge,
                    value: new anchor_1.BN(tonweb_1.default.utils.toNano("0.8")).toString(),
                    dataType: "boc",
                    data: (0, js_base64_1.fromUint8Array)(data),
                },
            ]);
            //console.log(x, "x");
            /* await bridge.send(
                      provider.sender(),
                      {
                          value: toNano('0.8')
                      }, {
                      $$type: "ClaimNFT721",
                      data: claimData,
                      len: 1n,
                      signatures: dictA
                  });*/
            return "";
        },
    };
}
exports.tonHelper = tonHelper;
/**
{
    "tokenId": "42",
    "destinationChain": "TON",
    "destinationUserAddress": "EQDrOJsbEcJHbzSjWQDefr2YDD-D999BhZZ_XT-lxlbiDmN3",
    "sourceNftContractAddress": "0xc679bdad7c2a34ca93552eae75e4bc03bf505adc",
    "tokenAmount": "1",
    "nftType": "singular",
    "sourceChain": "BSC",
    "name": "Istra",
    "symbol": "NSA",
    "metadata": "https://meta.polkamon.com/meta?id=10002362332",
    "royalty": "0",
    "fee": "100000000000000",
    "royaltyReceiver": "EQAV8tH2WDuWYU7zAmkJmIwP8Ph_uIC4zBqJNIfKgRUUQewh",
    "transactionHash": "0x984e0c85404bd5419b33026f507b0e432e4ab35687e9478bf26bf234be41fed1"
}
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvdG9uL3Rvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMkM7QUFDM0MsZ0VBQXFDO0FBQ3JDLG9EQUE0QjtBQUc1Qiw2QkFBb0M7QUFDcEMseUNBQXFDO0FBc0JyQyw2Q0FBOEM7QUFFOUMsb0RBQWlEO0FBR2pELHlDQUEyQztBQUMzQyxtRUFBMkM7QUFLM0MsMERBQWtDO0FBRWxDLG1DQUFtRTtBQUVuRSx1Q0FPbUI7QUFFbkIseUNBQTBDO0FBa0YxQyxJQUFJLE9BQXNDLENBQUM7QUFFcEMsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFlO0lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksMkJBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUN0RCxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVU7UUFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO0tBQ3hCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVkLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUE0QixDQUFDO0lBQzlDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDM0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVyRCxLQUFLLFVBQVUsVUFBVSxDQUN2QixTQUFpQixFQUNqQixLQUFhLEVBQ2IsT0FBZSxFQUNmLE9BQThCO1FBRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXhDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7UUFDakIsSUFBSSxXQUFnQixDQUFDO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ1osaUJBQU8sRUFBRSxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxRCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztRQUNGLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUN4QyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVuQixpQkFBTyxFQUFFLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXZELE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN0QixVQUFVLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssVUFBVSxXQUFXLENBQUMsT0FBZTtZQUN4QyxJQUFJO2dCQUNGLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDdEIsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNuQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBRTVDLElBQUksSUFBSTtnQkFBRSxPQUFPO1lBQ2pCLDRCQUE0QjtZQUM1QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEMsSUFBSSxJQUFJLEVBQUU7Z0JBQ1IsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsc0JBQXNCO1lBQ3RCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQzVCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxPQUFPLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7Z0JBRXhCLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztvQkFDL0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUk7b0JBQ2pDLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztnQkFDN0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNyQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSztvQkFDNUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBRTFCLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztnQkFFbkUsT0FBTyxPQUFPLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxLQUFLLENBQUM7WUFDbkQsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQ1Y7UUFFRCxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFcEIsTUFBTSxJQUFJLEdBQUcsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWxFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFOUIsSUFBSSxPQUFPLEdBQVEsU0FBUyxDQUFDO1FBRTdCLE9BQU8sT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUM1QixNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxlQUFLLEVBQ3JCLGdFQUFnRSxrQkFBa0IsQ0FDaEYsTUFBTSxDQUNQLHdCQUF3QixDQUMxQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV6QixPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQztTQUNyQjtRQUVELE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRUQsT0FBTztRQUNMLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUN4QyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDeEMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQUssQ0FBQyxHQUFHO1FBQ3pCLFlBQVksRUFBRSxDQUFDLE9BQW1CLEVBQUUsRUFBRTtZQUNwQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDakQsT0FBTyxJQUFJLHNCQUFTLENBQUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFDRCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1lBQzNCLE9BQU8sSUFBSSxzQkFBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxLQUFLLENBQUMsMkJBQTJCO1lBQy9CLE9BQU8sSUFBSSxzQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLDJCQUEyQjtZQUMvQixPQUFPLElBQUksc0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRztZQUN2QixPQUFPLGdCQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQ0QsWUFBWTtZQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsS0FBSyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUTtZQUN0RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztZQUVyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFdBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNoRCxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3ZELENBQUM7WUFFRixNQUFNLE1BQU0sR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzVDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNuQixVQUFVO2dCQUNWLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUNoQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDckQsS0FBSyxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUM5QixFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXO2dCQUMxQixJQUFJLEVBQUUsT0FBTzthQUNkLENBQUMsQ0FBc0IsQ0FBQztZQUV6QixNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFL0MsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVU7WUFDM0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFFckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDNUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN2RCxDQUFDO1lBRUYsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDO2dCQUM5QyxFQUFFLEVBQUUsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkMsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQzthQUMxQixDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUV0QyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQkFDckQsS0FBSyxFQUFFLElBQUksV0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0JBQzFCLElBQUksRUFBRSxPQUFPO2FBQ2QsQ0FBQyxDQUFzQixDQUFDO1lBRXpCLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELGdCQUFnQixDQUFDLElBQWE7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUIsSUFBSSxPQUFPLEdBQVcsRUFBRSxDQUFDO1lBQ3pCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLE1BQU0sTUFBTSxHQUFjO2dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxHQUFHLElBQUEsMEJBQWMsRUFBQyxNQUFNLE1BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQzFELEtBQUssR0FBRyxNQUFPLENBQUMsS0FBSyxDQUFDOzRCQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNyQixzQ0FDRSxNQUFPLENBQUMsRUFDVixXQUFXLElBQUksV0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxrQkFBa0IsQ0FDN0QsT0FBTyxDQUNSLFNBQVMsQ0FDWCxDQUFDO3dCQUNKLEdBQUc7d0JBQ0g7NEJBQ0UsT0FBTyxJQUFJLENBQUM7cUJBQ2Y7Z0JBQ0gsQ0FBQztnQkFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQVk7b0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUM3QixPQUFPLEVBQ1AsS0FBSyxFQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBUSxFQUNwQixVQUFVLENBQ1gsQ0FBQztvQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNqRCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQzthQUNGLENBQUM7WUFFRixPQUFPO2dCQUNMLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE1BQU0sRUFBRSxDQUFDO2FBQ1YsQ0FBQztRQUNKLENBQUM7UUFDRCxnQkFBZ0IsQ0FBQyxJQUFhO1lBQzVCLElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztZQUN6QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixNQUFNLE1BQU0sR0FBYztnQkFDeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtvQkFDdkIsUUFBUSxNQUFNLEVBQUU7d0JBQ2QsS0FBSyxxQkFBcUI7NEJBQ3hCLEtBQUssR0FBRyxNQUFPLENBQUMsS0FBSyxDQUFDOzRCQUV0QixPQUFPLEdBQUcsSUFBQSwwQkFBYyxFQUFDLE1BQU0sTUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ2hDLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDbkQ7b0NBQ0UsRUFBRSxFQUFFLE1BQU8sQ0FBQyxFQUFFO29DQUNkLEtBQUs7b0NBQ0wsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsSUFBSSxFQUFFLE9BQU87aUNBQ2Q7NkJBQ0YsQ0FBQyxDQUFDO3dCQUNMOzRCQUNFLE9BQU8sSUFBSSxDQUFDO3FCQUNmO2dCQUNILENBQUM7Z0JBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFZO29CQUMvQixPQUFPLENBQ0wsR0FBRzt3QkFDSCxDQUFDLE1BQU0sVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FDckUsQ0FBQztnQkFDSixDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELGFBQWEsQ0FBQyxJQUFhO1lBQ3pCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLE1BQU0sTUFBTSxHQUFjO2dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLHFCQUFxQjs0QkFDeEIsS0FBSyxHQUFHLElBQUksV0FBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUM7Z0NBQzFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUs7Z0NBQ3ZCLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQWE7Z0NBQ3ZDLEVBQUUsRUFBRSxNQUFPLENBQUMsRUFBRTtnQ0FDZCxLQUFLO2dDQUNMLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUk7Z0NBQ3RCLElBQUksRUFBRSwwQkFBMEIsTUFBTyxDQUFDLEVBQUUsRUFBRTtnQ0FDNUMsT0FBTyxFQUFFLElBQUEsMEJBQWMsRUFBQyxNQUFNLE1BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUN6RCxDQUFDLENBQUM7d0JBRUw7NEJBQ0UsT0FBTyxJQUFJLENBQUM7cUJBQ2Y7Z0JBQ0gsQ0FBQztnQkFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQThCO29CQUNqRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUN2RCxPQUFPLE1BQU0sVUFBVSxDQUNyQixHQUFHLENBQUMsUUFBUSxFQUNaLEtBQUssRUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsRUFDcEIsUUFBUSxDQUNULENBQUM7cUJBQ0g7eUJBQU07d0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUN2QztnQkFDSCxDQUFDO2FBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLENBQUM7YUFDVixDQUFDO1FBQ0osQ0FBQztRQUNELFlBQVksQ0FBQyxFQUEwQjtZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDdkQsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dCQUN2QixFQUFFLEVBQUUsQ0FBQzthQUNOLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxHQUFjO2dCQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNO29CQUN2QixRQUFRLE1BQU0sRUFBRTt3QkFDZCxLQUFLLGdCQUFnQjs0QkFDbkIsT0FBTyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzt3QkFDekQsS0FBSyxxQkFBcUI7NEJBQ3hCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUNyQyxLQUFLLHFCQUFxQjs0QkFDeEIsT0FBTyxNQUFNLE1BQU0sQ0FBQyxPQUFPO2lDQUN4QixRQUFRLENBQUM7Z0NBQ1IsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dDQUN2QixTQUFTLEVBQUUsTUFBTyxDQUFDLEVBQUU7Z0NBQ3JCLE1BQU0sRUFBRSxJQUFJLFdBQUUsQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDO2dDQUM3QixLQUFLLEVBQUUsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO2dDQUNqRCxRQUFRLEVBQUUsQ0FBQztnQ0FDWCxPQUFPLEVBQUUsTUFBTyxDQUFDLElBQUk7NkJBQ3RCLENBQUM7aUNBQ0QsSUFBSSxFQUFFLENBQUM7cUJBQ2I7Z0JBQ0gsQ0FBQztnQkFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQXFCO29CQUN4QyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7YUFDRixDQUFDO1lBRUYsT0FBTztnQkFDTCxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUUsQ0FBQzthQUNWLENBQUM7UUFDSixDQUFDO1FBQ0QsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUc7WUFDeEIsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDO1lBQ3hELElBQUksQ0FBQyxpQkFBaUI7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDckMsSUFBSSxzQkFBeUMsQ0FBQztZQUU5QyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxzQkFBc0IsR0FBRyxPQUFPLENBQUM7YUFDbEM7aUJBQU07Z0JBQ0wsc0JBQXNCLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMvQyxPQUFPLEdBQUcsc0JBQXNCLENBQUM7YUFDbEM7WUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQztZQUMxQixPQUFPLEdBQUcsU0FBUyxDQUFDO1lBQ3BCLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN4RCxDQUFDO1FBQ0QsY0FBYyxDQUFDLE9BQU87WUFDcEIsT0FBTyxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsZUFBZSxDQUFDLE9BQU87WUFDckIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsNENBQTRDO1FBQzVDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU87WUFDOUIsSUFBSSxDQUFDO1lBQ0wsaUNBQWlDO1lBQ2pDLE1BQU0sT0FBTyxHQUFHLEVBQWdCLENBQUM7WUFFakMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUN0RCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsV0FBVyxDQUM1QyxFQUFFLEtBQUssQ0FBQztZQUVULE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUF5QixDQUFDLENBQUM7WUFFakUsTUFBTSxTQUFTLEdBQWMsTUFDM0IsaUJBQ0QsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFeEIsT0FBTztnQkFDTCxHQUFHLFNBQVM7Z0JBQ1osR0FBRyxPQUFPO2FBQ1gsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsWUFBWSxDQUFDLFVBQVU7WUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQkFBUyxDQUFDO2dCQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtnQkFDbkMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNO2FBQzVDLENBQUMsQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLGdCQUFPLENBQUMsYUFBYSxDQUNoQyxVQUFVLENBQUMsd0JBQXdCLENBQ3BDLENBQUMsT0FBTyxDQUFDO1lBRVYsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRTlDLElBQUksV0FBVyxHQUFXLEVBQUUsQ0FBQztZQUM3QixJQUFJLE9BQU8sR0FBVyxHQUFHLENBQUM7WUFFMUIsSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzlCLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQy9CLHVCQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUN0RCxDQUFDO2dCQUNGLE1BQU0sQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUM3RCxhQUFhLENBQUMsb0JBQW9CLEVBQUU7b0JBQ3BDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtpQkFDakMsQ0FBQyxDQUFDO2dCQUVILElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7b0JBQ3pDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUM7b0JBQ3BELE1BQU0sc0JBQXNCLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzVELHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsV0FBVyxHQUFHLHNCQUFzQixDQUFDLGNBQWMsRUFBRSxDQUFDO2lCQUN2RDtnQkFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO29CQUN0QyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO29CQUN4QyxNQUFNLFlBQVksR0FDaEIsYUFBYSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO29CQUN0RCxNQUFNLGVBQWUsR0FBRyxZQUFZLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsRCxPQUFPLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUN0QzthQUNGO2lCQUFNO2dCQUNMLE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwRSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN2RDtZQUVELE1BQU0sUUFBUSxHQUFHLENBQ2YsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUNiLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FDdkUsQ0FDRixDQUFDLElBQUksQ0FBQztZQUVQLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEIsT0FBTztnQkFDTCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUN6QixNQUFNLEVBQUUsRUFBRTtnQkFDVixRQUFRLEVBQUUsV0FBVztnQkFDckIsT0FBTztnQkFDUCxZQUFZO2FBQ2IsQ0FBQztRQUNKLENBQUM7UUFDRCx1QkFBdUI7UUFDdkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRO1lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDM0MsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBQ0QsS0FBSyxDQUFDLFVBQVUsQ0FDZCxNQUFNLEVBQ04sT0FBTyxFQUNQLElBQUksRUFDSixlQUFlLEVBQ2YsZUFBZSxFQUNmLGdCQUFnQjtZQUVoQixNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUM5Qyw0QkFBNEI7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQzthQUM1QyxDQUFDLENBQUM7WUFFSCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7YUFDM0Q7WUFFRCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQ1QsRUFBRSxHQUFHLFNBQVMsRUFBRSxHQUFHLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxFQUN0RCxZQUFZLENBQ2IsQ0FBQztZQUVGLElBQUkseUJBQXlCLEdBQUcsSUFBQSxrQkFBUyxHQUFFO2lCQUN4QyxVQUFVLENBQ1QsSUFBQSxrQkFBUyxHQUFFO2lCQUNSLGVBQWUsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUM7aUJBQ25ELE9BQU8sRUFBRTtpQkFDVCxPQUFPLEVBQUUsQ0FDYjtpQkFDQSxPQUFPLEVBQUUsQ0FBQztZQUNiLElBQUk7Z0JBQ0YseUJBQXlCLEdBQUcsSUFBQSxrQkFBUyxHQUFFO3FCQUNwQyxVQUFVLENBQ1QsSUFBQSxrQkFBUyxHQUFFO3FCQUNSLFlBQVksQ0FDWCxnQkFBTyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUM7cUJBQ3RELE9BQU8sQ0FDWDtxQkFDQSxPQUFPLEVBQUU7cUJBQ1QsT0FBTyxFQUFFLENBQ2I7cUJBQ0EsT0FBTyxFQUFFLENBQUM7YUFDZDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUN2QztZQUVELE1BQU0sZ0JBQWdCLEdBQWM7Z0JBQ2xDLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixLQUFLLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLFlBQVk7b0JBQ3BCLE9BQU8sRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFDbEMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLGdCQUFnQjtvQkFDNUMsc0JBQXNCLEVBQUUsZ0JBQU8sQ0FBQyxhQUFhLENBQzNDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FDakMsQ0FBQyxPQUFPO29CQUNULFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVztvQkFDbEMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO2lCQUMzQztnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLFlBQVk7b0JBQ3BCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtvQkFDcEIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPO29CQUMxQixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07aUJBQ3pCO2dCQUNELEtBQUssRUFBRTtvQkFDTCxNQUFNLEVBQUUsWUFBWTtvQkFDcEIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7b0JBQ2pDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtvQkFDNUIsZUFBZSxFQUFFLGdCQUFPLENBQUMsYUFBYSxDQUNwQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQ2pDLENBQUMsT0FBTztvQkFDVCx3QkFBd0IsRUFBRSx5QkFBeUI7aUJBQ3BEO2dCQUNELEtBQUssRUFBRTtvQkFDTCxNQUFNLEVBQUUsWUFBWTtvQkFDcEIsVUFBVSxFQUFFLElBQUEsa0JBQVMsR0FBRTt5QkFDcEIsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ2pCLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7eUJBQ3RDLE9BQU8sRUFBRTtvQkFDWixPQUFPLEVBQUU7d0JBQ1AsTUFBTSxFQUFFLGVBQWU7d0JBQ3ZCLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO3dCQUN4QixXQUFXLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7d0JBQ3RDLFdBQVcsRUFBRSxnQkFBTyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUM7NkJBQ2pFLE9BQU87cUJBQ1g7b0JBQ0QsZUFBZTtpQkFDaEI7YUFDRixDQUFDO1lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FDVCxJQUFBLHdCQUFjLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFDM0Msa0JBQWtCLENBQ25CLENBQUM7WUFFRixNQUFNLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxvQkFBb0IsQ0FDM0QsZUFBZSxFQUNmLG1CQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFVBQVcsQ0FDN0MsQ0FBQztZQUVGLE1BQU0sU0FBUyxHQUFHLElBQUEsa0JBQVMsR0FBRTtpQkFDMUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDNUQsT0FBTyxFQUFFO2lCQUNULFVBQVUsRUFBRTtpQkFDWixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUV4QixNQUFNLEdBQUcsR0FBdUI7Z0JBQzlCLE1BQU0sRUFBRSxvQkFBb0I7Z0JBQzVCLEdBQUcsRUFBRSxTQUFTO2dCQUNkLFNBQVMsRUFBRSxJQUFBLGtCQUFTLEdBQUU7cUJBQ25CLFdBQVcsQ0FDVixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FDL0Q7cUJBQ0EsT0FBTyxFQUFFO2FBQ2IsQ0FBQztZQUVGLE1BQU0sS0FBSyxHQUFHLG1CQUFVLENBQUMsS0FBSyxFQUE4QixDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFbkMsTUFBTSxJQUFJLEdBQUcsSUFBQSxrQkFBUyxHQUFFO2lCQUNyQixLQUFLLENBQ0osSUFBQSwwQkFBZ0IsRUFBQztnQkFDZixNQUFNLEVBQUUsYUFBYTtnQkFDckIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsR0FBRyxFQUFFLEVBQUU7Z0JBQ1AsVUFBVSxFQUFFLEtBQUs7YUFDbEIsQ0FBQyxDQUNIO2lCQUNBLE9BQU8sRUFBRTtpQkFDVCxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUV6QixNQUFPLE1BQWMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2hEO29CQUNFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUztvQkFDbEIsS0FBSyxFQUFFLElBQUksV0FBRSxDQUFDLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtvQkFDcEQsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsSUFBSSxFQUFFLElBQUEsMEJBQWMsRUFBQyxJQUFJLENBQUM7aUJBQzNCO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsc0JBQXNCO1lBRXRCOzs7Ozs7Ozs7dUJBU1c7WUFDWCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXZtQkQsOEJBdW1CQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRyJ9