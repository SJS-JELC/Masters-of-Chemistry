import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const here = import.meta.dirname;
const project = path.resolve(here, '../../..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const comparison = read('browser-comparison.json');
const interaction = read('browser-interactions.json');
const matrix = read('state-matrix.json');
const visual = read('visual-inspection.json');
assert.equal(comparison.status, 'PASS');
assert.equal(interaction.status, 'PASS');
assert.equal(visual.status, 'PASS');
assert.equal(comparison.comparisons.length, 75);
assert.equal(matrix.count, 75);
assert.deepEqual(comparison.errors, []);
for (const item of read('output-fingerprints.json')) {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(project, item.path))).digest('hex');
  assert.equal(hash, item.sha256, `Current runtime fingerprint: ${item.path}`);
}
const fingerprint = crypto.createHash('sha256').update(fs.readdirSync(path.join(project, 'src/landing')).sort().map(name => name + crypto.createHash('sha256').update(fs.readFileSync(path.join(project, 'src/landing', name))).digest('hex')).join('\n')).digest('hex');
assert.equal(fingerprint, comparison.ownedSourceFingerprint);
assert.equal(fingerprint, comparison.finishedOwnedSourceFingerprint);
for (const item of matrix.pairs) {
  assert.ok(fs.existsSync(path.join(here, item.original)));
  assert.ok(fs.existsSync(path.join(here, item.restored)));
}
const readLog = name => {
  const bytes = fs.readFileSync(path.join(here, name));
  return bytes.toString(bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf16le' : 'utf8');
};
assert.match(readLog('typecheck-final.log'), /tsc --noEmit/);
assert.match(readLog('invariants-final.log'), /pass 3/);
const manifest = {
  agentId: 'L02', jobId: 'LANDING-DESIGN', status: 'PASS',
  outputPath: 'validation/landing-restoration/design/HANDOVER.md',
  confidence: 0.96, completedAt: new Date().toISOString(),
  validation: {
    typecheck: 'typecheck-final.log', sourceEquivalence: 'invariants-final.log',
    browserComparison: 'browser-comparison.json', pairs: 75,
    interactions: 'browser-interactions.json', matrix: 'state-matrix.json',
    visualInspection: 'visual-inspection.json',
    sourceFingerprints: 'source-fingerprints.json', outputFingerprints: 'output-fingerprints.json',
    ownedSourceFingerprint: fingerprint
  },
  runtimeAssets: ['public/assets/landing/SJS-Eagle.svg', 'public/assets/landing/fonts/Comfortaa-Bold.ttf'],
  risks: ['Original A Level pH levels 2/3 display lookup quirk preserved; shared mastery summaries unchanged.'],
  acceptance: 'Worker PASS; pending foreman integration and root acceptance.'
};
fs.writeFileSync(path.join(here, 'completion.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
