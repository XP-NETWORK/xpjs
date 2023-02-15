export declare const BRIDGE_TEAL = "#pragma version 5\nintcblock 1 6 3\nbytecblock TMPL_RECV_ADDR\ntxn TypeEnum\npushint 4 // axfer\n==\ntxn AssetAmount\nintc_0 // 1\n==\n&&\ntxn AssetReceiver\nbytec_0 // TMPL_RECV_ADDR\n==\n&&\nbnz main_l6\ngtxn 0 TypeEnum\nintc_1 // appl\n==\ngtxna 0 ApplicationArgs 0\npushbytes 0x6372656174655f6e6674 // \"create_nft\"\n==\n&&\ngtxna 0 Accounts 1\nbytec_0 // TMPL_RECV_ADDR\n==\n&&\ngtxn 1 TypeEnum\nintc_2 // acfg\n==\n&&\ngtxn 1 ConfigAssetTotal\nintc_0 // 1\n==\n&&\ngtxn 1 ConfigAssetDecimals\npushint 0 // 0\n==\n&&\nbnz main_l5\ngtxn 0 TypeEnum\nintc_1 // appl\n==\ngtxna 0 ApplicationArgs 0\npushbytes 0x77697468647261775f6e6674 // \"withdraw_nft\"\n==\n&&\ngtxn 1 TypeEnum\nintc_2 // acfg\n==\n&&\ngtxn 1 ConfigAsset\ngtxna 0 Assets 0\n==\n&&\nbnz main_l4\nerr\nmain_l4:\nintc_0 // 1\nreturn\nmain_l5:\nintc_0 // 1\nreturn\nmain_l6:\nintc_0 // 1\nreturn";
//# sourceMappingURL=bridge_pool.teal.d.ts.map