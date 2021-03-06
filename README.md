<center>

# XP Network JS API

</center>

### Work In Progress / Alpha Stage Library

<br/>
Bridging steps:
<br/>

- [x] [1. Installing the library](#1-install-the-libraries-required-for-the-project)
- [x] [2. Importing the dependencies](#2-import-the-dependencies)
- [x] [3. Getting the signer objects](#3-get-the-signer-objects)
  - [x] [3.1 Backend unsafe signer](#31-example-of-getting-the-signer-object-for-manual-testing-in-the-be)
  - [x] [3.2 EVM compatible browser extension signer](#32-example-of-getting-the-signer-object-in-the-fe-for-web3)
  - [x] [3.3 Elrond signer](#33-example-of-getting-the-signer-object-in-the-fe-for-elrond)
  - [x] [3.4 Tron signer](#34-example-of-getting-the-signer-object-in-the-fe-for-tron)
  - [x] [3.5 Algorand signer](#35-example-of-getting-the-signer-object-in-the-fe-for-algorand)
- [x] [4. Getting the Chain inner objects](#4-getting-the-inner-objects-from-this-factory-to-be-used-for-transferring-minting-estimation-of-gas-fees)
- [x] [5. Listing NFTs](#51-listing-nfts-owned-by-the-sender)
  - [x] [Example of a native NFT object](#52-example-of-console-logged-native-bsc-nft-object)
  - [x] [Example of a wrapped NFT object](#53-example-of-the-console-logged-wrapped-nft-from-bsc-on-velas)
- [x] [6. Approving](#6-approve-accessing-your-nft-by-the-bridge-smart-contract)
- [x] [7. Transferring NFTs between chains](#7-transferring-an-nft)
- [x] [Minting NFTs](#minting-nfts-on-evm-chains-elrond--tron)(optional)
- [x] [Estimating the TX fee on the target chain](#estimating-the-transaction-fee-on-the-target-chain) (optional)
- [ ] ... and much more to come

<hr/><br/><center>

## To list and transfer NFTs, follow the steps below:

</center>
<br/>

Make sure [nodejs](https://nodejs.org/en/download/) is installed on your machine.<br/>
<br/>

### 1. Install the libraries required for the project:

<br/>

```bash
yarn add xp.network @elrondnetwork/erdjs ethers @taquito/taquito @temple-wallet/dapp
```

OR

```bash
npm i --save xp.network @elrondnetwork/erdjs ethers @taquito/taquito @temple-wallet/dapp
```

To import the latest version of xp.network v.2.0 library:

```bash
yarn add "git+https://github.com/xp-network/xpjs#bleeding-edge" @elrondnetwork/erdjs ethers @taquito/taquito @temple-wallet/dapp
```

<br/>

### 2. Import the dependencies<br/><br/>

```javascript
import {
  ChainFactoryConfigs,
  ChainFactory,
  Chain,
  AppConfigs,
  ChainParams,

import { config } from 'dotenv';
config();} from "xp.network";

(async () => {
  // Instantiate the chain factory for the
  // Connecting to the mainnnets of all the blockchains:
  const mainnetConfig = await ChainFactoryConfigs.MainNet();
  const mainnetFactory: ChainFactory = ChainFactory(
    AppConfigs.MainNet(),
    mainnetConfig
  );

  // Connecting to the testnets of all the blockchains:
  const testnetConfig = await ChainFactoryConfigs.TestNet();
  const testnetFactory: ChainFactory = ChainFactory(
    AppConfigs.TestNet(),
    testnetConfig
  );

  // Switching between the mainnets & the testnets:
  const factory: ChainFactory = mainnetFactory;       // or = testnetConfig;
  const CONFIG: Partial<ChainParams> = mainnetConfig; // or = testnetConfig;
})();
```

<hr/><br/>

## 3. Get the signer objects

### 3.1 Example of getting the signer object (for manual EVM testing in the BE)

Avoid using 3.1 setup in production. Use it for initial or backend testing only.
<br/>

Add your private key to the environment:

```bash
touch .env
echo "SK=<Replace this with your Private Key>" >> .env
```

```javascript
// EVM chains compatible wallet:
import { Wallet } from "ethers";
import { config } from 'dotenv';
config();
// EVM signer for testing in the BE
const signer = new Wallet(
        process.env.SK!,
        // Replace 'polygonParams'
        // with the relevant parameter
        // from the table below
        CONFIG.polygonParams?.provider
    );
```

<center>

|   Chain   |   Parameters    | Chain Nonce |
| :-------: | :-------------: | :---------: |
|  Elrond   |  elrondParams   |      2      |
|    BSC    |    bscParams    |      4      |
| Ethereum  |  ropstenParams  |      5      |
| Avalanche | avalancheParams |      6      |
|  Polygon  |  polygonParams  |      7      |
|  Fantom   |  fantomParams   |      8      |
|   Tron    |   tronParams    |      9      |
|  Harmony  |  harmonyParams  |     12      |
|   xDai    |   xDaiParams    |     14      |
| Algorand  | algorandParams  |     15      |
|   Fuse    |   fuseParams    |     16      |
|   Tezos   |   tezosParams   |     18      |
|   Velas   |   velasParams   |     19      |
|  Aurora   |  auroraParams   |     21      |
| Godwoken  | godwokenParams  |     22      |
| Gatechain | gatechainParams |     23      |
|  VeChain  |  vechainParams  |     25      |
|  Solana   |  solanaParams   |     26      |
|    TON    |    tonParams    |     27      |
|  DFinity  |  dfinityParams  |     28      |
|  Hedera   |  hederaParams   |     29      |
|   Skale   |   skaleParams   |     30      |

</center><br/>

### 3.2 Example of getting the signer object (in the FE for web3):<br/><br/>

```typescript
// EVM chains compatible signer:
import ethers from "ethers";
const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
```

<br/>

### 3.3 Example of getting the signer object (in the FE for Elrond):<br/><br/>

```typescript
// ELROND provider (injected from the browser extension):
import { ExtensionProvider } from "@elrondnetwork/erdjs/out";
const elrondSigner = ExtensionProvider.getInstance();

// Elrond signer from a PEM key stored in the .env file
import { UserSigner } from "@elrondnetwork/erdjs/out";
const elrondSigner = UserSigner.fromPem(process.env.ELROND_PEM!);
```

<br/>

### 3.4 Example of getting the signer object (in the FE for Tron):<br/><br/>

```typescript
// Address is fetched from tronweb
(async () => {
  const addresses = await window.tronLink.tronWeb.request({
    method: "tron_requestAccounts",
  });
  const tronSigner = addresses[0];
})();
```

### 3.5 Example of getting the signer object (in the FE for Algorand):<br/><br/>

```typescript
import { typedAlgoSigner } from "xp.network/dist/helpers/algorand";
// Use the typedAlgoSigner function to get access to the Algorand signer
const algorandSigner = typedAlgoSigner();
```

### 3.6 Example of getting the signer object (in the FE for Tezos):<br/><br/>

```typescript
import { TempleWallet } from "@temple-wallet/dapp";
(async () => {
  try {
    const available = await TempleWallet.isAvailable();
    if (!available) {
      throw new Error("Temple Wallet is not installed");
    }
    const tezosSigner = new TempleWallet("bridge.xp.network");
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

<hr/>

For the ways of connecting the wallets in the FE check-out our [bridge repository](https://github.com/xp-network/bridge-interface/blob/components-reorder/src/components/ConnectWallet.jsx)

<hr/>

### 4. Getting the inner objects from this factory to be used for transferring, minting, and estimation of gas fees.<br/><br/>

```javascript
(async () => {
  // EVM compatible chains:
  // Inner Object ====================================== Chain Nonce
  const bsc = await factory.inner(Chain.BSC); // 4
  const ethereum = await factory.inner(Chain.ETHEREUM); // 5
  const avax = await factory.inner(Chain.AVALANCHE); // 6
  const polygon = await factory.inner(Chain.POLYGON); // 7
  const fantom = await factory.inner(Chain.FANTOM); // 8
  const harmony = await factory.inner(Chain.HARMONY); // 12
  const gnosis = await factory.inner(Chain.XDAI); // 14
  const fuse = await factory.inner(Chain.FUSE); // 16
  const velas = await factory.inner(Chain.VELAS); // 19
  const aurora = await factory.inner(Chain.AURORA); // 21
  const godwoken = await factory.inner(Chain.GODWOKEN); // 22
  const gatechain = await factory.inner(Chain.GATECHAIN); // 23
  const vechain = await factory.inner(Chain.VECHAIN); // 25
  const hedera = await factory.inner(Chain.HEDERA); // 29
  const skale = await factory.inner(Chain.SKALE); // 30

  // Non-EVM chains:
  // Inner Object ====================================== Chain Nonce
  const elrond = await factory.inner(Chain.ELROND); // 2
  const tron = await factory.inner(Chain.TRON); // 9
  const algorand = await factory.inner(Chain.ALGORAND); // 15
  const tezos = await factory.inner(Chain.TEZOS); // 18
  const solana = await factory.inner(Chain.SOLANA); // 26
  const ton = await factory.inner(Chain.TON); // 27
  const dfinity = await factory.inner(Chain.DFINITY); // 28
})();
```

<hr/><br/>

### 5.1 Listing NFTs Owned by the sender.<br/><br/>

This operation does not depend on a wallet since reading operations are free and, therefore, do not require signing.
<br/>

```javascript
(async () => {
  // EVM:
  const web3Nfts = await factory.nftList(
    harmony, // The chain of interest
    "0x...." // The public key of the NFT owner in a web3 chain
  );

  // Elrond:
  const elrondNfts = await factory.nftList(
    elrond, // The chain of interest
    "erd1...." // The public key of the NFT owner in Elrond
  );

  // Tron:
  const tronNfts = await factory.nftList(
    tron, // The chain of interest
    "TJuG..." // The public key of the NFT owner in Tron
  );

  // Algorand:
  const algoNfts = factory.nftList(
    algorand, // Algorand chain internal object
    "PUPTH..." // The public key of the NFT owner in Algorand
  );

  // Tezos:
  const tezosNfts = await factory.nftList(
    tezos, // Tezos chain internal object
    "tz1..." // The public key of the NFT owner in Tezos
  );
})();
```

```javascript
// Choosing an NFT to transfer:
const web3ChosenOne = web3Nfts[0];
const elrondChosenOne = elrondNfts[0];
const tronChosenOne = tronNfts[0];
const algoChosenOne = algoNfts[0];
const tezosChosenOne = tezosNfts[0];

// Checking the selected NFT object
console.log("EVM Selected NFT:       ", web3ChosenOne);
console.log("Elrond Selected NFT:    ", elrondChosenOne);
console.log("Tron Selected NFT:      ", tronChosenOne);
console.log("Algorand Selected NFT:  ", algoChosenOne);
console.log("Tezos Selected NFT:     ", tezosChosenOne);
```

### 5.2 Example of console logged native BSC NFT object:

```json
{
  "uri": "https://api.alturanft.com/meta/chain-caders/",
  "native": {
    "chainId": "4", // ChainId (4 = BSC)
    "tokenId": "2639", // ID in the NFT smart contract
    "contract": "0x387d38eEaaa7F1235c00aE6ee9b1462c026007f4",
    "owner": "0x6449b68cc5675f6011e8DB681B142773A3157cb9",
    "uri": "https://api.alturanft.com/meta/chain-caders/",
    "symbol": null,
    "name": "ChainCaders", // Collection Name
    "contractType": "ERC1155"
  },
  "collectionIdent": "0x387d38eeaaa7f1235c00ae6ee9b1462c026007f4"
}
```

### 5.3 Example of the console logged wrapped NFT

```json
{
  "uri": "https://nft.xp.network/w/30576349324667796398547334318",
  "native": {
    "chainId": "4", // Original chainId
    "tokenId": "30576349324667796398547334318", // Wrapped ID
    "contract": "0x8Ae5Fa4DDb131695CDe906BE03b33ebb277DF9A4", // Original Owner
    "owner": "0x6449b68cc5675f6011e8DB681B142773A3157cb9",
    "uri": "https://nft.xp.network/w/30576349324667796398547334318", // Original URI
    "symbol": "vr3DNFTs", // Custom collection name
    "name": "Virtual Reality 3D NFTs", // Custom collection name
    "contractType": "ERC721"
  },
  "collectionIdent": "0x8ae5fa4ddb131695cde906be03b33ebb277df9a4"
}
```

<hr/><br/>

### 6. Approve accessing your NFT by the bridge smart contract<br/><br/>

```javascript
(async () => {
  // EVM example
  const isApprovedEVM = await harmony.approveForMinter(web3ChosenOne, signer);
  console.log("Is Approved in an EVM:", isApprovedEVM);

  // Elrond example
  const isApprovedElrond = await elrond.approveForMinter(
    elrondChosenOne,
    elrondSigner
  );
  console.log("Is Approved in Elrond:", isApprovedElrond);

  // Tron example
  const isApprovedTron = await elrond.approveForMinter(
    tronChosenOne,
    tronSigner
  );
  console.log("Is Approved in Tron:", isApprovedTron);

  // Algorand example
  const isApprovedAlgorand = await algorand.approveForMinter(
    algoChosenOne,
    algorandSigner
  );
  console.log("Is Approved in Algorand:", isApprovedAlgorand);

  // Tezos example
  const isApprovedTezos = await algorand.approveForMinter(
    tezosChosenOne,
    tezosSigner
  );
  console.log("Is Approved in Tezos:", isApprovedTezos);
})();
```

<hr/><br/>

### 7. Transferring an NFT<br/><br/>

```javascript
(async () => {
  // EVM compatible chains example:
  const web3Result = await factory.transferNft(
    harmony, // The Source Chain.
    bsc, // The Destination Chain.
    theChosenOne, // The NFT object you have chosen from the list.
    signer, // The web3 signer object (see p. 3.2 above).
    "ADDRESS OF THE RECEIVER" // The address whom you are transferring the NFT to.
  );
  console.log(web3Result);

  // Elrond example:
  const elrondResult = await factory.transferNft(
    elrond, // The Source Chain.
    tron, // The Destination Chain.
    elrondChosenOne, // The NFT object you have chosen from the list.
    elrondSigner, // The Elrond signer object (see p. 3.3 above).
    "ADDRESS OF THE RECEIVER" // The address whom you are transferring the NFT to.
  );
  console.log(elrondResult);

  // Tron example:
  const tronResult = await factory.transferNft(
    tron, // The Source Chain.
    elrond, // The Destination Chain.
    tronChosenOne, // The NFT object you have chosen from the list.
    tronSigner, // The Tron signer object (see p. 3.4 above).
    "ADDRESS OF THE RECEIVER" // The address whom you are transferring the NFT to.
  );
  console.log(tronResult);

  // Algorand example:
  const algorandResult = await factory.transferNft(
    algorand, // The Source Chain.
    elrond, // The Destination Chain.
    algoChosenOne, // The NFT object you have chosen from the list.
    algorandSigner, // The Tron signer object (see p. 3.5 above).
    "ADDRESS OF THE RECEIVER" // The address whom you are transferring the NFT to.
  );
  console.log(algorandResult);

  // Tezos example:
  const tezosResult = await factory.transferNft(
    tezos, // The Source Chain.
    velas, // The Destination Chain.
    algoChosenOne, // Or the NFT object you have chosen from the list.
    algorandSigner, // The Tron signer object (see p. 3.5 above).
    "ADDRESS OF THE RECEIVER" // The address whom you are transferring the NFT to.
  );
  console.log(tezosResult);
})();
```

<br/><hr/><br/><center>

## Minting NFTs on EVM chains, Elrond & Tron

<br/>
</center>

- Just call the mint function on the factory with suitable arguments.

<br/>

1. For Web3 Chains:

```javascript
(async () => {
  // Web3Provider generally refers to a walletProvider like Metamask.
  const receipt = await factory.mint(
    avax, // The chain where to mint
    signer, // The browser injected signer
    {
      // Could be an IPFS URL or Any URL that points to a Metadata
      uris: [metadata.url],
      // Description of your NFT. Can be an object.
      attrs: description,
      // A name that defines your NFT.
      name: name,
      // The contract with which you want to mint the NFT.
      contract: "Can be fetched from the mainnetConfig or testnetConfig",
    }
  );
})();
```

<br/>

2. For Elrond:<br/>

```javascript
(async () => {
  // Deploying ESDTs:
  const response = await elrond.issueESDTNft(
      elrondSigner,
      "Target",
      "TGT",
      true, // canFreeze
      true, // canWipe
      true  // canTransferNftCreateRole
  );

  // Checking whether ESDTs exist for this account
  const esdts = await elrond.mintableEsdts(
    elrondSigner.getAddress())
    .catch((e) => {
      console.log("Failed to get Mintable ESDTs", e)
      return undefined
  })

    const identifier = esdts ? esdts[0]: undefined;

    if (!identifier) {
        throw new Error("No ESDT found for this address");
    }

    // Minting an NFT to an ESDT
    const response = await elrond.mintNft(
      elrondSigner,
      {
        identifier,  // Your ESDT token
        quantity: 1, // How many tokens you want to mint > 0
        name: "Your token name goes here",
        uris: ["replace with your link(s)"],
     } as any);

    console.log(response)
})();
```

<br/>

3.  For Tron:

```javascript
const receipt = await factory.mint(avax, tronSigner, {
  // Could be an IPFS URL or Any URL that points to a Metadata
  uris: [metadata.url],
  // Description of your NFT. Can be an object.
  attrs: description,
  // A name that defines your NFT.
  name: name,
  // The contract with which you want to mint the NFT.
  contract: "Can be fetched from the mainnetConfig or testnetConfig",
});
```

  <hr/>

P.S. The library is a work in progress. More features will be added soon.

 <hr/><br/>

## Estimating the transaction fee on the target chain

```typescript
(async () => {
  const feeEstimation = await factory.estimateFees(
    algorand, // The Source Chain.
    tezos, // The Destination Chain.
    algoChosenOne, // The NFT object you have chosen from the list.
    "tz1..." // The public key of the NFT owner in Tezos
  );
  console.log(`The estimated fee on Tezos is: ${feeEstimation} Algos`);
})();
```

<br/>

## <center>Troubleshooting</center><br/>

- In case you're using the library in a console application and getting errors, go to:
- node_modules/xpnet-nft-list/dist/nft-list/model/moralis/MoralisNftListService.js

Now your line #7 looks like this (to be used in the FE):

```javascript
7   const moralis_1 = __importDefault(require("moralis"));
```

Change it like so (for BE usage):

```javascript
7   const moralis_1 = __importDefault(require("moralis/node"));
```
