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
const ton_core_1 = require("ton-core");
const ton_2 = require("@ton/ton");
//import { sign } from "ton-crypto";
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
        async getTokenInfo(depTrxData) {
            console.log(args.tonweb.provider.host, "host");
            const client = new ton_2.TonClient({
                endpoint: args.tonweb.provider.host,
                apiKey: args.tonweb.provider.options.apiKey,
            });
            const nftItem = client.open(v3types_1.NftItem.fromAddress(ton_core_1.Address.parseFriendly(depTrxData.sourceNftContractAddress).address));
            const nftData = await nftItem.getGetNftData();
            console.log(nftData, "nftData");
            let metaDataURL = "";
            if (nftData.collection_address) {
                const nftCollection = client.open(v3types_1.NftCollection.fromAddress(nftData.collection_address));
                const { collection_content } = await nftCollection.getGetCollectionData();
                const collectionContentSlice = collection_content.asSlice();
                collectionContentSlice.loadUint(8);
                metaDataURL = collectionContentSlice.loadStringTail();
                console.log(metaDataURL, "metaDataURL");
            }
            const individualContentSlice = nftData.individual_content.asSlice();
            individualContentSlice.loadBits(8);
            metaDataURL = individualContentSlice.loadStringTail();
            const metaData = (await axios_1.default.get(metaDataURL)).data;
            console.log(metaData);
            return {
                name: metaData.name || "",
                symbol: "",
                metadata: "",
                royalty: "",
                image: "",
            };
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
            let sourceNftContractAddress_ = (0, ton_core_1.beginCell)()
                .storeSlice((0, ton_core_1.beginCell)()
                .storeStringTail(claimData.sourceNftContractAddress)
                .endCell()
                .asSlice())
                .endCell();
            try {
                sourceNftContractAddress_ = (0, ton_core_1.beginCell)()
                    .storeSlice((0, ton_core_1.beginCell)()
                    .storeAddress(ton_core_1.Address.parseFriendly(claimData.sourceNftContractAddress)
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
                    destinationUserAddress: ton_core_1.Address.parseFriendly(claimData.destinationUserAddress).address,
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
                    royaltyReceiver: ton_core_1.Address.parseFriendly(initialClaimData.royaltyReceiver).address,
                    sourceNftContractAddress: sourceNftContractAddress_,
                },
                data4: {
                    $$type: "ClaimData4",
                    newContent: (0, ton_core_1.beginCell)()
                        .storeInt(0x01, 8)
                        .storeStringRefTail(claimData.metadata)
                        .endCell(),
                    royalty: {
                        $$type: "RoyaltyParams",
                        numerator: BigInt(10000),
                        denominator: BigInt(claimData.royalty),
                        destination: ton_core_1.Address.parseFriendly(initialClaimData.royaltyReceiver)
                            .address,
                    },
                    transactionHash,
                },
            };
            console.log((0, v3types_1.storeClaimData)(encodedClaimData).toString(), "encodedClaimData");
            const signatures = await storageContract.getLockNftSignatures(transactionHash, consts_2.CHAIN_INFO.get(from.getNonce())?.v3_chainId);
            const publicKey = (0, ton_core_1.beginCell)()
                .storeBuffer(Buffer.from(signatures[0].signerAddress, "hex"))
                .endCell()
                .beginParse()
                .loadUintBig(256);
            console.log(signatures);
            const sig = {
                $$type: "SignerAndSignature",
                key: publicKey,
                signature: (0, ton_core_1.beginCell)()
                    .storeBuffer(Buffer.from(signatures[0].signature.replace(/^0x/, ""), "hex"))
                    .endCell(),
            };
            const dictA = ton_core_1.Dictionary.empty().set(0n, sig);
            console.log(dictA, "encoded Sigs");
            const data = (0, ton_core_1.beginCell)()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvdG9uL3Rvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMkM7QUFDM0MsZ0VBQXFDO0FBQ3JDLG9EQUE0QjtBQUc1Qiw2QkFBb0M7QUFDcEMseUNBQXFDO0FBbUJyQyw2Q0FBOEM7QUFFOUMsb0RBQWlEO0FBR2pELHlDQUEyQztBQUMzQyxtRUFBMkM7QUFLM0MsMERBQWtDO0FBRWxDLHVDQUEwRDtBQUMxRCxrQ0FBcUM7QUFDckMsb0NBQW9DO0FBQ3BDLHVDQVFtQjtBQUNuQix5Q0FBMEM7QUErRTFDLElBQUksT0FBc0MsQ0FBQztBQUVwQyxLQUFLLFVBQVUsU0FBUyxDQUFDLElBQWU7SUFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSwyQkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3RELE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVTtRQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7S0FDeEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRWQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQTRCLENBQUM7SUFDOUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUMzQixHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJELEtBQUssVUFBVSxVQUFVLENBQ3ZCLFNBQWlCLEVBQ2pCLEtBQWEsRUFDYixPQUFlLEVBQ2YsT0FBOEI7UUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFeEMsSUFBSSxJQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FB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