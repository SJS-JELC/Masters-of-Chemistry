import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../../..'), out = path.join(import.meta.dirname, 'regression');
fs.mkdirSync(out, { recursive: true });
const from = path.join(app, 'validation/component-fidelity/f3/independent');
for (const file of ['canonical-identity.test.mjs','current-persistence.test.mjs','numeric-working.test.mjs','acid-pre-correction-fixtures.json','current-export.json']) {
  let content = fs.readFileSync(path.join(from, file));
  if (file === 'numeric-working.test.mjs') content = Buffer.from(content.toString().replace('../../f1-correction/identity/current-export.json', './current-export.json'));
  fs.writeFileSync(path.join(out, file), content);
}
const files = ['canonical-identity.test.mjs','current-persistence.test.mjs','numeric-working.test.mjs'].map(file => path.join(out,file));
const result = spawnSync(process.execPath, ['--test', ...files], { cwd: app, encoding: 'utf8' });
fs.writeFileSync(path.join(import.meta.dirname, 'regression-tests.txt'), (result.stdout ?? '') + (result.stderr ?? ''));
fs.writeFileSync(path.join(import.meta.dirname, 'regression-results.json'), JSON.stringify({status: result.status === 0 ? 'PASS':'FAIL', checkedAt:new Date().toISOString(),exitCode:result.status,files,port:'Existing tests/fixtures copied byte-exact except one numeric fixture URL repathed to current local output; all writes confined here.'},null,2));
console.log((result.stdout ?? '').split('\n').slice(-10).join('\n')); if (result.error) throw result.error; process.exitCode = result.status ?? 1;
