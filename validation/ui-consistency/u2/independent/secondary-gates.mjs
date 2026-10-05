import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {validateRelease} from '../../../../scripts/validate-s4-release.mjs';
const app=path.resolve(import.meta.dirname,'../../../..'),out=import.meta.dirname;
const files={'harness.html':'u1/controls/harness.html','harness.tsx':'u1/controls/harness.tsx','harness-browser.mjs':'u1/controls/browser.mjs','timing-continuity.mjs':'u1/timing-continuity.mjs','check-assets-config.mjs':'u1/check-assets-config.mjs'};
const provenance=[];
for(const [name,relative]of Object.entries(files)){
 const from=path.join(app,'validation/ui-consistency',relative);let content=fs.readFileSync(from,'utf8');
 if(name==='timing-continuity.mjs'||name==='check-assets-config.mjs')content=content.replace("import.meta.dirname, '../../..'","import.meta.dirname, '../../../..'").replace("import.meta.dirname,'../../..'","import.meta.dirname,'../../../..'");
 if(name==='harness-browser.mjs')content=content.replace('validation/ui-consistency/u1/controls/harness.html','validation/ui-consistency/u2/independent/harness.html').replace("import {chromium} from '../../../../../../node_modules/playwright/index.mjs';","import {createRequire} from 'node:module';\nconst require=createRequire(new URL('../../../../../../package.json',import.meta.url));\nconst {chromium}=require('playwright');\nprocess.env.TEMP=process.env.TMP=decodeURIComponent(new URL('../../../../.u05tmp',import.meta.url).pathname).replace(/^\\/(.:)/,'$1');");
 fs.writeFileSync(path.join(out,name),content);provenance.push({name,from:relative,sha256:crypto.createHash('sha256').update(fs.readFileSync(from)).digest('hex')});
}
fs.writeFileSync(path.join(out,'secondary-test-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
fs.writeFileSync(path.join(out,'release-validation.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),releases:['alevel','igcse'].map(validateRelease),scope:'Fresh read-only validation of existing exact build closure. No rebuild or manifest writes.'},null,2)+'\n');
fs.writeFileSync(path.join(out,'initial-probe-failures.json'),JSON.stringify({status:'HARNESS_PATH_FIX',checkedAt:new Date().toISOString(),failures:[{script:'check-originals.mjs',reason:'Initial copy retained depth3 app root; no baseline opened, no output written. Corrected to depth4.'},{script:'central-attempt.test.mjs',reason:'Initial copy retained depth3 scenario import; module resolution failed. Corrected scenario path.'},{script:'app-browser.mjs',reason:'URL.pathname TEMP retained percent escapes; Edge launch failed before page creation. Corrected decodeURIComponent.'}],productDefects:false},null,2)+'\n');
console.log('PASS release closures; secondary copied gates ready');
