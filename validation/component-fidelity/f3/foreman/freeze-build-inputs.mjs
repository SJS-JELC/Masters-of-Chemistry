import fs from'node:fs';import crypto from'node:crypto';import assert from'node:assert/strict';import{currentInputs}from'../../../../scripts/current-inputs.mjs';
const inputs=currentInputs().filter(row=>!row.path.startsWith('dist/')&&!row.path.startsWith('release/'));
const file=new URL('./build-source-inputs.json',import.meta.url);
if(process.argv[2]==='check'){const frozen=JSON.parse(fs.readFileSync(file,'utf8'));assert.deepEqual(inputs,frozen.inputs,'Source changed during or after final build');console.log('PASS exact build source/public/config closure');}
else fs.writeFileSync(file,JSON.stringify({at:new Date().toISOString(),inputs,sha256:crypto.createHash('sha256').update(JSON.stringify(inputs)).digest('hex'),scope:'Includes independently authorized concurrent OLY runtime inputs as build dependencies only; no component-stage acceptance of OLY content.'},null,2)+'\n');
