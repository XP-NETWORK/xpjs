"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tronHelperFactory = exports.baseTronHelperFactory = void 0;
const bignumber_js_1 = require("bignumber.js");
const ethers_1 = require("ethers");
const xpnet_web3_contracts_1 = require("xpnet-web3-contracts");
const __1 = require("..");
async function baseTronHelperFactory(provider) {
  const setSigner = (signer) => {
    return signer && provider.setPrivateKey(signer);
  };
  const deployErc721_i = async (deployer) => {
    setSigner(deployer);
    const contract = await provider.contract().new({
      abi: xpnet_web3_contracts_1.UserNftMinter__factory.abi,
      bytecode: xpnet_web3_contracts_1.UserNftMinter__factory.bytecode,
      feeLimit: 3000000000,
    });
    return contract;
  };
  const deployXpNft = async (deployer, nftPrefix) => {
    setSigner(deployer);
    const contract = await provider.contract().new({
      abi: xpnet_web3_contracts_1.XPNft__factory.abi,
      bytecode: xpnet_web3_contracts_1.XPNft__factory.bytecode,
      feeLimit: 3000000000,
      parameters: ["XPNFT", "XPNFT", nftPrefix],
    });
    return contract;
  };
  const deployXpNft1155 = async (deployer, nftPrefix) => {
    setSigner(deployer);
    const contract = await provider.contract().new({
      abi: xpnet_web3_contracts_1.XPNft1155__factory.abi,
      bytecode: xpnet_web3_contracts_1.XPNft1155__factory.bytecode,
      feeLimit: 3000000000,
      parameters: [nftPrefix],
    });
    return contract;
  };
  return {
    async mintNft(owner, options) {
      setSigner(owner);
      const erc = await provider.contract(
        xpnet_web3_contracts_1.UserNftMinter__factory.abi,
        options.contract
      );
      const res = await erc.mint(options.uri).send();
      return res;
    },
    async balance(address) {
      const balance = await provider.trx.getBalance(address);
      return new bignumber_js_1.BigNumber(balance);
    },
    deployErc721: async (owner) =>
      await deployErc721_i(owner).then((c) => c.address),
    async deployMinter(
      deployer,
      frostGroupKey,
      xpnftPrefix,
      xpnftPrefix1155,
      whitelist = []
    ) {
      if (whitelist.length == 0) {
        const unft = await deployErc721_i(deployer);
        console.log(provider.address.fromHex(unft.address));
        whitelist.push(provider.address.fromHex(unft.address));
      }
      const gk = Buffer.from(frostGroupKey, "hex");
      const gkx = ethers_1.BigNumber.from(`0x${gk.slice(1).toString("hex")}`);
      // gkyp is either 0 or 1
      const gkyp = ethers_1.BigNumber.from(`0x${gk[0] & 1}`);
      const erc721 = await deployXpNft(deployer, xpnftPrefix);
      const erc1155 = await deployXpNft1155(deployer, xpnftPrefix1155);
      const minter = await provider.contract().new({
        abi: xpnet_web3_contracts_1.Minter__factory.abi,
        bytecode: xpnet_web3_contracts_1.Minter__factory.bytecode,
        feeLimit: 6000000000,
        parameters: [gkx, gkyp, whitelist],
      });
      await erc721.transferOwnership(minter.address).send();
      await erc1155.transferOwnership(minter.address).send();
      const minterAddress = provider.address.fromHex(minter.address);
      const erc721Address = provider.address.fromHex(erc721.address);
      const erc1155Address = provider.address.fromHex(erc1155.address);
      return {
        minter: minterAddress,
        xpnft: erc721Address,
        xpnft1155: erc1155Address,
        whitelist,
      };
    },
  };
}
exports.baseTronHelperFactory = baseTronHelperFactory;
async function tronHelperFactory(tronParams) {
  const { provider, minter_addr } = tronParams;
  // const station = new TronStation(provider);
  const base = await baseTronHelperFactory(provider);
  const minter = await provider.contract(
    xpnet_web3_contracts_1.Minter__factory.abi,
    minter_addr
  );
  const setSigner = (signer) => {
    return signer && provider.setPrivateKey(signer);
  };
  async function notifyValidator(hash) {
    await tronParams.notifier.notifyTron(hash);
  }
  async function extractAction(hash) {
    await new Promise((r) => setTimeout(r, 10000));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getEv = async (retries = 0) => {
      const res = await provider.getEventByTransactionID(hash);
      if (res.length !== 0) {
        return res;
      }
      if (retries > 15) {
        throw Error("Couldn't fetch transaction after more than 15 retries!");
      }
      await new Promise((r) => setTimeout(r, 3000));
      return getEv(retries + 1);
    };
    const evs = await getEv();
    const ev = evs.find((e) => e?.contract == minter_addr);
    const action_id = ev.result["actionId"].toString();
    return action_id;
  }
  // const _randomAction = () =>
  //   Math.floor(
  //     Math.random() * 999 + (Number.MAX_SAFE_INTEGER - 1000)
  //   ).toString();
  // async function _estimateGas(
  //   addrs: string[],
  //   func_sig: string,
  //   params: { type: string; value: any }[]
  // ): Promise<BigNumber> {
  //   let energy = 0;
  //   let bandwidth = 0;
  //   const nrgSun = await station.energy.burnedEnergy2Trx(1, { unit: "sun" });
  //   const bandSun = 10;
  //   for (const [i, addr] of addrs.entries()) {
  //     const res = await provider.transactionBuilder.triggerConstantContract(
  //       minter.address,
  //       func_sig,
  //       {},
  //       params,
  //       provider.address.toHex(addr)
  //     );
  //     let nrg: number = res["energy_used"];
  //     if (i == addrs.length - 1 && addrs.length != 1) nrg *= 2;
  //     energy += nrg;
  //     const tx_raw: string = res["transaction"]["raw_data_hex"];
  //     bandwidth += tx_raw.length;
  //   }
  //   // Fee = energy * (sun per energy) + bandwidth * (sun per bandwidth)
  //   // bandwidth = raw tx byte length
  //   const fee = new BigNumber(energy).times(nrgSun).plus(bandwidth * bandSun);
  //   return fee;
  // }
  const isApprovedForMinter = async (id, _sender) => {
    const erc = await provider.contract(
      xpnet_web3_contracts_1.UserNftMinter__factory.abi,
      id.native.contract
    );
    const approvedAddress = await erc.getApproved(id.native.tokenId).call({
      from: tronParams.provider.defaultAddress.base58,
    });
    if (approvedAddress === minter_addr) {
      return true;
    }
    return false;
  };
  const approveForMinter = async (id, sender) => {
    await setSigner(sender);
    const erc = await provider.contract(
      xpnet_web3_contracts_1.UserNftMinter__factory.abi,
      id.native.contract
    );
    const isApproved = await isApprovedForMinter(id, sender);
    if (isApproved) {
      return undefined;
    }
    const txHash = await erc.approve(minter_addr, id.native.tokenId).send();
    return txHash;
  };
  const addMinToExpirationTime = (txn, minutes) => {
    const expiration = txn.raw_data.expiration;
    const newExpiration = new Date(expiration).getTime() + minutes * 60000;
    txn.raw_data.expiration = newExpiration;
    return txn;
  };
  return {
    ...base,
    extractAction,
    XpNft1155: tronParams.erc721_addr,
    XpNft: tronParams.erc721_addr,
    getFeeMargin() {
      return tronParams.feeMargin;
    },
    approveForMinter,
    preTransfer: (s, nft, _fee) => approveForMinter(nft, s),
    async preTransferRawTxn(nft, address, _value) {
      await setSigner(address);
      const isApproved = await isApprovedForMinter(nft, address);
      if (isApproved) {
        return undefined;
      }
      const { transaction, result } =
        await provider.transactionBuilder.triggerSmartContract(
          nft.native.contract,
          "approve(address,uint256)",
          {
            feeLimit: 1000000,
            callValue: 0,
          },
          [
            {
              type: "address",
              value: minter_addr,
            },
            {
              type: "uint256",
              value: nft.native.tokenId,
            },
          ],
          address
        );
      if (!result.result) {
        throw new Error(result.toString());
      }
      return addMinToExpirationTime(transaction, 15);
    },
    isApprovedForMinter,
    async extractTxnStatus(txnHash) {
      const txn = await provider.trx.getConfirmedTransaction(txnHash);
      const status = txn["ret"][0]["contractRet"];
      if (status === "SUCCESS") {
        return __1.TransactionStatus.SUCCESS;
      } else if (status === "FAIL") {
        return __1.TransactionStatus.FAILURE;
      }
      return __1.TransactionStatus.PENDING;
    },
    async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
      setSigner(sender);
      const res = await minter
        .withdrawNft(to, nonce, id.native.tokenId, id.native.contract)
        .send({ callValue: ethers_1.BigNumber.from(txFees.toString(10)) });
      await notifyValidator(res);
      return res;
    },
    getNonce() {
      return __1.Chain.TRON;
    },
    async transferNftToForeign(sender, chain_nonce, to, id, txFees, mintWith) {
      setSigner(sender);
      await approveForMinter(id, sender);
      const txr = await minter
        .freezeErc721(
          id.native.contract,
          id.native.tokenId,
          chain_nonce,
          to,
          mintWith
        )
        .send({ callValue: ethers_1.BigNumber.from(txFees.toString(10)) });
      await notifyValidator(txr);
      return txr;
    },
    async estimateValidateTransferNft(_to, _nftUri) {
      return new bignumber_js_1.BigNumber(0); // TODO
    },
    async estimateValidateUnfreezeNft(_to, _nft) {
      return new bignumber_js_1.BigNumber(0); // TODO
    },
    async validateAddress(adr) {
      return provider.isAddress(adr);
    },
    isNftWhitelisted(nft) {
      return minter.nftWhitelist(nft.native.contract).call({
        from: tronParams.provider.defaultAddress.base58,
      });
    },
    // const minter = await provider.contract(Minter__factory.abi, minter_addr);
    async getTokenURI(contract, tokenId) {
      return "";
      if (provider.isAddress(contract) && tokenId) {
        const _contract = await provider.contract(
          xpnet_web3_contracts_1.UserNftMinter__factory.abi,
          contract
        );
        return await _contract.tokenURI(+tokenId).call();
      }
      return "";
    },
  };
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQXlDO0FBZ0J6QyxtQ0FBNEM7QUFFNUMsK0RBSzhCO0FBQzlCLDBCQVlZO0FBZ0VMLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBaUI7SUFFakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFrQixFQUFFLEVBQUU7UUFDdkMsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxFQUFFO1FBQ3BELFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLDZDQUFzQixDQUFDLEdBQUc7WUFDL0IsUUFBUSxFQUFFLDZDQUFzQixDQUFDLFFBQVE7WUFDekMsUUFBUSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsU0FBaUIsRUFBRSxFQUFFO1FBQ3BFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLHFDQUFjLENBQUMsR0FBRztZQUN2QixRQUFRLEVBQUUscUNBQWMsQ0FBQyxRQUFRO1lBQ2pDLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDO1NBQzFDLENBQUMsQ0FBQztRQUVILE9BQU8s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
