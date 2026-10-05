import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { currentInputs } from '../../../scripts/current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '../../..');
const hashes = currentInputs();
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const report = { checkedAt: new Date().toISOString(), status: 'frozen-for-independent-review', treeSha256: sha(JSON.stringify(hashes)), currentInputHashes: hashes, releases: ['alevel', 'igcse'].map(course => {
  const file = path.join(project, 'release', `${course}.runtime.json`);
  const manifest = JSON.parse(fs.readFileSync(file));
  return { course, manifestSha256: sha(fs.readFileSync(file)), initialJavascriptGzipBytes: manifest.initialJavascriptGzipBytes, runtimeFiles: manifest.files.length, lazyJavascriptChunks: manifest.lazyJavascript.length };
}) };
fs.writeFileSync(path.join(import.meta.dirname, 'freeze-current.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ checkedAt: report.checkedAt, treeSha256: report.treeSha256, inputs: hashes.length, releases: report.releases }));
