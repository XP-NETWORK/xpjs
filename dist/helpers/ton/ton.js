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
            const client = new newton_1.TonClient({
                endpoint: args.tonweb.provider.host,
                apiKey: args.tonweb.provider.options.apiKey,
            });
            const addr = newton_1.Address.parseFriendly(depTrxData.sourceNftContractAddress).address;
            console.log(addr);
            const nftItem = client.open(v3types_1.NftItem.fromAddress(addr));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hlbHBlcnMvdG9uL3Rvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMkM7QUFDM0MsZ0VBQXFDO0FBQ3JDLG9EQUE0QjtBQUc1Qiw2QkFBb0M7QUFDcEMseUNBQXFDO0FBbUJyQyw2Q0FBOEM7QUFFOUMsb0RBQWlEO0FBR2pELHlDQUEyQztBQUMzQyxtRUFBMkM7QUFLM0MsMERBQWtDO0FBRWxDLG1DQUFtRTtBQUVuRSxvQ0FBb0M7QUFDcEMsdUNBUW1CO0FBQ25CLHlDQUEwQztBQStFMUMsSUFBSSxPQUFzQyxDQUFDO0FBRXBDLEtBQUssVUFBVSxTQUFTLENBQUMsSUFBZTtJQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLDJCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7UUFDdEQsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVO1FBQ3hCLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtLQUN4QixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFZCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBNEIsQ0FBQztJQUM5QyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzNCLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckQsS0FBSyxVQUFVLFVBQVUsQ0FDdkIsU0FBaUIsRUFDakIsS0FBYSxFQUNiLE9BQWUsRUFDZixPQUE4QjtRQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV4QyxJQUFJLElBQUksR0FBVyxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLElBQUks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