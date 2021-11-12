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

  - [Register for a free Moralis account here](https://admin.moralis.io/register)

  1. We use moralis to query WEB3 Blockchain nodes to query the NFTs owned by an address.
  2. When the server is set up, click the "View Details" button and take the "Server URL" & "Application ID"

  ```javascript
  import { ChainFactoryConfigs, ChainFactory } from "xp.network/dist";

  // Fetch the config for required networks i.e. Mainnet/Testnet
  // Networks from the ChainFactoryConfigs namespace. You can also mix
  // and match the configs to your heart's desire.
  const mainnetConfig = ChainFactoryConfigs.TestNet; // You can also call the ChainFactoryConfigs.MainNet

  // Create an object with the following details
  const moralisConfig = {
    exchangeRateUri: "https://github.com/xp-network/exchange-rate#master-dist", // Check our exchange-rate repository for this.
    moralisServer: "https://<moralis_server>/server", // The one you retrieved while creating a moralis account.
    moralisAppId: "Application ID", // The one you retrieved while creating a moralis account.
  };
  // Instantiate the factory by passing the above objects to the function call.
  const factory = ChainFactory(moralisConfig, mainnetConfig);
  ```

- Get the inner object from this factory. This is used for transferring, minting, estimation of gas fees. The param can be anything from the Chain Namespace. i.e Chain.BSC, Chain.HECO. Depends on which chain do you want to mint the NFTs.

  ```javascript
  const avax = await factory.inner<Web3Helper, Web3Params>(Chain.AVALANCHE);
  ```

- Just call the mint function on the factory with suitable arguments

  ```javascript
  const receipt = await factory.mint(avax, web3Provider.getSigner(address), {
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

- That's it.

## To Transfer an NFT, Follow the steps as specified -

- Instantiate a ChainFactory from the package depending on the the network you want to use (ie Testnet or Mainnet). It has our smart contract address.

  ```javascript
  import { ChainFactoryConfigs, ChainFactory } from "xp.network/dist";

  // Fetch the config for required networks i.e. Mainnet/Testnet
  // Networks from the ChainFactoryConfigs namespace. You can also mix
  // and match the configs to your heart's desire.
  const mainnetConfig = ChainFactoryConfigs.TestNet; // You can also call the ChainFactoryConfigs.MainNet

  // Create an object with the following details
  const moralisConfig = {
    exchangeRateUri: "https://github.com/xp-network/exchange-rate#master-dist", // Check our exchange-rate repository for this.
    moralisServer: "https://<moralis_server>/server", // The one you retrieved while creating a moralis account.
    moralisAppId: "Application ID", // The one you retrieved while creating a moralis account.
  };
  // Instantiate the factory by passing the above objects to the function call.
  const factory = ChainFactory(moralisConfig, mainnetConfig);
  ```

- Get chain handlers for the source chain and the target chain. This is used for transferring, minting, estimation of gas fees. The param can be anything from the Chain Namespace. i.e Chain.BSC, Chain.HECO. Depends on which chain do you want to transfer from/to.

  ```javascript
  const avax = await factory.inner<Web3Helper, Web3Params>(Chain.AVALANCHE);
  const bsc = await factory.inner<Web3Helper, Web3Params>(Chain.BSC);
  ```

- Get NFTs Owned by the sender.

  ```javascript
  const nfts = await factory.nftList(avax, "NFT OWNER ADDRESS");
  ```

- Call the transferNft function on the factory with suitable arguments

  ```javascript
  factory.transferNft(
    avax, // Source Chain.
    bsc, // Destination Chain.
    nfts[0], // Or the nft of your choosing.
    new Wallet(
      "ADDRESS OF THE SENDER", // Can use Metamask for Web3 Chains, Tronlink for Tron
      avaxProvider // and Maiar for Elrond if running in browser.
    ),
    "ADDRESS OF THE RECEIVER" // The person to whom you are transferring the NFT to.
  );
  ```

- The NFT will be transferred and added to the receiver's address.
