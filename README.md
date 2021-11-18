# XP Network JS API

### Work In Progress / Alpha Stage Library

Features Available :-

- [x] Listing NFTs
- [x] Transferring NFTs between chains
- [x] Minting NFTs
- [x] Estimating the TX fee
- [ ] ... and More to come

<hr/>

## To list and transfer NFTs, follow the steps below:

- Make sure [nodejs](https://nodejs.org/en/download/) is installed on your machine.

### 1. Import xp.network package into your project with the following command:

  ```
  yarn add xp.network @elrondnetwork/erdjs ethers
  ```

  OR

  ```
  npm install xp.network @elrondnetwork/erdjs ethers
  ```
<hr/>

### 2. Import the dependencies

  ```javascript
  import {  ChainFactoryConfigs,    ChainFactory,
            ElrondHelper,           ElrondParams,
            TronHelper,             TronParams,
            Web3Helper,             Web3Params,
  } from "xp.network/dist";
  // EVM chains compatible wallet:
  import { Wallet } from "ethers";
  // Chanin name to chain nonce mapper:
  import {Chain, Config} from 'xp.network/dist/consts';
  // Elrond provider:
  import { ExtensionProvider } from "@elrondnetwork/erdjs/out";

  // Fetch the config for required networks i.e. Mainnet/Testnet
  // Networks from the ChainFactoryConfigs namespace. You can also mix
  // and match the configs to your heart's desire.
  const mainnetConfig = ChainFactoryConfigs.MainNet; // You can also call the ChainFactoryConfigs.MainNet

  // Instantiate the factory by populating the function call with the above objects.
  const factory = ChainFactory(Config, mainnetConfig());
  ```
<hr/>

  ### 3. Getting the signer object
  ```javascript
  // Dont forget to import Wallet from ethersjs.
  import { Wallet } from "ethers";
  const signer = new Wallet(
    "PRIVATE KEY HERE",
    mainnetConfig().polygonParams?.provider
  );
  ```

<hr/>

### 4. Getting the inner objects from this factory that can be used for transferring, minting, estimation of gas fees.

  ```javascript
  const ethereum  = await factory.inner<Web3Helper,     Web3Params>  (Chain.ETHEREUM);
  const bsc       = await factory.inner<Web3Helper,     Web3Params>  (Chain.BSC);
  const polygon   = await factory.inner<Web3Helper,     Web3Params>  (Chain.POLYGON);
  const avax      = await factory.inner<Web3Helper,     Web3Params>  (Chain.AVALANCHE);
  const harmony   = await factory.inner<Web3Helper,     Web3Params>  (Chain.HARMONY);
  const celo      = await factory.inner<Web3Helper,     Web3Params>  (Chain.CELO);
  const fantom    = await factory.inner<Web3Helper,     Web3Params>  (Chain.FANTOM);
  const xdai      = await factory.inner<Web3Helper,     Web3Params>  (Chain.XDAI);
  const elrond    = await factory.inner<ElrondHelper,   ElrondParams>(Chain.ELROND);
  const tron      = await factory.inner<TronHelper,     TronParams>  (Chain.TRON);
  ```
<hr/>

### 5. Listing NFTs Owned by the sender.

This operation does not depend on a wallet, since reading operations are free and, therefore, do not require signing.

  ```javascript
  // Since nftList returns a Promise it's a good idea to await it which requires an async function
  (async () => {
    // Await the list of NFTs before trying to use it
    const nfts = await factory.nftList(
        polygon,    // The chain of interest 
        "0x...."    // The public key of the NFT owner
        );
    // Choosing an NFT to transfer:
    const theChosenOne = nfts[0];
    // Checking the selected NFT object
    console.log("My NFT #1", theChosenOne);
  })();
  ```
<hr/>

### 6. Approve accessing your NFT by the bridge smart contract
```javascript
// Since approveForMinter returns a Promise it's a good idea to await it which requires an async function
(async () => {
    // Await the result of the transaction before moving on to the next steps
    const isApproved = await polygon.approveForMinter(theChosenOne, signer);
    console.log("Is Approved:", isApproved)

})();
```
<hr/>

### 7. Transferring an NFT

  ```javascript
  // Since transferNft returns a Promise it's a good idea to await it which requires an async function
  (async () => {
    // Await the result of the transaction before trying to use it
    const result = await factory.transferNft(
      polygon,                    // The Source Chain.
      bsc,                        // The Destination Chain.
      theChosenOne,               // Or the NFT you have chosen.
      signer,                     // Or tronlink or maiar.
      "ADDRESS OF THE RECEIVER"   // The address who you are transferring the NFT to.
    );
    console.log(result)
  })();
  ```

<hr/>

## Minting NFTs on EVM chains, Elrond & Tron

- Just call the mint function on the factory with suitable arguments.

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

  2. For Elrond:

  ```javascript
  const receipt = await factory.mint(elrond, ExtensionProvider.getInstance(), {
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

  3.  For Tron:

  ```javascript
  // Address is fetched from tronweb
  const addresses = await window.tronLink.tronWeb.request({
    method: "tron_requestAccounts",
  });
  const receipt = await factory.mint(avax, addresses[0], {
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

 <hr/>

  ## Troubleshooting 

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
