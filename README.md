<center>

# XP Network JS API

</center>

### Work In Progress / Alpha Stage Library
<br>
Available Features:
<br>

- [x] Listing NFTs
- [x] Transferring NFTs between chains
- [x] Minting NFTs
- [x] Estimating the TX fee
- [ ] ... and More to come

<hr/><br><center>

## To list and transfer NFTs, follow the steps below:
</center>
<br>

Make sure [nodejs](https://nodejs.org/en/download/) is installed on your machine.<br>
<br>

### 1. Install the libraries required for the project:
<br>

```bash
yarn add xp.network @elrondnetwork/erdjs ethers
```

OR

```bash
npm i --save xp.network @elrondnetwork/erdjs ethers
```

To import the latest version of xp.network library:

```bash
yarn add "git+https://https://github.com/xp-network/xpjs#master-dist"
```

<br>

### 2. Import the dependencies<br><br>

```javascript
import {
  ChainFactoryConfigs,  ChainFactory,
  ElrondHelper,         ElrondParams,
  TronHelper,           TronParams,
  Web3Helper,           Web3Params,
} from "xp.network/dist";

// Chanin name to chain nonce mapper:
import { Chain, Config } from "xp.network/dist/consts";

// Instantiate the chain factory for the
// MAINNET
const mainnetConfig = ChainFactoryConfigs.MainNet();
const factory = ChainFactory(Config, mainnetConfig);
// or
// TESTNET
const testnetConfig = ChainFactoryConfigs.TestNet();
const factory = ChainFactory(Config, testnetConfig);
```

<hr/><br>
<center>

## 3. Get the signer objects

<br>

| Chain | Parameters |
|:-----:|:-----:|
| Elrond | elrondParams |
| BSC | bscParams |
| Ethereum | ropstenParams |
| Avalanche | avalancheParams |
| Polygon | polygonParams |
| Fantom | fantomParams |
| Tron | tronParams |
| xDai | xDaiParams |

</center><br>

### 3.1 Example of getting the signer object (for manual testing in the BE)

<br>

```javascript
// EVM chains compatible wallet:
import { Wallet } from "ethers";
// EVM signer for testing in the BE
const signer = new Wallet(
  "PRIVATE KEY HERE",
  mainnetConfig.polygonParams?.provider
);
```
<br>

### 3.2 Example of getting the signer object (in the FE for web3):<br><br>

```typescript
// EVM chains compatible signer:
import ethers from 'ethers';
const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
```
<br>

### 3.3 Example of getting the signer object (in the FE for Elrond):<br><br>
```typescript
// ELROND provider:
import { ExtensionProvider } from "@elrondnetwork/erdjs/out";
const elrondSigner = ExtensionProvider.getInstance();
```

### 3.4 Example of getting the signer object (in the FE for Tron):<br><br>
```typescript
// Address is fetched from tronweb
const addresses = await window.tronLink.tronWeb.request({
  method: "tron_requestAccounts",
});
const tronSigner = addresses[0];
```

<hr/>

For the ways of connecting the wallets in the FE check-out our [bridge repository](https://github.com/xp-network/bridge-interface/blob/components-reorder/src/components/ConnectWallet.jsx)

<hr/><br>

### 4. Getting the inner objects from this factory that can be used for transferring, minting, estimation of gas fees.<br><br>

```javascript
// EVM-compatible chains:
const ethereum  = await factory.inner<Web3Helper,     Web3Params>  (Chain.ETHEREUM);
const bsc       = await factory.inner<Web3Helper,     Web3Params>  (Chain.BSC);
const polygon   = await factory.inner<Web3Helper,     Web3Params>  (Chain.POLYGON);
const avax      = await factory.inner<Web3Helper,     Web3Params>  (Chain.AVALANCHE);
const fantom    = await factory.inner<Web3Helper,     Web3Params>  (Chain.FANTOM);
const xdai      = await factory.inner<Web3Helper,     Web3Params>  (Chain.XDAI);

// Non-EVM chains:
const elrond    = await factory.inner<ElrondHelper,   ElrondParams>(Chain.ELROND);
const tron      = await factory.inner<TronHelper,     TronParams>  (Chain.TRON);
```

<hr/><br>

### 5. Listing NFTs Owned by the sender.<br><br>

This operation does not depend on a wallet, since reading operations are free and, therefore, do not require signing.
<br>

```javascript
(async () => {

  // EVM:
  const web3Nfts = await factory.nftList(
    polygon,     // The chain of interest
    "0x...."     // The public key of the NFT owner in a web3 chain
  );

  // Elrond:
  const elrondNfts = await factory.nftList(
    elrond,     // The chain of interest
    "erd1...."  // The public key of the NFT owner in Elrond
  );

  // Tron:
  const tronNfts = await factory.nftList(
    tron,      // The chain of interest
    "TJuG..."  // The public key of the NFT owner in Tron
  );

})();
```

```javascript
// Choosing an NFT to transfer:
const web3ChosenOne = web3Nfts[0];
const elrondChosenOne = elrondNfts[0];
const tronChosenOne = tronNfts[0];

// Checking the selected NFT object
console.log("EVM Selected NFT:   ", web3ChosenOne);
console.log("Elrond Selected NFT:", elrondChosenOne);
console.log("tron Selected NFT:  ", tronChosenOne);
```

<hr/><br>

### 6. Approve accessing your NFT by the bridge smart contract<br><br>

```javascript
// EVM example
(async () => {
  const isApproved = await polygon.approveForMinter(theChosenOne, signer);
  console.log("Is Approved:", isApproved);
})();

// Elrond example
(async () => {
  const isApproved = await elrond.approveForMinter(theChosenOne, elrondSigner);
  console.log("Is Approved:", isApproved);
})();

// Tron example
(async () => {
  const isApproved = await elrond.approveForMinter(theChosenOne, tronSigner);
  console.log("Is Approved:", isApproved);
})();
```

<hr/><br>

### 7. Transferring an NFT<br><br>

```javascript
// EVM compatible chains example:
(async () => {
  const result = await factory.transferNft(
    polygon,                    // The Source Chain.
    bsc,                        // The Destination Chain.
    theChosenOne,               // Or the NFT object you have chosen from the list.
    signer,                     // The web3 signer object (see p. 3.2 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(result);
})();

// Elrond example:
(async () => {
  const result = await factory.transferNft(
    elrond,                     // The Source Chain.
    tron,                       // The Destination Chain.
    theChosenOne,               // Or the NFT object you have chosen from the list.
    elrondSigner,               // The Elrond signer object (see p. 3.3 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(result);
})();

// Tron example:
(async () => {
  const result = await factory.transferNft(
    tron,                       // The Source Chain.
    elrond,                     // The Destination Chain.
    theChosenOne,               // Or the NFT object you have chosen from the list.
    tronSigner,                 // The Tron signer object (see p. 3.4 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(result);
})();
```

<br><hr/><br><center>

## Minting NFTs on EVM chains, Elrond & Tron
<br>
</center>

- Just call the mint function on the factory with suitable arguments.
  
<br>

  1. For Web3 Chains:

  ```javascript
  // Web3Provider generally refers to a walletProvider like Metamask.
  const receipt = await factory.mint(avax, signer, {
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
<br>

  2. For Elrond:<br>

  ```javascript
  const receipt = await factory.mint(elrond, elrondSigner, {
    // Could be an IPFS URL or Any URL that points to a Metadata
    uris: [metadata.url],
    // Description of your NFT. Can be an object.
    attrs: description,
    // A name that defines your NFT.
    name: name,
    // The identifier with which you want to mint the NFT. You have to own this identifier. i.e.
    identifier: "PANDA-eda5d0-c5",
  });
  ```
<br>

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

 <hr/><br>

## <center>Troubleshooting</center><br>

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
