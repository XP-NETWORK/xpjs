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
                whitelist.push(unft.address);
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
    return Object.assign(Object.assign({}, base), { extractAction,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQXlDO0FBY3pDLHNFQUE0RTtBQUU1RSwrREFLOEI7QUFDOUIsMEJBWVk7QUE2REwsS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxRQUFpQjtJQUVqQixNQUFNLFNBQVMsR0FBRyxDQUFDLE1BQWtCLEVBQUUsRUFBRTtRQUN2QyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxRQUFvQixFQUFFLEVBQUU7UUFDcEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBCLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUM3QyxHQUFHLEVBQUUsNkNBQXNCLENBQUMsR0FBRztZQUMvQixRQUFRLEVBQUUsNkNBQXNCLENBQUMsUUFBUTtZQUN6QyxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxTQUFpQixFQUFFLEVBQUU7UUFDcEUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXBCLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUM3QyxHQUFHLEVBQUUscUNBQWMsQ0FBQyxHQUFHO1lBQ3ZCLFFBQVEsRUFBRSxxQ0FBYyxDQUFDLFFBQVE7WUFDakMsUUFBUSxFQUFFLFVBQVU7WUFDcEIsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUM7U0FDMUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxR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