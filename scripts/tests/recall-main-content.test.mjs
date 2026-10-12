import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { recallFacts, factsFor, recallFactAliases } from '../../src/recall/facts.ts';
import historical from '../../src/recall/historical-facts.json' with { type: 'json' };
import fixtures from '../../src/recall/marking-fixtures.json' with { type: 'json' };
import catalogue from '../../src/landing/catalogue-data.json' with { type: 'json' };
import {
  rawModelResponses,
  buildMarkingFixtures,
  notationEditingFixtures,
} from '../../src/recall/marking-fixtures.mjs';
import {
  validateRecallEntry,
  decodeRecallExceptionEntries,
} from '../../src/recall/compatibility.ts';
const app = new URL('../../', import.meta.url);
const hash = (b) => crypto.createHash('sha256').update(b).digest('hex');
const igcse = factsFor('igcse');
const by = (n) => igcse.find((f) => f.id === 'igcse-recall-' + n);
const fieldsFor = (f) =>
  f.fields ?? [
    {
      id: 'answer',
      answer: f.answer,
      accepted: f.accepted ?? [],
      entry: f.entry,
      matching: f.matching,
      alternative: f.alternative,
    },
  ];
test('exact121 active numbered IGCSE facts and6 byte-data unchanged A Level definitions', () => {
  assert.equal(igcse.length, 121);
  assert.equal(recallFacts.length, 127);
  assert.equal(new Set(recallFacts.map((f) => f.course + ':' + f.id)).size, 127);
  assert.deepEqual(
    factsFor('alevel'),
    historical.filter((f) => f.course === 'alevel'),
  );
  for (const n of ['025', '061', '087', '088']) assert.equal(by(n), undefined);
  for (const n of ['025a', '025b', '119', '120', '121', '122', '123', '124']) assert.ok(by(n));
  assert.ok(igcse.every((f) => /^igcse-recall-(?:\d{3}|025[ab])$/.test(f.id)));
  const retiredAdditions = historical.filter(
    (f) => f.course === 'igcse' && !/^igcse-recall-/.test(f.id),
  );
  assert.equal(retiredAdditions.length, 29);
  assert.ok(retiredAdditions.every((f) => !igcse.some((x) => x.id === f.id)));
  assert.ok(Object.values(recallFactAliases).every((id) => igcse.some((f) => f.id === id)));
});
test('valid controls, field IDs, provenance and catalogue links; no canonical duplicate per gem', () => {
  const gems = new Set(
    catalogue.igcse.groups.flatMap((g) =>
      g.topics.flatMap((t) => t[2].map((_, i) => g.key + '-' + t[0] + '-' + (i + 1))),
    ),
  );
  for (const f of igcse) {
    assert.ok(f.prompt.trim() && f.answer.trim());
    assert.ok(f.sources.length);
    assert.equal(new Set(f.gemIds).size, f.gemIds.length);
    assert.ok(
      f.gemIds.every((g) => gems.has(g)),
      f.id,
    );
    for (const source of f.sources) assert.match(source.sha256, /^[a-f0-9]{64}$/);
    const fields = fieldsFor(f);
    assert.equal(new Set(fields.map((x) => x.id)).size, fields.length);
    for (const field of fields) {
      validateRecallEntry(field.entry);
      assert.ok(field.answer.trim());
      assert.ok(Array.isArray(field.accepted));
      if (field.entry.kind === 'choice')
        assert.ok(field.entry.options.some((x) => x.label === field.answer));
      if (field.entry.kind === 'numeric') assert.equal(field.matching.kind, 'numeric');
      if (field.alternative?.kind === 'valid-alternative') assert.equal(field.entry.kind, 'text');
    }
    for (const g of f.gemIds)
      assert.equal(
        new Set(factsFor('igcse', [g]).map((x) => x.id)).size,
        factsFor('igcse', [g]).length,
      );
  }
});
test('preserved teacher inputs, historical definitions/marker and extra29 data match S0/freeze hashes', async () => {
  const baseline = JSON.parse(
    await fs.readFile(new URL('scripts/tests/fixtures/recall-main/main-source-fingerprints.json', app)),
  ).files;
  const paths = Object.keys(baseline).filter(
    (p) =>
      p.startsWith('validation/recall-formulae/s1/recall/source-audit/') ||
      [
        'src/recall/provenance.json',
        'src/activities/igcse/formulae/recall-facts.ts',
        'src/chemistry/formulae-equations/ions.ts',
        'src/landing/catalogue-data.json',
      ].includes(p),
  );
  assert.equal(paths.length, 4);
  for (const p of paths)
    assert.equal(hash(await fs.readFile(new URL(p, app))), baseline[p].sha256, p);
  const beforeManifest = JSON.parse(
    await fs.readFile(
      new URL('scripts/tests/fixtures/recall-main/typed-provenance-before.json', app),
    ),
  );
  assert.equal(Object.keys(beforeManifest.reviewedInputs).length, 6);
  const historicalAuditPrefix = 'validation/recall-formulae/s1/recall/source-audit/';
  for (const input of Object.values(beforeManifest.reviewedInputs)) {
    const preservedPath = input.path.startsWith(historicalAuditPrefix)
      ? 'resources/recall/source-audit/' + input.path.slice(historicalAuditPrefix.length)
      : input.path;
    assert.equal(hash(await fs.readFile(new URL(preservedPath, app))), input.sha256, input.path);
  }
  const capture = JSON.parse(
    await fs.readFile(new URL('scripts/tests/fixtures/recall-main/contracts-capture.json', app)),
  );
  for (const p of ['src/recall/historical-facts.json', 'src/recall/historical-marking.ts'])
    assert.equal(hash(await fs.readFile(new URL(p, app))), capture.ownedFileSha256[p], p);
});
test('all121 model fixtures use actual raw option IDs, numeric values and explicit exception JSON', () => {
  const models = fixtures.marking.filter((x) => x.category === 'model');
  assert.equal(models.length, 121);
  assert.equal(new Set(models.map((x) => x.factId)).size, 121);
  for (const f of igcse) {
    const fixture = models.find((x) => x.factId === f.id);
    assert.equal(fixture.correct, true);
    assert.deepEqual(fixture.responses, rawModelResponses(f));
    for (const field of fieldsFor(f)) {
      const response = fixture.responses[field.id];
      assert.equal(response.kind, 'text');
      assert.equal(fixture.expectedFields[field.id], true);
      if (field.entry.kind === 'choice')
        assert.ok(
          field.entry.options.some((x) => x.id === response.value && x.label === field.answer),
        );
    }
    if (f.exceptionCollection) {
      const entries = decodeRecallExceptionEntries(
        fixture.responses[f.exceptionCollection.id].value,
      );
      assert.equal(entries.length, f.exceptionCollection.groups.length);
      entries.forEach((x, i) => assert.equal(x.value, f.exceptionCollection.groups[i].answer));
    }
  }
  assert.deepEqual(fixtures.marking, buildMarkingFixtures(igcse));
  assert.deepEqual(fixtures.notationEditing, notationEditingFixtures);
});
test('chemistry patterns are full-string anchored; model/equivalent fixtures satisfy approved grammar', () => {
  const normalize = (s) =>
    s
      .normalize('NFKC')
      .replace(/[−–]/g, '-')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.;]+$/, '')
      .toLowerCase();
  for (const f of igcse)
    for (const field of fieldsFor(f)) {
      if (field.matching?.kind !== 'concepts' || !field.matching.patterns) continue;
      const patterns = field.matching.patterns.map((p) => {
        assert.ok(p.startsWith('^') && p.endsWith('$'), f.id);
        return new RegExp(p, 'u');
      });
      for (const fixture of fixtures.marking.filter((x) => x.factId === f.id && x.correct)) {
        const response = normalize(fixture.responses[field.id].value);
        const exact = [field.answer, ...field.accepted].some((a) => normalize(a) === response);
        assert.ok(exact || patterns.some((p) => p.test(response)), fixture.id + ':' + field.id);
      }
    }
});
test('amended shapes retain inline gaps, ascending lists, hidden zero-to-many exceptions and coherent pairs', () => {
  assert.deepEqual(
    by('016')
      .sentenceTokens.filter((x) => typeof x !== 'string')
      .map((x) => x.fieldId),
    ['amount', 'temperature'],
  );
  assert.equal(by('004').entry.requireSign, true);
  assert.equal(by('026').entry.notation, 'molecular');
  for (const [n, count] of [
    ['027', 1],
    ['028', 1],
    ['029', 1],
    ['030', 0],
    ['031', 0],
    ['032', 0],
    ['033', 1],
  ])
    assert.equal(by(n).entry.atomCountDigits, count);
  for (const n of ['091', '100']) {
    assert.equal(by(n).fields.length, 6);
    assert.equal(by(n).fieldOrder, 'labelled');
  }
  assert.deepEqual(
    by('091').fields.map((f) => f.answer),
    ['Refinery gases', 'Gasoline', 'Kerosene', 'Diesel', 'Fuel oil', 'Bitumen'],
  );
  assert.deepEqual(
    by('100').fields.map((f) => f.answer),
    ['Methane', 'Ethane', 'Propane', 'Butane', 'Pentane', 'Hexane'],
  );
  for (const [n, count] of [
    ['082', 0],
    ['083', 0],
    ['084', 2],
    ['085', 3],
    ['086', 2],
  ]) {
    const f = by(n);
    assert.equal(f.fields.length, 1);
    assert.equal(f.fields[0].entry.kind, 'choice');
    assert.equal(f.exceptionCollection.groups.length, count);
    assert.equal(f.exceptionCollection.entry.kind, 'text');
    assert.ok(!('initialCount' in f.exceptionCollection));
  }
  assert.equal(by('062').pairCoverage, 'all');
  assert.equal(by('062').responsePairs.length, 2);
  assert.equal(by('046').pairCoverage, 'one');
  assert.equal(by('046').responsePairs.length, 1);
  assert.deepEqual(
    by('046').answerPairs.map((x) => x.id),
    ['boiling', 'melting-freezing'],
  );
});
test('six authorized acid facts have deliberate prerequisite links and aqueous HCl qualification', () => {
  for (const n of ['119', '120', '121', '122', '123', '124']) {
    for (const gem of ['lower-8-1', 'lower-8-3', 'lower-8-5'])
      assert.ok(by(n).gemIds.includes(gem));
    for (const gem of ['fourth-16-1', 'fourth-16-2'])
      assert.ok(!by(n).gemIds.includes(gem), `${n} must not appear in ${gem}`);
  }
  for (const n of ['119', '120'])
    for (const gem of ['upper-14-1', 'upper-14-2', 'upper-14-3'])
      assert.ok(by(n).gemIds.includes(gem));
  for (const n of ['121', '122', '123', '124']) assert.ok(by(n).gemIds.includes('fourth-4-3'));
  assert.match(by('124').prompt, /HCl\(aq\)/);
  assert.ok(!by('124').accepted.includes('Hydrogen chloride gas'));
  assert.ok(by('120').accepted.includes('Sulfuric acid'));
  assert.equal(by('114').fields[0].entry.notation, 'molecular');
  assert.equal(by('117').fields[0].entry.notation, 'molecular');
});
test('retained fixtures cover every model, aliases, contradictions, duplicates, pairing, order, numeric and edit boundaries', () => {
  assert.equal(new Set(fixtures.marking.map((x) => x.id)).size, fixtures.marking.length);
  assert.ok(fixtures.marking.length > 650);
  assert.equal(fixtures.notationEditing.length, 13);
  for (const f of fixtures.marking) {
    assert.equal(typeof f.correct, 'boolean');
    assert.ok(f.rationale);
    assert.ok(igcse.some((x) => x.id === f.factId));
  }
  for (const suffix of [
    '004:bare-number',
    '017:bond-contradiction-0',
    '021:bond-equivalent-3',
    '064:duplicate-fizzing',
    '084:duplicate-ion-compound',
    '062:crossed-results',
    '046:freezing-hundred',
    '091:reverse-order',
    '112:numeric-negative-1',
    '124:wrong-acid-or-state',
  ])
    assert.ok(fixtures.marking.some((f) => f.id === 'igcse-recall-' + suffix));
});
test('precheck context reveals scope only; checked models retain purity, solubility and unsaturation qualifications', () => {
  assert.deepEqual(
    igcse
      .filter((f) => f.context?.length)
      .map((f) => f.id)
      .sort(),
    ['085', '105', '109', '123', '124'].map((n) => 'igcse-recall-' + n),
  );
  const context = (n) => (by(n).context ?? []).join(' ');
  assert.equal(context('046'), '');
  assert.doesNotMatch(context('046'), /100|\b0\b|boil|melt|freez/i);
  assert.doesNotMatch(context('085'), /calcium|barium|lead|sparingly|insoluble|three|\b3\b/i);
  assert.equal(context('107'), '');
  for (const n of ['123', '124']) {
    assert.match(context(n), /aqueous/);
    assert.doesNotMatch(context(n), /HCl|hydrochloric|hydrogen chloride/i);
  }
  assert.equal(by('046').answer, 'Test: Heat it until boiling\nResult: Boils at exactly 100°C');
  assert.equal(by('046').answerPairs[1].fields[1].answer, 'Melts or freezes sharply at 0 °C');
  assert.match(
    by('085').answer,
    /Calcium sulphate is sparingly soluble; barium and lead sulphates are insoluble/,
  );
  assert.match(
    by('107').answer,
    /^Contains one or more C=C double bonds.*triple bonds also give unsaturation/s,
  );
  assert.equal(rawModelResponses(by('107')).answer.value, 'Contains one or more C=C double bonds');
  assert.equal(by('123').answer, 'HCl');
  assert.equal(by('124').answer, 'Hydrochloric acid');
  assert.equal(fixtures.marking.length, 707);
});
