# XP Network JS API

### Work In Progress / Alpha Stage Library

Features Available :-

- [x] Minting NFTs
- [ ] Bridge
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

- Import ChainFactory from the package and instantiate it with the params required i.e. for Avalanche

  ```javascript
  const factory = LibChainFactory(
    {
    ...,
    avalancheParams: {
      erc1155_addr: "ADDRESS OF ERC1155 CONTRACT",
      minter_abi: "The ABI OF MINTER CONTRACT",
      erc721_addr: "ADDRESS OF ERC721 CONTRACT",
      minter_addr: "ADDRESS OF MINTER CONTRACT",
      // Appropriate Provider for Each Chain. Could be coming from metamask/tron-link wallet. Here we are using metamask.
      provider: new ethers.providers.Web3Provider(await detectEthereumProvider()),
    },
    ...,
  });
  ```

- Get the inner object from this factory

  ```javascript
  const inner = await factory.inner(Chain.AVALANCHE);
  ```

- Just call the mint function on the factory with suitable arguments

  ```javascript
  const receipt = await factory.mint(inner, web3Provider.getSigner(address), {
    // Could be an IPFS URL or Any URL that points to a Metadata
    uris: [metadata.url],
    attrs: description,
    name: name,
    contract: "Minter Address from Before",
  });
  ```

- That's it.
