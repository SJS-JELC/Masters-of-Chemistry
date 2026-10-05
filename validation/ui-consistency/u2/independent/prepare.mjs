import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../../../scripts/current-inputs.mjs';
const out=import.meta.dirname, app=path.resolve(out,'../../../..');
const inputs=currentInputs(), prior=JSON.parse(fs.readFileSync(path.join(app,'validation/ui-consistency/u1-footer-fix/current-inputs.json'),'utf8'));
const tree=crypto.createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
fs.writeFileSync(path.join(out,'current-inputs-start.json'),JSON.stringify({checkedAt:new Date().toISOString(),inputs,treeSha256:tree},null,2)+'\n');
assert.deepEqual(inputs,Array.isArray(prior)?prior:prior.inputs);
assert.equal(inputs.length,645);
const copies={
 'check-originals.mjs':'u1-footer-fix/check-originals.mjs',
 'footer-browser.mjs':'u1-footer-fix/browser.mjs',
 'app-browser.mjs':'u1/controls/app-browser.mjs',
 'action-state.test.mjs':'u1/controls/action-state.test.mjs',
 'central-attempt.test.mjs':'u1/central-attempt.test.mjs',
 'completion.test.ts':'u1/olympiad/completion.test.ts',
 'fixtures.ts':'u1/olympiad/fixtures.ts',
 'olympiad-browser.mjs':'u1/olympiad/browser.mjs',
 'theme-browser.mjs':'u1/theme/final-browser.mjs',
 'extra-browser.mjs':'u1/theme/browser-extra.mjs',
 'transition-cancellation.mjs':'u1/theme/transition-cancellation.mjs',
 'ec-axis-check.mjs':'u1/theme/ec-axis-check.mjs',
 'canonical-identity.test.mjs':'u1/regression/canonical-identity.test.mjs',
 'current-persistence.test.mjs':'u1/regression/current-persistence.test.mjs',
 'numeric-working.test.mjs':'u1/regression/numeric-working.test.mjs',
 'acid-pre-correction-fixtures.json':'u1/regression/acid-pre-correction-fixtures.json',
 'current-export.json':'u1/regression/current-export.json',
};
const provenance=[];
for(const [name,relative] of Object.entries(copies)){
 const from=path.join(app,'validation/ui-consistency',relative);let content=fs.readFileSync(from,'utf8');
 if(relative.startsWith('u1-footer-fix/')||relative==='u1/central-attempt.test.mjs')content=content.replaceAll('../../../','../../../../');
 content=content.replaceAll('validation/ui-consistency/u1/theme','validation/ui-consistency/u2/independent').replaceAll('.u03tmp','.u05tmp').replaceAll('btmp-u04','.u05tmp').replaceAll('ui-u04-','ui-u05-').replaceAll('ui-controls-u1','ui-controls-u05').replaceAll('U1-APP-ACID','U05-APP-ACID').replaceAll('.u1fx-tmp','.u05tmp');
 if(name==='app-browser.mjs')content=content.replace("import {chromium} from '../../../../../../node_modules/playwright/index.mjs';", "import {createRequire} from 'node:module';\nconst require=createRequire(new URL('../../../../../../package.json',import.meta.url));\nconst {chromium}=require('playwright');\nprocess.env.TEMP=process.env.TMP=new URL('../../../../.u05tmp',import.meta.url).pathname.replace(/^\\/(.:)/,'$1');");
 if(name==='theme-browser.mjs')content=content.replace('for(const width of [1440,390])','for(const width of [1440,820,390,350])');
 fs.writeFileSync(path.join(out,name),content);provenance.push({name,from:path.relative(app,from).replaceAll('\\','/'),originalSha256:crypto.createHash('sha256').update(fs.readFileSync(from)).digest('hex'),purpose:'Current independent rerun; output paths and imports rebased; fresh isolated U05 storage/TEMP. Theme viewport set expanded.'});
}
fs.mkdirSync(path.join(out,'screens'),{recursive:true});fs.mkdirSync(path.join(app,'.u05tmp'),{recursive:true});
fs.writeFileSync(path.join(out,'test-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',inputs:inputs.length,treeSha256:tree,copied:provenance.length}));
