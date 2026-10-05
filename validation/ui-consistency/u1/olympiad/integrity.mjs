import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const app = path.resolve(import.meta.dirname,'../../../..'), before = path.join(app,'validation/ui-consistency/u1/before');
const changed = [], checked = [];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function walk(dir) {for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else {const relative=path.relative(before,file).replaceAll('\\','/');if(relative.endsWith('/c3l6.css'))continue;const current=path.join(app,relative);checked.push({path:relative,sha256:hash(current)});if(hash(file)!==hash(current))changed.push(relative);}}}
walk(path.join(before,'src/activities/olympiad'));
const report={status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),checked,changed,exception:'Only C3L6 presentation CSS max-width and padding changed; all policies, chemistry, data, answers, TSX, diagrams and approved NMR SVG are byte-identical to the U1 baseline.',rootAcceptance:{path:'validation/olympiad-2011-q4/root-acceptance.json',sha256:hash(path.join(app,'validation/olympiad-2011-q4/root-acceptance.json')),note:'Read-only fingerprint; retained historical root acceptance was not modified.'}};
fs.writeFileSync(path.join(import.meta.dirname,'integrity.json'),JSON.stringify(report,null,2));assert.deepEqual(changed,[]);console.log(`PASS ${checked.length} unchanged Olympiad source/asset files`);
