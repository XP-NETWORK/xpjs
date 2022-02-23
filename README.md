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
- [ ] ... and there's much more to come

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

To import the latest version of xp.network library:

```bash
yarn add "git+https://github.com/xp-network/xpjs#master-dist" @elrondnetwork/erdjs ethers @taquito/taquito @temple-wallet/dapp
```

<br/>

### 2. Import the dependencies<br/><br/>

```javascript
import {
  ChainFactoryConfigs,  ChainFactory,
  ElrondHelper,         ElrondParams,
  TronHelper,           TronParams,
  Web3Helper,           Web3Params,
  typedAlgoSigner
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

<hr/><br/>
<center>

## 3. Get the signer objects

<br/>

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
| Harmony | harmonyParams |

</center><br/>

### 3.1 Example of getting the signer object (for manual EVM testing in the BE)
Avoid using 3.1 setup in production. Use it for initial or backend testing only.
<br/>

```javascript
// EVM chains compatible wallet:
import { Wallet } from "ethers";
// EVM signer for testing in the BE
const signer = new Wallet(
  "PRIVATE KEY HERE",
  mainnetConfig.polygonParams?.provider
);
```
<br/>

### 3.2 Example of getting the signer object (in the FE for web3):<br/><br/>

```typescript
// EVM chains compatible signer:
import ethers from 'ethers';
const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
```
<br/>

### 3.3 Example of getting the signer object (in the FE for Elrond):<br/><br/>
```typescript
// ELROND provider:
import { ExtensionProvider } from "@elrondnetwork/erdjs/out";
const elrondSigner = ExtensionProvider.getInstance();
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
      throw new Error("Temple Wallet not installed");
    }
    const tezosSigner = new TempleWallet("bridge.xp.network");
})();
```

<hr/>

For the ways of connecting the wallets in the FE check-out our [bridge repository](https://github.com/xp-network/bridge-interface/blob/components-reorder/src/components/ConnectWallet.jsx)

<hr/>

### 4. Getting the inner objects from this factory to be used for transferring, minting, estimation of gas fees.<br/><br/>

```javascript
(async () => {
  // EVM-compatible chains:
  // Inner Object ====================== Chain Nonce ==
  const ethereum  = await factory.inner(Chain.ETHEREUM);
  const bsc       = await factory.inner(Chain.BSC);
  const polygon   = await factory.inner(Chain.POLYGON);
  const avax      = await factory.inner(Chain.AVALANCHE);
  const fantom    = await factory.inner(Chain.FANTOM);
  const velas     = await factory.inner(Chain.VELAS);
  const gnosis    = await factory.inner(Chain.XDAI);
  const harmony    = await factory.inner(Chain.HARMONY);

  // Non-EVM chains:
  // Inner Object ====================== Chain Nonce ==
  const algorand  = await factory.inner(Chain.ALGORAND);
  const elrond    = await factory.inner(Chain.ELROND);
  const tezos     = await factory.inner(Chain.TEZOS);
  const tron      = await factory.inner(Chain.TRON);
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
    harmony,     // The chain of interest
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

  // Algorand:
  const algoNfts = factory.nftList(
    algorand,   // Algorand chain internal object
    "PUPTH..."  // The public key of the NFT owner in Algorand
  );

  // Tezos:
  const tezosNfts = await factory.nftList(
    tezos,    // Tezos chain internal object
    "tz1..."  // The public key of the NFT owner in Tezos
  );

})();
```

```javascript
// Choosing an NFT to transfer:
const web3ChosenOne     = web3Nfts[0];
const elrondChosenOne   = elrondNfts[0];
const tronChosenOne     = tronNfts[0];
const algoChosenOne     = algoNfts[0];
const tezosChosenOne    = tezosNfts[0];

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
    "boosterId": 10000000788939,
    "id": "10002366816",
    "txHash": "0x37c9b7c54ac05d5e00dd5cff06722fb67bed91ec91732875071f74bce8752e41",
    "randomNumber": "0x1459a03e3d7a5510023e7385d438508d725dd19de2237c6c1d79a9883b6dc0b3",
    "image": "https://assets.polkamon.com/images/Unimons_T02C03H06B04G00.jpg",
    "external_url": "https://polkamon.com/polkamon/T02C03H06B04G00",
    "description": "The Unifairy are the most magical and fairest of Polkamon. Their wings stretch into the realms beyond this world, enchanting those around her by her unique disposition.",
    "name": "Unifairy",
    "initialProbabilities": {
        "horn": 0.2,
        "color": 0.25,
        "background": 1,
        "glitter": 0.99,
        "type": 0.135
    },
    "attributes": [
        {
            "trait_type": "Type",
            "value": "Unifairy"
        },
        {
            "trait_type": "Horn",
            "value": "Spiral Horn"
        },
        {
            "trait_type": "Color",
            "value": "Blue"
        },
        {
            "trait_type": "Background",
            "value": "Mountain Range"
        },
        {
            "trait_type": "Opening Network",
            "value": "Binance Smart Chain"
        },
        {
            "trait_type": "Glitter",
            "value": "No"
        },
        {
            "trait_type": "Special",
            "value": "No"
        },
        {
            "display_type": "date",
            "trait_type": "Birthday",
            "value": 1633650473
        },
        {
            "display_type": "number",
            "trait_type": "Booster",
            "value": 10000000788939
        }
    ],
    "opening_network": "Binance Smart Chain",
    "background_color": "FFFFFF",
    "animation_url": "https://assets.polkamon.com/videos/Unimons_T02C03H06B04G00.mp4",
    "code": "T02C03H06B04G00",
    "uri": "https://meta.polkamon.com/meta?id=10002366816",
    "native": {
        "chainId": "4",
        "tokenId": "10002366816",
        "owner": "0x0d7df42014064a163DfDA404253fa9f6883b9187",
        "contract": "0x85f0e02cb992aa1f9f47112f815f519ef1a59e2d",
        "symbol": "PMONC",
        "name": "PolkamonOfficialCollection",
        "uri": "https://meta.polkamon.com/meta?id=10002366816",
        "contractType": "ERC721"
    }
}
```

### 5.3 Example of the console logged wrapped NFT from BSC on Velas

```json
[
    {
        "name": "Unifairy",
        "description": "The Unifairy are the most magical and fairest of Polkamon. Their wings stretch into the realms beyond this world, enchanting those around her by her unique disposition.",
        "image": "https://assets.polkamon.com/images/Unimons_T02C03H06B04G00.jpg",
        "animation_url": "https://assets.polkamon.com/videos/Unimons_T02C03H06B04G00.mp4",
        "wrapped": {
            "contract": "0x85F0e02cb992aa1F9F47112F815F519EF1A59E2D",
            "tokenId": "10002366816",
            "origin": "4",
            "original_uri": "https://meta.polkamon.com/meta?id=10002366816"
        },
        "attributes": [
            {
                "trait_type": "Original Chain",
                "value": "BSC"
            },
            {
                "trait_type": "Original Chain Nonce",
                "value": "4"
            },
            {
                "trait_type": "Original URI",
                "value": "https://meta.polkamon.com/meta?id=10002366816"
            },
            {
                "trait_type": "Type",
                "value": "Unifairy"
            },
            {
                "trait_type": "Horn",
                "value": "Spiral Horn"
            },
            {
                "trait_type": "Color",
                "value": "Blue"
            },
            {
                "trait_type": "Background",
                "value": "Mountain Range"
            },
            {
                "trait_type": "Opening Network",
                "value": "Binance Smart Chain"
            },
            {
                "trait_type": "Glitter",
                "value": "No"
            },
            {
                "trait_type": "Special",
                "value": "No"
            },
            {
                "display_type": "date",
                "trait_type": "Birthday",
                "value": 1633650473
            },
            {
                "display_type": "number",
                "trait_type": "Booster",
                "value": 10000000788939
            }
        ],
        "uri": "https://wnfts.xp.network/w/61b8adae4298fe05d7a48962",
        "native": {
            "chainId": "19",
            "tokenId": "17",
            "owner": "0x0d7df42014064a163DfDA404253fa9f6883b9187",
            "contract": "0xFC2b3dB912fcD8891483eD79BA31b8E5707676C9",
            "symbol": "XPNFT",
            "name": "XpWrapNft",
            "uri": "https://wnfts.xp.network/w/61b8adae4298fe05d7a48962",
            "contractType": "ERC721"
        }
    }
]
```

<hr/><br/>

### 6. Approve accessing your NFT by the bridge smart contract<br/><br/>

```javascript
(async () => {
  // EVM example
  const isApprovedEVM = await harmony.approveForMinter(web3ChosenOne, signer);
  console.log("Is Approved in an EVM:", isApprovedEVM);

  // Elrond example
  const isApprovedElrond = await elrond.approveForMinter(elrondChosenOne, elrondSigner);
  console.log("Is Approved in Elrond:", isApprovedElrond);

  // Tron example
  const isApprovedTron = await elrond.approveForMinter(tronChosenOne, tronSigner);
  console.log("Is Approved in Tron:", isApprovedTron);

  // Algorand example
  const isApprovedAlgorand = await algorand.approveForMinter(algoChosenOne, algorandSigner);
  console.log("Is Approved in Algorand:", isApprovedAlgorand);

  // Tezos example
  const isApprovedTezos = await algorand.approveForMinter(tezosChosenOne, tezosSigner);
  console.log("Is Approved in Tezos:", isApprovedTezos);
})();
```

<hr/><br/>

### 7. Transferring an NFT<br/><br/>

```javascript
(async () => {
  // EVM compatible chains example:
  const web3Result = await factory.transferNft(
    harmony,                    // The Source Chain.
    bsc,                        // The Destination Chain.
    theChosenOne,               // The NFT object you have chosen from the list.
    signer,                     // The web3 signer object (see p. 3.2 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(web3Result);

  // Elrond example:
  const elrondResult = await factory.transferNft(
    elrond,                     // The Source Chain.
    tron,                       // The Destination Chain.
    elrondChosenOne,            // The NFT object you have chosen from the list.
    elrondSigner,               // The Elrond signer object (see p. 3.3 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(elrondResult);

  // Tron example:
  const tronResult = await factory.transferNft(
    tron,                       // The Source Chain.
    elrond,                     // The Destination Chain.
    tronChosenOne,              // The NFT object you have chosen from the list.
    tronSigner,                 // The Tron signer object (see p. 3.4 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(tronResult);

  // Algorand example:
  const algorandResult = await factory.transferNft(
    algorand,                   // The Source Chain.
    elrond,                     // The Destination Chain.
    algoChosenOne,              // The NFT object you have chosen from the list.
    algorandSigner,             // The Tron signer object (see p. 3.5 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
  );
  console.log(algorandResult);

  // Tezos example:
  const tezosResult = await factory.transferNft(
    tezos,                      // The Source Chain.
    velas,                      // The Destination Chain.
    algoChosenOne,              // Or the NFT object you have chosen from the list.
    algorandSigner,             // The Tron signer object (see p. 3.5 above).
    "ADDRESS OF THE RECEIVER"   // The address whom you are transferring the NFT to.
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
      avax,   // The chain where to mint
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
     const receipt = await factory.mint(
       elrond,        // The chain where to mint
       elrondSigner,  // The browser injected signer
       {
          // Could be an IPFS URL or Any URL that points to a Metadata
          uris: [metadata.url],
          // Description of your NFT. Can be an object.
          attrs: description,
          // A name that defines your NFT.
          name: name,
          // The identifier with which you want to mint the NFT. You have to own this identifier. i.e.
          identifier: "XPNFT-eda5d0-c5",
     });
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
            algorand,       // The Source Chain.
            tezos,          // The Destination Chain.
            algoChosenOne,  // The NFT object you have chosen from the list.
            "tz1..."        // The public key of the NFT owner in Tezos
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
