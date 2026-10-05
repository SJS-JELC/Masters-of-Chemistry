import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const out=import.meta.dirname,root=path.resolve(out,'../../..'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const original=fs.readFileSync(path.join(root,'validation/s3/c3l6/c3l6.test.ts')),authored=fs.readFileSync(path.join(root,'validation/s5/fixes/c3-k-erratum/c3-reference.test.ts'),'utf8');
if(fs.existsSync(path.join(out,'c3-reference.test.ts')))fs.renameSync(path.join(out,'c3-reference.test.ts'),path.join(out,'c3-reference.retained.ts'));
const current=authored.replaceAll("'../../../../src/","'../../../src/").replace("'../../../..'),original=","'../../..'),original=");
fs.writeFileSync(path.join(out,'c3-current-source-regression.test.ts'),current);
const diff=spawnSync('git',['diff','--no-index','--',path.join(root,'validation/s3/c3l6/c3l6.test.ts'),path.join(out,'c3-current-source-regression.test.ts')],{encoding:'utf8'});
fs.writeFileSync(path.join(out,'c3-full-port.diff'),diff.stdout);
fs.writeFileSync(path.join(out,'c3-regression-port-provenance.json'),JSON.stringify({originalSha256:sha(original),originalUntouched:sha(original)===sha(fs.readFileSync(path.join(root,'validation/s3/c3l6/c3l6.test.ts'))),authorSuiteSha256:sha(authored),currentSha256:sha(current),method:'Full seven historical groups retained; bounded current K expectations plus three authored erratum/history/mass groups. A22 executes independently; author algorithm credited. Imports/project depth relocated only; outputs stay owned.'},null,2));

