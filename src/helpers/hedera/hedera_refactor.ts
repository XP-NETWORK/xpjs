import { Web3Helper, web3HelperFactory } from "../evm/web3";
import { hethers } from "@hashgraph/hethers";
import { HederaService } from "../../services/hederaApi";
import { ethers } from "ethers";
import { Web3Params } from "./depricated";
//import BigNumber from "bignumber.js";

import { NftInfo } from "../chain";
import { EthNftInfo } from "../evm/web3";
import { BigNumber } from "bignumber.js";

import { isWrappedNft as getWrapped } from "../../factory/utils";
import { UserNftMinter__factory, Minter__factory } from "xpnet-web3-contracts";

type HSDK = typeof import("@hashgraph/sdk");

type tokenListResponce = {
  contract: string;
  htsToken: string;
  tokens: string[];
  associated?: boolean;
};

type tokenListRequest = {
  contract: string;
  hts_token: string;
  nft_id: string;
};

type HederaHelperFactory = Web3Helper & {
  toSolidityAddress(address: string): Promise<string>;
  listHederaClaimableNFT(
    tokens: tokenListRequest[],
    signer: any
  ): Promise<tokenListResponce[]>;
  claimNFT(
    proxyContract: string | undefined,
    htsToken: string | undefined,
    tokenId: string,
    signer: any
  ): Promise<boolean>;
  checkAndAssociate(tokens: tokenListRequest[], signer: any): Promise<boolean>;
  associateToken(tokens: tokenListResponce[], signer: any): Promise<boolean>;
  injectSDK?(sdk: HSDK): HederaHelperFactory & { isInjected: boolean };
};

type HederaParams = {
  htcToken: string;
  Xpnfthtsclaims: string;
  //evmProvider: ethers.providers.JsonRpcProvider;
  hederaApi: HederaService;
  noWhitelist?: boolean;
};

export const HederaHelperFactory = async (
  params: Web3Params & HederaParams
): Promise<HederaHelperFactory> => {
  const base = await web3HelperFactory(params);

  const minter = Minter__factory.connect(params.minter_addr, params.provider);

  const isNftWhitelisted = async (nft: NftInfo<EthNftInfo>) => {
    //const _contract = await getEVMContractByHtsToken(nft.native.contract);
    const data = minter.interface.encodeFunctionData("nftWhitelist", [
      nft.native.contract,
    ]);

    const result = await params.hederaApi.readContract(minter.address, data);

    return (
      result ===
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
  };

  const toHederaAccountId = (address: string) => {
    const acc = hethers.utils.getAccountFromAddress(address);
    return `${acc.shard}.${acc.realm}.${acc.num}`;
  };

  const getHTSandFreshTokens = (
    data: {
      token_id: string;
      balance: number;
    }[]
  ) => {
    const htsTokens = data.map((t) => t.token_id);
    const freshTokens = data
      .filter((t) => t.balance === 0)
      .map((t) => t.token_id);
    return { htsTokens, freshTokens };
  };

  const mapTokensToAssociate = (
    toAssociate: tokenListRequest[],
    freshTokens: string[],
    transformAddress: (address: string) => string
  ) =>
    toAssociate.map((t) => {
      const token = transformAddress(t.hts_token);
      return {
        contract: t.contract,
        htsToken: t.hts_token,
        tokens: [t.nft_id],
        associated: freshTokens.includes(token) ? true : false,
      };
    });

  const filterTokens = (
    tokens: tokenListRequest[],
    htsTokens: string[],
    freshTokens: string[],
    transformAddress: (address: string) => string
  ) => {
    const dublicates: string[] = [];
    const toAssociate = tokens.filter((t) => {
      const token = transformAddress(t.hts_token);
      if (
        !dublicates.includes(t.hts_token) &&
        (!htsTokens.includes(token) || freshTokens.includes(token))
      ) {
        dublicates.push(t.hts_token);
        return true;
      }

      return false;
    });
    if (!toAssociate.length) {
      throw new Error("No matching tokens");
    }
    return toAssociate;
  };

  const getEVMContractByHtsToken = async (htsToken: string) => {
    const token = toHederaAccountId(htsToken);
    const res = await params.hederaApi.getokenInfo(token);
    return await params.hederaApi.getEVMAddress(res.treasury_account_id);
  };

  const getApproveFor = async (id: NftInfo<EthNftInfo>): Promise<string> => {
    const isWrappedNft = (await getWrapped(id, +id.native.chainId)).bool;
    let forAddress = params.erc721_addr;

    if (isWrappedNft)
      forAddress = await getEVMContractByHtsToken(id.native.contract);

    return forAddress;
  };

  const listHederaClaimableNFT = async (
    tokens: tokenListRequest[],
    signer: ethers.Signer
  ) => {
    const address = await signer.getAddress();
    const _tokens = await params.hederaApi.getTokens(address);

    const { htsTokens, freshTokens } = getHTSandFreshTokens(_tokens);

    const transfromFunction = (address: string) => toHederaAccountId(address);

    const toAssociate = filterTokens(
      tokens,
      htsTokens,
      freshTokens,
      transfromFunction
    );

    return mapTokensToAssociate(toAssociate, freshTokens, transfromFunction);
  };

  const associateToken = async (
    token: tokenListResponce[],
    signer: ethers.Signer
  ) => {
    const abi = ["function associate()"];
    const contracts = token.map(
      (t) => new ethers.Contract(t.htsToken, abi, signer)
    );

    await Promise.all(
      contracts.map((contract) =>
        contract.associate({
          gasLimit: 1_000_000,
        })
      )
    );

    return true;
  };

  const checkAndAssociate = async (tokens: tokenListRequest[], signer: any) => {
    const toAssociate = await listHederaClaimableNFT(tokens, signer);

    return await associateToken(toAssociate, signer);
  };
  const sanifyTrx = (trx: any) => {
    const validTrx = String(trx).replace("@", "-");
    const array = validTrx.split("");
    array[validTrx.lastIndexOf(".")] = "-";
    return array.join("");
  };

  return {
    ...base,
    injectSDK(hashSDK: HSDK) {
      const toSolidityAddress = async (address: string) => {
        return hethers.utils.getAddressFromAccount(address);
      };

      /*const getEvmHash = (trx: any) =>
                "0x" + String(trx.transactionHash).slice(0, 64);*/

      const listHederaClaimableNFT = async (
        tokens: tokenListRequest[],
        signer: any
      ) => {
        const address = signer.address;
        const res = await params.hederaApi.getTokens(address);

        const { htsTokens, freshTokens } = getHTSandFreshTokens(res);

        const transfromFunction = (address: string) =>
          hashSDK.TokenId.fromSolidityAddress(address).toString();

        const toAssociate = filterTokens(
          tokens,
          htsTokens,
          freshTokens,
          transfromFunction
        );

        return mapTokensToAssociate(
          toAssociate,
          freshTokens,
          transfromFunction
        );
      };

      const claimNFT = async (
        proxyContract = params.erc721_addr,
        htsToken = params.htcToken,
        tokenId: string,
        signer: any
      ) => {
        const trx = await new hashSDK.ContractExecuteTransaction()
          .setContractId(hashSDK.ContractId.fromSolidityAddress(proxyContract))
          .setGas(500_000)
          .setMaxTransactionFee(new hashSDK.Hbar(12))
          .setFunction(
            "claimNft",
            new hashSDK.ContractFunctionParameters()
              //@ts-ignore
              .addInt64(tokenId)
              .addAddress(htsToken)
          )
          .freezeWithSigner(signer);

        const res = await trx.executeWithSigner(signer);
        return Boolean(res.transactionId);
      };

      const associateToken = async (
        token: tokenListResponce[],
        signer: any
      ) => {
        const trx = await new hashSDK.TokenAssociateTransaction()
          .setAccountId(signer.accountToSign)
          .setTokenIds(
            token.map((t) => hashSDK.TokenId.fromSolidityAddress(t.htsToken))
          )
          .freezeWithSigner(signer);

        const result = await trx.executeWithSigner(signer).catch((err) => {
          console.log(err, "assoc");
        });

        if (!result) {
          throw new Error("Failed to Associate token to an account");
        }

        return true;
      };

      const checkAndAssociate = async (
        tokens: tokenListRequest[],
        signer: any
      ) => {
        const toAssociate = await listHederaClaimableNFT(tokens, signer);

        return await associateToken(toAssociate, signer);
      };

      const isApprovedForMinter = async (
        id: NftInfo<EthNftInfo>,
        _: any,
        toApprove: string
      ) => {
        const contract = UserNftMinter__factory.connect(
          id.native.contract,
          params.provider
        );

        const data = contract.interface.encodeFunctionData("getApproved", [
          id.native.tokenId,
        ]);

        const result = await params.hederaApi.readContract(
          contract.address,
          data
        );

        const approvedContract = contract.interface.decodeFunctionResult(
          "getApproved",
          result
        );

        return approvedContract.at(0)?.toLowerCase() == toApprove.toLowerCase();
      };

      const approveForMinter = async function (
        id: NftInfo<EthNftInfo>,
        sender: any,
        _txFees: BigNumber,
        _: ethers.Overrides | undefined,
        toApprove?: string
      ) {
        console.log(toApprove);
        const forAddress = toApprove || (await getApproveFor(id));

        console.log(forAddress, "forAddress");
        const isApproved = await isApprovedForMinter(id, sender, forAddress);

        if (isApproved) return undefined;

        const transaction = await new hashSDK.ContractExecuteTransaction()
          .setContractId(
            hashSDK.ContractId.fromSolidityAddress(id.native.contract)
          )
          .setGas(1_000_000)
          .setMaxTransactionFee(new hashSDK.Hbar(10))
          //.setPayableAmount(new hashSDK.Hbar(5))
          .setFunction(
            "approve",
            new hashSDK.ContractFunctionParameters()
              .addAddress(forAddress)
              .addUint256(Number(id.native.tokenId))
          )
          .freezeWithSigner(sender);

        //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
        const txResponse = await transaction.executeWithSigner(sender);

        return txResponse.transactionId.toString();
      };

      const estimateUserStoreDeploy = async function (_: any) {
        const gas = "10000000000000000000";
        return new BigNumber(gas).multipliedBy(1.1).integerValue();
      };

      const getUserStore = async (
        signer: any,
        nft: NftInfo<EthNftInfo>,
        fees?: number,
        isMapped: boolean = false
      ) => {
        const defaultMinter = {
          address: params.minter_addr,
          contract: undefined,
        };

        if (!params.noWhitelist) return defaultMinter;

        const contract = await params.notifier.getCollectionContract(
          nft.native.contract,
          params.nonce
        );

        if (contract)
          return {
            address: contract,
            contract: undefined,
          };

        if (isMapped) return defaultMinter;

        const amount =
          fees ||
          (await estimateUserStoreDeploy(signer)).shiftedBy(-18).toNumber();

        const transaction = await new hashSDK.TransferTransaction()
          .addHbarTransfer(signer.accountToSign, new hashSDK.Hbar(-amount))
          .addHbarTransfer("0.0.2003784", new hashSDK.Hbar(amount))
          .freezeWithSigner(signer as any);

        //Submit the transaction to a Hedera network
        await transaction.executeWithSigner(signer as any);

        const address = await params.notifier.createCollectionContract(
          nft.native.contract,
          params.nonce,
          nft.native.contractType
        );

        return {
          address,
          contract: undefined,
        };
      };

      return {
        ...base,
        isInjected: true,
        toSolidityAddress,
        listHederaClaimableNFT,
        claimNFT,
        associateToken,
        isNftWhitelisted,
        checkAndAssociate,
        isApprovedForMinter,
        approveForMinter,
        getUserStore,
        transferNftToForeign: async function (
          sender: any,
          chain_nonce: number,
          to: string,
          id: NftInfo<EthNftInfo>,
          txFees: BigNumber,
          mintWith: string,
          _: ethers.BigNumberish | undefined = undefined,
          gasPrice,
          toParams: Web3Params
        ) {
          const { address } = await getUserStore(
            sender,
            id,
            undefined,
            mintWith !== toParams.erc721_addr
          );

          await approveForMinter(
            id,
            sender,
            txFees,
            { gasPrice },
            params.erc721_addr
          );
          const tokenId = ethers.utils.solidityPack(
            ["uint160", "int96"],
            [id.collectionIdent, id.native.tokenId]
          );
          const contract = params.erc721_addr;

          const transaction = await new hashSDK.ContractExecuteTransaction()
            .setContractId(hashSDK.ContractId.fromSolidityAddress(address))
            .setGas(1_200_000)
            .setPayableAmount(txFees.shiftedBy(-18).integerValue().toString())
            .setFunction(
              id.native.contractType === "ERC1155"
                ? "freezeErc1155"
                : "freezeErc721",
              new hashSDK.ContractFunctionParameters()
                .addAddress(contract)
                //@ts-ignore
                .addUint256(String(tokenId))
                //@ts-ignore
                .addUint64(String(chain_nonce))
                .addString(to)
                .addString(mintWith)
            )
            .freezeWithSigner(sender as any);

          const txResponse = await transaction.executeWithSigner(sender as any);

          const hash = sanifyTrx(txResponse.transactionId);

          await params.notifier.notifyWeb3(params.nonce, hash);
          return {
            hash,
          } as any;
        },
        unfreezeWrappedNft: async function (
          sender: any,
          to: string,
          id: NftInfo<EthNftInfo>,
          txFees: BigNumber,
          nonce,
          _ = undefined,
          __
        ) {
          const tokenId = ethers.utils.solidityPack(
            ["uint160", "int96"],
            [id.collectionIdent, id.native.tokenId]
          );

          const contract = await getEVMContractByHtsToken(id.native.contract);

          const transaction = await new hashSDK.ContractExecuteTransaction()
            .setContractId(
              hashSDK.ContractId.fromSolidityAddress(params.minter_addr)
            )
            .setGas(1_200_000)
            .setPayableAmount(txFees.shiftedBy(-18).integerValue().toString())
            .setFunction(
              "withdrawNft",
              new hashSDK.ContractFunctionParameters()
                .addString(to)
                //@ts-ignore
                .addUint64(String(nonce))
                //@ts-ignore
                .addUint256(String(tokenId))
                .addAddress(contract)
            )
            .freezeWithSigner(sender);

          const txResponse = await transaction.executeWithSigner(sender);
          const hash = sanifyTrx(txResponse.transactionId);
          await params.notifier.notifyWeb3(params.nonce, hash);
          return {
            hash,
          } as any;
        },
        estimateUserStoreDeploy,
      };
    },
    async approveForMinter(...args) {
      try {
        if (!args[4]) {
          const forAddress = await getApproveFor(args[0]);
          args[4] = forAddress;
        }

        return await base.approveForMinter(...args);
      } catch (e: any) {
        if (
          typeof e?.message === "string" &&
          e.message.match(
            /No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi
          )
        ) {
          return e.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || "";
        }
        throw e;
      }
    },
    async transferNftToForeign(...args) {
      const res = (await base.transferNftToForeign(...args)) as any;

      if (
        typeof res?.message === "string" &&
        res.message.match(
          /No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi
        )
      ) {
        const transactionId = sanifyTrx(
          res.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || ""
        );
        if (!transactionId) {
          throw new Error("Invalid trx id");
        }
        await params.notifier.notifyWeb3(params.nonce, transactionId);
        return {
          hash: transactionId,
        };
      }

      if (!res?.hash) {
        throw new Error(res?.message || "Unknow error");
      }

      const transactionId = await params.hederaApi.getTranactionIdByHash(
        res.hash
      );
      await params.notifier.notifyWeb3(params.nonce, transactionId);
      return res;
    },
    async unfreezeWrappedNft(...args) {
      const id = args[2];
      const signer = args[0];
      const fees = args[3];
      const gasPrice = args[6];

      const forAddress = await getApproveFor(id);
      await base.approveForMinter(id, signer, fees, { gasPrice }, forAddress);

      const tokenId = ethers.utils.solidityPack(
        ["uint160", "int96"],
        [id.collectionIdent, id.native.tokenId]
      );

      const contract = await getEVMContractByHtsToken(id.native.contract);

      args[2] = {
        ...args[2],
        native: {
          ...args[2].native,
          tokenId,
          contract,
        },
      };

      const res = (await base.unfreezeWrappedNft(...args)) as any;

      if (
        typeof res?.message === "string" &&
        res?.message?.match(
          /No matching record found for transaction id 0\.0\.\d+@\d+\.\d+/gi
        )
      ) {
        const transactionId = sanifyTrx(
          res.message.match(/0\.0\.\d+@\d+\.\d+/gi)?.at(0) || ""
        );
        if (!transactionId) {
          throw new Error("Invalid trx id");
        }
        await params.notifier.notifyWeb3(params.nonce, transactionId);
        return {
          hash: transactionId,
        };
      }

      if (!res?.hash) {
        throw new Error(res?.message || "Unknow error");
      }

      const transactionId = await params.hederaApi.getTranactionIdByHash(
        res.hash
      );
      await params.notifier.notifyWeb3(params.nonce, transactionId);
      return res;
    },

    estimateUserStoreDeploy: async (signer: any) => {
      if (typeof base.estimateUserStoreDeploy === "function") {
        const amount = await base.estimateUserStoreDeploy(signer);
        return amount.multipliedBy(10).integerValue();
      }
      return new BigNumber(0);
    },
    toSolidityAddress: async (address) => {
      if (!ethers.utils.isAddress(address)) {
        return await params.hederaApi.getEVMAccount(address);
      }
      return address;
    },

    listHederaClaimableNFT,
    claimNFT: async function (
      proxyContract = params.erc721_addr,
      htsToken = params.htcToken,
      tokenId: string,
      signer: any
    ) {
      proxyContract;
      htsToken;
      tokenId;
      signer;
      const abi = [
        {
          inputs: [
            {
              internalType: "int64",
              name: "serialNum",
              type: "int64",
            },
            {
              internalType: "address",
              name: "token",
              type: "address",
            },
          ],
          name: "claimNft",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const contract = new ethers.Contract(proxyContract, abi, signer);
      const res = await contract.claimNft(
        ethers.BigNumber.from(tokenId),
        htsToken,
        {
          gasLimit: 1_000_000,
        }
      );
      console.log(res);

      return true;
    },
    associateToken,
    checkAndAssociate,
    isNftWhitelisted,
  };
};
