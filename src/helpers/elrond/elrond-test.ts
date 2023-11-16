//import { Mnemonic } from "@elrondnetwork/erdjs";

import {
  AbiRegistry,
  SmartContract,
  Address,
  Account,
  Transaction,
  TransactionPayload,
  ResultsParser,
  BigUIntValue,
} from "@multiversx/sdk-core";
import {
  ProxyNetworkProvider,
  ApiNetworkProvider,
} from "@multiversx/sdk-network-providers";
import { UserSigner, Mnemonic } from "@multiversx/sdk-wallet";
import abi from "./v3Bridge_abi.json";

import BigNumber from "bignumber.js";

const f = Mnemonic.fromString(
  `evidence liberty culture stuff canal minute toward trash boil cry verb recall during citizen social upper budget ranch distance business excite fox icon tool`
);
const proxyNetworkProvider = new ProxyNetworkProvider(
  "https://devnet-gateway.multiversx.com"
);
const apiNetworkProvider = new ApiNetworkProvider(
  "https://devnet2-api.multiversx.com"
);
const signer = new UserSigner(f.deriveKey());

const bridgeAddress = new Address(
  "erd1qqqqqqqqqqqqqpgqghvly0npf6ewpmzh47ud76ssh6nppu4e7hnses7qlz"
);
const abiRegistry = AbiRegistry.create(abi);
const bridgeContract = new SmartContract({
  address: bridgeAddress,
  abi: abiRegistry,
});
bridgeContract;
const collectionName = "Alex";
const collectionTicker = "ALX";
const collectionIdentifier = "ALX-afef0b";

async function createNftCollection(
  sender: Address,
  account: Account,
  signer: UserSigner
) {
  let name = Buffer.from(collectionName).toString("hex");
  let ticker = Buffer.from(collectionTicker).toString("hex");
  let canFreeze =
    "@" +
    Buffer.from("canFreeze").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canWipe =
    "@" +
    Buffer.from("canWipe").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canPause =
    "@" +
    Buffer.from("canPause").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canTransferNFTCreateRole =
    "@" +
    Buffer.from("canTransferNFTCreateRole").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canChangeOwner =
    "@" +
    Buffer.from("canChangeOwner").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canUpgrade =
    "@" +
    Buffer.from("canUpgrade").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
  let canAddSpecialRoles =
    "@" +
    Buffer.from("canAddSpecialRoles").toString("hex") +
    "@" +
    Buffer.from("true").toString("hex");
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
    receiver: new Address(
      "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
    ),
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

async function setSpecialRoles(
  address: Address,
  account: Account,
  signer: UserSigner,
  assignAddress: Address
) {
  let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
  let assigneeAddress = "@" + assignAddress.hex();
  let esdtRoleNftCreate =
    "@" + Buffer.from("ESDTRoleNFTCreate").toString("hex");
  const tx3 = new Transaction({
    data: new TransactionPayload(
      "setSpecialRole" + tokenIdentifier + assigneeAddress + esdtRoleNftCreate
    ),
    gasLimit: 70000000,
    sender: address,
    receiver: new Address(
      "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"
    ),
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

async function createNft(
  nftName: string,
  address: Address,
  account: Account,
  signer: UserSigner
) {
  let tokenIdentifier = "@" + Buffer.from(collectionIdentifier).toString("hex");
  let quantity = "@" + "01";
  let name = "@" + Buffer.from(nftName).toString("hex");
  let royalties = "@" + Buffer.from(new BigNumber("1")).toString("hex");
  let hash = "@" + Buffer.from("00").toString("hex");
  let attrs =
    "@" +
    Buffer.from(
      "metadata:https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb"
    ).toString("hex");
  let uri =
    "@" +
    Buffer.from(
      "https://ipfs.io/ipfs/QmUBFTnxZpaM7xrJ62Z9kNi3dfQwEWPQhthsnXdLEjJhDb/9999.png"
    ).toString("hex");
  let uri2 =
    "@" +
    Buffer.from(
      "https://ipfs.io/ipfs/QmSaY9zZnKWGa8jmMFNN6LrDGykjSiryUz8YeUjjJ97A8w/9999.json"
    ).toString("hex");
  const tx3 = new Transaction({
    data: new TransactionPayload(
      "ESDTNFTCreate" +
        tokenIdentifier +
        quantity +
        name +
        royalties +
        hash +
        attrs +
        uri +
        uri2
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
  let collectionIdentifiers =
    "@" + Buffer.from(collectionIdentifier).toString("hex");
  let noncec = "@" + nonce;
  let quantity = "@" + "01";
  let destination_address = "@" + bridgeAddress.hex();
  let method = "@" + Buffer.from("lock721").toString("hex");
  let token_id = "@" + Buffer.from(tokenId).toString("hex");
  let destination_chain = "@" + Buffer.from("BSC").toString("hex");
  let destination_user_address =
    "@" +
    Buffer.from("0x6f7C0c6A6dd6E435b0EEc1c9F7Bce01A1908f386").toString("hex");
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

const address = new Address(
  "erd1ymdj4ze52a0tmcjzeyhcntzaf5uxpn2d6t203yreh6qx6fqeftgqmz9ly6"
);
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
  //transferToSc(bridgeAddress, account, signer, "ALX-afef0b-01", "01");
  await createNft("ALX-afef0b-07", address, account, signer);

  //await createNft("ALX-afef0b-07", address, account, signer);
  //await createNft("ALX-afef0b-08", address, account, signer);
  //await createNft("ALX-afef0b-09", address, account, signer);
  //await createNft("ALX-afef0b-10", address, account, signer);
})();

//console.log(bridgeContract);
