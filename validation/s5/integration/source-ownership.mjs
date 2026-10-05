import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { currentInputs } from '../../../scripts/current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '../../..');
const beforeFile = path.join(project, 'validation/s5/behaviour/fingerprints-before.json');
const before = JSON.parse(fs.readFileSync(beforeFile));
const after = new Map(currentInputs().map(row => [row.path, row]));
const allowed = {
  'src/activities/alevel/acid-base-calculations/provider.ts': 'A08: answer-format instructions',
  'src/activities/alevel/electrons-bonding/provider.ts': 'A12: three qualified prompts',
  'src/foundation/ActivityHost.tsx': 'A17 + A01: visible startup read failure, same-database Retry/connection release, trusted Next after blur save and checked session-only completion/resume with distinct failure ownership',
  'src/contracts/repository.ts': 'A01: optional connection close lifecycle',
  'src/persistence/repository.ts': 'A01: Dexie connection close implementation; no table/write algorithm change',
  'src/activities/olympiad/c3l6/C3L6View.tsx': 'A16: current K model/erratum and distinct historical outcome',
  'src/activities/olympiad/c3l6/content.ts': 'A16: current22 checked alternatives',
  'src/activities/olympiad/c3l6/legacy.ts': 'A16: current K import revalidation',
  'src/activities/olympiad/c3l6/policy.ts': 'A16: same-formula wrong-K rejection and raw historical retention',
  'src/activities/olympiad/c3l6/source-bank.ts': 'A16: explicit authored current22/raw23 projection; extracted JSON unchanged',
  'src/contracts/olympiad.ts': 'A16: bounded non-nested historical outcome',
  'src/persistence/validation.ts': 'A16: strict optional historical outcome validation',
  'src/editors/titration-curve/TitrationCurveEditor.tsx': 'A14: local numeric text drafts and meaningful commit',
  'src/editors/energy-profile/index.tsx': 'A13: local numeric text drafts and meaningful commit',
  'src/editors/dot-and-cross/DotCrossEditor.tsx': 'A15: complete signed charge setup/Apply',
};
const oldSource = Object.keys(before.files).filter(file => file.startsWith('src/')).sort();
const currentSource = [...after.keys()].filter(file => file.startsWith('src/')).sort();
assert.deepEqual(currentSource, oldSource, 'Unexpected new/deleted production source');
const changed = oldSource.filter(file => before.files[file] !== after.get(file).sha256);
assert.deepEqual(changed, Object.keys(allowed).sort(), 'Unexpected or missing scoped source change');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = {
  status: 'PASS', checkedAt: new Date().toISOString(), baseline: 'validation/s5/behaviour/fingerprints-before.json', baselineSha256: sha(fs.readFileSync(beforeFile)),
  sourceFiles: oldSource.length, changedSourceFiles: changed.length, bytePreservedSourceFiles: oldSource.length - changed.length,
  changed: changed.map(file => ({ path: file, ownerAndReason: allowed[file], beforeSha256: before.files[file], afterSha256: after.get(file).sha256 })),
  bytePreserved: oldSource.filter(file => !changed.includes(file)),
  controlsEvidence: 'validation/s5/integration/foreman-source-and-controls.txt',
  note: 'Fifteen explicit S5 authored changes only. Extracted source/data/assets are byte preserved; root control/hash validity separately rerun. Runtime builds/releases regenerated inside this project.',
};
fs.writeFileSync(path.join(import.meta.dirname, 'source-ownership.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, sourceFiles: report.sourceFiles, changed: report.changedSourceFiles, bytePreserved: report.bytePreservedSourceFiles }));
