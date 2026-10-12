import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { compound, formulaCode } from '../../../src/chemistry/formulae-equations/generator.ts';
import { allowedPairs, ionBank } from '../../../src/chemistry/formulae-equations/ions.ts';
import { equationBank } from '../../../src/activities/igcse/equations/bank.ts';
import { equationIdentity } from '../../../src/chemistry/formulae-equations/identity.ts';
import fixedIds from '../../../src/content/canonical-fixed-ids.json' with { type: 'json' };
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const hash = async (name) =>
  crypto
    .createHash('sha256')
    .update(await fs.readFile(path.join(project, name)))
    .digest('hex');
const sources = [
  {
    path: 'src/chemistry/formulae-equations/ions.ts',
    sha256: await hash('src/chemistry/formulae-equations/ions.ts'),
    symbolOrSection:
      'Original 19-ion bank and 36 individually vetted compounds, RF-S1-CONTENT; author chemistry review 10 October 2026. No examination wording copied.',
  },
  {
    path: 'src/activities/igcse/equations/bank.ts',
    sha256: await hash('src/activities/igcse/equations/bank.ts'),
    symbolOrSection:
      'Original 24 authored records and four RF-FORMAT-20261010 state-explicit replacements P–S preserved; two RF-FOLLOWUP-20261010 separate aluminium balance/state tasks T–U appended and reviewed 10 October 2026. Historical original bank: validation/formulae-equations-format/s0/before/src/activities/igcse/equations/bank.ts, SHA256 1cace012dd0025116f121d4587584839ecdce7c9f6d6982bb1a7d1a8e024c88d. No source PDFs/images opened.',
  },
];
await fs.writeFile(
  path.join(project, 'src/chemistry/formulae-equations/sources.ts'),
  "import type {SourceReference} from '../../contracts/index.ts';\nexport const formulaeSources:readonly SourceReference[]=" +
    JSON.stringify([sources[0]], null, 2) +
    ';\nexport const equationsSources:readonly SourceReference[]=' +
    JSON.stringify([sources[1]], null, 2) +
    ';\n',
);
// Derive closed guard membership from committed assignments, never from array position.
const identityRow = (prefix, sourceId, level) => {
  const code = fixedIds[prefix][sourceId];
  if (!code || !new RegExp('^' + prefix + '-[A-Z0-9]{6}$').test(code))
    throw Error('Missing permanent identity: ' + sourceId);
  return { sourceId, level, code };
};
const membership = {
  formulae: allowedPairs.map((pair) => identityRow('FO', pair.id, pair.level)),
  equations: equationBank.map((record) => identityRow('EQ', record.id, record.level)),
};
for (const rows of Object.values(membership))
  if (new Set(rows.map((row) => row.code)).size !== rows.length)
    throw Error('Duplicate permanent identity');
await fs.writeFile(path.join(project, 'src/chemistry/formulae-equations/identity-membership.json'),
  JSON.stringify(membership) + '\n');
const pinIds = [
  'sodium-chloride',
  'magnesium-oxide',
  'magnesium-chloride',
  'aluminium-oxide',
  'ammonium-chloride',
  'calcium-carbonate',
  'magnesium-hydroxide',
  'aluminium-sulfate',
];
const link = (activity, id, level, seed) =>
  '/?' +
  new URLSearchParams({
    course: 'igcse',
    view: 'teacher',
    activity,
    review: id,
    level: String(level),
    seed: String(seed),
  });
const pins = pinIds.map((id) => {
  const pair = allowedPairs.find((p) => p.id === id),
    d = compound(pair),
    code = formulaCode(id, 123);
  return {
    id: code,
    legacyId: 'RF1:' + id + ':123',
    legacyReviewLink: link('igcse/formulae', 'RF1:' + id + ':123', pair.level, 123),
    activityId: 'igcse/formulae',
    name: pair.name,
    level: pair.level,
    seed: 123,
    answer: d.formula,
    reviewLink: link('igcse/formulae', code, pair.level, 123),
    coverage: [
      d.cation.charge === -d.anion.charge ? 'equal charge' : 'unequal charge',
      Math.min(Math.abs(d.cation.charge), Math.abs(d.anion.charge)) > 1
        ? 'charge-ratio simplification'
        : 'ratio already reduced',
      d.formula.includes('(') ? 'repeated polyatomic brackets' : 'no brackets',
    ],
  };
});
const entries = [
  ...pins,
  ...equationBank.map((r) => ({
    id: equationIdentity(r.id).code,
    legacyId: r.id,
    legacyReviewLink: link('igcse/equations', r.id, r.level, 0),
    activityId: 'igcse/equations',
    name: r.family,
    level: r.level,
    seed: 0,
    answer: r.answer,
    ...(r.task === 'complex-words-states' ? { prompt: r.prompt } : {}),
    reviewLink: link('igcse/equations', equationIdentity(r.id).code, r.level, 0),
    markPoints: r.markPoints,
  })),
];
await fs.writeFile(
  path.join(project, 'resources/recall-formulae/content/review-index.json'),
  JSON.stringify(
    {
      runId: 'RECALL-FORMULAE-20261010',
      jobId: 'RF-S1-CONTENT',
      schemaVersion: 1,
      bandLabels: { 1: 'Grade 5–6', 2: 'Grade 7–8', 3: 'Grade 9' },
      sources,
      entries,
    },
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  path.join(project, 'resources/recall-formulae/content/allowed-pair-review.json'),
  JSON.stringify(
    {
      sources: [sources[0]],
      reviewedPairs: allowedPairs.map((p) => {
        const d = compound(p);
        return {
          id: p.id,
          name: p.name,
          level: p.level,
          formula: d.formula,
          cationId: d.cation.id,
          anionId: d.anion.id,
          ionRatio: [d.cationCount, d.anionCount],
          netCharge: 0,
          composition: d.composition,
          review: 'AUTHOR-CHEMISTRY-PASS',
        };
      }),
      ionRecallLinks: ionBank.map((i) => ({ id: i.id, recallFactIds: i.recallFactIds })),
    },
    null,
    2,
  ) + '\n',
);
let md =
  '# Formulae and Equations: 38-example review index\n\nEight generator pins (four in each supported band), all 24 original equations, four state-explicit replacement pins and two appended separate balance/state exercises. Historical H–K links keep their original two-point models; new practice/revision selects P–S and separate T–U; original combined8 restores with separate rows. The relative URLs are intended for the combined app local preview after activity registration; S1 content validation does not claim browser or production integration acceptance.\n\n| ID | Band | Model answer | Local teacher review |\n|---|---|---|---|\n';
for (const e of entries)
  md +=
    '| ' +
    e.id +
    ' | ' +
    { 1: '5–6', 2: '7–8', 3: '9' }[e.level] +
    ' | ' +
    e.answer +
    ' | [Review](' +
    e.reviewLink +
    ') |\n';
md +=
  '\n## Regeneration\n\nRun from the project folder: node --experimental-strip-types resources/recall-formulae/content/generate-review.mjs, then node scripts/test-recall-formulae-content.mjs. Sources are original authored editable TypeScript data; no raw examination PDFs, mark schemes or source images were opened. The allowed-pair review explicitly enumerates every compound; the runtime never takes a cation/anion cross product.\n';
await fs.writeFile(path.join(project, 'resources/recall-formulae/content/README.md'), md);
console.log(
  JSON.stringify({
    entries: entries.length,
    formulaPins: pins.length,
    equations: equationBank.length,
    allowedPairs: allowedPairs.length,
    sources,
  }),
);

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const reviewHtml =
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Formulae and Equations teacher review</title><style>body{font:16px system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#17313d}h1{font-size:1.8rem}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:.65rem;border-bottom:1px solid #cad6db}a{color:#08616d}code{white-space:normal;font-size:.9rem}@media(max-width:600px){table{font-size:.85rem}th,td{padding:.4rem}.id{display:none}}</style><h1>Formulae and Equations: teacher review</h1><p>38 reviewed examples: eight generator pins, all 28 retained equation records and two appended separate balance/state exercises. Open a question to inspect its prompt and checked model answer. Teacher views create no learner evidence.</p><table><thead><tr><th class="id">Stable question ID</th><th>Band</th><th>Model answer</th><th>Question</th></tr></thead><tbody>' +
  entries
    .map(
      (e) =>
        '<tr><td class="id"><code>' +
        escapeHtml(e.id) +
        '</code></td><td>' +
        { 1: '5–6', 2: '7–8', 3: '9' }[e.level] +
        '</td><td>' +
        escapeHtml(e.answer) +
        '</td><td><a href="' +
        escapeHtml('../' + e.reviewLink.slice(1)) +
        '">Review ' +
        escapeHtml(e.name) +
        '</a></td></tr>',
    )
    .join('') +
  '</tbody></table><p>Source and regeneration evidence: <a href="review-index.json">question index</a>, <a href="allowed-pair-review.json">vetted compound pairs</a>.</p></html>';
await fs.mkdir(path.join(project, 'public/recall-formulae-review'), { recursive: true });
await fs.writeFile(path.join(project, 'public/recall-formulae-review/index.html'), reviewHtml);
for (const name of ['review-index.json', 'allowed-pair-review.json'])
  await fs.copyFile(
    path.join(project, 'resources/recall-formulae/content', name),
    path.join(project, 'public/recall-formulae-review', name),
  );

await fs.writeFile(
  path.join(project, 'src/chemistry/formulae-equations/canonical-equation-ids.json'),
  JSON.stringify(equationBank.map((r) => equationIdentity(r.id).code)) + '\n',
);

await fs.writeFile(
  path.join(project, 'resources/recall-formulae/content/review-index.html'),
  reviewHtml.replaceAll('href="../?', 'href="/?'),
);
