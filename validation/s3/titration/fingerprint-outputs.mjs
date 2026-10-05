import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const dirs=['src/activities/alevel/ph-titration-curves','src/editors/titration-curve','src/chemistry/titration-curve'];
const files=[];function scan(d){for(const item of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,item.name);if(item.isDirectory())scan(p);else files.push(p);}}dirs.forEach(scan);
fs.writeFileSync('validation/s3/titration/output-fingerprints.json',JSON.stringify({recordedAt:new Date().toISOString(),files:files.sort().map(p=>({path:p.replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}))},null,2));
