import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const app=path.resolve(import.meta.dirname,'../../../..'),prior=JSON.parse(fs.readFileSync(path.join(app,'validation/component-fidelity/f3/foreman/build-source-inputs.json'),'utf8'));
const files=prior.inputs.filter(row=>!row.path.startsWith('src/')),checked=[];
for(const row of files){const bytes=fs.readFileSync(path.join(app,row.path)),sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,row.sha256,row.path);assert.equal(bytes.length,row.bytes,row.path);checked.push({...row});}
const report={status:'PASS',checkedAt:new Date().toISOString(),baseline:'Accepted F3 final build-source-inputs.json; includes final Olympiad additions as dependencies',checked,scope:'All public assets, dependencies/lock/configuration, course entries and relevant build scripts remain byte-identical. Outlined chemistry and NMR sources separately checked in source/OLY audits.'};
fs.writeFileSync(path.join(import.meta.dirname,'assets-config-preservation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,files:checked.length}));
