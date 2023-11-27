//import { Mnemonic } from "@elrondnetwork/erdjs";
/*
import {
    AbiRegistry,
    SmartContract,
    Address,
    Account,
    Transaction,
    TransactionPayload,
    ResultsParser,
    BigUIntValue,
    StructType,
    BytesType,
    FieldDefinition,
    BigUIntType,
    AddressType,
    Field,
    BytesValue,
    Struct,
    VariadicValue,
    AddressValue,
} from "@multiversx/sdk-core";
import { ProxyNetworkProvider, ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { UserSigner, Mnemonic } from "@multiversx/sdk-wallet";
import abi from "./v3Bridge_abi.json";
import { Nonce } from "@multiversx/sdk-network-providers/out/primitives";
//import { decodeBase64Array } from "../../factory";
//import axios from "axios";
import BigNumber from "bignumber.js";
//import { decodeBase64Array } from "../../factory";
//import { inspect } from "node:util";

const f = Mnemonic.fromString(
    `evidence liberty culture stuff canal minute toward trash boil cry verb recall during citizen social upper budget ranch distance business excite fox icon tool`
);
const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
const apiNetworkProvider = new ApiNetworkProvider("https://devnet2-api.multiversx.com");
const signer = new UserSigner(f.deriveKey());

const bridgeAddress = new Address("erd1qqqqqqqqqqqqqpgqtsw8s3evjjyqqa2j2tfn9yvufqskdv236n9s2a06h9");
const abiRegistry = AbiRegistry.create(abi);
const bridgeContract = new SmartContract({
    address: bridgeAddress,
    abi: abiRegistry,
});

const collectionName = "Alex";
const collectionTicker = "ALX";
const collectionIdentifier = "ALX-afef0b";

async function createNftCollection(sender: Address, account: Account, signer: UserSigner) {
    let name = Buffer.from(collectionName).toString("hex");
    let ticker = Buffer.from(collectionTicker).toString("hex");
    let canFreeze = "@" + Buffer.from("canFreeze").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canWipe = "@" + Buffer.from("canWipe").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canPause = "@" + Buffer.from("canPause").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canTransferNFTCreateRole =
        "@" + Buffer.from("canTransferNFTCreateRole").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canChangeOwner =
        "@" + Buffer.from("canChangeOwner").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canUpgrade = "@" + Buffer.from("canUpgrade").toString("hex") + "@" + Buffer.from("true").toString("hex");
    let canAddSpecialRoles =
        "@" + Buffer.from("canAddSpecialRoles").toString("hex") + "@" + Buffer.from("true").toString("hex");
    const tx3 = new Transaction({
        data: new TransactionPayload(
            "issueNonFungible" +
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
                canAddSpecialRoles
        ),
        gasLimit: 70000000,
        sender: sender,
        receiver: new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        value: new BigUIntValue(new BigNumber("50000000000000000")),
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
    let resultsParser = new ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}

async function setSpecialRoles(address: Address, account: Account, signer: UserSigner, assignAddress: Address) {
    let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let assigneeAddress = "@" + assignAddress.hex();
    let esdtRoleNftCreate = "@" + Buffer.from("ESDTRoleNFTCreate").toString("hex");
    const tx3 = new Transaction({
        data: new TransactionPayload("setSpecialRole" + tokenIdentifier + assigneeAddress + esdtRoleNftCreate),
        gasLimit: 70000000,
        sender: address,
        receiver: new Address("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
        chainID: "D",
    });

    tx3.setNonce(account.getNonceThenIncrement());
    const serializedTransaction = tx3.serializeForSigning();
    const transactionSignature = await signer.sign(serializedTransaction);
    tx3.applySignature(transactionSignature);
    let txHash = await proxyNetworkProvider.sendTransaction(tx3);
    console.log("Hash:", txHash);
    let resultsParser = new ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}

async function createNft(nftName: string, address: Address, account: Account, signer: UserSigner) {
    let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let quantity = "@" + "01";
    let name = "@" + Buffer.from(nftName).toString("hex");
    let royalties = "@" + Buffer.from(new BigNumber("1")).toString("hex");
    let hash = "@" + Buffer.from("00").toString("hex");
    let attrs =
        "@" +
        Buffer.from("metadata:https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb").toString("hex");
    let uri =
        "@" +
        Buffer.from("https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb/9999.png").toString("hex");
    let uri2 =
        "@" +
        Buffer.from("https://ipfs.io/ipfs/QmSaY9zZnKWGa8jmMFNN6LrDGykjSiryUz8YeUjjJ97A8w/9999.json").toString("hex");
    const tx3 = new Transaction({
        data: new TransactionPayload(
            "ESDTNFTCreate" + tokenIdentifier + quantity + name + royalties + hash + attrs + uri + uri2
        ),
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
    let resultsParser = new ResultsParser();
    let transactionOnNetwork = await proxyNetworkProvider.getTransaction(txHash);
    let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);
    console.log(untypedBundle);
    console.log(untypedBundle.returnCode, untypedBundle.values.length);
}

async function transferToSc(
    bridgeAddress: Address,
    account: Account,
    signer: UserSigner,
    tokenId: string,
    nonce: string
) {
    let collectionIdentifiers = "@" + Buffer.from(collectionIdentifier).toString("hex");
    let noncec = "@" + nonce;
    let quantity = "@" + "01";
    let destination_address = "@" + bridgeAddress.hex();
    let method = "@" + Buffer.from("lock721").toString("hex");
    let token_id = "@" + Buffer.from(tokenId).toString("hex");
    let destination_chain = "@" + Buffer.from("BSC").toString("hex");
    let destination_user_address = "@" + Buffer.from("0x6f7C0c6A6dd6E435b0EEc1c9F7Bce01A1908f386").toString("hex");
    let source_nft_contract_address = collectionIdentifiers;

    const tx3 = new Transaction({
        data: new TransactionPayload(
            "ESDTNFTTransfer" +
                collectionIdentifiers +
                noncec +
                quantity +
                destination_address +
                method +
                token_id +
                destination_chain +
                destination_user_address +
                source_nft_contract_address +
                noncec
        ),
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

async function claim(account: Account, signer: UserSigner) {
    const structClaimData = new StructType("ClaimData", [
        new FieldDefinition("token_id", "name of the nft", new BytesType()),
        new FieldDefinition("source_chain", "attributes of the nft", new BytesType()),
        new FieldDefinition("destination_chain", "attributes of the nft", new BytesType()),
        new FieldDefinition("destination_user_address", "attributes of the nft", new AddressType()),
        new FieldDefinition("source_nft_contract_address", "attributes of the nft", new BytesType()),
        new FieldDefinition("name", "attributes of the nft", new BytesType()),
        new FieldDefinition("symbol", "attributes of the nft", new BytesType()),
        new FieldDefinition("royalty", "attributes of the nft", new BigUIntType()),
        new FieldDefinition("royalty_receiver", "attributes of the nft", new AddressType()),
        new FieldDefinition("attrs", "attributes of the nft", new BytesType()),
        new FieldDefinition("transaction_hash", "attributes of the nft", new BytesType()),
        new FieldDefinition("token_amount", "attributes of the nft", new BigUIntType()),
        new FieldDefinition("nft_type", "attributes of the nft", new BytesType()),
        new FieldDefinition("fee", "attributes of the nft", new BigUIntType()),
    ]);

    //copied from validator logs
    const nftTransferDetailsObject = {
        tokenId: "46",
        sourceChain: "MULTIVERSX",
        destinationChain: "MULTIVERSX",
        destinationUserAddress: "erd1ymdj4ze52a0tmcjzeyhcntzaf5uxpn2d6t203yreh6qx6fqeftgqmz9ly6",
        sourceNftContractAddress: "ALX-afef0b",
        name: "Alex",
        symbol: "ALX-afef0b",
        royalty: "49",
        royaltyReceiver: "9fb927c978225cb7a93b8b3cd8d8423e176e009dc284c536d9c4372bbe128487",
        metadata: "https://ipfs.io/ipfs/QmSaY9zZnKWGa8jmMFNN6LrDGykjSiryUz8YeUjjJ97A8w/9999.json",
        transactionHash: "0x79b660e873dd647c0adf57d85dddb1ffb5b64ced5f2e021a58d9612df1e8dcfc",
        tokenAmount: "1",
        nftType: "singular",
        fee: "100000000000000",
    };

    //sig copied validator logs
    const signature = {
        sig: "0xc911280927e090af571df0de3cbc22b04288150623a5725917172a81f59c85dc4c53fd4902b70ebb9d558a89895b0f982a8e780d3d2c33f031bf10130992d306",
        public_key: "9fb927c978225cb7a93b8b3cd8d8423e176e009dc284c536d9c4372bbe128487",
    };


    const claimDataArgs = new Struct(structClaimData, [
        new Field(
            new BytesValue(Buffer.from(new Nonce(Number(nftTransferDetailsObject.tokenId)).hex(), "hex")),
            "token_id"
        ),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.sourceChain)), "source_chain"),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.destinationChain)), "destination_chain"),
        new Field(
            new AddressValue(new Address(nftTransferDetailsObject.destinationUserAddress)),
            "destination_user_address"
        ),
        new Field(
            new BytesValue(Buffer.from(nftTransferDetailsObject.sourceNftContractAddress)),
            "source_nft_contract_address"
        ),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.name)), "name"),
        new Field(new BytesValue(Buffer.from("N" + nftTransferDetailsObject.sourceChain.toUpperCase())), "symbol"),
        new Field(new BigUIntValue(Number(nftTransferDetailsObject.royalty)), "royalty"),
        new Field(new AddressValue(new Address(nftTransferDetailsObject.royaltyReceiver)), "royalty_receiver"),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.metadata)), "attrs"),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.transactionHash)), "transaction_hash"),
        new Field(new BigUIntValue(nftTransferDetailsObject.tokenAmount), "token_amount"),
        new Field(new BytesValue(Buffer.from(nftTransferDetailsObject.nftType)), "nft_type"),
        new Field(new BigUIntValue(nftTransferDetailsObject.fee), "fee"),
    ]);

    const data = [
        claimDataArgs,
        [
            {
                public_key: new AddressValue(new Address(Buffer.from(signature.public_key, "hex"))),
                sig: new BytesValue(Buffer.from(signature.sig.replace(/^0x/, ""), "hex")),
            },
        ],
        VariadicValue.fromItems(
            new BytesValue(
                Buffer.from("https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb/9999.png", "utf-8")
            ),
            new BytesValue(Buffer.from(nftTransferDetailsObject.metadata, "utf-8"))
        ),
    ];

    const transaction = bridgeContract.methods
        .claimNft721(data)
        .withSender(signer.getAddress())
        .withNonce(account.getNonceThenIncrement())
        .withChainID("D")
        .withGasLimit(6_000_000_00)
        .withValue(new BigUIntValue(new BigNumber("50000000000000000")))
        .buildTransaction();

    transaction.applySignature(await signer.sign(transaction.serializeForSigning()));
    const hash = await proxyNetworkProvider.sendTransaction(transaction);
    console.log(hash);
}

const address = new Address("erd1ymdj4ze52a0tmcjzeyhcntzaf5uxpn2d6t203yreh6qx6fqeftgqmz9ly6");
const account = new Account(address);

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

    false && (await claim(account, signer));
    //transferToSc(bridgeAddress, account, signer, "ALX-afef0b-01", "01");
    await createNft("ALX-afef0b-55", address, account, signer);

    const query = bridgeContract.createQuery({
        func: "originalToDuplicateMapping",
        args: [],
        //caller: signer.getAddress(),
    });

    const provider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");

    const queryResponse = await provider.queryContract(query);

    const def = bridgeContract.getEndpoint("originalToDuplicateMapping");

    const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, def);
    const count = firstValue?.valueOf();

    const decodedMapping = count.map((pair: any) => {
        return pair.flatMap((item: any[]) => {
            return Object.keys(item).map((key: any) => ({ [key]: Buffer.from(item[key]).toString() }));
        });
    });

    const pair = decodedMapping.find((item: []) =>
        item.find((obj) => Object.values(obj).find((val) => val === "NSA-42b661"))
    );

    console.log(pair[0].field0, pair[1].field1);

    //console.log(decodeBase64Array(res.returnData), "res");
    //await createNft("ALX-afef0b-07", address, account, signer);
    //await createNft("ALX-afef0b-08", address, account, signer);
    //await createNft("ALX-afef0b-09", address, account, signer);
    //await createNft("ALX-afef0b-10", address, account, signer);
})();*/

//console.log(bridgeContract);
