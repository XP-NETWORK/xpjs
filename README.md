# XP Network JS API

### Work In Progress / Alpha Stage Library

Features Available :-

- [x] Minting NFTs
- [x] Transferring NFTs between chains
- [x] Listing NFTs
- [x] Estimating the TX fee
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

  ### Create a moralis account
  - [Register your free Moralis account here:](https://admin.moralis.io/register)

1. Instantiate a ChainFactory from the package depending on the the network you want to use (i.e. Testnet or Mainnet). It has our smart contract address.
2. Add a moralis server that fits your needs
3. When the server is set up, click the "View Details" button and take the "Server URL" & "Application ID"

  ```javascript
  import { ChainFactories } from "xp.network/dist";

  const factory = ChainFactories.TestNetChainFactory({
    exchangeRateUri: "https://github.com/xp-network/exchange-rate#master-dist",
    moralisServer: "https://<moralis_server>/server", // The one you retrieved at step 3
    moralisAppId: "Application ID", // The one you retrieved at step 3
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
    exchangeRateUri: "https://github.com/xp-network/exchange-rate#master-dist",
    moralisServer: "https://<moralis_server>/server",
    moralisAppId: "Application ID",
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
    avax,
    bsc,
    nfts[0], // Or the nft of your choosing.
    new Wallet(
      "ADDRESS OF THE SENDER", // Can use Metamask for Web3 Chains, Tronlink for Tron
      avaxProvider        // and Maiar for Elrond if running in browser.
    ), 
    "ADDRESS OF THE RECEIVER"
  );
  ```

- The NFT will be transferred and added to the receiver's address.
