"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRIDGE_TEAL = void 0;
exports.BRIDGE_TEAL = `#pragma version 5
intcblock 1 6 3
bytecblock TMPL_RECV_ADDR
txn TypeEnum
pushint 4 // axfer
==
txn AssetAmount
intc_0 // 1
==
&&
txn AssetReceiver
bytec_0 // TMPL_RECV_ADDR
==
&&
bnz main_l6
gtxn 0 TypeEnum
intc_1 // appl
==
gtxna 0 ApplicationArgs 0
pushbytes 0x6372656174655f6e6674 // "create_nft"
==
&&
gtxna 0 Accounts 1
bytec_0 // TMPL_RECV_ADDR
==
&&
gtxn 1 TypeEnum
intc_2 // acfg
==
&&
gtxn 1 ConfigAssetTotal
intc_0 // 1
==
&&
gtxn 1 ConfigAssetDecimals
pushint 0 // 0
==
&&
bnz main_l5
gtxn 0 TypeEnum
intc_1 // appl
==
gtxna 0 ApplicationArgs 0
pushbytes 0x77697468647261775f6e6674 // "withdraw_nft"
==
&&
gtxn 1 TypeEnum
intc_2 // acfg
==
&&
gtxn 1 ConfigAsset
gtxna 0 Assets 0
==
&&
bnz main_l4
err
main_l4:
intc_0 // 1
return
main_l5:
intc_0 // 1
return
main_l6:
intc_0 // 1
return`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlX3Bvb2wudGVhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2JyaWRnZV9wb29sLnRlYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQWEsUUFBQSxXQUFXLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FnRXBCLENBQUMifQ==
