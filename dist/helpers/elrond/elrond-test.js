"use strict";
//import { Mnemonic } from "@elrondnetwork/erdjs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_core_1 = require("@multiversx/sdk-core");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const sdk_wallet_1 = require("@multiversx/sdk-wallet");
const v3Bridge_abi_json_1 = __importDefault(require("./v3Bridge_abi.json"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const f = sdk_wallet_1.Mnemonic.fromString(`evidence liberty culture stuff canal minute toward trash boil cry verb recall during citizen social upper budget ranch distance business excite fox icon tool`);
const proxyNetworkProvider = new sdk_network_providers_1.ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
const apiNetworkProvider = new sdk_network_providers_1.ApiNetworkProvider("https://devnet2-api.multiversx.com");
const signer = new sdk_wallet_1.UserSigner(f.deriveKey());
const bridgeAddress = new sdk_core_1.Address("erd1qqqqqqqqqqqqqpgqghvly0npf6ewpmzh47ud76ssh6nppu4e7hnses7qlz");
const abiRegistry = sdk_core_1.AbiRegistry.create(v3Bridge_abi_json_1.default);
const bridgeContract = new sdk_core_1.SmartContract({
    address: bridgeAddress,
    abi: abiRegistry,
});
bridgeContract;
const collectionName = "Alex";
const collectionTicker = "ALX";
const collectionIdentifier = "ALX-afef0b";
async function createNftCollection(sender, account, signer) {
    let name = Buffer.from(collectionName).toString("hex");
    let ticker = Buffer.from(collectionTicker).toString("hex");
    let canFreeze = "@" +
        Buffer.from("canFreeze").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canWipe = "@" +
        Buffer.from("canWipe").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canPause = "@" +
        Buffer.from("canPause").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canTransferNFTCreateRole = "@" +
        Buffer.from("canTransferNFTCreateRole").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canChangeOwner = "@" +
        Buffer.from("canChangeOwner").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canUpgrade = "@" +
        Buffer.from("canUpgrade").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    let canAddSpecialRoles = "@" +
        Buffer.from("canAddSpecialRoles").toString("hex") +
        "@" +
        Buffer.from("true").toString("hex");
    const tx3 = new sdk_core_1.Transaction({
        data: new sdk_core_1.TransactionPayload("issueNonFungible" +
            "@" +
            name +
            "@" +
            ticker +
            canFreeze +
            canWipe +
            canPause +
            canTransferNFTCreateRole +
            canChangeOwner +
            canUpgrade +
            canAddSpecialRoles),
        gasLimit: 70000000,
        sender: sender,
        receiver: new sdk_core_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        value: new sdk_core_1.BigUIntValue(new bignumber_js_1.default("50000000000000000")),
        chainID: "D",
    });
    tx3.setNonce(account.getNonceThenIncrement());
    const serializedTransaction = tx3.serializeForSigning();
    const transactionSignature = await signer.sign(serializedTransaction);
    tx3.applySignature(transactionSignature);
    let txHash = await proxyNetworkProvider.sendTransaction(tx3).catch((e) => {
        console.log("error x", e);
        return undefined;
    });
    if (!txHash) {
        return;
    }
    console.log("Hash:", txHash);
    let resultsParser = new sdk_core_1.ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}
async function setSpecialRoles(address, account, signer, assignAddress) {
    let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let assigneeAddress = "@" + assignAddress.hex();
    let esdtRoleNftCreate = "@" + Buffer.from("ESDTRoleNFTCreate").toString("hex");
    const tx3 = new sdk_core_1.Transaction({
        data: new sdk_core_1.TransactionPayload("setSpecialRole" + tokenIdentifier + assigneeAddress + esdtRoleNftCreate),
        gasLimit: 70000000,
        sender: address,
        receiver: new sdk_core_1.Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        chainID: "D",
    });
    tx3.setNonce(account.getNonceThenIncrement());
    const serializedTransaction = tx3.serializeForSigning();
    const transactionSignature = await signer.sign(serializedTransaction);
    tx3.applySignature(transactionSignature);
    let txHash = await proxyNetworkProvider.sendTransaction(tx3);
    console.log("Hash:", txHash);
    let resultsParser = new sdk_core_1.ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}
async function createNft(nftName, address, account, signer) {
    let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let quantity = "@" + "01";
    let name = "@" + Buffer.from(nftName).toString("hex");
    let royalties = "@" + Buffer.from(new bignumber_js_1.default("1")).toString("hex");
    let hash = "@" + Buffer.from("00").toString("hex");
    let attrs = "@" +
        Buffer.from("metadata:https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb").toString("hex");
    let uri = "@" +
        Buffer.from("https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb/9999.png").toString("hex");
    let uri2 = "@" +
        Buffer.from("https://ipfs.io/ipfs/QmSaY9zZnKWGa8jmMFNN6LrDGykjSiryUz8YeUjjJ97A8w/9999.json").toString("hex");
    const tx3 = new sdk_core_1.Transaction({
        data: new sdk_core_1.TransactionPayload("ESDTNFTCreate" +
            tokenIdentifier +
            quantity +
            name +
            royalties +
            hash +
            attrs +
            uri +
            uri2),
        gasLimit: 600000000,
        sender: address,
        receiver: address,
        chainID: "D",
    });
    tx3.setNonce(account.getNonceThenIncrement());
    const serializedTransaction = tx3.serializeForSigning();
    const transactionSignature = await signer.sign(serializedTransaction);
    tx3.applySignature(transactionSignature);
    let txHash = await proxyNetworkProvider.sendTransaction(tx3);
    console.log("Hash:", txHash);
    let resultsParser = new sdk_core_1.ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}
async function transferToSc(bridgeAddress, account, signer, tokenId, nonce) {
    let collectionIdentifiers = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let noncec = "@" + nonce;
    let quantity = "@" + "01";
    let destination_address = "@" + bridgeAddress.hex();
    let method = "@" + Buffer.from("lock721").toString("hex");
    let token_id = "@" + Buffer.from(tokenId).toString("hex");
    let destination_chain = "@" + Buffer.from("BSC").toString("hex");
    let destination_user_address = "@" +
        Buffer.from("0x6f7C0c6A6dd6E435b0EEc1c9F7Bce01A1908f386").toString("hex");
    let source_nft_contract_address = collectionIdentifiers;
    const tx3 = new sdk_core_1.Transaction({
        data: new sdk_core_1.TransactionPayload("ESDTNFTTransfer" +
            collectionIdentifiers +
            noncec +
            quantity +
            destination_address +
            method +
            token_id +
            destination_chain +
            destination_user_address +
            source_nft_contract_address +
            noncec),
        gasLimit: 600000000,
        sender: signer.getAddress(),
        receiver: signer.getAddress(),
        chainID: "D",
    });
    const nonce1 = account.getNonceThenIncrement();
    tx3.setNonce(nonce1);
    const serializedTransaction = tx3.serializeForSigning();
    const transactionSignature = await signer.sign(serializedTransaction);
    tx3.applySignature(transactionSignature);
    let txHash = await proxyNetworkProvider.sendTransaction(tx3);
    console.log("Hash:", txHash);
}
const address = new sdk_core_1.Address("erd1ymdj4ze52a0tmcjzeyhcntzaf5uxpn2d6t203yreh6qx6fqeftgqmz9ly6");
const account = new sdk_core_1.Account(address);
(async () => {
    const aliceOnNetwork = await apiNetworkProvider.getAccount(address);
    account.update(aliceOnNetwork);
    //console.log(account.getNonceThenIncrement());
    //const x = account.getNonce
    //console.log(x, "x");
    //createNftCollection;
    //createNftCollection(address, account, signer);
    //setSpecialRoles(address, account, signer, address);
    createNftCollection;
    setSpecialRoles;
    createNft;
    transferToSc;
    //transferToSc(bridgeAddress, account, signer, "ALX-afef0b-01", "01");
    await createNft("ALX-afef0b-07", address, account, signer);
    //await createNft("ALX-afef0b-07", address, account, signer);
    //await createNft("ALX-afef0b-08", address, account, signer);
    //await createNft("ALX-afef0b-09", address, account, signer);
    //await createNft("ALX-afef0b-10", address, account, signer);
})();
//console.log(bridgeContract);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxyb25kLXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVycy9lbHJvbmQvZWxyb25kLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtEQUFrRDs7Ozs7QUFFbEQsbURBUzhCO0FBQzlCLDZFQUcyQztBQUMzQyx1REFBOEQ7QUFDOUQsNEVBQXNDO0FBRXRDLGdFQUFxQztBQUVyQyxNQUFNLENBQUMsR0FBRyxxQkFBUSxDQUFDLFVBQVUsQ0FDM0IsK0pBQStKLENBQ2hLLENBQUM7QUFDRixNQUFNLG9CQUFvQixHQUFHLElBQUksNENBQW9CLENBQ25ELHVDQUF1QyxDQUN4QyxDQUFDO0FBQ0YsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLDBDQUFrQixDQUMvQyxvQ0FBb0MsQ0FDckMsQ0FBQztBQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksdUJBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUU3QyxNQUFNLGFBQWEsR0FBRyxJQUFJLGtCQUFPLENBQy9CLGdFQUFnRSxDQUNqRSxDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsMkJBQUcsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksd0JBQWEsQ0FBQztJQUN2QyxPQUFPLEVBQUUsYUFBYTtJQUN0QixHQUFHLEVBQUUsV0FBVztDQUNqQixDQUFDLENBQUM7QUFDSCxjQUFjLENBQUM7QUFDZixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUM7QUFDOUIsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFDL0IsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUM7QUFFMUMsS0FBSyxVQUFVLG1CQUFtQixDQUNoQyxNQUFlLEVBQ2YsT0FBZ0IsRUFDaEIsTUFBa0I7SUFFbEIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMs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