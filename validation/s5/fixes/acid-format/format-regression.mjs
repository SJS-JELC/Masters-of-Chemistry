import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import { acidEngine } from '../../../../src/activities/alevel/acid-base-calculations/engine.js';
import {
  acidQuestion,
  acidProvider,
  acidNotation,
} from '../../../../src/activities/alevel/acid-base-calculations/provider.ts';
import { acidMarking } from '../../../../src/activities/alevel/acid-base-calculations/marking.ts';

const output = import.meta.dirname;
const project = resolve(output, '../../../..');
const workspace = resolve(project, '../..');
const sourceDir = resolve(project, 'src/activities/alevel/acid-base-calculations');
const beforeText = readFileSync(resolve(output, 'before-provider.ts'), 'utf8');
const afterText = readFileSync(resolve(sourceDir, 'provider.ts'), 'utf8');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Load the retained pre-fix provider with the same unchanged engine and source records.
// Transpilation only removes TypeScript; absolute imports keep this isolated module exact.
async function loadProvider(source) {
  for (const name of ['engine.js', 'sources.ts']) {
    source = source.replaceAll(
      `'./${name}'`,
      JSON.stringify(pathToFileURL(resolve(sourceDir, name)).href),
    );
  }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}
const beforeProvider = await loadProvider(beforeText);
const exposedProvider = await loadProvider(
  afterText.replace('function roundingInstruction(', 'export function roundingInstruction('),
);
const originalContext = {};
vm.createContext(originalContext);
const originalDir = resolve(
  workspace,
  'apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations',
);
const originalHashes = {};
for (const file of ['data.js', 'core.js', 'levels.js']) {
  const bytes = readFileSync(resolve(originalDir, file));
  originalHashes[file] = hash(bytes);
  vm.runInContext(bytes.toString('utf8'), originalContext);
}
const original = originalContext.AcidBaseLevels;
const plain = (value) => JSON.parse(JSON.stringify(value));
const precision = {
  dp2: 'to 2 decimal places',
  dp3: 'to 3 decimal places',
  sf3: 'to 3 significant figures',
  sf4: 'to 4 significant figures',
  integer: 'as a whole number',
};
function rounded(response) {
  if (response.format === 'dp2') return response.expected.toFixed(2);
  if (response.format === 'dp3') return response.expected.toFixed(3);
  if (response.format === 'integer') return response.expected.toFixed(0);
  return response.expected.toPrecision(response.format === 'sf4' ? 4 : 3);
}
const counts = { current: {}, historical: {} };
const examples = { current: {}, historical: {} };
let questions = 0;
let responses = 0;
function verify(source, historical) {
  const mode = historical ? 'historical' : 'current';
  const restored = original.generateFromReview(source.reviewId);
  assert.deepEqual(source, { ...plain(restored), ...(historical ? { legacy: true } : {}) });
  const question = acidQuestion(source);
  const before = beforeProvider.acidQuestion(source);
  const ref = acidProvider.resolveLink(source.reviewId);
  assert.deepEqual(ref, question.ref);
  assert.deepEqual(acidProvider.restore(ref), question);
  const stripped = structuredClone(question);
  stripped.context = before.context;
  for (let i = 0; i < source.responses.length; i++) {
    const response = source.responses[i];
    const part = question.parts[i];
    const quantity = response.unit ? `${response.symbol} (${response.unit})` : response.symbol;
    const instruction = acidNotation(`Give ${quantity} ${precision[response.format]}.`);
    assert.deepEqual(part.prompt[1], { kind: 'text', text: instruction });
    stripped.parts[i].prompt.splice(1, 1);
    assert.deepEqual(part.acceptance, {
      kind: 'absolute',
      expected: response.expected,
      tolerance: response.tolerance,
    });
    counts[mode][response.format] = (counts[mode][response.format] ?? 0) + 1;
    examples[mode][response.format] ??= { code: source.reviewId, key: response.key, instruction };
    const answer = rounded(response);
    assert.equal(acidEngine.score([answer], [response]).score, 1);
    assert.equal(original.score([answer], [restored.responses[i]]).score, 1);
    assert.equal(
      acidEngine.score([String(response.expected + response.tolerance * 1.01)], [response]).score,
      0,
    );
    responses++;
  }
  // Only the general rounding sentence and each response's added instruction may differ.
  assert.deepEqual(stripped, before);
  const allCorrect = Object.fromEntries(
    source.responses.map((r) => [r.key, { kind: 'numeric', raw: rounded(r), unit: r.unit }]),
  );
  const marked = acidMarking.mark(question, allCorrect);
  assert(marked.accepted);
  assert.equal(marked.marks.earned, marked.marks.available);
  assert(!acidMarking.mark(question, {}).accepted);
  assert(!question.context.some((block) => block.text?.includes('unless exact')));
  questions++;
}

const seeds = [0, 1, 7, 19, 2718, 4294967295];
const routeIds = new Set();
for (const family of acidProvider.coverage[0].families) {
  for (const level of family.levels) {
    routeIds.add(`${family.templateId}:${level}`);
    for (const seed of seeds) verify(acidEngine.generate(family.templateId, level, seed), false);
  }
}
assert.equal(routeIds.size, 63);
const fixtures = JSON.parse(
  readFileSync(resolve(workspace, 'development/tests/fixtures/acid-legacy-reviews.json'), 'utf8'),
).questions;
for (const fixture of fixtures) verify(acidEngine.generateFromReview(fixture.reviewId), true);
// Exact independent-review failure, outside any reliance on the frozen fixture bank.
const regression = acidEngine.generateFromReview('AB-0000SN');
verify(regression, true);
const volume = regression.responses.find((response) => response.key === 'volume');
assert(volume, JSON.stringify(regression.responses));
assert.equal(volume.unit, 'cm³');
assert.equal(volume.expected, 46.875);
assert.equal(volume.format, 'dp2');
assert.equal(volume.tolerance, 0.0051);
const regressionQuestion = acidQuestion(regression);
const baselineResponse = Object.fromEntries(
  regression.responses.map((response) => [
    response.key,
    { kind: 'numeric', raw: rounded(response), unit: response.unit },
  ]),
);
const exact = acidMarking.mark(regressionQuestion, baselineResponse);
assert(exact.accepted);
assert.equal(exact.marks.points.find((point) => point.partId === volume.key).earned, 1);
const wronglyRounded = acidMarking.mark(regressionQuestion, {
  ...baselineResponse,
  [volume.key]: { kind: 'numeric', raw: '46.9', unit: volume.unit },
});
assert(wronglyRounded.accepted);
assert.equal(wronglyRounded.marks.points.find((point) => point.partId === volume.key).earned, 0);
// Supplemental type-contract branch checks, not generated-question or chemistry evidence.
// Dormant formats are explicitly distinguished from formats present in the real bank.
for (const [format, words] of Object.entries(precision)) {
  assert.equal(
    exposedProvider.roundingInstruction({ ...volume, format }),
    `Give ${volume.symbol} (${volume.unit}) ${words}.`,
  );
}
assert.equal(
  exposedProvider.roundingInstruction({ ...volume, symbol: 'pH', unit: '', format: 'dp2' }),
  'Give pH to 2 decimal places.',
);
const fingerprints = Object.fromEntries(
  readdirSync(sourceDir)
    .filter((name) => !name.startsWith('.'))
    .map((name) => [name, hash(readFileSync(resolve(sourceDir, name)))]),
);
const initialFiles = JSON.parse(
  readFileSync(resolve(project, 'validation/s5/chemistry/initial-fingerprints.json'), 'utf8'),
).files;
const initialAcidFiles = initialFiles.filter((entry) =>
  entry.path.startsWith('src/activities/alevel/acid-base-calculations/'),
);
assert.equal(initialAcidFiles.length, Object.keys(fingerprints).length);
for (const entry of initialAcidFiles) {
  const name = entry.path.split('/').at(-1);
  assert.equal(
    name === 'provider.ts' ? hash(beforeText) : fingerprints[name],
    entry.sha256,
    `Unrelated acid source changed: ${name}`,
  );
}
writeFileSync(
  resolve(output, 'fingerprints.json'),
  JSON.stringify(
    {
      beforeProvider: hash(beforeText),
      afterProvider: hash(afterText),
      fingerprints,
      originalHashes,
      independentBeforeReference: 'validation/s5/chemistry/initial-fingerprints.json',
      unchangedAcidFiles: initialAcidFiles.length - 1,
    },
    null,
    2,
  ) + '\n',
);
const result = {
  agentId: 'A08',
  jobId: 'S5-FIX-ACID-FORMAT',
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  currentRoutes: routeIds.size,
  currentQuestions: routeIds.size * seeds.length,
  historicalFixtures: fixtures.length,
  additionalHistoricalRegression: 'AB-0000SN',
  questions,
  responses,
  counts,
  examples,
  contractOnlyFormats: Object.keys(precision).filter(
    (format) => !counts.current[format] && !counts.historical[format],
  ),
  regression: {
    code: regression.reviewId,
    expected: volume.expected,
    format: volume.format,
    tolerance: volume.tolerance,
    accepted: '46.88',
    rejected: '46.9',
  },
  checks: [
    'Original live source question equality',
    'Exact identity/seed restoration',
    'Every real response format and unit instruction',
    'Rounded instructed answers accepted by both original and port',
    'Source numerical bounds unchanged',
    'All question fields except precision text unchanged against retained before-provider',
    'Real adapter marking and incomplete-response rejection',
    'Five typed formats helper branches (dormant formats separately identified)',
  ],
  acceptance:
    'Worker verification only; A22 owns independent recheck and A01 final build/integration.',
};
writeFileSync(resolve(output, 'format-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
