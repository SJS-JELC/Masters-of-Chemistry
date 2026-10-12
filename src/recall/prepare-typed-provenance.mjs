import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { recallFacts, recallFactAliases, recallCoverage } from './facts.ts';
import { contentEvidenceDirectory } from './approved-amendments.mjs';
const app = path.resolve(import.meta.dirname, '../..');
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');
const auditDir = 'resources/recall/source-audit';
const audited = {};
for (const name of [
  'igcse-recall-working.json',
  'completed-review-receipt.json',
  'recall-editorial-decisions.json',
  'data.js',
  'COMPLETED-REVIEW-STYLE.md',
  'answer-matching-review.md',
]) {
  const bytes = await fs.readFile(path.join(app, auditDir, name));
  audited[name] = { path: auditDir + '/' + name, sha256: hash(bytes), bytes: bytes.length };
}
const baseline = JSON.parse(
  await fs.readFile(path.join(app, 'src/recall/provenance.json'), 'utf8'),
);
const disposition = JSON.parse(
  await fs.readFile(
    path.join(app, contentEvidenceDirectory(), 'latest-source-disposition.json'),
    'utf8',
  ),
);
const rootPath = 'resources/recall/authority/root-exception-disposition.json';
const rootBytes = await fs.readFile(path.join(app, rootPath));
const sourceMap = Object.fromEntries(
  recallFacts.map((f) => [f.course + ':' + f.id, { gemIds: f.gemIds, sources: f.sources }]),
);
const counts = Object.fromEntries(
  ['alevel', 'igcse'].map((course) => [
    course,
    recallFacts.filter((f) => f.course === course).length,
  ]),
);
const emptyCoverage = Object.fromEntries(
  ['alevel', 'igcse'].map((course) => [
    course,
    recallCoverage(course)
      .filter((g) => !g.factIds.length)
      .map((g) => g.gemId),
  ]),
);
const manifest = {
  followupAuthority: disposition.followupAuthority,
  authoringAssumptions: disposition.authoringAssumptions,
  schemaVersion: 1,
  authority:
    'Current amended Recall: original approved teacher bank with explicit user-authorized 10 October 2026 amendments. Original teacher wording and historical150 definitions remain unchanged. Current amendment wording is user-authorized, not re-labelled teacher-approved.',
  regeneration:
    'node --experimental-strip-types src/recall/prepare-approved.mjs (regenerates approved facts, disposition and this manifest); alternatively node --experimental-strip-types src/recall/prepare-typed-provenance.mjs for this manifest alone.',
  legacyStarterProvenance: {
    path: 'src/recall/provenance.json',
    sha256: hash(await fs.readFile(path.join(app, 'src/recall/provenance.json'))),
    authority: baseline.authority,
  },
  counts: {
    ...counts,
    total: recallFacts.length,
    latestApprovedStructuredIGCSE: disposition.activeApproved,
    importedStructuredIGCSE: disposition.imported,
    uniqueGapAdditions: 0,
    originalNumberedIGCSE: disposition.numberedBeforeAmendments,
    generatedAdditionsHistoricalOnly: 29,
  },
  reviewedInputs: audited,
  actualAccess:
    'Exact escalated read-only shell reads succeeded; original Node EPERM preflight was superseded. Source bytes and historical review remain preserved.',
  sourceMap,
  canonicalAliases: recallFactAliases,
  currentAmendmentAuthority: disposition.amendments,
  retired: disposition.retired,
  replacements: disposition.replacements,
  newAuthorizedFacts: disposition.added,
  historicalDefinitions: {
    path: 'src/recall/historical-facts.json',
    sha256: hash(await fs.readFile(path.join(app, 'src/recall/historical-facts.json'))),
    count: 150,
    policy:
      'Original definitions and frozen marker are preserved; absent definitionId uses history, never current semantics.',
  },
  aliasPolicy:
    'External combined-ion aliases resolve to existing active numbered canonical IDs and one progress record. All29 other generated additions remain historical/source data and are absent from active recall.',
  exclusions: {
    ...disposition.exclusions,
    'igcse-recall-088': 'Rejected/retired in latest completed teacher review; excluded.',
  },
  rootErrataAuthority: {
    path: rootPath,
    sha256: hash(rootBytes),
    disposition: JSON.parse(rootBytes.toString('utf8')),
  },
  currentStarterIdsPreserved: { alevel: baseline.alevel.map((f) => f.id), igcse: baseline.igcse },
  emptyCoverage,
  boundaries:
    'Typed Recall storage and progress are separate from curriculum mastery. No Rocket runtime or progress imports. No source PDFs or images are used.',
};
await fs.writeFile(
  path.join(app, 'src/recall/typed-provenance.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  JSON.stringify({ typedProvenance: 'src/recall/typed-provenance.json', counts: manifest.counts }),
);
