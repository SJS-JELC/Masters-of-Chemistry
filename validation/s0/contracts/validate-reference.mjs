import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, '../../../../..');
const sources = [
  ['apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels.js', 'generate, reviewId, score, 38 active templates'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/levels-app.js', 'active controller, response and scaffold restoration'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/scaffold.js', 'built-in structured scaffolds'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/core.js', 'validateState, anchored electrons, groups and marking'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/data.js', 'fixed level-specific diagrams'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/core.js', 'blankResponse, markBuild, box spin states'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/levels.js', 'active LEVELS and generator scheduling'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/levels-app.js', 'active page controller'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/core.js', 'initial, curve, grade, accepted indicators'],
  ['apps/Masters-of-A-Level-Chemistry/src/assets/active-question-time.js', 'allowance, create, snapshot, finish and browser suspension'],
  ['apps/Masters-of-A-Level-Chemistry/src/assets/alevel-mastery.js', 'course config, historical aliases, zero-prior recurrence'],
  ['apps/Masters-of-A-Level-Chemistry/src/assets/test-mode-core.js', 'next, accept, expire and confirmation streaks'],
  ['apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/data.js', 'fixed question IDs, marking points and reject text'],
  ['apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/core.js', 'levelTwoSections and levelOneTables'],
  ['apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/app.js', 'lockedText, evidence ranges, sequential self review and timing'],
  ['apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/core.js', 'model, attached/free arrow ends and repair mode'],
  ['apps/Masters-of-IGCSE-Chemistry/src/landing/progress.js', 'grade evidence, questionScore and mastery recurrence'],
  ['apps/Masters-of-IGCSE-Chemistry/src/assets/igcse-mastery-config.js', 'supported grades and per-gem half-lives'],
  ['apps/Masters-of-IGCSE-Chemistry/src/assets/igcse-question-time.js', 'IGCSE question allowances and freeze boundary'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/content.js', 'classification and B/C answer slots'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assessment.js', 'B_UNITS, E/F equivalence, unlock and stale checks'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/activity.js', 'drawing selection, editor export/import and read-only completed slots'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/core.js', 'bounded atom graph, valence and isomorphism dependency only'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/editor.js', 'graph/history exportState and importState dependency only'],
  ['apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/mechanism-ui.js', 'optional annotation field serialization; prototype never enabled'],
];
const sourceEvidence = sources.map(([path, symbolOrSection]) => ({ path, symbolOrSection,
  sha256: createHash('sha256').update(readFileSync(resolve(workspace, path))).digest('hex') }));
const evidencePath = resolve(here, 'source-evidence.json');
if (existsSync(evidencePath)) {
  assert.deepEqual(JSON.parse(readFileSync(evidencePath, 'utf8')).sources, sourceEvidence,
    'Source fingerprint changed: retain previous evidence and obtain substantive review before updating.');
}
const contractRoot = resolve(here, '../../../src/contracts');
const identity = readFileSync(resolve(contractRoot, 'identity.ts'), 'utf8');
const appContract = JSON.parse(readFileSync(resolve(here, '../../../project-contract.json'), 'utf8'));
const actualIds = [...new Set(identity.match(/(?:alevel|igcse)\/[a-z0-9-]+/g))].sort();
assert.deepEqual(actualIds, appContract.activities.map(a => a.id).sort());
for (const file of readdirSync(contractRoot).filter(f => f.endsWith('.ts'))) {
  const content = readFileSync(resolve(contractRoot, file), 'utf8');
  const code = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(code, /\b(?:any|unknown)\b/, `${file} must preserve concrete question/editor types`);
  assert.doesNotMatch(content, /^import (?!type\b)/m, `${file} must have type-only dependencies`);
}
const context = vm.createContext({});
for (const file of ['data.js', 'core.js', 'levels.js']) {
  vm.runInContext(readFileSync(resolve(workspace, 'apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations', file), 'utf8'), context);
}
const q = context.AcidBaseLevels.generate('h-to-ph', 1, 123);
assert.equal(context.AcidBaseLevels.templates.length, 38);
assert.equal(JSON.stringify(q), JSON.stringify(context.AcidBaseLevels.generateFromReview(q.reviewId)));
const c3context = vm.createContext({});
vm.runInContext(readFileSync(resolve(workspace, 'apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/content.js'), 'utf8'), c3context);
assert.deepEqual(Array.from(c3context.C3L6Content.stages.b.answers, a => a.id), ['A','B','C','D','E','F','G','H','J','K','L','M']);
assert.deepEqual(Array.from(c3context.C3L6Content.stages.c.answers, a => a.id), ['R','S','T','U','V','W','X','Y','Z']);
if (!existsSync(evidencePath)) writeFileSync(evidencePath, JSON.stringify({ runId: 'MASTERS-REACT-20261002', jobId: 'S0-CONTRACTS', sources: sourceEvidence }, null, 2) + '\n');
writeFileSync(resolve(here, 'reference-checks.json'), JSON.stringify({
  status: 'PASS', checkedAt: new Date().toISOString(), checks: [
    '25 representative source files hashed without writes', 'active acid bank contains 38 templates',
    'AB2 source review identity reproduces question for seed 123', 'C3L6 B and C slot unions match actual answer IDs',
    'Activity ID union matches all twelve authorised registrations exactly',
    'Contracts have type-only imports and no any/unknown payload erasure',
  ], acidRepresentative: q,
  limitations: ['Compile fixtures are semantic examples, not migrated checked banks.', 'S0 does not implement runtime or browser acceptance.'],
}, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', sourceFiles: sourceEvidence.length, reviewId: q.reviewId, response: q.responses }));
