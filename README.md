# XP Network JS API

### Work In Progress / Alpha Stage Library

Features Available :-

- [x] Minting NFTs
- [x] Transferring NFTs between chains
- [x] Listing NFTs
- [x] Estimating the TX fee
- [ ] ... and More

  ### Create a moralis account

  Before getting started, we recommend making a moralis account if you dont have one already. We use moralis to query WEB3 Blockchain nodes to query the NFTs owned by an address.

  - [Register for a free Moralis account here](https://admin.moralis.io/register)

  When your account created, click the "View Details" button and take the "Server URL" & "Application ID". We will need this in the later part of this section.

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
  const elrond = await factory.inner<ElrondHelper, ElrondParams>(Chain.ELROND);
  const tron = await factory.inner<TronHelper, TronParams>(Chain.TRON);
  ```

- Just call the mint function on the factory with suitable arguments.

  1. For Web3 Chains:

  ```javascript
  // Web3Provider generally refers to a walletProvider like Metamask.
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

  2. For Elrond:

  ```javascript
  // Dont forget to import ExtensionProvider from @elrondnetwork/erdjs library.
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
  // Choose an NFT to transfer, we are choosing the first one here.
  const theChosenOne = nfts[0];
  ```

- Getting a Wallet/Signer to sign the transaction. This could be done in many ways. i.e.

  For Example:

  1. Via Ethers : We need the provider from the config of the source chain and the Private Key of the Signer/Sender/Owner.

  ```javascript
  // Dont forget to import Wallet from ethersjs.
  const signer = new Wallet(
    "PRIVATE KEY HERE",
    mainnetConfig.avalancheParams.provider
  );
  ```

  2. Via Metamask: Connecting to metamask is beyond the library's scope. but, to get the signer from metamask.

  ```javascript
  const signer = metamaskProvider.getSigner();
  ```

  3. For other methods, check this repo [Mainnet-UI](https://github.com/xp-network/mainnet-bridge-ui).

- Call the transferNft function on the factory with suitable arguments

  ```javascript
  factory.transferNft(
    avax, // Source Chain.
    bsc, // Destination Chain.
    theChosenOne, // Or the nft of your choosing.
    signer, // or tronlink or maiar.
    "ADDRESS OF THE RECEIVER" // The address to whom you are transferring the NFT to.
  );
  ```

- The NFT will be transferred and added to the receiver's address.
