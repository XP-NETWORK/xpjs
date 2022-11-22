import { ElrondParams, ElrondHelper } from "./helpers/elrond";
import { TronParams, TronHelper } from "./helpers/tron";
import { Web3Params, Web3Helper } from "./helpers/web3";
import { SupportedCurrency } from "crypto-exchange-rate/dist/model/domain";
import { AlgorandParams, AlgorandHelper } from "./helpers/algorand";
import { TezosHelper, TezosParams } from "./helpers/tezos";
import { ChainNonce, InferChainH, InferChainParam } from "./type-utils";
import { SecretHelper, SecretParams } from "./helpers/secret";
import { SolanaHelper, SolanaParams } from "./helpers/solana";
import { TonHelper, TonParams } from "./helpers/ton";
import { DfinityHelper, DfinityParams } from "./helpers/dfinity/dfinity";
import { NearHelper, NearParams } from "./helpers/near";
import { AptosHelper, AptosParams } from "./helpers/aptos";
import { Web3ERC20Params } from "./helpers/web3_erc20";
export declare enum TestNetRpcUri {
    ELROND = "https://devnet-gateway.elrond.com",
    HECO = "https://http-testnet.hecochain.com",
    BSC = "https://data-seed-prebsc-2-s1.binance.org:8545/",
    ROPSTEN = "https://goerli.infura.io/v3/cec5dc92097a46f0b895ac1e89865467",
    AVALANCHE = "https://api.avax-test.network/ext/bc/C/rpc",
    POLYGON = "https://matic-mumbai.chainstacklabs.com",
    FANTOM = "https://rpc.testnet.fantom.network/",
    TRON = "https://api.shasta.trongrid.io/",
    CELO = "https://alfajores-forno.celo-testnet.org",
    HARMONY = "https://api.s0.b.hmny.io",
    XDAI = "https://sokol.poa.network",
    UNIQUE = "https://rpc-opal.unique.network/",
    TEZOS = "https://ghostnet.smartpy.io",
    VELAS = "https://explorer.testnet.velas.com/rpc",
    IOTEX = "https://babel-api.testnet.iotex.io",
    AURORA = "https://testnet.aurora.dev/",
    GODWOKEN = "https://godwoken-testnet-v1.ckbapp.dev",
    GATECHAIN = "https://meteora-evm.gatenode.cc",
    VECHAIN = "https://sync-testnet.veblocks.net",
    SECRET = "https://pulsar-2.api.trivium.network:9091/",
    SKALE = "https://staging-v2.skalenodes.com/v1/actual-secret-cebalrai",
    HEDERA = "https://0.testnet.hedera.com/",
    NEAR = "https://rpc.testnet.near.org",
    MOONBEAM = "https://rpc.api.moonbase.moonbeam.network",
    ABEYCHAIN = "https://testrpc.abeychain.com",
    APTOS = "https://fullnode.testnet.aptoslabs.com",
    TON = "https://testnet.toncenter.com/api/v2/jsonRPC",
    SOLANA = "https://api.devnet.solana.com"
}
export declare enum MainNetRpcUri {
    ELROND = "https://gateway.elrond.com",
    HECO = "https://http-mainnet-node.huobichain.com",
    BSC = "https://bsc-dataseed.binance.org/",
    ETHEREUM = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    AVALANCHE = "https://api.avax.network/ext/bc/C/rpc",
    POLYGON = "https://polygon-rpc.com",
    FANTOM = "https://rpc.ftm.tools/",
    TRON = "https://api.trongrid.io/",
    CELO = "https://forno.celo.org",
    HARMONY = "https://rpc.s0.t.hmny.io",
    XDAI = "https://gnosis.xp.network/node",
    FUSE = "https://rpc.fuse.io/",
    VELAS = "https://mainnet.velas.com/rpc",
    TEZOS = "https://mainnet.smartpy.io",
    IOTEX = "https://babel-api.mainnet.iotex.io",
    AURORA = "https://mainnet.aurora.dev",
    GODWOKEN = "https://v1.mainnet.godwoken.io/rpc",
    GATECHAIN = "https://evm.gatenode.cc",
    VECHAIN = "https://sync-mainnet.veblocks.net",
    SECRET = "https://grpc.mainnet.secretsaturn.net",
    SKALE = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague",
    NEAR = "https://rpc.mainnet.near.org",
    MOONBEAM = "https://rpc.api.moonbeam.network",
    ABEYCHAIN = "https://rpc.abeychain.com",
    TON = "https://toncenter.com/api/v2/jsonRPC",
    APTOS = "https://fullnode.mainnet.aptoslabs.com/"
}
declare type ElrondMeta = [ElrondHelper, ElrondParams];
declare type Web3Meta = [Web3Helper, Web3Params];
declare type TronMeta = [TronHelper, TronParams];
declare type AlgoMeta = [AlgorandHelper, AlgorandParams];
declare type TezosMeta = [TezosHelper, TezosParams];
declare type SecretMeta = [SecretHelper, SecretParams];
declare type SolanaMeta = [SolanaHelper, SolanaParams];
declare type TonMeta = [TonHelper, TonParams];
declare type DfinityMeta = [DfinityHelper, DfinityParams];
declare type NearMeta = [NearHelper, NearParams];
declare type Web3ERC20Meta = [Web3Helper, Web3ERC20Params];
declare type AptosMeta = [AptosHelper, AptosParams];
declare type MetaMapAssert = {
    [idx in typeof Chain[keyof typeof Chain]]: unknown;
};
export declare type MetaMap = {
    2: ElrondMeta;
    3: Web3Meta;
    4: Web3Meta;
    5: Web3Meta;
    6: Web3Meta;
    7: Web3Meta;
    8: Web3Meta;
    9: TronMeta;
    0xb: Web3Meta;
    0xc: Web3Meta;
    0xd: Web3Meta;
    0xe: Web3Meta;
    0xf: AlgoMeta;
    0x10: Web3Meta;
    0x11: Web3Meta;
    0x12: TezosMeta;
    0x13: Web3Meta;
    0x14: Web3Meta;
    0x15: Web3Meta;
    0x16: Web3Meta;
    0x17: Web3Meta;
    0x18: SecretMeta;
    0x19: Web3Meta;
    0x1a: SolanaMeta;
    0x1b: TonMeta;
    0x1c: DfinityMeta;
    0x1d: Web3Meta;
    0x1e: Web3ERC20Meta;
    0x1f: NearMeta;
    0x20: Web3Meta;
    0x21: Web3Meta;
    0x22: AptosMeta;
} & MetaMapAssert;
export declare namespace Chain {
    const ELROND = 2;
    const HECO = 3;
    const BSC = 4;
    const ETHEREUM = 5;
    const AVALANCHE = 6;
    const POLYGON = 7;
    const FANTOM = 8;
    const TRON = 9;
    const CELO = 11;
    const HARMONY = 12;
    const ONT = 13;
    const XDAI = 14;
    const ALGORAND = 15;
    const FUSE = 16;
    const UNIQUE = 17;
    const TEZOS = 18;
    const VELAS = 19;
    const IOTEX = 20;
    const AURORA = 21;
    const GODWOKEN = 22;
    const GATECHAIN = 23;
    const SECRET = 24;
    const VECHAIN = 25;
    const SOLANA = 26;
    const TON = 27;
    const DFINITY = 28;
    const HEDERA = 29;
    const SKALE = 30;
    const NEAR = 31;
    const MOONBEAM = 32;
    const ABEYCHAIN = 33;
    const APTOS = 34;
}
interface ChainData<T extends ChainNonce> {
    name: string;
    nonce: number;
    decimals: number;
    constructor: (p: InferChainParam<T>) => Promise<InferChainH<T>>;
    blockExplorerUrl: string;
    tnBlockExplorerUrl?: string;
    chainId?: number;
    tnChainId?: number;
    currency: SupportedCurrency;
    type: string;
    blockExplorerUrlAddr?: string;
    tnBlockExplorerUrlAddr?: string;
}
declare type ChainInfo = {
    set<T extends ChainNonce>(k: T, v: ChainData<T> | undefined): void;
    get<T extends ChainNonce>(k: T): ChainData<T> | undefined;
} & Map<ChainNonce, ChainData<ChainNonce>>;
export declare enum ChainType {
    EVM = "EVM",
    ELROND = "ELROND",
    TRON = "TRON",
    TEZOS = "TEZOS",
    ALGORAND = "ALGORAND",
    SECRET = "SECRET",
    DFINITY = "DFINITY",
    SOLANA = "SOLANA",
    TON = "TON",
    NEAR = "NEAR",
    HEDERA = "HEDERA",
    APTOS = "APTOS"
}
export declare const CHAIN_INFO: ChainInfo;
export {};
//# sourceMappingURL=consts.d.ts.map