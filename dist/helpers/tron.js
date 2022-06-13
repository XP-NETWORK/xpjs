"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tronHelperFactory = exports.baseTronHelperFactory = void 0;
const bignumber_js_1 = require("bignumber.js");
const bignumber_1 = require("@ethersproject/bignumber/lib/bignumber");
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
            const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, options.contract);
            const res = await erc.mint(options.uris[0]).send();
            return res;
        },
        async balance(address) {
            const balance = await provider.trx.getBalance(address);
            return new bignumber_js_1.BigNumber(balance);
        },
        deployErc721: async (owner) => await deployErc721_i(owner).then((c) => c.address),
        async deployMinter(deployer, frostGroupKey, xpnftPrefix, xpnftPrefix1155, whitelist = []) {
            if (whitelist.length == 0) {
                const unft = await deployErc721_i(deployer);
                console.log(provider.address.fromHex(unft.address));
                whitelist.push(provider.address.fromHex(unft.address));
            }
            const gk = Buffer.from(frostGroupKey, "hex");
            const gkx = bignumber_1.BigNumber.from(`0x${gk.slice(1).toString("hex")}`);
            // gkyp is either 0 or 1
            const gkyp = bignumber_1.BigNumber.from(`0x${gk[0] & 1}`);
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
    const minter = await provider.contract(xpnet_web3_contracts_1.Minter__factory.abi, minter_addr);
    const setSigner = (signer) => {
        return signer && provider.setPrivateKey(signer);
    };
    async function notifyValidator(hash) {
        await tronParams.notifier.notifyTron(hash);
    }
    async function extractAction(hash) {
        await new Promise((r) => setTimeout(r, 6000));
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
        const ev = evs.find((e) => (e === null || e === void 0 ? void 0 : e.contract) == minter_addr);
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
        const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, id.native.contract);
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
        const erc = await provider.contract(xpnet_web3_contracts_1.UserNftMinter__factory.abi, id.native.contract);
        const isApproved = await isApprovedForMinter(id, sender);
        if (isApproved) {
            return undefined;
        }
        const txHash = await erc
            .approve(minter_addr, id.native.tokenId)
            .send();
        return txHash;
    };
    const addMinToExpirationTime = (txn, minutes) => {
        const expiration = txn.raw_data.expiration;
        const newExpiration = new Date(expiration).getTime() + minutes * 60000;
        txn.raw_data.expiration = newExpiration;
        return txn;
    };
    return Object.assign(Object.assign({}, base), { extractAction, XpNft1155: tronParams.erc721_addr, XpNft: tronParams.erc721_addr, getFeeMargin() {
            return tronParams.feeMargin;
        },
        approveForMinter, preTransfer: (s, nft, _fee) => approveForMinter(nft, s), async preTransferRawTxn(nft, address, _value) {
            await setSigner(address);
            const isApproved = await isApprovedForMinter(nft, address);
            if (isApproved) {
                return undefined;
            }
            const { transaction, result } = await provider.transactionBuilder.triggerSmartContract(nft.native.contract, "approve(address,uint256)", {
                feeLimit: 1000000,
                callValue: 0,
            }, [
                {
                    type: "address",
                    value: minter_addr,
                },
                {
                    type: "uint256",
                    value: nft.native.tokenId,
                },
            ], address);
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
            }
            else if (status === "FAIL") {
                return __1.TransactionStatus.FAILURE;
            }
            return __1.TransactionStatus.PENDING;
        },
        async unfreezeWrappedNft(sender, to, id, txFees, nonce) {
            setSigner(sender);
            const res = await minter
                .withdrawNft(to, nonce, id.native.tokenId, id.native.contract)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
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
                .freezeErc721(id.native.contract, id.native.tokenId, chain_nonce, to, mintWith)
                .send({ callValue: bignumber_1.BigNumber.from(txFees.toString(10)) });
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
        } });
}
exports.tronHelperFactory = tronHelperFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQXlDO0FBZ0J6QyxzRUFBNEU7QUFFNUUsK0RBSzhCO0FBQzlCLDBCQVlZO0FBK0RMLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsUUFBaUI7SUFFakIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFrQixFQUFFLEVBQUU7UUFDdkMsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxFQUFFO1FBQ3BELFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLDZDQUFzQixDQUFDLEdBQUc7WUFDL0IsUUFBUSxFQUFFLDZDQUFzQixDQUFDLFFBQVE7WUFDekMsUUFBUSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsU0FBaUIsRUFBRSxFQUFFO1FBQ3BFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDN0MsR0FBRyxFQUFFLHFDQUFjLENBQUMsR0FBRztZQUN2QixRQUFRLEVBQUUscUNBQWMsQ0FBQyxRQUFRO1lBQ2pDLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDO1NBQzFDLENBQUMsQ0FBQztRQUVILE9BQU8s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