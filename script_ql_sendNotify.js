/**
 * 青龙面板: 2.10.6之后
 *
 * cron:  0 * * * *
 */

 import { execSync } from "child_process";

 if (process.env.HOSTNAME === 'qinglong') execSync('cp /ql/scripts/xajeyu_scripts_main/sendNotify.js /ql/scripts/zero205_JD_tencent_scf_main/').toString()