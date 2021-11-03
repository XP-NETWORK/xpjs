# XP Network JS API

### Work In Progress / Alpha Stage Library

Features Available :-

- [x] Minting NFTs
- [x] Bridge
- [ ] ... and More

## To Mint an NFT, Follow the steps as specified -

- First make sure nodejs is installed in your machine.

- Import xp.network package with the command

  ```
  yarn add xp.network
  ```

  OR

  ```
  npm install xp.network
  ```

- Instantiate a ChainFactory from the package depending on the the network you want to use (ie Testnet or Mainnet). It has our smart contract address.

  ```javascript
  import { ChainFactories } from "xp.network/dist";

  const factory = ChainFactories.TestNetChainFactory({
    exchangeRateUri: "https://<crypto-exchange-rate_backend>",
    moralisServer: "https://<moralis_server>/server",
    moralisAppId: "MORALIS_APP_ID",
  }); // You can also call the ChainFactories.MainNetChainFactory()
  ```

- Get the inner object from this factory

  ```javascript
  const avax = await factory.inner<Web3Helper, Web3Params>(Chain.AVALANCHE);
  ```

- Just call the mint function on the factory with suitable arguments

  ```javascript
  const receipt = await factory.mint(avax, web3Provider.getSigner(address), {
    // Could be an IPFS URL or Any URL that points to a Metadata
    uris: [metadata.url],
    attrs: description,
    name: name,
    contract: "Minter Address from Before",
  });
  ```

- That's it.

## To Transfer an NFT, Follow the steps as specified -

- Instantiate a ChainFactory from the package depending on the the network you want to use (ie Testnet or Mainnet). It has our smart contract address.

  ```javascript
  import { ChainFactories } from "xp.network/dist";

  const factory = ChainFactories.TestNetChainFactory({
    exchangeRateUri: "https://<crypto-exchange-rate_backend>",
    moralisServer: "https://<moralis_server>/server",
    moralisAppId: "MORALIS_APP_ID",
  }); // You can also call the ChainFactories.MainNetChainFactory()
  ```

- Get chain handlers for the source chain and the target chain.

  ```javascript
  const avax = await factory.inner<Web3Helper, Web3Params>(Chain.AVALANCHE);
  const bsc = await factory.inner<Web3Helper, Web3Params>(Chain.BSC);
  ```

- Get NFTs Owned by the sender

```javascript
const nfts = await factory.nftList(avax, "NFT OWNER ADDRESS");
```

- Call the transferNft function on the factory with suitable arguments

  ```javascript
  factory.transferNft(
    heco,
    bsc,
    nfts[0], // Or the nft of your choosing.
    new Wallet(
      "ADDRESS OF SENDER", // Can use Metamask for Web3 Chains, Tronlink for Tron
      avaxProvider        // and Maiar for Elrond if running in browser.
    ), 
    "ADDRESS OF THE RECEIVER"
  );
  ```

- That's it. The NFT will be transferred and added to the receiver's address.
